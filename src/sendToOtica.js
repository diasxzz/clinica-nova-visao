import { STORES } from './stores.js'

export function hasMinimumExam(rightEye, leftEye) {
  return Boolean(rightEye?.spherical || leftEye?.spherical)
}

export async function sendExamToOtica({
  storeId,
  patient,
  phone,
  rightEye,
  leftEye,
  notes,
  doctorName,
  dp,
  lensTypes = [],
  treatments = [],
}) {
  const response = await fetch('/api/clinica-envios', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      loja_id: Number(storeId || patient.storeId),
      clinica_paciente_id: patient.id,
      cliente_nome: patient.name,
      cliente_telefone: phone.replace(/\D/g, ''),
      cliente_cpf: patient.cpf,
      observacoes: [notes, lensTypes.length ? `Lentes: ${lensTypes.join(', ')}` : '', treatments.length ? `Tratamentos: ${treatments.join(', ')}` : '']
        .filter(Boolean)
        .join(' | ') || undefined,
      exame: {
        od_esferico: rightEye.spherical || '',
        od_cilindrico: rightEye.cylindrical || '',
        od_eixo: rightEye.axis || '',
        od_dnp: rightEye.dnp || '',
        oe_esferico: leftEye.spherical || '',
        oe_cilindrico: leftEye.cylindrical || '',
        oe_eixo: leftEye.axis || '',
        oe_dnp: leftEye.dnp || '',
        adicao: rightEye.addition || leftEye.addition || '',
        dp: dp || '',
        medico: doctorName || '',
        data_exame: new Date().toISOString().slice(0, 10),
        obs_exame: [notes, lensTypes.join(', '), treatments.join(', ')].filter(Boolean).join(' | '),
      },
    }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || payload.message || 'Falha ao enviar para a ótica.')
  }

  return payload
}

export async function sendSavedPrescriptionToOtica({ patient, prescription }) {
  return sendExamToOtica({
    storeId: patient.storeId,
    patient,
    phone: patient.phone || '',
    rightEye: prescription.rightEye,
    leftEye: prescription.leftEye,
    notes: prescription.notes,
    doctorName: prescription.doctorName,
    dp: prescription.dp,
    lensTypes: prescription.lensTypes,
    treatments: prescription.treatments,
  })
}

export { STORES }
