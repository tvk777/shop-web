import { describe, expect, it } from 'vitest'
import { emailChanged, profileSchema } from './schemas'

describe('emailChanged', () => {
  it('ignores case and surrounding spaces', () => {
    expect(emailChanged('user@example.com', 'user@example.com')).toBe(false)
    expect(emailChanged(' User@Example.COM ', 'user@example.com')).toBe(false)
  })

  it('detects a different email', () => {
    expect(emailChanged('new@example.com', 'user@example.com')).toBe(true)
  })
})

describe('profileSchema', () => {
  const schema = profileSchema('user@example.com')
  const values = { first_name: 'Ann', last_name: 'Lee', email: 'user@example.com' }

  it('accepts a name-only change without the current password', () => {
    expect(schema.safeParse({ ...values, current_password: '' }).success).toBe(true)
  })

  it('requires the current password when the email changes', () => {
    const result = schema.safeParse({ ...values, email: 'new@example.com', current_password: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]).toMatchObject({
      path: ['current_password'],
      message: 'Current password is required to change your email.',
    })
  })

  it('accepts an email change with the current password', () => {
    const result = schema.safeParse({
      ...values,
      email: 'new@example.com',
      current_password: 'password123',
    })
    expect(result.success).toBe(true)
  })
})
