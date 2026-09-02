import { useEffect, useState } from 'react'
import { getPatients, savePrescription } from '../storage.js'
import { getStoreName } from '../stores.js'
import { useAuth } from '../AuthContext.jsx'
import { LENS_TYPES, TREATMENTS, toggleOption } from '../lensOptions.js'

const emptyEye = {
  spherical: '',
  cylindrical: '',
  axis: '',
  addition: '',
  dnp: '',
}

const inputClass =
  'w-full min-h-12 rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'

function EyeFields({ title, eyeKey, values, onChange }) {
  const fields = [
    { name: 'spherical', label: 'Esférico', placeholder: '-1.50' },
    { name: 'cylindrical', label: 'Cilíndrico', placeholder: '-0.75' },
    { name: 'axis', label: 'Eixo', placeholder: '90' },
    { name: 'addition', label: 'Adição', placeholder: '+2.00' },
    { name: 'dnp', label: 'DNP', placeholder: '32' },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 p-3 sm:p-4">
      <h3 className="mb-3 text-base font-semibold text-slate-800">{title}</h3>

      <div className="grid grid-cols-2 gap-3">
        {fields.map((field) => (
          <div key={field.name} className={field.name === 'dnp' ? 'col-span-2 sm:col-span-1' : ''}>
            <label
              htmlFor={`${eyeKey}-${field.name}`}
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              {field.label}
            </label>
            <input
              id={`${eyeKey}-${field.name}`}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              enterKeyHint="next"
              value={values[field.name]}
              onChange={(event) => onChange(eyeKey, field.name, event.target.value)}
              placeholder={field.placeholder}
              className={inputClass}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function OptionChips({ title, options, selected, onToggle }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-sm font-medium text-slate-700">{title}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isOn = selected.includes(option)

          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={
                isOn
                  ? 'min-h-11 rounded-full bg-teal-600 px-4 py-2 text-sm font-medium text-white'
                  : 'min-h-11 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700'
              }
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
  const [notes, setNotes] = useState('')
  const [phone, setPhone] = useState('')
  const [doctorName, setDoctorName] = useState('')
  const [dp, setDp] = useState('')
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
        rightEye,
        leftEye,
        notes: notes.trim(),
        doctorName: doctorName.trim(),
        dp: dp.trim(),
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
    <section className="mx-auto max-w-md rounded-2xl bg-white p-3 shadow-sm">
      <h2 className="mb-1 text-xl font-semibold text-slate-800">
        Consulta
      </h2>
      <p className="mb-4 text-sm text-slate-500">
        Busque o paciente e preencha a prescrição. A recepção envia para a ótica.
      </p>

      {successMessage && (
        <p className="mb-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">
          {successMessage}
        </p>
      )}

      {errorMessage && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <div className="mb-6">
        <label htmlFor="patient-search" className="mb-1 block text-sm font-medium text-slate-700">
          Paciente
        </label>

        {selectedPatient ? (
          <div className="flex flex-col gap-3 rounded-xl border border-teal-200 bg-teal-50 px-3 py-3">
            <div>
              <p className="font-medium text-slate-800">{selectedPatient.name}</p>
              <p className="text-sm text-slate-500">CPF {selectedPatient.cpf}</p>
              <p className="text-sm font-medium text-teal-800">
                Localidade: {getStoreName(selectedPatient.storeId)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedPatient(null)}
              className="min-h-12 rounded-xl bg-white px-3 py-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200"
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
              <p className="mt-2 text-sm text-slate-500">
                Nenhum paciente cadastrado. Cadastre na aba Pacientes.
              </p>
            ) : (
              <ul className="mt-2 max-h-56 overflow-y-auto rounded-xl border border-slate-200">
                {filteredPatients.length === 0 ? (
                  <li className="px-3 py-3 text-sm text-slate-500">
                    Nenhum paciente encontrado.
                  </li>
                ) : (
                  filteredPatients.map((patient) => (
                    <li key={patient.id} className="border-b border-slate-100 last:border-b-0">
                      <button
                        type="button"
                        onClick={() => handleSelectPatient(patient)}
                        className="flex min-h-14 w-full flex-col justify-center px-3 py-3 text-left active:bg-slate-50"
                      >
                        <span className="text-base font-medium text-slate-800">
                          {patient.name}
                        </span>
                        <span className="text-sm text-slate-500">{patient.cpf}</span>
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
        <div className="mb-4 grid grid-cols-1 gap-3">
          <EyeFields
            title="Olho direito (OD)"
            eyeKey="od"
            values={rightEye}
            onChange={handleEyeChange}
          />
          <EyeFields
            title="Olho esquerdo (OE)"
            eyeKey="oe"
            values={leftEye}
            onChange={handleEyeChange}
          />
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3">
          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
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
            <label htmlFor="doctorName" className="mb-1 block text-sm font-medium text-slate-700">
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
            <label htmlFor="dp" className="mb-1 block text-sm font-medium text-slate-700">
              DP
            </label>
            <input
              id="dp"
              type="text"
              inputMode="decimal"
              value={dp}
              onChange={(event) => setDp(event.target.value)}
              placeholder="63.5"
              className={inputClass}
            />
          </div>
          <div>
            <p className="mb-1 text-sm font-medium text-slate-700">Ótica de destino</p>
            <p className="rounded-xl bg-teal-50 px-3 py-3 text-base font-medium text-teal-900">
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
          <label htmlFor="notes" className="mb-1 block text-sm font-medium text-slate-700">
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
              ? 'fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 border-t border-slate-200 bg-white/95 p-3 backdrop-blur'
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
