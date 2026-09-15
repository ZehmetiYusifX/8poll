import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'
import { IconX } from './icons'
import { cx } from './ui'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  /** Geniş formalar üçün (turnir yaratma və s.) */
  size?: 'sm' | 'md' | 'lg'
}

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

const widths = { sm: 'sm:max-w-sm', md: 'sm:max-w-md', lg: 'sm:max-w-lg' }

export function Modal({ open, onClose, title, description, children, size = 'md' }: Props) {
  const panel = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const descId = useId()

  // Escape ilə bağlama + Tab-ın modal içində dövr etməsi (focus trap)
  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panel.current) return

      const nodes = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      )
      if (nodes.length === 0) return

      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      const active = document.activeElement

      if (e.shiftKey && (active === first || !panel.current.contains(active))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && active === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKey)

    // Arxa fon sürüşməsin — scrollbar itdikdə tərpənməni də kompensasiya edirik
    const { body } = document
    const prevOverflow = body.style.overflow
    const prevPadding = body.style.paddingRight
    const gap = window.innerWidth - document.documentElement.clientWidth
    body.style.overflow = 'hidden'
    if (gap > 0) body.style.paddingRight = `${gap}px`

    // Fokusu dialoqun özünə ver — ekran oxuyucu başlığı elan etsin,
    // Tab isə oradan məzmunun içinə keçsin.
    panel.current?.focus()

    return () => {
      document.removeEventListener('keydown', onKey)
      body.style.overflow = prevOverflow
      body.style.paddingRight = prevPadding
      previouslyFocused?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panel}
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        className={cx(
          'relative flex max-h-[92dvh] w-full flex-col overflow-hidden border border-rail bg-card shadow-xl',
          'rounded-t-2xl animate-sheet-up sm:animate-pop sm:rounded-xl',
          widths[size],
        )}
      >
        {/* Mobil sürüşdürmə tutacağı */}
        <div className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-rail-strong sm:hidden" aria-hidden />

        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-4">
          <div className="min-w-0">
            <h2 id={titleId} className="font-display text-lg font-semibold text-ink-950">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-0.5 text-sm text-ink-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Bağla"
            className="-mr-1.5 -mt-0.5 rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-gold-400/12 hover:text-ink-900"
          >
            <IconX size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-1">
          {children}
        </div>
      </div>
    </div>
  )
}
