/// <reference lib="deno.unstable" />

import { getRequiredEnv } from "@/utils/misc.ts";
import { User } from "@/utils/types.ts";

// We are using the same as oauth-kv
const DENO_KV_PATH_KEY = "DENO_KV_PATH";
let path = undefined;
if (
    (await Deno.permissions.query({ name: "env", variable: DENO_KV_PATH_KEY }))
        .state === "granted"
) {
    path = Deno.env.get(DENO_KV_PATH_KEY);
} else {
    path = ":memory:";
}

const kv = await Deno.openKv(path);

kv.listenQueue((msg: Record<string, unknown>) => {
    console.log("QUEUE Got", msg);
    // if (msg.cnt == 1) {
    //     kv.enqueue({ ...msg, cnt: 2 }, { delay: 1000 });
    // }
});

export function submit_work(msg: Record<string, unknown>, delay?: number | null) {
    if (delay) kv.enqueue(msg, { delay });
    else kv.enqueue(msg);
}
export async function user_session_data(session_id: string, key: string) {
    return await kv.get(["sessions", session_id, key]);
}

export async function set_user_session_data(session_id: string, key: string, data: unknown) {
    return await kv.set(
        ["sessions", session_id, key],
        data,
        { expireIn: 1000 * 3600 * parseInt(getRequiredEnv("AIMAAS_SESSION_EXPIRE_HOURS")) },
    );
}

export async function user_profile(session_id: null): Promise<null>;
export async function user_profile(session_id: string): Promise<User>;
export async function user_profile(session_id: string | null): Promise<User | null> {
    if (!session_id) {
        return null;
    }
    const u = await user_session_data(session_id, "user");
    if (!u?.value) {
        return null;
    }
    return u.value as User;
}

export async function db_store(key: string[], data: unknown) {
    console.log("DB store at", key, data);
    return await kv.set(key, data);
}
export async function db_get<T = unknown>(key: string[]): Promise<T | null> {
    const { value } = await kv.get(key);
    return value as T | null;
}

export async function list_all<T = unknown>(prefix_key: string[]): Promise<T[]> {
    const entries = kv.list({ prefix: prefix_key });
    const ret: T[] = [];
    for await (const entry of entries) {
        ret.push(entry.value as T);
    }
    return ret;
}
