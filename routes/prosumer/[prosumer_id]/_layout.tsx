import { defineLayout } from "$fresh/server.ts";
import { get_user, redirect, redirect_to_login, SessionRouteContext } from "@/utils/http.ts";
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

    const step2_enabled = w?.ssi != undefined;
    const step21_enabled = step2_enabled && w?.kg_results.length > 0;
    const step3_enabled = step2_enabled && w?.models_selected.length > 0;
    const step4_enabled = step3_enabled &&
        ["NOT STARTED", "STARTED", "IN EXECUTION", "COMPLETED"].includes(w?.fl_process?.status || "-");
    const step5_enabled = step4_enabled &&
        ["COMPLETED"].includes(w?.fl_process?.status || "-");

    const access_control: Map<string, boolean> = new Map([
        ["step1", true],
        ["step2", step2_enabled],
        ["step2_1", step21_enabled],
        ["step3", step3_enabled],
        ["step4", step4_enabled],
        ["step5", step5_enabled],
    ]);
    const hrefs: Map<string, string> = new Map(
        access_control.entries().map(([s, e]) => [
            s,
            e ? s : "",
        ]),
    );

    if (!access_control.get(step)) {
        return redirect("/prosumer");
    }

    return (
        <div class="large-padding" f-client-nav={false}>
            <nav class="large-padding wrap">
                <a class="center-align vertical" href={hrefs.get("step1")}>
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step1",
                        })}
                        src="/img/used_filters_blue.svg"
                    />
                    <div class="small-margin">Model Search Filters</div>
                </a>
                <hr class="max" />
                <a class="center-align vertical" href={hrefs.get("step2")}>
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step2",
                        })}
                        src="/img/datasets.svg"
                    />
                    <div class="small-margin">Select Models</div>
                </a>
                <hr class="max" />
                <a class="center-align vertical" href={hrefs.get("step3")}>
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step3",
                        })}
                        src="/img/used_filters_blue.svg"
                    />
                    <div class="small-margin">Select computation</div>
                </a>
                <hr class="max" />
                <a class="center-align vertical" href={hrefs.get("step4")}>
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step4",
                        })}
                        src="/img/fusion_workflow.svg"
                    />
                    <div class="small-margin">FL Status</div>
                </a>
                <hr class="max" />
                <a class="center-align vertical" href={hrefs.get("step5")}>
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step5",
                        })}
                        src="/img/fusion_workflow.svg"
                    />
                    <div class="small-margin">FL Process Completion</div>
                </a>
            </nav>
            <ctx.Component />
        </div>
    );
});
