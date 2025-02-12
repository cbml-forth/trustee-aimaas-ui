import { defineLayout } from "$fresh/server.ts";

export default defineLayout(async (req, ctx) => {
    return (
        <div class="large-padding" f-client-nav={false}>
            <nav class="large-padding wrap">
                <div class="center-align">
                    <img
                        class="circle medium secondary border small-padding"
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
            <ctx.Component />
        </div>
    );
});
