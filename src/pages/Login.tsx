import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { AuthShell } from '../components/AuthShell'
import { Button, ErrorText, Field, Input, PasswordInput } from '../components/ui'
import { extractErrorMessage } from '../api/client'

const DEMO = { username: 'aslan', password: 'parol123' }

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login({ username: username.trim(), password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = () => {
    setUsername(DEMO.username)
    setPassword(DEMO.password)
    setError('')
  }

  return (
    <AuthShell
      title="Yenidən xoş gəldiniz"
      subtitle="Hesabınıza daxil olun və reytinqinizi yüksəltməyə davam edin."
      footer={
        <>
          <p>
            Hesabınız yoxdur?{' '}
            <Link to="/register" className="font-semibold text-felt-700 underline-offset-4 hover:underline">
              Qeydiyyatdan keçin
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
        <Field label="İstifadəçi adı">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="aslan"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            autoFocus
          />
        </Field>

        <Field label="Şifrə">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Field>

        <ErrorText>{error}</ErrorText>

        <Button type="submit" size="lg" block loading={loading} disabled={!username || !password}>
          Daxil ol
        </Button>
      </form>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-lg border border-dashed border-rail-strong bg-cream px-3.5 py-2.5">
        <div className="text-xs text-ink-500">
          Demo hesab: <span className="font-semibold text-ink-700">{DEMO.username}</span> /{' '}
          <span className="font-semibold text-ink-700">{DEMO.password}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={fillDemo}>
          Doldur
        </Button>
      </div>
    </AuthShell>
  )
}
