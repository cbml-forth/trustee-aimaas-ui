import WorkflowWelcome from "@/components/WorkflowWelcome.tsx";
import { defineRoute } from "$fresh/server.ts";
import { get_user, redirect_to_login, SessionRouteContext } from "@/utils/http.ts";
import { decodeTime, ulid } from "jsr:@std/ulid";
import { list_all } from "@/utils/db.ts";
import { ConsumerWorkflowData } from "@/utils/types.ts";
import { consumer_key } from "@/utils/misc.ts";

export default defineRoute(async (req, ctx: SessionRouteContext) => {
    const user = await get_user(req, ctx.state.session);
    if (!user) {
        return redirect_to_login(req);
    }

    const consumer_id: string = ulid();
    const list = await list_all<ConsumerWorkflowData>(consumer_key(user));
    list.sort((a, b) => a.id > b.id ? -1 : 1);
    const workflowItems = [
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
        /* {
          imgURL: "results_workflow.svg",
          text: "Retrieve the requested AI model",
        }, */
        {
            imgURL: "results_workflow.svg",
            text: "Perform Explainability Functions and retrieve Model",
        },
    ];
    const props = {
        headerText: "Search for AI models provided to TRUSTEE, stemming from several past processes",
        titleText: "TRUSTEE Model Consumer Workflow",
        pageURL: `/consumer/${consumer_id}/step1`,
        items: workflowItems,
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
                                <a class="row large-padding surface-container" href={"/consumer/" + w.id + "/step1"}>
                                    <i>home</i>
                                    <div class="max">
                                        <h6 class="small">{w.id}</h6>
                                        <div>
                                            {w.selected_model_id && w.agreements_signed == false &&
                                                `Selected model: ${w.selected_model_id}. Waiting for agreements signing..`}
                                        </div>
                                    </div>
                                    <label>Created: {new Date(decodeTime(w.id)).toLocaleString()}</label>
                                </a>
                            </>
                        );
                    })}
                </article>
            </div>
        </div>
    );
});
