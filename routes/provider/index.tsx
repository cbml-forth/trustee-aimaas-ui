import WorkflowWelcome from "@/components/WorkflowWelcome.tsx";
import { defineRoute } from "$fresh/server.ts";
import { get_user, redirect_to_login, SessionRouteContext } from "@/utils/http.ts";
import { crypto } from "jsr:@std/crypto";

export default defineRoute(async (req, ctx: SessionRouteContext) => {
    console.log(ctx.state);
    const user = await get_user(req, ctx.state.session);
    if (!user) {
        return redirect_to_login(req);
    }

    const provider_id = crypto.randomUUID();
    const props = {
        headerText: "Provide self-developed pre-trained AI Models to TRUSTEE for future use and sharing",
        titleText: "TRUSTEE Model Provider Workflow",
        pageURL: `/provider/${provider_id}/step1`,
        items: [
            {
                imgURL: "exam_workflow.svg",
                text: "Provide a description of your Model",
            },
            {
                imgURL: "select_datasets_workflow.svg",
                text: "Perform a Trustworthiness Assessment on Model",
            },

            {
                imgURL: "safedoc_workflow.svg",
                text: "Receive Trustworthiness Assessment Report",
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
                imgURL: "select_computation_workflow.svg",
                text: "Provide Model to TRUSTEE along with all necessary Files",
            },
        ],
    };

    return <WorkflowWelcome {...props}></WorkflowWelcome>;
});
