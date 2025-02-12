import WorkflowWelcome from "@/components/WorkflowWelcome.tsx";
import { defineRoute } from "$fresh/server.ts";
import { sessionIdOrSignin } from "@/utils/http.ts";
import { list_all, user_profile } from "@/utils/db.ts";
import { prosumer_key } from "@/utils/misc.ts";
import { ProsumerWorkflowData, User } from "@/utils/types.ts";
import { ulid } from "jsr:@std/ulid";

export default defineRoute(async (req, ctx) => {
    const res = await sessionIdOrSignin(req, ctx);
    if (res instanceof Response) {
        return res;
    }
    const session_id = res as string;
    const user: User = await user_profile(session_id);
    const list = await list_all<ProsumerWorkflowData>(prosumer_key(user));

    console.log("PROSUMERS", list);
    const prosumer_id: string = ulid();
    const props = {
        headerText: "Use AI models provided to TRUSTEE, fuse them, and extract results from computations",
        titleText: "TRUSTEE Model Prosumer Workflow",
        pageURL: `/prosumer/${prosumer_id}/step1`,
        items: [
            {
                imgURL: "select_filters_workflow.svg",
                text: "Select search filters to find the most suitable among existing AI models",
            },
            {
                imgURL: "select_datasets_workflow.svg",
                text: "View a list of coresponding AI models that match your search criteria",
            },
            {
                imgURL: "fusion_workflow.svg",
                text: "Select from the AI model list the one to be used",
            },
            {
                imgURL: "select_datasets_workflow.svg",
                text: "View a list of the computations that can be applied to the selected models",
            },
            {
                imgURL: "select_computation_workflow.svg",
                text: "Select the computation to be performed on the selected models",
            },
            {
                imgURL: "safedoc_workflow.svg",
                text: "Perform a Privacy Impact Assessment",
            },
            {
                imgURL: "gdpr_workflow.svg",
                text: "Perform a GDPR compliance check",
            },
            {
                imgURL: "contract_workflow.svg",
                text: "Sign the necessary agreements",
            },
            {
                imgURL: "results_workflow.svg",
                text: "View Computation Results",
            },
        ],
    };

    return (
        <div class="vertical">
            <WorkflowWelcome {...props}></WorkflowWelcome>
            <div class="padding align-left">
                <h5 class="align-left">Or check the status of previous flows:</h5>
                <article>
                    {list.map((w, index) => {
                        return (
                            <>
                                {index > 0 && <hr />}
                                <a class="row large-padding surface-container" href={"/prosumer/" + w.id + "/step1"}>
                                    <i>home</i>
                                    <div class="max">
                                        <h6 class="small">{w.name || w.id}</h6>
                                        <div></div>
                                    </div>
                                    <label>+15 min</label>
                                </a>
                            </>
                        );
                    })}
                </article>
            </div>
        </div>
    );
});
