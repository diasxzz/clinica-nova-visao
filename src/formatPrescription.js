function parseDate(value) {
  if (!value) {
    return null
  }

  const raw = String(value)

  if (raw.includes('T')) {
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
  }

  const [year, month, day] = raw.split('-')
  if (year && month && day && year.length === 4) {
    const date = new Date(`${year}-${month}-${day}T12:00:00`)
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

export function formatDate(value) {
  const date = parseDate(value)
  if (!date) {
    return '—'
  }

  return date.toLocaleDateString('pt-BR')
}

export function formatDateSlash(value) {
  const date = parseDate(value)
  if (!date) {
    return '___ / ___ / ______'
  }

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear())

  return `${day} / ${month} / ${year}`
}

export function formatDegree(value) {
  if (value === '' || value === null || value === undefined) {
    return '—'
  }

  const number = Number(value)
  if (Number.isNaN(number)) {
    return value
  }

  const formatted = Math.abs(number).toFixed(2).replace('.', ',')
  if (number > 0) {
    return `+${formatted}`
  }
  if (number < 0) {
    return `-${formatted}`
  }
  return formatted
}

export function formatAxis(value) {
  if (value === '' || value === null || value === undefined) {
    return '—'
  }
  return value
}

export function ageFromBirth(birthDate, atDate) {
  if (!birthDate) {
    return '—'
  }

  const birth = new Date(`${String(birthDate).slice(0, 10)}T12:00:00`)
  const at = atDate ? new Date(atDate) : new Date()

  if (Number.isNaN(birth.getTime()) || Number.isNaN(at.getTime())) {
    return '—'
  }

  let age = at.getFullYear() - birth.getFullYear()
  const monthDiff = at.getMonth() - birth.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && at.getDate() < birth.getDate())) {
    age -= 1
  }

  return age >= 0 ? String(age) : '—'
}

export function addDegrees(spherical, addition) {
  const sphere = Number(spherical)
  const add = Number(addition)

  if (spherical === '' || addition === '' || Number.isNaN(sphere) || Number.isNaN(add)) {
    return '—'
  }

  return formatDegree(sphere + add)
}
