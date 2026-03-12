import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { supabase } from '../components/AuthContext.jsx';

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      const res = await axios.post(`${API}/api/login`, { email, password });

      const { access_token, refresh_token } = res.data;

      await supabase.auth.setSession({
        access_token,
        refresh_token
      });

      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-sky-950 to-slate-950 text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.2),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(8,47,73,0.9),_transparent_55%)]" />

      <div className="relative z-10 mx-4 flex w-full max-w-5xl flex-col gap-10 md:flex-row md:items-center">
        <div className="mx-auto max-w-md text-center md:mx-0 md:text-left">
          <div className="inline-flex items-center gap-3 rounded-full border border-sky-500/40 bg-slate-900/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-sky-200/90 shadow-glass">
            <span className="text-sky-300">💧</span>
            Smart water tracking
          </div>
          <h1 className="mt-5 bg-gradient-to-br from-sky-100 via-cyan-100 to-sky-300 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
            Monitor your daily water usage beautifully.
          </h1>
          <p className="mt-3 text-sm text-sky-100/80">
            AquaPulse helps you stay mindful of your water consumption with a
            calm, ocean-inspired dashboard and smart alerts.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl border border-sky-500/30 bg-slate-950/80 p-6 shadow-[0_25px_60px_-20px_rgba(8,47,73,0.9)] backdrop-blur-2xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-sky-50">Welcome back</h2>
              <p className="text-xs text-sky-300/80">
                Log in to access your water usage dashboard.
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-600 text-xl shadow-glass">
              💦
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-sky-100">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="h-9 rounded-2xl border border-sky-500/30 bg-slate-950/80 px-3 text-xs text-sky-50 shadow-inner outline-none ring-sky-400/60 transition placeholder:text-sky-400/60 focus:border-sky-300 focus:ring-2"
              />
            </label>

            <label className="flex flex-col gap-1 text-xs font-medium text-sky-100">
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-9 rounded-2xl border border-sky-500/30 bg-slate-950/80 px-3 text-xs text-sky-50 shadow-inner outline-none ring-sky-400/60 transition placeholder:text-sky-400/60 focus:border-sky-300 focus:ring-2"
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-glass transition hover:from-sky-300 hover:via-cyan-300 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-sky-300/80">
            New to AquaPulse?{' '}
            <Link
              to="/register"
              className="font-semibold text-sky-200 underline-offset-2 hover:text-sky-100 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

