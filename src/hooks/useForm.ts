import { useState, type ChangeEvent, type FormEvent } from 'react'
import { validate, type Rules } from '../utils/validation'
import { useToast } from '../context/ToastContext'

type FieldElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

/**
 * Small form helper: string values, per-field validation, submit state, and API error toasts.
 * Fields validate on blur and on submit; once a field has an error it re-validates as you type.
 */
export function useForm<T extends string>(initial: Record<T, string>, rules: Rules<T>) {
  const [values, setValues] = useState(initial)
  const [errors, setErrors] = useState<Partial<Record<T, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const toast = useToast()

  const validateField = (field: T, nextValues: Record<T, string>) => {
    const fieldErrors = validate(nextValues, { [field]: rules[field] } as Rules<T>)
    setErrors(current => ({ ...current, [field]: fieldErrors[field] }))
  }

  const setField = (field: T, value: string) => {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)
    if (errors[field]) validateField(field, nextValues)
  }

  const bind = (field: T) => ({
    name: field,
    id: field,
    value: values[field],
    onChange: (event: ChangeEvent<FieldElement>) => setField(field, event.target.value),
    onBlur: () => validateField(field, values),
    'aria-invalid': Boolean(errors[field]),
  })

  const handleSubmit = (onValid: (values: Record<T, string>) => Promise<void> | void) => async (event?: FormEvent) => {
    event?.preventDefault()
    const nextErrors = validate(values, rules)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    setSubmitting(true)
    try {
      await onValid(values)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = (next: Record<T, string> = initial) => {
    setValues(next)
    setErrors({})
  }

  return { values, errors, submitting, bind, setField, handleSubmit, reset }
}
