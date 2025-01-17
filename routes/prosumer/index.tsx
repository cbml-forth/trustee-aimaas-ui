import WorkflowWelcome from "../../components/WorkflowWelcome.tsx";

export default function Prosumer() {
  const props = {
    headerText:
      "Use AI models provided to TRUSTEE, fuse them, and extract results from computations",
    titleText: "TRUSTEE Model Prosumer Workflow",
    pageURL: "/prosumer",
    items: [
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
        imgURL: "select_datasets_workflow.svg",
        text:
          "View a list of the computations that can be applied to the selected models",
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

  return <WorkflowWelcome {...props}></WorkflowWelcome>;
}
