import { isSemReceita } from './derive.js'
import { ATENDIMENTO_STATUS } from './status.js'

export function getStatusLabel(atendimento) {
  if (isSemReceita(atendimento)) {
    return 'Sem receita'
  }

  switch (atendimento.status) {
    case ATENDIMENTO_STATUS.AGUARDANDO:
      return 'Aguardando atendimento'
    case ATENDIMENTO_STATUS.EM_ATENDIMENTO:
      return 'Em atendimento'
    case ATENDIMENTO_STATUS.EXAME_CONCLUIDO:
      return 'Exame concluído'
    case ATENDIMENTO_STATUS.FINALIZADO:
      return 'Finalizado'
    default:
      return atendimento.status
  }
}

export function formatTime(value) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
