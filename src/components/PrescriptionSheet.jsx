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
    <td rowSpan={2} className={`${cell} relative w-[72px] px-1 align-middle`}>
      <div className="flex min-h-[52px] items-center justify-center pr-3">{dp}</div>
      <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[11px] font-bold [text-orientation:upright] [writing-mode:vertical-rl]">
        mm
      </span>
    </td>
  )
}

function VisionTable({ title, right, left, near = false, addition = '' }) {
  return (
    <table className="w-full border-collapse table-fixed">
      <thead>
        <tr>
          <th className={`${headerCell} w-[108px]`}></th>
          <th className={`${headerCell} w-[52px]`}></th>
          <th className={headerCell}>Esférico</th>
          <th className={headerCell}>Cilíndrico</th>
          <th className={headerCell}>Eixo</th>
          <th className={`${headerCell} w-[72px]`}>DNP</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td rowSpan={2} className={sideCell}>
            {title}
          </td>
          <td className={`${cell} font-bold`}>O.D</td>
          <td className={cell}>
            {near ? addDegrees(right.spherical, addition) : formatDegree(right.spherical)}
          </td>
          <td className={cell}>{formatDegree(right.cylindrical)}</td>
          <td className={cell}>{formatAxis(right.axis)}</td>
          <DpCell right={right} left={left} />
        </tr>
        <tr>
          <td className={`${cell} font-bold`}>O.E.</td>
          <td className={cell}>
            {near ? addDegrees(left.spherical, addition) : formatDegree(left.spherical)}
          </td>
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
    <article className="prescription-sheet mx-auto w-full max-w-[1145px] bg-gradient-to-b from-white from-[88%] to-[#e8f4fc] px-6 py-6 text-black dark:from-white dark:to-[#e8f4fc] sm:px-10 sm:py-8">
      <header className="mb-4 text-center">
        <div className="mb-2 flex justify-center">
          <ClinicLogo className="h-24 w-auto print:h-[84px]" />
        </div>
        <h1 className="text-lg font-bold uppercase tracking-[0.18em] text-black print:text-base">
          Receituário Óptico
        </h1>
      </header>

      <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-[13px] leading-snug text-black print:mb-2 print:text-xs">
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

      <VisionTable title="Para Longe" right={right} left={left} />
      <div className="h-1.5 print:h-1" />
      <VisionTable title="Para Perto" right={right} left={left} near addition={addition} />

      <div className={`mb-3 mt-2 grid min-h-[30px] grid-cols-[120px_1fr] ${border} print:mb-2 print:mt-1.5`}>
        <div className="flex items-center justify-center border-r border-black text-[11px] font-bold uppercase tracking-[0.08em]">
          Adição
        </div>
        <div className="flex items-center px-3 text-[12px]">{additionLine}</div>
      </div>

      <div className="mb-2 text-[13px] print:mb-1.5 print:text-xs">
        <p className="mb-1 font-bold">
          Lentes <span className="font-normal">:</span>
        </p>
        <div className="mb-1 flex flex-wrap gap-x-3 gap-y-1">
          {lensTypeChecks(prescription).map((item) => (
            <CheckBox key={item.value} on={item.on} label={item.label} />
          ))}
        </div>
        <p className="min-h-5 border-b border-black pb-0.5 text-[12px] print:min-h-4">{lensLine}</p>
      </div>

      <div className="mb-2 text-[13px] print:mb-1.5 print:text-xs">
        <p className="mb-1 font-bold">Indicações de tratamento :</p>
        <div className="mb-1 flex flex-wrap gap-x-3 gap-y-1">
          {allTreatmentChecks(prescription).map((item) => (
            <CheckBox
              key={item.value}
              on={isTreatmentCheckOn(prescription, item.value)}
              label={item.label}
            />
          ))}
        </div>
        <p className="min-h-5 border-b border-black pb-0.5 text-[12px] print:min-h-4">{treatmentLine}</p>
      </div>

      <div className="mb-4 text-[13px] print:mb-2 print:text-xs">
        <p className="mb-1 font-bold">Observações :</p>
        <p className="min-h-5 border-b border-black pb-0.5 text-[12px] print:min-h-4">{prescription.notes || ''}</p>
      </div>

      <div className="mb-4 grid grid-cols-2 items-end gap-8 text-[13px] print:mb-2 print:gap-6 print:text-xs">
        <p className="tracking-[0.08em]">{formatDateSlash(prescription.createdAt)}</p>
        <div className="text-center">
          <div className="mb-1 min-h-7 border-b border-black print:min-h-6"></div>
          <p className="text-[11px] font-bold">Médico Responsável</p>
          {prescription.doctorName ? (
            <p className="mt-0.5 text-[10px] text-neutral-600">{prescription.doctorName}</p>
          ) : null}
        </div>
      </div>

      <footer className="pt-1 text-center text-[10px] leading-snug text-neutral-700 print:pt-0">
        <p>{CLINIC_CONTACT.address}</p>
        <p>{CLINIC_CONTACT.phoneEmail}</p>
      </footer>
    </article>
  )
}

export default PrescriptionSheet
