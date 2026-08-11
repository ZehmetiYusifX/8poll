import { createContext, useContext, useId, useState } from 'react'
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import {
  IconAlert,
  IconCheck,
  IconChevronDown,
  IconEightBall,
  IconEye,
  IconEyeOff,
  IconInfo,
} from './icons'

/** Şərti sinifləri birləşdirən kiçik köməkçi */
export function cx(...parts: Array<string | false | 0 | null | undefined>): string {
  return parts.filter((p): p is string => typeof p === 'string' && p.length > 0).join(' ')
}

/* ═══════════════════════════════════════════════════════════════
   Button
   ═══════════════════════════════════════════════════════════════ */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'brass'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

const variantClass: Record<ButtonVariant, string> = {
  primary: 'bg-felt-700 text-cream shadow-xs hover:bg-felt-800 focus-visible:outline-felt-800',
  secondary:
    'bg-card text-ink-800 border border-rail-strong shadow-xs hover:bg-cream hover:border-wood-300',
  ghost: 'text-ink-600 hover:bg-wood-100 hover:text-ink-900',
  danger: 'bg-clay-700 text-white shadow-xs hover:bg-clay-800 focus-visible:outline-clay-800',
  success: 'bg-felt-600 text-cream shadow-xs hover:bg-felt-700',
  brass: 'bg-wood-500 text-white shadow-xs hover:bg-wood-600',
}

const sizeClass: Record<ButtonSize, string> = {
  sm: 'h-8 gap-1.5 rounded-lg px-3 text-[13px]',
  md: 'h-10 gap-2 rounded-lg px-4 text-sm',
  lg: 'h-11 gap-2 rounded-xl px-5 text-[15px]',
  icon: 'h-9 w-9 rounded-lg',
}

export function buttonClass(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra = '',
): string {
  return cx(
    'inline-flex select-none items-center justify-center font-medium whitespace-nowrap',
    'transition-[background-color,border-color,color,box-shadow,transform] duration-150',
    'active:translate-y-px disabled:pointer-events-none disabled:opacity-55',
    variantClass[variant],
    sizeClass[size],
    extra,
  )
}

