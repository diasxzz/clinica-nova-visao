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
const cell = `${border} px-2 py-2.5 text-center text-[13px]`
const headerCell = `${cell} text-[11px] font-bold uppercase tracking-[0.08em]`
const sideCell = `${cell} w-[108px] text-[13px] font-semibold capitalize`

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
      <div className="flex min-h-[72px] items-center justify-center pr-3">{dp}</div>
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
    <article className="prescription-sheet mx-auto w-full max-w-[1145px] bg-gradient-to-b from-white from-[88%] to-[#e8f4fc] px-8 py-10 text-black dark:from-white dark:to-[#e8f4fc] sm:px-14 sm:py-12">
      <header className="mb-7 text-center">
        <div className="mb-3 flex justify-center">
          <ClinicLogo className="h-[168px] w-auto" />
        </div>
        <h1 className="text-[22px] font-bold uppercase tracking-[0.28em] text-black">
          Receituário Óptico
        </h1>
      </header>

      <div className="mb-5 text-[15px] leading-relaxed text-black">
        <p className="mb-3">
          <span className="font-bold">Nome:</span>{' '}
          <span className="inline-block min-w-[72%] border-b border-black px-1 pb-0.5">
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
      <div className="h-[18px]" />
      <VisionTable title="Para Perto" right={right} left={left} near addition={addition} />

      <div className={`mb-5 mt-[18px] grid min-h-[42px] grid-cols-[148px_1fr] ${border}`}>
        <div className="flex items-center justify-center border-r border-black text-[13px] font-bold uppercase tracking-[0.08em]">
          Adição
        </div>
        <div className="flex items-center px-3 text-[14px]">{additionLine}</div>
      </div>

      <div className="mb-4 text-[15px]">
        <p className="mb-2 font-bold">
          Lentes <span className="font-normal">:</span>
        </p>
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
          {lensTypeChecks(prescription).map((item) => (
            <CheckBox key={item.value} on={item.on} label={item.label} />
          ))}
        </div>
        <p className="min-h-7 border-b border-black pb-1 text-[14px]">{lensLine}</p>
        <p className="mt-2.5 min-h-7 border-b border-black pb-1 text-[14px]"></p>
      </div>

      <div className="mb-4 text-[15px]">
        <p className="mb-2 font-bold">Indicações de tratamento :</p>
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
          {allTreatmentChecks(prescription).map((item) => (
            <CheckBox
              key={item.value}
              on={isTreatmentCheckOn(prescription, item.value)}
              label={item.label}
            />
          ))}
        </div>
        <p className="min-h-7 border-b border-black pb-1 text-[14px]">{treatmentLine}</p>
      </div>

      <div className="mb-8 text-[15px]">
        <p className="mb-2 font-bold">Observações :</p>
        <p className="min-h-7 border-b border-black pb-1 text-[14px]">{prescription.notes || ''}</p>
      </div>

      <div className="mb-7 grid grid-cols-2 items-end gap-12 text-[15px]">
        <p className="tracking-[0.08em]">{formatDateSlash(prescription.createdAt)}</p>
        <div className="text-center">
          <div className="mb-1.5 min-h-[42px] border-b border-black"></div>
          <p className="text-[12px] font-bold">Médico Responsável</p>
          {prescription.doctorName ? (
            <p className="mt-1 text-[11px] text-neutral-600">{prescription.doctorName}</p>
          ) : null}
        </div>
      </div>

      <footer className="pt-2 text-center text-[11px] leading-relaxed text-neutral-700">
        <p>{CLINIC_CONTACT.address}</p>
        <p>{CLINIC_CONTACT.phoneEmail}</p>
        <p>{CLINIC_CONTACT.website}</p>
      </footer>
    </article>
  )
}

export default PrescriptionSheet
