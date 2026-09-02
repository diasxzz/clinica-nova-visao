export function staffEmail(username) {
  return `${String(username).trim().toLowerCase()}@clinica.internal`
}
