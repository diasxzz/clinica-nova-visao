import { isPrintCheckOn, PRINT_CHECKS } from './printChecks.js'

export const CLINIC_CONTACT = {
  name: 'Clínica Nova Visão',
  address: 'Consultas de optometria e saúde visual',
  phoneEmail: 'Londrina · Campo Grande · Caxias do Sul',
}

export const PRESCRIPTION_PRINT_CSS = `
  @page { size: A4; margin: 8mm 10mm; }
  * { box-sizing: border-box; }
  body { margin: 0; background: #dbeafe; color: #111; font-family: Arial, Helvetica, sans-serif; }
  .toolbar { display: flex; justify-content: flex-end; max-width: 1145px; margin: 16px auto 0; }
  .toolbar button { border: 0; border-radius: 6px; padding: 10px 18px; font-weight: 700; background: #111; color: #fff; cursor: pointer; }
  .sheet {
    width: min(1145px, 100%);
    margin: 16px auto 32px;
    padding: 32px 40px 24px;
    background: linear-gradient(180deg, #fff 0%, #fff 88%, #e8f4fc 100%);
  }
  .head { text-align: center; margin-bottom: 14px; }
  .logo { height: 112px; width: auto; object-fit: contain; margin-bottom: 8px; }
  .title { margin: 0; font-size: 18px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; }
  .patient { display: flex; flex-wrap: wrap; gap: 8px 24px; margin-bottom: 10px; font-size: 13px; line-height: 1.35; }
  .field { margin: 0; font-size: 13px; line-height: 1.35; }
  .field-label { font-weight: 700; }
  .field-line { display: inline-block; min-width: 16rem; border-bottom: 1px solid #111; padding: 0 4px 1px; }
  .field-age { display: inline-block; min-width: 48px; border-bottom: 1px solid #111; padding: 0 4px 1px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 0; table-layout: fixed; }
  th, td { border: 1px solid #111; padding: 5px 6px; text-align: center; font-size: 12px; vertical-align: middle; }
  th { font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.04em; height: 28px; }
  .side { width: 96px; font-size: 12px; font-weight: 700; text-transform: capitalize; }
  .eye { width: 48px; font-weight: 700; font-size: 12px; }
  .dp { width: 64px; position: relative; padding-right: 14px; }
  .dp-value { min-height: 28px; display: flex; align-items: center; justify-content: center; }
  .dp-mm {
    position: absolute;
    right: 3px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 10px;
    line-height: 0.95;
    letter-spacing: 0;
    font-weight: 700;
    writing-mode: vertical-rl;
    text-orientation: upright;
  }
  .table-gap { height: 6px; }
  .addition {
    display: grid;
    grid-template-columns: 120px 1fr;
    border: 1px solid #111;
    margin: 8px 0 10px;
    min-height: 30px;
  }
  .addition .label {
    border-right: 1px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }
  .addition .value {
    display: flex;
    align-items: center;
    padding: 4px 10px;
    font-size: 12px;
  }
  .section { margin-bottom: 8px; font-size: 13px; }
  .section-label { font-weight: 700; margin-bottom: 4px; }
  .section-label span { font-weight: 400; }
  .checks { margin: 0 0 4px; line-height: 1.35; }
  .ruled { min-height: 16px; border-bottom: 1px solid #111; margin-bottom: 4px; font-size: 12px; padding: 1px 2px 2px; }
  .sign { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; align-items: end; margin: 12px 0 8px; font-size: 13px; }
  .sign-date { letter-spacing: 0.08em; }
  .sign-box { text-align: center; }
  .sign-line { min-height: 28px; border-bottom: 1px solid #111; margin-bottom: 4px; }
  .sign-box span { font-size: 11px; font-weight: 700; text-transform: capitalize; letter-spacing: 0.02em; }
  .sign-box small { display: block; margin-top: 2px; font-size: 10px; color: #444; }
  .footer { text-align: center; font-size: 10px; color: #333; line-height: 1.35; padding-top: 4px; }
  @media print {
    .no-print { display: none; }
    body { background: #fff; }
    .sheet {
      margin: 0;
      width: auto;
      min-height: auto;
      padding: 0;
      box-shadow: none;
      background: #fff;
      page-break-inside: avoid;
    }
    .logo { height: 84px; margin-bottom: 4px; }
    .head { margin-bottom: 8px; }
    .title { font-size: 16px; letter-spacing: 0.18em; }
    .patient { margin-bottom: 8px; }
    .section { margin-bottom: 6px; }
    .sign { margin: 10px 0 6px; }
    .footer { padding-top: 2px; }
  }
`

export function formatLensLine(prescription) {
  const types = prescription.lensTypes ?? []
  return types.length ? types.join(' · ') : ''
}

export function formatTreatmentLine(prescription) {
  const selected = allTreatmentChecks(prescription)
    .filter((item) => isTreatmentCheckOn(prescription, item.value))
    .map((item) => item.label)

  return selected.length ? selected.join(' · ') : ''
}

export function resolveAddition(prescription, right, left) {
  if (prescription?.addition !== undefined && prescription?.addition !== '') {
    return prescription.addition
  }

  const od = right?.addition
  const oe = left?.addition

  if (od && oe && String(od) !== String(oe)) {
    return od || oe
  }

  return od || oe || ''
}

export function formatAdditionLine(prescription, right, left) {
  const addition = resolveAddition(prescription, right, left)

  if (addition === '' || addition === null || addition === undefined) {
    return ''
  }

  return String(addition)
}

export function formatDpCell(right, left) {
  const od = right.dnp
  const oe = left.dnp

  if (!od && !oe) {
    return ''
  }

  if (od && oe && String(od) === String(oe)) {
    return String(od)
  }

  const parts = []
  if (od) parts.push(String(od))
  if (oe) parts.push(String(oe))
  return parts.join(' / ')
}

export function allTreatmentChecks(prescription) {
  const known = PRINT_CHECKS.filter((item) =>
    ['Fotossensível', 'Blue', 'Antirreflexo'].includes(item.value),
  )

  const extras = [...(prescription.lensTypes ?? []), ...(prescription.treatments ?? [])]
    .filter((value) => !PRINT_CHECKS.some((item) => item.value === value))
    .map((value) => ({ value, label: value }))

  return [...known, ...extras]
}

export function isTreatmentCheckOn(prescription, value) {
  return isPrintCheckOn(prescription, value)
}

export function lensTypeChecks(prescription) {
  return PRINT_CHECKS.filter((item) =>
    ['Visão simples', 'Multifocal', 'Bifocal'].includes(item.value),
  ).map((item) => ({
    ...item,
    on: isPrintCheckOn(prescription, item.value),
  }))
}

export function checkMarkup(prescription, item, escapeHtml) {
  const on = item.on ?? isTreatmentCheckOn(prescription, item.value)
  const mark = on ? '✓' : ''
  const box = on
    ? 'display:inline-flex;width:11px;height:11px;border:1px solid #111;background:#111;color:#fff;font-size:8px;align-items:center;justify-content:center;margin-right:5px;vertical-align:middle;'
    : 'display:inline-block;width:11px;height:11px;border:1px solid #111;margin-right:5px;vertical-align:middle;'
  return `<span style="margin-right:16px;font-size:12px;white-space:nowrap"><span style="${box}">${mark}</span>${escapeHtml(item.label)}</span>`
}
