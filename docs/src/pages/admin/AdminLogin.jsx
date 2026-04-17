import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, LockKeyhole } from 'lucide-react';

import { useAuth } from '@/lib/AuthContext';

const normalizeNextPath = (rawNext) => {
  if (!rawNext || typeof rawNext !== 'string') return '/admin';
  if (!rawNext.startsWith('/')) return '/admin';
  return rawNext;
};

export default function AdminLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = useMemo(() => normalizeNextPath(searchParams.get('next')), [searchParams]);
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to={nextPath} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(nextPath, { replace: true });
    } catch (authError) {
      setError(authError?.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-md bg-card border border-border rounded-xl p-8">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto mb-4">
            <LockKeyhole size={20} />
          </div>
          <h1 className="font-inter font-black text-2xl">Admin Login</h1>
          <p className="font-mono text-xs text-muted-foreground mt-2">_SECURE_ACCESS_PORTAL</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-mono text-[10px] tracking-widest text-primary mb-2">EMAIL</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
              placeholder="admin@gavellintelligence.local"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] tracking-widest text-primary mb-2">PASSWORD</label>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-3 py-2 bg-secondary border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
              placeholder="Enter admin password"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 border border-primary text-primary font-inter font-bold text-sm tracking-wider rounded hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                SIGNING IN...
              </>
            ) : (
              'SIGN IN'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