/** Düymənin öz rəngini götürən kiçik spinner */
function SpinnerIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={cx('h-4 w-4 shrink-0 animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Yüklənmə vəziyyəti — düymə bloklanır və spinner göstərilir */
  loading?: boolean
  icon?: ReactNode
  iconRight?: ReactNode
  block?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  block = false,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={buttonClass(variant, size, cx(block && 'w-full', className))}
      {...props}
    >
      {loading ? <SpinnerIcon /> : icon}
      {children}
      {!loading && iconRight}
    </button>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Səthlər
   ═══════════════════════════════════════════════════════════════ */

export function Card({
  children,
  className = '',
  padded = true,
  interactive = false,
}: {
  children: ReactNode
  className?: string
  /** false olduqda daxili boşluq verilmir (şəkil/siyahı kartları üçün) */
  padded?: boolean
  /** Klik oluna bilən kartlar üçün hover effekti */
  interactive?: boolean
}) {
  return (
    <div
      className={cx(
        'rounded-xl border border-rail bg-card shadow-sm',
        padded && 'p-5',
        interactive &&
          'transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-rail-strong hover:shadow-md',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** İncə mis xətt — başlıqların altında istifadə olunur */
export function BrassRule({ className = '' }: { className?: string }) {
  return <div className={cx('rule-brass h-px w-full', className)} aria-hidden />
}

/* ═══════════════════════════════════════════════════════════════
   Form elementləri
   ═══════════════════════════════════════════════════════════════ */

type FieldContext = { id: string; describedBy?: string; invalid: boolean }
const FieldCtx = createContext<FieldContext | null>(null)

const controlBase =
  'w-full rounded-lg border bg-cream text-sm text-ink-900 outline-none ' +
  'shadow-[inset_0_1px_1px_rgba(52,40,22,0.04)] ' +
  'transition-[border-color,box-shadow] duration-150 ' +
  'disabled:cursor-not-allowed disabled:opacity-60'

const controlTone = (invalid: boolean) =>
  invalid
    ? 'border-clay-500 focus:border-clay-600 focus:ring-4 focus:ring-clay-500/15'
    : 'border-rail-strong hover:border-wood-300 focus:border-felt-600 focus:ring-4 focus:ring-felt-600/12'

/** Field içindəki idarəçilər üçün id/aria dəyərlərini götürür */
function useControlProps(invalidProp?: boolean) {
  const field = useContext(FieldCtx)
  const invalid = invalidProp ?? field?.invalid ?? false
  return {
    invalid,
    id: field?.id,
    'aria-describedby': field?.describedBy,
    'aria-invalid': invalid || undefined,
  }
}

export function Input({
  className = '',
  invalid,
  icon,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; icon?: ReactNode }) {
  const c = useControlProps(invalid)
  const input = (
    <input
      id={c.id}
      aria-describedby={c['aria-describedby']}
      aria-invalid={c['aria-invalid']}
      className={cx(
        controlBase,
        controlTone(c.invalid),
        'h-10 px-3',
        icon && 'pl-9.5',
        className,
      )}
      {...props}
    />
  )
  if (!icon) return input
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
        {icon}
      </span>
      {input}
    </div>
  )
}

/** Şifrə sahəsi — göstər/gizlət düyməsi ilə */
export function PasswordInput({
  className = '',
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { invalid?: boolean }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} className={cx('pr-11', className)} {...props} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Şifrəni gizlət' : 'Şifrəni göstər'}
        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md p-2 text-ink-400 transition-colors hover:bg-wood-100 hover:text-ink-700"
      >
        {show ? <IconEyeOff size={16} /> : <IconEye size={16} />}
      </button>
    </div>
  )
}

export function Textarea({
  className = '',
  invalid,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  const c = useControlProps(invalid)
  return (
    <textarea
      id={c.id}
      aria-describedby={c['aria-describedby']}
      aria-invalid={c['aria-invalid']}
      className={cx(controlBase, controlTone(c.invalid), 'resize-y px-3 py-2.5 leading-relaxed', className)}
      {...props}
    />
  )
}

export function Select({
  className = '',
  invalid,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  const c = useControlProps(invalid)
  return (
    <div className="relative">
      <select
        id={c.id}
        aria-describedby={c['aria-describedby']}
        aria-invalid={c['aria-invalid']}
        className={cx(
          controlBase,
          controlTone(c.invalid),
          'h-10 appearance-none pl-3 pr-9',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <IconChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-400"
      />
    </div>
  )
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500"
    >
      {children}
    </label>
  )
}

export function Field({
  label,
  hint,
  error,
  optional,
  children,
  className = '',
}: {
  label: string
  hint?: string
  error?: string
  optional?: boolean
  children: ReactNode
  className?: string
}) {
  const id = useId()
  const msgId = `${id}-msg`
  const hasMsg = Boolean(error || hint)

  return (
    <FieldCtx.Provider value={{ id, describedBy: hasMsg ? msgId : undefined, invalid: !!error }}>
      <div className={className}>
        <Label htmlFor={id}>
          {label}
          {optional && <span className="ml-1.5 font-normal normal-case tracking-normal text-ink-400">istəyə bağlı</span>}
        </Label>
        {children}
        {hasMsg && (
          <p id={msgId} className={cx('mt-1.5 text-xs', error ? 'text-clay-700' : 'text-ink-400')}>
            {error || hint}
          </p>
        )}
      </div>
    </FieldCtx.Provider>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Geri bildiriş
   ═══════════════════════════════════════════════════════════════ */

type AlertTone = 'error' | 'success' | 'info'

const alertTone: Record<AlertTone, { box: string; icon: ReactNode }> = {
  error: { box: 'border-clay-200 bg-clay-50 text-clay-800', icon: <IconAlert size={16} /> },
  success: { box: 'border-felt-200 bg-felt-50 text-felt-800', icon: <IconCheck size={16} /> },
  info: { box: 'border-steel-200 bg-steel-50 text-steel-800', icon: <IconInfo size={16} /> },
}

export function Alert({
  tone = 'info',
  children,
  className = '',
}: {
  tone?: AlertTone
  children: ReactNode
  className?: string
}) {
  if (!children) return null
  const t = alertTone[tone]
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cx(
        'flex items-start gap-2.5 rounded-lg border px-3.5 py-3 text-sm animate-fade-in',
        t.box,
        className,
      )}
    >
      <span className="mt-0.5 shrink-0">{t.icon}</span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}

/** Formaların altındakı xəta mətni */
export function ErrorText({ children }: { children: ReactNode }) {
  if (!children) return null
  return <Alert tone="error">{children}</Alert>
}

/* ═══════════════════════════════════════════════════════════════
   Nişanlar
   ═══════════════════════════════════════════════════════════════ */

export type BadgeTone = 'neutral' | 'green' | 'red' | 'yellow' | 'blue' | 'brass'

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'border-rail-strong bg-wood-50 text-ink-600',
  green: 'border-felt-200 bg-felt-50 text-felt-800',
  red: 'border-clay-200 bg-clay-50 text-clay-800',
  yellow: 'border-honey-200 bg-honey-50 text-honey-800',
  blue: 'border-steel-200 bg-steel-50 text-steel-800',
  brass: 'border-wood-300 bg-wood-50 text-wood-700',
}

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className = '',
}: {
  tone?: BadgeTone
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold',
        badgeTones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/** Naviqasiyada və tablarda sayğac üçün dairəvi nişan */
export function Count({ value, className = '' }: { value: number; className?: string }) {
  if (!value) return null
  return (
    <span
      className={cx(
        'inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1',
        'text-[11px] font-bold tabular-nums leading-none',
        className,
      )}
    >
      {value > 99 ? '99+' : value}
    </span>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Yüklənmə
   ═══════════════════════════════════════════════════════════════ */

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Yüklənir"
      className={cx(
        'inline-block h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-felt-200 border-t-felt-700',
        className,
      )}
    />
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div aria-hidden className={cx('skeleton rounded-md', className)} />
}

/** Siyahı səhifələri üçün ümumi skelet */
export function ListSkeleton({ rows = 5, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={cx('space-y-2.5', className)}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-rail bg-card p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-2/5" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-14" />
        </div>
      ))}
    </div>
  )
}

/** Sessiya yoxlanarkən göstərilən tam ekran yükləyici */
export function BootLoader() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4" role="status">
      <IconEightBall size={44} className="animate-pulse text-ink-950" />
      <span className="sr-only">Yüklənir</span>
      <Skeleton className="h-1 w-24 rounded-full" />
    </div>
  )
}

export function PageLoader({ label = 'Yüklənir' }: { label?: string }) {
  return (
    <div className="space-y-6" role="status" aria-label={label}>
      <div className="space-y-2.5">
        <Skeleton className="h-7 w-52" />
        <Skeleton className="h-4 w-72" />
      </div>
      <ListSkeleton rows={5} />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Səhifə strukturu
   ═══════════════════════════════════════════════════════════════ */

export function PageHeader({
  title,
  subtitle,
  actions,
  eyebrow,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  eyebrow?: ReactNode
}) {
  return (
    <header className="mb-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-wood-600">
              {eyebrow}
            </div>
          )}
          <h1 className="font-display text-[26px] leading-tight font-semibold text-ink-950 sm:text-[30px]">
            {title}
          </h1>
          {subtitle && <p className="mt-1 text-sm text-ink-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </div>
      <BrassRule className="mt-4" />
    </header>
  )
}

export function SectionHeader({
  title,
  count,
  action,
  className = '',
}: {
  title: ReactNode
  count?: number
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cx('mb-3 flex items-center justify-between gap-3', className)}>
      <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink-900">
        {title}
        {count != null && count > 0 && (
          <span className="rounded-full bg-wood-100 px-2 py-0.5 text-xs font-semibold tabular-nums text-wood-700">
            {count}
          </span>
        )}
      </h2>
      {action}
    </div>
  )
}

export function Empty({
  title,
  hint,
  icon,
  action,
}: {
  title: string
  hint?: string
  icon?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="rounded-xl border border-dashed border-rail-strong bg-card/50 px-6 py-14 text-center">
      {icon && (
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-wood-100 text-wood-600">
          {icon}
        </div>
      )}
      <p className="font-medium text-ink-800">{title}</p>
      {hint && <p className="mx-auto mt-1 max-w-sm text-sm text-ink-500">{hint}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Statistika və seqment idarəçisi
   ═══════════════════════════════════════════════════════════════ */

export function Stat({
  value,
  label,
  tone = 'default',
  className = '',
}: {
  value: ReactNode
  label: string
  tone?: 'default' | 'accent' | 'win' | 'loss'
  className?: string
}) {
  const toneClass = {
    default: 'text-ink-900',
    accent: 'text-felt-700',
    win: 'text-felt-700',
    loss: 'text-clay-700',
  }[tone]

  return (
    <div className={cx('text-center', className)}>
      <div className={cx('font-display text-2xl font-semibold tabular-nums', toneClass)}>{value}</div>
      <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.07em] text-ink-400">
        {label}
      </div>
    </div>
  )
}

export interface SegmentItem<T extends string> {
  value: T
  label: string
  count?: number
}

export function Segmented<T extends string>({
  items,
  value,
  onChange,
  label = 'Filtr',
  className = '',
}: {
  items: SegmentItem<T>[]
  value: T
  onChange: (v: T) => void
  /** Qrupun ekran oxuyucu üçün adı */
  label?: string
  className?: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cx(
        'inline-flex items-center gap-1 rounded-xl border border-rail bg-cream p-1 shadow-xs',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value
        return (
          <button
            key={item.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.value)}
            className={cx(
              'flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors duration-150',
              active
                ? 'bg-felt-700 text-cream shadow-xs'
                : 'text-ink-600 hover:bg-wood-100 hover:text-ink-900',
            )}
          >
            {item.label}
            {item.count != null && item.count > 0 && (
              <Count
                value={item.count}
                className={active ? 'bg-cream/25 text-cream' : 'bg-wood-200 text-wood-700'}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
