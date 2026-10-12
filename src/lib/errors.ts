import { isAxiosError } from 'axios'

const STATUS_MESSAGES: Record<number, string> = {
  400: 'The request was invalid.',
  401: 'Your session has expired. Please log in again.',
  403: "You don't have permission to do that.",
  404: 'Not found.',
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string')
}

// A plain-text body is usable as a message; an HTML error page is not.
function plainTextBody(data: unknown): string | null {
  if (typeof data !== 'string') return null
  const text = data.trim()
  if (text === '' || text.startsWith('<')) return null
  return text
}

// Turns any thrown value into messages that can be shown to the user.
// unauthorizedMessage replaces the "session expired" text for a 401 without a body message,
// for requests where 401 means something else (wrong credentials on /login).
export function getErrorMessages(error: unknown, unauthorizedMessage?: string): string[] {
  if (isAxiosError(error)) {
    if (!error.response) {
      return ['Cannot reach the server. Check your connection.']
    }

    const { status, data } = error.response
    // {errors: [...]} for 422 validation errors (and the 404 "Not found").
    if (data && isStringArray(data.errors) && data.errors.length > 0) {
      return data.errors
    }
    // {error: "..."} as sent by Devise, e.g. for wrong credentials.
    if (data && typeof data.error === 'string') {
      return [data.error]
    }
    const text = plainTextBody(data)
    if (text) return [text]
    if (status === 401 && unauthorizedMessage) return [unauthorizedMessage]
    if (STATUS_MESSAGES[status]) return [STATUS_MESSAGES[status]]
    if (status >= 500) return ['Server error. Please try again later.']
  }

  if (error instanceof Error && error.message) return [error.message]
  return ['Something went wrong.']
}
