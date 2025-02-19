import * as oauth from "openid-client";
import { getRequiredEnv } from "@/utils/misc.ts";
import { defineRoute } from "$fresh/server.ts";
import { redirect, SessionRouteContext } from "@/utils/http.ts";

const issuer = new URL(getRequiredEnv("OAUTH_SERVER"));

const oauth_config = await oauth.discovery(
    issuer,
    getRequiredEnv("OAUTH_CLIENT_ID"),
    undefined,
    oauth.ClientSecretBasic(getRequiredEnv("OAUTH_CLIENT_SECRET")),
    { execute: [oauth.allowInsecureRequests] },
);

export default defineRoute(async (req: Request, ctx: SessionRouteContext) => {
    const url = new URL(req.url);
    const next_url = url.searchParams.get("success_url");
    ctx.state.session.flash("next", next_url ? next_url : "/");

    const redirect_uri: string = getRequiredEnv("OAUTH_REDIRECT_URI");
    const scope = "openid profile";
    /**
     * PKCE: The following MUST be generated for every redirect to the
     * authorization_endpoint. You must store the code_verifier and state in the
     * end-user session such that it can be recovered as the user gets redirected
     * from the authorization server back to your application.
     */
    const code_verifier: string = oauth.randomPKCECodeVerifier();
    const code_challenge: string = await oauth.calculatePKCECodeChallenge(code_verifier);
    ctx.state.session.set("oauth_code_verifier", code_verifier);

    let state!: string;

    const parameters: Record<string, string> = {
        redirect_uri,
        scope,
        code_challenge,
        code_challenge_method: "S256",
    };

    if (!oauth_config.serverMetadata().supportsPKCE()) {
        /**
         * We cannot be sure the server supports PKCE so we're going to use state too.
         * Use of PKCE is backwards compatible even if the AS doesn't support it which
         * is why we're using it regardless. Like PKCE, random state must be generated
         * for every redirect to the authorization_endpoint.
         */
        state = oauth.randomState();
        parameters.state = state;
        ctx.state.session.set("oauth_state", state);
    }

    const redirectTo: URL = oauth.buildAuthorizationUrl(oauth_config, parameters);

    // now redirect the user to redirectTo.href
    console.log("OIDC redirecting to", redirectTo.href);
    return redirect(redirectTo.href);
});
