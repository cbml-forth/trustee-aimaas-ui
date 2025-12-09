import { Handlers, PageProps } from "$fresh/server.ts";
import {
    FLStartAggregationRequest,
    ModelSearchResponseItem,
    ProsumerWorkflowData,
    ProsumerWorkflowFLData,
    User,
} from "@/utils/types.ts";
import { do_fl_poll, do_fl_submit, do_ssi_poll } from "@/utils/backend.ts";
import { get_user, redirect_to_login, SessionState } from "@/utils/http.ts";
import { db_get, db_store, user_session_data } from "@/utils/db.ts";

import { redirect } from "@/utils/http.ts";
import { prosumer_key } from "@/utils/misc.ts";
import ProsumerStep3 from "@/islands/prosumer/ProsumerStep3.tsx";

interface Data {
    process_name: string;
    disabled: boolean;
    fl_process?: ProsumerWorkflowFLData;
    global_models: ModelSearchResponseItem[];
}

// STEP3: allow the user to select the FL parameters and start the FL process

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

        const w: ProsumerWorkflowData = await db_get(prosumer_key(user, prosumer_id)) as ProsumerWorkflowData;
        // console.log("MODELS", w.models_selected);

        const process_name = `AIMaaS-FL-${prosumer_id}`;
        const aggregationRule = data.get("computation")?.toString() || "Simple Averaging";
        const solver = data.get("solver")?.toString() || "ADMM";
        const denoiser = data.get("denoiser")?.toString() || "Transformer";
        const numIterations = parseInt(data.get("num-of-iterations")?.toString() || "1");
        const fl_initialization_model = parseInt(data.get("fl_initialization_model")?.toString() || "0");
        const fl_request: FLStartAggregationRequest = {
            dataProviderIDs: w.models_selected,
            modelConsumerEndpoint: "https://trustee-test-hedf-mc.cybersec.digital.tecnalia.dev",
            computation: aggregationRule,
            processID: process_name,
            numberOfRounds: parseInt(data.get("number-of-rounds")?.toString() || "1"),
            fl_initialization_model: fl_initialization_model,
        } as FLStartAggregationRequest;
        if (aggregationRule == "Extended Averaging") {
            fl_request.extendedAggregationParameters = {
                iterations: numIterations,
                denoiser: denoiser,
                solver: solver,
            };
        }

        console.log("FL REQUEST", fl_request);
        const fl_started = await do_fl_submit(user, fl_request);
        console.log("FL", process_name, fl_started ? "STARTED" : "NOT STARTED");
        const flprocessstatus = await do_fl_poll(user, process_name);
        const fl_data: ProsumerWorkflowFLData = {
            status: flprocessstatus,
            process_id: process_name,
            models: w.models_selected,
            computation: aggregationRule,
            solver: solver,
            denoiser: denoiser,
            num_of_iterations: numIterations,
            number_of_rounds: fl_request.numberOfRounds,
            fl_initialization_model: fl_request.fl_initialization_model,
        };

        w.fl_process = fl_data;
        await db_store(prosumer_key(user, prosumer_id), w);

        return redirect("step4");
    },
    async GET(req, ctx) {
        const user = await get_user(req, ctx.state.session);
        if (!user) {
            return redirect_to_login(req);
        }

        const prosumer_id = ctx.params["prosumer_id"];
        let prosumer_data = await db_get<ProsumerWorkflowData>(prosumer_key(user, prosumer_id));
        if (!prosumer_data) {
            return redirect("step1");
        }
        if (prosumer_data.models_selected.length === 0) {
            return redirect("step2");
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
            process_name: prosumer_data?.name || "",
            fl_process: fl_process_data,
            disabled: disabled,
            global_models: prosumer_data.ssi.global_models,
        });
    },
};

export default function Step3Page(props: PageProps<Data>) {
    console.log("disabled-3", props.data.disabled);
    return (
        <ProsumerStep3
            process_name={props.data.process_name}
            disabled={props.data.disabled}
            fl_process={props.data.fl_process}
            global_models={props.data.global_models}
        />
    );
}
