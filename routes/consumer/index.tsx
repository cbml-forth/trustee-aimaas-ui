import WorkflowWelcome from "@/components/WorkflowWelcome.tsx";

export default function Consumer() {
  const workflowItems = [
    {
      imgURL: "select_filters_workflow.svg",
      text:
        "Select search filters to find the most suitable among existing AI models",
    },
    {
      imgURL: "select_datasets_workflow.svg",
      text:
        "View a list of coresponding AI models that match your search criteria",
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
    headerText:
      "Search for AI models provided to TRUSTEE, stemming from several past processes",
    titleText: "TRUSTEE Model Consumer Workflow",
    pageURL: "/consumer",
    items: workflowItems,
  };

  return <WorkflowWelcome {...props}></WorkflowWelcome>;
}
