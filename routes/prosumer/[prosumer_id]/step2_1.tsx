import { Handlers, PageProps } from "$fresh/server.ts";
import { Domain, ProsumerWorkflowData, ProsumerWorkflowFLData, SSISearchCriterion, User } from "@/utils/types.ts";
import { dl_domains, do_fl_submit, do_kg_store_prosumer_data, do_ssi_poll, do_ssi_search } from "@/utils/backend.ts";
import { get_user, redirect_to_login, SessionState } from "@/utils/http.ts";
import { db_get, db_store, set_user_session_data, user_session_data } from "@/utils/db.ts";

import { redirect } from "@/utils/http.ts";
import { prosumer_key } from "@/utils/misc.ts";
import ProsumerStep2 from "@/islands/prosumer/ProsumerStep2.tsx";

interface Data {
    user: User;
    kg_results: string[];
}

async function user_profile(sessionId: string): Promise<User> {
    const { value } = await user_session_data(sessionId, "user");
    const user: User = value as User;
    return user;
}

// STEP2_1: There are some results from SSI available through the KG.
// We allow the user to use them...

export const handler: Handlers<unknown, SessionState> = {
    async POST(req, ctx) {
        const user = await get_user(req, ctx.state.session);
        if (!user) {
            return redirect_to_login(req);
        }

        const prosumer_id = ctx.params["prosumer_id"];
        const w = await db_get<ProsumerWorkflowData>(prosumer_key(user, prosumer_id));

        if (!w) {
            return redirect("step1");
        }

        const data: FormData = await req.formData();

        if (data.get("action") == "search") {
            console.log("PERFORMING SSI", w.ssi.criteria);
            const ssi_response = await do_ssi_search(user, w.ssi.criteria);
            if (ssi_response) {
                w.ssi.status = ssi_response.status;
                w.ssi.process_id = ssi_response.process_id || "";
            }
            await db_store(prosumer_key(user, prosumer_id), w);
            return redirect("step2");
        }

        w.ssi.results = w.kg_results;
        w.ssi.status = "FINISHED";
        await db_store(prosumer_key(user, prosumer_id), w);
        return redirect("step2");
    },
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
        if (prosumer_data.kg_results.length == 0) {
            return redirect("step2");
        }

        return ctx.render({
            user,
            kg_results: prosumer_data.kg_results,
        });
    },
};

export default function Step21Page(props: PageProps<Data>) {
    console.log("STEP2_1", props.data.kg_results);
    return (
        <div class="large-padding">
            <h6>Do you want reuse {props.data.kg_results.length} results of your query from previous searches?</h6>
            <form method={"POST"}>
                <button type="submit" name="action" value="reuse">
                    Yes
                </button>
                <button type="submit" name="action" value="search">
                    No
                </button>
            </form>
        </div>
    );
}
