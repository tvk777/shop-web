import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'
import { parseUnavailableItemIds } from './orders'

// Builds the error axios throws when the server answers with this status and body.
function httpError(status: number, data: unknown) {
  const config = { headers: new AxiosHeaders() }
  return new AxiosError('Request failed', 'ERR_BAD_REQUEST', config, null, {
    status,
    statusText: '',
    headers: {},
    config,
    data,
  })
}

describe('parseUnavailableItemIds', () => {
  it('returns one id', () => {
    const error = httpError(422, { errors: ['Items not found: 12'] })
    expect(parseUnavailableItemIds(error)).toEqual([12])
  })

  it('returns several ids', () => {
    const error = httpError(422, { errors: ['Items not found: 12, 15, 3'] })
    expect(parseUnavailableItemIds(error)).toEqual([12, 15, 3])
  })

  it('accepts extra spaces', () => {
    const error = httpError(422, { errors: ['Items not found:   12 ,15  ,  3  '] })
    expect(parseUnavailableItemIds(error)).toEqual([12, 15, 3])
  })

  it('finds the message among other errors', () => {
    const error = httpError(422, { errors: ['Quantity is invalid', 'Items not found: 4'] })
    expect(parseUnavailableItemIds(error)).toEqual([4])
  })

  it('returns null for a different 422 message', () => {
    const error = httpError(422, { errors: ['Quantity must be greater than 0'] })
    expect(parseUnavailableItemIds(error)).toBeNull()
  })

  it('returns null for a 422 without an errors list', () => {
    expect(parseUnavailableItemIds(httpError(422, { error: 'Items not found: 12' }))).toBeNull()
  })

  it('returns null for a status other than 422', () => {
    const error = httpError(404, { errors: ['Items not found: 12'] })
    expect(parseUnavailableItemIds(error)).toBeNull()
  })

  it('returns null for a non-axios error', () => {
    expect(parseUnavailableItemIds(new Error('Items not found: 12'))).toBeNull()
  })
})
