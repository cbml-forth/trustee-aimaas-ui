import { db_get, db_store } from "@/utils/db.ts";

import { get_user, redirect } from "@/utils/http.ts";
import { consumer_key, getRequiredEnv } from "@/utils/misc.ts";

import { ConsumerWorkflowData, User } from "@/utils/types.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { redirect_to_login, SessionState } from "@/utils/http.ts";

const STM_URI = new URL(getRequiredEnv("STM_URI"));
const MY_URI = new URL(getRequiredEnv("AIMAAS_UI_URI"));
console.log("MY URI: " + MY_URI);

interface Data {
    agreements_signed?: boolean;
    selected_model_id?: number;
    next: string | null;
}
export const handler: Handlers<Data, SessionState> = {
    async GET(req, ctx) {
        const user: User | null = await get_user(req, ctx.state.session);
        if (!user) {
            return redirect_to_login(req);
        }

        const consumer_id = ctx.params["consumer_id"];
        const data = await db_get<ConsumerWorkflowData>(consumer_key(user, consumer_id));
        if (data?.selected_model_id == undefined) {
            return redirect("step2");
        }
        return ctx.render({
            selected_model_id: data?.selected_model_id,
            agreements_signed: data?.agreements_signed,
            next: data?.agreements_signed === true ? `/consumer/${consumer_id}/step4` : null,
        });
    },
    async POST(req, ctx) {
        const user: User | null = await get_user(req, ctx.state.session);
        if (!user) {
            return redirect_to_login(req);
        }

        const consumer_id = ctx.params["consumer_id"];
        const data = await db_get<ConsumerWorkflowData>(consumer_key(user, consumer_id));
        if (data?.selected_model_id == undefined) {
            return redirect("step2");
        }

        const fd = await req.formData();
        let redirect_uri;
        if (fd.get("action") == "stm") {
            data.agreements_signed = false;

            const selected_model_id = data.selected_model_id;
            const nonce = Date.now(); // use this as a "nonce", i.e. an arbitrary number that can be used just once

            const continue_uri = encodeURIComponent(
                new URL(MY_URI + `consumer/${consumer_id}?action=signed:${nonce}`).toString(),
            );
            const stm_process_id = `consumer:${consumer_id}`;
            const stm_url = new URL(STM_URI);
            stm_url.hash = `#/signAiAgreements?model_id=${selected_model_id}&process_id=${stm_process_id}`;
            redirect_uri = stm_url.toString();
        } else {
            data.agreements_signed = true;

            redirect_uri = "step4";
        }
        await db_store(consumer_key(user, consumer_id), data);
        return redirect(redirect_uri);
    },
};

export default function Step3Page(props: PageProps<Data>) {
    const { agreements_signed, selected_model_id, next } = props.data;

    return (
        <form method="POST" f-client-nav={false}>
            {agreements_signed == undefined && (
                <h6 class="left-align">
                    You have not yet signed the aggreements for model {selected_model_id}
                </h6>
            )}
            {agreements_signed !== undefined && (
                <h6 class="left-align">
                    Agreements for model {selected_model_id} {agreements_signed ? "signed!" : "not signed"}
                </h6>
            )}
            <div class="right-align top-margin row">
                <a href="step2">
                    <button
                        class="button ripple small-round upper elevate bg-trusteeBtn"
                        type="button"
                    >
                        <i>chevron_left</i>Back
                    </button>
                </a>
                {!agreements_signed &&
                    (
                        <>
                            <button
                                class="button ripple small-round upper elevate bg-trusteeBtn"
                                type="submit"
                                name="action"
                                value="stm"
                            >
                                Proceed to sign agreements
                            </button>
                            <button
                                class="button ripple small-round upper elevate secondary"
                                type="submit"
                                name="action"
                                value="dev"
                            >
                                dev skip
                            </button>
                        </>
                    )}
                {next &&
                    (
                        <a href={next}>
                            <button
                                class="button ripple small-round upper elevate bg-trusteeBtn"
                                type="button"
                            >
                                Next<i>chevron_right</i>
                            </button>
                        </a>
                    )}
            </div>
        </form>
    );
}
