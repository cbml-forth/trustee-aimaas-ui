import { defineRoute } from "$fresh/server.ts";
import { get_user, redirect_to_login, SessionRouteContext } from "@/utils/http.ts";

export default defineRoute(async (req: Request, ctx: SessionRouteContext) => {
    const user = await get_user(req, ctx.state.session);
    if (!user) {
        return redirect_to_login(req);
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
