import { printPrescription } from '../printPrescription.js'
import PrescriptionSheet from './PrescriptionSheet.jsx'

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
          Use o Chrome ou o Safari do computador para imprimir ou gerar PDF.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="no-print rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Imprimir
          </button>
        </div>
      </div>

      <PrescriptionSheet patient={patient} prescription={prescription} />
    </section>
  )
}

export default PrescriptionPrint
