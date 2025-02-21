import { db_get, db_store } from "@/utils/db.ts";

import { get_user, redirect } from "@/utils/http.ts";
import { consumer_key } from "@/utils/misc.ts";

import { ConsumerWorkflowData, User } from "@/utils/types.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { redirect_to_login, SessionState } from "@/utils/http.ts";
import { atr_log, do_dl_model_download } from "@/utils/backend.ts";

interface Data {
    selected_model_id: number;
    error: boolean;
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
            selected_model_id: data.selected_model_id,
            error: false,
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

        // Record in ATR the action of the user to download the model:
        await atr_log(user.id, data.step1_search.domain.name, "DataLake", "GetModelFile");

        const response = await do_dl_model_download(user, data.selected_model_id);
        if (!response.ok) {
            return ctx.render({ selected_model_id: data.selected_model_id, error: true });
        }
        data.model_downloaded = true;
        await db_store(consumer_key(user, consumer_id), data);
        const filename = `model-${data.selected_model_id}.obj`;
        return new Response(response.body, {
            status: response.status,
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    },
};

export default function Step4Page({ data }: PageProps<Data>) {
    console.log(data);
    if (data.error == true) {
        return <h6 class="large-text">Error dowloading model {data.selected_model_id} !!</h6>;
    }
    return (
        <form method="POST" f-client-nav={false}>
            <button
                class="button ripple small-round upper elevate bg-trusteeBtn"
                type="submit"
                name="action"
                value="download"
            >
                Download model
            </button>
        </form>
    );
}
