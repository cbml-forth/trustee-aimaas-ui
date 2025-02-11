// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { HTTPStatus } from "jsr:@oneday/http-status";
import { RouteContext } from "$fresh/server.ts";
import { Session } from "@5t111111/fresh-session";
import { user_profile } from "@/utils/db.ts";

/**
 * @param location A relative (to the request URL) or absolute URL.
 * @param status HTTP status
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Location}
 */
export function redirect(
    location: string,
    status: HTTPStatus.Created | HTTPStatus.SeeOther = 303,
) {
    return new Response(null, {
        headers: {
            location,
        },
        status,
    });
}

export async function sessionIdOrSignin(
    req: Request,
    ctx: RouteContext<unknown, { session: Session }>,
): Promise<string | Response> {
    const sessionId = ctx.state.session.get<string>("session_id");
    const isSignedIn = sessionId !== undefined;
    // const accessToken = isSignedIn ? await getSessionAccessToken(oauth2Client, sessionId) : null;
    const path = URL.parse(req.url)?.pathname;
    const u = URL.parse(req.url);
    console.log("SESSION ID:", sessionId, "URL", u?.pathname, "SIGNED?", isSignedIn);
    const user = await user_profile(sessionId);
    console.log("USERRR", user);
    if (!sessionId || !user || (user.tokens.expires_at ?? 0) < Date.now()) {
        return redirect("/login?success_url=" + path);
    }

    return sessionId;
}
