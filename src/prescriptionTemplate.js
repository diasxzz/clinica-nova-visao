import { isPrintCheckOn, PRINT_CHECKS } from './printChecks.js'

export const CLINIC_CONTACT = {
  name: 'Clínica Nova Visão',
  address: 'Consultas de optometria e saúde visual',
  phoneEmail: 'Londrina · Campo Grande · Caxias do Sul',
}

export const PRESCRIPTION_PRINT_CSS = `
  @page { size: A4 portrait; margin: 5mm; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; }
  body { background: #dbeafe; color: #111; font-family: Arial, Helvetica, sans-serif; }
  .toolbar { display: flex; justify-content: flex-end; max-width: 1145px; margin: 16px auto 0; }
  .toolbar button { border: 0; border-radius: 6px; padding: 10px 18px; font-weight: 700; background: #111; color: #fff; cursor: pointer; }
  .print-root { width: min(1145px, 100%); margin: 0 auto; }
  .sheet {
    width: 100%;
    margin: 16px auto 32px;
    padding: 24px 32px 16px;
    background: linear-gradient(180deg, #fff 0%, #fff 88%, #e8f4fc 100%);
  }
  .head { text-align: center; margin-bottom: 8px; }
  .logo { height: 88px; width: auto; object-fit: contain; margin-bottom: 4px; }
  .title { margin: 0; font-size: 16px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; }
  .patient { display: flex; flex-wrap: wrap; gap: 4px 20px; margin-bottom: 6px; font-size: 12px; line-height: 1.25; }
  .field { margin: 0; font-size: 12px; line-height: 1.25; }
  .field-label { font-weight: 700; }
  .field-line { display: inline-block; min-width: 14rem; border-bottom: 1px solid #111; padding: 0 4px 1px; }
  .field-age { display: inline-block; min-width: 48px; border-bottom: 1px solid #111; padding: 0 4px 1px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 0; table-layout: fixed; }
  th, td { border: 1px solid #111; padding: 3px 4px; text-align: center; font-size: 11px; vertical-align: middle; line-height: 1.2; }
  th { font-size: 9px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.03em; height: 22px; }
  .side { width: 84px; font-size: 11px; font-weight: 700; text-transform: capitalize; }
  .eye { width: 42px; font-weight: 700; font-size: 11px; }
  .dp { width: 56px; position: relative; padding-right: 12px; }
  .dp-value { min-height: 18px; display: flex; align-items: center; justify-content: center; }
  .dp-mm {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 9px;
    line-height: 0.95;
    font-weight: 700;
    writing-mode: vertical-rl;
    text-orientation: upright;
  }
  .addition {
    display: grid;
    grid-template-columns: 96px 1fr;
    border: 1px solid #111;
    margin: 5px 0 6px;
    min-height: 24px;
  }
  .addition .label {
    border-right: 1px solid #111;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .addition .value {
    display: flex;
    align-items: center;
    padding: 2px 8px;
    font-size: 11px;
  }
  .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 5px; }
  .section { margin-bottom: 0; font-size: 11px; }
  .section-label { font-weight: 700; margin-bottom: 2px; }
  .section-label span { font-weight: 400; }
  .checks { margin: 0 0 2px; line-height: 1.25; }
  .ruled { min-height: 12px; border-bottom: 1px solid #111; margin-bottom: 2px; font-size: 11px; padding: 0 2px 1px; }
  .bottom { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: end; margin-top: 6px; font-size: 11px; }
  .sign-date { letter-spacing: 0.06em; margin: 0; }
  .sign-box { text-align: center; }
  .sign-line { min-height: 20px; border-bottom: 1px solid #111; margin-bottom: 2px; }
  .sign-box span { font-size: 10px; font-weight: 700; text-transform: capitalize; }
  .sign-box small { display: block; margin-top: 1px; font-size: 9px; color: #444; }
  .footer { text-align: center; font-size: 9px; color: #333; line-height: 1.25; margin: 4px 0 0; grid-column: 1 / -1; }
  @media print {
    .no-print { display: none !important; }
    html, body { background: #fff; height: auto; overflow: visible; }
    .print-root {
      width: 100%;
      height: 287mm;
      overflow: hidden;
      display: flex;
      justify-content: center;
    }
    .sheet {
      margin: 0;
      padding: 0;
      width: 100%;
      max-width: 200mm;
      min-height: auto;
      box-shadow: none;
      background: #fff;
      page-break-inside: avoid;
      break-inside: avoid;
      transform: scale(0.82);
      transform-origin: top center;
    }
    .logo { height: 58px; margin-bottom: 2px; }
    .head { margin-bottom: 4px; }
    .title { font-size: 14px; letter-spacing: 0.14em; }
    .patient { margin-bottom: 4px; font-size: 11px; }
    table, .addition, .options-grid, .section, .bottom { break-inside: avoid; page-break-inside: avoid; }
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
  return `<span style="margin-right:10px;font-size:11px;white-space:nowrap"><span style="${box}">${mark}</span>${escapeHtml(item.label)}</span>`
}
