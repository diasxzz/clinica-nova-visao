import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-slate-100 px-4 dark:bg-slate-950">
          <div className="max-w-md rounded-xl bg-white p-5 text-center shadow-sm dark:bg-slate-900 dark:ring-1 dark:ring-slate-800">
            <p className="mb-2 text-base font-semibold text-slate-800 dark:text-slate-100">
              Erro inesperado
            </p>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              {this.state.error.message || 'Recarregue a página para tentar de novo.'}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white"
            >
              Recarregar
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
