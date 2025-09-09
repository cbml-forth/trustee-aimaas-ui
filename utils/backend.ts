import {
    Domain,
    DomainAttr,
    FLStartAggregationRequest,
    ModelSearchCriterion,
    ModelSearchResponseItem,
    ProsumerWorkflowData,
    ProsumerWorkflowSSIData,
    SSISearchCriterion,
    SSISearchPollResponse,
    SSISearchResponse,
    SSISearchStatus,
    User,
} from "@/utils/types.ts";
import { db_get, db_store } from "@/utils/db.ts";
import { prosumer_key } from "@/utils/misc.ts";
import { ulid } from "jsr:@std/ulid/ulid";

const ATR_API = Deno.env.get("ATR_API_SERVER");
const DL_API = Deno.env.get("DL_API_SERVER") || "http://localhost:3800";
const SSI_API_SERVER = Deno.env.get("SSI_API_SERVER") || "http://localhost:3500";
const FL_API_SERVER = Deno.env.get("FL_API_SERVER") || "http://localhost:3701";

const print = console.log;

function _fetch_options(id_token: string) {
    return { headers: { "Authorization": `Bearer ${id_token}` } };
}

export async function dl_domains(id_token: string): Promise<Domain[]> {
    const req1 = await fetch(DL_API + "/domains/attributes", _fetch_options(id_token));
    const attrs: DomainAttr[] = await req1.json() as DomainAttr[];
    const m: Map<number, DomainAttr[]> = new Map();
    attrs.forEach((a: DomainAttr) => {
        const o = m.get(a.domain_id);
        if (o) {
            o.push(a);
        } else {
            m.set(a.domain_id, [a]);
        }
    });

    const req2 = await fetch(DL_API + "/domains", _fetch_options(id_token));
    const data: Domain[] = [];
    for (const d of await req2.json()) {
        const dom: Domain = {
            id: d.id,
            name: d.name,
            description: d.description,
            attributes: m.get(d.id) || [],
        };
        data.push(dom);
    }
    // const data: Domain[] = await req2.json() as Domain[]

    print("RETRIEVED", data.length, "DOMAINS");
    return data;
}

export async function atr_log(
    user: string,
    domain: string,
    abb: string,
    event_name: string,
): Promise<boolean> {
    const d = new Date();

    const data = {
        providerID: "AIMAAS",
        genericID1: "USER_ID",
        genericID2: "ABB",
        genericID3: "",
        datetime1: d.toISOString(),
        datetime2: "",
        textField1: user,
        textField2: abb,
        textField3: "",
        amount: "3",
        domain1: domain,
        domain2: "",
        domain3: "",
        country: "",
        year: `${d.getFullYear()}`,
        description: event_name,
        content: "",
        content1: "",
        content2: "",
        content3: "",
    };

    //   print("Sending:", data);

    const response = await fetch(ATR_API + "/transactions", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            "atr-api-key": Deno.env.get("ATR_API_KEY") || "",
        },
    });
    if (!response.ok) {
        const text = await response.text();
        print(`ATR Response status: ${response.status}, full response:\n${text}`);
        return false;
    }
    const json = await response.json();
    const tn = json.transactionId;
    print("ATR Response transaction id:", tn);
    return true;
}

export async function do_ssi_search(
    user: User,
    criteria: SSISearchCriterion[],
): Promise<SSISearchResponse | null> {
    const timestamp = Math.round(Date.now() * 1000);
    const process_id = ulid();
    const q = {
        process_id: process_id,
        type: "models-search",
        query: {
            "logical_operation": "and",
            "filters": criteria.map((c) => {
                return {
                    "domain": c.domain.name.toLowerCase(),
                    "type": c.attribute.name,
                    "value": c.value,
                    "operation": c.operator,
                };
            }),
        },
        timestamp: `${timestamp}`,
    };
    const id_token = user.tokens.id_token;
    print(`SSI search with token ${id_token}`, q);

    await atr_log(user.email, "AIMAAS", "SSI", "Search");

    const req = await fetch(SSI_API_SERVER + "/api/v1/verifier/search", {
        body: JSON.stringify(q),
        headers: { "Authorization": `Bearer ${id_token}`, "Content-Type": "application/json" },
        method: "POST",
    });
    if (!req.ok) {
        print("SSI ERROR", req.statusText, await req.text());
        return null;
    }
    const res = await req.json() as SSISearchResponse;
    // print(res);
    print("SSI SEARCH", res);
    return res;
}

