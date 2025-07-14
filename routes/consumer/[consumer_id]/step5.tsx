import { db_get } from "@/utils/db.ts";

import { get_user, redirect } from "@/utils/http.ts";
import { consumer_key } from "@/utils/misc.ts";

import { ConsumerWorkflowData, User } from "@/utils/types.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { redirect_to_login, SessionState } from "@/utils/http.ts";

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
        if (!data) {
            return redirect("/consumer");
        }
        if (!data?.model_downloaded || !data?.selected_model_id) {
            return redirect("step2");
        }
        return ctx.render({
            selected_model_id: data.selected_model_id,
            error: false,
        });
    },
};

export default function Step5Page(_props: PageProps<Data>) {
    return (
        <div class=" padding">
            <h5 class="extra-text">Run XAI Functions</h5>

            <p class="left-align">
                After downloading the model you can run Explainable AI operations on your premises using the Docker
                image available from the link below:
            </p>
            <p>
                <a href="/xai_docker/xai.tar" download={"xai_docker_image.tar"}>
                    <button>XAI Docker Image</button>
                </a>
            </p>
        </div>
    );
}
