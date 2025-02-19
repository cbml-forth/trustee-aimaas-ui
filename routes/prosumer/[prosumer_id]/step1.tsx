import { Handlers, PageProps } from "$fresh/server.ts";
import { Domain, ProsumerWorkflowData, SSISearchCriterion, User } from "@/utils/types.ts";
import { dl_domains, do_ssi_search } from "@/utils/backend.ts";
import { get_user, redirect_to_login, SessionState } from "@/utils/http.ts";
import ProsumerStep1 from "@/islands/prosumer/ProsumerStep1.tsx";
import { db_get, db_store, set_user_session_data, user_session_data } from "@/utils/db.ts";

import { redirect } from "@/utils/http.ts";
import { prosumer_key } from "@/utils/misc.ts";

const DL_API = Deno.env.get("DL_API_SERVER");
console.log(DL_API);

interface Data {
    domains: Domain[];
    user: User;
    criteria: SSISearchCriterion[];
    process_name: string;
}

async function user_profile(sessionId: string): Promise<User> {
    const { value } = await user_session_data(sessionId, "user");
    const user: User = value as User;
    return user;
}

async function get_domains(sessionId: string): Promise<Map<string, Domain>> {
    const user: User = await user_profile(sessionId);
    const data = await user_session_data(sessionId, "domains");
    let domains = data.value as Domain[] | null;

    if (!domains) {
        domains = await dl_domains(user.tokens.id_token);
        await set_user_session_data(sessionId, "domains", domains);
    }
    domains = domains.filter((d) => d.attributes);
    // return domains;
    return new Map(domains?.map((d) => [d.name, d]));
}

export const handler: Handlers<unknown, SessionState> = {
    async POST(req, ctx) {
        const user = await get_user(req, ctx.state.session);
        if (!user) {
            return redirect_to_login(req);
        }

        const sessionId = user.session_id;
        const domains = await get_domains(sessionId);

        const data: FormData = await req.formData();
        console.log(data);
        const prosumer_id = ctx.params["prosumer_id"];

        const process_name = data.get("process_name")?.toString() || "";
        const filters: string[][] = [];
        const sep = ":";
        new Set(data.keys().filter((v) => v.indexOf(sep) >= 0).map((s) => s.split(sep)[1])).forEach((fid) => {
            const d = data.get(`domain${sep}${fid}`)?.toString();
            const a = data.get(`attribute${sep}${fid}`)?.toString();
            const v = data.get(`value${sep}${fid}`)?.toString();
            if (!!v && !!a && !!d) {
                filters.push([
                    d,
                    a,
                    v,
                ]);
            }
        });
        console.log(filters);

        const criteria = [...filters.map(([d, a, v]) => {
            return {
                domain: domains.get(d),
                attribute: domains.get(d)?.attributes.filter((attr) => attr.name == a),
                value: v,
                operator: "equal",
            };
        })];
        console.log("CRITERIA", criteria);

        const w: ProsumerWorkflowData = {
            id: prosumer_id,
            name: process_name,
            ssi: {
                status: "NOT STARTED",
                process_id: "",
                criteria,
            },
        };

        const perform_ssi = data.get("action")?.toString() === "search";

        if (perform_ssi) {
            const ssi_response = await do_ssi_search(user, criteria);
            if (ssi_response) {
                w.ssi.status = ssi_response.status;
                w.ssi.process_id = ssi_response.process_id || "";
            }
        }
        await db_store(prosumer_key(user, prosumer_id), w);
        return redirect("step1");
    },
    async GET(req, ctx) {
        const user = await get_user(req, ctx.state.session);
        if (!user) {
            return redirect_to_login(req);
        }

        const sessionId = user.session_id;
        const domains = await get_domains(sessionId);

        const prosumer_id = ctx.params["prosumer_id"];
        const prosumer_data = await db_get<ProsumerWorkflowData>(prosumer_key(user, prosumer_id));
        return ctx.render({
            domains: [...domains.values()],
            user,
            criteria: prosumer_data?.ssi?.criteria,
            process_name: prosumer_data?.name || "",
        });
    },
};

export default function Step1Page(props: PageProps<Data>) {
    return (
        <ProsumerStep1
            domains={props.data.domains}
            user={props.data.user}
            criteria={props.data.criteria}
            process_name={props.data.process_name}
            disabled={false}
        />
    );
}
