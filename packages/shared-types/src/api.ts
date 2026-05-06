// ──────────────────────────────────────────────
// API Shared Types — Error codes, generic responses
// ──────────────────────────────────────────────

export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'

export interface ApiError {
  code: ApiErrorCode
  message: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
