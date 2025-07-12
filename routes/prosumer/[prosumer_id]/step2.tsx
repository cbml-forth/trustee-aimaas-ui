import { Handlers, PageProps } from "$fresh/server.ts";
import { Domain, ProsumerWorkflowData, ProsumerWorkflowFLData, SSISearchCriterion, User } from "@/utils/types.ts";
import { dl_domains, do_fl_submit, do_ssi_poll } from "@/utils/backend.ts";
import { get_user, redirect_to_login, SessionState } from "@/utils/http.ts";
import { db_get, db_store, set_user_session_data, user_session_data } from "@/utils/db.ts";

import { redirect } from "@/utils/http.ts";
import { prosumer_key } from "@/utils/misc.ts";
import ProsumerStep2 from "@/islands/prosumer/ProsumerStep2.tsx";

interface Data {
    domains: Domain[];
    user: User;
    criteria: SSISearchCriterion[];
    process_name: string;
    ssi_finished: boolean;
    ssi_status: string;
    ssi_failed: boolean;
    ssi_results: string[];
    disabled: boolean;
    fl_process?: ProsumerWorkflowFLData;
}

async function user_profile(sessionId: string): Promise<User> {
    const { value } = await user_session_data(sessionId, "user");
    const user: User = value as User;
    return user;
}

async function get_domains(sessionId: string): Promise<Map<string, Domain>> {
    const user: User = await user_profile(sessionId);
    const data = await user_session_data(sessionId, "domains");
    let domains = data.value as Domain[] | null;

    if (!domains) {
        domains = await dl_domains(user.tokens.id_token);
        await set_user_session_data(sessionId, "domains", domains);
    }
    domains = domains.filter((d) => d.attributes);
    // return domains;
    return new Map(domains?.map((d) => [d.name, d]));
}

// STEP2: We show the results of the SSI and allow the user to select the models to be used for the FL.

export const handler: Handlers<unknown, SessionState> = {
    async POST(req, ctx) {
        const user = await get_user(req, ctx.state.session);
        if (!user) {
            return redirect_to_login(req);
        }

        const prosumer_id = ctx.params["prosumer_id"];

        const data: FormData = await req.formData();
        // Example FormData:
        // {
        //   "fl_model:194": "on",
        //   "fl_model:199": "on",
        //   "fl_model:204": "on",
        //   "fl_model:209": "on",
        //   "number-of-rounds": "1",
        //   computation: "Extended Averaging",
        //   "num-of-iterations": "5",
        //   solver: "ADMM",
        //   denoiser: "Transformer",
        //   action: "do_fl"
        // }

        const sep = ":";
        const models = Array.from(
            data.keys().filter((v) => v.startsWith("fl_model")).map((s) => s.split(sep)[1]),
        );
        // console.log("MODELS", models);

        const process_name = `AIMaaS-FL-${prosumer_id}`;
        const aggregationRule = data.get("computation")?.toString() || "Simple Averaging";
        const fl_request = {
            dataProviderIDs: ["8", "9"], //models,
            modelConsumerEndpoint: "https://trustee-test-hedf-mc.cybersec.digital.tecnalia.dev",
            computation: aggregationRule,
            processID: process_name,
            numberOfRounds: parseInt(data.get("number-of-rounds")?.toString() || "1"),
            "num-of-iterations": parseInt(data.get("num-of-iterations")?.toString() || "1"),
            solver: data.get("solver")?.toString() || "ADMM",
            denoiser: data.get("denoiser")?.toString() || "Transformer",
        };

        console.log("FL REQUEST", fl_request);
        const fl_started = await do_fl_submit(user, fl_request);
        console.log("FL", process_name, fl_started ? "STARTED" : "NOT STARTED");

        const fl_data: ProsumerWorkflowFLData = {
            status: fl_started ? "STARTED" : "NOT STARTED",
            process_id: process_name,
            models: models,
            computation: aggregationRule,
            solver: fl_request.solver,
            denoiser: fl_request.denoiser,
            num_of_iterations: fl_request["num-of-iterations"],
            current_round: 0,
            number_of_rounds: fl_request.numberOfRounds,
        };
        const w: ProsumerWorkflowData = await db_get(prosumer_key(user, prosumer_id)) as ProsumerWorkflowData;
        w.fl_process = fl_data;
        await db_store(prosumer_key(user, prosumer_id), w);

        return redirect("step2");
    },
    async GET(req, ctx) {
        const user = await get_user(req, ctx.state.session);
        if (!user) {
            return redirect_to_login(req);
        }

        const sessionId = user.session_id;
        const domains = await get_domains(sessionId);

        const prosumer_id = ctx.params["prosumer_id"];
        let prosumer_data = await db_get<ProsumerWorkflowData>(prosumer_key(user, prosumer_id));
        if (!prosumer_data) {
            return redirect("step1");
        }

        let ssi_search_status = prosumer_data.ssi?.status;
        const do_polling = ssi_search_status !== "FINISHED" && ssi_search_status !== "ERROR";
        if (do_polling) {
            ssi_search_status = await do_ssi_poll(user, prosumer_id, prosumer_data.ssi?.process_id || "");
            if (ssi_search_status === "FINISHED") {
                prosumer_data = await db_get(prosumer_key(user, prosumer_id)) as ProsumerWorkflowData;
            }
        }

        const fl_process_data = prosumer_data.fl_process;
        // console.log("Prosumer data", prosumer_data);

        let disabled = true;
        if (!fl_process_data) {
            disabled = false;
        }
        console.log("disabled - 1", disabled);
        return ctx.render({
            domains: [...domains.values()],
            user,
            criteria: prosumer_data?.ssi?.criteria,
            ssi_finished: ssi_search_status === "FINISHED",
            ssi_failed: ssi_search_status === "ERROR",
            ssi_results: prosumer_data?.ssi?.results || [],
            ssi_status: prosumer_data?.ssi?.status,
            process_name: prosumer_data?.name || "",
            fl_process: fl_process_data,
            disabled: disabled,
        });
    },
};

export default function Step2Page(props: PageProps<Data>) {
    console.log("disabled", props.data.disabled);
    return (
        <ProsumerStep2
            ssi_status={props.data.ssi_status}
            ssi_results={props.data.ssi_results}
            process_name={props.data.process_name}
            disabled={props.data.disabled}
            fl_process={props.data.fl_process}
        />
    );
}
