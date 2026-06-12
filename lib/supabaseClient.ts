import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || '';
const rawSupabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) || '';

const supabaseUrl = rawSupabaseUrl.trim();
const supabaseAnonKey = rawSupabaseAnonKey.trim();

const adminEmailCsv =
  ((import.meta.env.VITE_ADMIN_EMAILS as string | undefined) ||
    (import.meta.env.VITE_ADMIN_EMAIL as string | undefined) ||
    '');

export const adminEmails = adminEmailCsv
  .split(',')
  .map((email) => email.toLowerCase().trim())
  .filter(Boolean);

export const adminEmail = adminEmails[0] || '';

const isValidSupabaseUrl = (() => {
  try {
    const url = new URL(supabaseUrl);
    return url.protocol === 'https:' && url.hostname.endsWith('.supabase.co');
  } catch {
    return false;
  }
})();

export const isSupabaseConfigured = Boolean(
  isValidSupabaseUrl && supabaseAnonKey && adminEmails.length > 0
);

function createSafeSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;

  try {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error('Supabase client failed to initialize:', error);
    return null;
  }
}

export const supabase = createSafeSupabaseClient();
