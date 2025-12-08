import { BasicSelect, SelectOption, SelectProps } from "@/components/Select.tsx";
import { batch, Signal, useComputed, useSignal, useSignalEffect } from "@preact/signals";
import classNames from "@/utils/classnames.js";
import { ModelSearchResponseItem, ProsumerWorkflowFLData } from "@/utils/types.ts";

export default function ProsumerStep3(props: {
    process_name: string;
    disabled: boolean;
    fl_process?: ProsumerWorkflowFLData;
    global_models: ModelSearchResponseItem[];
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

    const selected_global_model_id = useSignal<number>(0);
    const aggregationRule = useSignal<string>(props.fl_process?.computation ?? "Simple Averaging");
    const num_of_fl_rounds = useSignal<number>(props.fl_process?.number_of_rounds ?? 1);
    const num_of_iterations = useSignal<number>(props.fl_process?.num_of_iterations ?? 1);
    const error_num_of_iterations = useSignal<boolean>(false);
    const solver = useSignal<string>(props.fl_process?.solver ?? "HQS"); //  ["HQS", "ADMM"]
    const denoiser = useSignal<string>(props.fl_process?.denoiser ?? "CNN"); // ["CNN", "Autoencoder", "Transformer"]

    console.log(props);

    const onChangeAggregationRule = (e: Event) => {
        const target = e.target as HTMLInputElement;
        console.log("GOT", target, target.value);
        aggregationRule.value = target.value;
    };

    const onChangeNumOfIterations = (e: Event) => {
        const target = e.currentTarget as HTMLInputElement;
        const value = parseInt(target.value);
        if (0 <= value && value <= 10) {
            num_of_iterations.value = value;
            error_num_of_iterations.value = false;
        } else {
            error_num_of_iterations.value = true;
        }
    };

    const onChangeNumOfFLRounds = (e: Event) => {
        const target = e.currentTarget as HTMLInputElement;
        const value = parseInt(target.value);
        num_of_fl_rounds.value = value;
    };

    const solverOptions: SelectOption[] = ["HQS", "ADMM"].map(
        (d, k) => ({ id: k, name: d, value: d, selected: denoiser.value == d }),
    );

    const denoiserOptions: SelectOption[] = ["CNN", "Autoencoder", "Transformer"].map(
        (d, k) => ({ id: k, name: d, value: d, selected: denoiser.value == d }),
    );

    return (
        <form method="POST" disabled={props.disabled}>
            <p class="">
                <h3>Select Computation and FL Parameters</h3>

                <p>
                    <div class="field middle-align">
                        <nav>
                            <label class="radio">
                                <input
                                    type="radio"
                                    name="computation"
                                    checked={aggregationRule.value == "Simple Averaging"}
                                    value={"Simple Averaging"}
                                    onChange={onChangeAggregationRule}
                                    disabled={props.disabled}
                                />
                                <span>Simple Averaging</span>
                            </label>
                            <label class="radio">
                                <input
                                    type="radio"
                                    name="computation"
                                    checked={aggregationRule.value == "Weighted Averaging"}
                                    value={"Weighted Averaging"}
                                    onChange={onChangeAggregationRule}
                                    disabled={props.disabled}
                                />
                                <span>Weighted Averaging</span>
                            </label>
                            <label class="radio">
                                <input
                                    type="radio"
                                    name="computation"
                                    checked={aggregationRule.value == "Extended Averaging"}
                                    value={"Extended Averaging"}
                                    onChange={onChangeAggregationRule}
                                    disabled={props.disabled}
                                />
                                <span>Extended Averaging</span>
                            </label>
                        </nav>
                    </div>
                    {aggregationRule.value == "Extended Averaging" && (
                        <>
                            <div class="field label suffix border small">
                                <input
                                    type="number"
                                    name="num-of-iterations"
                                    value={num_of_iterations.value}
                                    min={0}
                                    max={10}
                                    onChange={onChangeNumOfIterations}
                                    disabled={props.disabled}
                                />
                                <label>Number of Iterations</label>
                                <i>numbers</i>
                                {error_num_of_iterations.value && (
                                    <span class="error">Number of Iterations should be between 0 and 10</span>
                                )}
                            </div>
                            <BasicSelect
                                options={solverOptions}
                                name="solver"
                                help_text="Select a Solver"
                                label="Solver"
                                onChange={(val: string) => {
                                    solver.value = val;
                                }}
                                disabled={props.disabled}
                            />
                            <BasicSelect
                                options={denoiserOptions}
                                name="denoiser"
                                help_text="Select a Denoiser"
                                label="Denoise"
                                onChange={(val: string) => {
                                    denoiser.value = val;
                                }}
                                disabled={props.disabled}
                            />
                        </>
                    )}
                    <h5>FL Rounds</h5>
                    <div class="field label suffix border small">
                        <input
                            type="number"
                            name="number-of-rounds"
                            value={num_of_fl_rounds.value}
                            onChange={onChangeNumOfFLRounds}
                            disabled={props.disabled}
                        />
                        <label>Number of FL Rounds</label>
                        <i>numbers</i>
                    </div>
                    {props.global_models.length > 0 && (
                        <>
                            <h5>Choose existing Models to initialize the FL process</h5>
                            <div class="grid large-space">
                                <div class="secondary-container padding s12 m6 l3" id="model-random-init">
                                    <label class="radio extra">
                                        <input
                                            type="radio"
                                            name="model"
                                            value="0"
                                            disabled={props.disabled}
                                            checked={true}
                                        />
                                        <span>Random weights initialization</span>
                                    </label>
                                </div>

                                {props.global_models.map((r, index) => (
                                    <div class="secondary-container padding s12 m6 l3" id={`model-${index}`}>
                                        <label class="radio extra">
                                            <input
                                                type="radio"
                                                name="model"
                                                value={r.id}
                                                disabled={props.disabled}
                                                checked={r.id == selected_global_model_id.peek()}
                                            />
                                            <span>Model {r.name ?? ""} (ID: {r.id} - Size: {r.size ?? ""})</span>
                                        </label>
                                        {r.name && <div>Name: {r.name}</div>}
                                        {r.application_type && <div>Application type: {r.application_type}</div>}
                                        {r.round && <div>Rounds: {r.round}</div>}
                                        {r.input && <div>Input: {r.input}</div>}
                                        {r.output && <div>Output: {r.output}</div>}
                                        {r.nn_architecture && <div>Architecture: {r.nn_architecture}</div>}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </p>

                {!props.disabled && (
                    <>
                        <button
                            class="button ripple small-round upper elevate bg-trusteeBtn"
                            type="submit"
                            name="action"
                            value="do_fl"
                        >
                            Start FL
                        </button>
                    </>
                )}
            </p>
        </form>
    );
}
