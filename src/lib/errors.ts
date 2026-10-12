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

// Turns any thrown value into messages that can be shown to the user.
export function getErrorMessages(error: unknown): string[] {
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
    if (STATUS_MESSAGES[status]) return [STATUS_MESSAGES[status]]
    if (status >= 500) return ['Server error. Please try again later.']
  }

  if (error instanceof Error && error.message) return [error.message]
  return ['Something went wrong.']
}
