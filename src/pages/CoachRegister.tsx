import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthShell } from '../components/AuthShell'
import {
  Alert,
  Button,
  ErrorText,
  Field,
  Input,
  PasswordInput,
  Select,
  Textarea,
  cx,
} from '../components/ui'
import { CoachApi, VenueApi } from '../api'
import { setToken, extractErrorMessage } from '../api/client'
import { GAME_TYPES, GAME_TYPE_LABEL } from '../constants/gameTypes'
import type { GameType, Venue } from '../api/types'

export function CoachRegister() {
  const { setUser } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    headline: '',
    about: '',
    experienceYears: '',
    certifications: '',
    phone: '',
    venueId: '',
  })
  const [gameTypes, setGameTypes] = useState<GameType[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Klub siyahısı istəyə bağlıdır — alınmasa forma yenə işləyir
  useEffect(() => {
    VenueApi.list().then(setVenues).catch(() => setVenues([]))
  }, [])

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }))

  const toggleType = (g: GameType) =>
    setGameTypes((list) => (list.includes(g) ? list.filter((x) => x !== g) : [...list, g]))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.fullName.trim().length < 3) return setError('Ad və soyad ən azı 3 simvol olmalıdır')
    if (form.password.length < 6) return setError('Şifrə ən azı 6 simvol olmalıdır')
    setLoading(true)
    try {
      const res = await CoachApi.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        fullName: form.fullName.trim(),
        headline: form.headline.trim() || undefined,
        about: form.about.trim() || undefined,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
        certifications: form.certifications.trim() || undefined,
        phone: form.phone.trim() || undefined,
        venueId: form.venueId ? Number(form.venueId) : undefined,
        gameTypes: gameTypes.length > 0 ? gameTypes : undefined,
      })
      setToken(res.token)
      setUser(res.player)
      navigate('/coaches/panel', { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Məşqçi hesabı açın"
      subtitle="Dərs paketlərinizi yerləşdirin, şagird sifarişlərini bir yerdən idarə edin."
      footer={
        <p>
          Adi oyunçu kimi qoşulmaq istəyirsiniz?{' '}
          <Link to="/register" className="font-semibold text-felt-300 underline-offset-4 hover:underline">
            Buradan qeydiyyat
          </Link>
        </p>
      }
    >
      <form onSubmit={submit} className="space-y-5" noValidate>
        <Alert tone="info">
          Məşqçi hesabı adi oyunçu hesabıdır — reytinqiniz və maçlarınız qalır, üstəlik
          dərs paketi satma paneli açılır.
        </Alert>

        <FormSection title="Məşqçi haqqında">
          <Field label="Ad və soyad">
            <Input
              value={form.fullName}
              onChange={set('fullName')}
              placeholder="Rövşən Səfərov"
              autoFocus
              autoComplete="name"
            />
          </Field>
          <Field label="Qısa təqdimat" optional hint="Vitrində adınızın altında görünür">
            <Input
              value={form.headline}
              onChange={set('headline')}
              maxLength={160}
              placeholder="ABF sertifikatlı məşqçi · snooker və 8 top"
            />
          </Field>
          <Field label="Təcrübə (il)" optional>
            <Input
              type="number"
              min={0}
              max={70}
              value={form.experienceYears}
              onChange={set('experienceYears')}
              placeholder="8"
              className="tabular-nums"
            />
          </Field>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">
              Hansı intizamlarda dərs verirsiniz?
            </p>
            <div className="flex flex-wrap gap-2">
              {GAME_TYPES.map((g) => {
                const on = gameTypes.includes(g)
                return (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={on}
                    onClick={() => toggleType(g)}
                    className={cx(
                      'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors duration-150',
                      on
                        ? 'border-gold-400/45 bg-gold-400/12 text-gold-300'
                        : 'border-rail-strong text-ink-500 hover:border-gold-400/30 hover:text-ink-800',
                    )}
                  >
                    {GAME_TYPE_LABEL[g]}
                  </button>
                )
              })}
            </div>
            <p className="mt-1.5 text-xs text-ink-400">
              Seçim etməsəniz bütün intizamlar göstərilir.
            </p>
          </div>

          {venues.length > 0 && (
            <Field label="Dərs verdiyiniz klub" optional>
              <Select value={form.venueId} onChange={set('venueId')}>
                <option value="">Klub seçilməyib</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </Select>
            </Field>
          )}

          <Field label="Telefon" optional hint="Şagirdlər profilinizdə görəcək">
            <Input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              placeholder="+994 50 000 00 00"
              autoComplete="tel"
            />
          </Field>
          <Field label="Sertifikatlar" optional>
            <Input
              value={form.certifications}
              onChange={set('certifications')}
              maxLength={500}
              placeholder="ABF I dərəcəli məşqçi sertifikatı, 2019"
            />
          </Field>
          <Field label="Haqqında" optional hint="Metodunuz, kimlərlə işləmisiniz, nəticələr">
            <Textarea rows={3} maxLength={2000} value={form.about} onChange={set('about')} />
          </Field>
        </FormSection>

        <FormSection title="Giriş məlumatları">
          <Field label="İstifadəçi adı">
            <Input
              value={form.username}
              onChange={set('username')}
              placeholder="rovshan"
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
              placeholder="rovshan@example.az"
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
          disabled={!form.fullName || !form.username || !form.email || !form.password}
        >
          Məşqçi hesabını aç
        </Button>
      </form>
    </AuthShell>
  )
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="space-y-4">
      <h2 className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-300">
        {title}
        <span className="rule-gold h-px flex-1" aria-hidden />
      </h2>
      {children}
    </section>
  )
}
