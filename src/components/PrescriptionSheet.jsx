import ClinicLogo from './ClinicLogo.jsx'
import {
  addDegrees,
  ageFromBirth,
  formatAxis,
  formatDateSlash,
  formatDegree,
} from '../formatPrescription.js'
import {
  allTreatmentChecks,
  CLINIC_CONTACT,
  formatAdditionLine,
  formatDpCell,
  formatLensLine,
  formatTreatmentLine,
  isTreatmentCheckOn,
  lensTypeChecks,
  resolveAddition,
} from '../prescriptionTemplate.js'

const border = 'border border-black'
const cell = `${border} px-1.5 py-1.5 text-center text-[12px]`
const headerCell = `${cell} text-[10px] font-bold uppercase tracking-[0.06em]`
const sideCell = `${cell} w-[96px] text-[12px] font-semibold capitalize`

function CheckBox({ on, label }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-black">
      <span
        className={
          on
            ? 'inline-flex h-[11px] w-[11px] items-center justify-center border border-black bg-black text-[8px] font-bold leading-none text-white'
            : 'inline-block h-[11px] w-[11px] border border-black'
        }
      >
        {on ? '✓' : ''}
      </span>
      {label}
    </span>
  )
}

function DpCell({ right, left }) {
  const dp = formatDpCell(right, left)

  return (
    <td rowSpan={2} className={`${cell} relative w-[56px] px-1 align-middle`}>
      <div className="flex min-h-[36px] items-center justify-center pr-2 print:min-h-[28px]">{dp}</div>
      <span className="absolute right-0.5 top-1/2 -translate-y-1/2 text-[9px] font-bold [text-orientation:upright] [writing-mode:vertical-rl] print:text-[8px]">
        mm
      </span>
    </td>
  )
}

function CombinedVisionTable({ right, left, addition }) {
  return (
    <table className="w-full border-collapse table-fixed">
      <thead>
        <tr>
          <th className={`${headerCell} w-[84px]`}></th>
          <th className={`${headerCell} w-[42px]`}></th>
          <th className={headerCell}>Esférico</th>
          <th className={headerCell}>Cilíndrico</th>
          <th className={headerCell}>Eixo</th>
          <th className={`${headerCell} w-[56px]`}>DNP</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowSpan={2} className={sideCell}>
            Para Longe
          </td>
          <td className={`${cell} font-bold`}>O.D</td>
          <td className={cell}>{formatDegree(right.spherical)}</td>
          <td className={cell}>{formatDegree(right.cylindrical)}</td>
          <td className={cell}>{formatAxis(right.axis)}</td>
          <DpCell right={right} left={left} />
        </tr>
        <tr>
          <td className={`${cell} font-bold`}>O.E.</td>
          <td className={cell}>{formatDegree(left.spherical)}</td>
          <td className={cell}>{formatDegree(left.cylindrical)}</td>
          <td className={cell}>{formatAxis(left.axis)}</td>
        </tr>
        <tr>
          <td rowSpan={2} className={sideCell}>
            Para Perto
          </td>
          <td className={`${cell} font-bold`}>O.D</td>
          <td className={cell}>{addDegrees(right.spherical, addition)}</td>
          <td className={cell}>{formatDegree(right.cylindrical)}</td>
          <td className={cell}>{formatAxis(right.axis)}</td>
          <DpCell right={right} left={left} />
        </tr>
        <tr>
          <td className={`${cell} font-bold`}>O.E.</td>
          <td className={cell}>{addDegrees(left.spherical, addition)}</td>
          <td className={cell}>{formatDegree(left.cylindrical)}</td>
          <td className={cell}>{formatAxis(left.axis)}</td>
        </tr>
      </tbody>
    </table>
  )
}

