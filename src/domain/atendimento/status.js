export const ATENDIMENTO_STATUS = {
  AGUARDANDO: 'aguardando',
  EM_ATENDIMENTO: 'em_atendimento',
  EXAME_CONCLUIDO: 'exame_concluido',
  FINALIZADO: 'finalizado',
}

export const ATENDIMENTO_STATUS_LIST = Object.values(ATENDIMENTO_STATUS)

export const FILA_FILTERS = {
  TODOS: 'todos',
  AGUARDANDO: 'aguardando',
  EM_ATENDIMENTO: 'em_atendimento',
  SEM_RECEITA: 'sem_receita',
  FINALIZADOS: 'finalizados',
}

export function isAtendimentoStatus(value) {
  return ATENDIMENTO_STATUS_LIST.includes(value)
}
