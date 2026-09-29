import { useEffect, useState } from 'react'
import { AtendimentoError, registrarChegada } from '../../atendimentoStorage.js'
import PatientForm from '../PatientForm.jsx'
import { getPatients } from '../../storage.js'
import {
  alertError,
  alertSuccess,
  btnPrimary,
  btnSecondary,
  innerCard,
  pageSubtitle,
  searchInput,
} from '../../uiClasses.js'

function RegistrarChegadaPanel({ storeId, onClose, onRegistered }) {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [mode, setMode] = useState('search')
  const [isRegistering, setIsRegistering] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    async function loadPatients() {
      try {
        const list = await getPatients()
        setPatients(list)
      } catch (error) {
        setErrorMessage('Não foi possível carregar os pacientes.')
        console.error(error)
      }
    }

    loadPatients()
  }, [])

  const filteredPatients = patients.filter((patient) => {
    const term = search.toLowerCase().trim()
    if (!term) {
      return false
    }

    return (
      patient.name.toLowerCase().includes(term) ||
      patient.cpf.includes(term) ||
      (patient.rg || '').toLowerCase().includes(term) ||
      (patient.phone || '').includes(term)
    )
  })

  async function handleChegada(patient) {
    setErrorMessage('')
    setSuccessMessage('')
    setIsRegistering(true)

    try {
      const atendimento = await registrarChegada({
        patientId: patient.id,
        storeId: patient.storeId ?? storeId,
      })
      setSuccessMessage(`${patient.name} entrou na fila de aguardando.`)
      onRegistered?.(atendimento)
    } catch (error) {
      if (error instanceof AtendimentoError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Não foi possível registrar a chegada.')
        console.error(error)
      }
    } finally {
      setIsRegistering(false)
    }
  }

  async function handlePatientSaved(patient) {
    setMode('search')
    setPatients((current) => {
      const exists = current.some((row) => row.id === patient.id)
      return exists ? current : [...current, patient].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    })
    await handleChegada(patient)
  }

  return (
    <div className={innerCard}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Registrar chegada
          </h3>
          <p className={pageSubtitle}>Busque o paciente ou cadastre um novo.</p>
        </div>
        <button type="button" onClick={onClose} className={`${btnSecondary} px-3 py-1.5 text-sm`}>
          Fechar
        </button>
      </div>

      {successMessage && <p className={`${alertSuccess} mb-3`}>{successMessage}</p>}
      {errorMessage && <p className={`${alertError} mb-3`}>{errorMessage}</p>}

      {mode === 'search' ? (
        <>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, CPF, RG ou telefone"
            className={`${searchInput} mb-3`}
            autoFocus
          />

          {search.trim() ? (
            filteredPatients.length === 0 ? (
              <div className="rounded-lg bg-slate-50 px-4 py-4 dark:bg-slate-800/60">
                <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
                  Nenhum paciente encontrado.
                </p>
                <button
                  type="button"
                  onClick={() => setMode('new')}
                  className={`${btnPrimary} px-4 py-2 text-sm`}
                >
                  Novo paciente
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                {filteredPatients.slice(0, 8).map((patient) => (
                  <li
                    key={patient.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
                  >
                    <div>
                      <p className="font-medium text-slate-800 dark:text-slate-100">{patient.name}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        CPF {patient.cpf}
                        {patient.phone ? ` · ${patient.phone}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      disabled={isRegistering}
                      onClick={() => handleChegada(patient)}
                      className={`${btnPrimary} px-3 py-1.5 text-sm`}
                    >
                      Confirmar chegada
                    </button>
                  </li>
                ))}
              </ul>
            )
          ) : (
            <p className={pageSubtitle}>Digite para buscar o paciente.</p>
          )}

          <button
            type="button"
            onClick={() => setMode('new')}
            className={`${btnSecondary} mt-4 px-4 py-2 text-sm`}
          >
            Novo paciente
          </button>
        </>
      ) : (
        <PatientForm
          onSaved={handlePatientSaved}
          onCancel={() => setMode('search')}
        />
      )}
    </div>
  )
}

export default RegistrarChegadaPanel
