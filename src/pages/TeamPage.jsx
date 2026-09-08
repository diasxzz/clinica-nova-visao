import { useEffect, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import StaffPasswordDialog from '../components/StaffPasswordDialog.jsx'
import { useAuth } from '../AuthContext.jsx'
import { invokeFunction } from '../invokeFunction.js'
import { supabase } from '../supabaseClient.js'
import { STORES, getStoreName } from '../stores.js'
import { jobLabel } from '../roles.js'
import {
  alertError,
  alertSuccess,
  btnPrimary,
  btnSecondary,
  cardSection,
  chipOff,
  chipOn,
  inputClass,
  labelClass,
  pageSubtitle,
  pageTitle,
} from '../uiClasses.js'

function TeamPage() {
  const { user } = useAuth()
  const [staff, setStaff] = useState([])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [storeId, setStoreId] = useState('1')
  const [job, setJob] = useState('reception')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [resetTarget, setResetTarget] = useState(null)
  const [resetPassword, setResetPassword] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [toggleTarget, setToggleTarget] = useState(null)
  const [isToggling, setIsToggling] = useState(false)

  async function loadStaff() {
    let query = supabase
      .from('staff')
      .select('user_id, username, role, store_id, must_change_password, is_active')
      .order('username')

    let { data, error } = await query

    if (error?.code === '42703') {
      ;({ data, error } = await supabase
        .from('staff')
        .select('user_id, username, role, store_id, must_change_password')
        .order('username'))

      data = (data ?? []).map((person) => ({ ...person, is_active: true }))
    }

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
      await invokeFunction('create-staff', {
        username: username.trim().toLowerCase(),
        password,
        storeId: Number(storeId),
        role: job,
      })

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

  function openResetDialog(person) {
    setErrorMessage('')
    setSuccessMessage('')
    setResetPassword('')
    setResetTarget(person)
  }

  function closeResetDialog() {
    if (isResetting) {
      return
    }

    setResetTarget(null)
    setResetPassword('')
  }

  async function handleResetPassword() {
    if (!resetTarget || resetPassword.length < 6) {
      return
    }

    setIsResetting(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      await invokeFunction('reset-staff-password', {
        userId: resetTarget.user_id,
        password: resetPassword,
      })

      setSuccessMessage(`Senha de ${resetTarget.username} redefinida. Informe a senha provisória à pessoa.`)
      closeResetDialog()
      loadStaff()
    } catch (error) {
      setErrorMessage(error.message || 'Não foi possível redefinir a senha.')
    } finally {
      setIsResetting(false)
    }
  }

  function openToggleDialog(person) {
    setErrorMessage('')
    setSuccessMessage('')
    setToggleTarget(person)
  }

  function closeToggleDialog() {
    if (isToggling) {
      return
    }

    setToggleTarget(null)
  }

  async function handleToggleAccess() {
    if (!toggleTarget) {
      return
    }

    setIsToggling(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const nextActive = !toggleTarget.is_active

      await invokeFunction('toggle-staff-access', {
        userId: toggleTarget.user_id,
        active: nextActive,
      })

      setSuccessMessage(
        nextActive
          ? `Acesso de ${toggleTarget.username} liberado.`
          : `Acesso de ${toggleTarget.username} bloqueado.`,
      )
      closeToggleDialog()
      loadStaff()
    } catch (error) {
      setErrorMessage(error.message || 'Não foi possível alterar o acesso.')
    } finally {
      setIsToggling(false)
    }
  }

  function canManagePerson(person) {
    return person.role !== 'admin' && person.user_id !== user?.id
  }

  return (
    <section className={cardSection}>
      <h2 className={`${pageTitle} mb-1`}>Equipe</h2>
      <p className={`${pageSubtitle} mb-4`}>
        Cadastre recepção e doutor(a), redefina senhas e bloqueie acessos quando necessário.
      </p>

      {errorMessage && <p className={`${alertError} mb-3`}>{errorMessage}</p>}
      {successMessage && <p className={`${alertSuccess} mb-3`}>{successMessage}</p>}

      <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(16rem,22rem)_1fr]">
        <form onSubmit={handleSubmit}>
          <label htmlFor="staff-username" className={labelClass}>
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
            className={`${inputClass} mb-3`}
          />

          <label htmlFor="staff-password" className={labelClass}>
            Senha provisória
          </label>
          <input
            id="staff-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            className={`${inputClass} mb-3`}
          />

          <fieldset className="mb-3">
            <legend className={`${labelClass} mb-2`}>Função</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className={job === 'reception' ? chipOn + ' flex min-h-12 items-center justify-center' : chipOff + ' flex min-h-12 items-center justify-center'}>
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
              <label className={job === 'doctor' ? chipOn + ' flex min-h-12 items-center justify-center' : chipOff + ' flex min-h-12 items-center justify-center'}>
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

          <label htmlFor="staff-store" className={labelClass}>
            Localidade
          </label>
          <select
            id="staff-store"
            value={storeId}
            onChange={(event) => setStoreId(event.target.value)}
            className={`${inputClass} mb-4`}
          >
            {STORES.map((store) => (
              <option key={store.id} value={store.id}>
                {store.name}
              </option>
            ))}
          </select>

          <button type="submit" disabled={isSaving} className={`${btnPrimary} min-h-12 w-full py-3`}>
            {isSaving ? 'Salvando...' : 'Cadastrar'}
          </button>
        </form>

        <div>
          <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-100">
            Quem já tem acesso
          </h3>
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
            {staff.map((person) => (
              <li key={person.user_id} className="px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800 dark:text-slate-100">{person.username}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {person.role === 'admin'
                        ? jobLabel(person.role)
                        : `${jobLabel(person.role)} · ${getStoreName(person.store_id)}`}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {person.is_active === false && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950/50 dark:text-red-300">
                          Bloqueado
                        </span>
                      )}
                      {person.must_change_password && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                          Senha pendente
                        </span>
                      )}
                    </div>
                  </div>

                  {canManagePerson(person) && (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openResetDialog(person)}
                        className={btnSecondary}
                      >
                        Redefinir senha
                      </button>
                      <button
                        type="button"
                        onClick={() => openToggleDialog(person)}
                        className={person.is_active === false ? btnPrimary : btnSecondary}
                      >
                        {person.is_active === false ? 'Liberar acesso' : 'Bloquear acesso'}
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <StaffPasswordDialog
        open={Boolean(resetTarget)}
        username={resetTarget?.username ?? ''}
        password={resetPassword}
        isLoading={isResetting}
        onPasswordChange={setResetPassword}
        onConfirm={handleResetPassword}
        onCancel={closeResetDialog}
      />

      <ConfirmDialog
        open={Boolean(toggleTarget)}
        title={toggleTarget?.is_active === false ? 'Liberar acesso' : 'Bloquear acesso'}
        message={
          toggleTarget?.is_active === false
            ? `Deseja liberar o login de ${toggleTarget.username}?`
            : `Deseja bloquear o login de ${toggleTarget?.username}? Essa pessoa não conseguirá entrar até você liberar novamente.`
        }
        confirmLabel={toggleTarget?.is_active === false ? 'Liberar' : 'Bloquear'}
        cancelLabel="Cancelar"
        isLoading={isToggling}
        onConfirm={handleToggleAccess}
        onCancel={closeToggleDialog}
      />
    </section>
  )
}

export default TeamPage
