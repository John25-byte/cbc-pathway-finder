import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, notAuthenticated, ok, err } from "./_shared";

export default defineTool({
  name: "get_my_recommendations",
  title: "Get my pathway recommendations",
  description: "Get the signed-in student's computed pathway recommendations with academic score, interest score, final score, confidence, and explanation.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const { data, error } = await supabaseForUser(ctx)
      .from("recommendations")
      .select("academic_score, interest_score, final_score, confidence, explanation, pathways(name, color)")
      .eq("student_id", ctx.getUserId())
      .order("final_score", { ascending: false });
    return error ? err(error.message) : ok(data);
  },
});
