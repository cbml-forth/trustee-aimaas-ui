import DropMenuField from "@/islands/DropMenuField.tsx";

/*
<Select />
<article class="blue1 small-round">
  <h5>Title</h5>
  <p>Some text here</p>
                  <div class="field label border invalid" >
                    <input type="text" value=""></input>
                    <label>Application Type</label>
                    <span class="error">Please...</span>
                  </div>
</article>
<button class="fill small-round">SUBMIT SELECTION</button>
<div class="v-col py-6 pl-0 pr-0">
<div
  class="v-card v-theme--trusteeLight v-card--density-default v-card--variant-elevated card"
  style={{ backgroundColor: "rgba(119, 197, 234, 0.1)" }}
>
  <div class="v-card__loader">
    <div
      class="v-progress-linear v-theme--trusteeLight v-locale--is-ltr"
      style={{
        top: "0px",
        height: "0px",
        "--v-progress-linear-height": "2px",
        left: "50%",
        transform: "translateX(-50%)",
      }}
      role="progressbar"
      aria-hidden="true"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="v-progress-linear__background"
        style={{ width: "100%" }}
      ></div>
      <div class="v-progress-linear__indeterminate">
        <div class="v-progress-linear__indeterminate long"></div>
        <div class="v-progress-linear__indeterminate short"></div>
      </div>
    </div>
  </div>

  <div class="v-card-text">
    <div class="v-row d-flex flex-row text-primary align-center">
      <div
        class="v-col-sm-6 v-col-12 d-flex flex-grow-0 py-0 pr-0 justify-center"
        style={{ maxWidth: "40px" }}
      >
        <div
          class="v-responsive v-img"
          style={{ height: "30px", width: "30px" }}
        >
          <div
            class="v-responsive__sizer"
            style={{ paddingBottom: "71.4844%" }}
          ></div>
          <img
            class="v-img__img v-img__img--contain"
            src="/img/used_filters_blue.svg"
          />
        </div>
      </div>
      <div class="v-col-sm-6 v-col-12 d-flex">
        <h3>Model Search Filters</h3>
      </div>
    </div>
  </div>
  <div class="v-card-text">
    <p class="basic-text">
      Provide some search criteria describing the desired model.
    </p>
  </div>
);

*/

export default function ConsumerStep1() {
  return (
    <nav>
      <div class="center-align">
        <img
          class="circle medium border small-padding"
          src="/img/used_filters_blue.svg"
        />
        <div class="small-margin">Model Search Filters</div>
      </div>
      <hr class="max" />
      <div class="center-align">
        <img
          class="circle medium border small-padding"
          src="/img/datasets.svg"
        />
        <div class="small-margin">Select datasets</div>
      </div>
      <hr class="max" />
      <div class="center-align">
        <img
          class="circle medium border small-padding"
          src="/img/used_filters_blue.svg"
        />
        <div class="small-margin">Select computation</div>
      </div>
    </nav>
  );
}
