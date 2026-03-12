import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSubmitting(true);
      await axios.post('/api/register', { name, email, password });
      setSuccess('Account created. You can now sign in.');

      setTimeout(() => {
        navigate('/login');
      }, 800);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-sky-950 to-slate-950 text-slate-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.25),_transparent_55%),radial-gradient(circle_at_bottom,_rgba(8,47,73,0.9),_transparent_55%)]" />

      <div className="relative z-10 mx-4 flex w-full max-w-5xl flex-col gap-10 md:flex-row md:items-center">
        <div className="mx-auto max-w-md text-center md:mx-0 md:text-left">
          <div className="inline-flex items-center gap-3 rounded-full border border-sky-500/40 bg-slate-900/60 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-sky-200/90 shadow-glass">
            <span className="text-sky-300">🌊</span>
            Stay hydrated, stay aware
          </div>
          <h1 className="mt-5 bg-gradient-to-br from-sky-100 via-cyan-100 to-sky-300 bg-clip-text text-3xl font-semibold tracking-tight text-transparent sm:text-4xl">
            Create your water usage account.
          </h1>
          <p className="mt-3 text-sm text-sky-100/80">
            Track daily usage, monthly trends, and receive gentle alerts when
            your consumption spikes.
          </p>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl border border-sky-500/30 bg-slate-950/80 p-6 shadow-[0_25px_60px_-20px_rgba(8,47,73,0.9)] backdrop-blur-2xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-sky-50">Create account</h2>
              <p className="text-xs text-sky-300/80">
                It only takes a minute to get started.
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-600 text-xl shadow-glass">
              💧
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-xs font-medium text-sky-100">
              Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Alex Rivers"
                className="h-9 rounded-2xl border border-sky-500/30 bg-slate-950/80 px-3 text-xs text-sky-50 shadow-inner outline-none ring-sky-400/60 transition placeholder:text-sky-400/60 focus:border-sky-300 focus:ring-2"
              />
            </label>

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
                minLength={6}
                className="h-9 rounded-2xl border border-sky-500/30 bg-slate-950/80 px-3 text-xs text-sky-50 shadow-inner outline-none ring-sky-400/60 transition placeholder:text-sky-400/60 focus:border-sky-300 focus:ring-2"
              />
            </label>

            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-100">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-100">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950 shadow-glass transition hover:from-sky-300 hover:via-cyan-300 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-center text-[11px] text-sky-300/80">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-semibold text-sky-200 underline-offset-2 hover:text-sky-100 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

