import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Field, Input, Textarea, ErrorText, Spinner } from '../components/ui'
import { AuthShell } from './Login'
import { VenueApi } from '../api'
import { setToken } from '../api/client'
import { extractErrorMessage } from '../api/client'

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
    if (form.password.length < 6) return setError('Şifrə ən azı 6 simvol olmalıdır')
    if (form.venueName.trim().length < 3) return setError('Məkan adı ən azı 3 simvol olmalıdır')
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
    <AuthShell subtitle="Məkanınızı qeydiyyatdan keçirin — turnirlər açın, oyunçuları qəbul edin.">
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-lg border border-felt-200 bg-felt-100 px-3 py-2 text-xs text-felt-800">
          Sahib hesabı yaradılır. Bu hesabla məkanınızı idarə edəcəksiniz.
        </div>
        <Field label="Məkanın adı">
          <Input value={form.venueName} onChange={set('venueName')} placeholder="Legenda Bilyard Klub" autoFocus />
        </Field>
        <Field label="Ünvan">
          <Input value={form.address} onChange={set('address')} placeholder="Bakı, Nizami küçəsi 10" />
        </Field>
        <Field label="Təsvir">
          <Textarea rows={2} maxLength={1000} value={form.description} onChange={set('description')}
            placeholder="Masaların sayı, xidmətlər..." />
        </Field>
        <Field label="Telefon">
          <Input value={form.phone} onChange={set('phone')} placeholder="+994 50 000 00 00" />
        </Field>
        <hr className="border-wood-200" />
        <Field label="İstifadəçi adı (giriş üçün)">
          <Input value={form.username} onChange={set('username')} placeholder="legenda" />
        </Field>
        <Field label="E-poçt">
          <Input type="email" value={form.email} onChange={set('email')} placeholder="info@legenda.az" />
        </Field>
        <Field label="Şifrə">
          <Input type="password" value={form.password} onChange={set('password')} placeholder="ən azı 6 simvol" />
        </Field>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : 'Məkanı qeydiyyatdan keçir'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-500">
        Adi oyunçu kimi?{' '}
        <Link to="/register" className="font-semibold text-felt-700 hover:text-felt-800">
          Buradan qeydiyyat
        </Link>
      </p>
    </AuthShell>
  )
}
