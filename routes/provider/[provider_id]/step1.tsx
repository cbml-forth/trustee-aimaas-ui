import { db_get, db_store, set_user_session_data, user_session_data } from "@/utils/db.ts";
import { get_user, redirect, redirect_to_login, SessionState } from "@/utils/http.ts";
import { provider_key } from "@/utils/misc.ts";
import { Domain, ProviderModelData, ProviderWorkflowData, User } from "@/utils/types.ts";
import { Handlers, PageProps } from "$fresh/server.ts";
import { dl_domains, do_dl_provider_model_update } from "@/utils/backend.ts";
import { BasicSelect } from "@/components/Select.tsx";

interface Data {
    id?: number;
    domain_id?: number;
    credential_id?: string;
    model_provider_id?: string;
    source_url?: string;
    ecosystem?: string;
    provider_id: string;
    domains: Domain[];
    user: User;
    error?: string;
}

async function get_domains(user: User): Promise<Domain[]> {
    const data = await user_session_data(user.session_id, "domains");
    let domains = data.value as Domain[] | null;

    if (!domains) {
        domains = await dl_domains(user.tokens.id_token);
        await set_user_session_data(user.session_id, "domains", domains);
    }
    return domains.filter((d) => d.attributes) || [];
}

export const handler: Handlers<Data, SessionState> = {
    async GET(req, ctx) {
        const provider_id = ctx.params["provider_id"];
        const user: User | null = await get_user(req, ctx.state.session);
        const sessionId = user?.session_id;
        if (!sessionId) {
            return redirect_to_login(req);
        }

        const domains = await get_domains(user);
        const data = await db_get<ProviderWorkflowData>(
            provider_key(user, provider_id),
        );

        return ctx.render({
            id: data?.model_id,
            domain_id: data?.domain_id,
            credential_id: data?.credential_id,
            model_provider_id: data?.model_provider_id,
            source_url: data?.source_url,
            ecosystem: data?.ecosystem,
            provider_id,
            domains,
            user,
        });
    },
    async POST(req, ctx) {
        const provider_id = ctx.params["provider_id"];
        const user: User | null = await get_user(req, ctx.state.session);
        const sessionId = user?.session_id;
        if (!sessionId) {
            return redirect_to_login(req);
        }

        const formData: FormData = await req.formData();
        const domain_id = parseInt(formData.get("domain_id")?.toString() || "");
        const credential_id = formData.get("credential_id")?.toString();
        const source_url = formData.get("source_url")?.toString();
        const ecosystem = formData.get("ecosystem")?.toString();

        if (!domain_id || !credential_id || !source_url || !ecosystem) {
            return redirect("step1");
        }

        let w = await db_get<ProviderWorkflowData>(provider_key(user, provider_id));
        if (!w) {
            w = {
                id: provider_id,
                domain_id,
                credential_id,
                model_provider_id: user.id, // user's "sub" from token
                source_url,
                ecosystem,
            };
        } else {
            w.domain_id = domain_id;
            w.credential_id = credential_id;
            w.model_provider_id = user.id; // user's "sub" from token
            w.source_url = source_url;
            w.ecosystem = ecosystem;
        }

        const [ids, error] = await do_dl_provider_model_update(
            user,
            {
                domain_id,
                id: w.model_id,
                global_model_id: w.global_model_id,
                process_id: `provider:${provider_id}`,
                credential_id: w.credential_id || "",
                model_provider_id: user.id, // user's "sub" from token
                source_url: w.source_url || "",
                source: w.ecosystem || "TRUSTEE",
                format: "torch",
                trained: true,
            },
        );
        if (error || !ids) {
            const domains = await get_domains(user);
            return ctx.render({
                id: w.model_id,
                domain_id: w.domain_id,
                credential_id: w.credential_id,
                model_provider_id: w.model_provider_id,
                source_url: w.source_url,
                ecosystem: w.ecosystem,
                provider_id,
                domains,
                user,
                error,
            });
        }
        const [r1, r2] = ids;
        // const d = await r1.json();
        w.model_id = r1;
        w.global_model_id = r2;
        await db_store(provider_key(user, provider_id), w);
        return redirect("step2");
    },
};

export default function ProviderStep1Page({ data }: PageProps<Data>) {
    const domainOptions = data.domains.map((d: Domain) => ({
        id: d.id,
        name: d.description,
        value: d.id.toString(),
        selected: d.id === data.domain_id,
    }));

    const ecosystemOptions = [
        { id: 1, name: "TRUSTEE", value: "TRUSTEE", selected: data.ecosystem === "Trustee" },
        { id: 2, name: "GAIA-X", value: "GAIA-X", selected: data.ecosystem === "Gaiax" },
        { id: 3, name: "Copernicus", value: "Copernicus", selected: data.ecosystem === "Copernicus" },
        { id: 4, name: "IDS", value: "IDS", selected: data.ecosystem === "IDS" },
    ];

    return (
        <div class="large-padding">
            <h3>Model {data.id ? "" + data.id : ""} Information</h3>
            <p>
                Please provide your model provider information for TRUSTEE.
            </p>

            <div class="error-message">{data.error && "Error" + data.error}</div>
            <form method="POST" class="large-padding">
                <div style="display: flex; gap: 2rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px;">
                        <BasicSelect
                            options={domainOptions}
                            name="domain_id"
                            help_text="Select the domain"
                            label="Domain *"
                        />
                    </div>
                    <div style="flex: 1; min-width: 300px;">
                        <div class="field">
                            <label>Credential ID *</label>
                            <input
                                type="text"
                                name="credential_id"
                                placeholder="Enter your credential ID"
                                value={data.credential_id || ""}
                                required
                            />
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 2rem; margin-bottom: 1rem; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px;">
                        <BasicSelect
                            options={ecosystemOptions}
                            name="ecosystem"
                            help_text="Select the ecosystem"
                            label="Source *"
                        />
                    </div>
                    <div style="flex: 1; min-width: 300px;">
                        <div class="field">
                            <label>Model Provider ID</label>
                            <input
                                type="text"
                                name="model_provider_id"
                                value={data.user.id}
                                readonly
                                disabled
                            />
                        </div>
                    </div>
                </div>

                <div class="field">
                    <label>Client Endpoint URL *</label>
                    <input
                        type="url"
                        name="source_url"
                        placeholder="Enter the endpoint URL"
                        value={data.source_url || ""}
                        required
                    />
                </div>

                <div class="center-align">
                    <button type="submit" class="ripple button bg-trusteeBtn">
                        Submit Provider Information
                    </button>
                </div>
            </form>
        </div>
    );
}
