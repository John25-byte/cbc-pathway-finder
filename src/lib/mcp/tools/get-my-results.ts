import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, notAuthenticated, ok, err } from "../_shared";

export default defineTool({
  name: "get_my_results",
  title: "Get my results",
  description: "Get the signed-in student's academic results with subject names and scores. Only returns rows visible under row-level security.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const { data, error } = await supabaseForUser(ctx)
      .from("results")
      .select("id, score, verified, subjects(name)")
      .eq("student_id", ctx.getUserId());
    return error ? err(error.message) : ok(data);
  },
});
