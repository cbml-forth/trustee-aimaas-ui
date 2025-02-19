import { get_user, redirect_to_login, SessionRouteContext } from "@/utils/http.ts";
import { set_user_session_data, user_session_data } from "@/utils/db.ts";
import { Domain, User } from "@/utils/types.ts";

import { dl_domains } from "@/utils/backend.ts";

export default async function Step1Page(req: Request, ctx: SessionRouteContext) {
    const user: User | null = await get_user(req, ctx.state.session);
    if (!user) {
        return redirect_to_login(req);
    }

    console.log("USER:", user);
    const sessionId = user.session_id;
    const data = await user_session_data(sessionId, "domains");
    let domains = data.value as Domain[] | null;

    if (!domains) {
        domains = await dl_domains(user.tokens.id_token);
        await set_user_session_data(sessionId, "domains", domains);
    }
    domains = domains.filter((d) => d.attributes);
    domains.sort((a, b) => a.description < b.description ? -1 : 1);
    return <article>Welcome</article>;
}
