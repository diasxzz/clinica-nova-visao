import logo from './assets/logo-clinica-nova-visao.png'
import {
  addDegrees,
  ageFromBirth,
  formatAxis,
  formatDateSlash,
  formatDegree,
} from './formatPrescription.js'
import {
  allTreatmentChecks,
  checkMarkup,
  CLINIC_CONTACT,
  formatAdditionLine,
  formatDpCell,
  formatLensLine,
  formatTreatmentLine,
  lensTypeChecks,
  PRESCRIPTION_PRINT_CSS,
  resolveAddition,
} from './prescriptionTemplate.js'

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

function dpCellHtml(right, left) {
  const dp = formatDpCell(right, left)

  return `
    <td class="dp" rowspan="2">
      <div class="dp-value">${escapeHtml(dp)}</div>
      <span class="dp-mm">mm</span>
    </td>
  `
}

function eyeRowHtml(eye, near, addition) {
  function sphere() {
    if (near) {
      return escapeHtml(addDegrees(eye.spherical, addition))
    }
    return escapeHtml(formatDegree(eye.spherical))
  }

  return `
    <td>${sphere()}</td>
    <td>${escapeHtml(formatDegree(eye.cylindrical))}</td>
    <td>${escapeHtml(formatAxis(eye.axis))}</td>
  `
}

function combinedVisionTableHtml(right, left, addition) {
  return `
    <table>
      <thead>
        <tr>
          <th></th>
          <th></th>
          <th>Esférico</th>
          <th>Cilíndrico</th>
          <th>Eixo</th>
          <th>DNP</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="side" rowspan="2">Para Longe</td>
          <td class="eye">O.D</td>
          ${eyeRowHtml(right, false, addition)}
          ${dpCellHtml(right, left)}
        </tr>
        <tr>
          <td class="eye">O.E.</td>
          ${eyeRowHtml(left, false, addition)}
        </tr>
        <tr>
          <td class="side" rowspan="2">Para Perto</td>
          <td class="eye">O.D</td>
          ${eyeRowHtml(right, true, addition)}
          ${dpCellHtml(right, left)}
        </tr>
        <tr>
          <td class="eye">O.E.</td>
          ${eyeRowHtml(left, true, addition)}
        </tr>
      </tbody>
    </table>
  `
}

export function printPrescription({ patient, prescription }) {
  const printWindow = window.open('', '_blank', 'width=900,height=1200')

  if (!printWindow) {
    return false
  }

  const right = prescription.rightEye ?? {}
  const left = prescription.leftEye ?? {}
  const lensLine = formatLensLine(prescription)
  const treatmentLine = formatTreatmentLine(prescription)
  const addition = resolveAddition(prescription, right, left)
  const additionLine = formatAdditionLine(prescription, right, left)
  const age = ageFromBirth(patient.birthDate, prescription.createdAt)

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Receituário Óptico - ${escapeHtml(patient.name)}</title>
        <style>${PRESCRIPTION_PRINT_CSS}</style>
      </head>
      <body>
        <div class="toolbar no-print">
          <button class="print-btn no-print" type="button" onclick="window.print()">Imprimir</button>
        </div>
        <div class="print-root">
        <article class="sheet">
          <div class="head">
            <img class="logo" src="${logoUrl()}" alt="Clínica Nova Visão" />
            <h1 class="title">Receituário Óptico</h1>
          </div>

          <div class="patient">
            <p class="field">
              <span class="field-label">Nome:</span>
              <span class="field-line">${escapeHtml(patient.name)}</span>
            </p>
            <p class="field">
              <span class="field-label">Idade:</span>
              <span class="field-age">${escapeHtml(age === '—' ? '' : `${age} anos`)}</span>
            </p>
          </div>

          ${combinedVisionTableHtml(right, left, addition)}

          <div class="addition">
            <div class="label">Adição</div>
            <div class="value">${escapeHtml(additionLine)}</div>
          </div>

          <div class="options-grid">
            <div class="section">
              <p class="section-label">Lentes <span>:</span></p>
              <div class="checks">
                ${lensTypeChecks(prescription).map((item) => checkMarkup(prescription, item, escapeHtml)).join('')}
              </div>
              <div class="ruled">${escapeHtml(lensLine)}</div>
            </div>

            <div class="section">
              <p class="section-label">Indicações de tratamento <span>:</span></p>
              <div class="checks">
                ${allTreatmentChecks(prescription)
                  .map((item) => checkMarkup(prescription, item, escapeHtml))
                  .join('')}
              </div>
              <div class="ruled">${escapeHtml(treatmentLine)}</div>
            </div>
          </div>

          <div class="section">
            <p class="section-label">Observações <span>:</span></p>
            <div class="ruled">${escapeHtml(prescription.notes || '')}</div>
          </div>

          <div class="bottom">
            <p class="sign-date">${escapeHtml(formatDateSlash(prescription.createdAt))}</p>
            <div class="sign-box">
              <div class="sign-line"></div>
              <span>Médico Responsável</span>
              ${prescription.doctorName ? `<small>${escapeHtml(prescription.doctorName)}</small>` : ''}
            </div>
            <p class="footer">${escapeHtml(CLINIC_CONTACT.address)} · ${escapeHtml(CLINIC_CONTACT.phoneEmail)}</p>
          </div>
        </article>
        </div>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  return true
}
