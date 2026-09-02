import logo from './assets/logo-clinica-nova-visao.png'
import { formatAxis, formatDate, formatDegree } from './formatPrescription.js'

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

export function printPrescription({ patient, prescription }) {
  const printWindow = window.open('', '_blank', 'width=820,height=1100')

  if (!printWindow) {
    return false
  }

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Receita Óptica - ${escapeHtml(patient.name)}</title>
        <style>
          @page {
            size: A4;
            margin: 14mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            background: #e2e8f0;
            color: #1e293b;
            font-family: Arial, sans-serif;
          }

          .toolbar {
            display: flex;
            justify-content: flex-end;
            gap: 8px;
            max-width: 190mm;
            margin: 16px auto 0;
          }

          .toolbar button {
            border: 0;
            border-radius: 8px;
            padding: 10px 16px;
            font-weight: 600;
            cursor: pointer;
          }

          .print-btn {
            background: #0d9488;
            color: #fff;
          }

          .sheet {
            max-width: 190mm;
            min-height: 260mm;
            margin: 16px auto 32px;
            padding: 22px 24px 28px;
            background: #fff;
            border: 2px solid #134e4a;
          }

          .logo {
            display: block;
            height: 96px;
            width: auto;
            margin: 0 auto 16px;
            object-fit: contain;
          }

          h1 {
            margin: 0 0 18px;
            text-align: center;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            font-size: 20px;
            border-top: 2px solid #134e4a;
            padding-top: 16px;
          }

          .patient {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px 24px;
            margin-bottom: 22px;
          }

          .patient p {
            margin: 0;
            padding-bottom: 6px;
            border-bottom: 1px solid #cbd5e1;
            font-size: 14px;
          }

          .patient span {
            display: block;
            margin-bottom: 4px;
            font-size: 11px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #64748b;
          }

          h2 {
            margin: 0 0 8px;
            font-size: 13px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #334155;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 22px;
          }

          th, td {
            border: 1px solid #134e4a;
            padding: 10px 8px;
            text-align: center;
          }

          th {
            background: #f0fdfa;
            font-size: 12px;
            text-transform: uppercase;
          }

          td:first-child, th:first-child {
            text-align: left;
            font-weight: 700;
            width: 28%;
          }

          .notes {
            min-height: 72px;
            margin-bottom: 40px;
            padding: 10px 12px;
            border: 1px solid #cbd5e1;
          }

          .notes span {
            display: block;
            margin-bottom: 8px;
            font-size: 11px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            color: #64748b;
          }

          footer {
            display: flex;
            justify-content: space-between;
            gap: 32px;
            margin-top: 48px;
          }

          .line {
            height: 48px;
            margin-bottom: 8px;
            border-bottom: 1px solid #334155;
          }

          .caption {
            margin: 0;
            text-align: center;
            font-size: 12px;
            color: #475569;
          }

          @media print {
            .no-print {
              display: none;
            }

            body {
              background: #fff;
            }

            .sheet {
              margin: 0;
              border-color: #134e4a;
            }
          }
        </style>
      </head>
      <body>
        <div class="toolbar no-print">
          <button class="print-btn no-print" type="button" onclick="window.print()">
            Imprimir
          </button>
        </div>

        <article class="sheet">
          <img class="logo" src="${logoUrl()}" alt="Clínica Nova Visão" />
          <h1>Receita Óptica</h1>

          <section class="patient">
            <p><span>Paciente</span>${escapeHtml(patient.name)}</p>
            <p><span>CPF</span>${escapeHtml(patient.cpf)}</p>
            <p><span>Data de nascimento</span>${escapeHtml(formatDate(patient.birthDate))}</p>
            <p><span>Data da receita</span>${escapeHtml(formatDate(prescription.createdAt))}</p>
          </section>

          <h2>Longe</h2>
          <table>
            <thead>
              <tr>
                <th>Olho</th>
                <th>Esférico</th>
                <th>Cilíndrico</th>
                <th>Eixo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>OD — Direito</td>
                <td>${escapeHtml(formatDegree(prescription.rightEye?.spherical))}</td>
                <td>${escapeHtml(formatDegree(prescription.rightEye?.cylindrical))}</td>
                <td>${escapeHtml(formatAxis(prescription.rightEye?.axis))}</td>
              </tr>
              <tr>
                <td>OE — Esquerdo</td>
                <td>${escapeHtml(formatDegree(prescription.leftEye?.spherical))}</td>
                <td>${escapeHtml(formatDegree(prescription.leftEye?.cylindrical))}</td>
                <td>${escapeHtml(formatAxis(prescription.leftEye?.axis))}</td>
              </tr>
            </tbody>
          </table>

          <h2>Perto</h2>
          <table>
            <thead>
              <tr>
                <th>Olho</th>
                <th colspan="3">Adição</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>OD — Direito</td>
                <td colspan="3">${escapeHtml(formatDegree(prescription.rightEye?.addition))}</td>
              </tr>
              <tr>
                <td>OE — Esquerdo</td>
                <td colspan="3">${escapeHtml(formatDegree(prescription.leftEye?.addition))}</td>
              </tr>
            </tbody>
          </table>

          <div class="notes">
            <span>Tipo de lente</span>
            ${escapeHtml(prescription.lensTypes?.length ? prescription.lensTypes.join(', ') : '—')}
          </div>

          <div class="notes">
            <span>Tratamentos</span>
            ${escapeHtml(prescription.treatments?.length ? prescription.treatments.join(', ') : '—')}
          </div>

          <div class="notes">
            <span>Observações</span>
            ${escapeHtml(prescription.notes) || '—'}
          </div>

          <footer>
            <div style="width:45%">
              <div class="line"></div>
              <p class="caption">Data</p>
            </div>
            <div style="width:45%">
              <div class="line"></div>
              <p class="caption">Assinatura e carimbo</p>
            </div>
          </footer>
        </article>
      </body>
    </html>
  `

  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  return true
}
