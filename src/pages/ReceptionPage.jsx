import { useCallback, useEffect, useState } from 'react'
import {
  AtendimentoError,
  finalizarAtendimento,
  getFilaDoDia,
  iniciarAtendimento,
} from '../atendimentoStorage.js'
import EnvioOticaPanel from '../components/recepcao/EnvioOticaPanel.jsx'
import FilaAtendimento from '../components/recepcao/FilaAtendimento.jsx'
import RecepcaoResumo from '../components/recepcao/RecepcaoResumo.jsx'
import RegistrarChegadaPanel from '../components/recepcao/RegistrarChegadaPanel.jsx'
import { countByFilaBucket } from '../domain/atendimento/derive.js'
import { FILA_FILTERS } from '../domain/atendimento/status.js'
import { useAuth } from '../AuthContext.jsx'
import {
  alertError,
  alertSuccess,
  btnPrimary,
  btnSecondary,
  cardSection,
  innerCard,
  pageSubtitle,
  pageTitle,
} from '../uiClasses.js'

const REFRESH_MS = 30_000

function ReceptionPage() {
  const { isAdmin, isReception, profile } = useAuth()
  const canDelete = isAdmin || isReception
  const storeId = profile?.storeId ?? null

  const [activeTab, setActiveTab] = useState('fluxo')
  const [atendimentos, setAtendimentos] = useState([])
  const [activeFilter, setActiveFilter] = useState(FILA_FILTERS.TODOS)
  const [showChegada, setShowChegada] = useState(false)
  const [busyId, setBusyId] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadFila = useCallback(async () => {
    try {
      const list = await getFilaDoDia({ storeId })
      setAtendimentos(list)
    } catch (error) {
      setErrorMessage('Não foi possível carregar a fila de atendimentos.')
      console.error(error)
    }
  }, [storeId])

  useEffect(() => {
    loadFila()
    const timer = window.setInterval(loadFila, REFRESH_MS)
    return () => window.clearInterval(timer)
  }, [loadFila])

  async function handleIniciar(atendimento) {
    setErrorMessage('')
    setSuccessMessage('')
    setBusyId(atendimento.id)

    try {
      await iniciarAtendimento(atendimento.id)
      setSuccessMessage(`${atendimento.patient?.name || 'Paciente'} em atendimento.`)
      await loadFila()
    } catch (error) {
      if (error instanceof AtendimentoError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Não foi possível iniciar o atendimento.')
        console.error(error)
      }
    } finally {
      setBusyId(null)
    }
  }

  async function handleFinalizar(atendimento) {
    setErrorMessage('')
    setSuccessMessage('')
    setBusyId(atendimento.id)

    try {
      await finalizarAtendimento(atendimento.id)
      setSuccessMessage(`${atendimento.patient?.name || 'Paciente'} finalizado.`)
      await loadFila()
    } catch (error) {
      if (error instanceof AtendimentoError) {
        setErrorMessage(error.message)
      } else {
        setErrorMessage('Não foi possível finalizar o atendimento.')
        console.error(error)
      }
    } finally {
      setBusyId(null)
    }
  }

  function handleRegistered() {
    setShowChegada(false)
    loadFila()
  }

  const counts = countByFilaBucket(atendimentos)

  return (
    <section className={cardSection}>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className={pageTitle}>Recepção</h2>
          <p className={pageSubtitle}>
            Fluxo operacional do dia e envio de receitas à ótica.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('fluxo')}
            className={
              activeTab === 'fluxo'
                ? `${btnPrimary} px-4 py-2 text-sm`
                : `${btnSecondary} px-4 py-2 text-sm`
            }
          >
            Fluxo do dia
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('otica')}
            className={
              activeTab === 'otica'
                ? `${btnPrimary} px-4 py-2 text-sm`
                : `${btnSecondary} px-4 py-2 text-sm`
            }
          >
            Envio à ótica
          </button>
        </div>
      </div>

      {successMessage && <p className={`${alertSuccess} mb-4`}>{successMessage}</p>}
      {errorMessage && <p className={`${alertError} mb-4`}>{errorMessage}</p>}

      {activeTab === 'fluxo' ? (
        <>
          <div className="mb-5">
            <RecepcaoResumo
              counts={counts}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Fila de atendimentos
            </h3>
            <button
              type="button"
              onClick={() => setShowChegada((current) => !current)}
              className={`${btnPrimary} px-4 py-2 text-sm`}
            >
              {showChegada ? 'Fechar chegada' : 'Registrar chegada'}
            </button>
          </div>

          {showChegada ? (
            <div className="mb-5">
              <RegistrarChegadaPanel
                storeId={storeId}
                onClose={() => setShowChegada(false)}
                onRegistered={handleRegistered}
              />
            </div>
          ) : null}

          <FilaAtendimento
            atendimentos={atendimentos}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            busyId={busyId}
            onIniciar={handleIniciar}
            onFinalizar={handleFinalizar}
          />
        </>
      ) : (
        <div className={innerCard}>
          <EnvioOticaPanel canDelete={canDelete} />
        </div>
      )}
    </section>
  )
}

export default ReceptionPage
