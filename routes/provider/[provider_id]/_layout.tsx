import { defineLayout } from "$fresh/server.ts";
import { get_user, redirect, redirect_to_login, SessionRouteContext } from "@/utils/http.ts";
import { db_get } from "@/utils/db.ts";
import { ProviderWorkflowData, User } from "@/utils/types.ts";
import { provider_key } from "@/utils/misc.ts";
import classNames from "@/utils/classnames.js";

export default defineLayout(async (req, ctx: SessionRouteContext) => {
    const provider_id = ctx.params["provider_id"];
    const user: User | null = await get_user(req, ctx.state.session);
    if (!user) {
        return redirect_to_login(req);
    }

    const w = await db_get<ProviderWorkflowData>(provider_key(user, provider_id));
    const paths = new URL(req.url).pathname.split("/");
    const step = paths[paths.length - 1];

    const step2_enabled = w?.model_id != undefined;
    const step3_enabled = step2_enabled && !!w.agreements_created;

    const access_control: Map<string, boolean> = new Map([
        ["step1", true],
        ["step2", step2_enabled],
        ["step3", step3_enabled],
    ]);
    const hrefs: Map<string, string> = new Map(
        access_control.entries().map(([s, e]) => [
            s,
            e ? s : "",
        ]),
    );

    if (!access_control.get(step)) {
        return redirect("/provider");
    }
    return (
        <div class="large-padding">
            <nav class="large-padding wrap">
                <a class="center-align vertical" href={hrefs.get("step1")}>
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step1",
                        })}
                        src="/img/exam_workflow.svg"
                    />
                    <div class="small-margin small-text">Model Description</div>
                </a>
                <hr class="max" />
                <a
                    href={hrefs.get("step2")}
                    class={classNames({
                        "center-align vertical": 1,
                    })}
                >
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step2",
                        })}
                        src="/img/contract_workflow.svg"
                    />
                    <div class="small-margin small-text">Sign Agreements</div>
                </a>
                <hr class="max" />
                <a
                    class={classNames({
                        "center-align vertical": 1,
                    })}
                    href={hrefs.get("step3")}
                >
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step3",
                        })}
                        src="/img/safedoc_workflow.svg"
                    />
                    <div class="small-margin small-text">Final Report</div>
                </a>
            </nav>
            <ctx.Component />
        </div>
    );
});
