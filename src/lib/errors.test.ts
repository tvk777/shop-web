import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { getErrorMessages } from './errors'

// Builds the error axios throws when the server answers with this status and body.
function httpError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data,
  })
}

describe('getErrorMessages', () => {
  describe('message from the response body', () => {
    it('returns the list from {errors: [...]}', () => {
      const error = httpError(422, { errors: ["Name can't be blank", 'Price is invalid'] })
      expect(getErrorMessages(error)).toEqual(["Name can't be blank", 'Price is invalid'])
    })

    it('ignores an empty errors list', () => {
      expect(getErrorMessages(httpError(404, { errors: [] }))).toEqual(['Not found.'])
    })

    it("returns Devise's {error: \"...\"}", () => {
      const error = httpError(401, { error: 'Invalid Email or password.' })
      expect(getErrorMessages(error)).toEqual(['Invalid Email or password.'])
    })

    it('returns a plain text body', () => {
      expect(getErrorMessages(httpError(502, '  Bad Gateway  '))).toEqual(['Bad Gateway'])
    })

    it('ignores an HTML error page', () => {
      expect(getErrorMessages(httpError(500, '<html>Error</html>'))).toEqual([
        'Server error. Please try again later.',
      ])
    })
  })

  describe('message from the status code', () => {
    it.each([
      [400, 'The request was invalid.'],
      [401, 'Your session has expired. Please log in again.'],
      [403, "You don't have permission to do that."],
      [404, 'Not found.'],
      [500, 'Server error. Please try again later.'],
      [503, 'Server error. Please try again later.'],
    ])('status %i', (status, message) => {
      expect(getErrorMessages(httpError(status, null))).toEqual([message])
    })

    it('uses unauthorizedMessage for a 401 without a body message', () => {
      expect(getErrorMessages(httpError(401, null), 'Wrong email or password.')).toEqual([
        'Wrong email or password.',
      ])
    })
  })

  it('reports a network error when there is no response', () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK')
    expect(getErrorMessages(error)).toEqual(['Cannot reach the server. Check your connection.'])
  })

  it('returns the message of a non-axios error', () => {
    expect(getErrorMessages(new Error('Something broke'))).toEqual(['Something broke'])
  })

  it('falls back to a generic message for anything else', () => {
    expect(getErrorMessages('oops')).toEqual(['Something went wrong.'])
    expect(getErrorMessages(undefined)).toEqual(['Something went wrong.'])
  })
})
