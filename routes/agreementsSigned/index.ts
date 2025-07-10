import { defineRoute } from "$fresh/server.ts";
import { get_user, redirect, redirect_to_login, SessionRouteContext } from "@/utils/http.ts";
import { ConsumerWorkflowData } from "@/utils/types.ts";
import { consumer_key } from "@/utils/misc.ts";
import { db_get, db_store } from "@/utils/db.ts";

export default defineRoute(async (req, ctx: SessionRouteContext) => {
    const user = await get_user(req, ctx.state.session);
    if (!user) {
        return redirect_to_login(req);
    }
    const url = new URL(req.url);
    const process_id = url.searchParams.get("process_id");

    console.log("process_id", process_id);
    if (process_id?.startsWith("consumer:")) {
        const consumer_id = process_id.split(":")[1];

        const data = await db_get<ConsumerWorkflowData>(consumer_key(user, consumer_id));
        if (!data) {
            // No such consumer id ??
            return redirect("/consumer");
        }
        if (data.agreements_signed !== true) {
            // Mark as signed, if needed:
            data.agreements_signed = true;
            await db_store(consumer_key(user, consumer_id), data);
        }

        return redirect(`/consumer/${consumer_id}`);
    }
    return redirect("/");
});
