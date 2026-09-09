import { useEffect, useState } from 'react'
import { emptyAnamnesis, mergeAnamnesis } from '../anamnesis.js'
import AnamnesisForm from './AnamnesisForm.jsx'
import { savePatient, updatePatient } from '../storage.js'
import { STORES } from '../stores.js'
import { useAuth } from '../AuthContext.jsx'
import {
  alertError,
  alertSuccess,
  btnPrimary,
  btnSecondary,
  inputClassSm,
  labelClass,
  pageSubtitle,
  pageTitle,
} from '../uiClasses.js'

function PatientForm({ patient, onSaved, onCancel }) {
  const isEditing = Boolean(patient?.id)
  const { profile, isAdmin } = useAuth()
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [anamnesis, setAnamnesis] = useState(emptyAnamnesis)
  const [storeId, setStoreId] = useState(String(profile?.storeId || 1))
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isAdmin && profile?.storeId) {
      setStoreId(String(profile.storeId))
    }
  }, [isAdmin, profile])

  useEffect(() => {
    if (!patient) {
      return
    }

    setName(patient.name ?? '')
    setBirthDate(patient.birthDate ?? '')
    setCpf(patient.cpf ?? '')
    setPhone(patient.phone ?? '')
    setNotes(patient.notes ?? '')
    setAnamnesis(mergeAnamnesis(patient.anamnesis))
    setStoreId(String(patient.storeId ?? profile?.storeId ?? 1))
    setSuccessMessage('')
    setErrorMessage('')
  }, [patient, profile?.storeId])

  function formatCpf(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11)

    return digits
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  function handleCpfChange(event) {
    setCpf(formatCpf(event.target.value))
  }

  function resetForm() {
    setName('')
    setBirthDate('')
    setCpf('')
    setPhone('')
    setNotes('')
    setAnamnesis(emptyAnamnesis())
    setStoreId(String(profile?.storeId || 1))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSaving(true)

    const payload = {
      name: name.trim(),
      birthDate,
      cpf,
      phone: phone.trim(),
      notes: notes.trim(),
      anamnesis,
      storeId,
    }

    try {
      const savedPatient = isEditing
        ? await updatePatient(patient.id, payload)
        : await savePatient(payload)

      if (!isEditing) {
        resetForm()
      }

      setSuccessMessage(
        isEditing ? 'Cadastro atualizado com sucesso.' : 'Paciente cadastrado com sucesso.',
      )
      onSaved?.(savedPatient)
    } catch (error) {
      setErrorMessage(
        isEditing
          ? 'Não foi possível atualizar o cadastro. Tente de novo.'
          : 'Não foi possível salvar o paciente. Tente de novo.',
      )
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <h2 className={`${pageTitle} mb-1 text-lg`}>
        {isEditing ? 'Editar cadastro' : 'Novo paciente'}
      </h2>
      <p className={`${pageSubtitle} mb-4`}>
        {isEditing
          ? 'Atualize os dados e a anamnese optométrica do paciente.'
          : 'Cadastre o paciente e preencha a anamnese optométrica com ele na recepção.'}
      </p>

      {successMessage && <p className={`${alertSuccess} mb-3`}>{successMessage}</p>}
      {errorMessage && <p className={`${alertError} mb-3`}>{errorMessage}</p>}

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label htmlFor="name" className={labelClass}>
            Nome
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Nome completo"
            required
            className={inputClassSm}
          />
        </div>

        <div>
          <label htmlFor="birthDate" className={labelClass}>
            Data de nascimento
          </label>
          <input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            required
            className={inputClassSm}
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            Telefone
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="43999990000"
            className={inputClassSm}
          />
        </div>

        <div>
          <label htmlFor="cpf" className={labelClass}>
            CPF
          </label>
          <input
            id="cpf"
            type="text"
            value={cpf}
            onChange={handleCpfChange}
            placeholder="000.000.000-00"
            required
            className={inputClassSm}
          />
        </div>

        <div>
          <label htmlFor="storeId" className={labelClass}>
            Localidade
          </label>
          {isAdmin ? (
            <select
              id="storeId"
              value={storeId}
              onChange={(event) => setStoreId(event.target.value)}
              required
              className={inputClassSm}
            >
              {STORES.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900 dark:bg-teal-950/40 dark:text-teal-200">
              {STORES.find((store) => store.id === Number(storeId))?.name || 'Sua localidade'}
            </p>
          )}
        </div>
      </div>

      <AnamnesisForm
        value={anamnesis}
        onChange={setAnamnesis}
        patientName={name}
        birthDate={birthDate}
      />

      <div className="mb-4">
        <label htmlFor="patientNotes" className={labelClass}>
          Observações adicionais
        </label>
        <textarea
          id="patientNotes"
          rows="3"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Informações para a consulta (alergias, queixas, histórico...)"
          className={`${inputClassSm} min-h-24 resize-y`}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={isSaving} className={`${btnPrimary} px-5 py-2`}>
          {isSaving ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Cadastrar paciente'}
        </button>
        {onCancel ? (
          <button type="button" onClick={onCancel} disabled={isSaving} className={btnSecondary}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  )
}

export default PatientForm
