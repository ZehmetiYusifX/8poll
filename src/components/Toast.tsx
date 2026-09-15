import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { IconAlert, IconCheck, IconInfo, IconX } from './icons'
import { cx } from './ui'

type ToastTone = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

interface ToastApi {
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastCtx = createContext<ToastApi | null>(null)

/*
 * Bildiriş məzmunun üstündə üzdüyü üçün fonu şəffaf ola bilməz — altındakı
 * səhifə görünərdi. Ona görə kart səthi verilir, çalar isə haşiyədədir.
 */
const toneStyle: Record<ToastTone, { box: string; iconBox: string; icon: ReactNode }> = {
  success: {
    box: 'border-felt-500/45 bg-card',
    iconBox: 'bg-felt-600 text-ivory',
    icon: <IconCheck size={14} />,
  },
  error: {
    box: 'border-clay-500/45 bg-card',
    iconBox: 'bg-clay-600 text-ivory',
    icon: <IconAlert size={14} />,
  },
  info: {
    box: 'border-steel-500/45 bg-card',
    iconBox: 'bg-steel-600 text-ivory',
    icon: <IconInfo size={14} />,
  },
}

const DURATION = 4500

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (tone: ToastTone, message: string) => {
      if (!message) return
      const id = nextId.current++
      setItems((list) => [...list.slice(-2), { id, tone, message }])
      window.setTimeout(() => dismiss(id), DURATION)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  )

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+4.75rem)] z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:right-6 sm:left-auto sm:items-end sm:px-0"
      >
        {items.map((t) => {
          const s = toneStyle[t.tone]
          return (
            <div
              key={t.id}
              role={t.tone === 'error' ? 'alert' : 'status'}
              className={cx(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-3.5 py-3 shadow-lg animate-pop',
                s.box,
              )}
            >
              <span
                className={cx(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  s.iconBox,
                )}
              >
                {s.icon}
              </span>
              <p className="min-w-0 flex-1 text-sm text-ink-800">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Bildirişi bağla"
                className="-mr-1 rounded-md p-1 text-ink-400 transition-colors hover:bg-white/8 hover:text-ink-900"
              >
                <IconX size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastCtx.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast ToastProvider daxilində istifadə edilməlidir')
  return ctx
}
