export function mapAtendimento(row) {
  if (!row) {
    return null
  }

  return {
    id: row.id,
    patientId: row.patient_id,
    storeId: row.store_id,
    data: row.data,
    status: row.status,
    chegadaEm: row.chegada_em,
    atendimentoIniciadoEm: row.atendimento_iniciado_em || null,
    exameConcluidoEm: row.exame_concluido_em || null,
    finalizadoEm: row.finalizado_em || null,
    prescriptionId: row.prescription_id || null,
    profissionalId: row.profissional_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    patient: row.patients ? mapPatientSummary(row.patients) : null,
  }
}

function mapPatientSummary(row) {
  return {
    id: row.id,
    name: row.name,
    cpf: row.cpf,
    rg: row.rg ?? '',
    phone: row.phone ?? '',
    storeId: row.store_id ?? 1,
  }
}
