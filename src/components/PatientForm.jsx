import { useEffect, useState } from 'react'
import { savePatient } from '../storage.js'
import { STORES } from '../stores.js'
import { useAuth } from '../AuthContext.jsx'
import {
  alertError,
  alertSuccess,
  btnPrimary,
  inputClassSm,
  labelClass,
  pageSubtitle,
  pageTitle,
} from '../uiClasses.js'

function PatientForm({ onSaved }) {
  const { profile, isAdmin } = useAuth()
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [storeId, setStoreId] = useState(String(profile?.storeId || 1))
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isAdmin && profile?.storeId) {
      setStoreId(String(profile.storeId))
    }
  }, [isAdmin, profile])

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

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setIsSaving(true)

    try {
      await savePatient({
        name: name.trim(),
        birthDate,
        cpf,
        phone: phone.trim(),
        notes: notes.trim(),
        storeId,
      })

      setName('')
      setBirthDate('')
      setCpf('')
      setPhone('')
      setNotes('')
      setStoreId(String(profile?.storeId || 1))
      setSuccessMessage('Paciente cadastrado com sucesso.')
      onSaved?.()
    } catch (error) {
      setSuccessMessage('')
      setErrorMessage('Não foi possível salvar o paciente. Tente de novo.')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <h2 className={`${pageTitle} mb-1 text-lg`}>Novo paciente</h2>
      <p className={`${pageSubtitle} mb-4`}>Preencha os dados para cadastrar o paciente.</p>

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

      <div className="mb-4">
        <label htmlFor="patientNotes" className={labelClass}>
          Observações
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

      <button type="submit" disabled={isSaving} className={`${btnPrimary} px-5 py-2`}>
        {isSaving ? 'Salvando...' : 'Cadastrar paciente'}
      </button>
    </form>
  )
}

export default PatientForm
