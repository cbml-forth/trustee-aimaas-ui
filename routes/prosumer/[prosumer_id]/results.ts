import { db_get } from "@/utils/db.ts";

import { get_user, redirect } from "@/utils/http.ts";
import { prosumer_key } from "@/utils/misc.ts";

import { ProsumerWorkflowData } from "@/utils/types.ts";
import { Handlers } from "$fresh/server.ts";
import { redirect_to_login, SessionState } from "@/utils/http.ts";
import { atr_log, do_dl_hedf_result_download } from "@/utils/backend.ts";

// interface Data {
//     selected_model_id: number;
//     error: boolean;
// }
// export default defineRoute(async (req: Request, ctx: SessionRouteContext) => {
//     const url = new URL(req.url);
//     const next_url = url.searchParams.get("success_url");
//     ctx.state.session.flash("next", next_url ? next_url : "/");

export const handler: Handlers<unknown, SessionState> = {
    async GET(req, ctx) {
        const user = await get_user(req, ctx.state.session);
        if (!user) {
            return redirect_to_login(req);
        }

        const prosumer_id = ctx.params["prosumer_id"];
        const prosumer_data = await db_get<ProsumerWorkflowData>(prosumer_key(user, prosumer_id));
        if (!prosumer_data) {
            return redirect("step1");
        }
        console.log(`DOWNLOAD? ${prosumer_id} : Status: ${prosumer_data.fl_process?.status?.status}`);
        if ((prosumer_data.fl_process?.status?.status || "-") != "COMPLETED") {
            return redirect("step4");
        }

        const response = await do_dl_hedf_result_download(user, "AIMAAS-FL-" + prosumer_id);
        if (!response.ok) {
            return ctx.render({ selected_model_id: prosumer_id, error: true });
        }
        // const filename = `model-${prosumer_id}.obj`;
        // return new Response(response.body, {
        //     status: response.status,
        //     headers: {
        //         // "Content-Type": "application/json",
        //         "Content-Type": "application/octet-stream",
        //         "Content-Disposition": `attachment; filename="${filename}"`,
        //     },
        // });

        const filename = `model-${prosumer_id}.csv`;
        const text: string = (await response.json())["process_result"] as string;
        return new Response(
            text.replace(/\[ *\[/, "").replace(/\] *\]/, "").replaceAll(/\] *\[/g, "\r\n").replaceAll(" ", ","),
            {
                status: response.status,
                headers: {
                    "Content-Type": "text/csv",
                    "Content-Disposition": `attachment; filename="${filename}"`,
                },
            },
        );
    },
};
