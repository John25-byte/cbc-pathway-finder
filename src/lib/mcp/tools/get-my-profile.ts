import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, notAuthenticated, ok, err } from "../_shared";

export default defineTool({
  name: "get_my_profile",
  title: "Get my profile",
  description: "Get the signed-in user's profile (full name, school, KCPE index) and role.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return notAuthenticated();
    const sb = supabaseForUser(ctx);
    const userId = ctx.getUserId();
    const [profile, role] = await Promise.all([
      sb.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
      sb.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
    ]);
    if (profile.error) return err(profile.error.message);
    return ok({ profile: profile.data, role: role.data?.role ?? null });
  },
});
