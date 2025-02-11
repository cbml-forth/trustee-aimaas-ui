import classNames from "@/utils/classnames.js";
export default function SidebarItem(
  props: {
    id: number;
    isSelected: boolean;
    redirectTo: string;
    title: string;
    imgURL: string;
    identation: boolean;
  },
) {
  const isExternal = props.redirectTo.startsWith("http");

  return (
    <a
      class={classNames(
        {
          "external-link": isExternal,
          "aimaas": props.identation,
        },
      )}
      href={props.redirectTo}
    >
      <i class="large">
        <img
          src={props.imgURL + "_blue.svg"}
          alt={props.title}
        />
      </i>
      <div>{props.title}</div>
    </a>
  );
}

/*


  const item = (
    <div
      id={"sidebar-item-" + props.id}
      className={"v-list-item v-list-item--link v-theme--trusteeLight v-list-item--density-default v-list-item--one-line v-list-item--variant-text border-bottom-1-grey " +
        (props.isSelected ? "selected-list-item" : "unselected-list-item")}
    >
      <span className="v-list-item__overlay"></span>
      <span className="v-list-item__underlay"></span>
      <div className="v-list-item__content" data-no-activator="">
        <div className="d-flex">
          <div
            className="v-avatar v-theme--trusteeLight v-avatar--density-default v-avatar--variant-flat"
            style={{
              width: "35px",
              height: "35px",
              marginLeft: props.identation,
            }}
          >
            <div
              className="v-responsive v-img"
              style={{ maxHeight: "25px", maxWidth: "25px" }}
            >
              <div
                className="v-responsive__sizer"
                style={{ paddingBottom: "100%" }}
              >
              </div>
              <img
                className="v-img__img v-img__img--contain"
                src={props.imgURL +
                  (props.isSelected ? "_selected.svg" : "_blue.svg")}
                alt={props.title}
              />
            </div>
            <span className="v-avatar__underlay"></span>
          </div>
          <div className="v-list-item-title">{props.title}</div>
        </div>
      </div>
    </div>
  );

  return (
    <a
      class={isExternal ? "external-link" : ""}
      href={props.redirectTo}
    >
      {item}
    </a>
  );
}
*/
