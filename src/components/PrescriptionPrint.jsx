import ClinicLogo from './ClinicLogo.jsx'
import { formatAxis, formatDate, formatDegree } from '../formatPrescription.js'
import { printPrescription } from '../printPrescription.js'

const cell = 'border border-teal-800 px-2 py-2 text-center text-sm'
const headerCell = `${cell} bg-teal-50 text-xs font-semibold uppercase tracking-wide`

function PrescriptionPrint({ patient, prescription, onBack }) {
  function handlePrint() {
    const opened = printPrescription({ patient, prescription })

    if (!opened) {
      window.print()
    }
  }

  return (
    <section>
      <div className="no-print mb-4 flex flex-col gap-2">
        <p className="text-sm text-slate-500">
          Use o Chrome ou o Safari do celular para imprimir ou gerar PDF.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onBack}
            className="min-h-12 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="no-print min-h-12 rounded-xl bg-teal-600 px-4 py-3 text-sm font-medium text-white"
          >
            Imprimir
          </button>
        </div>
      </div>

      <article className="mx-auto max-w-[210mm] overflow-x-auto border-2 border-teal-800 bg-white p-4 sm:p-8">
        <header className="mb-6 border-b-2 border-teal-800 pb-5">
          <ClinicLogo className="mx-auto h-24 w-auto" />
          <h1 className="mt-5 text-center text-xl font-semibold tracking-[0.2em] text-slate-800 uppercase">
            Receita Óptica
          </h1>
        </header>

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <p className="border-b border-slate-300 pb-1 text-sm">
            <span className="mb-1 block text-xs tracking-wide text-slate-500 uppercase">
              Paciente
            </span>
            {patient.name}
          </p>
          <p className="border-b border-slate-300 pb-1 text-sm">
            <span className="mb-1 block text-xs tracking-wide text-slate-500 uppercase">
              CPF
            </span>
            {patient.cpf}
          </p>
          <p className="border-b border-slate-300 pb-1 text-sm">
            <span className="mb-1 block text-xs tracking-wide text-slate-500 uppercase">
              Data de nascimento
            </span>
            {formatDate(patient.birthDate)}
          </p>
          <p className="border-b border-slate-300 pb-1 text-sm">
            <span className="mb-1 block text-xs tracking-wide text-slate-500 uppercase">
              Data da receita
            </span>
            {formatDate(prescription.createdAt)}
          </p>
        </div>

        <h2 className="mb-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
          Longe
        </h2>
        <div className="mb-6 grid grid-cols-4">
          <div className={headerCell}>Olho</div>
          <div className={headerCell}>Esférico</div>
          <div className={headerCell}>Cilíndrico</div>
          <div className={headerCell}>Eixo</div>

          <div className={`${cell} text-left font-semibold`}>OD — Direito</div>
          <div className={cell}>{formatDegree(prescription.rightEye?.spherical)}</div>
          <div className={cell}>{formatDegree(prescription.rightEye?.cylindrical)}</div>
          <div className={cell}>{formatAxis(prescription.rightEye?.axis)}</div>

          <div className={`${cell} text-left font-semibold`}>OE — Esquerdo</div>
          <div className={cell}>{formatDegree(prescription.leftEye?.spherical)}</div>
          <div className={cell}>{formatDegree(prescription.leftEye?.cylindrical)}</div>
          <div className={cell}>{formatAxis(prescription.leftEye?.axis)}</div>
        </div>

        <h2 className="mb-2 text-sm font-semibold tracking-wide text-slate-700 uppercase">
          Perto
        </h2>
        <div className="mb-6 grid grid-cols-4">
          <div className={headerCell}>Olho</div>
          <div className={`${headerCell} col-span-3`}>Adição</div>

          <div className={`${cell} text-left font-semibold`}>OD — Direito</div>
          <div className={`${cell} col-span-3`}>
            {formatDegree(prescription.rightEye?.addition)}
          </div>

          <div className={`${cell} text-left font-semibold`}>OE — Esquerdo</div>
          <div className={`${cell} col-span-3`}>
            {formatDegree(prescription.leftEye?.addition)}
          </div>
        </div>

        <div className="mb-4 border border-slate-300 p-3">
          <p className="mb-2 text-xs tracking-wide text-slate-500 uppercase">
            Tipo de lente
          </p>
          <p className="text-sm text-slate-800">
            {prescription.lensTypes?.length ? prescription.lensTypes.join(', ') : '—'}
          </p>
        </div>

        <div className="mb-4 border border-slate-300 p-3">
          <p className="mb-2 text-xs tracking-wide text-slate-500 uppercase">
            Tratamentos
          </p>
          <p className="text-sm font-medium text-slate-800">
            {prescription.treatments?.length ? prescription.treatments.join(', ') : '—'}
          </p>
        </div>

        <div className="mb-10 min-h-20 border border-slate-300 p-3">
          <p className="mb-2 text-xs tracking-wide text-slate-500 uppercase">
            Observações
          </p>
          <p className="text-sm text-slate-800">{prescription.notes || '—'}</p>
        </div>

        <footer className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2">
          <div>
            <div className="mb-2 h-12 border-b border-slate-700"></div>
            <p className="text-center text-xs text-slate-500">Data</p>
          </div>
          <div>
            <div className="mb-2 h-12 border-b border-slate-700"></div>
            <p className="text-center text-xs text-slate-500">Assinatura e carimbo</p>
          </div>
        </footer>
      </article>
    </section>
  )
}

export default PrescriptionPrint
