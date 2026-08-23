import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [sessionUser, setSessionUser] = useState(undefined); 
  const [loading, setLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);

  useEffect(() => {
    // Intercept URL hashes from Invite or Password Reset emails
    const hash = window.location.hash;
    if (hash && (hash.includes('type=recovery') || hash.includes('type=invite'))) {
      setRecoveryMode(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSessionUser(session?.user ?? null);
        if (event === 'PASSWORD_RECOVERY') {
          setRecoveryMode(true);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updatePassword = async (password) => {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (!error) {
      setRecoveryMode(false);
      window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
    }
    return { data, error };
  };

  const effectiveUser = recoveryMode ? null : sessionUser;

  return (
    <AuthContext.Provider value={{ 
      user: effectiveUser, 
      loading, 
      signIn, 
      signUp,
      signOut, 
      recoveryMode, 
      updatePassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
