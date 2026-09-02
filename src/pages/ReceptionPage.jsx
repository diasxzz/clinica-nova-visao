import { useEffect, useState } from 'react'
import { getPatientsWithLatestPrescription, markPrescriptionSent } from '../storage.js'
import { hasMinimumExam, sendSavedPrescriptionToOtica } from '../sendToOtica.js'
import PrescriptionPrint from '../components/PrescriptionPrint.jsx'
import SentStatus from '../components/SentStatus.jsx'
import { getStoreName } from '../stores.js'

function formatDate(value) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('pt-BR')
}

function ReceptionPage() {
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [sendingId, setSendingId] = useState(null)

  async function loadItems() {
    try {
      const list = await getPatientsWithLatestPrescription()
      setItems(list)
    } catch (error) {
      setErrorMessage('Não foi possível carregar as receitas.')
      console.error(error)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  async function handleSend(item) {
    setErrorMessage('')
    setSuccessMessage('')

    if (!item.patient.phone) {
      setErrorMessage('Cadastre o telefone do paciente antes de enviar.')
      return
    }

    if (!hasMinimumExam(item.prescription.rightEye, item.prescription.leftEye)) {
      setErrorMessage('Esta receita ainda não tem grau mínimo para envio.')
      return
    }

    setSendingId(item.prescription.id)

    try {
      await sendSavedPrescriptionToOtica({
        patient: item.patient,
        prescription: item.prescription,
      })
      const updated = await markPrescriptionSent(item.prescription.id)
      setItems((current) =>
        current.map((row) =>
          row.prescription.id === updated.id
            ? { ...row, prescription: { ...row.prescription, ...updated } }
            : row,
        ),
      )
      setSuccessMessage(`Dados de ${item.patient.name} enviados.`)
    } catch (error) {
      setErrorMessage(error.message || 'Não foi possível enviar.')
      console.error(error)
    } finally {
      setSendingId(null)
    }
  }

  const filteredItems = items.filter((item) => {
    const term = search.toLowerCase().trim()
    return (
      item.patient.name.toLowerCase().includes(term) ||
      item.patient.cpf.includes(term)
    )
  })

  if (selectedItem) {
    return (
      <section className="w-full min-w-0 rounded-xl bg-white p-[clamp(1rem,2vw,1.75rem)] shadow-sm">
        <PrescriptionPrint
          patient={selectedItem.patient}
          prescription={selectedItem.prescription}
          onBack={() => setSelectedItem(null)}
        />
      </section>
    )
  }

  return (
    <section className="w-full min-w-0 rounded-xl bg-white p-[clamp(1rem,2vw,1.75rem)] shadow-sm">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Recepção</h2>
          <p className="text-sm text-slate-500">Envie os dados e imprima a receita.</p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou CPF"
          className="w-full max-w-[min(18rem,100%)] rounded-lg border border-slate-200 px-3 py-2 text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
      </div>

      {successMessage && (
        <p className="mb-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-800">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
      )}

      {filteredItems.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhum paciente com receita cadastrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-[clamp(0.75rem,0.95vw,0.9rem)]">
            <thead className="border-b border-slate-200 bg-slate-50 text-[clamp(0.65rem,0.8vw,0.75rem)] font-semibold tracking-wide text-slate-500 uppercase">
              <tr>
                <th className="w-[22%] px-3 py-2.5">Paciente</th>
                <th className="w-[14%] px-3 py-2.5">CPF</th>
                <th className="w-[14%] px-3 py-2.5">Localidade</th>
                <th className="w-[12%] px-3 py-2.5">Consulta</th>
                <th className="w-[18%] px-3 py-2.5">Status</th>
                <th className="w-[20%] px-3 py-2.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const sent = Boolean(item.prescription.sentToOticaAt)
                const isSending = sendingId === item.prescription.id

                return (
                  <tr key={item.patient.id} className="border-b border-slate-100">
                    <td className="truncate px-3 py-2.5 font-medium text-slate-800">{item.patient.name}</td>
                    <td className="truncate px-3 py-2.5 text-slate-600">{item.patient.cpf}</td>
                    <td className="truncate px-3 py-2.5 text-slate-600">{getStoreName(item.patient.storeId)}</td>
                    <td className="truncate px-3 py-2.5 text-slate-600">
                      {formatDate(item.prescription.createdAt)}
                    </td>
                    <td className="px-3 py-2.5">
                      <SentStatus sentAt={item.prescription.sentToOticaAt} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleSend(item)}
                          disabled={isSending}
                          className={
                            sent
                              ? 'rounded-lg px-3 py-1.5 text-sm font-medium text-teal-800 ring-1 ring-teal-300 hover:bg-teal-50 disabled:opacity-60'
                              : 'rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-60'
                          }
                        >
                          {isSending ? 'Enviando...' : sent ? 'Enviar de novo' : 'Enviar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                        >
                          Imprimir
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default ReceptionPage
