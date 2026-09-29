import { ATENDIMENTO_STATUS } from './status.js'

const VALID_TRANSITIONS = {
  [ATENDIMENTO_STATUS.AGUARDANDO]: [ATENDIMENTO_STATUS.EM_ATENDIMENTO],
  [ATENDIMENTO_STATUS.EM_ATENDIMENTO]: [ATENDIMENTO_STATUS.EXAME_CONCLUIDO],
  [ATENDIMENTO_STATUS.EXAME_CONCLUIDO]: [ATENDIMENTO_STATUS.FINALIZADO],
  [ATENDIMENTO_STATUS.FINALIZADO]: [],
}

export function canTransition(fromStatus, toStatus) {
  return VALID_TRANSITIONS[fromStatus]?.includes(toStatus) ?? false
}

export function assertTransition(fromStatus, toStatus) {
  if (!canTransition(fromStatus, toStatus)) {
    throw new Error(`Transição inválida: ${fromStatus} → ${toStatus}`)
  }
}

export function buildStatusPatch(fromStatus, toStatus, now = new Date()) {
  assertTransition(fromStatus, toStatus)

  const iso = now.toISOString()
  const patch = { status: toStatus }

  if (toStatus === ATENDIMENTO_STATUS.EM_ATENDIMENTO) {
    patch.atendimento_iniciado_em = iso
  }

  if (toStatus === ATENDIMENTO_STATUS.EXAME_CONCLUIDO) {
    patch.exame_concluido_em = iso
  }

  if (toStatus === ATENDIMENTO_STATUS.FINALIZADO) {
    patch.finalizado_em = iso
  }

  return patch
}
