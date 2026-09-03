import ClinicLogo from './ClinicLogo.jsx'
import ClinicMark from './ClinicMark.jsx'
import { addDegrees, ageFromBirth, formatAxis, formatDate, formatDegree } from '../formatPrescription.js'
import { isPrintCheckOn, PRINT_CHECKS } from '../printChecks.js'

const cell = 'border border-teal-800 px-2 py-2 text-center text-sm'
const headerCell = `${cell} bg-teal-50 text-xs font-semibold uppercase tracking-wide`
const sideCell = `${cell} w-10 bg-teal-50 text-xs font-bold tracking-widest text-teal-900`

function CheckBox({ on, label }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-800">
      <span
        className={
          on
            ? 'inline-flex h-3.5 w-3.5 items-center justify-center border border-teal-800 bg-teal-700 text-[9px] font-bold text-white'
            : 'inline-block h-3.5 w-3.5 border border-teal-800'
        }
      >
        {on ? '✓' : ''}
      </span>
      {label}
    </span>
  )
}

function PrescriptionSheet({ patient, prescription }) {
  const right = prescription.rightEye ?? {}
  const left = prescription.leftEye ?? {}

  return (
    <article className="mx-auto max-w-[210mm] overflow-x-auto border-2 border-teal-800 bg-white p-5 sm:p-8">
      <header className="mb-5 flex items-center justify-between gap-4 border-b-2 border-teal-800 pb-4">
        <ClinicLogo className="h-20 w-auto sm:h-24" />
        <ClinicMark className="h-14 w-14 shrink-0 sm:h-16 sm:w-16" />
      </header>

      <div className="mb-5 space-y-2 text-sm">
        <p className="border-b border-slate-400 pb-1">
          <span className="font-semibold">Nome:</span> {patient.name}
        </p>
        <div className="grid grid-cols-2 gap-6">
          <p className="border-b border-slate-400 pb-1">
            <span className="font-semibold">Idade:</span>{' '}
            {ageFromBirth(patient.birthDate, prescription.createdAt)}
          </p>
          <p className="border-b border-slate-400 pb-1">
            <span className="font-semibold">Data:</span> {formatDate(prescription.createdAt)}
          </p>
        </div>
      </div>

      <div className="mb-5 flex gap-3">
        <table className="min-w-0 flex-1 border-collapse">
          <thead>
            <tr>
              <th className={`${headerCell} w-10`}></th>
              <th className={`${headerCell} w-12`}></th>
              <th className={headerCell}>Esférico</th>
              <th className={headerCell}>Cilíndrico</th>
              <th className={headerCell}>Eixo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowSpan={2} className={sideCell}>
                <span className="inline-block rotate-180 [writing-mode:vertical-rl]">Longe</span>
              </td>
              <td className={`${cell} font-semibold`}>O.D</td>
              <td className={cell}>{formatDegree(right.spherical)}</td>
              <td className={cell}>{formatDegree(right.cylindrical)}</td>
              <td className={cell}>{formatAxis(right.axis)}</td>
            </tr>
            <tr>
              <td className={`${cell} font-semibold`}>O.E</td>
              <td className={cell}>{formatDegree(left.spherical)}</td>
              <td className={cell}>{formatDegree(left.cylindrical)}</td>
              <td className={cell}>{formatAxis(left.axis)}</td>
            </tr>
            <tr>
              <td rowSpan={2} className={sideCell}>
                <span className="inline-block rotate-180 [writing-mode:vertical-rl]">Perto</span>
              </td>
              <td className={`${cell} font-semibold`}>O.D</td>
              <td className={cell}>{addDegrees(right.spherical, right.addition)}</td>
              <td className={cell}>{right.addition ? formatDegree(right.cylindrical) : '—'}</td>
              <td className={cell}>{right.addition ? formatAxis(right.axis) : '—'}</td>
            </tr>
            <tr>
              <td className={`${cell} font-semibold`}>O.E</td>
              <td className={cell}>{addDegrees(left.spherical, left.addition)}</td>
              <td className={cell}>{left.addition ? formatDegree(left.cylindrical) : '—'}</td>
              <td className={cell}>{left.addition ? formatAxis(left.axis) : '—'}</td>
            </tr>
            <tr>
              <td rowSpan={2} className={sideCell}>
                <span className="inline-block rotate-180 [writing-mode:vertical-rl]">Adição</span>
              </td>
              <td className={`${cell} font-semibold`}>O.D</td>
              <td className={cell}>{formatDegree(right.addition)}</td>
              <td className={cell}></td>
              <td className={cell}></td>
            </tr>
            <tr>
              <td className={`${cell} font-semibold`}>O.E</td>
              <td className={cell}>{formatDegree(left.addition)}</td>
              <td className={cell}></td>
              <td className={cell}></td>
            </tr>
          </tbody>
        </table>

        <div className="flex w-24 shrink-0 flex-col border border-teal-800">
          <p className="border-b border-teal-800 bg-teal-50 px-1 py-2 text-center text-[10px] font-semibold uppercase tracking-wide">
            Acuidade
          </p>
          <div className="min-h-16 flex-1"></div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
        {PRINT_CHECKS.map((item) => (
          <CheckBox
            key={item.value}
            on={isPrintCheckOn(prescription, item.value)}
            label={item.label}
          />
        ))}
        {(prescription.lensTypes ?? [])
          .concat(prescription.treatments ?? [])
          .filter((value) => !PRINT_CHECKS.some((item) => item.value === value))
          .map((value) => (
            <CheckBox key={value} on label={value} />
          ))}
      </div>

      <p className="mb-6 border-b border-slate-400 pb-6 text-sm">
        <span className="font-semibold">OBS:</span> {prescription.notes || ''}
      </p>

      <p className="mb-8 text-center text-[10px] leading-snug text-slate-600">
        CBO 3223-05 define o optometrista como profissional de nível superior com atuação na
        prevenção, detecção e correção de disfunções visuais não patológicas.
      </p>

      <div className="mx-auto w-56 rounded-xl border border-slate-400 px-4 pb-3 pt-10 text-center">
        <p className="border-t border-slate-500 pt-2 text-xs font-semibold tracking-wide text-slate-700">
          CLÍNICA NOVA VISÃO
        </p>
        {prescription.doctorName ? (
          <p className="mt-1 text-[11px] text-slate-500">{prescription.doctorName}</p>
        ) : null}
      </div>
    </article>
  )
}

export default PrescriptionSheet
