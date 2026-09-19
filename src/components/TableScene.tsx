/*
 * Hero fonu — zalın səhnəsi: tavandan düşən tək spot, mahud masa,
 * kənarlarda qaranlıq. Stok foto yerinə vektor seçilib, çünki:
 *   — faylın çəkisi yoxdur, ilk boyanmanı yavaşlatmır;
 *   — brend rənglərini (Federation Green, Winner Gold) dəqiq tutur;
 *   — hər piksel sıxlığında kəskin qalır və mətnin altındakı qaranlıq
 *     zonanı təsadüfə buraxmır.
 *
 * İki qayda səhnəni "klipart" olmaqdan saxlayır:
 *   1. İşıq bir nöqtədən gəlir — mahud, ağac və toplar eyni radial
 *      qradiyentin mərkəzindən işıqlanır, kənarlara doğru sönür.
 *   2. Ön plan bulanıqdır (dayaz sahə dərinliyi), fokus piramidadadır.
 *
 * Masa qəsdən sağ-aşağı küncə sürüşdürülüb: sol tərəf boş qaranlıq
 * qalır və hero mətni orada oturur. Kadr `slice` ilə kəsilir, ona görə
 * hansı nisbətdə kəsilsə də solda qaranlıq döşəmə qalır.
 */

/** İşığın mənbəyi — bütün qradiyentlərin mərkəzi (viewBox koordinatı) */
const LIGHT = { x: 691, y: 372 }

/** Piramida: [mərkəzdən sapma, y, radius] — uzaqdakı toplar kiçilir */
const RACK: [number, number, number][] = [
  [0, 384, 10],
  [-10.4, 365, 9.4],
  [10.4, 365, 9.4],
  [-17.4, 347, 8.7],
  [0, 347, 8.7],
  [17.4, 347, 8.7],
  [-24, 330, 8],
  [-8, 330, 8],
  [8, 330, 8],
  [24, 330, 8],
]

