type WorkflowItemProps = {
    imgURL: string;
    text: string;
    url?: string;
};

type WorkflowProps = {
    headerText: string;
    titleText: string;
    pageURL: string;
    items: WorkflowItemProps[];
};

function WorkflowItem(props: WorkflowItemProps) {
    console.log("ITEM", props);
    let content = (
        <img
            style={{ maxWidth: "80px", width: "auto", height: "auto" }}
            src={"/img/" + props.imgURL}
        />
    );
    if (props.url) {
        content = <a href={props.url}>{content}</a>;
    }
    return (
        <div
            className="vertical middle-align center-align"
            style={{ maxWidth: "150px" }}
        >
            {content}
            <p style={{ fontSize: "14px" }}>{props.text}</p>
        </div>
    );
}

export default function WorkflowWelcome(props: WorkflowProps) {
    return (
        <div className="middle-align center-align vertical">
            <h4 className="text-primary">{props.titleText}</h4>
            <div class="middle-align row wrap">
                {props.items.map((item, index) => (
                    <WorkflowItem
                        key={index}
                        {...item}
                    />
                ))}
            </div>
            <a href={props.pageURL}>
                <button class="button small-round upper elevate bg-trusteeBtn">
                    Start Here
                </button>
            </a>
        </div>
    );
}

/*

    <div className="v-container v-locale--is-ltr fill-height text-center">
      <div className="v-row align-center d-flex flex-column">
        <div className="v-col v-col-12 mb-6">
          <h1 className="text-primary">{props.headerText}</h1>
        </div>
        <div className="v-col v-col-12 mb-15">
          <h3>
            TRUSTEE uses state-of-the-art solutions and Homomorphic Encryption
            to securely provide to its users the opportunity to use ai-models
            from federated sources
          </h3>
        </div>
        <div className="v-col v-col-12 mb-6">
          <h2 className="text-primary">{props.titleText}</h2>
        </div>
        <div className="v-col v-col-12 d-flex mb-6">
          <div className="v-row justify-center">
            {props.items.map((item, index) => (
              <WorkflowItem key={index} {...item} />
            ))}
          </div>
        </div>
        <a href={props.pageURL}>
          <div className="v-col v-col-12">
            <button
              type="button"
              hx-get="/ml_prosumer/search"
              hx-target="#main"
              className="v-btn v-btn--elevated v-theme--trusteeLight bg-trusteeBtn v-btn--density-default v-btn--size-default v-btn--variant-elevated"
            >
              <span className="v-btn__overlay"></span>
              <span className="v-btn__underlay"></span>
              <span className="v-btn__content" data-no-activator="">
                Start Here
              </span>
            </button>
          </div>
        </a>
      </div>
    </div>
    */
