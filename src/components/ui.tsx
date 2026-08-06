import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'

const variants: Record<Variant, string> = {
  primary: 'bg-felt-700 hover:bg-felt-800 text-cream font-semibold',
  secondary: 'bg-cream hover:bg-wood-100 text-ink-900 border border-wood-200',
  ghost: 'bg-transparent hover:bg-wood-100 text-ink-700',
  danger: 'bg-red-700 hover:bg-red-800 text-cream font-medium',
  success: 'bg-felt-600 hover:bg-felt-700 text-cream font-semibold',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: { variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm transition
        disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-wood-200/70 bg-card p-5 shadow-sm ${className}`}>
      {children}
    </div>
  )
}

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-lg bg-cream border border-wood-200 px-3.5 py-2.5 text-sm text-ink-900
        placeholder:text-ink-400 outline-none focus:border-felt-600 focus:ring-2 focus:ring-felt-600/20 ${className}`}
      {...props}
    />
  )
}

export function Textarea({ className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-lg bg-cream border border-wood-200 px-3.5 py-2.5 text-sm text-ink-900
        placeholder:text-ink-400 outline-none focus:border-felt-600 focus:ring-2 focus:ring-felt-600/20 ${className}`}
      {...props}
    />
  )
}

export function Select({ className = '', children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`w-full rounded-lg bg-cream border border-wood-200 px-3.5 py-2.5 text-sm text-ink-900
        outline-none focus:border-felt-600 focus:ring-2 focus:ring-felt-600/20 ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

export function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-500">{children}</label>
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null
  return <p className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{children}</p>
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <div className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-felt-200 border-t-felt-700 ${className}`} />
  )
}

export function PageLoader({ label = 'Yüklənir...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-ink-500">
      <Spinner className="h-7 w-7" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-dashed border-wood-200 bg-card/60 py-14 text-center">
      <p className="text-ink-700">{title}</p>
      {hint && <p className="mt-1 text-sm text-ink-500">{hint}</p>}
    </div>
  )
}

type BadgeTone = 'neutral' | 'green' | 'red' | 'yellow' | 'blue'
const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-wood-100 text-ink-700 border-wood-200',
  green: 'bg-felt-100 text-felt-800 border-felt-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  yellow: 'bg-amber-50 text-amber-800 border-amber-200',
  blue: 'bg-sky-50 text-sky-800 border-sky-200',
}
export function Badge({ tone = 'neutral', children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${badgeTones[tone]}`}>
      {children}
    </span>
  )
}
