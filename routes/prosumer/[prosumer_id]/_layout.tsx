import { defineLayout } from "$fresh/server.ts";
import { get_user, redirect_to_login, SessionRouteContext } from "@/utils/http.ts";
import { ProsumerWorkflowData, User } from "@/utils/types.ts";
import { prosumer_key } from "@/utils/misc.ts";
import { db_get } from "@/utils/db.ts";
import classNames from "@/utils/classnames.js";

export default defineLayout(async (req, ctx: SessionRouteContext) => {
    const prosumer_id = ctx.params["prosumer_id"];
    const user: User | null = await get_user(req, ctx.state.session);
    if (!user) {
        return redirect_to_login(req);
    }

    const w = await db_get<ProsumerWorkflowData>(prosumer_key(user, prosumer_id));
    const paths = new URL(req.url).pathname.split("/");
    const step = paths[paths.length - 1];

    return (
        <div class="large-padding" f-client-nav={false}>
            <nav class="large-padding wrap">
                <div class="center-align">
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step1",
                        })}
                        src="/img/used_filters_blue.svg"
                    />
                    <div class="small-margin">Model Search Filters</div>
                </div>
                <hr class="max" />
                <div class="center-align">
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step2",
                        })}
                        src="/img/datasets.svg"
                    />
                    <div class="small-margin">Select Models</div>
                </div>
                <hr class="max" />
                <div class="center-align">
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step3",
                        })}
                        src="/img/used_filters_blue.svg"
                    />
                    <div class="small-margin">Select computation</div>
                </div>
            </nav>
            <ctx.Component />
        </div>
    );
});
