import { Domain, DomainAttr, User } from "@/utils/types.ts";
import { BasicSelect, SelectOption, SelectProps } from "@/components/Select.tsx";
import { batch, Signal, useComputed, useSignal, useSignalEffect } from "@preact/signals";
import classNames from "@/utils/classnames.js";
import { assert } from "$std/assert/assert.ts";
import { SSISearchCriterion } from "@/utils/types.ts";
interface FilterValue {
    id: string;
    dom: Domain;
    attr: DomainAttr;
    value: string;
    valid: boolean;
}

function new_id(): string {
    const k = Math.round(Math.random() * 10000);
    return `f${k}`;
}

function new_filter_ctor(dom: Domain): FilterValue {
    return {
        id: new_id(),
        dom: dom,
        attr: dom.attributes[0],
        value: "",
        valid: false,
    };
}
function SingleFilter(props: {
    filterValue: FilterValue;
    filtersCount: number;
    domains: Domain[];
    update_filter: (fv: FilterValue) => void;
    remove_filter: (idf: string) => void;
    disabled: boolean;
}) {
    const my_id = props.filterValue.id;
    // console.log("REndering ", my_id);
    const { domains } = props;
    const selectedDomain = useSignal<Domain>(props.filterValue.dom);
    const selectedAttribute = useSignal<DomainAttr>(props.filterValue.attr);
    const textValue = useSignal<string>(props.filterValue.value);
    const valid = useComputed<boolean>(() => textValue.value != "");
    const only_one = props.filtersCount == 1;
    const error = useSignal<boolean>(false);

    const domainOpts: Signal<SelectOption[]> = useComputed(() =>
        domains.map((d: Domain) => {
            return {
                id: d.id,
                name: d.description,
                value: d.name,
                selected: d.id == selectedDomain.value?.id,
            };
        })
    );
    const attrOpts: Signal<SelectOption[]> = useComputed(() =>
        selectedDomain.value.attributes.map((a: DomainAttr) => {
            return {
                value: a.name,
                selected: a.id == selectedAttribute.value?.id,
                ...a,
            };
        })
    );

    const onChangeDomain = (x: string) => {
        selectedDomain.value = domains.find((d) => d.name == x) || domains[0];
    };
    const onChangeAttribute = (x: string) => {
        const domAttrs = selectedDomain.value.attributes;
        selectedAttribute.value = domAttrs.find((a) => a.name == x) || domAttrs[0];
    };
    const onChangeValue = (e) => {
        batch(() => {
            textValue.value = e.target?.value || "";
            error.value = textValue.value == "";
        });
    };
    useSignalEffect(() => {
        console.log("X", props);
    });
    const domainProps: SelectProps = {
        options: domainOpts.value,
        name: "domain:" + my_id,
        help_text: "Select a domain",
        label: "Domain",
        onChange: onChangeDomain,
    };
    const update_filter = function () {
        const vf: FilterValue = {
            id: my_id,
            dom: selectedDomain.value,
            attr: selectedAttribute.value,
            valid: true,
            value: textValue.value,
        };
        props.update_filter(vf);
    };
    const relations = [{ id: 1, name: "EQUAL" }];
    const onAdd = () => {
        update_filter();
    };
    const onRemove = () => {
        props.remove_filter(my_id);
    };
    const onBlur = function () {
        error.value = textValue.value == "";
    };
    const attrs = {
        disabled: props.disabled,
    };
    return (
        <div id={my_id} class="row wrap center-align padding">
            <BasicSelect {...domainProps} {...attrs} />
            <BasicSelect
                options={attrOpts.value}
                name={"attribute:" + my_id}
                label="Attribute"
                onChange={onChangeAttribute}
                {...attrs}
            />

            <BasicSelect options={relations} name={"rel:" + my_id} {...attrs} />

            <div
                style={{ "flex-grow": "1" }}
                class={classNames({ "field label border small": 1, "invalid": error.value })}
            >
                <input
                    name={"value:" + my_id}
                    type="text"
                    value={textValue.value}
                    onInput={onChangeValue}
                    onBlur={onBlur}
                    {...attrs}
                />
                <label>Value</label>
                {error.value && <span class="error">Please provide a value</span>}
            </div>

            {!only_one && !props.disabled &&
                (
                    <button type="button" class="square bg-trusteeBtn" onClick={onRemove}>
                        <i>close</i>
                    </button>
                )}

            {valid.value && !props.disabled &&
                (
                    <button type="button" class="square bg-trusteeBtn" onClick={onAdd}>
                        <i>add</i>
                    </button>
                )}
        </div>
    );
}

