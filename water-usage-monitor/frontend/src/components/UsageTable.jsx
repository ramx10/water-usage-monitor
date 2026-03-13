import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext.jsx';
const API = import.meta.env.VITE_API_URL;

export default function UsageTable({ refreshSignal }) {
  const { supabase } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) {
          setError('Not authenticated. Please log in again.');
          return;
        }

        const res = await axios.get('${API}/api/usage-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRows(res.data || []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        setError(e.response?.data?.error || 'Failed to load usage history.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, refreshSignal]);

  return (
    <div className="rounded-3xl border border-sky-500/20 bg-slate-950/70 p-4 shadow-glass backdrop-blur-xl sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-sky-100">Usage history</h3>
          <p className="text-xs text-sky-300/80">
            Most recent water logs, latest first.
          </p>
        </div>
        <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-sky-300/90">
          {rows.length} records
        </span>
      </div>

      <div className="relative max-h-72 overflow-auto rounded-2xl border border-sky-500/10 bg-slate-950/60">
        {error && (
          <div className="px-4 py-3 text-[11px] text-red-100">
            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-2 py-1">
              {error}
            </span>
          </div>
        )}
        <table className="min-w-full text-left text-[11px]">
          <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-sm">
            <tr className="text-sky-300/80">
              <th className="px-4 py-2 font-medium">Date</th>
              <th className="px-4 py-2 font-medium">Water used (L)</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="2" className="px-4 py-4 text-center text-sky-300/80">
                  Loading history...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="2" className="px-4 py-4 text-center text-sky-300/70">
                  No records yet. Start logging your usage.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-slate-800/80 text-sky-100/90 odd:bg-slate-950/40 even:bg-slate-900/40"
                >
                  <td className="px-4 py-2">
                    {new Date(row.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {Number(row.liters).toLocaleString(undefined, {
                      maximumFractionDigits: 1
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

