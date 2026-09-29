import { matchesFilaFilter, sortFilaAtendimentos } from '../../domain/atendimento/derive.js'
import { FILA_FILTERS } from '../../domain/atendimento/status.js'
import { btnSecondary, pageSubtitle } from '../../uiClasses.js'
import AtendimentoCard from './AtendimentoCard.jsx'

const FILTER_CHIPS = [
  { id: FILA_FILTERS.TODOS, label: 'Todos' },
  { id: FILA_FILTERS.AGUARDANDO, label: 'Aguardando' },
  { id: FILA_FILTERS.EM_ATENDIMENTO, label: 'Em atendimento' },
  { id: FILA_FILTERS.SEM_RECEITA, label: 'Sem receita' },
  { id: FILA_FILTERS.FINALIZADOS, label: 'Finalizados' },
]

function FilaAtendimento({
  atendimentos,
  activeFilter,
  onFilterChange,
  busyId,
  onIniciar,
  onFinalizar,
}) {
  const filtered = sortFilaAtendimentos(
    atendimentos.filter((item) => matchesFilaFilter(item, activeFilter)),
    activeFilter,
  )

  return (
    <section>
      <div className="mb-3 flex flex-wrap gap-2">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            onClick={() => onFilterChange(chip.id)}
            className={
              activeFilter === chip.id
                ? 'rounded-full bg-teal-600 px-3 py-1.5 text-sm font-medium text-white'
                : `${btnSecondary} rounded-full px-3 py-1.5 text-sm`
            }
          >
            {chip.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className={`${pageSubtitle} py-8 text-center`}>
          Nenhum paciente neste filtro hoje.
        </p>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtered.map((atendimento) => (
            <AtendimentoCard
              key={atendimento.id}
              atendimento={atendimento}
              isBusy={busyId === atendimento.id}
              onIniciar={onIniciar}
              onFinalizar={onFinalizar}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default FilaAtendimento
