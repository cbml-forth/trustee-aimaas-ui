import { defineConfig } from "$fresh/server.ts";
import { sessionPlugin } from "@5t111111/fresh-session";
import { getRequiredEnv } from "@/utils/misc.ts";
export default defineConfig({
    server: {
        port: 80,
    },
    plugins: [
        sessionPlugin({
            // Key must be at least 32 characters long.
            encryptionKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx", //crypto.randomUUID(),
            // Optional; the session does not expire if not provided.
            expireAfterSeconds: 3600 * parseInt(getRequiredEnv("AIMAAS_SESSION_EXPIRE_HOURS")),
            // Optional; default is "session".
            sessionCookieName: "aimaas_ui_session",
            // Optional; see https://jsr.io/@std/http/doc/cookie/~/Cookie
            cookieOptions: { path: "/", secure: false, sameSite: "Lax" },
        }),
    ],
});
