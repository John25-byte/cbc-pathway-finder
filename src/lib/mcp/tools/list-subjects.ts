import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseAnon, ok, err } from "./_shared";

export default defineTool({
  name: "list_subjects",
  title: "List subjects",
  description: "List all Grade 9 subjects with their descriptions.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await supabaseAnon().from("subjects").select("*");
    return error ? err(error.message) : ok(data);
  },
});
