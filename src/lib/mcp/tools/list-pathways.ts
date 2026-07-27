import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseAnon, ok, err } from "../_shared";

export default defineTool({
  name: "list_pathways",
  title: "List pathways",
  description: "List the CBC senior-school pathways (STEM, Arts & Sports, Social Sciences) with descriptions, careers, and progression.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async () => {
    const { data, error } = await supabaseAnon().from("pathways").select("*");
    return error ? err(error.message) : ok(data);
  },
});
