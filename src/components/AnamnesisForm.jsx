import { PATHOLOGY_OPTIONS, calculateAge } from '../anamnesis.js'
import { chipOff, chipOn, inputClassSm, labelClass } from '../uiClasses.js'

function YesNoField({ label, value, onChange }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`${value === true ? chipOn : chipOff} min-h-9 px-4 py-1.5 text-sm`}
        >
          Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`${value === false ? chipOn : chipOff} min-h-9 px-4 py-1.5 text-sm`}
        >
          Não
        </button>
      </div>
    </div>
  )
}

function RxField({ label, rx, onChange }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            OD
          </label>
          <input
            type="text"
            value={rx.od}
            onChange={(event) => onChange({ ...rx, od: event.target.value })}
            placeholder="Ex: -2,00 -0,50 180"
            className={inputClassSm}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            OE
          </label>
          <input
            type="text"
            value={rx.oe}
            onChange={(event) => onChange({ ...rx, oe: event.target.value })}
            placeholder="Ex: -1,75 -0,25 90"
            className={inputClassSm}
          />
        </div>
      </div>
    </div>
  )
}

function AnamnesisForm({ value, onChange, patientName = '', birthDate = '' }) {
  const age = calculateAge(birthDate)
  const today = new Date().toLocaleDateString('pt-BR')

  function update(field, nextValue) {
    onChange({ ...value, [field]: nextValue })
  }

  function togglePathology(pathologyId) {
    const current = value.pathologies ?? []
    const next = current.includes(pathologyId)
      ? current.filter((id) => id !== pathologyId)
      : [...current, pathologyId]

    update('pathologies', next)
  }

  return (
    <section className="mb-4 rounded-xl border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
      <div className="mb-4 border-b border-slate-200 pb-3 dark:border-slate-700">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-700 dark:text-teal-300">
          Anamnese optométrica
        </p>
        <h3 className="mt-1 text-lg font-semibold text-slate-800 dark:text-slate-100">
          Ficha de saúde visual
        </h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Preencha com o paciente antes da consulta.
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Data
          </p>
          <p className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
            {today}
          </p>
        </div>
        <div className="col-span-2 sm:col-span-2">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Nome
          </p>
          <p className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
            {patientName.trim() || '—'}
          </p>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Idade
          </p>
          <p className="rounded-lg bg-white px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700">
            {age != null ? `${age} anos` : '—'}
          </p>
        </div>
      </div>

      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <YesNoField
          label="Pressão alta"
          value={value.highBloodPressure}
          onChange={(next) => update('highBloodPressure', next)}
        />
        <YesNoField
          label="Diabetes"
          value={value.diabetes}
          onChange={(next) => update('diabetes', next)}
        />
        <YesNoField
          label="Medicamentos de uso contínuo"
          value={value.continuousMedications}
          onChange={(next) => update('continuousMedications', next)}
        />
        <YesNoField
          label="Cirurgia ocular"
          value={value.ocularSurgery}
          onChange={(next) => update('ocularSurgery', next)}
        />
      </div>

      {value.continuousMedications === true ? (
        <div className="mb-4">
          <label htmlFor="medicationsDetail" className={labelClass}>
            Quais medicamentos?
          </label>
          <input
            id="medicationsDetail"
            type="text"
            value={value.continuousMedicationsDetail}
            onChange={(event) => update('continuousMedicationsDetail', event.target.value)}
            placeholder="Nome dos medicamentos"
            className={inputClassSm}
          />
        </div>
      ) : null}

      {value.ocularSurgery === true ? (
        <div className="mb-4">
          <label htmlFor="surgeryDetail" className={labelClass}>
            Qual cirurgia?
          </label>
          <input
            id="surgeryDetail"
            type="text"
            value={value.ocularSurgeryDetail}
            onChange={(event) => update('ocularSurgeryDetail', event.target.value)}
            placeholder="Ex: catarata, refrativa..."
            className={inputClassSm}
          />
        </div>
      ) : null}

      <div className="mb-4">
        <YesNoField
          label="Patologia"
          value={value.hasPathology}
          onChange={(next) => update('hasPathology', next)}
        />
      </div>

      {value.hasPathology === true ? (
        <div className="mb-4 rounded-lg bg-white p-3 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <p className={`${labelClass} mb-2`}>Selecione as doenças que se enquadram</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PATHOLOGY_OPTIONS.map((option) => {
              const checked = (value.pathologies ?? []).includes(option.id)

              return (
                <label
                  key={option.id}
                  className={`flex cursor-pointer items-start gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                    checked
                      ? 'bg-teal-50 text-teal-900 dark:bg-teal-950/40 dark:text-teal-100'
                      : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => togglePathology(option.id)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span>{option.label}</span>
                </label>
              )
            })}
          </div>
          <div className="mt-3">
            <label htmlFor="pathologyOther" className={labelClass}>
              Outra patologia
            </label>
            <input
              id="pathologyOther"
              type="text"
              value={value.pathologyOther}
              onChange={(event) => update('pathologyOther', event.target.value)}
              placeholder="Descreva se não estiver na lista"
              className={inputClassSm}
            />
          </div>
        </div>
      ) : null}

      <div className="mb-4 grid gap-4 lg:grid-cols-2">
        <RxField
          label="RX anterior"
          rx={value.previousRx}
          onChange={(next) => update('previousRx', next)}
        />
        <RxField label="RX atual" rx={value.currentRx} onChange={(next) => update('currentRx', next)} />
      </div>

      <div>
        <label htmlFor="anamnesisObs" className={labelClass}>
          Observações (OBS)
        </label>
        <textarea
          id="anamnesisObs"
          rows="3"
          value={value.observations}
          onChange={(event) => update('observations', event.target.value)}
          placeholder="Queixas, histórico, alergias, informações adicionais..."
          className={`${inputClassSm} min-h-24 resize-y`}
        />
      </div>
    </section>
  )
}

export default AnamnesisForm
