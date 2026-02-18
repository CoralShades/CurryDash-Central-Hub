export interface ApiError {
  code: string
  message: string
  data?: unknown
}

export type ApiResponse<T> =
  | { data: T; error: null }
  | { data: null; error: ApiError }

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return { data, error: null }
}

export function createErrorResponse(code: string, message: string, data?: unknown): ApiResponse<never> {
  return { data: null, error: { code, message, data } }
}
