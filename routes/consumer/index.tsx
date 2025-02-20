import WorkflowWelcome from "@/components/WorkflowWelcome.tsx";
import { defineRoute, Handlers, PageProps } from "$fresh/server.ts";
import { get_user, redirect, redirect_to_login, SessionRouteContext, SessionState } from "@/utils/http.ts";
import { decodeTime, ulid } from "jsr:@std/ulid";
import { db_del, list_all } from "@/utils/db.ts";
import { ConsumerWorkflowData, User } from "@/utils/types.ts";
import { consumer_key } from "@/utils/misc.ts";

interface Data {
    headerText: string;
    titleText: string;
    pageURL: string;
    items: { imgURL: string; text: string }[];
    list: ConsumerWorkflowData[];
}
export const handler: Handlers<Data, SessionState> = {
    async POST(req, ctx) {
        const user: User | null = await get_user(req, ctx.state.session);
        const sessionId = user?.session_id;
        if (!sessionId) {
            return redirect_to_login(req);
        }

        const data: FormData = await req.formData();
        const consumer_id = data.get("id")?.toString();
        if (consumer_id && data.get("_method")?.toString() === "DELETE") {
            console.log(data);
            await db_del(consumer_key(user, consumer_id));
        }

        return redirect("/consumer");
    },
    async GET(req, ctx) {
        const user = await get_user(req, ctx.state.session);
        if (!user) {
            return redirect_to_login(req);
        }

        const consumer_id: string = ulid();
        const list = await list_all<ConsumerWorkflowData>(consumer_key(user));
        list.sort((a, b) => a.id > b.id ? -1 : 1);
        const workflowItems = [
            {
                imgURL: "select_filters_workflow.svg",
                text: "Select search filters to find the most suitable among existing AI models",
            },
            {
                imgURL: "select_datasets_workflow.svg",
                text: "View a list of coresponding AI models that match your search criteria",
            },
            {
                imgURL: "fusion_workflow.svg",
                text: "Select from the AI model list the one to be used",
            },
            /*
            {
                imgURL: "safedoc_workflow.svg",
                text: "Perform a Privacy Impact Assessment",
            },
            {
                imgURL: "gdpr_workflow.svg",
                text: "Perform a GDPR compliance check",
            },
            */
            {
                imgURL: "contract_workflow.svg",
                text: "Sign the necessary agreements",
            },
            /* {
              imgURL: "results_workflow.svg",
              text: "Retrieve the requested AI model",
            }, */
            {
                imgURL: "results_workflow.svg",
                text: "Perform Explainability Functions and retrieve Model",
            },
        ];
        const props = {
            headerText: "Search for AI models provided to TRUSTEE, stemming from several past processes",
            titleText: "TRUSTEE Model Consumer Workflow",
            pageURL: `/consumer/${consumer_id}/step1`,
            items: workflowItems,
            list,
        };
        return ctx.render(props);
    },
};

export default function ConsumerIndexPage({ data }: PageProps<Data>) {
    const nextStep = function (w: ConsumerWorkflowData) {
        if (w.agreements_signed != undefined && w.agreements_signed === true) {
            return "step4";
        }
        if (w.selected_model_id != undefined) {
            return "step3";
        }
        if (w.step1_results != undefined) {
            return "step2";
        }
        return "step1";
    };
    const openUrl = function (w: ConsumerWorkflowData) {
        return `/consumer/${w.id}/${nextStep(w)}`;
    };
    const status = function (w: ConsumerWorkflowData) {
        const url = nextStep(w);
        switch (url) {
            case "step1":
                return (
                    <p>
                        You can submit or update search filters
                    </p>
                );
            case "step2":
                return (
                    <p>
                        Model search results available
                    </p>
                );
            case "step3":
                return (
                    <p>
                        You can proceed to sign agreements
                    </p>
                );
            case "step4":
                return (
                    <p>
                        Agreements signed, you can download the model
                    </p>
                );
        }
    };
    const canBeDeleted = function (w: ConsumerWorkflowData): boolean {
        return w.agreements_signed === undefined;
    };
    return (
        <div class="vertical">
            <WorkflowWelcome {...data}></WorkflowWelcome>
            <div class="padding left-align elevate" style={{ "margin-top": "4rem" }}>
                <h5 class="left-align extra-text text-primary">Previous consumer flows: {data.list.length}</h5>
                <ul class="list no-elevate surface-container-lowest">
                    {data.list.map((w, index) => {
                        return (
                            <>
                                {index > 0 && <hr class="padding surface-container-lowest" />}
                                <li class="row transparent">
                                    <i>play_arrow</i>
                                    <div class="max">
                                        <h6 class="small">{w.id}</h6>
                                        <div>{status(w)}</div>
                                    </div>
                                    <label>Created: {new Date(decodeTime(w.id)).toLocaleString()}</label>
                                    <a href={`/consumer/${w.id}/step1`}>
                                        <button className="ripple button bg-trusteeBtn">
                                            Open
                                        </button>
                                    </a>
                                    <a href={openUrl(w)}>
                                        <button className="ripple button bg-trusteeBtn">
                                            Continue<i>chevron_right</i>
                                        </button>
                                    </a>
                                    {canBeDeleted(w) &&
                                        (
                                            <form action={`/consumer`} method="POST">
                                                <input type="hidden" name="id" value={w.id} />
                                                <input type="hidden" name="_method" value="DELETE" />
                                                <button className="ripple button bg-trusteeFail" type="submit">
                                                    <i>delete</i>
                                                </button>
                                            </form>
                                        )}
                                </li>
                            </>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}
