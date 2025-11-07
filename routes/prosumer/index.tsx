import WorkflowWelcome from "@/components/WorkflowWelcome.tsx";
import { defineRoute } from "$fresh/server.ts";
import { get_user, redirect_to_login, SessionRouteContext } from "@/utils/http.ts";
import { list_all } from "@/utils/db.ts";
import { prosumer_key } from "@/utils/misc.ts";
import { ProsumerWorkflowData, ssi_criteria_to_ast, User } from "@/utils/types.ts";
import { decodeTime, ulid } from "jsr:@std/ulid";

export default defineRoute(async (req, ctx: SessionRouteContext) => {
    const user: User | null = await get_user(req, ctx.state.session);
    if (!user) {
        return redirect_to_login(req);
    }
    const list = await list_all<ProsumerWorkflowData>(prosumer_key(user));
    list.sort((a, b) => decodeTime(a.id) > decodeTime(b.id) ? -1 : 1);

    const nextStep = function (w: ProsumerWorkflowData) {
        console.log("ROUTING ", w);
        // if (w.model_downloaded === true) {
        //     return "step5";
        // }
        if (
            w.fl_process != undefined &&
            ["COMPLETED"].includes(w.fl_process.status.status)
        ) {
            return "step5";
        }
        if (
            w.fl_process != undefined &&
            ["NOT STARTED", "STARTED", "IN EXECUTION", "COMPLETED"].includes(w.fl_process.status.status)
        ) {
            return "step4";
        }
        if (w.fl_process != undefined) {
            return "step3";
        }
        if (w.ssi.results != undefined) {
            return "step2";
        }
        return "step1";
    };
    const openUrl = function (w: ProsumerWorkflowData) {
        return `/prosumer/${w.id}`;
    };
    const status = function (w: ProsumerWorkflowData) {
        const url = nextStep(w);
        console.log("next URL for", w.id, "is", url);
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
                        You can select AI models
                    </p>
                );
            case "step3":
                return (
                    <p>
                        You can select FL Computation
                    </p>
                );
            case "step4":
                return (
                    <p>
                        See progress of the FL process
                    </p>
                );
            case "step5":
                return (
                    <p>
                        See results of the FL process
                    </p>
                );
                // case "step5":
                //     return (
                //         <p>
                //             You can run XAI operations locally
                //         </p>
                //     );
        }
    };

    // console.log("PROSUMERS", list);
    const prosumer_id: string = ulid();
    const props = {
        headerText: "Use AI models provided to TRUSTEE, fuse them, and extract results from computations",
        titleText: "TRUSTEE Model Prosumer Workflow",
        pageURL: `/prosumer/${prosumer_id}/step1`,
        items: [
            {
                imgURL: "select_filters_workflow.svg",
                text: "Select search filters to find the most suitable among existing AI models",
            },
            {
                imgURL: "select_datasets_workflow.svg",
                text: "Select from the AI model list the one to be used",
            },
            {
                imgURL: "select_computation_workflow.svg",
                text: "Select the computation to be performed on the selected models",
            },
            {
                imgURL: "fusion_workflow.svg",
                text: "Perform FL Aggregation",
            },
            // {
            //     imgURL: "safedoc_workflow.svg",
            //     text: "Perform a Privacy Impact Assessment",
            // },
            // {
            //     imgURL: "gdpr_workflow.svg",
            //     text: "Perform a GDPR compliance check",
            // },
            // {
            //     imgURL: "contract_workflow.svg",
            //     text: "Sign the necessary agreements",
            // },
            {
                imgURL: "results_workflow.svg",
                text: "View Computation Results",
            },
        ],
    };

    const canBeDeleted = function (w: ProsumerWorkflowData): boolean {
        // return ["COMPLETED"].includes(w.fl_process?.status.status || "-");
        return true;
    };

    return (
        <div class="vertical">
            <WorkflowWelcome {...props}></WorkflowWelcome>
            <div class="padding elevate" style={{ "margin-top": "4rem" }}>
                <h5 class="left-align extra-text text-primary">Previous prosumer flows: {list.length}</h5>
                <ul class="list no-elevate surface-container-lowest">
                    {list.map((w, index) => {
                        return (
                            <>
                                {index > 0 && <hr class="padding surface-container-lowest" />}
                                <li class="row transparent">
                                    <i>play_arrow</i>
                                    <div class="max">
                                        <h6 class="small">{w.id} {w.name != "" && " - " + w.name}</h6>
                                        <div class="small-text">
                                            <div>{ssi_criteria_to_ast(w.ssi.criteria)}</div>
                                            <div>{status(w)}</div>
                                        </div>
                                    </div>
                                    <label>Created: {new Date(decodeTime(w.id)).toLocaleString()}</label>
                                    <a href={`/prosumer/${w.id}/step1`}>
                                        <button className="ripple button bg-trusteeBtn">
                                            Open
                                        </button>
                                    </a>
                                    <a href={`/prosumer/${w.id}/${nextStep(w)}`}>
                                        <button className="ripple button bg-trusteeBtn">
                                            Continue<i>chevron_right</i>
                                        </button>
                                    </a>
                                    {canBeDeleted(w) &&
                                        (
                                            <form action={`/prosumer`} method="POST">
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
});
