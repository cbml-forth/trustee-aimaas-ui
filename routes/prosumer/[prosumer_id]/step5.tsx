import { Handlers, PageProps } from "$fresh/server.ts";
import { ProsumerWorkflowData, ProsumerWorkflowFLData, User } from "@/utils/types.ts";
import { do_fl_poll } from "@/utils/backend.ts";
import { get_user, redirect_to_login, SessionState } from "@/utils/http.ts";
import { db_get, db_store, set_user_session_data, user_session_data } from "@/utils/db.ts";

import { redirect } from "@/utils/http.ts";
import { prosumer_key } from "@/utils/misc.ts";

interface Data {
    process_name: string;
    fl_process: ProsumerWorkflowFLData;
    download_link: string;
}

async function user_profile(sessionId: string): Promise<User> {
    const { value } = await user_session_data(sessionId, "user");
    const user: User = value as User;
    return user;
}

// STEP3: allow the user to select the FL parameters and start the FL process

export const handler: Handlers<unknown, SessionState> = {
    async POST(req, ctx) {
        // const user = await get_user(req, ctx.state.session);
        // if (!user) {
        //     return redirect_to_login(req);
        // }

        // const prosumer_id = ctx.params["prosumer_id"];

        // const data: FormData = await req.formData();
        // // Example FormData:
        // // {
        // //   "fl_model:194": "on",
        // //   "fl_model:199": "on",
        // //   "fl_model:204": "on",
        // //   "fl_model:209": "on",
        // //   "number-of-rounds": "1",
        // //   computation: "Extended Averaging",
        // //   "num-of-iterations": "5",
        // //   solver: "ADMM",
        // //   denoiser: "Transformer",
        // //   action: "do_fl"
        // // }

        // const w: ProsumerWorkflowData = await db_get(prosumer_key(user, prosumer_id)) as ProsumerWorkflowData;
        // // console.log("MODELS", w.models_selected);

        // const process_name = `AIMaaS-FL-${prosumer_id}`;
        // const aggregationRule = data.get("computation")?.toString() || "Simple Averaging";
        // const fl_request = {
        //     dataProviderIDs: w.models_selected,
        //     modelConsumerEndpoint: "https://trustee-test-hedf-mc.cybersec.digital.tecnalia.dev",
        //     computation: aggregationRule,
        //     processID: process_name,
        //     numberOfRounds: parseInt(data.get("number-of-rounds")?.toString() || "1"),
        //     "num-of-iterations": parseInt(data.get("num-of-iterations")?.toString() || "1"),
        //     solver: data.get("solver")?.toString() || "ADMM",
        //     denoiser: data.get("denoiser")?.toString() || "Transformer",
        // };

        // console.log("FL REQUEST", fl_request);
        // const fl_started = await do_fl_submit(user, fl_request);
        // console.log("FL", process_name, fl_started ? "STARTED" : "NOT STARTED");

        // const fl_data: ProsumerWorkflowFLData = {
        //     status: fl_started ? "STARTED" : "NOT STARTED",
        //     process_id: process_name,
        //     models: w.models_selected,
        //     computation: aggregationRule,
        //     solver: fl_request.solver,
        //     denoiser: fl_request.denoiser,
        //     num_of_iterations: fl_request["num-of-iterations"],
        //     current_round: 0,
        //     number_of_rounds: fl_request.numberOfRounds,
        // };
        // w.fl_process = fl_data;
        // await db_store(prosumer_key(user, prosumer_id), w);

        return redirect("step4");
    },
    async GET(req, ctx) {
        const user = await get_user(req, ctx.state.session);
        if (!user) {
            return redirect_to_login(req);
        }

        const prosumer_id = ctx.params["prosumer_id"];
        const prosumer_data = await db_get<ProsumerWorkflowData>(prosumer_key(user, prosumer_id));
        if (!prosumer_data) {
            return redirect("step1");
        }
        console.log("step4", prosumer_data);
        if (prosumer_data.models_selected.length === 0) {
            return redirect("step2");
        }
        if (!prosumer_data.fl_process) {
            return redirect("step3");
        }
        if (prosumer_data.fl_process.status !== "COMPLETED") {
            return redirect("step4");
        }

        const download_link =
            `http://trustee-1.ics.forth.gr:3800/hedf/ProcessResult?process_id=${prosumer_data.fl_process.process_id}&hedfprocess_round=1`;
        return ctx.render({
            process_name: prosumer_data?.name || "",
            fl_process: prosumer_data.fl_process,
            download_link: download_link,
        });
    },
};

export default function Step5Page(props: PageProps<Data>) {
    return (
        <>
            <h5>FL process finished</h5>
            <div class="large-padding">
                <a href={props.data.download_link}>
                    <button class="round">
                        Download model
                    </button>
                </a>
            </div>
        </>
    );
}
