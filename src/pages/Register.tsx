import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthShell } from '../components/AuthShell'
import { Button, ErrorText, Field, Input, PasswordInput } from '../components/ui'
import { extractErrorMessage } from '../api/client'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ username: '', fullName: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [touched, setTouched] = useState(false)

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const passwordError = touched && form.password.length > 0 && form.password.length < 6
    ? 'Ən azı 6 simvol olmalıdır'
    : undefined

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setTouched(true)
    if (form.password.length < 6) return
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
    <AuthShell
      title="Hesab yaradın"
      subtitle="Bir neçə saniyə çəkir — sonra ilk dəvətinizi göndərə bilərsiniz."
      footer={
        <>
          <p>
            Artıq hesabınız var?{' '}
            <Link to="/login" className="font-semibold text-felt-700 underline-offset-4 hover:underline">
              Daxil olun
            </Link>
          </p>
          <p>
            Məkan sahibisiniz?{' '}
            <Link to="/venues/register" className="font-semibold text-felt-700 underline-offset-4 hover:underline">
              Klub hesabı açın
            </Link>
          </p>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="İstifadəçi adı">
            <Input
              value={form.username}
              onChange={set('username')}
              placeholder="aslan"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
            />
          </Field>
          <Field label="Ad Soyad">
            <Input
              value={form.fullName}
              onChange={set('fullName')}
              placeholder="Aslan Məmmədov"
              autoComplete="name"
            />
          </Field>
        </div>

        <Field label="E-poçt">
          <Input
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="aslan@example.com"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
          />
        </Field>

        <Field
          label="Şifrə"
          hint="Ən azı 6 simvol"
          error={passwordError}
        >
          <PasswordInput
            value={form.password}
            onChange={set('password')}
            placeholder="••••••••"
            autoComplete="new-password"
          />
        </Field>

        <ErrorText>{error}</ErrorText>

        <Button
          type="submit"
          size="lg"
          block
          loading={loading}
          disabled={!form.username || !form.email || !form.password}
        >
          Qeydiyyatdan keç
        </Button>

        <p className="text-center text-xs leading-relaxed text-ink-400">
          Başlanğıc reytinqiniz <span className="font-semibold text-ink-500">1200 xal</span> olacaq.
        </p>
      </form>
    </AuthShell>
  )
}
