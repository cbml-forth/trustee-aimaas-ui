import { defineLayout } from "$fresh/server.ts";

export default defineLayout(async (req, ctx) => {
  return (
    <main class="container">
      <ctx.Component />
    </main>
  );
});
