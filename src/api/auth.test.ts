import { describe, expect, it } from 'vitest'
import { readBearerToken } from './auth'

describe('readBearerToken', () => {
  it('returns the token from a Bearer header', () => {
    expect(readBearerToken({ authorization: 'Bearer abc.def.ghi' })).toBe('abc.def.ghi')
  })

  it('returns null when the header is missing', () => {
    expect(readBearerToken({})).toBeNull()
  })

  it('returns null without the Bearer prefix', () => {
    expect(readBearerToken({ authorization: 'abc.def.ghi' })).toBeNull()
  })
})
