import { User } from "@/utils/types.ts";

export function getRequiredEnv(key: string): string {
    const value = Deno.env.get(key);
    if (value === undefined) {
        throw new Error(`"${key}" environment variable must be set`);
    }
    return value;
}

export function prosumer_key(user: User, prosumer_id?: string): string[] {
    if (!prosumer_id) {
        return [user.id, "prosumer"];
    }
    return [user.id, "prosumer", prosumer_id];
}
export function consumer_key(user: User, consumer_id?: string): string[] {
    if (!consumer_id) {
        return [user.id, "consumer"];
    }
    return [user.id, "consumer", consumer_id];
}
