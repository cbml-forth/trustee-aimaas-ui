import { defineRoute } from "$fresh/server.ts";
import { get_user, redirect_to_login, SessionRouteContext } from "@/utils/http.ts";
import { User } from "@/utils/types.ts";
import Token from "@/islands/Token.tsx";

export default defineRoute(async (req, ctx: SessionRouteContext) => {
    const user: User | null = await get_user(req, ctx.state.session);
    if (!user) {
        return redirect_to_login(req);
    }
    return <Token user={user} />;
});
