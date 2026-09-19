import { useEffect, useRef, useState } from 'react'
import { TableScene } from './TableScene'

/*
 * Hero kadrı — klubda çəkilmiş zərbə görüntüsü.
 *
 * İki qatlı işləyir: vektor səhnə (`TableScene`) dərhal boyanır və kadrı
 * tutur, film isə hazır olanda onun üstündə sakitcə açılır. Beləcə nə ilk
 * saniyədə boş qara sahə görünür, nə də video gec gələndə kompozisiya
 * sıçrayır. Video düşsə, səhnə sadəcə yerində qalır — xəta halı yoxdur.
 *
 * Rəng korreksiyası qəsdəndir və gözlə seçilib: xam kadrın mahudu
 * firuzəyiyə çalır, brendin Federation Green-i isə daha meşə yaşılıdır.
 * `hue-rotate` mahudu brend tonuna çəkir, doymanın azalması və kontrastın
 * qalxması isə kadrı interfeysin "low-key" işığı ilə eyni dilə salır.
 * Rəqəmləri dəyişsəniz, başlıq zolağındakı yaşılla yan-yana yoxlayın —
 * hero ilə başlıq arasındakı keçid ən çox onlardan asılıdır.
 */
const SRC = '/hero-break.mp4'
const GRADE = 'saturate(0.68) contrast(1.14) brightness(0.76) hue-rotate(-16deg)'

export function HeroVideo({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLVideoElement>(null)
  const [wanted, setWanted] = useState(false)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    // Hərəkəti azaltmaq istəyən və ya trafikə qənaət edən istifadəçiyə
    // 5 MB-lıq film göndərmirik — vektor səhnə onsuz da kadrı tutur.
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const saver = (navigator as { connection?: { saveData?: boolean } }).connection?.saveData
    if (!still && !saver) setWanted(true)
  }, [])

  // Sekmə arxa plana keçəndə kadrları boş yerə dekod etməyək
  useEffect(() => {
    if (!wanted) return
    const onVisibility = () => {
      const v = ref.current
      if (!v) return
      if (document.hidden) v.pause()
      else void v.play().catch(() => {})
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [wanted])

  return (
    <div className={className}>
      <TableScene className="absolute inset-0 h-full w-full" />

      {wanted && (
        <video
          ref={ref}
          src={SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden
          tabIndex={-1}
          onCanPlay={() => setShown(true)}
          /*
           * Kadrın yerləşdirilməsi iki ekranda iki cür həll olunur.
           *
           * Dar ekranda 16:9-dan yalnız dar bir sütun qalır; mərkəz kəsimi
           * masanın ən parlaq yerini mətnin altına salırdı, ona görə kadr
           * sola-yuxarı sürüşdürülür.
           *
           * Geniş ekranda isə `object-cover` demək olar ki, heç nə kəsmir
           * və xam kadrın sol ~15%-i tünd divardır. Tam enli hero-da həmin
           * zolaq səhifə fonu ilə eyniləşir, ekranın qırağı boş görünür.
           * Ona görə kadr sağa doğru böyüdülür — tünd divar kənardan
           * çıxır, mahud isə ekranın sol kənarına çatır.
           */
          className="absolute inset-0 h-full w-full object-cover object-[26%_42%] transition-opacity duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:origin-[80%_50%] sm:scale-[1.22] sm:object-center"
          style={{ opacity: shown ? 1 : 0, filter: GRADE }}
        />
      )}
    </div>
  )
}
