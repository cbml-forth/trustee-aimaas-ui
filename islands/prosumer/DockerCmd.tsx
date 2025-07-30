import { User } from "@/utils/types.ts";

function copyToClibpoard(event, elementId: string) {
    event.preventDefault();
    const ta = document.getElementById(elementId);
    if (!ta) return;
    const text = ta.innerText;
    // navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
    //     if (result.state == "granted" || result.state == "prompt") {
    //         navigator.clipboard.writeText(text);
    //     }
    // });
    // document.execCommand("copy");

    if ("clipboard" in navigator) {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log("Text copied");
            })
            .catch((err) => console.error(err.name, err.message));
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const success = document.execCommand("copy");
            console.log(`Text copy was ${success ? "successful" : "unsuccessful"}.`);
        } catch (err) {
            console.error(err);
        }
        document.body.removeChild(textArea);
    }
}

export default function DockerCmd(props: { dockerCmd: string }) {
    return (
        <div class="padding">
            <textarea
                id="token"
                style={{ "display": "none" }}
            >
                {props.dockerCmd}
            </textarea>

            <button
                type="button"
                onClick={(_e) => copyToClibpoard(_e, "token")}
            >
                Copy Docker command to clipboard
                <i class="small">content_copy</i>
            </button>
        </div>
    );
}
