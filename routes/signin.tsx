import { Handlers } from "$fresh/server.ts";
import { type JsonCompatible, Session } from "@5t111111/fresh-session";

interface State {
  session: Session;
}
interface User {
  id: number;
  name: string;
}

export const handler: Handlers<any, State> = {
  async POST(req, ctx) {
    const form = await req.formData();
    const email = form.get("email")?.toString();
    const password = form.get("password")?.toString();

    // Check if the user exists in the database and the password is correct...
    // Let's assume that the type of the user data is { id: number; name: string; }.
    const user: User = { id: 10, name: "John Doe" }; // await authenticate(email, password);

    // Set the user ID in the session.
    const session = ctx.state.session;
    session.set<JsonCompatible<User>>("user", user);
    console.log("Set: ", user, session);

    // Redirect users to profile page.
    return new Response(null, {
      status: 302,
      headers: { Location: "/profile" },
    });
  },
};

export default function SignInPage() {
  return (
    <main>
      <form method="post">
        <input type="email" name="email" value="" placeholder={"Email"} />
        <input
          type="password"
          name="password"
          value=""
          placeholder="Password"
        />
        <button type="submit">Sign in</button>
      </form>
    </main>
  );
}
