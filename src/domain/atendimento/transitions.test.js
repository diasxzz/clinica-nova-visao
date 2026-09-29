import { describe, expect, it } from 'vitest'
import { ATENDIMENTO_STATUS } from './status.js'
import { assertTransition, buildStatusPatch, canTransition } from './transitions.js'

describe('atendimento transitions', () => {
  it('allows valid status transitions', () => {
    expect(canTransition(ATENDIMENTO_STATUS.AGUARDANDO, ATENDIMENTO_STATUS.EM_ATENDIMENTO)).toBe(
      true,
    )
    expect(
      canTransition(ATENDIMENTO_STATUS.EM_ATENDIMENTO, ATENDIMENTO_STATUS.EXAME_CONCLUIDO),
    ).toBe(true)
    expect(
      canTransition(ATENDIMENTO_STATUS.EXAME_CONCLUIDO, ATENDIMENTO_STATUS.FINALIZADO),
    ).toBe(true)
  })

  it('blocks invalid status transitions', () => {
    expect(canTransition(ATENDIMENTO_STATUS.AGUARDANDO, ATENDIMENTO_STATUS.FINALIZADO)).toBe(
      false,
    )
    expect(canTransition(ATENDIMENTO_STATUS.FINALIZADO, ATENDIMENTO_STATUS.AGUARDANDO)).toBe(
      false,
    )
    expect(canTransition(ATENDIMENTO_STATUS.AGUARDANDO, ATENDIMENTO_STATUS.EXAME_CONCLUIDO)).toBe(
      false,
    )
  })

  it('sets operational timestamps on transition', () => {
    const now = new Date('2026-09-28T14:20:00.000Z')

    expect(
      buildStatusPatch(
        ATENDIMENTO_STATUS.AGUARDANDO,
        ATENDIMENTO_STATUS.EM_ATENDIMENTO,
        now,
      ),
    ).toEqual({
      status: ATENDIMENTO_STATUS.EM_ATENDIMENTO,
      atendimento_iniciado_em: now.toISOString(),
    })

    expect(
      buildStatusPatch(
        ATENDIMENTO_STATUS.EM_ATENDIMENTO,
        ATENDIMENTO_STATUS.EXAME_CONCLUIDO,
        now,
      ),
    ).toEqual({
      status: ATENDIMENTO_STATUS.EXAME_CONCLUIDO,
      exame_concluido_em: now.toISOString(),
    })
  })

  it('throws on invalid transition', () => {
    expect(() =>
      assertTransition(ATENDIMENTO_STATUS.AGUARDANDO, ATENDIMENTO_STATUS.FINALIZADO),
    ).toThrow(/Transição inválida/)
  })
})
