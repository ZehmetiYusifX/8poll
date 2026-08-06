import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Field, Input, ErrorText, Spinner } from '../components/ui'
import { AuthShell } from './Login'
import { extractErrorMessage } from '../api/client'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', fullName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) return setError('Şifrə ən azı 6 simvol olmalıdır')
    setLoading(true)
    try {
      await register({
        username: form.username.trim(),
        fullName: form.fullName.trim() || undefined,
        email: form.email.trim(),
        password: form.password,
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell subtitle="Hesab yaradın və ilk dəvətinizi göndərin.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="İstifadəçi adı">
          <Input value={form.username} onChange={set('username')} placeholder="aslan" autoFocus />
        </Field>
        <Field label="Ad Soyad">
          <Input value={form.fullName} onChange={set('fullName')} placeholder="Aslan Məmmədov" />
        </Field>
        <Field label="E-poçt">
          <Input type="email" value={form.email} onChange={set('email')} placeholder="aslan@example.com" />
        </Field>
        <Field label="Şifrə">
          <Input type="password" value={form.password} onChange={set('password')} placeholder="ən azı 6 simvol" />
        </Field>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : 'Qeydiyyatdan keç'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-500">
        Artıq hesabınız var?{' '}
        <Link to="/login" className="font-semibold text-felt-700 hover:text-felt-800">
          Daxil olun
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-ink-500">
        Məkan sahibisiniz?{' '}
        <Link to="/venues/register" className="font-semibold text-felt-700 hover:text-felt-800">
          Məkan kimi qeydiyyat
        </Link>
      </p>
    </AuthShell>
  )
}
