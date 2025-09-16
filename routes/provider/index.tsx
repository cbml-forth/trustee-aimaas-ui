import WorkflowWelcome from "@/components/WorkflowWelcome.tsx";
import { Handlers, PageProps } from "$fresh/server.ts";
import { get_user, redirect, redirect_to_login, SessionState } from "@/utils/http.ts";
import { decodeTime, ulid } from "jsr:@std/ulid";
import { db_del, list_all } from "@/utils/db.ts";
import { ProviderWorkflowData, User } from "@/utils/types.ts";
import { provider_key } from "@/utils/misc.ts";

interface Data {
    headerText: string;
    titleText: string;
    pageURL: string;
    items: { imgURL: string; text: string }[];
    list: ProviderWorkflowData[];
}

export const handler: Handlers<Data, SessionState> = {
    async POST(req, ctx) {
        const user: User | null = await get_user(req, ctx.state.session);
        const sessionId = user?.session_id;
        if (!sessionId) {
            return redirect_to_login(req);
        }

        const data: FormData = await req.formData();
        const provider_id = data.get("id")?.toString();
        if (provider_id && data.get("_method")?.toString() === "DELETE") {
            console.log(data);
            await db_del(provider_key(user, provider_id));
        }

        return redirect("/provider");
    },
    async GET(req, ctx) {
        const user = await get_user(req, ctx.state.session);
        if (!user) {
            return redirect_to_login(req);
        }

        const provider_id: string = ulid();
        const list = await list_all<ProviderWorkflowData>(provider_key(user));
        list.sort((a, b) => (decodeTime(a.id) > decodeTime(b.id) ? -1 : 1));

        const workflowItems = [
            {
                imgURL: "exam_workflow.svg",
                text: "Provide a description of your Model",
            },
            {
                imgURL: "contract_workflow.svg",
                text: "Create the necessary agreements",
            },
            {
                imgURL: "select_computation_workflow.svg",
                text: "Provide Model to TRUSTEE along with all necessary Files",
            },
        ];

        const props = {
            headerText: "Provide self-developed pre-trained AI Models to TRUSTEE for future use and sharing",
            titleText: "TRUSTEE Model Provider Workflow",
            pageURL: `/provider/${provider_id}/step1`,
            items: workflowItems,
            list,
        };
        return ctx.render(props);
    },
};

export default function ProviderIndexPage({ data }: PageProps<Data>) {
    const nextStep = function (w: ProviderWorkflowData) {
        if (w.agreements_created === true) {
            return "step3";
        }
        if (w.model_id !== undefined) {
            return "step2";
        }
        return "step1";
    };

    const _openUrl = function (w: ProviderWorkflowData) {
        return `/provider/${w.id}`;
    };

    const status = function (w: ProviderWorkflowData) {
        const url = nextStep(w);
        switch (url) {
            case "step1":
                return <p>You can provide your model description</p>;
            case "step2":
                return <p>You can sign the necessary agreements</p>;
            case "step3":
                return <p>You can see the final report for model {w.model_id}</p>;
        }
    };

    const canBeDeleted = function (w: ProviderWorkflowData): boolean {
        return w.agreements_created === true;
    };

    return (
        <div class="vertical">
            <WorkflowWelcome {...data}></WorkflowWelcome>
            <div class="padding left-align elevate" style={{ "margin-top": "4rem" }}>
                <h5 class="left-align extra-text text-primary">
                    Previous provider flows: {data.list.length}
                </h5>
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
                                    <label>
                                        Created: {new Date(decodeTime(w.id)).toLocaleString()}
                                    </label>
                                    <a href={`/provider/${w.id}/step1`}>
                                        <button className="ripple button bg-trusteeBtn">
                                            Open
                                        </button>
                                    </a>
                                    <a href={`/provider/${w.id}/${nextStep(w)}`}>
                                        <button className="ripple button bg-trusteeBtn">
                                            Continue<i>chevron_right</i>
                                        </button>
                                    </a>
                                    {canBeDeleted(w) && (
                                        <form action={`/provider`} method="POST">
                                            <input type="hidden" name="id" value={w.id} />
                                            <input type="hidden" name="_method" value="DELETE" />
                                            <button
                                                className="ripple button bg-trusteeFail"
                                                type="submit"
                                            >
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
