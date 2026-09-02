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
      <p className="inline-flex rounded-lg bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800">
        Enviado em {formatSentAt(sentAt)}
      </p>
    )
  }

  return (
      <p className="inline-flex rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
      Ainda não enviado
    </p>
  )
}

export default SentStatus
