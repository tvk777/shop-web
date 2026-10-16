import { describe, expect, it } from 'vitest'
import { clampPage, parsePage, withPage } from './pagination'

describe('parsePage', () => {
  it('reads a positive whole number', () => {
    expect(parsePage('1')).toBe(1)
    expect(parsePage('2')).toBe(2)
    expect(parsePage('42')).toBe(42)
    expect(parsePage('007')).toBe(7)
  })

  it('treats a missing or empty value as page 1', () => {
    expect(parsePage(null)).toBe(1)
    expect(parsePage('')).toBe(1)
  })

  it('treats anything that is not a positive whole number as page 1', () => {
    for (const raw of ['0', '00', '-1', 'abc', '1.5', '2abc', ' 3', '3 ', '1e3', '+2', '0x10']) {
      expect(parsePage(raw), raw).toBe(1)
    }
  })

  it('treats a number too big to be exact as page 1', () => {
    expect(parsePage('99999999999999999999')).toBe(1)
  })
})

describe('clampPage', () => {
  it('keeps a page inside the range', () => {
    expect(clampPage(1, 3)).toBe(1)
    expect(clampPage(3, 3)).toBe(3)
  })

  it('goes to the last page when the page is past the end', () => {
    expect(clampPage(4, 3)).toBe(3)
    expect(clampPage(99, 1)).toBe(1)
  })

  it('never returns less than 1', () => {
    expect(clampPage(5, 0)).toBe(1)
  })
})

describe('withPage', () => {
  it('writes the page and keeps the other params', () => {
    const params = new URLSearchParams('q=tea')
    expect(withPage(params, 3).toString()).toBe('q=tea&page=3')
  })

  it('replaces an existing page', () => {
    expect(withPage(new URLSearchParams('page=2&q=tea'), 5).toString()).toBe('page=5&q=tea')
  })

  it('removes the page for page 1', () => {
    expect(withPage(new URLSearchParams('q=tea&page=4'), 1).toString()).toBe('q=tea')
    expect(withPage(new URLSearchParams('page=4'), 1).toString()).toBe('')
  })

  it('does not change the params it was given', () => {
    const params = new URLSearchParams('page=2')
    withPage(params, 3)
    expect(params.toString()).toBe('page=2')
  })
})
