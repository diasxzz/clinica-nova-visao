export const PRINT_CHECKS = [
  { value: 'Visão simples', label: 'Visão Simples' },
  { value: 'Multifocal', label: 'Multifocal' },
  { value: 'Bifocal', label: 'Bifocal' },
  { value: 'Fotossensível', label: 'Fotossensível' },
  { value: 'Blue', label: 'Blue UV' },
  { value: 'Antirreflexo', label: 'Anti-Reflexo' },
]

export function isPrintCheckOn(prescription, value) {
  return (
    prescription.lensTypes?.includes(value) || prescription.treatments?.includes(value)
  )
}
