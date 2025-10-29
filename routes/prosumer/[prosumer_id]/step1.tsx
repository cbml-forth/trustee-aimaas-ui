import { Handlers, PageProps } from "$fresh/server.ts";
import {
    Domain,
    DomainAttr,
    ProsumerWorkflowData,
    SSISearchCriterion,
    SSISearchCriterionOperator,
    User,
} from "@/utils/types.ts";
import { dl_domains, do_fl_submit, do_kg_get_prosumer_data, do_ssi_search } from "@/utils/backend.ts";
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
    disabled: boolean;
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

// STEP1: We show the domains and the attributes and allow the user to filter
// and search on SSI for relevant models. When SSI responds, we go to STEP2.

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
        const filters: SSISearchCriterion[] = [];
        const sep = ":";
        new Set(data.keys().filter((v) => v.indexOf(sep) >= 0).map((s) => s.split(sep)[1])).forEach((fid) => {
            const d = data.get(`domain${sep}${fid}`)?.toString();
            const a = data.get(`attribute${sep}${fid}`)?.toString();
            const v = data.get(`value${sep}${fid}`)?.toString();
            const op = data.get(`rel${sep}${fid}`)?.toString()?.toLowerCase() as SSISearchCriterionOperator;
            if (!d || !a || !v || !op) return;
            const dom = domains.get(d);
            if (!dom) return;
            const attr = dom.attributes.find((attr) => attr.name == a);
            if (!attr) return;
            filters.push({ domain: dom, attribute: attr, operator: op, value: v });
        });

        console.log("CRITERIA", filters);

        const w: ProsumerWorkflowData = {
            id: prosumer_id,
            name: process_name,
            ssi: {
                status: "NOT STARTED",
                process_id: "",
                criteria: filters,
            },
            models_selected: [],
            kg_results: [],
        };
        const perform_ssi = data.get("action")?.toString() === "search";
        const perform_save = data.get("action")?.toString() === "save";
        if (perform_save) {
            await db_store(prosumer_key(user, prosumer_id), w);
            return redirect("step1");
        }

        const [kg_results, _] = await do_kg_get_prosumer_data(user, w);
        console.log("KG RESULTS", kg_results);
        if (kg_results && kg_results.length > 0) {
            w.kg_results = kg_results;
            // w.ssi.status = "FINISHED";
            // w.ssi.results = kg_results;
            await db_store(prosumer_key(user, prosumer_id), w);
            return redirect("step2_1");
        }

        if (perform_ssi) {
            console.log("PERFORMING SSI", filters);
            const ssi_response = await do_ssi_search(user, filters);
            if (ssi_response) {
                w.ssi.status = ssi_response.status;
                w.ssi.process_id = ssi_response.process_id || "";
            }
        }
        await db_store(prosumer_key(user, prosumer_id), w);

        /*
          "data-provider-IDs": ["8", "9"],
          "model-consumer-endpoint": "https://trustee-test-hedf-mc.cybersec.digital.tecnalia.dev",
          "computation": "Simple Averaging",
          "process-ID": "test-MultiFL-018",
          "number-of-rounds": 2
  */
        // FIXME: test!
        // await do_fl_submit(user, {
        //     dataProviderIDs: ["8", "9"],
        //     modelConsumerEndpoint: "https://trustee-test-hedf-mc.cybersec.digital.tecnalia.dev",
        //     computation: "Simple Averaging",
        //     processID: process_name,
        //     numberOfRounds: 2,
        // });

        return redirect("step2");
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
            // disabled: (prosumer_data?.ssi && prosumer_data.ssi.criteria.length > 0) || false,
            disabled: (prosumer_data?.fl_process ?? false),
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
            disabled={props.data.disabled}
        />
    );
}
