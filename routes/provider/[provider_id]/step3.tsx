import { db_get, db_store } from "@/utils/db.ts";
import { get_user, redirect, redirect_to_login, SessionState } from "@/utils/http.ts";
import { provider_key } from "@/utils/misc.ts";
import { ProviderWorkflowData, User } from "@/utils/types.ts";
import { Handlers, PageProps } from "$fresh/server.ts";

interface Data {
    model_id?: number;
    agreements_created?: boolean;
}

export const handler: Handlers<Data, SessionState> = {
    async GET(req, ctx) {
        const provider_id = ctx.params["provider_id"];
        const user: User | null = await get_user(req, ctx.state.session);
        const sessionId = user?.session_id;
        if (!sessionId) {
            return redirect_to_login(req);
        }
        const data = await db_get<ProviderWorkflowData>(provider_key(user, provider_id));
        if (!data?.agreements_created) {
            return redirect("step2");
        }
        return ctx.render({
            agreements_created: data.agreements_created,
            model_id: data.model_id,
        });
    },
};

export default function ProviderStep3Page({ data }: PageProps<Data>) {
    return (
        <div class="large-padding">
            <h3>Final Report</h3>
            <div class="padding elevate">
                <h5>Results</h5>
                <p>Status: {data.agreements_created ? "Completed" : "Pending"}</p>
                <p>
                    The information for your model with ID {data.model_id} has been successfully uploaded to TRUSTEE.
                </p>
            </div>
        </div>
    );
}
