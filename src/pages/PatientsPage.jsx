import { useEffect, useState } from 'react'
import PatientForm from '../components/PatientForm.jsx'
import {
  deletePatient,
  deletePrescription,
  getPatientsWithLastConsult,
  getPrescriptionsByPatient,
} from '../storage.js'
import { formatAxis, formatDate, formatDegree } from '../formatPrescription.js'
import { resolveAddition } from '../prescriptionTemplate.js'
import { getStoreName } from '../stores.js'
import SentStatus from '../components/SentStatus.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { useAuth } from '../AuthContext.jsx'
import {
  alertError,
  asidePanel,
  btnDanger,
  btnPrimary,
  btnSecondary,
  cardSection,
  innerCard,
  pageSubtitle,
  pageTitle,
  searchInput,
  tableCell,
  tableCellStrong,
  tableHead,
  tableRowInteractive,
} from '../uiClasses.js'

function formatBirthDate(value) {
  if (!value) {
    return '—'
  }

  const [year, month, day] = String(value).split('-')
  if (year && month && day) {
    return `${day}/${month}/${year}`
  }

  return value
}

function PrescriptionCard({ prescription, canDelete, isDeleting, onDelete }) {
  return (
    <article className={innerCard}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-teal-800 dark:text-teal-300">
          Consulta em {formatDate(prescription.createdAt)}
        </p>
        <div className="flex items-center gap-2">
          <SentStatus sentAt={prescription.sentToOticaAt} />
          {canDelete ? (
            <button
              type="button"
              onClick={() => onDelete(prescription)}
              disabled={isDeleting}
              className={`${btnDanger} px-2 py-1 text-xs`}
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </button>
          ) : null}
        </div>
      </div>
      {prescription.doctorName && (
        <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
          Médico: {prescription.doctorName}
        </p>
      )}

      <div className="mb-2 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-300">OD</p>
          <p className="text-slate-600 dark:text-slate-400">
            Esf {formatDegree(prescription.rightEye.spherical)} · Cil{' '}
            {formatDegree(prescription.rightEye.cylindrical)}
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Eixo {formatAxis(prescription.rightEye.axis)}
          </p>
        </div>
        <div>
          <p className="font-medium text-slate-700 dark:text-slate-300">OE</p>
          <p className="text-slate-600 dark:text-slate-400">
            Esf {formatDegree(prescription.leftEye.spherical)} · Cil{' '}
            {formatDegree(prescription.leftEye.cylindrical)}
          </p>
          <p className="text-slate-600 dark:text-slate-400">
            Eixo {formatAxis(prescription.leftEye.axis)}
          </p>
        </div>
      </div>

      {resolveAddition(prescription, prescription.rightEye, prescription.leftEye) ? (
        <p className="mb-2 text-sm text-slate-600 dark:text-slate-400">
          Adição {formatDegree(resolveAddition(prescription, prescription.rightEye, prescription.leftEye))}
        </p>
      ) : null}

      {prescription.lensTypes?.length > 0 && (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Lente: {prescription.lensTypes.join(', ')}
        </p>
      )}
      {prescription.treatments?.length > 0 && (
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tratamento: {prescription.treatments.join(', ')}
        </p>
      )}
      {prescription.notes && (
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Obs: {prescription.notes}</p>
      )}
    </article>
  )
}