function test_vf(domains: Domain[]): FilterValue[] {
    const auto = domains.find((d) => d.name == "automotive");
    assert(auto, "Not automotive!!???");
    const at_attr = auto.attributes.find((a) => a.name == "application_type");
    assert(at_attr, "Not application_type attr for automotive!!???");
    const name_attr = auto.attributes.find((a) => a.name == "name");
    assert(name_attr, "Not name attr for automotive!!???");
    const vf1: FilterValue = {
        id: new_id(),
        dom: auto,
        attr: name_attr,
        value: "automotive1_superresolution",
        valid: true,
    };
    const vf2: FilterValue = {
        id: new_id(),
        dom: auto,
        attr: at_attr,
        value: "superresolution",
        valid: true,
    };

    return [vf1, vf2];
}
export default function ProsumerStep1(props: {
    domains: Domain[];
    user: User;
    criteria: SSISearchCriterion[];
    process_name: string;
    disabled: boolean;
}) {
    console.log("STEP1");
    // const first = new_filter_ctor(props.domains[0]);
    // const d = useSignal<Record<string, FilterValue>>({ [first.id]: first });
    const initial_filters = props.criteria
        ? (props.criteria.map((c) => {
            return {
                id: new_id(),
                dom: c.domain,
                attr: c.attribute,
                value: c.value,
                valid: true,
            };
        }))
        : test_vf(props.domains);
    const m: Record<string, FilterValue> = {};
    initial_filters.forEach((vf) => {
        m[vf.id] = vf;
    });
    const d = useSignal<Record<string, FilterValue>>(m);
    const count = useComputed(() => Object.keys(d.value).length);
    const process_name = useSignal<string>(props.process_name);

    useSignalEffect(() => {
        console.log("Now:", dd.value);
    });
    const update_filter = function (vf: FilterValue) {
        const new_fv = new_filter_ctor(props.domains[0]);
        d.value = { ...d.value, [vf.id]: vf, [new_fv.id]: new_fv };
    };
    const remove_filter = function (fid: string) {
        delete d.value[fid];
        if (Object.keys(d.value).length > 0) {
            d.value = { ...d.value };
        } else {
            const new_fv = new_filter_ctor(props.domains[0]);
            d.value = { [new_fv.id]: new_fv };
        }
    };
    const reset = function () {
        const new_fv = new_filter_ctor(props.domains[0]);
        d.value = { [new_fv.id]: new_fv };
    };
    const dd = useComputed(() =>
        Object.values(d.value).map((vf) => {
            return (
                <SingleFilter
                    key={vf.id}
                    filterValue={vf}
                    filtersCount={count.value}
                    domains={props.domains}
                    update_filter={update_filter}
                    remove_filter={remove_filter}
                    disabled={props.disabled ?? false}
                />
            );
        })
    );
    return (
        <form method="POST">
            <div class="field label large">
                <input
                    name="process_name"
                    type="text"
                    value={process_name}
                    onChange={(e) => {
                        const target = e.currentTarget as HTMLInputElement;
                        process_name.value = target.value;
                    }}
                />
                <label>Process name</label>
            </div>
            <div class="padding">
                {...dd.value}
            </div>
            <div class="right-align">
                <button
                    class="button small-round upper elevate bg-trusteeBtn"
                    type="submit"
                    name="action"
                    value="search"
                >
                    Submit
                </button>
                <button class="button small-round upper elevate bg-trusteeBtn" type="submit" name="action" value="save">
                    Save
                </button>
                <button class="button small-round upper elevate bg-trusteeFail" type="button" onClick={reset}>
                    Clear
                </button>
            </div>
        </form>
    );
}
