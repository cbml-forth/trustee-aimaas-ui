import WorkflowWelcome from "@/components/WorkflowWelcome.tsx";

export default function Prosumer() {
  const props = {
    headerText:
      "Provide self-developed pre-trained AI Models to TRUSTEE for future use and sharing",
    titleText: "TRUSTEE Model Provider Workflow",
    pageURL: "/provider",
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
}
