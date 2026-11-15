import { useState } from 'react'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { Button, Field } from '../../components/ui'
import { useAuth } from '../../context/auth'
import { useToast } from '../../context/ToastContext'
import { useForm } from '../../hooks/useForm'
import { demoAccounts } from '../../data/seed'
import { roleLabels } from '../../data/labels'
import { email, required } from '../../utils/validation'

export function LoginPage({ onRegister }: { onRegister: () => void }) {
  const { login } = useAuth()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm({ email: '', password: '' }, {
    email: [required('Email'), email],
    password: [required('Password')],
  })

  const submit = form.handleSubmit(async values => {
    const user = await login(values.email, values.password)
    toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
  })

  return (
    <AuthLayout title="Sign in" subtitle="Use your university account to access Amity 360.">
      <form onSubmit={submit} noValidate className="form-stack">
        <Field label="Email" htmlFor="email" error={form.errors.email} required>
          <input className="input" type="email" autoComplete="email" placeholder="you@amity360.edu" {...form.bind('email')} />
        </Field>
        <Field label="Password" htmlFor="password" error={form.errors.password} required>
          <div className="input-with-action">
            <input className="input" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Your password" {...form.bind('password')} />
            <button type="button" onClick={() => setShowPassword(show => !show)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </Field>
        <Button type="submit" loading={form.submitting} icon={<LogIn />} className="btn-block">Sign in</Button>
      </form>
      <p className="auth-switch">New to Amity 360? <button onClick={onRegister}>Create an account</button></p>
      <div className="demo-box">
        <span className="eyebrow">DEMO ACCOUNTS</span>
        <div className="demo-list">
          {demoAccounts.map(account => (
            <button key={account.email} type="button" onClick={() => form.reset({ email: account.email, password: account.password })}>
              <strong>{roleLabels[account.role]}</strong>
              <span>{account.email}</span>
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  )
}
