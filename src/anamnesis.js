export const PATHOLOGY_OPTIONS = [
  { id: 'glaucoma', label: 'Glaucoma' },
  { id: 'catarata', label: 'Catarata' },
  { id: 'ceratocone', label: 'Ceratocone' },
  { id: 'retinopatia_diabetica', label: 'Retinopatia diabética' },
  { id: 'degeneracao_macular', label: 'Degeneração macular' },
  { id: 'retinite_pigmentosa', label: 'Retinite pigmentosa' },
  { id: 'estrabismo', label: 'Estrabismo' },
  { id: 'ambliopia', label: 'Ambliopia (olho preguiçoso)' },
  { id: 'uveite', label: 'Uveíte' },
  { id: 'conjuntivite_cronica', label: 'Conjuntivite crônica / alérgica' },
  { id: 'olho_seco', label: 'Síndrome do olho seco' },
  { id: 'pterigio', label: 'Pterígio' },
  { id: 'miopia_patologica', label: 'Miopia patológica / alta miopia' },
  { id: 'hipertensao_ocular', label: 'Hipertensão ocular' },
]

export function emptyAnamnesis() {
  return {
    highBloodPressure: null,
    diabetes: null,
    continuousMedications: null,
    continuousMedicationsDetail: '',
    hasPathology: null,
    pathologies: [],
    pathologyOther: '',
    ocularSurgery: null,
    ocularSurgeryDetail: '',
    previousRx: { od: '', oe: '' },
    currentRx: { od: '', oe: '' },
    observations: '',
  }
}

export function mergeAnamnesis(stored) {
  const base = emptyAnamnesis()

  if (!stored || typeof stored !== 'object') {
    return base
  }

  return {
    ...base,
    ...stored,
    pathologies: Array.isArray(stored.pathologies) ? stored.pathologies : [],
    previousRx: { ...base.previousRx, ...(stored.previousRx ?? {}) },
    currentRx: { ...base.currentRx, ...(stored.currentRx ?? {}) },
  }
}

export function calculateAge(birthDate) {
  if (!birthDate) {
    return null
  }

  const today = new Date()
  const birth = new Date(`${birthDate}T12:00:00`)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1
  }

  return age
}

function formatYesNo(value) {
  if (value === true) {
    return 'Sim'
  }

  if (value === false) {
    return 'Não'
  }

  return null
}

function pathologyLabel(id) {
  return PATHOLOGY_OPTIONS.find((option) => option.id === id)?.label ?? id
}

export function formatAnamnesisSummary(anamnesis) {
  if (!anamnesis || typeof anamnesis !== 'object') {
    return []
  }

  const lines = []

  const highBloodPressure = formatYesNo(anamnesis.highBloodPressure)
  if (highBloodPressure) {
    lines.push(`Pressão alta: ${highBloodPressure}`)
  }

  const diabetes = formatYesNo(anamnesis.diabetes)
  if (diabetes) {
    lines.push(`Diabetes: ${diabetes}`)
  }

  const medications = formatYesNo(anamnesis.continuousMedications)
  if (medications) {
    const detail = anamnesis.continuousMedicationsDetail?.trim()
    lines.push(detail ? `Medicamentos contínuos: Sim (${detail})` : `Medicamentos contínuos: ${medications}`)
  }

  const pathology = formatYesNo(anamnesis.hasPathology)
  if (pathology) {
    const selected = (anamnesis.pathologies ?? []).map(pathologyLabel)
    if (anamnesis.pathologyOther?.trim()) {
      selected.push(anamnesis.pathologyOther.trim())
    }

    lines.push(
      selected.length > 0
        ? `Patologia: Sim (${selected.join(', ')})`
        : `Patologia: ${pathology}`,
    )
  }

  const surgery = formatYesNo(anamnesis.ocularSurgery)
  if (surgery) {
    const detail = anamnesis.ocularSurgeryDetail?.trim()
    lines.push(detail ? `Cirurgia ocular: Sim (${detail})` : `Cirurgia ocular: ${surgery}`)
  }

  if (anamnesis.previousRx?.od || anamnesis.previousRx?.oe) {
    lines.push(
      `RX anterior — OD: ${anamnesis.previousRx.od || '—'} · OE: ${anamnesis.previousRx.oe || '—'}`,
    )
  }

  if (anamnesis.currentRx?.od || anamnesis.currentRx?.oe) {
    lines.push(
      `RX atual — OD: ${anamnesis.currentRx.od || '—'} · OE: ${anamnesis.currentRx.oe || '—'}`,
    )
  }

  if (anamnesis.observations?.trim()) {
    lines.push(`Obs: ${anamnesis.observations.trim()}`)
  }

  return lines
}

export function hasAnamnesisData(anamnesis) {
  return formatAnamnesisSummary(anamnesis).length > 0
}
