import { asset } from "$fresh/runtime.ts";

export default function Header() {
    return (
        <nav id="header" class="row ">
            <img
                style={{ "max-width": "170px" }}
                src="/img/TRUSTEE_logo_croped-9912f73b.svg"
            />
            <div class="max"></div>
            <button class="square round bg-trusteeBtn">
                <i>person</i>
            </button>
        </nav>
    );

    /*
  return (
    <nav
      data-v-8cb87d4b=""
      className="top row"
      style={{ borderBottom: "2px solid rgb(238, 238, 238)" }}
    >
      <div className="v-toolbar__content" style={{ height: "64px" }}>
        <div data-v-8cb87d4b="" className="v-row d-flex pl-5 pr-5">
          <div
            data-v-8cb87d4b=""
            className="v-col v-col-2 d-flex justify-left align-center"
          >
            <div
              data-v-8cb87d4b=""
              className="v-responsive v-img"
              style={{ maxWidth: "170px" }}
            >
              <div
                className="v-responsive__sizer"
                style={{ paddingBottom: "22.4971%" }}
              >
              </div>
              <img
                className="v-img__img v-img__img--contain"
                src={asset("/img/TRUSTEE-logo.svg")}
                alt="Logo"
              />
            </div>
          </div>
          <div
            data-v-8cb87d4b=""
            className="v-col v-col-10 d-flex justify-end align-center"
          >
            <button
              data-v-8cb87d4b=""
              type="button"
              className="v-btn v-theme--trusteeLight text-primary v-btn--density-default v-btn--size-default v-btn--variant-text menu-item"
              style={{ minHeight: "64px" }}
            >
              <span className="v-btn__overlay"></span>
              <span className="v-btn__underlay"></span>
              <span className="v-btn__content" data-no-activator="">
                <div
                  data-v-8cb87d4b=""
                  className="v-avatar v-theme--trusteeLight v-avatar--density-default v-avatar--variant-flat"
                  style={{ width: "30px", height: "30px" }}
                >
                  <div
                    data-v-8cb87d4b=""
                    className="v-responsive v-img"
                    style={{ maxHeight: "20px", maxWidth: "20px" }}
                  >
                    <div
                      className="v-responsive__sizer"
                      style={{ paddingBottom: "100%" }}
                    >
                    </div>
                    <img
                      className="v-img__img v-img__img--contain"
                      src={asset("/img/accessibility-306ef3dd.svg")}
                      alt="Accessibility"
                    />
                  </div>
                  <span className="v-avatar__underlay"></span>
                </div>
              </span>
            </button>
            <button
              data-v-8cb87d4b=""
              type="button"
              className="v-btn v-theme--trusteeLight text-primary v-btn--density-default v-btn--size-default v-btn--variant-text menu-item"
              style={{ minHeight: "64px" }}
            >
              <span className="v-btn__overlay"></span>
              <span className="v-btn__underlay"></span>
              <span className="v-btn__content" data-no-activator="">
                <div
                  data-v-8cb87d4b=""
                  className="v-avatar v-theme--trusteeLight v-avatar--density-default v-avatar--variant-flat"
                  style={{ width: "30px", height: "30px" }}
                >
                  <div
                    data-v-8cb87d4b=""
                    className="v-responsive v-img"
                    style={{ maxHeight: "20px", maxWidth: "20px" }}
                  >
                    <div
                      className="v-responsive__sizer"
                      style={{ paddingBottom: "100%" }}
                    >
                    </div>
                    <img
                      className="v-img__img v-img__img--contain"
                      src={asset("/img/light_dark_mode-75fcc359.svg")}
                      alt="Light/Dark Mode"
                    />
                  </div>
                  <span className="v-avatar__underlay"></span>
                </div>
              </span>
            </button>
            <button
              data-v-8cb87d4b=""
              type="button"
              className="v-btn v-theme--trusteeLight text-primary v-btn--density-default v-btn--size-default v-btn--variant-text menu-item"
              style={{ minHeight: "64px" }}
            >
              <span className="v-btn__overlay"></span>
              <span className="v-btn__underlay"></span>
              <span className="v-btn__content" data-no-activator="">
                <div
                  data-v-8cb87d4b=""
                  className="v-avatar v-theme--trusteeLight v-avatar--density-default v-avatar--variant-flat"
                  style={{ width: "30px", height: "30px" }}
                >
                  <div
                    data-v-8cb87d4b=""
                    className="v-responsive v-img"
                    style={{ maxHeight: "20px", maxWidth: "20px" }}
                  >
                    <div
                      className="v-responsive__sizer"
                      style={{ paddingBottom: "100%" }}
                    >
                    </div>
                    <img
                      className="v-img__img v-img__img--contain"
                      src={asset("/img/notifications_blue-9b54de74.svg")}
                      alt="Notifications"
                    />
                  </div>
                  <span className="v-avatar__underlay"></span>
                </div>
              </span>
            </button>
            <button
              data-v-8cb87d4b=""
              type="button"
              className="v-btn v-theme--trusteeLight text-primary v-btn--density-default v-btn--size-default v-btn--variant-text menu-item pt-1 pb-1"
              style={{ minHeight: "64px" }}
              aria-haspopup="menu"
              aria-expanded="false"
              aria-owns="v-menu-3"
            >
              <span className="v-btn__overlay"></span>
              <span className="v-btn__underlay"></span>
              <span className="v-btn__content" data-no-activator="">
                <div
                  data-v-8cb87d4b=""
                  className="v-avatar v-theme--trusteeLight v-avatar--density-default v-avatar--variant-flat"
                  style={{
                    backgroundColor: "rgb(255, 158, 22)",
                    color: "rgb(0, 0, 0)",
                    caretColor: "rgb(0, 0, 0)",
                    width: "32px",
                    height: "32px",
                  }}
                >
                  <span
                    data-v-8cb87d4b=""
                    style={{ fontSize: "18px", color: "white" }}
                  >
                    JS
                  </span>
                  <span className="v-avatar__underlay"></span>
                </div>
                <img
                  data-v-8cb87d4b=""
                  className="ml-2"
                  style={{ width: "10px" }}
                  src={asset("/img/user_account_dropdown-3f0a3868.svg")}
                  alt="Dropdown"
                />
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
  */
}
