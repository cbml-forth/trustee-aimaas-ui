// import { PageProps } from "$fresh/server.ts";
// import { ConsumerState } from "@/utils/types.ts";
// import classNames from "@/utils/classnames.js";

// export default function ConsumerLayout(props: PageProps<ConsumerState>) {
//     const a = props.data?.maxStepProgress || 0;

//     const stepperData = [
//         {
//             itemText: "Select Search Filters",
//             itemImg: "/img/search_white.svg",
//             url: "/consumer/step1",
//             canGo: a >= 0,
//         },
//         {
//             itemText: "Select Models",
//             itemImg: "/img/artificial_intelligence_selected.svg",
//             url: "/consumer/step2",
//             canGo: a >= 1,
//         },
//         {
//             itemText: "Sign Agreements",
//             itemImg: "/img/document_white.svg",
//             url: "/consumer/step3",
//             canGo: a >= 2,
//         },
//         //     {
//         //       itemText: "Run xAI Functions",
//         //       itemImg: "computation2_white.svg",
//         //       url: "/consumer/step4",
//         //     },
//     ];

//     const activePage = props.url.pathname;
//     const currentStepIndex = stepperData.findIndex((item) => item.url == activePage);
//     const lastStepIndex = stepperData.length - 1;
//     const isFirstStep = currentStepIndex == 0;
//     const isLastStep = currentStepIndex == lastStepIndex;
//     const backUrl = !isFirstStep ? stepperData[currentStepIndex - 1].url : null;
//     const nextUrl = !isLastStep ? stepperData[currentStepIndex + 1].url : null;
//     //
//     //  "v-stepper-item--selected": props.isActive,
//     const mkStepper = (
//         props: { itemText: string; itemImg: string; url: string; canGo: boolean },
//         index: number,
//     ) => {
//         const isActive = index == currentStepIndex;

//         return (
//             <>
//                 <a href={props.url}>
//                     <button
//                         class={classNames("mn-button-tranparent v-stepper-item", {
//                             "v-stepper-item--selected": isActive,
//                         })}
//                         disabled={false}
//                     >
//                         <div
//                             className="v-avatar v-theme--trusteeLight v-avatar--density-default v-avatar--variant-flat v-stepper-item__avatar"
//                             style={{ width: "24px", height: "24px" }}
//                         >
//                             <img width="15" src={props.itemImg} alt={props.itemImg} />
//                             <span className="v-avatar__underlay"></span>
//                         </div>
//                         <div className="v-stepper-item__content">
//                             <div className="v-stepper-item__title mn-hide-icon-label">
//                                 {props.itemText}
//                             </div>
//                         </div>
//                     </button>
//                 </a>
//                 {index !== lastStepIndex && (
//                     <hr
//                         className="v-divider v-theme--trusteeLight mt-13"
//                         aria-orientation="horizontal"
//                         role="separator"
//                     />
//                 )}
//             </>
//         );
//     };

//     return (
//         <div className="v-container v-locale--is-ltr fill-height justify-center">
//             <div
//                 className="v-container v-locale--is-ltr d-flex flex-column justify-center fill-height px-0"
//                 style={{ maxWidth: "1500px" }}
//             >
//                 <div className="v-row d-flex justify-center" style={{ width: "100%" }}>
//                     <div className="v-col pa-0">
//                         <div
//                             id="invisibleMultiFormContainer"
//                             className="v-theme--trusteeLight v-stepper v-stepper--alt-labels fill-height"
//                         >
//                             <div className="v-stepper-header">
//                                 {stepperData.map(mkStepper)}
//                             </div>

//                             <props.Component />

//                             <div className="v-container v-locale--is-ltr pt-0 pr-0 pl-0">
//                                 <div className="v-row d-flex justify-space-between">
//                                     {/* back */}
//                                     <div
//                                         className="v-col d-flex justify-start"
//                                         style={{ visibility: isFirstStep ? "hidden" : "visible" }}
//                                     >
//                                         {backUrl && (
//                                             <a href={backUrl}>
//                                                 <button
//                                                     type="button"
//                                                     //onClick={back}
//                                                     className="v-btn v-btn--elevated v-theme--trusteeLight bg-trusteeBtn v-btn--density-default v-btn--size-default v-btn--variant-elevated"
//                                                 >
//                                                     <span className="v-btn__overlay"></span>
//                                                     <span className="v-btn__underlay"></span>
//                                                     <span className="v-btn__content" data-no-activator="">
//                                                         <img
//                                                             style={{ width: "15px" }}
//                                                             src="/img/arrow_left_black.svg"
//                                                             alt=""
//                                                         />
//                                                         BACK{" "}
//                                                     </span>
//                                                 </button>
//                                             </a>
//                                         )}
//                                     </div>
//                                     {/* next */}

