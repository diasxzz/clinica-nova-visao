import { describe, expect, it } from 'vitest'
import {
  countByFilaBucket,
  getInServiceMinutes,
  getWaitMinutes,
  isSemReceita,
  matchesFilaFilter,
  sortFilaAtendimentos,
} from './derive.js'
import { ATENDIMENTO_STATUS, FILA_FILTERS } from './status.js'

function makeAtendimento(overrides = {}) {
  return {
    id: '1',
    status: ATENDIMENTO_STATUS.AGUARDANDO,
    chegadaEm: '2026-09-28T14:00:00.000Z',
    atendimentoIniciadoEm: null,
    exameConcluidoEm: null,
    finalizadoEm: null,
    prescriptionId: null,
    ...overrides,
  }
}

describe('atendimento derive', () => {
  it('detects sem receita from status and prescription', () => {
    expect(
      isSemReceita(
        makeAtendimento({
          status: ATENDIMENTO_STATUS.EXAME_CONCLUIDO,
          exameConcluidoEm: '2026-09-28T15:00:00.000Z',
        }),
      ),
    ).toBe(true)

    expect(
      isSemReceita(
        makeAtendimento({
          status: ATENDIMENTO_STATUS.EXAME_CONCLUIDO,
          prescriptionId: 'rx-1',
        }),
      ),
    ).toBe(false)
  })

  it('counts operational buckets for the day', () => {
    const counts = countByFilaBucket([
      makeAtendimento({ id: '1' }),
      makeAtendimento({ id: '2', status: ATENDIMENTO_STATUS.EM_ATENDIMENTO }),
      makeAtendimento({
        id: '3',
        status: ATENDIMENTO_STATUS.EXAME_CONCLUIDO,
        exameConcluidoEm: '2026-09-28T15:00:00.000Z',
      }),
      makeAtendimento({
        id: '4',
        status: ATENDIMENTO_STATUS.FINALIZADO,
        finalizadoEm: '2026-09-28T15:05:00.000Z',
        prescriptionId: 'rx-1',
      }),
    ])

    expect(counts).toEqual({
      aguardando: 1,
      emAtendimento: 1,
      semReceita: 1,
      finalizados: 1,
    })
  })

  it('filters queue buckets', () => {
    const maria = makeAtendimento({ id: 'maria', status: ATENDIMENTO_STATUS.AGUARDANDO })
    const joao = makeAtendimento({
      id: 'joao',
      status: ATENDIMENTO_STATUS.EM_ATENDIMENTO,
      atendimentoIniciadoEm: '2026-09-28T14:20:00.000Z',
    })

    expect(matchesFilaFilter(maria, FILA_FILTERS.AGUARDANDO)).toBe(true)
    expect(matchesFilaFilter(joao, FILA_FILTERS.AGUARDANDO)).toBe(false)
  })

  it('sorts aguardando by oldest arrival first', () => {
    const sorted = sortFilaAtendimentos(
      [
        makeAtendimento({ id: 'b', chegadaEm: '2026-09-28T14:12:00.000Z' }),
        makeAtendimento({ id: 'a', chegadaEm: '2026-09-28T14:00:00.000Z' }),
      ],
      FILA_FILTERS.AGUARDANDO,
    )

    expect(sorted.map((item) => item.id)).toEqual(['a', 'b'])
  })

  it('calculates waiting and in-service minutes', () => {
    const now = new Date('2026-09-28T14:18:00.000Z')

    expect(
      getWaitMinutes(
        makeAtendimento({ chegadaEm: '2026-09-28T14:00:00.000Z' }),
        now,
      ),
    ).toBe(18)

    expect(
      getInServiceMinutes(
        makeAtendimento({
          status: ATENDIMENTO_STATUS.EM_ATENDIMENTO,
          atendimentoIniciadoEm: '2026-09-28T14:00:00.000Z',
        }),
        now,
      ),
    ).toBe(18)
  })
})
