import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import StatCard from '../components/StatCard.jsx';
import UsageForm from '../components/UsageForm.jsx';
import UsageTable from '../components/UsageTable.jsx';
import UsageChart from '../components/UsageChart.jsx';
import { useAuth } from '../components/AuthContext.jsx';

const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const { supabase, profile } = useAuth();
  const [summary, setSummary] = useState({
    totalToday: 0,
    totalMonth: 0,
    avgDaily: 0,
    highUsageAlert: false
  });
  const [alertText, setAlertText] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const refreshAll = () => {
    setRefreshKey((k) => k + 1);
  };

  useEffect(() => {
    const fetchSummary = async () => {
      setLoadingSummary(true);
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;

        const res = await axios.get(`${API}/api/usage-summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSummary(res.data);

        if (res.data.highUsageAlert) {
          setAlertText(
            'High water usage detected today compared to your usual average. Consider reducing unnecessary consumption.'
          );
        } else {
          setAlertText('');
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        setLoadingSummary(false);
      }
    };

    fetchSummary();
  }, [supabase, refreshKey]);

  const todayTrend =
    summary.avgDaily > 0 && summary.totalToday > summary.avgDaily
      ? {
          icon: '⚠',
          text: 'Today is above your recent average.'
        }
      : {
          icon: '✅',
          text: 'Today is within your typical range.'
        };

  const monthlyTrend =
    summary.totalMonth > 0
      ? {
          icon: '📅',
          text: 'Monthly total updates as you log new days.'
        }
      : {
          icon: '💡',
          text: 'Start logging usage to see monthly trends.'
        };

  const avgTrend =
    summary.avgDaily > 0
      ? {
          icon: '📊',
          text: 'Average based on days with recorded usage.'
        }
      : {
          icon: '✨',
          text: 'Your baseline will appear once you add logs.'
        };

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
                Water usage dashboard
              </h1>
              <p className="mt-1 text-xs text-sky-200/80">
                Track your daily consumption, spot trends, and stay on top of your
                water habits.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-sky-500/30 bg-slate-950/70 px-3 py-2 text-[11px] text-sky-100/90">
              <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-sky-200">
                {new Date().toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
              <span className="hidden text-sky-300/80 sm:inline">
                Welcome back{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}.
              </span>
            </div>
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total water used today"
              value={summary.totalToday || 0}
              trend={todayTrend}
              accent="from-sky-400 to-blue-500"
            />
            <StatCard
              label="Total usage this month"
              value={summary.totalMonth || 0}
              trend={monthlyTrend}
              accent="from-cyan-400 to-sky-500"
            />
            <StatCard
              label="Average daily usage"
              value={summary.avgDaily || 0}
              trend={avgTrend}
              accent="from-blue-400 to-sky-500"
            />
          </section>

          {loadingSummary && (
            <p className="mt-3 text-xs text-sky-300/80">
              Syncing latest usage data...
            </p>
          )}

          {summary.highUsageAlert && alertText && (
            <div className="mt-5 flex items-start gap-3 rounded-3xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 shadow-glass">
              <span className="mt-0.5 text-base">⚠</span>
              <div>
                <p className="font-semibold uppercase tracking-[0.16em]">
                  High water usage detected today
                </p>
                <p className="mt-1 text-amber-50/90">{alertText}</p>
              </div>
            </div>
          )}

          <section className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <UsageChart refreshSignal={refreshKey} />
            <UsageForm onAdded={refreshAll} />
          </section>

          <section className="mt-6">
            <UsageTable refreshSignal={refreshKey} />
          </section>
        </main>
      </div>
    </div>
  );
}

