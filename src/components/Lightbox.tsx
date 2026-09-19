import { useCallback, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { mediaUrl } from '../api/client'
import type { GalleryImage } from '../api/types'
import { IconChevronRight, IconX } from './icons'
import { cx } from './ui'

interface Props {
  images: GalleryImage[]
  /** Açıq şəklin `images` daxilindəki indeksi; null olduqda bağlıdır */
  index: number | null
  /**
   * React state setter-i olmalıdır — sürətli ← → basışlarında addımların
   * itməməsi üçün funksional yeniləmə formasından istifadə olunur.
   */
  onIndexChange: Dispatch<SetStateAction<number | null>>
  onClose: () => void
}

/**
 * Tam ekran şəkil baxışı — klaviatura (← → Esc) və kənara klik ilə idarə olunur.
 * Şəkillər dövri gəzilir: sonuncudan sonra birinciyə qayıdır.
 */
export function Lightbox({ images, index, onIndexChange, onClose }: Props) {
  const open = index !== null && images.length > 0

  /*
   * Cari indeksi closure-dan deyil, setter-in ötürdüyü ən son dəyərdən götürürük:
   * ardıcıl iki ← basışı eyni render-in `index`-ini oxusaydı, ikinci addım itərdi.
   */
  const step = useCallback(
    (delta: number) => {
      if (images.length === 0) return
      onIndexChange((current) =>
        current === null ? current : (current + delta + images.length) % images.length,
      )
    },
    [images.length, onIndexChange],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') step(1)
      else if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    // Arxa fon sürüşməsin
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, step, onClose])

  if (!open || index === null) return null
  const image = images[index]
  if (!image) return null

  const caption = image.title || image.caption || image.tournamentName

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/92 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={caption ?? 'Şəkil'}
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 text-ivory/70">
        <span className="text-xs tabular-nums tracking-wide">
          {index + 1} / {images.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Bağla"
          className="rounded-lg p-1.5 transition-colors hover:bg-white/10 hover:text-ivory"
        >
          <IconX size={20} />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-14">
        {images.length > 1 && (
          <NavButton side="left" onClick={() => step(-1)} />
        )}

        <img
          src={mediaUrl(image.url)}
          alt={caption ?? ''}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full object-contain"
        />

        {images.length > 1 && <NavButton side="right" onClick={() => step(1)} />}
      </div>

      <div className="min-h-[3.5rem] px-4 py-3 text-center">
        {image.title && (
          <p className="text-sm font-medium text-ivory">{image.title}</p>
        )}
        {image.caption && <p className="mt-0.5 text-xs text-ivory/55">{image.caption}</p>}
      </div>
    </div>
  )
}

function NavButton({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={side === 'left' ? 'Əvvəlki' : 'Növbəti'}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cx(
        'absolute top-1/2 z-10 -translate-y-1/2 rounded-full p-2.5 text-ivory/60',
        'transition-colors hover:bg-white/10 hover:text-ivory',
        side === 'left' ? 'left-1 sm:left-3' : 'right-1 sm:right-3',
      )}
    >
      <IconChevronRight size={26} className={side === 'left' ? 'rotate-180' : ''} />
    </button>
  )
}
