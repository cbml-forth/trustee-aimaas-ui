import { db_get, db_store, user_profile } from "@/utils/db.ts";

import { get_user, redirect, SessionRouteContext } from "@/utils/http.ts";
import { consumer_key } from "@/utils/misc.ts";

import { ConsumerWorkflowData, User } from "@/utils/types.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { redirect_to_login, SessionState } from "@/utils/http.ts";

interface Data {
    agreements_signed?: boolean;
    selected_model_id?: number;
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
            const stm_url = `https://stm.trustee-1.ics.forth.gr/#/aiAgreementCreation?model_id=${selected_model_id}`;
            redirect_uri = stm_url;
        } else {
            data.agreements_signed = true;

            redirect_uri = "step4";
        }
        await db_store(consumer_key(user, consumer_id), data);
        return redirect(redirect_uri);
    },
};

export default function Step3Page(props: PageProps<Data>) {
    const { agreements_signed, selected_model_id } = props.data;

    return (
        <form method="POST" f-client-nav={false}>
            <h6 class="left-align">Agreements Signing status</h6>
            {!agreements_signed && (
                <h6 class="left-align medium-text">
                    You have not yet signed the aggreements for model {selected_model_id}
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
                {agreements_signed && (
                    <span>Agreements signed: {agreements_signed ? "True" : "False"} for {selected_model_id}</span>
                )}
            </div>
        </form>
    );
}
