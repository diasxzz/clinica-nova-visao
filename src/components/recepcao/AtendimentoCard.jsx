import { getInServiceMinutes, getWaitMinutes, isSemReceita } from '../../domain/atendimento/derive.js'
import { formatTime, getStatusLabel } from '../../domain/atendimento/labels.js'
import { ATENDIMENTO_STATUS } from '../../domain/atendimento/status.js'
import { btnPrimary, btnSecondary } from '../../uiClasses.js'

function statusBadgeClass(atendimento) {
  if (isSemReceita(atendimento)) {
    return 'bg-orange-100 text-orange-800 dark:bg-orange-950/50 dark:text-orange-200'
  }

  switch (atendimento.status) {
    case ATENDIMENTO_STATUS.AGUARDANDO:
      return 'bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200'
    case ATENDIMENTO_STATUS.EM_ATENDIMENTO:
      return 'bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200'
    case ATENDIMENTO_STATUS.FINALIZADO:
      return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-200'
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
  }
}

function AtendimentoCard({ atendimento, isBusy, onIniciar, onFinalizar }) {
  const patient = atendimento.patient
  const waitMinutes = getWaitMinutes(atendimento)
  const inServiceMinutes = getInServiceMinutes(atendimento)

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900/60">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {patient?.name || 'Paciente'}
          </h3>
          {patient?.phone ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">{patient.phone}</p>
          ) : null}
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(atendimento)}`}
        >
          {getStatusLabel(atendimento)}
        </span>
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Chegou</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-100">
            {formatTime(atendimento.chegadaEm)}
          </dd>
        </div>
        {waitMinutes != null ? (
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Aguardando</dt>
            <dd className="font-medium text-amber-800 dark:text-amber-200">{waitMinutes} min</dd>
          </div>
        ) : null}
        {atendimento.atendimentoIniciadoEm ? (
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Atendimento iniciado</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-100">
              {formatTime(atendimento.atendimentoIniciadoEm)}
            </dd>
          </div>
        ) : null}
        {inServiceMinutes != null ? (
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Em atendimento</dt>
            <dd className="font-medium text-sky-800 dark:text-sky-200">{inServiceMinutes} min</dd>
          </div>
        ) : null}
        {atendimento.exameConcluidoEm ? (
          <div>
            <dt className="text-slate-500 dark:text-slate-400">Exame concluído</dt>
            <dd className="font-medium text-slate-800 dark:text-slate-100">
              {formatTime(atendimento.exameConcluidoEm)}
            </dd>
          </div>
        ) : null}
        <div>
          <dt className="text-slate-500 dark:text-slate-400">Receita</dt>
          <dd className="font-medium text-slate-800 dark:text-slate-100">
            {atendimento.prescriptionId ? 'Emitida' : 'Não emitida'}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-2">
        {atendimento.status === ATENDIMENTO_STATUS.AGUARDANDO ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onIniciar(atendimento)}
            className={`${btnPrimary} px-3 py-1.5 text-sm`}
          >
            Iniciar atendimento
          </button>
        ) : null}
        {isSemReceita(atendimento) ? (
          <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-800 dark:bg-orange-950/40 dark:text-orange-200">
            Aguardando emissão da receita na consulta
          </span>
        ) : null}
        {atendimento.status === ATENDIMENTO_STATUS.EXAME_CONCLUIDO &&
        atendimento.prescriptionId ? (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onFinalizar(atendimento)}
            className={`${btnSecondary} px-3 py-1.5 text-sm`}
          >
            Finalizar atendimento
          </button>
        ) : null}
      </div>
    </article>
  )
}

export default AtendimentoCard
