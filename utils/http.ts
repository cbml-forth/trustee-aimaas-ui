// Copyright 2023 the Deno authors. All rights reserved. MIT license.
import { HTTPStatus } from "jsr:@oneday/http-status";
import { FreshContext, RouteContext } from "$fresh/server.ts";
import { Session } from "@5t111111/fresh-session";
import { user_profile } from "@/utils/db.ts";
import { User } from "@/utils/types.ts";

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

export function redirect_to_login(req: Request) {
    // const path = URL.parse(req.url)?.pathname;
    return redirect("/login?success_url=" + req.url);
}

export type SessionState = {
    session: Session;
};
export type SessionFreshContext = FreshContext<SessionState, void>;
export type SessionRouteContext = RouteContext<void, SessionState>;

// export async function sessionIdOrSignin(
//     req: Request,
//     session: Session,
// ): Promise<string | Response> {
//     const sessionId = session.get("session_id");
//     if (!sessionId) {
//         return redirect_to_login(req);
//     }
//     const user = await user_profile(sessionId);
//     // console.log("USERRR", user);
//     if ((user?.tokens?.expires_at ?? 0) < Date.now()) {
//         return redirect_to_login(req);
//     }

//     return sessionId;
// }

export async function get_user(
    _req: Request,
    session: Session,
): Promise<User | null> {
    const sessionId = session.get<string>("session_id");
    if (!sessionId) {
        return null;
    }

    const user: User = await user_profile(sessionId);
    return user;
}
