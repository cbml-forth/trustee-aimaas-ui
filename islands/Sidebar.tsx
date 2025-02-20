import { useSignal, useSignalEffect } from "@preact/signals";
import classNames from "@/utils/classnames.js";
import { IS_BROWSER } from "$fresh/runtime.ts";

const dashboard = "https://dashboard.trustee-1.ics.forth.gr";

const sidebarItems = [
    {
        id: 1,
        title: "Home",
        imgURL: "/img/home",
        identation: false,
        redirectTo: dashboard + "/home",
        isSelected: false,
    },
    {
        id: 2,
        title: "Use Data",
        imgURL: "/img/use_data",
        identation: false,
        redirectTo: dashboard + "/use-data",
        isSelected: false,
    },
    {
        id: 3,
        title: "Provide Data",
        imgURL: "/img/provide_data",
        identation: false,
        redirectTo: dashboard + "/provide-data",
        isSelected: false,
    },
    {
        id: 4,
        title: "AIaaS",
        imgURL: "/img/artificial_intelligence",
        identation: false,
        redirectTo: "/",
        isSelected: true,
        nested: [
            {
                id: 4.1,
                title: "ML Prosumer",
                imgURL: "/img/artificial_intelligence",
                identation: true,
                redirectTo: "/prosumer",
                isSelected: false,
            },
            {
                id: 4.2,
                title: "ML Provider",
                imgURL: "/img/artificial_intelligence",
                identation: true,
                redirectTo: "/provider",
                isSelected: false,
            },
            {
                id: 4.3,
                title: "ML Consumer",
                imgURL: "/img/artificial_intelligence",
                identation: true,
                redirectTo: "/consumer",
                isSelected: false,
            },
        ],
    },
    {
        id: 5,
        title: "Knowledge Repository",
        imgURL: "/img/kr",
        identation: false,
        redirectTo: dashboard + "/knowledge-repository",
        isSelected: false,
    },
    {
        id: 6,
        title: "Privacy Impact Assessment",
        imgURL: "/img/pia",
        identation: false,
        redirectTo: dashboard + "/privacy-impact-assessment",
        isSelected: false,
    },
    {
        id: 7,
        title: "My Agreements",
        imgURL: "/img/my_agreements",
        identation: false,
        redirectTo: dashboard + "/my-agreements",
        isSelected: false,
    },
    {
        id: 8,
        title: "My Results",
        imgURL: "/img/my_results",
        identation: false,
        redirectTo: dashboard + "/my-results",
        isSelected: false,
    },
    {
        id: 9,
        title: "My Datasets",
        imgURL: "/img/my_datasets",
        identation: false,
        redirectTo: dashboard + "/my-datasets",
        isSelected: false,
    },
    {
        id: 10,
        title: "Monitor Tool",
        imgURL: "/img/ATR",
        identation: false,
        redirectTo: dashboard + "/monitor-tool",
        isSelected: false,
    },
    {
        id: 11,
        title: "TRUSTEE Guide",
        imgURL: "/img/trustee_guide",
        identation: false,
        redirectTo: dashboard + "/trustee-guide",
        isSelected: false,
    },
];

function SidebarItem(
    props: {
        id: number;
        isSelected: boolean;
        redirectTo: string;
        title: string;
        imgURL: string;
        identation: boolean;
        isClosed: boolean;
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
            <i class={props.isClosed ? "small" : "large"}>
                <img
                    src={props.imgURL + "_blue.svg"}
                    alt={props.title}
                />
            </i>
            <div>{props.title}</div>
        </a>
    );
}

export default function Sidebar() {
    const isClosed = useSignal(
        IS_BROWSER && localStorage.getItem("menu") ? localStorage.getItem("menu") == "closed" : false,
    );
    const toggleOpenClose = () => {
        isClosed.value = !isClosed.value;
    };

    useSignalEffect(() => {
        console.log(`Menu is closed: ${isClosed.value}`);
        if (IS_BROWSER) {
            localStorage.setItem("menu", isClosed.value ? "closed" : "open");
        }
    });

    const sidebarObjects = sidebarItems.map((x, index) => {
        const elem = (
            <SidebarItem
                key={index}
                isClosed={isClosed.value}
                {...x}
            />
        );
        let nestedElems;
        if (x.nested) {
            nestedElems = x.nested.map((n, nestedIndex) => {
                return (
                    <SidebarItem
                        key={`${index}-${nestedIndex}`}
                        isClosed={isClosed.value}
                        id={n.id}
                        title={n.title}
                        imgURL={n.imgURL}
                        identation={n.identation}
                        redirectTo={n.redirectTo}
                        isSelected={n.isSelected}
                        // toggleSelection={toggleSelection}
                    />
                );
            });
        }

        return (
            <>
                {(!isClosed.value || !x.nested) && elem}
                {nestedElems}
            </>
        );
    });
    return (
        <nav id="sidebar" class={isClosed.value ? "left scroll closed" : "left scroll  drawer"}>
            <button
                class="circle transparent"
                style={isClosed.value ? {} : { "align-self": "flex-end" }}
                onClick={toggleOpenClose}
            >
                <i>{isClosed.value ? "menu" : "close"}</i>
            </button>
            {sidebarObjects}
        </nav>
    );
    /*
  if (isClosed.value) {
    return (
      <button
        type="button"
        className="v-btn v-theme--trusteeLight v-btn--density-default v-btn--size-default v-btn--variant-text pl-0 pr-0"
        style={{ minWidth: "41px", maxHeight: "41px" }}
        onClick={toggleOpenClose}
      >
        <span className="v-btn__overlay"></span>
        <span className="v-btn__underlay"></span>
        <span className="v-btn__content" data-no-activator="">
          <img
            className="ma-1"
            style={{ width: "20px" }}
            src={asset(isClosed ? "/img/menu_blue.svg" : "/img/close_blue.svg")}
            alt={isClosed ? "Open" : "Close"}
          />
        </span>
      </button>
    );
  }

  return (
    <div id="sidebar">
      <div className="v-container v-locale--is-ltr pa-0 ma-0 fill-height">
        <div
          className="border-right-2-grey"
          style={{ width: "20rem", height: "100%" }}
        >
          <div
            className="v-list v-theme--trusteeLight v-list--density-default v-list--one-line pa-0"
            role="listbox"
          >
            <div className="v-list-item v-theme--trusteeLight v-list-item--density-default v-list-item--one-line v-list-item--variant-text pr-1 pl-1 border-bottom-1-grey">
              <span className="v-list-item__underlay"></span>
              <div className="v-list-item__content" data-no-activator="">
                <div className="v-row justify-end ma-0 pa-0">
                  <button
                    type="button"
                    className="v-btn v-theme--trusteeLight v-btn--density-default v-btn--size-default v-btn--variant-text pl-0 pr-0"
                    style={{ minWidth: "41px", maxHeight: "41px" }}
                    onClick={toggleOpenClose}
                  >
                    <span className="v-btn__overlay"></span>
                    <span className="v-btn__underlay"></span>
                    <span className="v-btn__content" data-no-activator="">
                      <img
                        className="ma-1"
                        style={{ width: "20px" }}
                        src={asset(
                          isClosed
                            ? "/img/menu_blue.svg"
                            : "/img/close_blue.svg",
                        )}
                        alt={isClosed ? "Open" : "Close"}
                      />
                    </span>
                  </button>
                </div>
              </div>
            </div>
            {sidebarObjects}
          </div>
        </div>
      </div>
    </div>
  );
  */
}
