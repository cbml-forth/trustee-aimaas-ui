import {
    Domain,
    DomainAttr,
    FLProcessStatusData,
    FLStartAggregationRequest,
    ModelSearchCriterion,
    ModelSearchResponseItem,
    ProsumerWorkflowData,
    ProviderModelData,
    ssi_criteria_to_ast,
    SSISearchCriterion,
    SSISearchPollResponse,
    SSISearchResponse,
    SSISearchStatus,
    User,
} from "@/utils/types.ts";
import { db_get, db_store } from "@/utils/db.ts";
import { prosumer_key } from "@/utils/misc.ts";
import { decodeTime, ulid } from "jsr:@std/ulid";

const ATR_API = Deno.env.get("ATR_API_SERVER");
const DL_API = Deno.env.get("DL_API_SERVER") || "http://localhost:3800";
const KG_API = Deno.env.get("KG_API_SERVER") || "http://localhost:3800";
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

export async function dl_get_fl_endpoint(id_token: string, model_provider_id: string): Promise<string | undefined> {
    const url = new URL(DL_API + "/AIMaaS/providers");

    url.searchParams.append("model_provider_id", model_provider_id);

    const req = await fetch(url.href, {
        headers: { "Authorization": `Bearer ${id_token}` },
        method: "GET",
    });
    if (!req.ok) {
        print(`DL provider for ${model_provider_id} not found with token ${id_token}`);
        return undefined;
    }

    const data = await req.json();
    if (!data) {
        return undefined;
    }

    if (Array.isArray(data) && data.length > 0) {
        return data[data.length - 1]["fl_client_endpoint"] || undefined;
    }
    return data["fl_client_endpoint"] || undefined;
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
): Promise<FLProcessStatusData> {
    const id_token = user.tokens.id_token;
    const req = await fetch(FL_API_SERVER + "/status/" + process_name, {
        headers: { "Authorization": `Bearer ${id_token}`, "Content-Type": "application/json" },
    });
    const data: FLProcessStatusData = {
        current_round: 0,
        total_rounds: 0,
        has_completed: false,
        has_failed: false,
        rounds_completed: 0,
        status: "",
    };
    if (!req.ok) {
        print("FL ERROR", await req.json());
        data.has_failed = true;
        return data;
    }
    const res = await req.json();
    print("FL POLL returned:", res);

    data.status = res.status;
    data.has_completed = res.status === "COMPLETED";
    data.has_failed = res.status === "FAILED";
    data.current_round = res.current_round;
    data.total_rounds = res.total_rounds;
    data.rounds_completed = Object.keys(res.endpoints_by_round || {}).length;

    return data;
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
    const res: ModelSearchResponseItem[] = await req.json() as ModelSearchResponseItem[]; // XXX: Filter out the FL models! (with process_id=provider:<id>)
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

// The following is for registering (or updating the record) of an FL model
// i.e. a model used by the FL module for aggregation (a base model)
// We make 2 calls to DL:
// 1) to /flmodels to register the model as a FL model
// 2) to /models to register the model as a "global" model just for STM to be able to find it
export async function do_dl_provider_model_update(
    user: User,
    data: ProviderModelData,
): Promise<[[number, number]?, string?]> { // Return either the model ID or the error
    // const timestamp = Math.round(Date.now() * 1000);

    const id_token = user.tokens.id_token;
    print(`FL model update with token ${id_token}`);

    const url = new URL(DL_API + "/AIMaaS/flmodels");

    print("Uploading FL Model to", url.href, "model:", data);
    const response1 = await fetch(url.href, {
        body: JSON.stringify(data),
        headers: { "Authorization": `Bearer ${id_token}` },
        method: "POST",
    });
    if (response1.status / 100 != 2) {
        const error = await response1.text();
        print("FL model update returned DL ERROR:", error);
        return [undefined, error];
    }
    const r1 = await response1.json();

    const global_model_data = {
        domain_id: data.domain_id,
        process_id: data.process_id,
        round: 0,
    };

    const url2 = new URL(DL_API + "/AIMaaS/models");

    // Now register it as a global model to make the STM happy to access it:

    const isRegisteredAlready = data.global_model_id ?? 0 > 0;
    const formData = new FormData();
    formData.append("domain_id", data.domain_id.toString());
    formData.append("process_id", data.process_id);
    formData.append("round", global_model_data.round.toString());
    formData.append("model_file", new Blob([JSON.stringify(global_model_data)]), "model.json");

    print(
        "Uploading Global model (global model id:",
        data.global_model_id,
        ") to",
        url.href,
        "model:",
        formData,
    );
    const response2 = await fetch(url2.href, {
        body: formData,
        headers: { "Authorization": `Bearer ${id_token}` },
        method: isRegisteredAlready ? "PUT" : "POST",
    });
    if (response2.status / 100 != 2) {
        const error = (await response2.text()) || "";
        print("FL (global) model update returned DL ERROR (status:", response2.status, "):", error);
        return [undefined, error];
    }
    const r2 = await response2.json();

    return [[r1.id, r2.id], undefined];
}

export async function do_kg_store_prosumer_data(user: User, w: ProsumerWorkflowData): Promise<[number?, string?]> {
    const cacheHours = 24;

    const dateCreated = new Date(decodeTime(w.id));
    const dateExpires = new Date(dateCreated.getTime() + cacheHours * 60 * 60 * 1000);

    const data: Record<string, any> = {
        process_id: `prosumer:${w.id}`,
        process_name: w.name ?? "",
        process_status: w.ssi.status,
        date_created: dateCreated.toISOString(),
        user_id: user.id,
        search_query_id: w.ssi.process_id,
        search_query: {
            logical_operator: "AND",
            filters: w.ssi.criteria.map((c) => {
                return {
                    domain: c.domain.name.toLowerCase(),
                    type: c.attribute.name,
                    value: c.value,
                    operation: c.operator,
                };
            }),
        },
    };
    if (w.ssi.results) {
        data.store_until_date = dateExpires.toISOString();
        data.matched_models = w.ssi.results;
    }
    const id_token = user.tokens.id_token;

    const url = new URL(KG_API + "/kg/models/storeModels");

    print("Uploading Models Search to KG:", url.href, "data:", JSON.stringify(data));
    const response1 = await fetch(url.href, {
        body: JSON.stringify(data),
        headers: { "Authorization": `Bearer ${id_token}`, "Content-Type": "application/json" },
        method: "POST",
    });
    if (response1.status / 100 != 2) {
        const error = await response1.text();
        print("KG prosumer data store returned error:", error);
        return [undefined, error];
    }
    return [1, undefined];
}

function kg_results_to_ast(query: Record<string, any>): string {
    //  {
    // "filters": [
    //     {
    //     "filters": [
    //         {
    //         "domain": "nlp",
    //         "operation": "equals",
    //         "type": "task",
    //         "value": "text_generation"
    //         },
    //         {
    //         "domain": "size",
    //         "operation": "less_than",
    //         "type": "parameters",
    //         "value": "1B"
    //         }
    //     ],
    //     "logical_operator": "AND"
    //     },
    //     {
    //     "filters": [
    //         {
    //         "domain": "nlp",
    //         "operation": "equals",
    //         "type": "task",
    //         "value": "summarization"
    //         },
    //         {
    //         "domain": "performance",
    //         "operation": "greater_than",
    //         "type": "rouge_score",
    //         "value": "0.75"
    //         }
    //     ],
    //     "logical_operator": "AND"
    //     }
    // ],
    // "logical_operator": "OR"
    // }

    if ("logical_operator" in query && "filters" in query) {
        const logical_operator = query.logical_operator.toLowerCase();
        const filters = query.filters;
        return filters.map(kg_results_to_ast).sort().join(` ${logical_operator} `);
    }
    if ("domain" in query && "type" in query && "value" in query && "operation" in query) {
        const domain = query.domain.toLowerCase();
        const type = query.type;
        const value = query.value;
        let operation;
        switch (query.operation.toLowerCase()) { // Enum: ["equal", "notequal", "contains"] See https://github.com/Trustee-Horizon/SSIHE-API
            case "equal":
            case "equals":
                operation = "=";
                break;
            case "notequal":
                operation = "!=";
                break;
            case "contains":
                operation = "≈";
                break;
            case "greater_than":
                operation = ">";
                break;
            case "less_than":
                operation = "<";
                break;

            default:
                operation = query.operation.toLowerCase();
        }
        return `(${domain}.${type} ${operation} '${value}')`;
    }
    return "";
}
export async function do_kg_get_prosumer_data(user: User, w: ProsumerWorkflowData): Promise<[string[]?, string?]> {
    const id_token = user.tokens.id_token;

    const url = new URL(KG_API + "/kg/models/getModels");

    const query = ssi_criteria_to_ast(w.ssi.criteria);
    print("KG: Searching Models in KG:", url.href, "for:", query);
    const response = await fetch(url.href, {
        headers: { "Authorization": `Bearer ${id_token}`, "Accept": "application/json" },
        method: "GET",
    });
    if (response.status / 100 != 2) {
        const error = await response.text();
        print("KG prosumer get models returned error:", error);
        return [undefined, error];
    }
    const tt = new Set<string>();
    const results = await response.json();
    for (const i in results) {
        const res = results[i];
        if ("search_queries" in res) {
            const search_queries = res["search_queries"];
            for (const q in search_queries) {
                const res_query = kg_results_to_ast(search_queries[q].complete_query);
                if (query == res_query) {
                    (res["hasMatchedModel"] || []).forEach((m: string) => tt.add(m));
                }
            }
        }
    }

    return [[...tt], undefined];
}
