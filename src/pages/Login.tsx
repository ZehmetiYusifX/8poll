import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Card, Field, Input, ErrorText, Spinner } from '../components/ui'
import { extractErrorMessage } from '../api/client'

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

  return (
    <AuthShell subtitle="Xoş gəlmisiniz! Reytinqinizi yüksəltməyə davam edin.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="İstifadəçi adı">
          <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="aslan" autoFocus />
        </Field>
        <Field label="Şifrə">
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
        </Field>
        <ErrorText>{error}</ErrorText>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Spinner /> : 'Daxil ol'}
        </Button>
      </form>
      <p className="mt-5 text-center text-sm text-ink-500">
        Hesabınız yoxdur?{' '}
        <Link to="/register" className="font-semibold text-felt-700 hover:text-felt-800">
          Qeydiyyatdan keçin
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-ink-500">
        Məkan sahibisiniz?{' '}
        <Link to="/venues/register" className="font-semibold text-felt-700 hover:text-felt-800">
          Məkan kimi qeydiyyat
        </Link>
      </p>
      <p className="mt-3 text-center text-xs text-ink-400">
        Demo: <b>aslan</b> / <b>parol123</b>
      </p>
    </AuthShell>
  )
}

export function AuthShell({ children, subtitle }: { children: React.ReactNode; subtitle: string }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2.5">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 ring-2 ring-felt-700 ring-offset-2 ring-offset-paper">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cream text-sm font-black text-ink-900">
              8
            </span>
          </span>
          <span className="font-display text-3xl font-bold tracking-tight text-ink-900">poll</span>
        </div>
        <p className="text-sm text-ink-500">{subtitle}</p>
      </div>
      <Card>{children}</Card>
    </div>
  )
}
