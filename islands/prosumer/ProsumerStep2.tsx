import { ProsumerWorkflowFLData } from "@/utils/types.ts";
import AutoReload from "@/islands/AutoReload.tsx";

export default function ProsumerStep2(props: {
    ssi_status: string;
    ssi_results: string[];
    process_name: string;
    disabled: boolean;
    models_selected: string[];
}) {
    console.log("STEP2 disabled", props.disabled);
    // const initial_filters = props.criteria
    //     ? (props.criteria.map((c) => {
    //         return {
    //             id: new_id(),
    //             dom: c.domain,
    //             attr: c.attribute,
    //             value: c.value,
    //             valid: true,
    //         };
    //     }))
    //     : test_vf(props.domains);
    // const m: Record<string, FilterValue> = {};
    // initial_filters.forEach((vf) => {
    //     m[vf.id] = vf;
    // });
    // const d = useSignal<Record<string, FilterValue>>(m);
    // const count = useComputed(() => Object.keys(d.value).length);
    // const process_name = useSignal<string>(props.process_name);

    // useSignalEffect(() => {
    //     console.log("Now:", dd.value);
    // });
    // const update_filter = function (vf: FilterValue) {
    //     const new_fv = new_filter_ctor(props.domains[0]);
    //     d.value = { ...d.value, [vf.id]: vf, [new_fv.id]: new_fv };
    // };
    // const remove_filter = function (fid: string) {
    //     delete d.value[fid];
    //     if (Object.keys(d.value).length > 0) {
    //         d.value = { ...d.value };
    //     } else {
    //         const new_fv = new_filter_ctor(props.domains[0]);
    //         d.value = { [new_fv.id]: new_fv };
    //     }
    // };
    // const reset = function () {
    //     const new_fv = new_filter_ctor(props.domains[0]);
    //     d.value = { [new_fv.id]: new_fv };
    // };
    // const dd = useComputed(() =>
    //     Object.values(d.value).map((vf) => {
    //         return (
    //             <SingleFilter
    //                 key={vf.id}
    //                 filterValue={vf}
    //                 filtersCount={count.value}
    //                 domains={props.domains}
    //                 update_filter={update_filter}
    //                 remove_filter={remove_filter}
    //                 disabled={props.disabled ?? false}
    //             />
    //         );
    //     })
    // );

    const ssi_failed: boolean = props.ssi_status == "ERROR";
    const ssi_finished: boolean = props.ssi_status == "FINISHED";

    const models_checked = new Set(
        props.ssi_results.filter((r) => props.models_selected.length == 0 || props.models_selected.includes(r)),
    );

    return (
        <form method="POST" disabled={props.disabled}>
            <p class="">
                <h3>Search for Models - Status: {props.ssi_status}</h3>
                {!ssi_finished && !ssi_failed && <AutoReload timeout={5000} />}

                {ssi_failed && <div class="alert">FAILED!</div>}

                {ssi_finished && props.ssi_results.length == 0 && (
                    <>
                        <div class="alert">No Models Found!</div>

                        <button
                            class="button ripple small-round upper elevate bg-trusteeBtn"
                            type="submit"
                            name="action"
                            value="back"
                        >
                            Previous<i>chevron_left</i>
                        </button>
                    </>
                )}
                {ssi_finished && props.ssi_results.length > 0 && (
                    <>
                        <p>
                            Select from the following Model Providers to construct the FL Group:

                            <div class="field middle-align">
                                <nav>
                                    {props.ssi_results.map((r) => (
                                        <label class="checkbox">
                                            <input
                                                type="checkbox"
                                                checked={models_checked.has(r)}
                                                name={"fl_model:" + r}
                                                disabled={props.disabled}
                                            />
                                            <span>Model {r}</span>
                                        </label>
                                    ))}
                                </nav>
                            </div>
                        </p>

                        {!props.disabled && (
                            <>
                                <button
                                    class="button ripple small-round upper elevate bg-trusteeBtn"
                                    type="submit"
                                    name="action"
                                    value="do_fl"
                                >
                                    Next<i>chevron_right</i>
                                </button>
                            </>
                        )}
                    </>
                )}
            </p>
        </form>
    );
}
