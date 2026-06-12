import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const adminEmailCsv =
  ((import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ||
    (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ||
    '');

export const adminEmails = adminEmailCsv
  .split(',')
  .map((email) => email.toLowerCase().trim())
  .filter(Boolean);

export const adminEmail = adminEmails[0] || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && adminEmails.length > 0
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
