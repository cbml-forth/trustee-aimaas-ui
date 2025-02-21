import { Handlers, PageProps } from "$fresh/server.ts";
import {
    ConsumerWorkflowData,
    Domain,
    ModelSearchAttributeCriterion,
    ModelSearchCriterion,
    User,
} from "@/utils/types.ts";
import { dl_domains, do_dl_model_search } from "@/utils/backend.ts";
import { get_user, redirect_to_login, SessionState } from "@/utils/http.ts";

import { db_get, db_store, set_user_session_data, user_session_data } from "@/utils/db.ts";

import { redirect } from "@/utils/http.ts";
import { consumer_key } from "@/utils/misc.ts";

import ConsumerStep1 from "@/islands/consumer/ConsumerStep1.tsx";

const DL_API = Deno.env.get("DL_API_SERVER");
console.log(DL_API);

interface Data {
    domains: Domain[];
    user: User;
    disabled: boolean;
    criteria?: ModelSearchCriterion;
    next?: string;
}

async function get_domains(user: User): Promise<Map<number, Domain>> {
    const data = await user_session_data(user.session_id, "domains");
    let domains = data.value as Domain[] | null;

    if (!domains) {
        domains = await dl_domains(user.tokens.id_token);
        await set_user_session_data(user.session_id, "domains", domains);
    }
    domains = domains.filter((d) => d.attributes);
    // return domains;
    return new Map(domains?.map((d) => [d.id, d]));
}

export const handler: Handlers<Data, SessionState> = {
    async POST(req, ctx) {
        const consumer_id = ctx.params["consumer_id"];
        const user: User | null = await get_user(req, ctx.state.session);
        const sessionId = user?.session_id;
        if (!sessionId) {
            return redirect_to_login(req);
        }
        const domains = await get_domains(user);

        const data: FormData = await req.formData();
        console.log(data);

        const domain_id = parseInt(data.get("domain_id")?.toString() || "");
        const dom: Domain | undefined = domains.get(domain_id);
        if (!dom) {
            console.log("Cannot find domain", data.get("domain_id"));
            return redirect("step1");
        }

        const attrs: Array<ModelSearchAttributeCriterion> = [];
        for (const [k, fv] of data.entries()) {
            const value = fv.toString();
            if (!k.startsWith("attr-") || !value) continue;
            const attr = dom.attributes.find((a) => a.id.toString() == k.substring(5));
            if (!attr) continue;

            attrs.push({ attribute: attr, value });
        }
        console.log("attrs", attrs);
        const crit: ModelSearchCriterion = {
            domain: dom,
            attributes: attrs,
        };

        let w = await db_get<ConsumerWorkflowData>(consumer_key(user, consumer_id));
        if (!w) {
            w = {
                id: consumer_id,
                step1_search: crit,
            };
        } else {
            w.step1_search = crit;
        }

        const save_it = data.get("action")?.toString() === "save";
        if (save_it) {
            await db_store(consumer_key(user, consumer_id), w);

            return redirect("step1");
        }

        const response = await do_dl_model_search(user, [crit]);
        if (response) {
            w.step1_results = response;
        }
        await db_store(consumer_key(user, consumer_id), w);

        return redirect("step2");
    },
    async GET(req, ctx) {
        const consumer_id = ctx.params["consumer_id"];
        const user: User | null = await get_user(req, ctx.state.session);
        const sessionId = user?.session_id;
        if (!sessionId) {
            return redirect_to_login(req);
        }
        const domains = await get_domains(user);
        const data = await db_get<ConsumerWorkflowData>(consumer_key(user, consumer_id));
        if (data) {
            console.log("Hmmm found", data);
        }
        const disabled = data?.selected_model_id !== undefined;
        return ctx.render({
            domains: [...domains.values()],
            user,
            disabled: disabled,
            criteria: data?.step1_search,
            next: `/consumer/${consumer_id}/step2`,
        });
    },
};

export default function Step1Page(props: PageProps<Data>) {
    return (
        <ConsumerStep1
            domains={props.data.domains}
            user={props.data.user}
            criteria={props.data.criteria}
            disabled={props.data.disabled}
            next={props.data.next}
        />
    );
}
