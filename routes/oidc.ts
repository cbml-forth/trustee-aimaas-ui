import * as oauth from "openid-client";
import { getRequiredEnv, oauth_config } from "@/utils/misc.ts";
import { defineRoute } from "$fresh/server.ts";
import { redirect, SessionRouteContext } from "@/utils/http.ts";
import { set_user_session_data } from "@/utils/db.ts";
import { User } from "@/utils/types.ts";

export default defineRoute(async (req: Request, ctx: SessionRouteContext) => {
    const code_verifier = ctx.state.session.get<string>("oauth_code_verifier") || "";
    const state = ctx.state.session.get<string>("oauth_state") as string;
    const my_url = new URL(req.url);
    console.log(`OIDC: code_verifier: ${code_verifier}, state: ${state}, url: ${req.url}`); //, code_verifier, state);
    if (req.headers.has("X-Forwarded-Proto") && req.headers.get("X-Forwarded-Proto") === "https") {
        my_url.protocol = "https";
    }

    const tokens = await oauth.authorizationCodeGrant(
        oauth_config,
        my_url,
        {
            pkceCodeVerifier: code_verifier,
            expectedState: state,
        },
    );

    const claims = tokens.claims();
    console.log("Token Endpoint Response", tokens);
    if (!claims || !claims.exp || !tokens.id_token) {
        console.error("Got undefined claims from AM!");
        return null;
    }

    const userInfoRes: Response = await oauth.fetchProtectedResource(
        oauth_config,
        tokens.access_token,
        new URL(getRequiredEnv("OAUTH_SERVER") + "/oauth/userinfo"),
        "GET",
    );
    const user_profile = await userInfoRes.json();
    console.log("OIDC RETRIEVED USER PROFILE:", user_profile);

    const session_id = crypto.randomUUID();

    const user_name = user_profile.name ?? user_profile.firstname + " " + user_profile.lastname;

    const expires_at = claims.exp * 1000;
    const now = Date.now();
    const expires_in = expires_at - now;
    const u: User = {
        id: user_profile["sub"],
        name: user_name,
        email: user_profile.email ?? "",
        tokens: {
            id_token: tokens.id_token,
            access_token: tokens.access_token,
            expires_in: expires_in,
            expires_at: expires_at,
        },
        session_id,
    };
    await set_user_session_data(session_id, "user", u);
    ctx.state.session.set<string>("session_id", session_id);
    ctx.state.session.getSessionObject().expire = new Date(expires_at).toISOString();
    console.log("SESSION WILL EXPIRE AT", ctx.state.session.getSessionObject().expire);

    const next_url = ctx.state.session.get<string>("next");

    // console.log("OIDC SESSION:", ctx.state.session.getSessionObject().data);
    return redirect(next_url ? next_url : "/");
});