function PrescriptionSheet({ patient, prescription }) {
  const right = prescription.rightEye ?? {}
  const left = prescription.leftEye ?? {}
  const lensLine = formatLensLine(prescription)
  const treatmentLine = formatTreatmentLine(prescription)
  const addition = resolveAddition(prescription, right, left)
  const additionLine = formatAdditionLine(prescription, right, left)
  const age = ageFromBirth(patient.birthDate, prescription.createdAt)

  return (
    <article className="prescription-sheet mx-auto w-full max-w-[1145px] bg-gradient-to-b from-white from-[88%] to-[#e8f4fc] px-6 py-6 text-black dark:from-white dark:to-[#e8f4fc] sm:px-10 sm:py-8 print:max-w-none print:px-0 print:py-0">
      <header className="mb-3 text-center print:mb-2">
        <div className="mb-1 flex justify-center">
          <ClinicLogo className="h-20 w-auto print:h-14" />
        </div>
        <h1 className="text-base font-bold uppercase tracking-[0.14em] text-black print:text-sm">
          Receituário Óptico
        </h1>
      </header>

      <div className="mb-2 flex flex-wrap gap-x-6 gap-y-1 text-xs leading-snug text-black print:mb-1.5">
        <p>
          <span className="font-bold">Nome:</span>{' '}
          <span className="inline-block min-w-[12rem] border-b border-black px-1 pb-0.5">
            {patient.name}
          </span>
        </p>
        <p>
          <span className="font-bold">Idade:</span>{' '}
          <span className="inline-block min-w-[48px] border-b border-black px-1 pb-0.5">
            {age === '—' ? '' : `${age} anos`}
          </span>
        </p>
      </div>

      <CombinedVisionTable right={right} left={left} addition={addition} />

      <div className={`mb-2 mt-1.5 grid min-h-[24px] grid-cols-[96px_1fr] ${border} print:mb-1.5 print:mt-1`}>
        <div className="flex items-center justify-center border-r border-black text-[10px] font-bold uppercase tracking-[0.06em]">
          Adição
        </div>
        <div className="flex items-center px-2 text-[11px]">{additionLine}</div>
      </div>

      <div className="mb-2 grid grid-cols-1 gap-3 md:grid-cols-2 print:mb-1.5 print:gap-2">
        <div className="text-[11px] print:text-[10px]">
          <p className="mb-0.5 font-bold">
            Lentes <span className="font-normal">:</span>
          </p>
          <div className="mb-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
            {lensTypeChecks(prescription).map((item) => (
              <CheckBox key={item.value} on={item.on} label={item.label} />
            ))}
          </div>
          <p className="min-h-4 border-b border-black pb-0.5 text-[11px]">{lensLine}</p>
        </div>

        <div className="text-[11px] print:text-[10px]">
          <p className="mb-0.5 font-bold">Indicações de tratamento :</p>
          <div className="mb-0.5 flex flex-wrap gap-x-2 gap-y-0.5">
            {allTreatmentChecks(prescription).map((item) => (
              <CheckBox
                key={item.value}
                on={isTreatmentCheckOn(prescription, item.value)}
                label={item.label}
              />
            ))}
          </div>
          <p className="min-h-4 border-b border-black pb-0.5 text-[11px]">{treatmentLine}</p>
        </div>
      </div>

      <div className="mb-2 text-[11px] print:mb-1.5 print:text-[10px]">
        <p className="mb-0.5 font-bold">Observações :</p>
        <p className="min-h-4 border-b border-black pb-0.5">{prescription.notes || ''}</p>
      </div>

      <div className="mb-2 grid grid-cols-2 items-end gap-6 text-[11px] print:mb-1 print:gap-4 print:text-[10px]">
        <p className="tracking-[0.06em]">{formatDateSlash(prescription.createdAt)}</p>
        <div className="text-center">
          <div className="mb-0.5 min-h-5 border-b border-black print:min-h-4"></div>
          <p className="text-[10px] font-bold">Médico Responsável</p>
          {prescription.doctorName ? (
            <p className="mt-0.5 text-[9px] text-neutral-600">{prescription.doctorName}</p>
          ) : null}
        </div>
      </div>

      <footer className="text-center text-[9px] leading-snug text-neutral-700 print:pt-0">
        <p>
          {CLINIC_CONTACT.address} · {CLINIC_CONTACT.phoneEmail}
        </p>
      </footer>
    </article>
  )
}

export default PrescriptionSheet