function PatientsPage() {
  const { isAdmin, isReception } = useAuth()
  const canDelete = isAdmin || isReception
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [errorMessage, setErrorMessage] = useState('')
  const [deletingPatientId, setDeletingPatientId] = useState(null)
  const [deletingPrescriptionId, setDeletingPrescriptionId] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  async function loadPatients() {
    try {
      const list = await getPatientsWithLastConsult()
      setPatients(list)
    } catch (error) {
      setErrorMessage('Não foi possível carregar os pacientes.')
      console.error(error)
    }
  }

  useEffect(() => {
    loadPatients()
  }, [])

  const filteredPatients = patients.filter((patient) => {
    const term = search.toLowerCase().trim()
    return (
      patient.name.toLowerCase().includes(term) ||
      patient.cpf.includes(term) ||
      (patient.phone || '').includes(term)
    )
  })

  function handleSaved() {
    setShowForm(false)
    loadPatients()
  }

  async function openPatient(patient) {
    setSelectedPatient(patient)
    setShowForm(false)

    try {
      const list = await getPrescriptionsByPatient(patient.id)
      setPrescriptions(list)
    } catch (error) {
      setErrorMessage('Não foi possível carregar as receitas deste paciente.')
      console.error(error)
    }
  }

  function backToList() {
    setSelectedPatient(null)
    setPrescriptions([])
    loadPatients()
  }

  function requestDeletePatient() {
    if (!selectedPatient || !canDelete) {
      return
    }

    setPendingDelete({ type: 'patient' })
  }

  function requestDeletePrescription(prescription) {
    if (!canDelete) {
      return
    }

    setPendingDelete({ type: 'prescription', prescription })
  }

  async function confirmDelete() {
    if (!pendingDelete) {
      return
    }

    setErrorMessage('')

    if (pendingDelete.type === 'patient') {
      if (!selectedPatient) {
        return
      }

      setDeletingPatientId(selectedPatient.id)

      try {
        await deletePatient(selectedPatient.id)
        setPendingDelete(null)
        backToList()
      } catch (error) {
        setErrorMessage('Não foi possível excluir o paciente.')
        console.error(error)
      } finally {
        setDeletingPatientId(null)
      }

      return
    }

    const { prescription } = pendingDelete
    setDeletingPrescriptionId(prescription.id)

    try {
      await deletePrescription(prescription.id)
      const list = await getPrescriptionsByPatient(selectedPatient.id)
      setPrescriptions(list)
      loadPatients()
      setPendingDelete(null)
    } catch (error) {
      setErrorMessage('Não foi possível excluir a receita.')
      console.error(error)
    } finally {
      setDeletingPrescriptionId(null)
    }
  }

  const confirmDialogProps =
    pendingDelete?.type === 'patient'
      ? {
          title: 'Excluir paciente?',
          message: `Excluir ${selectedPatient?.name} e todas as receitas deste paciente? Esta ação não pode ser desfeita.`,
        }
      : pendingDelete?.type === 'prescription'
        ? {
            title: 'Excluir receita?',
            message: `Excluir a receita de ${formatDate(pendingDelete.prescription.createdAt)}? Esta ação não pode ser desfeita.`,
          }
        : null

  const isConfirmLoading =
    pendingDelete?.type === 'patient'
      ? deletingPatientId === selectedPatient?.id
      : pendingDelete?.type === 'prescription'
        ? deletingPrescriptionId === pendingDelete.prescription.id
        : false

  return (
    <>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={confirmDialogProps?.title ?? ''}
        message={confirmDialogProps?.message ?? ''}
        isLoading={isConfirmLoading}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (!isConfirmLoading) {
            setPendingDelete(null)
          }
        }}
      />

      <section className={cardSection}>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={pageTitle}>Pacientes</h2>
          <p className={pageSubtitle}>
            {patients.length} cadastrado{patients.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex gap-2">
          {(selectedPatient || showForm) && (
            <button type="button" onClick={() => {
              backToList()
              setShowForm(false)
            }} className={btnSecondary}>
              Voltar à lista
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setSelectedPatient(null)
              setShowForm((current) => !current)
            }}
            className={btnPrimary}
          >
            {showForm ? 'Fechar cadastro' : 'Novo paciente'}
          </button>
        </div>
      </div>

      {errorMessage && <p className={`${alertError} mb-4`}>{errorMessage}</p>}

      {showForm ? (
        <PatientForm onSaved={handleSaved} />
      ) : selectedPatient ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(14rem,20%)_1fr]">
          <aside className={asidePanel}>
            <h3 className={`${pageTitle} text-lg`}>{selectedPatient.name}</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">CPF {selectedPatient.cpf}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">{getStoreName(selectedPatient.storeId)}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Nasc. {formatBirthDate(selectedPatient.birthDate)}
            </p>
            {selectedPatient.phone ? (
              <p className="text-sm text-slate-600 dark:text-slate-400">{selectedPatient.phone}</p>
            ) : null}
            {selectedPatient.notes ? (
              <div className="mt-3 rounded-lg bg-white px-3 py-2 ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Observações
                </p>
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedPatient.notes}
                </p>
              </div>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                onClick={requestDeletePatient}
                disabled={deletingPatientId === selectedPatient.id}
                className={`${btnDanger} mt-4 w-full`}
              >
                Excluir paciente
              </button>
            ) : null}
          </aside>
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-800 dark:text-slate-100">Receitas</h3>
            {prescriptions.length === 0 ? (
              <p className={pageSubtitle}>Este paciente ainda não tem receita salva.</p>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <PrescriptionCard
                    key={prescription.id}
                    prescription={prescription}
                    canDelete={canDelete}
                    isDeleting={deletingPrescriptionId === prescription.id}
                    onDelete={requestDeletePrescription}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, CPF ou telefone"
            className={`${searchInput} mb-4 max-w-[min(28rem,100%)]`}
          />

          {filteredPatients.length === 0 ? (
            <p className={`${pageSubtitle} py-8`}>
              {patients.length === 0
                ? 'Nenhum paciente cadastrado ainda.'
                : 'Nenhum paciente encontrado.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left text-[clamp(0.75rem,0.95vw,0.9rem)]">
                <thead className={tableHead}>
                  <tr>
                    <th className="w-[22%] px-3 py-2.5">Nome</th>
                    <th className="w-[16%] px-3 py-2.5">CPF</th>
                    <th className="w-[16%] px-3 py-2.5">Telefone</th>
                    <th className="w-[14%] px-3 py-2.5">Localidade</th>
                    <th className="w-[14%] px-3 py-2.5">Última consulta</th>
                    <th className="w-[18%] px-3 py-2.5">Envio</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} onClick={() => openPatient(patient)} className={tableRowInteractive}>
                      <td className={tableCellStrong}>{patient.name}</td>
                      <td className={tableCell}>{patient.cpf}</td>
                      <td className={tableCell}>{patient.phone || '—'}</td>
                      <td className={tableCell}>{getStoreName(patient.storeId)}</td>
                      <td className={tableCell}>
                        {patient.lastConsultAt ? formatDate(patient.lastConsultAt) : 'Sem receita'}
                      </td>
                      <td className="px-3 py-2.5">
                        {patient.lastConsultAt ? (
                          <SentStatus sentAt={patient.sentToOticaAt} />
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      </section>
    </>
  )
}

export default PatientsPage
