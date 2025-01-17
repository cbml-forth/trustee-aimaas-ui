import SidebarItem from "@/components/SidebarItem.tsx";
import { useSignal, useSignalEffect } from "@preact/signals";
import { asset } from "$fresh/runtime.ts";

const dashboard = "https://dashboard.trustee-1.ics.forth.gr";

const sidebarItems = [
  {
    id: 1,
    title: "Home",
    imgURL: "/img/home",
    identation: "0px",
    redirectTo: dashboard + "/home",
    isSelected: false,
  },
  {
    id: 2,
    title: "Use Data",
    imgURL: "/img/use_data",
    identation: "0px",
    redirectTo: dashboard + "/use-data",
    isSelected: false,
  },
  {
    id: 3,
    title: "Provide Data",
    imgURL: "/img/provide_data",
    identation: "0px",
    redirectTo: dashboard + "/provide-data",
    isSelected: false,
  },
  {
    id: 4,
    title: "AIaaS",
    imgURL: "/img/artificial_intelligence",
    identation: "0px",
    redirectTo: "/",
    isSelected: true,
    nested: [
      {
        id: 4.1,
        title: "ML Prosumer",
        imgURL: "/img/artificial_intelligence",
        identation: "20px",
        redirectTo: "/prosumer",
        isSelected: false,
      },
      {
        id: 4.2,
        title: "ML Provider",
        imgURL: "/img/artificial_intelligence",
        identation: "20px",
        redirectTo: "/provider",
        isSelected: false,
      },
      {
        id: 4.3,
        title: "ML Consumer",
        imgURL: "/img/artificial_intelligence",
        identation: "20px",
        redirectTo: "/consumer",
        isSelected: false,
      },
    ],
  },
  {
    id: 5,
    title: "Knowledge Repository",
    imgURL: "/img/kr",
    identation: "0px",
    redirectTo: dashboard + "/knowledge-repository",
    isSelected: false,
  },
  {
    id: 6,
    title: "Privacy Impact Assessment",
    imgURL: "/img/pia",
    identation: "0px",
    redirectTo: dashboard + "/privacy-impact-assessment",
    isSelected: false,
  },
  {
    id: 7,
    title: "My Agreements",
    imgURL: "/img/my_agreements",
    identation: "0px",
    redirectTo: dashboard + "/my-agreements",
    isSelected: false,
  },
  {
    id: 8,
    title: "My Results",
    imgURL: "/img/my_results",
    identation: "0px",
    redirectTo: dashboard + "/my-results",
    isSelected: false,
  },
  {
    id: 9,
    title: "My Datasets",
    imgURL: "/img/my_datasets",
    identation: "0px",
    redirectTo: dashboard + "/my-datasets",
    isSelected: false,
  },
  {
    id: 10,
    title: "Monitor Tool",
    imgURL: "/img/ATR",
    identation: "0px",
    redirectTo: dashboard + "/monitor-tool",
    isSelected: false,
  },
  {
    id: 11,
    title: "TRUSTEE Guide",
    imgURL: "/img/trustee_guide",
    identation: "0px",
    redirectTo: dashboard + "/trustee-guide",
    isSelected: false,
  },
];

const sidebarObjects = sidebarItems.map((x, index) => {
  const elem = (
    <SidebarItem
      key={index}
      {
        // id={x.id}
        // title={x.title}
        // imgURL={x.imgURL}
        // identation={x.identation}
        // redirectTo={x.redirectTo}
        // isSelected={x.isSelected}
        ...x
      }
    />
  );
  let nestedElems;
  if (x.nested) {
    nestedElems = x.nested.map((n, nestedIndex) => {
      return (
        <SidebarItem
          key={`${index}-${nestedIndex}`}
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
      {elem}
      {nestedElems}
    </>
  );
});

export default function Sidebar() {
  const isClosed = useSignal(false);
  const toggleOpenClose = () => {
    isClosed.value = !isClosed.value;
  };

  useSignalEffect(() => {
    console.log(`Menu is closed: ${isClosed.value}`);
  });
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
}
