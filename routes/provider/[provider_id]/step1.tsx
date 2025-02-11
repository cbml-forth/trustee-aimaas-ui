import { RouteContext } from "$fresh/server.ts";
import { sessionIdOrSignin } from "@/utils/http.ts";
import { set_user_session_data, user_session_data } from "@/utils/db.ts";
import { Domain, User } from "@/utils/types.ts";

import { dl_domains } from "@/utils/backend.ts";

export default async function Step1Page(req: Request, ctx: RouteContext<unknown, State>) {
    console.log("SESSION:", ctx.state.session.getSessionObject().data);
    const res = await sessionIdOrSignin(req, ctx);
    if (res instanceof Response) {
        return res;
    }
    const sessionId = res as string;

    const { value } = await user_session_data(sessionId, "user");
    const user: User = value as User;
    console.log("USER:", user);
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
