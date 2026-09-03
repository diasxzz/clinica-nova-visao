import logo from './assets/logo-clinica-nova-visao.png'
import { addDegrees, ageFromBirth, formatAxis, formatDate, formatDegree } from './formatPrescription.js'
import { isPrintCheckOn, PRINT_CHECKS } from './printChecks.js'

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function logoUrl() {
  if (logo.startsWith('http')) {
    return logo
  }
  return `${window.location.origin}${logo}`
}

function checkHtml(prescription, item) {
  const on = isPrintCheckOn(prescription, item.value)
  const mark = on ? '✓' : ''
  const box = on
    ? 'display:inline-flex;width:12px;height:12px;border:1px solid #134e4a;background:#0f766e;color:#fff;font-size:9px;align-items:center;justify-content:center;margin-right:4px;'
    : 'display:inline-block;width:12px;height:12px;border:1px solid #134e4a;margin-right:4px;vertical-align:middle;'
  return `<span style="margin-right:14px;font-size:12px"><span style="${box}">${mark}</span>${escapeHtml(item.label)}</span>`
}

export function printPrescription({ patient, prescription }) {
  const printWindow = window.open('', '_blank', 'width=820,height=1100')

  if (!printWindow) {
    return false
  }

  const right = prescription.rightEye ?? {}
  const left = prescription.leftEye ?? {}

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Receita Óptica - ${escapeHtml(patient.name)}</title>
        <style>
          @page { size: A4; margin: 12mm; }
          * { box-sizing: border-box; }
          body { margin: 0; background: #e2e8f0; color: #1e293b; font-family: Arial, sans-serif; }
          .toolbar { display: flex; justify-content: flex-end; max-width: 190mm; margin: 16px auto 0; }
          .toolbar button { border: 0; border-radius: 8px; padding: 10px 16px; font-weight: 600; background: #0d9488; color: #fff; cursor: pointer; }
          .sheet { max-width: 190mm; min-height: 260mm; margin: 16px auto 32px; padding: 20px 22px 24px; background: #fff; border: 2px solid #134e4a; }
          .head { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #134e4a; padding-bottom: 12px; margin-bottom: 16px; }
          .logo { height: 88px; width: auto; object-fit: contain; }
          .line { margin: 0 0 8px; padding-bottom: 4px; border-bottom: 1px solid #94a3b8; font-size: 14px; }
          .two { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
          .wrap { display: flex; gap: 10px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #134e4a; padding: 8px 6px; text-align: center; font-size: 13px; }
          th { background: #f0fdfa; font-size: 11px; text-transform: uppercase; }
          .od { font-weight: 700; width: 42px; }
          .side { background: #f0fdfa; font-size: 11px; font-weight: 700; letter-spacing: 0.12em; writing-mode: vertical-rl; transform: rotate(180deg); width: 28px; }
          .acuity { width: 78px; border: 1px solid #134e4a; display: flex; flex-direction: column; }
          .acuity p { margin: 0; padding: 8px 4px; border-bottom: 1px solid #134e4a; background: #f0fdfa; font-size: 10px; font-weight: 700; text-transform: uppercase; text-align: center; }
          .acuity div { flex: 1; min-height: 72px; }
          .checks { margin: 10px 0 16px; }
          .legal { font-size: 10px; text-align: center; color: #475569; margin: 28px 0 20px; }
          .stamp { width: 220px; margin: 0 auto; border: 1px solid #94a3b8; border-radius: 12px; padding: 40px 12px 10px; text-align: center; }
          .stamp p { margin: 0; padding-top: 8px; border-top: 1px solid #64748b; font-size: 12px; font-weight: 700; letter-spacing: 0.04em; }
          .stamp span { display: block; margin-top: 4px; font-size: 11px; color: #64748b; }
          @media print {
            .no-print { display: none; }
            body { background: #fff; }
            .sheet { margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="toolbar no-print">
          <button class="print-btn no-print" type="button" onclick="window.print()">Imprimir</button>
        </div>
        <article class="sheet">
          <div class="head">
            <img class="logo" src="${logoUrl()}" alt="Clínica Nova Visão" />
            <svg width="56" height="56" viewBox="0 0 64 64" fill="none" aria-hidden="true">
              <path d="M32 6c6 8 10 12 10 20 0 8-4.5 14-10 18-5.5-4-10-10-10-18C22 18 26 14 32 6Z" stroke="#1e3a5f" stroke-width="2.4" fill="#0d9488"/>
              <circle cx="32" cy="24" r="4.5" fill="#fff"/>
              <path d="M32 44v14M24 50h16M20 56h24" stroke="#1e3a5f" stroke-width="2.4" stroke-linecap="round"/>
              <path d="M18 22c6 4 10 6 14 6s8-2 14-6" stroke="#1e3a5f" stroke-width="2" stroke-linecap="round"/>
              <path d="M18 30c6-3 10-4 14-4s8 1 14 4" stroke="#1e3a5f" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="line"><strong>Nome:</strong> ${escapeHtml(patient.name)}</p>
          <div class="two">
            <p class="line"><strong>Idade:</strong> ${escapeHtml(ageFromBirth(patient.birthDate, prescription.createdAt))}</p>
            <p class="line"><strong>Data:</strong> ${escapeHtml(formatDate(prescription.createdAt))}</p>
          </div>
          <div class="wrap">
            <table>
              <thead>
                <tr>
                  <th></th><th></th>
                  <th>Esférico</th><th>Cilíndrico</th><th>Eixo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="side" rowspan="2">LONGE</td>
                  <td class="od">O.D</td>
                  <td>${escapeHtml(formatDegree(right.spherical))}</td>
                  <td>${escapeHtml(formatDegree(right.cylindrical))}</td>
                  <td>${escapeHtml(formatAxis(right.axis))}</td>
                </tr>
                <tr>
                  <td class="od">O.E</td>
                  <td>${escapeHtml(formatDegree(left.spherical))}</td>
                  <td>${escapeHtml(formatDegree(left.cylindrical))}</td>
                  <td>${escapeHtml(formatAxis(left.axis))}</td>
                </tr>
                <tr>
                  <td class="side" rowspan="2">PERTO</td>
                  <td class="od">O.D</td>
                  <td>${escapeHtml(addDegrees(right.spherical, right.addition))}</td>
                  <td>${escapeHtml(right.addition ? formatDegree(right.cylindrical) : '—')}</td>
                  <td>${escapeHtml(right.addition ? formatAxis(right.axis) : '—')}</td>
                </tr>
                <tr>
                  <td class="od">O.E</td>
                  <td>${escapeHtml(addDegrees(left.spherical, left.addition))}</td>
                  <td>${escapeHtml(left.addition ? formatDegree(left.cylindrical) : '—')}</td>
                  <td>${escapeHtml(left.addition ? formatAxis(left.axis) : '—')}</td>
                </tr>
                <tr>
                  <td colspan="2" style="text-align:left;font-weight:700;font-size:11px">ADIÇÃO</td>
                  <td>${escapeHtml(formatDegree(right.addition))}</td>
                  <td>${escapeHtml(formatDegree(left.addition))}</td>
                  <td>—</td>
                </tr>
              </tbody>
            </table>
            <div class="acuity">
              <p>Acuidade</p>
              <div></div>
            </div>
          </div>
          <div class="checks">
            ${PRINT_CHECKS.map((item) => checkHtml(prescription, item)).join('')}
            ${[...(prescription.lensTypes ?? []), ...(prescription.treatments ?? [])]
              .filter((value) => !PRINT_CHECKS.some((item) => item.value === value))
              .map((value) => checkHtml(prescription, { value, label: value }))
              .join('')}
          </div>
          <p class="line"><strong>OBS:</strong> ${escapeHtml(prescription.notes || '')}</p>
          <p class="legal">CBO 3223-05 define o optometrista como profissional de nível superior com atuação na prevenção, detecção e correção de disfunções visuais não patológicas.</p>
          <div class="stamp">
            <p>CLÍNICA NOVA VISÃO</p>
            ${prescription.doctorName ? `<span>${escapeHtml(prescription.doctorName)}</span>` : ''}
          </div>
        </article>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  return true
}
