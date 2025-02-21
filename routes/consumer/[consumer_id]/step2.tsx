import { db_get, db_store } from "@/utils/db.ts";

import { get_user, redirect, redirect_to_login, SessionState } from "@/utils/http.ts";
import { consumer_key } from "@/utils/misc.ts";

import { ConsumerWorkflowData, ModelSearchResponseItem, User } from "@/utils/types.ts";
import { Handlers, PageProps } from "$fresh/server.ts";

interface Data {
    results: ModelSearchResponseItem[];
    selected_model_id?: number;
}
export const handler: Handlers<unknown, SessionState> = {
    async GET(req, ctx) {
        const consumer_id = ctx.params["consumer_id"];
        const user: User | null = await get_user(req, ctx.state.session);
        const sessionId = user?.session_id;
        if (!sessionId) {
            return redirect_to_login(req);
        }

        const data = await db_get<ConsumerWorkflowData>(consumer_key(user, consumer_id));
        if (!data?.step1_results) {
            console.log("COnsumer STep2: now found data!");
            return redirect("step1");
        }
        return ctx.render({
            results: data.step1_results,
            selected_model_id: data.selected_model_id,
        });
    },
    async POST(req, ctx) {
        const consumer_id = ctx.params["consumer_id"];
        const user: User | null = await get_user(req, ctx.state.session);
        const sessionId = user?.session_id;
        if (!sessionId) {
            return redirect_to_login(req);
        }

        const data: FormData = await req.formData();
        // console.log(data);

        const w = await db_get<ConsumerWorkflowData>(consumer_key(user, consumer_id));

        const selected_model_id = parseInt(data.get("model")?.toString() || "");
        if (!selected_model_id || !w) {
            console.log("Cannot find domain", data.get("domain_id"));
            return redirect("step2");
        }

        w.selected_model_id = selected_model_id;

        await db_store(consumer_key(user, consumer_id), w);
        return redirect("step3");
    },
};

export default function Step2Page(props: PageProps<Data>) {
    const { results, selected_model_id } = props.data;

    const disabled = !!selected_model_id;
    const pp = (r: ModelSearchResponseItem) => {
        return (
            <div class="padding ">
                <label class="radio extra">
                    <input
                        type="radio"
                        name="model"
                        value={r.id}
                        disabled={disabled}
                        checked={r.id == selected_model_id}
                    />
                    <span>Model {r.name ?? ""} ({r.id} - {r.size ?? ""})</span>
                </label>
                <div>Application type: {r.application_type}</div>
                <div>Input: {r.input}</div>
                <div>Output: {r.output}</div>
                <div>Architecture: {r.nn_architecture}</div>
            </div>
        );
    };

    return (
        <>
            <h6 class="left-align">Model Search results</h6>
            <form method="POST" f-client-nav={false}>
                <fieldset>
                    <legend>
                        {disabled ? "You have selected the following model" : "Select one of the models below"}
                    </legend>
                    <nav class="vertical">
                        {results.map(pp)}
                    </nav>
                </fieldset>

                <div class="right-align top-margin row">
                    <a href="step1">
                        <button
                            class="button ripple small-round upper elevate bg-trusteeBtn"
                            type="button"
                        >
                            <i>chevron_left</i>Back
                        </button>
                    </a>
                    {!disabled &&
                        (
                            <>
                                <button
                                    class="button ripple small-round upper elevate bg-trusteeBtn"
                                    type="submit"
                                    name="action"
                                    value="search"
                                >
                                    Select Model
                                </button>
                                <button
                                    class="button ripple small-round upper elevate bg-trusteeBtn"
                                    type="reset"
                                >
                                    Clear
                                </button>
                            </>
                        )}
                </div>
            </form>
        </>
    );
}
