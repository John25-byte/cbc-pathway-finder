import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, notAuthenticated, ok, err } from "../_shared";

export default defineTool({
  name: "list_my_inquiries",
  title: "List my inquiries",
  description: "List inquiries the signed-in user is involved in (as sender or recipient), most recent first.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const { data, error } = await supabaseForUser(ctx)
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });
    return error ? err(error.message) : ok(data);
  },
});
