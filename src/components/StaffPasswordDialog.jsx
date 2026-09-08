import { btnPrimary, btnSecondary, inputClass, labelClass, pageSubtitle, pageTitle } from '../uiClasses.js'

function StaffPasswordDialog({
  open,
  username,
  password,
  isLoading = false,
  onPasswordChange,
  onConfirm,
  onCancel,
}) {
  if (!open) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={isLoading ? undefined : onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-password-dialog-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-700"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="staff-password-dialog-title" className={`${pageTitle} mb-2`}>
          Redefinir senha
        </h3>
        <p className={`${pageSubtitle} mb-4 leading-relaxed`}>
          Defina uma senha provisória para <strong>{username}</strong>. No próximo login, essa
          pessoa precisará trocá-la.
        </p>

        <label htmlFor="staff-new-password" className={labelClass}>
          Nova senha provisória
        </label>
        <input
          id="staff-new-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          minLength={6}
          required
          className={`${inputClass} mb-5`}
        />

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} disabled={isLoading} className={btnSecondary}>
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || password.length < 6}
            className={btnPrimary}
          >
            {isLoading ? 'Salvando...' : 'Salvar senha'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StaffPasswordDialog
