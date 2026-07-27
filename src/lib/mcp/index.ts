import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listPathwaysTool from "./tools/list-pathways";
import listSubjectsTool from "./tools/list-subjects";
import getMyProfileTool from "./tools/get-my-profile";
import getMyResultsTool from "./tools/get-my-results";
import getMyRecommendationsTool from "./tools/get-my-recommendations";
import getMyApplicationsTool from "./tools/get-my-applications";
import listMyInquiriesTool from "./tools/list-my-inquiries";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "cbc-pathway-mcp",
  title: "CBC Pathway Guidance",
  version: "0.1.0",
  instructions:
    "Tools for the CBC Pathway Guidance app. Callers act as the signed-in app user; row-level security enforces per-user access. Use list_pathways and list_subjects for reference data, and the get_my_* tools to read the caller's own results, recommendations, applications, and inquiries.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listPathwaysTool,
    listSubjectsTool,
    getMyProfileTool,
    getMyResultsTool,
    getMyRecommendationsTool,
    getMyApplicationsTool,
    listMyInquiriesTool,
  ],
});
