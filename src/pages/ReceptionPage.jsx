import { useEffect, useState } from 'react'
import { deletePrescription, getPatientsWithLatestPrescription, markPrescriptionSent } from '../storage.js'
import { hasMinimumExam, sendSavedPrescriptionToOtica } from '../sendToOtica.js'
import PrescriptionPrint from '../components/PrescriptionPrint.jsx'
import SentStatus from '../components/SentStatus.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { getStoreName } from '../stores.js'
import { useAuth } from '../AuthContext.jsx'
import {
  alertError,
  alertSuccess,
  btnDanger,
  btnPrimary,
  btnSecondary,
  cardSection,
  pageSubtitle,
  pageTitle,
  searchInput,
  tableCell,
  tableCellStrong,
  tableHead,
  tableRow,
} from '../uiClasses.js'

function formatDate(value) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('pt-BR')
}

function ReceptionPage() {
  const { isAdmin, isReception } = useAuth()
  const canDelete = isAdmin || isReception
  const [items, setItems] = useState([])
  const [search, setSearch] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [sendingId, setSendingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

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

  function requestDelete(item) {
    if (!canDelete) {
      return
    }

    setPendingDelete(item)
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setDeletingId(pendingDelete.prescription.id)

    try {
      await deletePrescription(pendingDelete.prescription.id)
      setSuccessMessage(`Receita de ${pendingDelete.patient.name} excluída.`)
      setPendingDelete(null)
      await loadItems()
    } catch (error) {
      setErrorMessage('Não foi possível excluir a receita.')
      console.error(error)
    } finally {
      setDeletingId(null)
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
      <section className={cardSection}>
        <PrescriptionPrint
          patient={selectedItem.patient}
          prescription={selectedItem.prescription}
          onBack={() => setSelectedItem(null)}
        />
      </section>
    )
  }

  return (
    <>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Excluir receita?"
        message={
          pendingDelete
            ? `Excluir a receita de ${pendingDelete.patient.name} (${formatDate(pendingDelete.prescription.createdAt)})? Esta ação não pode ser desfeita.`
            : ''
        }
        isLoading={Boolean(pendingDelete && deletingId === pendingDelete.prescription.id)}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!deletingId) {
            setPendingDelete(null)
          }
        }}
      />

      <section className={cardSection}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={pageTitle}>Recepção</h2>
          <p className={pageSubtitle}>Envie os dados e imprima a receita.</p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou CPF"
          className={`${searchInput} max-w-[min(18rem,100%)]`}
        />
      </div>

      {successMessage && <p className={`${alertSuccess} mb-4`}>{successMessage}</p>}
      {errorMessage && <p className={`${alertError} mb-4`}>{errorMessage}</p>}

      {filteredItems.length === 0 ? (
        <p className={pageSubtitle}>Nenhum paciente com receita cadastrada.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-left text-[clamp(0.75rem,0.95vw,0.9rem)]">
            <thead className={tableHead}>
              <tr>
                <th className="w-[22%] px-3 py-2.5">Paciente</th>
                <th className="w-[14%] px-3 py-2.5">CPF</th>
                <th className="w-[14%] px-3 py-2.5">Localidade</th>
                <th className="w-[12%] px-3 py-2.5">Consulta</th>
                <th className="w-[18%] px-3 py-2.5">Status</th>
                <th className="w-[24%] px-3 py-2.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const sent = Boolean(item.prescription.sentToOticaAt)
                const isSending = sendingId === item.prescription.id
                const isDeleting = deletingId === item.prescription.id

                return (
                  <tr key={item.patient.id} className={tableRow}>
                    <td className={tableCellStrong}>{item.patient.name}</td>
                    <td className={tableCell}>{item.patient.cpf}</td>
                    <td className={tableCell}>{getStoreName(item.patient.storeId)}</td>
                    <td className={tableCell}>{formatDate(item.prescription.createdAt)}</td>
                    <td className="px-3 py-2.5">
                      <SentStatus sentAt={item.prescription.sentToOticaAt} />
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleSend(item)}
                          disabled={isSending || isDeleting}
                          className={
                            sent
                              ? 'rounded-lg px-3 py-1.5 text-sm font-medium text-teal-800 ring-1 ring-teal-300 hover:bg-teal-50 disabled:opacity-60 dark:text-teal-200 dark:ring-teal-700 dark:hover:bg-teal-950/40'
                              : `${btnPrimary} px-3 py-1.5`
                          }
                        >
                          {isSending ? 'Enviando...' : sent ? 'Enviar de novo' : 'Enviar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          disabled={isDeleting}
                          className={`${btnSecondary} px-3 py-1.5`}
                        >
                          Imprimir
                        </button>
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => requestDelete(item)}
                            disabled={isDeleting}
                            className={`${btnDanger} px-3 py-1.5`}
                          >
                            Excluir
                          </button>
                        ) : null}
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
    </>
  )
}

export default ReceptionPage
