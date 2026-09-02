import { supabase } from './supabaseClient.js'

function mapPatient(row) {
  return {
    id: row.id,
    name: row.name,
    birthDate: row.birth_date,
    cpf: row.cpf,
    phone: row.phone ?? '',
    storeId: row.store_id ?? 1,
  }
}

function mapPrescription(row) {
  return {
    id: row.id,
    patientId: row.patient_id,
    rightEye: row.right_eye ?? {},
    leftEye: row.left_eye ?? {},
    notes: row.notes ?? '',
    doctorName: row.doctor_name ?? '',
    dp: row.dp ?? '',
    lensTypes: row.lens_types ?? [],
    treatments: row.treatments ?? [],
    sentToOticaAt: row.sent_to_otica_at || null,
    createdAt: row.created_at,
  }
}

export async function getPrescriptionsByPatient(patientId) {
  const { data, error } = await supabase
    .from('prescriptions')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []).map(mapPrescription)
}

export async function getPatientsWithLastConsult() {
  const patients = await getPatients()
  const { data, error } = await supabase
    .from('prescriptions')
    .select('patient_id, created_at, sent_to_otica_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const lastByPatient = new Map()

  for (const row of data ?? []) {
    if (!lastByPatient.has(row.patient_id)) {
      lastByPatient.set(row.patient_id, {
        lastConsultAt: row.created_at,
        sentToOticaAt: row.sent_to_otica_at || null,
      })
    }
  }

  return patients.map((patient) => {
    const last = lastByPatient.get(patient.id)
    return {
      ...patient,
      lastConsultAt: last?.lastConsultAt || null,
      sentToOticaAt: last?.sentToOticaAt || null,
    }
  })
}

export async function getPatients() {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .order('name')

  if (error) {
    throw error
  }

  return (data ?? []).map(mapPatient)
}

export async function savePatient(patient) {
  const { data, error } = await supabase
    .from('patients')
    .insert({
      name: patient.name,
      birth_date: patient.birthDate,
      cpf: patient.cpf,
      phone: patient.phone ?? '',
      store_id: Number(patient.storeId) || 1,
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return mapPatient(data)
}

export async function savePrescription(prescription) {
  const { data, error } = await supabase
    .from('prescriptions')
    .insert({
      patient_id: prescription.patientId,
      right_eye: prescription.rightEye,
      left_eye: prescription.leftEye,
      notes: prescription.notes ?? '',
      doctor_name: prescription.doctorName ?? '',
      dp: prescription.dp ?? '',
      lens_types: prescription.lensTypes ?? [],
      treatments: prescription.treatments ?? [],
    })
    .select()
    .single()

  if (error) {
    throw error
  }

  return mapPrescription(data)
}

export async function markPrescriptionSent(prescriptionId) {
  const { data, error } = await supabase
    .from('prescriptions')
    .update({ sent_to_otica_at: new Date().toISOString() })
    .eq('id', prescriptionId)
    .select()
    .single()

  if (error) {
    throw error
  }

  return mapPrescription(data)
}

export async function getPatientsWithLatestPrescription() {
  const { data, error } = await supabase
    .from('prescriptions')
    .select(`
      id,
      created_at,
      right_eye,
      left_eye,
      notes,
      patient_id,
      doctor_name,
      dp,
      lens_types,
      treatments,
      sent_to_otica_at,
      patients (
        id,
        name,
        birth_date,
        cpf,
        phone,
        store_id
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  const latestByPatient = new Map()

  for (const row of data ?? []) {
    if (!row.patients || latestByPatient.has(row.patient_id)) {
      continue
    }

    latestByPatient.set(row.patient_id, row)
  }

  return [...latestByPatient.values()]
    .map((row) => ({
      patient: mapPatient(row.patients),
      prescription: mapPrescription(row),
    }))
    .sort((a, b) => a.patient.name.localeCompare(b.patient.name, 'pt-BR'))
}
