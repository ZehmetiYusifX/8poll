import { useEffect, useMemo, useRef, useState } from 'react'
import { AdminGalleryApi, TournamentApi } from '../api'
import { mediaUrl, extractErrorMessage } from '../api/client'
import type { GalleryImage, Tournament } from '../api/types'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { Modal } from '../components/Modal'
import { useToast } from '../components/Toast'
import {
  Alert,
  Button,
  Empty,
  ErrorText,
  Field,
  Input,
  PageHeader,
  Select,
  Skeleton,
  Textarea,
  buttonClass,
  cx,
} from '../components/ui'
import { IconEye, IconEyeOff, IconImage, IconPencil, IconTrash } from '../components/icons'

/** Turnirsiz şəkillərin toplandığı albomun Select-dəki dəyəri */
const GENERAL = ''

/**
 * Qalereyanın admin idarəetməsi: yükləmə, albom təyini, gizlətmə, üz şəkli və silmə.
 *
 * Siyahı turnir albomlarına görə qruplaşdırılır ki, admin hansı turnirin neçə
 * şəkli olduğunu bir baxışda görsün.
 */
export function AdminGallery() {
  const toast = useToast()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [editing, setEditing] = useState<GalleryImage | null>(null)
  const [deleting, setDeleting] = useState<GalleryImage | null>(null)

  useEffect(() => {
    let active = true
    Promise.all([AdminGalleryApi.list(), TournamentApi.list()])
      .then(([imgs, tours]) => {
        if (!active) return
        setImages(imgs)
        setTournaments(tours)
      })
      .catch((e) => active && setError(extractErrorMessage(e)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const replaceImage = (updated: GalleryImage) =>
    setImages((prev) => prev.map((i) => (i.id === updated.id ? updated : i)))

  // Albom → şəkillər. Turnirsizlər "Ümumi" başlığı altında sonda gəlir.
  const groups = useMemo(() => {
    const byAlbum = new Map<string, { name: string; images: GalleryImage[] }>()
    for (const image of images) {
      const key = image.tournamentId == null ? GENERAL : String(image.tournamentId)
      const name = image.tournamentName ?? 'Ümumi'
      const group = byAlbum.get(key) ?? { name, images: [] }
      group.images.push(image)
      byAlbum.set(key, group)
    }
    return [...byAlbum.entries()].sort(([a], [b]) => {
      if (a === GENERAL) return 1
      if (b === GENERAL) return -1
      return Number(b) - Number(a)
    })
  }, [images])

  const toggleVisible = async (image: GalleryImage) => {
    try {
      replaceImage(await AdminGalleryApi.update(image.id, { ...image, visible: !image.visible }))
    } catch (e) {
      toast.error(extractErrorMessage(e))
    }
  }

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await AdminGalleryApi.remove(deleting.id)
      setImages((prev) => prev.filter((i) => i.id !== deleting.id))
      toast.success('Şəkil silindi')
    } catch (e) {
      toast.error(extractErrorMessage(e))
    }
  }

  return (
    <div>
      <PageHeader
        title="Qalereya idarəetməsi"
        eyebrow="Admin"
        subtitle="Turnir şəkillərini yükləyin, albomlara ayırın və sıralayın"
      />

      <UploadPanel
        tournaments={tournaments}
        onUploaded={(image) => setImages((prev) => [image, ...prev])}
      />

      {error && <Alert tone="error" className="mt-5">{error}</Alert>}

      {loading ? (
        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-4/3 w-full rounded-lg" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="mt-7">
          <Empty
            title="Hələ şəkil yüklənməyib"
            hint="Yuxarıdakı formadan ilk şəkli əlavə edin."
            icon={<IconImage size={20} />}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {groups.map(([key, group]) => (
            <section key={key || 'general'}>
              <div className="mb-3 flex items-baseline gap-2 border-b border-rail pb-2">
                <h2 className="font-display text-base font-semibold text-ink-900">{group.name}</h2>
                <span className="text-xs tabular-nums text-ink-400">
                  {group.images.length} şəkil
                </span>
              </div>

              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {group.images.map((image) => (
                  <li
                    key={image.id}
                    className={cx(
                      'overflow-hidden rounded-lg border border-rail bg-card',
                      !image.visible && 'opacity-55',
                    )}
                  >
                    <div className="relative aspect-4/3 bg-felt-900">
                      <img
                        src={mediaUrl(image.url)}
                        alt={image.title ?? ''}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                      {image.cover && (
                        <span className="absolute left-1.5 top-1.5 rounded bg-gold-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-felt-950">
                          Üz
                        </span>
                      )}
                      {!image.visible && (
                        <span className="absolute right-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-ivory">
                          Gizli
                        </span>
                      )}
                    </div>

                    <div className="px-2.5 py-2">
                      <p className="truncate text-xs font-medium text-ink-800">
                        {image.title || <span className="text-ink-400">Başlıqsız</span>}
                      </p>

                      <div className="mt-1.5 flex items-center gap-0.5">
                        <IconAction
                          label={image.visible ? 'Gizlət' : 'Göstər'}
                          onClick={() => toggleVisible(image)}
                        >
                          {image.visible ? <IconEye size={15} /> : <IconEyeOff size={15} />}
                        </IconAction>
                        <IconAction label="Redaktə et" onClick={() => setEditing(image)}>
                          <IconPencil size={15} />
                        </IconAction>
                        <IconAction label="Sil" danger onClick={() => setDeleting(image)}>
                          <IconTrash size={15} />
                        </IconAction>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <EditImageModal
        image={editing}
        tournaments={tournaments}
        onClose={() => setEditing(null)}
        onSaved={(updated) => {
          // Üz şəkli dəyişəndə albomdakı digər şəkil "üz" statusunu itirir —
          // server tərəfli qaydadır, ona görə bütün siyahını yeniləyirik.
          if (updated.cover) AdminGalleryApi.list().then(setImages).catch(() => replaceImage(updated))
          else replaceImage(updated)
          setEditing(null)
        }}
      />

      <ConfirmDialog
        open={deleting !== null}
        title="Şəkil silinsin?"
        description="Şəkil qalereyadan və fayl saxlamadan birdəfəlik silinəcək."
        confirmLabel="Sil"
        tone="danger"
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </div>
  )
}

/* ── Yükləmə ────────────────────────────────────────────────────────── */

function UploadPanel({
  tournaments,
  onUploaded,
}: {
  tournaments: Tournament[]
  onUploaded: (image: GalleryImage) => void
}) {
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [tournamentId, setTournamentId] = useState<string>(GENERAL)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  /* Bir neçə şəkil birdən seçilə bilər — turnirdən sonra onlarla şəkil
     gələ bilər, tək-tək yükləmək əziyyətlidir. */
  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    const list = [...files]
    setBusy(true)
    setProgress({ done: 0, total: list.length })

    let failed = 0
    for (const [i, file] of list.entries()) {
      try {
        const image = await AdminGalleryApi.upload(file, {
          tournamentId: tournamentId === GENERAL ? null : Number(tournamentId),
        })
        onUploaded(image)
      } catch (e) {
        failed += 1
        toast.error(`${file.name}: ${extractErrorMessage(e)}`)
      }
      setProgress({ done: i + 1, total: list.length })
    }

    const ok = list.length - failed
    if (ok > 0) toast.success(`${ok} şəkil yükləndi`)
    setBusy(false)
    setProgress(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <div className="rounded-xl border border-rail bg-cream p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Field label="Albom" hint="Şəkillər hansı turnirə aid olacaq">
          <Select value={tournamentId} onChange={(e) => setTournamentId(e.target.value)}>
            <option value={GENERAL}>Ümumi (turnirsiz)</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </Select>
        </Field>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
        <Button onClick={() => fileRef.current?.click()} loading={busy} className="sm:mb-px">
          {progress ? `Yüklənir ${progress.done}/${progress.total}` : 'Şəkil seç'}
        </Button>
      </div>

      <p className="mt-2.5 text-xs text-ink-400">
        JPG, PNG, WEBP və ya GIF · maksimum 8 MB · bir neçəsini birdən seçə bilərsiniz
      </p>
    </div>
  )
}

/* ── Redaktə ────────────────────────────────────────────────────────── */

function EditImageModal({
  image,
  tournaments,
  onClose,
  onSaved,
}: {
  image: GalleryImage | null
  tournaments: Tournament[]
  onClose: () => void
  onSaved: (image: GalleryImage) => void
}) {
  const [title, setTitle] = useState('')
  const [caption, setCaption] = useState('')
  const [tournamentId, setTournamentId] = useState<string>(GENERAL)
  const [cover, setCover] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!image) return
    setTitle(image.title ?? '')
    setCaption(image.caption ?? '')
    setTournamentId(image.tournamentId == null ? GENERAL : String(image.tournamentId))
    setCover(image.cover)
    setError('')
  }, [image])

  const save = async () => {
    if (!image) return
    setLoading(true)
    setError('')
    try {
      onSaved(
        await AdminGalleryApi.update(image.id, {
          title: title.trim(),
          caption: caption.trim(),
          tournamentId: tournamentId === GENERAL ? null : Number(tournamentId),
          visible: image.visible,
          cover,
        }),
      )
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={image !== null} onClose={onClose} title="Şəkli redaktə et">
      {image && (
        <div className="space-y-4">
          <div className="aspect-video overflow-hidden rounded-lg border border-rail bg-felt-900">
            <img
              src={mediaUrl(image.url)}
              alt={image.title ?? ''}
              className="h-full w-full object-contain"
            />
          </div>

          <Field label="Başlıq" optional>
            <Input
              value={title}
              maxLength={160}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Final matçı"
            />
          </Field>

          <Field label="Təsvir" optional>
            <Textarea
              rows={2}
              maxLength={600}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Qısa izah..."
            />
          </Field>

          <Field label="Albom">
            <Select value={tournamentId} onChange={(e) => setTournamentId(e.target.value)}>
              <option value={GENERAL}>Ümumi (turnirsiz)</option>
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </Field>

          <label className="flex items-center gap-2.5 text-sm text-ink-700">
            <input
              type="checkbox"
              checked={cover}
              onChange={(e) => setCover(e.target.checked)}
              className="h-4 w-4 accent-felt-500"
            />
            Albomun üz şəkli olsun
          </label>

          <ErrorText>{error}</ErrorText>

          <div className="flex gap-2 pt-1">
            <Button variant="secondary" block onClick={onClose} disabled={loading}>
              Ləğv et
            </Button>
            <Button block onClick={save} loading={loading}>
              Yadda saxla
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

function IconAction({
  label,
  danger,
  onClick,
  children,
}: {
  label: string
  danger?: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={cx(
        buttonClass('ghost', 'icon'),
        'h-7 w-7',
        danger ? 'text-ink-400 hover:bg-clay-500/12 hover:text-clay-300' : 'text-ink-500',
      )}
    >
      {children}
    </button>
  )
}
