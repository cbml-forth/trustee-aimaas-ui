import { db_get, db_store } from "@/utils/db.ts";
import { get_user, redirect, redirect_to_login, SessionState } from "@/utils/http.ts";
import { getRequiredEnv, provider_key } from "@/utils/misc.ts";
import { ProviderWorkflowData, User } from "@/utils/types.ts";
import { Handlers, PageProps } from "$fresh/server.ts";

const STM_URI = new URL(getRequiredEnv("STM_URI"));
const MY_URI = new URL(getRequiredEnv("AIMAAS_UI_URI"));

interface Data {
    model_description?: string;
    trustworthiness_assessment?: string;
    agreements_created?: boolean;
    model_id?: number;
    next: string | null;
}

export const handler: Handlers<Data, SessionState> = {
    async GET(req, ctx) {
        const provider_id = ctx.params["provider_id"];
        const user: User | null = await get_user(req, ctx.state.session);
        const sessionId = user?.session_id;
        if (!sessionId) {
            return redirect_to_login(req);
        }
        const data = await db_get<ProviderWorkflowData>(
            provider_key(user, provider_id),
        );
        if (!data) {
            return redirect("step1");
        }

        return ctx.render({
            model_description: data.model_description || "",
            agreements_created: data.agreements_created,
            model_id: data.model_id,
            next: data.agreements_created === true ? `/provider/${provider_id}/step3` : null,
        });
    },
    async POST(req, ctx) {
        const provider_id = ctx.params["provider_id"];
        const user: User | null = await get_user(req, ctx.state.session);
        const sessionId = user?.session_id;
        if (!sessionId) {
            return redirect_to_login(req);
        }

        const w = await db_get<ProviderWorkflowData>(
            provider_key(user, provider_id),
        );
        if (!w || !w.model_id || !w.global_model_id) {
            return redirect("step1");
        }

        const fd = await req.formData();
        let redirect_uri;

        if (fd.get("action") == "stm") {
            w.agreements_created = false;

            const model_id = w.global_model_id;
            const nonce = Date.now();

            const continue_uri = encodeURIComponent(
                new URL(MY_URI + `provider/${provider_id}?action=created:${nonce}`).toString(),
            );
            const stm_process_id = `provider:${provider_id}`;
            const stm_url = new URL(STM_URI);
            stm_url.hash = `#/aiAgreementCreation?model_id=${model_id}&process_id=${stm_process_id}`;
            redirect_uri = stm_url.toString();
        } else if (fd.get("action") == "dev") {
            w.agreements_created = true;
            redirect_uri = "step3";
        } else {
            redirect_uri = "step2"; // Stay on step2 to show agreement options
        }

        await db_store(provider_key(user, provider_id), w);
        return redirect(redirect_uri);
    },
};

export default function ProviderStep2Page({ data }: PageProps<Data>) {
    const { agreements_created, model_id, next } = data;

    return (
        <div class="large-padding">
            <h3>AI Model Agreements</h3>
            <p>
                Create model agreements.
            </p>

            <form method="POST" class="large-padding" f-client-nav={false}>
                <div class="padding elevate">
                    {agreements_created == undefined && (
                        <h6 class="left-align">
                            You have not yet created the agreements for model {model_id}
                        </h6>
                    )}
                    {agreements_created !== undefined && (
                        <h6 class="left-align">
                            Agreements for model {model_id} {agreements_created ? "created!" : "not created"}
                        </h6>
                    )}

                    <div class="right-align top-margin row">
                        {!agreements_created && (
                            <>
                                <button
                                    class="button ripple small-round upper elevate bg-trusteeBtn"
                                    type="submit"
                                    name="action"
                                    value="stm"
                                >
                                    Proceed to create agreements
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
                        {next && (
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
                </div>
            </form>
        </div>
    );
}