//                                     <div className="v-col d-flex justify-end">
//                                         {/* For debug purposes */}
//                                         {nextUrl && (
//                                             <button
//                                                 /* type="button" */
//                                                 type="button"
//                                                 form="ml-provider-form"
//                                                 className="v-btn v-btn--elevated v-theme--trusteeLight bg-trusteeBtn v-btn--density-default v-btn--size-default v-btn--variant-elevated mr-3"
//                                             >
//                                                 <span className="v-btn__overlay"></span>
//                                                 <span className="v-btn__underlay"></span>
//                                                 <span className="v-btn__content" data-no-activator="">
//                                                     PRINT
//                                                 </span>
//                                             </button>
//                                         )}
//                                         {currentStepIndex === 0 && (
//                                             <button
//                                                 type="reset"
//                                                 form="ml-consumer-form"
//                                                 className="v-btn v-btn--elevated v-theme--trusteeLight bg-trusteeFail v-btn--density-default v-btn--size-default v-btn--variant-elevated mb-3 mr-3"
//                                             >
//                                                 <span className="v-btn__overlay"></span>
//                                                 <span className="v-btn__underlay"></span>
//                                                 <span className="v-btn__content" data-no-activator="">
//                                                     Clear All
//                                                 </span>
//                                             </button>
//                                         )}
//                                         {/* v-btn--disabled */}
//                                         <button
//                                             type={currentStepIndex === 0 || currentStepIndex === 1
//                                                 ? "submit"
//                                                 : "button"}
//                                             form={currentStepIndex === 0
//                                                 ? "ml-consumer-form"
//                                                 : "ml-consumer-select-model-form"}
//                                             className={currentStepIndex === 1
//                                                 ? "v-btn v-btn--elevated v-theme--trusteeLight bg-trusteeBtn v-btn--density-default v-btn--size-default v-btn--variant-elevated mb-3 mrv-btn--disabled"
//                                                 : "v-btn v-btn--elevated v-theme--trusteeLight bg-trusteeBtn v-btn--density-default v-btn--size-default v-btn--variant-elevated mb-3"}
//                                         >
//                                             <span className="v-btn__overlay"></span>
//                                             <span className="v-btn__underlay"></span>
//                                             <span className="v-btn__content" data-no-activator="">
//                                                 {currentStepIndex === 0 ? "Submit" : isLastStep ? "Finish" : "Next"}
//                                                 {currentStepIndex !== 0 && !isLastStep && (
//                                                     <img
//                                                         style={{ width: "15px" }}
//                                                         src="/img/arrow_right_black.svg"
//                                                         alt=""
//                                                     />
//                                                 )}
//                                             </span>
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

import { defineLayout } from "$fresh/server.ts";
import { get_user, redirect, redirect_to_login, SessionRouteContext } from "@/utils/http.ts";
import { db_get } from "@/utils/db.ts";
import { ConsumerWorkflowData, User } from "@/utils/types.ts";
import { consumer_key } from "@/utils/misc.ts";
import classNames from "@/utils/classnames.js";

export default defineLayout(async (req, ctx: SessionRouteContext) => {
    const consumer_id = ctx.params["consumer_id"];
    const user: User | null = await get_user(req, ctx.state.session);
    if (!user) {
        return redirect_to_login(req);
    }

    const w = await db_get<ConsumerWorkflowData>(consumer_key(user, consumer_id));
    const paths = new URL(req.url).pathname.split("/");
    const step = paths[paths.length - 1];

    const step2_enabled = w?.step1_results != undefined;
    const step3_enabled = step2_enabled && w?.selected_model_id != undefined;
    const step4_enabled = step3_enabled && !!w.agreements_signed;
    const step5_enabled = step4_enabled && !!w.model_downloaded;

    const access_control: Map<string, boolean> = new Map([
        ["step1", true],
        ["step2", step2_enabled],
        ["step3", step3_enabled],
        ["step4", step4_enabled],
        ["step5", step5_enabled],
    ]);
    const hrefs: Map<string, string> = new Map(
        access_control.entries().map(([s, e]) => [
            s,
            e ? s : "",
        ]),
    );

    if (!access_control.get(step)) {
        return redirect("/consumer");
    }
    return (
        <div class="large-padding">
            <nav class="large-padding wrap">
                <a class="center-align vertical" href={hrefs.get("step1")}>
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step1",
                        })}
                        src="/img/used_filters_blue.svg"
                    />
                    <div class="small-margin small-text">Model Search Filters</div>
                </a>
                <hr class="max" />
                <a
                    href={hrefs.get("step2")}
                    class={classNames({
                        // "wf-disabled": step2_enabled,
                        "center-align vertical": 1,
                    })}
                >
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step2",
                        })}
                        src="/img/my_results_blue.svg"
                    />
                    <div class="small-margin small-text">Search results</div>
                </a>
                <hr class="max" />
                <a
                    class={classNames({
                        // "wf-disabled": step3_enabled,
                        "center-align vertical": 1,
                    })}
                    href={hrefs.get("step3")}
                >
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step3",
                        })}
                        src="/img/my_agreements_blue.svg"
                    />
                    <div class="small-margin small-text">Sign agreements</div>
                </a>
                <hr class="max" />
                <a
                    class={classNames({
                        // "wf-disabled": step4_enabled,
                        "center-align vertical": 1,
                    })}
                    href={hrefs.get("step4")}
                >
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step4",
                        })}
                        src="/img/use_data_blue.svg"
                    />
                    <div class="small-margin small-text">Access Model</div>
                </a>
                <hr class="max" />
                <a
                    class={classNames({
                        // "wf-disabled": step4_enabled,
                        "center-align vertical": 1,
                    })}
                    href={hrefs.get("step5")}
                >
                    <img
                        class={classNames({
                            "circle medium border small-padding": 1,
                            "secondary": step == "step5",
                        })}
                        src="/img/results_workflow.svg"
                    />
                    <div class="small-margin small-text">Perform XAI locally</div>
                </a>
            </nav>
            <ctx.Component />
        </div>
    );
});
