import { FILA_FILTERS } from '../../domain/atendimento/status.js'
import RecepcaoMetricCard from './RecepcaoMetricCard.jsx'

function RecepcaoResumo({ counts, activeFilter, onFilterChange }) {
  const cards = [
    {
      filter: FILA_FILTERS.AGUARDANDO,
      title: 'Aguardando atendimento',
      count: counts.aguardando,
      subtitle: 'Pacientes na fila',
      tone: 'waiting',
    },
    {
      filter: FILA_FILTERS.EM_ATENDIMENTO,
      title: 'Em atendimento',
      count: counts.emAtendimento,
      subtitle: 'Consulta em andamento',
      tone: 'active',
    },
    {
      filter: FILA_FILTERS.SEM_RECEITA,
      title: 'Sem receita',
      count: counts.semReceita,
      subtitle: 'Exame concluído sem receita',
      tone: 'alert',
    },
    {
      filter: FILA_FILTERS.FINALIZADOS,
      title: 'Finalizados',
      count: counts.finalizados,
      subtitle: 'Concluídos hoje',
      tone: 'done',
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <RecepcaoMetricCard
          key={card.filter}
          title={card.title}
          count={card.count}
          subtitle={card.subtitle}
          tone={card.tone}
          active={activeFilter === card.filter}
          onClick={() => onFilterChange(card.filter)}
        />
      ))}
    </div>
  )
}

export default RecepcaoResumo
