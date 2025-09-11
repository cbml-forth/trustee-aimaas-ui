import { defineRoute } from "$fresh/server.ts";
import { get_user, redirect, redirect_to_login, SessionRouteContext } from "@/utils/http.ts";
import { ProviderWorkflowData } from "@/utils/types.ts";
import { provider_key } from "@/utils/misc.ts";
import { db_get, db_store } from "@/utils/db.ts";

export default defineRoute(async (req, ctx: SessionRouteContext) => {
    const user = await get_user(req, ctx.state.session);
    if (!user) {
        return redirect_to_login(req);
    }
    const url = new URL(req.url);
    const process_id = url.searchParams.get("process_id");

    console.log("process_id", process_id);
    if (process_id?.startsWith("provider:")) {
        const provider_id = process_id.split(":")[1];

        const data = await db_get<ProviderWorkflowData>(provider_key(user, provider_id));
        if (!data) {
            // No such provider id ??
            console.log("agreementsCreated: No such provider id", provider_id);
            return redirect("/provider");
        }
        if (data.agreements_signed !== true) {
            // Mark as signed, if needed:
            data.agreements_signed = true;
            await db_store(provider_key(user, provider_id), data);
        }

        return redirect(`/provider/${provider_id}/step2`);
    }
    return redirect("/");
});
