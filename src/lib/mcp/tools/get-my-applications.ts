import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, notAuthenticated, ok, err } from "../_shared";

export default defineTool({
  name: "get_my_applications",
  title: "Get my pathway applications",
  description: "Get the signed-in student's pathway applications with status, chosen pathway, and any admin notes on adjustments.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const { data, error } = await supabaseForUser(ctx)
      .from("applications")
      .select("id, status, admin_notes, created_at, chosen_pathway:chosen_pathway_id(name), recommended_pathway:recommended_pathway_id(name)")
      .eq("student_id", ctx.getUserId())
      .order("created_at", { ascending: false });
    return error ? err(error.message) : ok(data);
  },
});
