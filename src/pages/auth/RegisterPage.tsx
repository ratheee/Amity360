import { useState } from 'react'
import { GraduationCap, Presentation, UserPlus } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button, Field } from '../../components/ui'
import { useAuth } from '../../context/auth'
import { useToast } from '../../context/ToastContext'
import { useForm } from '../../hooks/useForm'
import { departments, programs } from '../../data/labels'
import { email, enrollment, matches, maxLength, minLength, passwordStrength, required, strongPassword, type Validator } from '../../utils/validation'

const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong']

type Fields = 'name' | 'email' | 'enrollmentNo' | 'program' | 'semester' | 'department' | 'password' | 'confirm' | 'terms'

export function RegisterPage({ onLogin }: { onLogin: () => void }) {
  const { register } = useAuth()
  const toast = useToast()
  const [role, setRole] = useState<'student' | 'faculty'>('student')

  // Role-specific fields are only required for that role.
  const whenStudent = (rule: Validator): Validator => (value, values) => (role === 'student' ? rule(value, values) : undefined)
  const whenFaculty = (rule: Validator): Validator => (value, values) => (role === 'faculty' ? rule(value, values) : undefined)

  const form = useForm<Fields>(
    { name: '', email: '', enrollmentNo: '', program: '', semester: '', department: '', password: '', confirm: '', terms: '' },
    {
      name: [required('Full name'), minLength(3, 'Full name'), maxLength(60, 'Full name')],
      email: [required('Email'), email],
      enrollmentNo: [whenStudent(required('Enrollment number')), whenStudent(enrollment)],
      program: [whenStudent(required('Programme'))],
      semester: [whenStudent(required('Semester'))],
      department: [whenFaculty(required('Department'))],
      password: [required('Password'), strongPassword],
      confirm: [required('Please confirm your password'), matches('password', 'Passwords do not match')],
      terms: [value => (value === 'yes' ? undefined : 'You must accept the campus code of conduct')],
    },
  )

  const strength = passwordStrength(form.values.password)

  const submit = form.handleSubmit(async values => {
    const user = await register({
      name: values.name,
      email: values.email,
      password: values.password,
      role,
      ...(role === 'student'
        ? { enrollmentNo: values.enrollmentNo, program: values.program, semester: Number(values.semester) }
        : { department: values.department }),
    })
    toast.success(`Account created. Welcome, ${user.name.split(' ')[0]}!`)
  })

  return (
    <AuthLayout title="Create your account" subtitle="Register with your university details to get started.">
      <div className="role-picker" role="radiogroup" aria-label="Account type">
        <button type="button" role="radio" aria-checked={role === 'student'} className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>
          <GraduationCap /><span><strong>Student</strong><small>Enrolled learner</small></span>
        </button>
        <button type="button" role="radio" aria-checked={role === 'faculty'} className={role === 'faculty' ? 'active' : ''} onClick={() => setRole('faculty')}>
          <Presentation /><span><strong>Faculty</strong><small>Teaching staff</small></span>
        </button>
      </div>
      <form onSubmit={submit} noValidate className="form-stack">
        <Field label="Full name" htmlFor="name" error={form.errors.name} required>
          <input className="input" autoComplete="name" placeholder="e.g. Ananya Singh" {...form.bind('name')} />
        </Field>
        <Field label="University email" htmlFor="email" error={form.errors.email} required>
          <input className="input" type="email" autoComplete="email" placeholder="you@amity360.edu" {...form.bind('email')} />
        </Field>
        {role === 'student' ? (
          <>
            <Field label="Enrollment number" htmlFor="enrollmentNo" error={form.errors.enrollmentNo} required>
              <input className="input" placeholder="e.g. A50105223041" {...form.bind('enrollmentNo')} />
            </Field>
            <div className="form-row">
              <Field label="Programme" htmlFor="program" error={form.errors.program} required>
                <select className="input" {...form.bind('program')}>
                  <option value="">Select…</option>
                  {programs.map(item => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Semester" htmlFor="semester" error={form.errors.semester} required>
                <select className="input" {...form.bind('semester')}>
                  <option value="">Select…</option>
                  {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>Semester {i + 1}</option>)}
                </select>
              </Field>
            </div>
          </>
        ) : (
          <Field label="Department" htmlFor="department" error={form.errors.department} required>
            <select className="input" {...form.bind('department')}>
              <option value="">Select…</option>
              {departments.filter(item => item !== 'Administration').map(item => <option key={item}>{item}</option>)}
            </select>
          </Field>
        )}
        <div className="form-row">
          <Field label="Password" htmlFor="password" error={form.errors.password} required>
            <input className="input" type="password" autoComplete="new-password" {...form.bind('password')} />
          </Field>
          <Field label="Confirm password" htmlFor="confirm" error={form.errors.confirm} required>
            <input className="input" type="password" autoComplete="new-password" {...form.bind('confirm')} />
          </Field>
        </div>
        {form.values.password && (
          <div className={`strength strength-${strength}`} aria-live="polite">
            <div className="strength-bar"><span /></div>
            <small>{strengthLabels[strength]}</small>
          </div>
        )}
        <div className={`field ${form.errors.terms ? 'has-error' : ''}`}>
          <label className="checkbox">
            <input type="checkbox" checked={form.values.terms === 'yes'} onChange={event => form.setField('terms', event.target.checked ? 'yes' : '')} />
            I agree to follow the campus code of conduct and IT usage policy.
          </label>
          {form.errors.terms && <p className="field-error" role="alert">{form.errors.terms}</p>}
        </div>
        <Button type="submit" loading={form.submitting} icon={<UserPlus />} className="btn-block">Create account</Button>
      </form>
      <p className="auth-switch">Already registered? <button onClick={onLogin}>Sign in</button></p>
    </AuthLayout>
  )
}
