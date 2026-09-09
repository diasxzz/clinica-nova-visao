import { useEffect, useState } from 'react'
import AnamnesisSummary from '../components/AnamnesisSummary.jsx'
import { getPatients, savePrescription } from '../storage.js'
import { getStoreName } from '../stores.js'
import { useAuth } from '../AuthContext.jsx'
import { LENS_TYPES, TREATMENTS, toggleOption } from '../lensOptions.js'
import {
  alertError,
  alertSuccess,
  cardSectionMobile,
  chipOff,
  chipOn,
  inputClass,
  inputClassSm,
  labelClass,
  pageSubtitle,
  pageTitle,
} from '../uiClasses.js'

const emptyEye = {
  spherical: '',
  cylindrical: '',
  axis: '',
  dnp: '',
}

const eyeColumns = [
  { name: 'spherical', label: 'Esférico', placeholder: '-1.50' },
  { name: 'cylindrical', label: 'Cilíndrico', placeholder: '-0.75' },
  { name: 'axis', label: 'Eixo', placeholder: '90' },
  { name: 'dnp', label: 'DNP', placeholder: '32' },
]

function PrescriptionEyeGrid({ rightEye, leftEye, onChange }) {
  const eyes = [
    { key: 'od', label: 'O.D', values: rightEye },
    { key: 'oe', label: 'O.E', values: leftEye },
  ]

  return (
    <div className="mb-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700 dark:bg-slate-950/40">
      <table className="w-full min-w-[36rem] border-collapse">
        <thead>
          <tr className="border-b border-slate-200 text-left dark:border-slate-700">
            <th className="w-16 px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400" />
            {eyeColumns.map((column) => (
              <th
                key={column.name}
                className="px-2 py-2.5 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {eyes.map((eye) => (
            <tr key={eye.key} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
              <td className="px-3 py-2 text-sm font-bold text-slate-800 dark:text-slate-100">
                {eye.label}
              </td>
              {eyeColumns.map((column) => (
                <td key={column.name} className="px-2 py-2">
                  <input
                    id={`${eye.key}-${column.name}`}
                    type="text"
                    inputMode="decimal"
                    autoComplete="off"
                    enterKeyHint="next"
                    aria-label={`${eye.label} ${column.label}`}
                    value={eye.values[column.name]}
                    onChange={(event) => onChange(eye.key, column.name, event.target.value)}
                    placeholder={column.placeholder}
                    className={`${inputClassSm} min-h-11`}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function OptionChips({ title, options, selected, onToggle }) {
  return (
    <div className="mb-4">
      <p className={labelClass.replace('mb-1', 'mb-2')}>{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isOn = selected.includes(option)

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={isOn ? chipOn : chipOff}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ConsultationPage() {
  const { isDoctor } = useAuth()
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [rightEye, setRightEye] = useState(emptyEye)
  const [leftEye, setLeftEye] = useState(emptyEye)
  const [addition, setAddition] = useState('')
  const [notes, setNotes] = useState('')
  const [phone, setPhone] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [lensTypes, setLensTypes] = useState([])
  const [treatments, setTreatments] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function loadPatients() {
      try {
        const list = await getPatients()
        setPatients(list)
      } catch (error) {
        setErrorMessage('Não foi possível carregar os pacientes.')
        console.error(error)
      }
    }

    loadPatients()
  }, [])

  const filteredPatients = patients.filter((patient) => {
    const term = search.toLowerCase().trim()
    return (
      patient.name.toLowerCase().includes(term) ||
      patient.cpf.includes(term)
    )
  })

  function handleEyeChange(eyeKey, fieldName, value) {
    const updater = eyeKey === 'od' ? setRightEye : setLeftEye

    updater((current) => ({
      ...current,
      [fieldName]: value,
    }))
  }

  function handleSelectPatient(patient) {
    setSelectedPatient(patient)
    setPhone(patient.phone || '')
    setSearch('')
    setErrorMessage('')
    setSuccessMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSuccessMessage('')

    if (!selectedPatient) {
      setErrorMessage('Selecione um paciente antes de salvar a receita.')
      return
    }

    setIsSaving(true)

    try {
      await savePrescription({
        patientId: selectedPatient.id,
        rightEye: { ...rightEye, addition: addition.trim() },
        leftEye: { ...leftEye, addition: '' },
        notes: notes.trim(),
        doctorName: doctorName.trim(),
        dp: '',
        lensTypes,
        treatments,
      })

      setErrorMessage('')
      setSuccessMessage(
        `Receita de ${selectedPatient.name} salva. A recepção envia os dados para a ótica.`,
      )
    } catch (error) {
      setErrorMessage('Não foi possível salvar a receita. Tente de novo.')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className={cardSectionMobile}>
      <h2 className={`${pageTitle} mb-1`}>Consulta</h2>
      <p className={`${pageSubtitle} mb-4`}>
        Busque o paciente e preencha a prescrição. A recepção envia para a ótica.
      </p>

      {successMessage && <p className={`${alertSuccess} mb-4`}>{successMessage}</p>}
      {errorMessage && <p className={`${alertError} mb-4`}>{errorMessage}</p>}

      <div className="mb-6">
        <label htmlFor="patient-search" className={labelClass}>
          Paciente
        </label>

        {selectedPatient ? (
          <div className="flex flex-col gap-3 rounded-xl border border-teal-200 bg-teal-50 px-3 py-3 dark:border-teal-800 dark:bg-teal-950/30">
            <div>
              <p className="font-medium text-slate-800 dark:text-slate-100">{selectedPatient.name}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">CPF {selectedPatient.cpf}</p>
              <p className="text-sm font-medium text-teal-800 dark:text-teal-300">
                Localidade: {getStoreName(selectedPatient.storeId)}
              </p>
              <AnamnesisSummary anamnesis={selectedPatient.anamnesis} />
              {selectedPatient.notes ? (
                <div className="mt-3 rounded-lg bg-white px-3 py-2 ring-1 ring-teal-200 dark:bg-slate-900 dark:ring-teal-900">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-teal-800 dark:text-teal-300">
                    Observações adicionais
                  </p>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {selectedPatient.notes}
                  </p>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setSelectedPatient(null)}
              className="min-h-12 rounded-xl bg-white px-3 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-700"
            >
              Trocar paciente
            </button>
          </div>
        ) : (
          <>
            <input
              id="patient-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou CPF"
              className={inputClass}
            />

            {patients.length === 0 ? (
              <p className={`${pageSubtitle} mt-2`}>
                Nenhum paciente cadastrado. Cadastre na aba Pacientes.
              </p>
            ) : (
              <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700">
                {filteredPatients.length === 0 ? (
                  <li className="px-3 py-3 text-sm text-slate-500 dark:text-slate-400">
                    Nenhum paciente encontrado.
                  </li>
                ) : (
                  filteredPatients.map((patient) => (
                    <li
                      key={patient.id}
                      className="border-b border-slate-100 last:border-b-0 dark:border-slate-800"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectPatient(patient)}
                        className="flex min-h-14 w-full flex-col justify-center px-3 py-3 text-left active:bg-slate-50 dark:active:bg-slate-800"
                      >
                        <span className="text-base font-medium text-slate-800 dark:text-slate-100">
                          {patient.name}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">{patient.cpf}</span>
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <PrescriptionEyeGrid rightEye={rightEye} leftEye={leftEye} onChange={handleEyeChange} />

        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="sm:w-40">
            <label htmlFor="addition" className={labelClass}>
              Adição
            </label>
            <input
              id="addition"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={addition}
              onChange={(event) => setAddition(event.target.value)}
              placeholder="+2.00"
              className={inputClassSm + ' min-h-11'}
            />
          </div>
          <p className="pb-2 text-xs text-slate-500 dark:text-slate-400 sm:flex-1">
            Um único valor para os dois olhos.
          </p>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3">
          <div>
            <label htmlFor="phone" className={labelClass}>
              Telefone
            </label>
            <input
              id="phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="43999990000"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="doctorName" className={labelClass}>
              Médico
            </label>
            <input
              id="doctorName"
              type="text"
              value={doctorName}
              onChange={(event) => setDoctorName(event.target.value)}
              placeholder="Dr. Silva"
              className={inputClass}
            />
          </div>
          <div>
            <p className={labelClass.replace('mb-1', 'mb-1')}>Ótica de destino</p>
            <p className="rounded-xl bg-teal-50 px-3 py-3 text-base font-medium text-teal-900 dark:bg-teal-950/40 dark:text-teal-200">
              {selectedPatient
                ? getStoreName(selectedPatient.storeId)
                : 'Defina a localidade no cadastro'}
            </p>
          </div>
        </div>

        <OptionChips
          title="Tipo de lente"
          options={LENS_TYPES}
          selected={lensTypes}
          onToggle={(option) => setLensTypes((current) => toggleOption(current, option))}
        />

        <OptionChips
          title="Tratamentos"
          options={TREATMENTS}
          selected={treatments}
          onToggle={(option) => setTreatments((current) => toggleOption(current, option))}
        />

        <div className={isDoctor ? 'mb-24' : 'mb-4'}>
          <label htmlFor="notes" className={labelClass}>
            Observações
          </label>
          <textarea
            id="notes"
            rows="3"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Anotações da consulta"
            className={`${inputClass} min-h-24 resize-y`}
          />
        </div>

        <div
          className={
            isDoctor
              ? 'fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95'
              : ''
          }
        >
          <button
            type="submit"
            disabled={isSaving}
            className="min-h-12 w-full rounded-xl bg-teal-600 px-4 py-3 font-medium text-white disabled:opacity-60"
          >
            {isSaving ? 'Salvando...' : 'Salvar Receita'}
          </button>
        </div>
      </form>
    </section>
  )
}

export default ConsultationPage
