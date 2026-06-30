import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { authClient } from "@/integrations/supabase/auth-client";



type AppRole = "admin" | "examiner" | "student";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  profile: { full_name: string; school: string; kcpe_index: string } | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: AppRole) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<{ full_name: string; school: string; kcpe_index: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    const [roleRes, profileRes] = await Promise.all([
      supabase.from("user_roles").select("role").eq("user_id", userId).single(),
      supabase.from("profiles").select("full_name, school, kcpe_index").eq("user_id", userId).single(),
    ]);
    if (roleRes.data) setRole(roleRes.data.role as AppRole);
    if (profileRes.data) setProfile(profileRes.data);
  };

  useEffect(() => {
    const { data: { subscription } } = authClient.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setTimeout(() => fetchUserData(session.user.id), 0);
      } else {
        setRole(null);
        setProfile(null);
      }
      setLoading(false);
    });

    authClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: AppRole) => {
    try {
      console.debug('[AuthContext] Starting signup for:', email);
      const { error } = await authClient.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role },
          emailRedirectTo: `${window.location.origin}/#/auth`,
        },
      });

      if (error) {
        console.error('[AuthContext] Signup error:', error);
      } else {
        console.debug('[AuthContext] Signup successful');
      }

      return { error };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("[AuthContext] SignUp exception:", {
        message: errorMsg,
        stack: err instanceof Error ? err.stack : undefined,
        email,
      });

      // Provide helpful error messages
      let friendlyMessage = "Sign up failed. Please try again.";
      if (errorMsg.includes("Failed to fetch")) {
        friendlyMessage = "Network error. Please check your connection and try again.";
      } else if (errorMsg.includes("already registered")) {
        friendlyMessage = "This email is already registered.";
      } else if (errorMsg.includes("invalid")) {
        friendlyMessage = "Please check your email and password format.";
      }

      return { error: { message: friendlyMessage, details: errorMsg } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.debug('[AuthContext] Starting signin for:', email);
      const { error } = await authClient.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('[AuthContext] Signin error:', error);
      } else {
        console.debug('[AuthContext] Signin successful');
      }

      return { error };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("[AuthContext] SignIn exception:", {
        message: errorMsg,
        stack: err instanceof Error ? err.stack : undefined,
        email,
      });

      // Provide helpful error messages
      let friendlyMessage = "Sign in failed. Please try again.";
      if (errorMsg.includes("Failed to fetch")) {
        friendlyMessage = "Network error. Please check your connection and try again.";
      } else if (errorMsg.includes("Invalid login")) {
        friendlyMessage = "Invalid email or password.";
      } else if (errorMsg.includes("Network")) {
        friendlyMessage = "Network error. Check your internet connection.";
      }

      return { error: { message: friendlyMessage, details: errorMsg } };
    }
  };

  const signOut = async () => {
    await authClient.auth.signOut();
    setUser(null);
    setSession(null);
    setRole(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, role, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
