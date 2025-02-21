import { db_get } from "@/utils/db.ts";

import { get_user, redirect, redirect_to_login, SessionState } from "@/utils/http.ts";
import { consumer_key } from "@/utils/misc.ts";

import { ConsumerWorkflowData, User } from "@/utils/types.ts";
import { Handlers } from "$fresh/server.ts";
const nextStep = function (w: ConsumerWorkflowData) {
    if (w.model_downloaded === true) {
        return "step5";
    }
    if (w.agreements_signed != undefined && w.agreements_signed === true) {
        return "step4";
    }
    if (w.selected_model_id != undefined) {
        return "step3";
    }
    if (w.step1_results != undefined) {
        return "step2";
    }
    return "step1";
};
const openUrl = function (w: ConsumerWorkflowData) {
    return `/consumer/${w.id}/${nextStep(w)}`;
};
export const handler: Handlers<unknown, SessionState> = {
    async GET(req, ctx) {
        const consumer_id = ctx.params["consumer_id"];
        const user: User | null = await get_user(req, ctx.state.session);
        const sessionId = user?.session_id;
        if (!sessionId) {
            return redirect_to_login(req);
        }
        const data = await db_get<ConsumerWorkflowData>(consumer_key(user, consumer_id));
        if (!data) {
            return redirect("/consumer"); // XXX: Add error message!
        }

        return redirect(openUrl(data));
    },
};
