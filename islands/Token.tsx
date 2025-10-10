import { User } from "@/utils/types.ts";

function copyToClibpoard(event, elementId: string) {
    event.preventDefault();
    const ta = document.getElementById(elementId);
    if (!ta) return;
    console.dir(ta);
    const text = ta instanceof HTMLInputElement ? ta.value : ta.innerText;
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

export default function ShowToken(props: { user: User }) {
    const user = props.user;
    const expires_at = new Date(user.tokens.expires_at || 0);
    return (
        <div class="padding">
            <h5>Token for {user.email}</h5>
            <h6>Expires on: {expires_at.toLocaleDateString()} {expires_at.toLocaleTimeString()}</h6>

            <div style="flex: 1; min-width: 300px;">
                <div class="field">
                    <label>User ID</label>
                    <input
                        class="field"
                        readonly
                        disabled
                        id="sub"
                        value={user.id}
                        style="border: none; outline: none; background: #f5f5f5; color: #666; padding: 0.5rem; font-size: 1rem; width: fit-content; min-width: 0;"
                        size={50}
                    />
                </div>
                <button
                    class="button ripple small-round upper elevate bg-trusteeBtn"
                    type="button"
                    onClick={(_e) => copyToClibpoard(_e, "sub")}
                >
                    Copy User ID to clipboard
                </button>
            </div>
            <pre style={{ "margin-top": "4rem", "max-width": "600px", "overflow-wrap": "break-word" }}>
                <code id="token">{user.tokens.id_token}</code>
            </pre>
            <p></p>
            <div class="right-align top-margin row">
                <button
                    class="button ripple small-round upper elevate bg-trusteeBtn"
                    type="button"
                    onClick={(_e) => copyToClibpoard(_e, "token")}
                >
                    Copy Token to clipboard
                </button>
                <a href={"https://jwt.ms/"} target={"_blank"}>
                    <button className="button ripple small-round upper elevate bg-trusteeBtn">
                        Decode it here <i>chevron_right</i>
                    </button>
                </a>
            </div>
        </div>
    );
}
