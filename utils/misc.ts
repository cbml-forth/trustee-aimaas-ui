import * as oauth from "openid-client";
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
export function provider_key(user: User, provider_id?: string): string[] {
  if (!provider_id) {
    return [user.id, "provider"];
  }
  return [user.id, "provider", provider_id];
}

function idp_config(): oauth.Configuration {
  const OAUTH_SERVER = new URL(getRequiredEnv("OAUTH_SERVER"));
  /*
    const oauth_config = await oauth.discovery(
        OAUTH_SERVER,
        getRequiredEnv("OAUTH_CLIENT_ID"),
        undefined,
        oauth.ClientSecretBasic(getRequiredEnv("OAUTH_CLIENT_SECRET")),
        { execute: [oauth.allowInsecureRequests] },
    );
    */

  // See https://github.com/panva/openid-client/blob/main/docs/interfaces/ServerMetadata.md

  const serverMetadata: oauth.ServerMetadata = {
    issuer: getRequiredEnv("AM_ISSUER"),
    authorization_endpoint: OAUTH_SERVER + "/oauth/authorize",
    jwks_uri: OAUTH_SERVER + "/oauth/jwks",
    id_token_signing_alg_values_supported: ["HS256", "RS256"],
    response_types_supported: ["code"],
    subject_types_supported: ["public"],
    token_endpoint: OAUTH_SERVER + "/oauth/token",
    token_endpoint_auth_methods_supported: [
      "client_secret_post",
      "client_secret_basic",
    ],
    userinfo_endpoint: OAUTH_SERVER + "/oauth/userinfo",
  };

  const oauth_config = new oauth.Configuration(
    serverMetadata,
    getRequiredEnv("OAUTH_CLIENT_ID"),
    undefined,
    oauth.ClientSecretBasic(getRequiredEnv("OAUTH_CLIENT_SECRET")),
  );

  console.log("AM Server Metadata", oauth_config.serverMetadata());
  return oauth_config;
}
export const oauth_config = idp_config();
