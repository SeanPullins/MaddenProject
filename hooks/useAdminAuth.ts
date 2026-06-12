import { useEffect, useMemo, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { adminEmail, isSupabaseConfigured, supabase } from '../lib/supabaseClient';

interface AdminAuthState {
  user: User | null;
  loading: boolean;
  configured: boolean;
  isAdmin: boolean;
  adminEmail: string;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

export function useAdminAuth(): AdminAuthState {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const isAdmin = useMemo(() => {
    if (!user?.email || !adminEmail) return false;
    return user.email.toLowerCase().trim() === adminEmail;
  }, [user]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase is not configured yet.' };

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) return { error: error.message };
    return {};
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
  };

  return {
    user,
    loading,
    configured: isSupabaseConfigured,
    isAdmin,
    adminEmail,
    signIn,
    signOut,
  };
}
