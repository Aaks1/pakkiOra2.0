export const LIST_PAGE_SIZE = 100

export function normalizeList(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

export function withListParams(params = {}) {
  return { page_size: LIST_PAGE_SIZE, ...params }
}
