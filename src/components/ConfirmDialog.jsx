import { btnDangerSolid, btnSecondary, pageTitle, pageSubtitle } from '../uiClasses.js'

function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar exclusão',
  cancelLabel = 'Cancelar',
  isLoading = false,
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
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900 dark:ring-1 dark:ring-slate-700"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="confirm-dialog-title" className={`${pageTitle} mb-2`}>
          {title}
        </h3>
        <p className={`${pageSubtitle} mb-5 leading-relaxed`}>{message}</p>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" onClick={onCancel} disabled={isLoading} className={btnSecondary}>
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={isLoading} className={btnDangerSolid}>
            {isLoading ? 'Excluindo...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
