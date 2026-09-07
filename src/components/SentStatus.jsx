export function formatSentAt(value) {
  if (!value) {
    return ''
  }

  return new Date(value).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

function SentStatus({ sentAt }) {
  if (sentAt) {
    return (
      <p className="inline-flex rounded-lg bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800 dark:bg-teal-950/50 dark:text-teal-200">
        Enviado em {formatSentAt(sentAt)}
      </p>
    )
  }

  return (
    <p className="inline-flex rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
      Ainda não enviado
    </p>
  )
}

export default SentStatus
