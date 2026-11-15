import { KeyRound, LogOut, Save } from 'lucide-react'
import { useAuth, useCurrentUser } from '../context/auth'
import { useToast } from '../context/ToastContext'
import { useForm } from '../hooks/useForm'
import { api } from '../services/api'
import { departments, programs, roleLabels } from '../data/labels'
import { Badge, Button, Field, Panel } from '../components/ui'
import { formatDate, initials } from '../utils/format'
import { matches, maxLength, minLength, required, strongPassword } from '../utils/validation'

export function ProfilePage() {
  const user = useCurrentUser()
  const { setUser, logout } = useAuth()
  const toast = useToast()

  const profile = useForm({ name: user.name, program: user.program ?? '', semester: user.semester?.toString() ?? '', department: user.department ?? '' }, {
    name: [required('Name'), minLength(3, 'Name'), maxLength(60, 'Name')],
  })

  const password = useForm({ current: '', next: '', confirm: '' }, {
    current: [required('Current password')],
    next: [required('New password'), strongPassword],
    confirm: [required('Please confirm the new password'), matches('next', 'Passwords do not match')],
  })

  const saveProfile = profile.handleSubmit(async values => {
    const updated = await api.auth.updateProfile(user, user.role === 'student'
      ? { name: values.name.trim(), program: values.program, semester: Number(values.semester) }
      : { name: values.name.trim(), department: values.department })
    setUser(updated)
    toast.success('Profile updated')
  })

  const savePassword = password.handleSubmit(async values => {
    await api.auth.changePassword(user, values.current, values.next)
    password.reset()
    toast.success('Password changed')
  })

  return (
    <>
      <section className="profile-hero">
        <div className="avatar large">{initials(user.name)}</div>
        <div>
          <h1>{user.name}</h1>
          <p>{user.email}</p>
          <div className="tag-list">
            <Badge tone="blue">{roleLabels[user.role]}</Badge>
            {user.enrollmentNo && <Badge tone="gray">{user.enrollmentNo}</Badge>}
            <Badge tone="gray">Member since {formatDate(user.createdAt, { month: 'short', year: 'numeric' })}</Badge>
          </div>
        </div>
        <Button variant="secondary" icon={<LogOut />} onClick={logout} className="profile-logout">Sign out</Button>
      </section>

      <div className="two-col">
        <Panel eyebrow="ACCOUNT" title="Profile details">
          <form className="form-stack" onSubmit={saveProfile} noValidate>
            <Field label="Full name" htmlFor="name" error={profile.errors.name} required><input className="input" {...profile.bind('name')} /></Field>
            {user.role === 'student' ? (
              <div className="form-row">
                <Field label="Programme" htmlFor="program"><select className="input" {...profile.bind('program')}>{programs.map(item => <option key={item}>{item}</option>)}</select></Field>
                <Field label="Semester" htmlFor="semester"><select className="input" {...profile.bind('semester')}>{Array.from({ length: 10 }, (_, i) => <option key={i} value={i + 1}>Semester {i + 1}</option>)}</select></Field>
              </div>
            ) : (
              <Field label="Department" htmlFor="department"><select className="input" {...profile.bind('department')}>{departments.map(item => <option key={item}>{item}</option>)}</select></Field>
            )}
            <Button type="submit" loading={profile.submitting} icon={<Save />}>Save changes</Button>
          </form>
        </Panel>
        <Panel eyebrow="SECURITY" title="Change password">
          <form className="form-stack" onSubmit={savePassword} noValidate>
            <Field label="Current password" htmlFor="current" error={password.errors.current} required><input className="input" type="password" autoComplete="current-password" {...password.bind('current')} /></Field>
            <Field label="New password" htmlFor="next" error={password.errors.next} hint="8+ characters with upper & lower case letters and a number" required><input className="input" type="password" autoComplete="new-password" {...password.bind('next')} /></Field>
            <Field label="Confirm new password" htmlFor="confirm" error={password.errors.confirm} required><input className="input" type="password" autoComplete="new-password" {...password.bind('confirm')} /></Field>
            <Button type="submit" variant="secondary" loading={password.submitting} icon={<KeyRound />}>Update password</Button>
          </form>
        </Panel>
      </div>
    </>
  )
}
