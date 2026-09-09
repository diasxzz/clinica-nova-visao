import { formatAnamnesisSummary, hasAnamnesisData } from '../anamnesis.js'

function AnamnesisSummary({ anamnesis, title = 'Anamnese optométrica' }) {
  if (!hasAnamnesisData(anamnesis)) {
    return null
  }

  const lines = formatAnamnesisSummary(anamnesis)

  return (
    <div className="mt-3 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-300">
        {title}
      </p>
      <ul className="space-y-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  )
}

export default AnamnesisSummary
