import { defineLayout } from "$fresh/server.ts";

export default defineLayout(async (req, ctx) => {
  return <div class="medium middle-align center-align"><ctx.Component /></div>;
});
