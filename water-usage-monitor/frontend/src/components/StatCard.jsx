export default function StatCard({ label, value, unit = 'L', trend, accent = 'from-sky-400 to-cyan-500' }) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-sky-500/20 bg-slate-900/60 p-[1px] shadow-glass transition hover:border-sky-400/60 hover:shadow-[0_25px_60px_-20px_rgba(56,189,248,0.8)]">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-500/15 via-cyan-400/5 to-blue-900/40 opacity-60 blur-3xl" />
      <div className="relative flex h-full flex-col justify-between rounded-[1.45rem] bg-gradient-to-br from-slate-950/95 via-slate-900/95 to-slate-950/95 px-4 py-4 sm:px-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300/80">
            {label}
          </span>
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-slate-950 shadow-glass`}
          >
            <span className="text-lg">💧</span>
          </div>
        </div>
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-semibold tracking-tight text-sky-50 sm:text-3xl">
            {value.toLocaleString(undefined, { maximumFractionDigits: 1 })}
          </div>
          <span className="text-xs font-medium uppercase tracking-wide text-sky-300/80">
            {unit}
          </span>
        </div>
        {trend && (
          <div className="mt-2 text-[11px] text-sky-300/80">
            {trend.icon && <span className="mr-1">{trend.icon}</span>}
            {trend.text}
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-5 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/60 to-transparent opacity-60" />
      </div>
    </div>
  );
}

