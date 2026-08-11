import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthShell } from '../components/AuthShell'
import { Alert, Button, ErrorText, Field, Input, PasswordInput, Textarea } from '../components/ui'
import { VenueApi } from '../api'
import { setToken, extractErrorMessage } from '../api/client'

export function VenueRegister() {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    venueName: '',
    address: '',
    description: '',
    phone: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.venueName.trim().length < 3) return setError('Məkan adı ən azı 3 simvol olmalıdır')
    if (form.password.length < 6) return setError('Şifrə ən azı 6 simvol olmalıdır')
    setLoading(true)
    try {
      const res = await VenueApi.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        venueName: form.venueName.trim(),
        address: form.address.trim() || undefined,
        description: form.description.trim() || undefined,
        phone: form.phone.trim() || undefined,
      })
      setToken(res.token)
      setUser(res.player)
      navigate('/venues/mine', { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Klubunuzu qeydiyyatdan keçirin"
      subtitle="Məkanınızı xəritəyə çıxarın, turnirlər açın və oyunçuları qəbul edin."
      footer={
        <p>
          Adi oyunçu kimi qoşulmaq istəyirsiniz?{' '}
          <Link to="/register" className="font-semibold text-felt-700 underline-offset-4 hover:underline">
            Buradan qeydiyyat
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Alert tone="info">
          Sahib hesabı yaradılır. Bu hesabla məkanı idarə edəcək, şəkil yükləyəcək və turnir açacaqsınız.
        </Alert>

        <FormSection title="Məkan haqqında">
          <Field label="Məkanın adı">
            <Input
              value={form.venueName}
              onChange={set('venueName')}
              placeholder="Legenda Bilyard Klub"
              autoFocus
            />
          </Field>
          <Field label="Ünvan" optional>
            <Input value={form.address} onChange={set('address')} placeholder="Bakı, Nizami küçəsi 10" />
          </Field>
          <Field label="Telefon" optional>
            <Input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="+994 50 000 00 00"
              autoComplete="tel"
            />
          </Field>
          <Field label="Təsvir" optional hint="Masaların sayı, iş saatları, xidmətlər">
            <Textarea rows={3} maxLength={1000} value={form.description} onChange={set('description')} />
          </Field>
        </FormSection>

        <FormSection title="Giriş məlumatları">
          <Field label="İstifadəçi adı">
            <Input
              value={form.username}
              onChange={set('username')}
              placeholder="legenda"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
            />
          </Field>
          <Field label="E-poçt">
            <Input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="info@legenda.az"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
            />
          </Field>
          <Field label="Şifrə" hint="Ən azı 6 simvol">
            <PasswordInput
              value={form.password}
              onChange={set('password')}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </Field>
        </FormSection>

        <ErrorText>{error}</ErrorText>

        <Button
          type="submit"
          size="lg"
          block
          loading={loading}
          disabled={!form.venueName || !form.username || !form.email || !form.password}
        >
          Məkanı qeydiyyatdan keçir
        </Button>
      </form>
    </AuthShell>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="space-y-4">
      <h2 className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-wood-600">
        {title}
        <span className="rule-brass h-px flex-1" aria-hidden />
      </h2>
      {children}
    </section>
  )
}
