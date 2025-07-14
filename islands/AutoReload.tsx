import { useEffect } from "preact/hooks";

export default function AutoReload(props: { timeout?: number | undefined; spinner?: boolean }) {
    const timeout = props.timeout || 60000;
    useEffect(() => {
        const interval = setInterval(() => {
            console.log("reloading");
            globalThis.location.reload();
        }, timeout);
        return () => clearInterval(interval);
    });
    const spinner = props.spinner || true;
    return (
        <div class="padding">
            {spinner && <img src={"/img/spinner.gif"} />}
        </div>
    );
}
