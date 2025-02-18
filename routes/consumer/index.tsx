import WorkflowWelcome from "@/components/WorkflowWelcome.tsx";
import { defineRoute } from "$fresh/server.ts";
import { sessionIdOrSignin } from "@/utils/http.ts";
import { ulid } from "jsr:@std/ulid";

export default defineRoute(async (req, ctx) => {
    const res = await sessionIdOrSignin(req, ctx);
    if (res instanceof Response) {
        return res;
    }

    const consumer_id: string = ulid();
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

    return <WorkflowWelcome {...props}></WorkflowWelcome>;
});
