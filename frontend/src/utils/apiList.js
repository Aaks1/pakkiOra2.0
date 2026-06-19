export function normalizeList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

export function withListParams(params = {}) {
  const next = { ...params }
  if (next.page == null) next.page = 1
  if (next.page_size == null) next.page_size = 100
  return next
}
