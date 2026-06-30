// Dedicated Supabase client for AUTH calls only.
// Uses a pristine `fetch` grabbed from a hidden iframe so that preview-environment
// fetch proxies (which break Supabase auth POSTs with "Failed to fetch") are bypassed.
// All non-auth (database, storage) calls should keep using `@/integrations/supabase/client`.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { getNativeFetch } from "./native-fetch";
import { supabase as defaultClient } from "./client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error("[Supabase] Missing environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
}

const nativeFetch = getNativeFetch();

export const authClient = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: "sb-auth-token",
    detectSessionInUrl: true,
  },
  global: {
    fetch: (input, init) => {
      const fetchToUse = nativeFetch || window.fetch;
      return fetchToUse(input as RequestInfo, init).catch((err) => {
        console.error("[Supabase Auth Fetch Error]", err);
        throw err;
      });
    },
  },
});

// Keep the default (data) client's session in sync with the auth client.
authClient.auth.onAuthStateChange(async (_event, session) => {
  try {
    if (session) {
      await defaultClient.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    } else {
      await defaultClient.auth.signOut();
    }
  } catch (error) {
    console.error("[Supabase] Error syncing auth state:", error);
  }
});
