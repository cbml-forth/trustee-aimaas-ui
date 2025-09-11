import { db_get, db_store } from "@/utils/db.ts";
import { get_user, redirect, redirect_to_login, SessionState } from "@/utils/http.ts";
import { provider_key } from "@/utils/misc.ts";
import { ProviderWorkflowData, User } from "@/utils/types.ts";
import { Handlers } from "$fresh/server.ts";

const nextStep = function (w: ProviderWorkflowData) {
    if (w.agreements_created === true) {
        return "step3";
    }
    if (w.model_id !== undefined) {
        return "step2";
    }
    return "step1";
};

const openUrl = function (w: ProviderWorkflowData) {
    return `/provider/${w.id}/${nextStep(w)}`;
};

export const handler: Handlers<unknown, SessionState> = {
    async GET(req, ctx) {
        const provider_id = ctx.params["provider_id"];
        const user: User | null = await get_user(req, ctx.state.session);
        const sessionId = user?.session_id;
        if (!sessionId) {
            return redirect_to_login(req);
        }
        const data = await db_get<ProviderWorkflowData>(provider_key(user, provider_id));
        if (!data) {
            return redirect("/provider");
        }
        const action: string | null = ctx.url.searchParams.get("action");
        if (action?.startsWith("created:")) {
            data.agreements_created = true;
            await db_store(provider_key(user, provider_id), data);
        }
        return redirect(openUrl(data));
    },
};
