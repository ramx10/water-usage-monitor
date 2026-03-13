import { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useAuth } from './AuthContext.jsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export default function UsageChart({ refreshSignal }) {
  const { supabase } = useAuth();
  const [points, setPoints] = useState([]);
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

        const res = await axios.get('/api/usage-graph', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPoints(res.data || []);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        setError(e.response?.data?.error || 'Failed to load usage graph.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase, refreshSignal]);

  const labels = points.map((p) =>
    new Date(p.date).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    })
  );
  const values = points.map((p) => Number(p.liters));

  const data = {
    labels,
    datasets: [
      {
        label: 'Daily water usage (L)',
        data: values,
        borderColor: 'rgba(56, 189, 248, 1)',
        backgroundColor: 'rgba(56, 189, 248, 0.25)',
        pointBackgroundColor: 'rgba(56, 189, 248, 1)',
        pointBorderColor: '#020617',
        pointRadius: 4,
        pointHoverRadius: 5,
        tension: 0.35,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#e0f2fe',
          font: { size: 11 }
        }
      },
      tooltip: {
        backgroundColor: '#020617',
        borderColor: '#0ea5e9',
        borderWidth: 1,
        titleColor: '#e0f2fe',
        bodyColor: '#bae6fd',
        padding: 10,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(15,23,42,0.8)'
        },
        ticks: {
          color: '#7dd3fc',
          font: { size: 10 }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(15,23,42,0.9)'
        },
        ticks: {
          color: '#7dd3fc',
          font: { size: 10 }
        }
      }
    }
  };

  return (
    <div className="flex h-full flex-col rounded-3xl border border-sky-500/20 bg-slate-950/70 p-4 shadow-glass backdrop-blur-xl sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-sky-100">Water usage trend</h3>
          <p className="text-xs text-sky-300/80">
            Visualize your daily water consumption over time.
          </p>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-lg shadow-glass">
          📈
        </div>
      </div>

      <div className="relative mt-1 h-56 sm:h-64">
        {error && (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-xs text-red-100">
            <span className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2">
              {error}
            </span>
          </div>
        )}
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-sky-300/80">
            Loading chart...
          </div>
        ) : error ? null : points.length === 0 ? (
          <div className="flex h-full items-center justify-center text-center text-xs text-sky-300/80">
            Add a few days of logs to see your water usage trend.
          </div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
    </div>
  );
}

