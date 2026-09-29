import { supabase } from './supabaseClient.js'
import { todayDateString } from './domain/atendimento/derive.js'
import { mapAtendimento } from './domain/atendimento/mapAtendimento.js'
import { ATENDIMENTO_STATUS } from './domain/atendimento/status.js'
import { assertTransition, buildStatusPatch } from './domain/atendimento/transitions.js'

const ATENDIMENTO_SELECT = `
  *,
  patients (
    id,
    name,
    cpf,
    rg,
    phone,
    store_id
  )
`

export class AtendimentoError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'AtendimentoError'
    this.code = code
  }
}

async function fetchAtendimentoById(atendimentoId) {
  const { data, error } = await supabase
    .from('atendimentos')
    .select(ATENDIMENTO_SELECT)
    .eq('id', atendimentoId)
    .maybeSingle()

  if (error) {
    throw error
  }

  if (!data) {
    throw new AtendimentoError('not_found', 'Atendimento não encontrado.')
  }

  return mapAtendimento(data)
}

async function updateAtendimento(atendimentoId, patch) {
  const { data, error } = await supabase
    .from('atendimentos')
    .update(patch)
    .eq('id', atendimentoId)
    .select(ATENDIMENTO_SELECT)
    .single()

  if (error) {
    throw error
  }

  return mapAtendimento(data)
}

export async function getOpenAtendimentoForPatient(patientId, data = todayDateString()) {
  const { data: rows, error } = await supabase
    .from('atendimentos')
    .select('*')
    .eq('patient_id', patientId)
    .eq('data', data)
    .neq('status', ATENDIMENTO_STATUS.FINALIZADO)
    .maybeSingle()

  if (error) {
    throw error
  }

  return rows ? mapAtendimento(rows) : null
}

export async function registrarChegada({ patientId, storeId, chegadaEm = new Date() }) {
  const data = todayDateString(chegadaEm)
  const open = await getOpenAtendimentoForPatient(patientId, data)

  if (open) {
    throw new AtendimentoError(
      'duplicate_open',
      'Este paciente já possui atendimento em aberto hoje.',
    )
  }

  const { data: created, error } = await supabase
    .from('atendimentos')
    .insert({
      patient_id: patientId,
      store_id: Number(storeId) || 1,
      data,
      status: ATENDIMENTO_STATUS.AGUARDANDO,
      chegada_em: chegadaEm.toISOString(),
    })
    .select(ATENDIMENTO_SELECT)
    .single()

  if (error) {
    if (error.code === '23505') {
      throw new AtendimentoError(
        'duplicate_open',
        'Este paciente já possui atendimento em aberto hoje.',
      )
    }

    throw error
  }

  return mapAtendimento(created)
}

export async function iniciarAtendimento(atendimentoId, profissionalId = null, now = new Date()) {
  const current = await fetchAtendimentoById(atendimentoId)
  const patch = buildStatusPatch(
    current.status,
    ATENDIMENTO_STATUS.EM_ATENDIMENTO,
    now,
  )

  if (profissionalId) {
    patch.profissional_id = profissionalId
  }

  return updateAtendimento(atendimentoId, patch)
}

export async function concluirExame(atendimentoId, now = new Date()) {
  const current = await fetchAtendimentoById(atendimentoId)
  const patch = buildStatusPatch(
    current.status,
    ATENDIMENTO_STATUS.EXAME_CONCLUIDO,
    now,
  )

  return updateAtendimento(atendimentoId, patch)
}

export async function vincularReceita(atendimentoId, prescriptionId, now = new Date()) {
  const current = await fetchAtendimentoById(atendimentoId)
  const iso = now.toISOString()
  const patch = {
    prescription_id: prescriptionId,
  }
  let status = current.status

  if (status === ATENDIMENTO_STATUS.EM_ATENDIMENTO) {
    assertTransition(status, ATENDIMENTO_STATUS.EXAME_CONCLUIDO)
    patch.exame_concluido_em = iso
    status = ATENDIMENTO_STATUS.EXAME_CONCLUIDO
  }

  if (status === ATENDIMENTO_STATUS.EXAME_CONCLUIDO) {
    assertTransition(status, ATENDIMENTO_STATUS.FINALIZADO)
    patch.finalizado_em = iso
    patch.status = ATENDIMENTO_STATUS.FINALIZADO
  } else if (status !== ATENDIMENTO_STATUS.FINALIZADO) {
    throw new AtendimentoError(
      'invalid_state',
      'A receita só pode ser vinculada durante ou após o exame.',
    )
  }

  const updated = await updateAtendimento(atendimentoId, patch)

  const { error: prescriptionError } = await supabase
    .from('prescriptions')
    .update({ atendimento_id: atendimentoId })
    .eq('id', prescriptionId)

  if (prescriptionError) {
    throw prescriptionError
  }

  return updated
}

export async function finalizarAtendimento(atendimentoId, now = new Date()) {
  const current = await fetchAtendimentoById(atendimentoId)
  const patch = buildStatusPatch(current.status, ATENDIMENTO_STATUS.FINALIZADO, now)

  return updateAtendimento(atendimentoId, patch)
}

export async function getFilaDoDia({
  data = todayDateString(),
  storeId = null,
} = {}) {
  let query = supabase
    .from('atendimentos')
    .select(ATENDIMENTO_SELECT)
    .eq('data', data)
    .order('chegada_em', { ascending: true })

  if (storeId != null) {
    query = query.eq('store_id', Number(storeId))
  }

  const { data: rows, error } = await query

  if (error) {
    throw error
  }

  return (rows ?? []).map(mapAtendimento)
}
