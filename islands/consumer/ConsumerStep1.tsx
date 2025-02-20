import { Domain, DomainAttr, User } from "@/utils/types.ts";
import { BasicSelect } from "@/components/Select.tsx";
import { batch, useComputed, useSignal } from "@preact/signals";
import { ModelSearchCriterion } from "@/utils/types.ts";
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

function SingleFilter(props: {
    filterValue: FilterValue;
    domain: Domain;
    update_filter: (fv: FilterValue) => void;
    remove_filter: (id: number) => void;
    disabled: boolean;
}) {
    const my_id = props.filterValue.id;
    // console.log("REndering ", my_id);
    const { domain } = props;
    const selectedAttribute = useSignal<DomainAttr>(props.filterValue.attr);
    const textValue = useSignal<string>(props.filterValue.value);

    const onChangeValue = (e: Event) => {
        const target = e.target as HTMLInputElement;
        textValue.value = target.value || "";
        update_filter();
    };

    const update_filter = function () {
        const vf: FilterValue = {
            id: my_id,
            dom: domain,
            attr: selectedAttribute.value,
            valid: true,
            value: textValue.value,
        };
        props.update_filter(vf);
    };
    const onRemove = () => {
        textValue.value = "";
        props.remove_filter(selectedAttribute.value.id);
    };
    const attrs = {
        disabled: props.disabled,
    };
    return (
        <div class="row">
            <div
                style={{ "flex-grow": "1" }}
                class="field label border small"
            >
                <input
                    name={"attr-" + props.filterValue.attr.id}
                    type="text"
                    value={textValue.value}
                    onInput={onChangeValue}
                    {...attrs}
                />
                <label>{selectedAttribute.value.name}</label>
            </div>
            {!!textValue.value && !props.disabled &&
                (
                    <button type="button" class="square bg-trusteeBtn" onClick={onRemove}>
                        <i>close</i>
                    </button>
                )}
        </div>
    );
}

export default function ConsumerStep1(props: {
    domains: Domain[];
    user: User;
    criteria?: ModelSearchCriterion | null;
    disabled: boolean;
}) {
    console.log("STEP1");

    const first = props.criteria?.domain || props.domains[0];
    const saved_values: Map<number, string> = new Map();
    const q = [`domain = ${first.name}`];
    for (const a of (props.criteria?.attributes ?? [])) {
        saved_values.set(a.attribute.id, a.value);
        q.push(`${a.attribute.name} = ${a.value} `);
    }
    console.log("FIRST", first);
    const dom = useSignal<Domain>(first);
    const filters = useSignal<Map<number, string>>(saved_values);
    const query = useSignal<string>(q.join(" and "));

    const saveEnabled = useSignal<boolean>(false);

    const update_filter = function (vf: FilterValue) {
        batch(() => {
            // filters.value = new Map(filters.value);
            filters.value.set(vf.attr.id, vf.value);
            saveEnabled.value = true;
            const q = [`domain = ${dom.value.name}`];
            for (const [k, v] of filters.value.entries()) {
                const a = dom.value.attributes.find((a) => a.id == k)?.name;
                if (a) q.push(`${a} = ${v}`);
            }
            query.value = q.join(" and ");
        });
    };
    const reset = function () {
        batch(() => {
            dom.value = Object.assign({}, dom.value);
            filters.value = new Map();
            saveEnabled.value = false;
            query.value = `domain = ${dom.value.name}`;
        });
    };
    const remove_filter = (attr_id: number) => {
        batch(() => {
            filters.value.delete(attr_id);
            saveEnabled.value = true;
            const q = [`domain = ${dom.value.name}`];
            for (const [k, v] of filters.value.entries()) {
                const a = dom.value.attributes.find((a) => a.id == k)?.name;
                if (a) q.push(`${a} = ${v}`);
            }
            query.value = q.join(" and ");
        });
    };
    const dd = useComputed(() => {
        const fvs = filters.value;
        return dom.value.attributes.map((a) => {
            const vf: FilterValue = {
                id: new_id(),
                dom: dom.value,
                attr: a,
                value: fvs.get(a.id) ?? "",
                valid: false,
            };
            return (
                <SingleFilter
                    key={vf.id}
                    filterValue={vf}
                    domain={dom.value}
                    update_filter={update_filter}
                    remove_filter={remove_filter}
                    disabled={props.disabled ?? false}
                />
            );
        });
    });
    const domainOpts = props.domains.map((d: Domain) => ({
        id: d.id,
        name: d.description,
        value: "" + d.id,
        selected: d.id == dom.value.id,
    }));

    const onDomainChange = function (x: string) {
        console.log("X", x);
        dom.value = props.domains.find((d) => d.id + "" == x) || first;
        const q = [`domain = ${dom.value.name}`];
        for (const [k, v] of filters.value.entries()) {
            const a = dom.value.attributes.find((a) => a.id == k)?.name;
            if (a) q.push(`${a} = ${v}`);
        }
        query.value = q.join(" and ");
        saveEnabled.value = true;
    };

    return (
        <form method="POST" f-client-nav={false}>
            <h6 class="left-align">Domain</h6>
            <BasicSelect
                options={domainOpts}
                name="domain_id"
                help_text="Select a domain"
                label="Domain"
                onChange={onDomainChange}
                disabled={props.disabled}
            />
            <h6 class="left-align">Filters</h6>
            <div class="padding">
                {...dd.value}
            </div>
            <div class="field border label textarea">
                <textarea
                    class="small-text italic"
                    disabled={true}
                    style={{
                        "font-size": ".75rem",
                        "line-height": "normal",
                    }}
                >
                    {query}
                </textarea>
                <label>Generated Query</label>
            </div>
            <div class="right-align top-margin row">
                <a href="/consumer/">
                    <button
                        class="button ripple small-round upper elevate bg-trusteeBtn"
                        type="button"
                    >
                        <i>chevron_left</i>List
                    </button>
                </a>
                <button
                    class="button ripple small-round upper elevate bg-trusteeBtn"
                    type="submit"
                    name="action"
                    value="search"
                >
                    Submit
                </button>
                <button
                    class="button ripple small-round upper elevate bg-trusteeBtn"
                    type="submit"
                    name="action"
                    value="save"
                    disabled={!saveEnabled.value}
                >
                    Save
                </button>
                <button
                    class="button ripple small-round upper elevate bg-trusteeFail"
                    type="button"
                    onClick={reset}
                >
                    Clear
                </button>
            </div>
        </form>
    );
}
