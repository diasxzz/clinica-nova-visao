function toneClasses(tone, active) {
  const tones = {
    waiting: active
      ? 'border-amber-300 bg-amber-50 ring-2 ring-amber-200 dark:border-amber-700 dark:bg-amber-950/40 dark:ring-amber-800'
      : 'border-amber-200/80 bg-white hover:bg-amber-50/60 dark:border-amber-900/60 dark:bg-slate-900 dark:hover:bg-amber-950/20',
    active: active
      ? 'border-sky-300 bg-sky-50 ring-2 ring-sky-200 dark:border-sky-700 dark:bg-sky-950/40 dark:ring-sky-800'
      : 'border-sky-200/80 bg-white hover:bg-sky-50/60 dark:border-sky-900/60 dark:bg-slate-900 dark:hover:bg-sky-950/20',
    alert: active
      ? 'border-orange-300 bg-orange-50 ring-2 ring-orange-200 dark:border-orange-700 dark:bg-orange-950/40 dark:ring-orange-800'
      : 'border-orange-200/80 bg-white hover:bg-orange-50/60 dark:border-orange-900/60 dark:bg-slate-900 dark:hover:bg-orange-950/20',
    done: active
      ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-200 dark:border-emerald-700 dark:bg-emerald-950/40 dark:ring-emerald-800'
      : 'border-emerald-200/80 bg-white hover:bg-emerald-50/60 dark:border-emerald-900/60 dark:bg-slate-900 dark:hover:bg-emerald-950/20',
  }

  return tones[tone] ?? tones.waiting
}

function RecepcaoMetricCard({ title, count, subtitle, tone, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-4 py-3 text-left transition-colors ${toneClasses(tone, active)}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </p>
      <p className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">{count}</p>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
    </button>
  )
}

export default RecepcaoMetricCard
