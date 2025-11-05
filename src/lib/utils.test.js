import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn utility', () => {
  it('combina clases correctamente', () => {
    const result = cn('btn', ['primary', false && 'hidden'], { active: true, disabled: false })
    expect(result).toContain('btn')
    expect(result).toContain('primary')
    expect(result).toContain('active')
    expect(result).not.toContain('hidden')
    expect(result).not.toContain('disabled')
  })
})