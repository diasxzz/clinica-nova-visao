import { describe, expect, it } from 'vitest'
import {
  countByFilaBucket,
  isSemReceita,
  matchesFilaFilter,
  sortFilaAtendimentos,
} from './derive.js'
import { ATENDIMENTO_STATUS, FILA_FILTERS } from './status.js'
import { assertTransition, buildStatusPatch } from './transitions.js'

describe('maria operational flow', () => {
  it('follows arrival → waiting → in service → no receipt → finalized', () => {
    let status = ATENDIMENTO_STATUS.AGUARDANDO
    let prescriptionId = null
    const timeline = []

    timeline.push({
      status,
      bucket: matchesFilaFilter({ status, prescriptionId }, FILA_FILTERS.AGUARDANDO),
    })

    const startPatch = buildStatusPatch(status, ATENDIMENTO_STATUS.EM_ATENDIMENTO)
    status = startPatch.status
    timeline.push({
      status,
      bucket: matchesFilaFilter({ status, prescriptionId }, FILA_FILTERS.EM_ATENDIMENTO),
    })

    const concludePatch = buildStatusPatch(status, ATENDIMENTO_STATUS.EXAME_CONCLUIDO)
    status = concludePatch.status
    timeline.push({
      status,
      semReceita: isSemReceita({ status, prescriptionId }),
    })

    const finalizePatch = buildStatusPatch(status, ATENDIMENTO_STATUS.FINALIZADO)
    status = finalizePatch.status
    prescriptionId = 'rx-maria'
    timeline.push({
      status,
      semReceita: isSemReceita({ status, prescriptionId }),
      bucket: matchesFilaFilter({ status, prescriptionId }, FILA_FILTERS.FINALIZADOS),
    })

    expect(timeline[0].bucket).toBe(true)
    expect(timeline[1].bucket).toBe(true)
    expect(timeline[2].semReceita).toBe(true)
    expect(timeline[3].semReceita).toBe(false)
    expect(timeline[3].bucket).toBe(true)
  })

  it('rejects skipping straight to finalized from waiting', () => {
    expect(() =>
      assertTransition(ATENDIMENTO_STATUS.AGUARDANDO, ATENDIMENTO_STATUS.FINALIZADO),
    ).toThrow()
  })

  it('orders waiting queue oldest first', () => {
    const queue = sortFilaAtendimentos(
      [
        {
          id: 'maria',
          status: ATENDIMENTO_STATUS.AGUARDANDO,
          chegadaEm: '2026-09-28T14:12:00.000Z',
          prescriptionId: null,
        },
        {
          id: 'ana',
          status: ATENDIMENTO_STATUS.AGUARDANDO,
          chegadaEm: '2026-09-28T14:00:00.000Z',
          prescriptionId: null,
        },
      ],
      FILA_FILTERS.AGUARDANDO,
    )

    expect(queue.map((item) => item.id)).toEqual(['ana', 'maria'])
  })

  it('updates operational counters through the day', () => {
    const fila = [
      {
        id: '1',
        status: ATENDIMENTO_STATUS.AGUARDANDO,
        prescriptionId: null,
      },
      {
        id: '2',
        status: ATENDIMENTO_STATUS.EM_ATENDIMENTO,
        prescriptionId: null,
      },
      {
        id: '3',
        status: ATENDIMENTO_STATUS.EXAME_CONCLUIDO,
        prescriptionId: null,
      },
      {
        id: '4',
        status: ATENDIMENTO_STATUS.FINALIZADO,
        prescriptionId: 'rx-4',
      },
    ]

    expect(countByFilaBucket(fila)).toEqual({
      aguardando: 1,
      emAtendimento: 1,
      semReceita: 1,
      finalizados: 1,
    })
  })
})
