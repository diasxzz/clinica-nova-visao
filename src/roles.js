export function defaultPageForRole(role) {
  if (role === 'doctor') {
    return 'consultation'
  }

  if (role === 'reception') {
    return 'patients'
  }

  return 'consultation'
}

export function tabsForRole(role) {
  if (role === 'doctor') {
    return [{ id: 'consultation', label: 'Consulta' }]
  }

  if (role === 'reception') {
    return [
      { id: 'patients', label: 'Pacientes' },
      { id: 'reception', label: 'Recepção' },
    ]
  }

  if (role === 'admin') {
    return [
      { id: 'patients', label: 'Pacientes' },
      { id: 'consultation', label: 'Consulta' },
      { id: 'reception', label: 'Recepção' },
      { id: 'team', label: 'Equipe' },
    ]
  }

  return []
}

export function usesDesktopShell(role) {
  return role === 'reception' || role === 'admin'
}

export function canAccessPage(role, page) {
  return tabsForRole(role).some((tab) => tab.id === page)
}

export function jobLabel(role) {
  if (role === 'admin') {
    return 'Coordenador · acesso geral'
  }

  if (role === 'doctor') {
    return 'Doutor(a) · só consulta'
  }

  if (role === 'reception') {
    return 'Recepção · cadastro, envio e impressão'
  }

  return role
}
