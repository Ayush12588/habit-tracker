"use client";

// ===== AUTH CONTEXT =====
// Wraps the entire app.  Provides `user` and `loading` to every page
// so we never have to call getSession manually in components.

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// Create the context with safe defaults
const AuthContext = createContext({ user: null, loading: true });

// Custom hook – use this in any component to read auth state
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if there's already a session (e.g. page refresh)
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    // 2. Subscribe to future auth changes (login / logout / token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 3. Cleanup on unmount
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}