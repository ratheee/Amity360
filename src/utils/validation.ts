/** A validator returns an error message, or undefined when the value is valid. */
export type Validator = (value: string, values: Record<string, string>) => string | undefined

export const required = (label = 'This field'): Validator => value => (value.trim() ? undefined : `${label} is required`)

export const email: Validator = value =>
  !value || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? undefined : 'Enter a valid email address'

export const minLength = (min: number, label = 'This field'): Validator => value =>
  !value || value.trim().length >= min ? undefined : `${label} must be at least ${min} characters`

export const maxLength = (max: number, label = 'This field'): Validator => value =>
  value.trim().length <= max ? undefined : `${label} must be at most ${max} characters`

export const url: Validator = value => {
  if (!value) return undefined
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? undefined : 'Link must start with http:// or https://'
  } catch {
    return 'Enter a valid link (https://…)'
  }
}

export const strongPassword: Validator = value => {
  if (!value) return undefined
  if (value.length < 8) return 'Password must be at least 8 characters'
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value)) return 'Use upper & lower case letters and a number'
  return undefined
}

export const matches = (field: string, message: string): Validator => (value, values) => (value === values[field] ? undefined : message)

export const enrollment: Validator = value =>
  !value || /^[A-Z0-9]{6,15}$/i.test(value.trim()) ? undefined : 'Enrollment number should be 6–15 letters/digits'

export const numberRange = (min: number, max: number, label = 'Value'): Validator => value => {
  if (!value) return undefined
  const n = Number(value)
  return Number.isFinite(n) && n >= min && n <= max ? undefined : `${label} must be between ${min} and ${max}`
}

export const notInPast: Validator = value => {
  if (!value) return undefined
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return new Date(value) >= today ? undefined : 'Date cannot be in the past'
}

export type Rules<T extends string> = Partial<Record<T, Validator[]>>

export const validate = <T extends string>(values: Record<T, string>, rules: Rules<T>) => {
  const errors: Partial<Record<T, string>> = {}
  for (const field of Object.keys(rules) as T[]) {
    for (const rule of rules[field] ?? []) {
      const error = rule(values[field] ?? '', values)
      if (error) {
        errors[field] = error
        break
      }
    }
  }
  return errors
}

export const passwordStrength = (value: string) => {
  let score = 0
  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++
  if (/\d/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++
  return Math.min(score, 4)
}
