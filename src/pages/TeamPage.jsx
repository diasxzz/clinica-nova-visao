import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient.js'
import { STORES, getStoreName } from '../stores.js'
import { jobLabel } from '../roles.js'

const fieldClass =
  'w-full min-h-12 rounded-xl border border-slate-200 px-3 py-3 text-base text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'

function TeamPage() {
  const [staff, setStaff] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [storeId, setStoreId] = useState('1')
  const [job, setJob] = useState('reception')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  async function loadStaff() {
    const { data, error } = await supabase
      .from('staff')
      .select('user_id, username, role, store_id')
      .order('username')

    if (error) {
      setErrorMessage('Não foi possível carregar a equipe.')
      return
    }

    setStaff(data ?? [])
  }

  useEffect(() => {
    loadStaff()
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSuccessMessage('')
    setIsSaving(true)

    try {
      const { data, error } = await supabase.functions.invoke('create-staff', {
        body: {
          username: username.trim().toLowerCase(),
          password,
          storeId: Number(storeId),
          role: job,
        },
      })

      if (error) {
        throw new Error(data?.error || error.message)
      }

      if (data?.error) {
        throw new Error(data.error)
      }

      setUsername('')
      setPassword('')
      setSuccessMessage(
        job === 'doctor' ? 'Doutor(a) cadastrado(a).' : 'Recepção cadastrada.',
      )
      loadStaff()
    } catch (error) {
      setErrorMessage(error.message || 'Não foi possível cadastrar.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <section className="w-full min-w-0 rounded-xl bg-white p-[clamp(1rem,2vw,1.75rem)] shadow-sm">
      <h2 className="mb-1 text-xl font-semibold text-slate-800">Equipe</h2>
      <p className="mb-4 text-sm text-slate-500">
        Separe recepção e doutor(a). Cada um só vê a localidade escolhida.
      </p>

      {errorMessage && (
        <p className="mb-3 rounded-xl bg-red-50 px-3 py-3 text-sm text-red-700">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="mb-3 rounded-xl bg-teal-50 px-3 py-3 text-sm text-teal-800">{successMessage}</p>
      )}

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(16rem,22rem)_1fr]">
      <form onSubmit={handleSubmit}>
        <label htmlFor="staff-username" className="mb-1 block text-sm font-medium text-slate-700">
          Usuário
        </label>
        <input
          id="staff-username"
          type="text"
          autoCapitalize="none"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          placeholder="ex: maria.londrina"
          required
          minLength={3}
          className={`${fieldClass} mb-3`}
        />

        <label htmlFor="staff-password" className="mb-1 block text-sm font-medium text-slate-700">
          Senha
        </label>
        <input
          id="staff-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={6}
          className={`${fieldClass} mb-3`}
        />

        <fieldset className="mb-3">
          <legend className="mb-2 text-sm font-medium text-slate-700">Função</legend>
          <div className="grid grid-cols-2 gap-2">
            <label
              className={
                job === 'reception'
                  ? 'flex min-h-12 items-center justify-center rounded-xl bg-teal-600 px-3 text-sm font-medium text-white'
                  : 'flex min-h-12 items-center justify-center rounded-xl bg-slate-100 px-3 text-sm font-medium text-slate-700'
              }
            >
              <input
                type="radio"
                name="staff-job"
                value="reception"
                checked={job === 'reception'}
                onChange={() => setJob('reception')}
                className="sr-only"
              />
              Recepção
            </label>
            <label
              className={
                job === 'doctor'
                  ? 'flex min-h-12 items-center justify-center rounded-xl bg-teal-600 px-3 text-sm font-medium text-white'
                  : 'flex min-h-12 items-center justify-center rounded-xl bg-slate-100 px-3 text-sm font-medium text-slate-700'
              }
            >
              <input
                type="radio"
                name="staff-job"
                value="doctor"
                checked={job === 'doctor'}
                onChange={() => setJob('doctor')}
                className="sr-only"
              />
              Doutor(a)
            </label>
          </div>
        </fieldset>

        <label htmlFor="staff-store" className="mb-1 block text-sm font-medium text-slate-700">
          Localidade
        </label>
        <select
          id="staff-store"
          value={storeId}
          onChange={(event) => setStoreId(event.target.value)}
          className={`${fieldClass} mb-4`}
        >
          {STORES.map((store) => (
            <option key={store.id} value={store.id}>
              {store.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={isSaving}
          className="min-h-12 w-full rounded-xl bg-teal-600 px-4 py-3 font-medium text-white disabled:opacity-60"
        >
          {isSaving ? 'Salvando...' : 'Cadastrar'}
        </button>
      </form>

      <div>
      <h3 className="mb-2 text-base font-semibold text-slate-800">Quem já tem acesso</h3>
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
        {staff.map((person) => (
          <li key={person.user_id} className="px-3 py-3">
            <p className="font-medium text-slate-800">{person.username}</p>
            <p className="text-sm text-slate-500">
              {person.role === 'admin'
                ? jobLabel(person.role)
                : `${jobLabel(person.role)} · ${getStoreName(person.store_id)}`}
            </p>
          </li>
        ))}
      </ul>
      </div>
      </div>
    </section>
  )
}

export default TeamPage