export function TableScene({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
      focusable="false"
      className={className}
    >
      <defs>
        {/* Mahud: işıq altında yaşıl, kənarda demək olar ki, qara */}
        <radialGradient id="ts-felt" gradientUnits="userSpaceOnUse" cx={LIGHT.x} cy={LIGHT.y} r="430">
          <stop offset="0%" stopColor="#2b6a49" />
          <stop offset="34%" stopColor="#1c492f" />
          <stop offset="68%" stopColor="#0e2819" />
          <stop offset="100%" stopColor="#06120c" />
        </radialGradient>

        {/* Spotun isti nüvəsi */}
        <radialGradient id="ts-spot" gradientUnits="userSpaceOnUse" cx={LIGHT.x} cy={LIGHT.y} r="300">
          <stop offset="0%" stopColor="#d7b56d" stopOpacity="0.28" />
          <stop offset="45%" stopColor="#d7b56d" stopOpacity="0.09" />
          <stop offset="100%" stopColor="#d7b56d" stopOpacity="0" />
        </radialGradient>

        {/* Rail ağacı — yalnız spotun düşdüyü yerdə isinir */}
        <radialGradient id="ts-wood" gradientUnits="userSpaceOnUse" cx={LIGHT.x} cy={LIGHT.y} r="470">
          <stop offset="0%" stopColor="#a8531f" />
          <stop offset="35%" stopColor="#7a3a16" />
          <stop offset="72%" stopColor="#40190a" />
          <stop offset="100%" stopColor="#1b0904" />
        </radialGradient>

        {/* Rail üstü mahud */}
        <radialGradient id="ts-cushion" gradientUnits="userSpaceOnUse" cx={LIGHT.x} cy={LIGHT.y} r="430">
          <stop offset="0%" stopColor="#1e4e32" />
          <stop offset="55%" stopColor="#122c1b" />
          <stop offset="100%" stopColor="#07120b" />
        </radialGradient>

        {/* Top səthi — parıltı işığın gəldiyi tərəfdən */}
        <radialGradient id="ts-ball" cx="36%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#fffaf0" />
          <stop offset="42%" stopColor="#ddd2bd" />
          <stop offset="100%" stopColor="#4f4840" />
        </radialGradient>
        <radialGradient id="ts-ball-red" cx="36%" cy="26%" r="80%">
          <stop offset="0%" stopColor="#e86a60" />
          <stop offset="38%" stopColor="#ab1d26" />
          <stop offset="100%" stopColor="#38090d" />
        </radialGradient>

        {/* Döşəmədəki zəif isti əks */}
        <radialGradient id="ts-floor" gradientUnits="userSpaceOnUse" cx="700" cy="760" r="520">
          <stop offset="0%" stopColor="#5a2310" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#5a2310" stopOpacity="0" />
        </radialGradient>

        {/* Kadr qaranlığı — səhnəni kənarlardan yeyir */}
        <radialGradient id="ts-vignette" gradientUnits="userSpaceOnUse" cx={LIGHT.x} cy={LIGHT.y} r="620">
          <stop offset="0%" stopColor="#000000" stopOpacity="0" />
          <stop offset="38%" stopColor="#000000" stopOpacity="0.18" />
          <stop offset="64%" stopColor="#000000" stopOpacity="0.55" />
          <stop offset="86%" stopColor="#000000" stopOpacity="0.88" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.98" />
        </radialGradient>

        {/*
         * Film dənəsi. Vektor səhnəni "render" olmaqdan çıxaran ən ucuz
         * vasitə — gözə görünmür, amma səthlərin riyazi hamarlığını qırır.
         */}
        <filter id="ts-grain" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>

        {/* Dayaz sahə dərinliyi: ön plan fokusdan çıxır */}
        <filter id="ts-dof" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.6" />
        </filter>
        <filter id="ts-shadow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="3.5" />
        </filter>
        <filter id="ts-haze" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="26" />
        </filter>
      </defs>

      {/* Döşəmə */}
      <rect width="1200" height="800" fill="#070707" />
      <rect width="1200" height="800" fill="url(#ts-floor)" />

      {/* Masa: ağac skirt → rail mahudu → oyun səthi */}
      <polygon points="556,246 814,246 1310,904 160,904" fill="#150703" />
      <polygon points="558,248 812,248 1300,900 170,900" fill="url(#ts-wood)" />
      <polygon points="570,262 800,262 1258,900 212,900" fill="url(#ts-cushion)" />
      <polygon points="586,282 784,282 1220,900 250,900" fill="url(#ts-felt)" />
      <polygon points="586,282 784,282 1220,900 250,900" fill="url(#ts-spot)" />

      {/* Ciblər */}
      <g fill="#040404" opacity="0.9">
        <ellipse cx="588" cy="283" rx="15" ry="6" />
        <ellipse cx="782" cy="283" rx="15" ry="6" />
        <ellipse cx="418" cy="591" rx="26" ry="11" />
        <ellipse cx="1002" cy="591" rx="26" ry="11" />
      </g>

      {/* Railın üst kənarında nazik işıq — spotun ağaca düşən əksi */}
      <path
        d="M570,262 L800,262"
        fill="none"
        stroke="#ffcb93"
        strokeOpacity="0.3"
        strokeWidth="1.6"
      />
      <path
        d="M800,262 L1258,900"
        fill="none"
        stroke="#ffcb93"
        strokeOpacity="0.14"
        strokeWidth="1.6"
      />

      {/* Spotun havadakı konusu */}
      <ellipse
        cx={LIGHT.x}
        cy={LIGHT.y - 40}
        rx="150"
        ry="95"
        fill="#d7b56d"
        opacity="0.1"
        filter="url(#ts-haze)"
      />

      {/* Piramida — kadrın fokus müstəvisi, kəskin qalır */}
      <g>
        {RACK.map(([dx, y, r]) => (
          <ellipse
            key={`s${dx}-${y}`}
            cx={LIGHT.x + dx}
            cy={y + r * 0.8}
            rx={r * 1.2}
            ry={r * 0.38}
            fill="#010402"
            opacity="0.7"
            filter="url(#ts-shadow)"
          />
        ))}
        {RACK.map(([dx, y, r]) => (
          <g key={`b${dx}-${y}`}>
            <circle cx={LIGHT.x + dx} cy={y} r={r} fill="url(#ts-ball)" />
            <ellipse
              cx={LIGHT.x + dx - r * 0.32}
              cy={y - r * 0.4}
              rx={r * 0.24}
              ry={r * 0.16}
              fill="#ffffff"
              opacity="0.75"
            />
          </g>
        ))}
      </g>

      {/* Ön plandakı qırmızı top — fokusdan kənarda */}
      <g filter="url(#ts-dof)">
        <ellipse cx="712" cy="638" rx="29" ry="9" fill="#010402" opacity="0.75" />
        <circle cx="712" cy="620" r="20" fill="url(#ts-ball-red)" />
        <ellipse cx="705" cy="611" rx="6" ry="4" fill="#ffffff" opacity="0.45" />
      </g>

      {/* Kadr qaranlığı və dənə */}
      <rect width="1200" height="800" fill="url(#ts-vignette)" />
      <rect
        width="1200"
        height="800"
        filter="url(#ts-grain)"
        opacity="0.06"
        style={{ mixBlendMode: 'overlay' }}
      />
    </svg>
  )
}
