import { Handlers, PageProps, RouteContext } from "$fresh/server.ts";
import { Domain, ProsumerWorkflowData, SSISearchCriterion, User } from "@/utils/types.ts";
import { dl_domains, do_ssi_search } from "@/utils/backend.ts";
import { sessionIdOrSignin } from "@/utils/http.ts";
import { Session } from "@5t111111/fresh-session";

import ProsumerStep1, { FilterValue } from "@/islands/prosumer/ProsumerStep1.tsx";
import { db_get, set_user_session_data, user_session_data } from "@/utils/db.ts";

import { redirect } from "@/utils/http.ts";
import { prosumer_key } from "@/utils/misc.ts";

const DL_API = Deno.env.get("DL_API_SERVER");
console.log(DL_API);

interface State {
    session: Session;
}

interface Data {
    domains: Domain[];
    user: User;
    criteria: SSISearchCriterion[];
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

export const handler: Handlers<unknown, State> = {
    async POST(req, ctx) {
        console.log("SESSION:", ctx.state.session.getSessionObject().data);
        const res = await sessionIdOrSignin(req, ctx);
        if (res instanceof Response) {
            return res;
        }
        const sessionId = res as string;
        const domains = await get_domains(sessionId);

        const data: FormData = await req.formData();
        console.log(data);
        const prosumer_id = ctx.params["prosumer_id"];

        const filters: string[][] = [];
        const sep = ":";
        new Set(data.keys().map((s) => s.split(sep)[1])).forEach((fid) => {
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
        const user: User = await user_profile(sessionId);
        const criteria: SSISearchCriterion[] = filters.map(([d, a, v]) => {
            return {
                domain: domains.get(d),
                attribute: domains.get(d)?.attributes.filter((attr) => attr.name == a),
                value: v,
                operator: "equal",
            };
        });
        console.log("CRITERIA", criteria);
        await do_ssi_search(user, prosumer_id, criteria);
        return redirect("step1");
    },
    async GET(req, ctx) {
        console.log("SESSION:", ctx.state.session.getSessionObject().data);
        const res = await sessionIdOrSignin(req, ctx);
        if (res instanceof Response) {
            return res;
        }
        const sessionId = res as string;
        const domains = await get_domains(sessionId);
        const user: User = await user_profile(sessionId);

        const prosumer_id = ctx.params["prosumer_id"];
        const prosumer_data = await db_get(prosumer_key(user, prosumer_id)) as ProsumerWorkflowData;
        return ctx.render({ domains: [...domains.values()], user, criteria: prosumer_data?.ssi?.criteria });
    },
};

export default function Step1Page(props: PageProps<Data>) {
    return <ProsumerStep1 domains={props.data.domains} user={props.data.user} criteria={props.data.criteria} />;
}
