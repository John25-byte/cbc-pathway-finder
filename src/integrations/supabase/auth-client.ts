// Dedicated Supabase client for AUTH calls only.
// Handles both localhost and preview environment fetch issues.
// All non-auth (database, storage) calls should keep using `@/integrations/supabase/client`.

import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import { getNativeFetch } from "./native-fetch";
import { supabase as defaultClient } from "./client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

// Validate environment variables at startup
if (!SUPABASE_URL) {
  console.error("[Supabase Auth] VITE_SUPABASE_URL is not set");
}
if (!SUPABASE_PUBLISHABLE_KEY) {
  console.error("[Supabase Auth] VITE_SUPABASE_PUBLISHABLE_KEY is not set");
}

console.debug('[Supabase Auth] Initializing with URL:', SUPABASE_URL?.replace(/(.{10}).*/, '$1...'));

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
      const request = typeof input === 'string' ? input : input instanceof URL ? input.toString() : (input as any).url;

      return nativeFetch(input as RequestInfo, init)
        .then(response => {
          if (!response.ok) {
            console.warn('[Supabase Auth] Request returned non-ok status', {
              url: request,
              status: response.status,
              statusText: response.statusText
            });
          }
          return response;
        })
        .catch(err => {
          console.error('[Supabase Auth] Fetch failed', {
            url: request,
            error: err instanceof Error ? err.message : String(err),
            stack: err instanceof Error ? err.stack : undefined
          });
          throw err;
        });
    },
  },
});

// Keep the default (data) client's session in sync with the auth client.
authClient.auth.onAuthStateChange(async (_event, session) => {
  try {
    if (session) {
      console.debug('[Supabase Auth] Session established');
      await defaultClient.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
    } else {
      console.debug('[Supabase Auth] Session cleared');
      await defaultClient.auth.signOut();
    }
  } catch (error) {
    console.error("[Supabase Auth] Error syncing auth state:", error);
  }
});
