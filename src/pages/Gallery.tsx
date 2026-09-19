import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { GalleryApi } from '../api'
import { mediaUrl, extractErrorMessage } from '../api/client'
import type { GalleryAlbum, GalleryImage } from '../api/types'
import { Lightbox } from '../components/Lightbox'
import { Empty, PageHeader, Skeleton, cx } from '../components/ui'
import { IconImage, IconPin } from '../components/icons'
import { formatDate } from '../utils/format'

/**
 * Turnir albomlarına bölünmüş ictimai qalereya.
 *
 * Albom seçimi yuxarıdakı zolaqdan gedir — "Hamısı" bütün şəkilləri vahid
 * şəbəkədə göstərir. Lightbox həmişə cari görünən siyahı üzərində gəzir ki,
 * ← → düymələri gözlə görünəndən kənara çıxmasın.
 */
export function Gallery() {
  const [albums, setAlbums] = useState<GalleryAlbum[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeKey, setActiveKey] = useState<string>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    GalleryApi.albums()
      .then((data) => active && setAlbums(data))
      .catch((e) => active && setError(extractErrorMessage(e)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const activeAlbum = albums.find((a) => a.key === activeKey) ?? null

  const visibleImages: GalleryImage[] = useMemo(
    () => (activeAlbum ? activeAlbum.images : albums.flatMap((a) => a.images)),
    [activeAlbum, albums],
  )

  const totalCount = albums.reduce((sum, a) => sum + a.imageCount, 0)

  if (loading) {
    return (
      <div>
        <PageHeader title="Qalereya" subtitle="Turnirlərdən anlar" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="aspect-4/3 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Qalereya"
        eyebrow="Anlar"
        subtitle={
          totalCount > 0
            ? `${totalCount} şəkil · ${albums.length} albom`
            : 'Turnirlərdən çəkilmiş şəkillər'
        }
      />

      {error && <Empty title="Qalereya yüklənmədi" hint={error} icon={<IconImage size={20} />} />}

      {!error && totalCount === 0 && (
        <Empty
          title="Hələ şəkil yoxdur"
          hint="Turnir şəkilləri əlavə olunduqca burada görünəcək."
          icon={<IconImage size={20} />}
        />
      )}

      {!error && totalCount > 0 && (
        <>
          {albums.length > 1 && (
            <nav
              aria-label="Albomlar"
              className="no-scrollbar -mx-4 mb-5 flex gap-1.5 overflow-x-auto px-4 pb-1"
            >
              <AlbumTab
                label="Hamısı"
                count={totalCount}
                active={activeKey === 'all'}
                onClick={() => {
                  setActiveKey('all')
                  setLightboxIndex(null)
                }}
              />
              {albums.map((album) => (
                <AlbumTab
                  key={album.key}
                  label={album.name}
                  count={album.imageCount}
                  active={activeKey === album.key}
                  onClick={() => {
                    setActiveKey(album.key)
                    setLightboxIndex(null)
                  }}
                />
              ))}
            </nav>
          )}

          {activeAlbum && (
            <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
              {activeAlbum.tournamentId && (
                <Link
                  to={`/tournaments/${activeAlbum.tournamentId}`}
                  className="font-medium text-felt-300 transition-colors hover:text-felt-200"
                >
                  Turnirə bax
                </Link>
              )}
              {activeAlbum.venueName && (
                <span className="flex items-center gap-1">
                  <IconPin size={14} className="text-ink-400" />
                  {activeAlbum.venueName}
                </span>
              )}
              {activeAlbum.tournamentStartAt && (
                <span>{formatDate(activeAlbum.tournamentStartAt)}</span>
              )}
            </div>
          )}

          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {visibleImages.map((image, i) => (
              <li key={image.id}>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(i)}
                  className="group relative block aspect-4/3 w-full overflow-hidden rounded-lg border border-rail bg-felt-900 transition-colors hover:border-gold-400/50"
                >
                  <img
                    src={mediaUrl(image.url)}
                    alt={image.title ?? ''}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                  {(image.title || (!activeAlbum && image.tournamentName)) && (
                    <span
                      className="pointer-events-none absolute inset-x-0 bottom-0 truncate px-2.5 pb-2 pt-6 text-left text-[11px] font-medium text-ivory"
                      style={{
                        background:
                          'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 100%)',
                      }}
                    >
                      {image.title ?? image.tournamentName}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <Lightbox
        images={visibleImages}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </div>
  )
}

function AlbumTab({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cx(
        'flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-gold-400/50 bg-gold-400/12 text-gold-300'
          : 'border-rail text-ink-600 hover:border-rail-strong hover:text-ink-900',
      )}
    >
      <span className="max-w-[11rem] truncate">{label}</span>
      <span className="text-xs tabular-nums text-ink-400">{count}</span>
    </button>
  )
}
