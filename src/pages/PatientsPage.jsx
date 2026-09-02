import { useEffect, useState } from 'react'
import PatientForm from '../components/PatientForm.jsx'
import { getPatientsWithLastConsult, getPrescriptionsByPatient } from '../storage.js'
import { formatAxis, formatDate, formatDegree } from '../formatPrescription.js'
import { getStoreName } from '../stores.js'
import SentStatus from '../components/SentStatus.jsx'

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

function PrescriptionCard({ prescription }) {
  return (
    <article className="rounded-lg border border-slate-200 p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-teal-800">
          Consulta em {formatDate(prescription.createdAt)}
        </p>
        <SentStatus sentAt={prescription.sentToOticaAt} />
      </div>
      {prescription.doctorName && (
        <p className="mb-2 text-sm text-slate-500">Médico: {prescription.doctorName}</p>
      )}

      <div className="mb-2 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium text-slate-700">OD</p>
          <p className="text-slate-600">
            Esf {formatDegree(prescription.rightEye.spherical)} · Cil{' '}
            {formatDegree(prescription.rightEye.cylindrical)}
          </p>
          <p className="text-slate-600">
            Eixo {formatAxis(prescription.rightEye.axis)} · Ad{' '}
            {formatDegree(prescription.rightEye.addition)}
          </p>
        </div>
        <div>
          <p className="font-medium text-slate-700">OE</p>
          <p className="text-slate-600">
            Esf {formatDegree(prescription.leftEye.spherical)} · Cil{' '}
            {formatDegree(prescription.leftEye.cylindrical)}
          </p>
          <p className="text-slate-600">
            Eixo {formatAxis(prescription.leftEye.axis)} · Ad{' '}
            {formatDegree(prescription.leftEye.addition)}
          </p>
        </div>
      </div>

      {prescription.dp && <p className="text-sm text-slate-600">DP {prescription.dp}</p>}
      {prescription.lensTypes?.length > 0 && (
        <p className="mt-1 text-sm text-slate-600">Lente: {prescription.lensTypes.join(', ')}</p>
      )}
      {prescription.treatments?.length > 0 && (
        <p className="text-sm text-slate-600">
          Tratamento: {prescription.treatments.join(', ')}
        </p>
      )}
      {prescription.notes && (
        <p className="mt-1 text-sm text-slate-600">Obs: {prescription.notes}</p>
      )}
    </article>
  )
}

function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

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

  return (
    <section className="w-full min-w-0 rounded-xl bg-white p-[clamp(1rem,2vw,1.75rem)] shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Pacientes</h2>
          <p className="text-sm text-slate-500">
            {patients.length} cadastrado{patients.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex gap-2">
          {(selectedPatient || showForm) && (
            <button
              type="button"
              onClick={() => {
                backToList()
                setShowForm(false)
              }}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Voltar à lista
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setSelectedPatient(null)
              setShowForm((current) => !current)
            }}
            className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            {showForm ? 'Fechar cadastro' : 'Novo paciente'}
          </button>
        </div>
      </div>

      {errorMessage && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errorMessage}</p>
      )}

      {showForm ? (
        <PatientForm onSaved={handleSaved} />
      ) : selectedPatient ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(14rem,20%)_1fr]">
          <aside className="rounded-lg bg-slate-50 p-4">
            <h3 className="text-lg font-semibold text-slate-800">{selectedPatient.name}</h3>
            <p className="mt-2 text-sm text-slate-600">CPF {selectedPatient.cpf}</p>
            <p className="text-sm text-slate-600">{getStoreName(selectedPatient.storeId)}</p>
            <p className="text-sm text-slate-600">Nasc. {formatBirthDate(selectedPatient.birthDate)}</p>
            {selectedPatient.phone ? (
              <p className="text-sm text-slate-600">{selectedPatient.phone}</p>
            ) : null}
          </aside>
          <div>
            <h3 className="mb-3 text-base font-semibold text-slate-800">Receitas</h3>
            {prescriptions.length === 0 ? (
              <p className="text-sm text-slate-500">
                Este paciente ainda não tem receita salva.
              </p>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((prescription) => (
                  <PrescriptionCard key={prescription.id} prescription={prescription} />
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
            className="mb-4 w-full max-w-[min(28rem,100%)] rounded-lg border border-slate-200 px-3 py-2 text-slate-800 outline-none placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
          />

          {filteredPatients.length === 0 ? (
            <p className="py-8 text-sm text-slate-500">
              {patients.length === 0
                ? 'Nenhum paciente cadastrado ainda.'
                : 'Nenhum paciente encontrado.'}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-left text-[clamp(0.75rem,0.95vw,0.9rem)]">
                <thead className="border-b border-slate-200 bg-slate-50 text-[clamp(0.65rem,0.8vw,0.75rem)] font-semibold tracking-wide text-slate-500 uppercase">
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
                    <tr
                      key={patient.id}
                      onClick={() => openPatient(patient)}
                      className="cursor-pointer border-b border-slate-100 hover:bg-teal-50/60"
                    >
                      <td className="truncate px-3 py-2.5 font-medium text-slate-800">{patient.name}</td>
                      <td className="truncate px-3 py-2.5 text-slate-600">{patient.cpf}</td>
                      <td className="truncate px-3 py-2.5 text-slate-600">{patient.phone || '—'}</td>
                      <td className="truncate px-3 py-2.5 text-slate-600">{getStoreName(patient.storeId)}</td>
                      <td className="truncate px-3 py-2.5 text-slate-600">
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
  )
}

export default PatientsPage
