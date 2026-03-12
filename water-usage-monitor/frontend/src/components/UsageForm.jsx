import { useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';

const API = import.meta.env.VITE_API_URL;

export default function UsageForm({ onAdded }) {
  const { supabase } = useAuth();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [liters, setLiters] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const value = parseFloat(liters);
    if (Number.isNaN(value) || value <= 0) {
      setError('Please enter a positive number of liters.');
      return;
    }

    try {
      setSubmitting(true);
      const {
        data: { session }
      } = await supabase.auth.getSession();

      const token = session?.access_token;
      if (!token) {
        setError('You are not logged in.');
        return;
      }

      await axios.post(
        `${API}/api/add-usage`,
        { date, liters: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLiters('');
      if (onAdded) onAdded();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add usage.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-3xl border border-sky-500/25 bg-slate-900/70 p-4 shadow-glass backdrop-blur-xl sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-sky-100">Log water usage</h3>
          <p className="text-xs text-sky-300/80">
            Track your daily water intake to stay aware.
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-xl shadow-glass">
          💦
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-medium text-sky-100">
          Date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9 rounded-2xl border border-sky-500/30 bg-slate-950/80 px-3 text-xs text-sky-50 shadow-inner outline-none ring-sky-400/60 transition placeholder:text-sky-400/60 focus:border-sky-300 focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-sky-100">
          Water usage (Liters)
          <div className="flex items-center gap-2 rounded-2xl border border-sky-500/30 bg-slate-950/80 px-3 shadow-inner ring-sky-400/60 focus-within:border-sky-300 focus-within:ring-2">
            <input
              type="number"
              min="0"
              step="0.1"
              value={liters}
              onChange={(e) => setLiters(e.target.value)}
              placeholder="0.0"
              className="h-9 w-full bg-transparent text-xs text-sky-50 outline-none placeholder:text-sky-400/60"
            />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-sky-300/80">
              L
            </span>
          </div>
        </label>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-100">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-600 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-slate-950 shadow-glass transition hover:from-sky-300 hover:via-cyan-300 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving...' : 'Add usage'}
        </button>
      </div>
    </form>
  );
}

