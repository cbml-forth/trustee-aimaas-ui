/*
<Select />
<article class="blue1 small-round">
  <h5>Title</h5>
  <p>Some text here</p>
                  <div class="field label border invalid" >
                    <input type="text" value=""></input>
                    <label>Application Type</label>
                    <span class="error">Please...</span>
                  </div>
</article>
<button class="fill small-round">SUBMIT SELECTION</button>
<div class="v-col py-6 pl-0 pr-0">
<div
  class="v-card v-theme--trusteeLight v-card--density-default v-card--variant-elevated card"
  style={{ backgroundColor: "rgba(119, 197, 234, 0.1)" }}
>
  <div class="v-card__loader">
    <div
      class="v-progress-linear v-theme--trusteeLight v-locale--is-ltr"
      style={{
        top: "0px",
        height: "0px",
        "--v-progress-linear-height": "2px",
        left: "50%",
        transform: "translateX(-50%)",
      }}
      role="progressbar"
      aria-hidden="true"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="v-progress-linear__background"
        style={{ width: "100%" }}
      ></div>
      <div class="v-progress-linear__indeterminate">
        <div class="v-progress-linear__indeterminate long"></div>
        <div class="v-progress-linear__indeterminate short"></div>
      </div>
    </div>
  </div>

  <div class="v-card-text">
    <div class="v-row d-flex flex-row text-primary align-center">
      <div
        class="v-col-sm-6 v-col-12 d-flex flex-grow-0 py-0 pr-0 justify-center"
        style={{ maxWidth: "40px" }}
      >
        <div
          class="v-responsive v-img"
          style={{ height: "30px", width: "30px" }}
        >
          <div
            class="v-responsive__sizer"
            style={{ paddingBottom: "71.4844%" }}
          ></div>
          <img
            class="v-img__img v-img__img--contain"
            src="/img/used_filters_blue.svg"
          />
        </div>
      </div>
      <div class="v-col-sm-6 v-col-12 d-flex">
        <h3>Model Search Filters</h3>
      </div>
    </div>
  </div>
  <div class="v-card-text">
    <p class="basic-text">
      Provide some search criteria describing the desired model.
    </p>
  </div>
);

*/

import { Handlers, PageProps, RouteContext } from "$fresh/server.ts";
import {
    ConsumerWorkflowData,
    Domain,
    DomainAttr,
    ModelSearchAttributeCriterion,
    ModelSearchCriterion,
    ModelSearchResponseItem,
    User,
} from "@/utils/types.ts";
import { dl_domains, do_dl_model_search } from "@/utils/backend.ts";
import { sessionIdOrSignin } from "@/utils/http.ts";
import { Session } from "@5t111111/fresh-session";

import { db_get, db_store, set_user_session_data, user_session_data } from "@/utils/db.ts";

import { redirect } from "@/utils/http.ts";
import { consumer_key } from "@/utils/misc.ts";

import ConsumerStep1 from "@/islands/consumer/ConsumerStep1.tsx";

const DL_API = Deno.env.get("DL_API_SERVER");
console.log(DL_API);

interface State {
    session: Session;
}

interface Data {
    domains: Domain[];
    user: User;
    disabled: boolean;
    criteria: ModelSearchCriterion;
}

async function user_profile(sessionId: string): Promise<User> {
    const { value } = await user_session_data(sessionId, "user");
    const user: User = value as User;
    return user;
}

async function get_domains(sessionId: string): Promise<Map<number, Domain>> {
    const user: User = await user_profile(sessionId);
    const data = await user_session_data(sessionId, "domains");
    let domains = data.value as Domain[] | null;

    if (!domains) {
        domains = await dl_domains(user.tokens.id_token);
        await set_user_session_data(sessionId, "domains", domains);
    }
    domains = domains.filter((d) => d.attributes);
    // return domains;
    return new Map(domains?.map((d) => [d.id, d]));
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

        const domain_id = parseInt(data.get("domain_id")?.toString() || "");
        const dom: Domain | undefined = domains.get(domain_id);
        if (!dom) {
            console.log("Cannot find domain", data.get("domain_id"));
            return redirect("step1");
        }

        const consumer_id = ctx.params["consumer_id"];

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

        const user: User = await user_profile(sessionId);

        let w = await db_get<ConsumerWorkflowData>(consumer_key(user, consumer_id));
        if (!w) {
            w = {
                id: consumer_id,
                step1_search: crit,
                step1_results: [],
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
        console.log("SESSION:", ctx.state.session.getSessionObject().data);
        const res = await sessionIdOrSignin(req, ctx);
        if (res instanceof Response) {
            return res;
        }
        const sessionId = res as string;
        const domains = await get_domains(sessionId);
        const user: User = await user_profile(sessionId);

        const consumer_id = ctx.params["consumer_id"];
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
        />
    );
}
