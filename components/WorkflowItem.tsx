type WorkflowItemProps = {
  imgURL: string;
  text: string;
};

export default function WorkflowItem(props: WorkflowItemProps) {
  return (
    <div className="v-col" style={{ maxWidth: "150px" }}>
      <img
        style={{ maxWidth: "80px", width: "auto", height: "auto" }}
        src={"/img/" + props.imgURL}
      />
      <p style={{ fontSize: "14px" }}>{props.text}</p>
    </div>
  );
}
