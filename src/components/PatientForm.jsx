import { useEffect, useState } from 'react'
import { savePatient } from '../storage.js'
import { STORES } from '../stores.js'
import { useAuth } from '../AuthContext.jsx'

const fieldClass =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'

function PatientForm({ onSaved }) {
  const { profile, isAdmin } = useAuth()
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')
  const [cpf, setCpf] = useState('')
  const [phone, setPhone] = useState('')
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
        storeId,
      })

      setName('')
      setBirthDate('')
      setCpf('')
      setPhone('')
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
      <h2 className="mb-1 text-lg font-semibold text-slate-800">Novo paciente</h2>
      <p className="mb-4 text-sm text-slate-500">Preencha os dados para cadastrar o paciente.</p>

      {successMessage && (
        <p className="mb-3 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
      )}

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
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
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="birthDate" className="mb-1 block text-sm font-medium text-slate-700">
            Data de nascimento
          </label>
          <input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
            Telefone
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="43999990000"
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="cpf" className="mb-1 block text-sm font-medium text-slate-700">
            CPF
          </label>
          <input
            id="cpf"
            type="text"
            value={cpf}
            onChange={handleCpfChange}
            placeholder="000.000.000-00"
            required
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="storeId" className="mb-1 block text-sm font-medium text-slate-700">
            Localidade
          </label>
          {isAdmin ? (
            <select
              id="storeId"
              value={storeId}
              onChange={(event) => setStoreId(event.target.value)}
              required
              className={fieldClass}
            >
              {STORES.map((store) => (
                <option key={store.id} value={store.id}>
                  {store.name}
                </option>
              ))}
            </select>
          ) : (
            <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-900">
              {STORES.find((store) => store.id === Number(storeId))?.name || 'Sua localidade'}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isSaving}
        className="rounded-lg bg-teal-600 px-5 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60"
      >
        {isSaving ? 'Salvando...' : 'Cadastrar paciente'}
      </button>
    </form>
  )
}

export default PatientForm