export async function do_ssi_poll(user: User, prosumer_id: string, process_id: string): Promise<SSISearchStatus> {
    const id_token = user.tokens.id_token;
    print(`SSI poll ${process_id} with token ${id_token}`);

    const req = await fetch(SSI_API_SERVER + "/api/v1/verifier/search/" + process_id, {
        headers: { "Authorization": `Bearer ${id_token}`, "Content-Type": "application/json" },
    });
    if (!req.ok) {
        print("SSI ERROR", req.status, await req.text());
        return "ERROR";
    }
    const res = await req.json() as SSISearchPollResponse;
    print("SSI POLL returned:", res);
    const w: ProsumerWorkflowData = await db_get(prosumer_key(user, prosumer_id)) as ProsumerWorkflowData;
    w.ssi.status = res.status;
    if (res.status == "FINISHED") {
        w.ssi.results = res.datasets_id || [];
    }
    await db_store(prosumer_key(user, prosumer_id), w);
    return res.status;
}

// FL Prosumer Workflow: Submit request to FL module:
export async function do_fl_submit(
    user: User,
    flReq: FLStartAggregationRequest,
): Promise<boolean> {
    const q = {
        "data-provider-IDs": flReq.dataProviderIDs,
        "model-consumer-endpoint": flReq.modelConsumerEndpoint,
        "computation": flReq.computation,
        "process-ID": flReq.processID,
        "number-of-rounds": flReq.numberOfRounds,
    };
    const id_token = user.tokens.id_token;
    print(`FLStartAggregation with token ${id_token} and body:\n`, q);

    const req = await fetch(FL_API_SERVER + "/start-aggregation", {
        body: JSON.stringify(q),
        headers: { "Authorization": `Bearer ${id_token}`, "Content-Type": "application/json" },
        method: "POST",
    });
    if (!req.ok) {
        const err = await req.text();
        print("FL module ERROR:", err);
        return false;
    }
    const res = await req.json();
    print("FL module response", res);

    return true;
}

export async function do_fl_poll(
    user: User,
    process_name: string,
): Promise<string> {
    const id_token = user.tokens.id_token;
    const req = await fetch(FL_API_SERVER + "/status/" + process_name, {
        headers: { "Authorization": `Bearer ${id_token}`, "Content-Type": "application/json" },
    });
    if (!req.ok) {
        print("FL ERROR", await req.json());
        return "ERROR";
    }
    const res = await req.json();
    print("FL POLL returned:", res);
    return res.status;
}

export async function do_dl_model_search(
    user: User,
    criteria: ModelSearchCriterion[],
): Promise<ModelSearchResponseItem[] | null> {
    // const timestamp = Math.round(Date.now() * 1000);

    const id_token = user.tokens.id_token;
    print(`DL model search with token ${id_token}`);

    const url = new URL(DL_API + "/AIMaaS/models");

    for (const c of criteria) {
        url.searchParams.append("domain_id", c.domain.id.toString());
        for (const a of c.attributes) {
            url.searchParams.append(a.attribute.name, a.value);
        }
    }

    print("DL SEARCH", url.href);
    const req = await fetch(url.href, {
        headers: { "Authorization": `Bearer ${id_token}` },
        method: "GET",
    });
    if (!req.ok) {
        print("DL ERROR", await req.json());
        return [];
    }
    const res: ModelSearchResponseItem[] = await req.json() as ModelSearchResponseItem[];
    // print(res);
    return res;
}
export async function do_dl_model_download(
    user: User,
    model_id: number,
): Promise<Response> {
    // const timestamp = Math.round(Date.now() * 1000);

    const id_token = user.tokens.id_token;
    print(`DL model search with token ${id_token}`);

    const url = new URL(DL_API + "/AIMaaS/models/getModelFile");
    url.searchParams.set("id", model_id.toString());

    print("DL DOWNLOAD", url.href);
    const response = await fetch(url.href, {
        headers: { "Authorization": `Bearer ${id_token}` },
        method: "GET",
    });
    return response;
}

export async function do_dl_hedf_result_download(
    user: User,
    process_id: string,
): Promise<Response> {
    // const timestamp = Math.round(Date.now() * 1000);

    const id_token = user.tokens.id_token;
    print(`FL model search with token ${id_token}`);

    const url = new URL(DL_API + "/hedf/ProcessResults");
    url.searchParams.set("process_id", process_id);

    print("HEDF (FL) DOWNLOAD", url.href);
    const response = await fetch(url.href, {
        headers: { "Authorization": `Bearer ${id_token}` },
        method: "GET",
    });
    return response;
}
