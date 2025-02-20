import { Handlers, PageProps } from "$fresh/server.ts";
import { JsonCompatible } from "@5t111111/fresh-session";
import { redirect, SessionState } from "@/utils/http.ts";

interface User {
    id: number;
    name: string;
}

export const handler: Handlers<User, SessionState> = {
    GET(_req, ctx) {
        const session = ctx.state.session;
        const user: User | null = session.get<JsonCompatible<User>>("user");
        console.log("USER: ", user, session);
        // const isAuthenticated = !!user;

        if (!user) {
            return redirect("/signin");
        }
        return ctx.render(user);
    },
};

export default function ProfilePage(props: PageProps<User>) {
    return (
        <main>
            <h1>Profile</h1>
            <p>
                {props.data.name} profile page. You cannot visit this page before logging in.
            </p>
        </main>
    );
}
