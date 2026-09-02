export function formatDate(value) {
  if (!value) {
    return '—'
  }

  const raw = String(value)

  if (raw.includes('T')) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString('pt-BR')
    }
  }

  const [year, month, day] = raw.split('-')
  if (year && month && day && year.length === 4) {
    return `${day}/${month}/${year}`
  }

  return raw
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
