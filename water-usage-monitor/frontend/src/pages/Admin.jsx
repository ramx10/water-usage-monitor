import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import { useAuth } from '../components/AuthContext.jsx';

export default function Admin() {
  const { supabase } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const {
        data: { session }
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const [usersRes, usageRes] = await Promise.all([
        axios.get('/api/admin/users', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/usage', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const usageByUser = new Map();
      (usageRes.data || []).forEach((u) => {
        usageByUser.set(u.user_id, u);
      });

      const combined = (usersRes.data || []).map((u) => {
        const agg = usageByUser.get(u.id);
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          total_liters: agg?.total_liters || 0,
          record_count: agg?.record_count || 0
        };
      });

      setRows(combined);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [supabase]);

  const handleDelete = async (row) => {
    const confirmed = window.confirm(
      `Delete user "${row.name || row.email}" and all their usage records? This cannot be undone.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(row.id);
      const {
        data: { session }
      } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      await axios.delete(`/api/admin/users/${row.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Refresh list
      await fetchData();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const totalLiters = rows.reduce((sum, r) => sum + Number(r.total_liters || 0), 0);
  const totalRecords = rows.reduce((sum, r) => sum + Number(r.record_count || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-sky-950 to-slate-950 text-slate-50">
      <div className="pointer-events-none fixed inset-0 opacity-70">
        <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-[-4rem] h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <main className="mx-auto max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pt-8">
          <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="bg-gradient-to-br from-sky-50 via-cyan-100 to-sky-300 bg-clip-text text-2xl font-semibold tracking-tight text-transparent sm:text-3xl">
                Admin overview
              </h1>
              <p className="mt-1 text-xs text-sky-200/80">
                Monitor users, total water usage, and activity across the platform.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-sky-500/30 bg-slate-950/70 px-3 py-2 text-[11px] text-sky-100/90">
              <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-sky-200">
                Admin
              </span>
              <span className="hidden text-sky-300/80 sm:inline">
                Platform-level usage snapshot.
              </span>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-sky-500/25 bg-slate-950/70 p-4 shadow-glass">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/80">
                  Registered users
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-sm shadow-glass">
                  👥
                </div>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-sky-50">
                {rows.length}
              </div>
            </div>

            <div className="rounded-3xl border border-sky-500/25 bg-slate-950/70 p-4 shadow-glass">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/80">
                  Total water usage
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-sm shadow-glass">
                  💧
                </div>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-sky-50">
                {totalLiters.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                <span className="ml-1 text-xs text-sky-300/80">L</span>
              </div>
            </div>

            <div className="rounded-3xl border border-sky-500/25 bg-slate-950/70 p-4 shadow-glass">
              <div className="flex items-center justify-between gap-2">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/80">
                  Usage records
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-sky-500 text-sm shadow-glass">
                  📊
                </div>
              </div>
              <div className="mt-3 text-2xl font-semibold tracking-tight text-sky-50">
                {totalRecords.toLocaleString()}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-3xl border border-sky-500/20 bg-slate-950/70 p-4 shadow-glass backdrop-blur-xl sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-sky-100">
                  Users & water usage
                </h2>
                <p className="text-xs text-sky-300/80">
                  Per-user aggregation of total usage and record counts.
                </p>
              </div>
              <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-sky-300/90">
                {rows.length} users
              </span>
            </div>

            <div className="relative max-h-[26rem] overflow-auto rounded-2xl border border-sky-500/10 bg-slate-950/60">
              <table className="min-w-full text-left text-[11px]">
                <thead className="sticky top-0 bg-slate-950/90 backdrop-blur-sm">
                  <tr className="text-sky-300/80">
                    <th className="px-4 py-2 font-medium">User name</th>
                    <th className="px-4 py-2 font-medium">Email</th>
                    <th className="px-4 py-2 font-medium">Total water usage (L)</th>
                    <th className="px-4 py-2 font-medium">Number of records</th>
                    <th className="px-4 py-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-4 text-center text-sky-300/80"
                      >
                        Loading admin data...
                      </td>
                    </tr>
                  ) : rows.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-4 py-4 text-center text-sky-300/70"
                      >
                        No users found yet.
                      </td>
                    </tr>
                  ) : (
                    rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-t border-slate-800/80 text-sky-100/90 odd:bg-slate-950/40 even:bg-slate-900/40"
                      >
                        <td className="px-4 py-2">{row.name}</td>
                        <td className="px-4 py-2 text-sky-200/90">{row.email}</td>
                        <td className="px-4 py-2">
                          {Number(row.total_liters).toLocaleString(undefined, {
                            maximumFractionDigits: 1
                          })}
                        </td>
                        <td className="px-4 py-2">{row.record_count}</td>
                        <td className="px-4 py-2 text-right">
                          <button
                            type="button"
                            onClick={() => handleDelete(row)}
                            disabled={deletingId === row.id}
                            className="inline-flex items-center rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-red-100 shadow-sm transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {deletingId === row.id ? 'Deleting…' : 'Delete user'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

