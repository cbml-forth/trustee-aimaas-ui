import { db_get } from "@/utils/db.ts";

import { get_user, redirect } from "@/utils/http.ts";
import { consumer_key } from "@/utils/misc.ts";

import { ConsumerWorkflowData, User } from "@/utils/types.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { redirect_to_login, SessionState } from "@/utils/http.ts";
import DockerCmd from "@/islands/prosumer/DockerCmd.tsx";

const XAI_DOCKER_IMAGE_URL = Deno.env.get("XAI_DOCKER_IMAGE_URL");

interface Data {
    selected_model_id: number;
    error: boolean;
    user: User;
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
            user,
        });
    },
};

export default function Step5Page(props: PageProps<Data>) {
    const docker_image_file = "trustee-xai-tool.tar.gz";
    const container_name = "trustee-xai-tool";
    const id_token = props.data.user.tokens.id_token;
    const model_id = props.data.selected_model_id;
    const docker_cmd =
        `docker run -d --name ${container_name} --rm -p 8000:8501 -e TRUSTEE_DL_TOKEN=${id_token} -e TRUSTEE_DL_MODEL_ID=${model_id} trustee-xai-tool:latest`;
    return (
        <div class="padding">
            <h5 class="extra-text">Perform XAI - Deployment Instructions</h5>
            <div class="space"></div>
            <h6>Step 1 (optional): Download the Docker Image</h6>

            <p class="left-align">
                If you have not done so already, click the "XAI Docker Image" button below to download the docker image
                as a compressed file:
            </p>
            <p>
                <a href={"/xai_docker/" + docker_image_file} download={docker_image_file}>
                    <button>
                        XAI Docker Image <i class="small">download</i>
                    </button>
                </a>
            </p>

            <div class="space"></div>
            <h6>Step 2 (optional): Load the downloaded image</h6>

            <p class="left-align">
                If you have not done so already, launch the command below to load the docker image into your docker
                environment:
            </p>
            <div class="padding primary-container">
                <pre>docker load -i {docker_image_file}</pre>
            </div>

            <div class="space"></div>
            <h6>Step 3: Start the tool</h6>
            <p>Click the button below to copy the Docker command to run the tool:</p>

            <DockerCmd dockerCmd={docker_cmd} />

            <div class="space"></div>
            <h6>Step 4: Access the dashboard</h6>

            Open your browser and navigate to{" "}
            <a href="http://localhost:8000" target={"_blank"}>
                <button>
                    http://localhost:8000 <i class="small">open_in_browser</i>
                </button>
            </a>
        </div>
    );
}
