import { deletePrescription, getPatientsWithLatestPrescription, markPrescriptionSent } from '../../storage.js'
import { hasMinimumExam, sendSavedPrescriptionToOtica } from '../../sendToOtica.js'
import PrescriptionPrint from '../PrescriptionPrint.jsx'
import SentStatus from '../SentStatus.jsx'
import ConfirmDialog from '../ConfirmDialog.jsx'
import { getStoreName } from '../../stores.js'
import {
  alertError,
  alertSuccess,
  btnDanger,
  btnPrimary,
  btnSecondary,
  pageSubtitle,
  searchInput,
  tableCell,
  tableCellStrong,
  tableHead,
  tableRow,
} from '../../uiClasses.js'
import { useEffect, useState } from 'react'

function formatDate(value) {
  if (!value) {
    return '—'
  }

  return new Date(value).toLocaleDateString('pt-BR')
}

function EnvioOticaPanel({ canDelete }) {
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

  async function confirmDelete() {
    if (!pendingDelete) {
      return
    }

    setDeletingId(pendingDelete.prescription.id)

    try {
      await deletePrescription(pendingDelete.prescription.id)
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
      <PrescriptionPrint
        patient={selectedItem.patient}
        prescription={selectedItem.prescription}
        onBack={() => setSelectedItem(null)}
      />
    )
  }

  return (
    <>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Excluir receita?"
        message={
          pendingDelete
            ? `Excluir a receita de ${pendingDelete.patient.name} (${formatDate(pendingDelete.prescription.createdAt)})?`
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

      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Envio à ótica</h3>
          <p className={pageSubtitle}>Envie e imprima receitas já emitidas.</p>
        </div>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nome ou CPF"
          className={`${searchInput} max-w-[min(18rem,100%)]`}
        />
      </div>

      {successMessage && <p className={`${alertSuccess} mb-3`}>{successMessage}</p>}
      {errorMessage && <p className={`${alertError} mb-3`}>{errorMessage}</p>}

      {filteredItems.length === 0 ? (
        <p className={pageSubtitle}>Nenhum paciente com receita cadastrada.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg ring-1 ring-slate-200 dark:ring-slate-700">
          <table className="w-full table-fixed text-left text-sm">
            <thead className={tableHead}>
              <tr>
                <th className="px-3 py-2.5">Paciente</th>
                <th className="px-3 py-2.5">Localidade</th>
                <th className="px-3 py-2.5">Consulta</th>
                <th className="px-3 py-2.5">Status</th>
                <th className="px-3 py-2.5 text-right">Ações</th>
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
                              ? `${btnSecondary} px-3 py-1.5 text-sm`
                              : `${btnPrimary} px-3 py-1.5 text-sm`
                          }
                        >
                          {isSending ? 'Enviando...' : sent ? 'Enviar de novo' : 'Enviar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedItem(item)}
                          disabled={isDeleting}
                          className={`${btnSecondary} px-3 py-1.5 text-sm`}
                        >
                          Imprimir
                        </button>
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => setPendingDelete(item)}
                            disabled={isDeleting}
                            className={`${btnDanger} px-3 py-1.5 text-sm`}
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
    </>
  )
}

export default EnvioOticaPanel
