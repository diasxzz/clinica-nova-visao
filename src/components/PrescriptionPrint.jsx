import { printPrescription } from '../printPrescription.js'
import PrescriptionSheet from './PrescriptionSheet.jsx'
import { btnPrimary, btnSecondary, pageSubtitle } from '../uiClasses.js'

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
        <p className={pageSubtitle}>
          Use o Chrome ou o Safari do computador para imprimir ou gerar PDF.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={onBack} className={btnSecondary}>
            Voltar
          </button>
          <button type="button" onClick={handlePrint} className={`no-print ${btnPrimary}`}>
            Imprimir
          </button>
        </div>
      </div>

      <PrescriptionSheet patient={patient} prescription={prescription} />
    </section>
  )
}

export default PrescriptionPrint
