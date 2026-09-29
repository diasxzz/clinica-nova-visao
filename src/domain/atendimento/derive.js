import { ATENDIMENTO_STATUS, FILA_FILTERS } from './status.js'

export function isSemReceita(atendimento) {
  return (
    atendimento.status === ATENDIMENTO_STATUS.EXAME_CONCLUIDO && !atendimento.prescriptionId
  )
}

export function matchesFilaFilter(atendimento, filter) {
  if (!filter || filter === FILA_FILTERS.TODOS) {
    return true
  }

  if (filter === FILA_FILTERS.AGUARDANDO) {
    return atendimento.status === ATENDIMENTO_STATUS.AGUARDANDO
  }

  if (filter === FILA_FILTERS.EM_ATENDIMENTO) {
    return atendimento.status === ATENDIMENTO_STATUS.EM_ATENDIMENTO
  }

  if (filter === FILA_FILTERS.SEM_RECEITA) {
    return isSemReceita(atendimento)
  }

  if (filter === FILA_FILTERS.FINALIZADOS) {
    return atendimento.status === ATENDIMENTO_STATUS.FINALIZADO
  }

  return true
}

export function countByFilaBucket(atendimentos) {
  return atendimentos.reduce(
    (counts, atendimento) => {
      if (atendimento.status === ATENDIMENTO_STATUS.AGUARDANDO) {
        counts.aguardando += 1
      }

      if (atendimento.status === ATENDIMENTO_STATUS.EM_ATENDIMENTO) {
        counts.emAtendimento += 1
      }

      if (isSemReceita(atendimento)) {
        counts.semReceita += 1
      }

      if (atendimento.status === ATENDIMENTO_STATUS.FINALIZADO) {
        counts.finalizados += 1
      }

      return counts
    },
    { aguardando: 0, emAtendimento: 0, semReceita: 0, finalizados: 0 },
  )
}

function minutesBetween(startValue, now = new Date()) {
  if (!startValue) {
    return null
  }

  const start = new Date(startValue)
  if (Number.isNaN(start.getTime())) {
    return null
  }

  return Math.max(0, Math.floor((now.getTime() - start.getTime()) / 60000))
}

export function getWaitMinutes(atendimento, now = new Date()) {
  if (atendimento.status !== ATENDIMENTO_STATUS.AGUARDANDO) {
    return null
  }

  return minutesBetween(atendimento.chegadaEm, now)
}

export function getInServiceMinutes(atendimento, now = new Date()) {
  if (atendimento.status !== ATENDIMENTO_STATUS.EM_ATENDIMENTO) {
    return null
  }

  return minutesBetween(atendimento.atendimentoIniciadoEm, now)
}

function compareAsc(left, right) {
  if (!left && !right) {
    return 0
  }

  if (!left) {
    return 1
  }

  if (!right) {
    return -1
  }

  return new Date(left).getTime() - new Date(right).getTime()
}

function compareDesc(left, right) {
  return compareAsc(right, left)
}

export function sortFilaAtendimentos(atendimentos, filter) {
  const list = [...atendimentos]

  if (filter === FILA_FILTERS.FINALIZADOS) {
    return list.sort((a, b) => compareDesc(a.finalizadoEm, b.finalizadoEm))
  }

  if (filter === FILA_FILTERS.SEM_RECEITA) {
    return list.sort((a, b) => compareAsc(a.exameConcluidoEm, b.exameConcluidoEm))
  }

  if (filter === FILA_FILTERS.EM_ATENDIMENTO) {
    return list.sort((a, b) =>
      compareAsc(a.atendimentoIniciadoEm, b.atendimentoIniciadoEm),
    )
  }

  if (filter === FILA_FILTERS.AGUARDANDO) {
    return list.sort((a, b) => compareAsc(a.chegadaEm, b.chegadaEm))
  }

  return list.sort((a, b) => {
    const statusOrder = {
      [ATENDIMENTO_STATUS.AGUARDANDO]: 0,
      [ATENDIMENTO_STATUS.EM_ATENDIMENTO]: 1,
      [ATENDIMENTO_STATUS.EXAME_CONCLUIDO]: 2,
      [ATENDIMENTO_STATUS.FINALIZADO]: 3,
    }

    const byStatus = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)
    if (byStatus !== 0) {
      return byStatus
    }

    return compareAsc(a.chegadaEm, b.chegadaEm)
  })
}

export function todayDateString(now = new Date()) {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
