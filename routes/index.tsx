import { defineRoute, RouteContext } from "$fresh/server.ts";
import { Session } from "@5t111111/fresh-session";
import { sessionIdOrSignin } from "@/utils/http.ts";

interface State {
    session: Session;
}

export default defineRoute(async (req: Request, ctx: RouteContext<void, State>) => {
    const res = await sessionIdOrSignin(req, ctx);
    if (res instanceof Response) {
        return res;
    }
    return (
        <div className="page active middle-align center-align vertical">
            <h4
                class="auto-margin text-primary bold"
                style={{ "text-align": "center" }}
            >
                TRUSTEE uses state-of-the-art solutions and Homomorphic Encryption to securely provide to its users the
                opportunity to use ai-models from federated sources
            </h4>
            <h5>AIMaaS</h5>
            <div className="middle-align center-align horizontal wrap">
                <a href="/prosumer" class="tiny-padding">
                    <article class="btn-card">
                        <img class=" small" src="/img/artificial_intelligence.svg" />
                        <div class="padding">
                            <h6 class="large-text">Model Prosumer</h6>
                        </div>
                    </article>
                </a>
                <a href="/provider" class="tiny-padding">
                    <article class="btn-card">
                        <img class="small" src="/img/artificial_intelligence.svg" />
                        <div class="padding">
                            <h6 class="large-text">Model Provider</h6>
                        </div>
                    </article>
                </a>
                <a href="/consumer" class="tiny-padding">
                    <article class="btn-card">
                        <img class=" small" src="/img/use_data_blue.svg" />
                        <div class="padding">
                            <h6 class="large-text">Model Consumer</h6>
                        </div>
                    </article>
                </a>
            </div>
        </div>
    );
});
