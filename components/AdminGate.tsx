import React, { useState } from 'react';
import { Lock, LogIn, LogOut, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';

interface AdminGateProps {
  children: React.ReactNode;
}

export const AdminGate: React.FC<AdminGateProps> = ({ children }) => {
  const { user, loading, configured, isAdmin, adminEmail, adminEmails, signIn, signOut } = useAdminAuth();
  const [email, setEmail] = useState(adminEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error);
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-slate-300">
          Checking commissioner access...
        </div>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="bg-slate-900 border border-amber-700/60 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-amber-400" size={26} />
            <h1 className="text-2xl font-display font-bold text-white">Commissioner login is not configured yet</h1>
          </div>

          <p className="text-slate-300 mb-4">
            Add these GitHub secrets, then redeploy the site:
          </p>

          <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-sm text-slate-200 font-mono space-y-1">
            <div>VITE_SUPABASE_URL</div>
            <div>VITE_SUPABASE_ANON_KEY</div>
            <div>VITE_ADMIN_EMAILS</div>
          </div>

          <p className="text-slate-400 text-sm mt-4">
            Use a comma-separated list for multiple commissioners, like: first@example.com,second@example.com
          </p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div>
        <div className="mx-4 md:mx-6 mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-emerald-200 text-sm">
            <ShieldCheck size={18} />
            <span className="font-semibold">Commissioner Mode Active</span>
            <span className="text-emerald-300/80">Signed in as {user?.email}</span>
          </div>

          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-100 border border-emerald-500/30 text-xs font-semibold"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>

        {children}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-full bg-brand-500/15 border border-brand-500/30 flex items-center justify-center">
            <Lock className="text-brand-500" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-white">Commissioner Login</h1>
            <p className="text-slate-400 text-sm">Control Panel is restricted to approved commissioners.</p>
          </div>
        </div>

        {user && !isAdmin && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {user.email} is signed in, but this account is not approved as commissioner.
          </div>
        )}

        {adminEmails.length > 1 && (
          <div className="mb-4 rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs text-slate-400">
            Approved commissioner accounts: {adminEmails.join(', ')}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              placeholder="commissioner@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              placeholder="Supabase password"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2.5 transition-colors"
          >
            <LogIn size={18} />
            {submitting ? 'Signing in...' : 'Unlock Control Panel'}
          </button>
        </form>
      </div>
    </div>
  );
};
