export const LENS_TYPES = [
  'Visão simples',
  'Multifocal',
  'Bifocal',
  'Ocupacional',
]

export const TREATMENTS = [
  'Antirreflexo',
  'Blue',
  'Fotossensível',
  'Antirrisco',
]

export function toggleOption(list, value) {
  if (list.includes(value)) {
    return list.filter((item) => item !== value)
  }

  return [...list, value]
}
