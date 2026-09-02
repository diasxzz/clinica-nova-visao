export const STORES = [
  { id: 1, name: 'Londrina' },
  { id: 2, name: 'Campo Grande' },
  { id: 3, name: 'Caxias' },
]

export function getStoreName(storeId) {
  return STORES.find((store) => store.id === Number(storeId))?.name || '—'
}
