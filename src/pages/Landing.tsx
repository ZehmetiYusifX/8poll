import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LeaderboardApi, MatchApi, PlayerApi, TournamentApi, VenueApi } from '../api'
import { Avatar } from '../components/Avatar'
import { HeroVideo } from '../components/HeroVideo'
import { TournamentCard } from '../components/TournamentCard'
import { SLOGAN } from '../components/Brand'
import { Skeleton, buttonClass, cx } from '../components/ui'
import { IconArrowRight } from '../components/icons'
import { timeAgo } from '../utils/format'
import type { LeaderboardEntry, Match, Tournament, TournamentStatus } from '../api/types'

/*
 * Təqdimat səhifəsi. Qonaq da, üzv də eyni səhifəni görür — fərq yalnız
 * çağırış düymələrindədir. Bütün məlumat backend-in qonağa açıq
 * uclarından gəlir, ona görə heç bir bölmə giriş tələb etmir.
 *
 * Dizayn qaydası: az element, çox boşluq. Dərinlik kart-üstə-kart
 * yığmaqla deyil, saç teli qalınlığındakı xətlər və tipoqrafiya ilə
 * verilir. Qradiyent ləkələri və ikon xanaları qəsdən işlədilmir.
 */

/**
 * Hero fonu. `public/` qovluğuna foto atıb bura yolunu yazsanız
 * (məsələn `/hero.jpg`), filmin yerinə həmin sabit kadr işlədilir.
 */
const HERO_PHOTO: string | null = null

const nf = new Intl.NumberFormat('az-AZ')

/** Qeydiyyatı açıq turnirlər önə, ləğv olunanlar sona */
const STATUS_WEIGHT: Record<TournamentStatus, number> = {
  REGISTRATION: 0,
  ONGOING: 1,
  COMPLETED: 2,
  CANCELLED: 3,
}

interface Stats {
  players: number
  matches: number
  venues: number
}

export function Landing() {
  const { user } = useAuth()

  const [board, setBoard] = useState<LeaderboardEntry[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [recent, setRecent] = useState<Match[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    // Hər sorğu ayrıca qorunur: biri düşsə də səhifənin qalanı dolu qalsın
    Promise.all([
      LeaderboardApi.get({ limit: 10 }).catch(() => [] as LeaderboardEntry[]),
      TournamentApi.list().catch(() => [] as Tournament[]),
      MatchApi.recent(5).catch(() => [] as Match[]),
      PlayerApi.list().catch(() => []),
      VenueApi.list().catch(() => []),
    ]).then(([b, t, m, players, venues]) => {
      if (!active) return
      setBoard(b)
      setTournaments(t)
      setRecent(m)
      setStats({
        players: players.length,
        // Bir maç iki oyunçunun hesabına yazılır — ona görə yarıya bölürük
        matches: Math.round(players.reduce((sum, p) => sum + p.gamesPlayed, 0) / 2),
        venues: venues.length,
      })
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [])

  const featured = useMemo(
    () => [...tournaments].sort((a, b) => STATUS_WEIGHT[a.status] - STATUS_WEIGHT[b.status]).slice(0, 3),
    [tournaments],
  )

  return (
    <div>
      <Hero user={user} leader={board[0]} stats={stats} />

      <div className="space-y-16 pt-14 sm:space-y-24 sm:pt-20">
        {/* ── Turnirlər ───────────────────────────────────────── */}
        <section aria-labelledby="turnirler">
          <SectionHead
            id="turnirler"
            label="Turnirlər"
            title="Klublarda keçirilən turnirlər"
            note="Cədvələ baxmaq üçün hesab lazım deyil — yalnız qoşulmaq üçün."
            action={<QuietLink to="/tournaments">Bütün turnirlər</QuietLink>}
          />

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-44 rounded-xl" />
              ))}
            </div>
          ) : featured.length === 0 ? (
            <Quiet>Klublar yeni turnir elan edən kimi burada görünəcək.</Quiet>
          ) : (
            /* Bir-iki turnir olanda üç sütunluq şəbəkə yarımçıq görünür */
            <div
              className={cx(
                'grid gap-4',
                featured.length >= 3
                  ? 'sm:grid-cols-2 lg:grid-cols-3'
                  : featured.length === 2
                    ? 'sm:grid-cols-2'
                    : 'sm:max-w-md',
              )}
            >
              {featured.map((t) => (
                <TournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          )}
        </section>

        {/* ── Ümumi reytinq ───────────────────────────────────── */}
        <section aria-labelledby="reytinq">
          <SectionHead
            id="reytinq"
            label="Ümumi reytinq"
            title="Cədvəlin zirvəsi"
            note="Yalnız hər iki tərəfin təsdiqlədiyi maçlar Elo hesabına düşür."
            action={<QuietLink to="/leaderboard">Tam cədvəl</QuietLink>}
          />

          {loading ? (
            <Skeleton className="h-[440px] rounded-xl" />
          ) : board.length === 0 ? (
            <Quiet>İlk təsdiqlənmiş maçdan sonra sıralama formalaşacaq.</Quiet>
          ) : (
            <LeaderTable board={board} meId={user?.id} />
          )}
        </section>

        {/* ── Son maçlar ──────────────────────────────────────── */}
        {(loading || recent.length > 0) && (
          <section aria-labelledby="son-maclar">
            <SectionHead
              id="son-maclar"
              label="Canlı lent"
              title="Son təsdiqlənmiş maçlar"
              note="Nəticə hər iki tərəf təsdiqləyən kimi buraya düşür."
            />

            {loading ? (
              <Skeleton className="h-64 rounded-xl" />
            ) : (
              <ul className="divide-y divide-rail border-y border-rail">
                {recent.map((m) => (
                  <RecentMatch key={m.id} match={m} />
                ))}
              </ul>
            )}
          </section>
        )}

        <HowItWorks />

        <ClosingCta user={user} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Hero
   ═══════════════════════════════════════════════════════════════ */

function Hero({
  user,
  leader,
  stats,
}: {
  user: { fullName: string } | null
  leader?: LeaderboardEntry
  stats: Stats | null
}) {
  return (
    /*
     * Kinematik kadr: film arxada, mətn aşağı-solda, qaranlıq isə
     * mətnin altına doğru qatılaşır.
     *
     * Kadr ekranın kənarlarına dayanır (`full-bleed`), mətn isə içəridə
     * səhifənin şəbəkəsində qalır — beləcə başlıq aşağıdakı bölmə
     * başlıqları ilə eyni şaquli xətdən başlayır. Kinoda da belədir:
     * kadr tam enlidir, yazı isə təhlükəsiz sahədə.
     */
    <section className="full-bleed relative -mt-7 overflow-hidden border-b border-rail bg-[#060606]">
      <div aria-hidden className="absolute inset-0">
        {HERO_PHOTO ? (
          <img src={HERO_PHOTO} alt="" className="h-full w-full object-cover" />
        ) : (
          <HeroVideo className="absolute inset-y-0 left-1/2 w-screen max-w-none -translate-x-1/2 overflow-hidden" />
        )}
      </div>

      {/*
       * Kadrın işlənməsi dörd qatdır və sırası vacibdir: əvvəl obyektiv
       * qaranlığı, sonra mətnin altındakı pərdələr, ən üstdə isə dənə.
       * Mətnin oxunaqlığı təsadüfə buraxılmır.
       */}
      <div aria-hidden className="lens-vignette absolute inset-0" />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.76) 32%, rgba(5,5,5,0.12) 64%, rgba(5,5,5,0.5) 100%)',
        }}
      />
      {/*
       * Sol pərdə. Kadr tam enli olandan sonra mətn sütunu ekranın daha
       * kiçik hissəsini tutur, ona görə pərdə əvvəlkindən tez sönür —
       * yoxsa mətn onun açıq hissəsinə düşürdü.
       *
       * Ən sol kənar qəsdən pərdənin ən qatı yeri deyil: orada tünd
       * ləkə səhifə fonu ilə eyniləşir və kadr ekrana çatmamış kimi
       * görünür. Zirvə mətnin başladığı yerdədir (~13%), kənar isə
       * mahudun yaşılını buraxacaq qədər açıq qalır.
       */}
      <div
        aria-hidden
        className="absolute inset-0 hidden sm:block"
        style={{
          background:
            'linear-gradient(to right, rgba(5,5,5,0.40) 0%, rgba(5,5,5,0.72) 13%, rgba(5,5,5,0.64) 34%, rgba(5,5,5,0.26) 56%, transparent 76%)',
        }}
      />
      {/*
       * Geniş ekranda mətni soldakı pərdə qoruyur, dar ekranda isə sol
       * boşluq yoxdur — kadr düz mətnin altına düşür. Ona görə burada
       * pərdə aşağıdan daha yuxarı qalxır və daha qatıdır.
       */}
      <div
        aria-hidden
        className="absolute inset-0 sm:hidden"
        style={{
          background:
            'linear-gradient(to top, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0.8) 44%, rgba(5,5,5,0.44) 72%, rgba(5,5,5,0.12) 100%)',
        }}
      />
      <div aria-hidden className="film-grain absolute inset-0 opacity-[0.045] mix-blend-overlay" />

      <div className="relative mx-auto flex min-h-[560px] w-full max-w-6xl flex-col justify-end px-4 pb-11 pt-32 sm:min-h-[620px] sm:pb-14 lg:min-h-[max(680px,74dvh)] lg:pb-16">
        {/*
         * Mətn pərdə qalxan kimi sətir-sətir açılır. Gecikmələr kiçikdir
         * (90 ms addım) — cəmi yarım saniyə, amma kadra ritm verir.
         */}
        <p
          className="flex items-center gap-3.5 text-[10px] font-medium uppercase tracking-[0.2em] text-gold-300/85 animate-lift sm:tracking-[0.3em]"
          style={{ animationDelay: '60ms' }}
        >
          <span aria-hidden className="rule-gold h-px w-9" />
          {SLOGAN}
        </p>

        <h1
          className="mt-7 font-display text-[40px] font-semibold leading-[1.02] tracking-[-0.038em] text-ink-950 animate-lift sm:text-[56px] lg:text-[70px]"
          style={{ animationDelay: '150ms', textShadow: '0 2px 30px rgba(0,0,0,0.55)' }}
        >
          Masada qalib gəlin.
          <br />
          <span className="text-gold-300">Cədvəldə qalın.</span>
        </h1>

        <p
          className="mt-7 max-w-md text-[15px] leading-relaxed text-ink-700 animate-lift sm:text-base"
          style={{ animationDelay: '240ms' }}
        >
          Bilyard klublarının ortaq reytinq və turnir cədvəli. Rəqib çağırın, klubda oynayın,
          nəticəni təsdiqləyin — Elo qalanını özü hesablayır.
        </p>

        <div
          className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-4 animate-lift"
          style={{ animationDelay: '330ms' }}
        >
          {user ? (
            <>
              <Link to="/dashboard" className={buttonClass('gold', 'lg', 'px-7')}>
                Panelə keç
              </Link>
              <TextLink to="/tournaments">Turnirlərə bax</TextLink>
            </>
          ) : (
            <>
              <Link to="/register" className={buttonClass('gold', 'lg', 'px-7')}>
                Pulsuz qeydiyyat
              </Link>
              <TextLink to="/leaderboard">Əvvəlcə reytinqə baxın</TextLink>
            </>
          )}
        </div>
      </div>

      <HeroFacts leader={leader} stats={stats} />
    </section>
  )
}

/**
 * Hero-nun alt kənarındakı nazik zolaq — platformanın canlı olduğunun
 * sübutu. Kart deyil, ona görə hero-nun kompozisiyasını pozmur.
 */
function HeroFacts({ leader, stats }: { leader?: LeaderboardEntry; stats: Stats | null }) {
  const facts: { label: string; value: ReactNode }[] = [
    {
      label: 'Cədvəlin lideri',
      value: leader ? (
        <Link
          to={`/players/${leader.player.id}`}
          className="group inline-flex max-w-full items-baseline gap-2 transition-colors hover:text-gold-300"
        >
          <span className="truncate">{leader.player.fullName}</span>
          {/* Dar ekranda ad özü çətin sığır — xal yalnız geniş ekranda */}
          <span className="hidden shrink-0 text-xs tabular-nums text-gold-400 sm:inline">
            {leader.player.rating}
          </span>
        </Link>
      ) : null,
    },
    { label: 'Oyunçu', value: stats && nf.format(stats.players) },
    { label: 'Təsdiqlənmiş maç', value: stats && nf.format(stats.matches) },
    { label: 'Klub', value: stats && nf.format(stats.venues) },
  ]

  return (
    /*
     * Şüşə səth: arxadakı kadr tam kəsilmir, bulanaraq keçir. Düz qara
     * zolaqdan fərqli olaraq bu, zolağı hero-nun içində saxlayır —
     * səhifəyə yapışdırılmış ayrı bir element kimi görünmür.
     *
     * Zolaq özü ekran boyu uzanır, içindəki xanalar isə hero mətni ilə
     * eyni şəbəkədədir. Ona görə sətirin ilk xanasında sol boşluq sıfırlanır.
     */
    <div className="relative border-t border-white/10 bg-black/35 backdrop-blur-xl">
      <span aria-hidden className="rule-gold absolute inset-x-0 top-0 h-px opacity-60" />

      <dl className="mx-auto grid max-w-6xl grid-cols-2 px-4 sm:grid-cols-4">
        {facts.map((f, i) => (
          <div
            key={f.label}
            className={cx(
              'min-w-0 py-4 pr-5 sm:pr-6',
              // Mobil şəbəkə iki sütunludur, geniş ekranda dörd
              i === 0 ? 'pl-0' : i === 2 ? 'pl-0 sm:pl-6' : 'pl-5 sm:pl-6',
              i % 2 === 1 && 'border-l border-white/10',
              i >= 2 && 'border-t border-white/10 sm:border-t-0',
              i > 0 && 'sm:border-l sm:border-white/10',
            )}
          >
            <dt className="text-[10px] font-medium uppercase tracking-[0.22em] text-ink-500">
              {f.label}
            </dt>
            <dd className="mt-2 truncate font-display text-[15px] font-medium text-ink-900">
              {f.value ?? <Skeleton className="h-4 w-16" />}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Reytinq cədvəli
   ═══════════════════════════════════════════════════════════════ */

function LeaderTable({ board, meId }: { board: LeaderboardEntry[]; meId?: number }) {
  return (
    <div className="border-y border-rail">
      <div className="flex items-center gap-4 border-b border-rail px-2 pb-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-ink-400">
        <span className="w-6 text-center">#</span>
        <span className="flex-1">Oyunçu</span>
        <span className="hidden w-24 whitespace-nowrap text-center sm:block" title="Qalib / Məğlub">
          Q / M
        </span>
        <span className="w-16 text-right sm:w-20">Xal</span>
      </div>

      <ul className="divide-y divide-rail">
        {board.map(({ rank, player }) => {
          const isMe = player.id === meId
          return (
            <li key={player.id} className="relative">
              {isMe && (
                <span aria-hidden className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-gold-400" />
              )}
              <Link
                to={`/players/${player.id}`}
                className="flex items-center gap-4 px-2 py-3.5 transition-colors hover:bg-white/[0.025]"
              >
                <span
                  className={cx(
                    'w-6 shrink-0 text-center font-display text-[15px] font-semibold tabular-nums',
                    rank === 1 ? 'text-gold-400' : rank <= 3 ? 'text-ink-700' : 'text-ink-400',
                  )}
                >
                  {rank}
                </span>

                <Avatar
                  name={player.fullName}
                  color={player.avatarColor}
                  src={player.avatarUrl}
                  size={34}
                  ring={rank === 1 ? 'gold' : 'none'}
                />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink-950">
                    {player.fullName}
                    {isMe && <span className="ml-2 text-xs font-normal text-gold-400"> — siz</span>}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-ink-400">
                    @{player.username}
                    <span className="tabular-nums sm:hidden">
                      {' · '}
                      {player.wins}–{player.losses}
                    </span>
                  </span>
                </span>

                <span className="hidden w-24 text-center text-[13px] tabular-nums text-ink-600 sm:block">
                  {player.wins}<span className="mx-1 text-ink-300">/</span>{player.losses}
                </span>

                <span className="w-16 text-right font-display text-[17px] font-semibold tabular-nums text-ink-950 sm:w-20">
                  {player.rating}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Son maçlar
   ═══════════════════════════════════════════════════════════════ */

/**
 * Lentdəki maç heç kimin baxış bucağından göstərilmir — qalib solda,
 * məğlub sağda. Ona görə perspektivə bağlı `MatchRow` işlədilmir.
 */
function RecentMatch({ match: m }: { match: Match }) {
  const reporterWon = m.winnerId === m.reporter.id
  const winner = reporterWon ? m.reporter : m.opponent
  const loser = reporterWon ? m.opponent : m.reporter
  const winScore = reporterWon ? m.reporterScore : m.opponentScore
  const loseScore = reporterWon ? m.opponentScore : m.reporterScore

  const meta = [timeAgo(m.confirmedAt ?? m.createdAt), m.venue?.name].filter(Boolean).join(' · ')

  return (
    <li className="py-3.5">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex min-w-0 flex-1 items-center gap-2.5">
          <Avatar name={winner.fullName} color={winner.avatarColor} src={winner.avatarUrl} size={30} ring="gold" />
          <Link
            to={`/players/${winner.id}`}
            className="truncate text-sm font-medium text-ink-950 transition-colors hover:text-gold-300"
          >
            {winner.fullName}
          </Link>
        </div>

        <div className="shrink-0 font-display text-[15px] font-semibold tabular-nums">
          <span className="text-gold-400">{winScore}</span>
          <span className="mx-1.5 text-ink-300">:</span>
          <span className="text-ink-500">{loseScore}</span>
        </div>

        <div className="flex min-w-0 flex-1 flex-row-reverse items-center gap-2.5">
          <Avatar name={loser.fullName} color={loser.avatarColor} src={loser.avatarUrl} size={30} />
          <Link
            to={`/players/${loser.id}`}
            className="truncate text-sm text-ink-500 transition-colors hover:text-ink-800"
          >
            {loser.fullName}
          </Link>
        </div>

        <span className="hidden w-40 shrink-0 truncate text-right text-[11px] text-ink-400 lg:block">
          {meta}
        </span>
      </div>

      <p className="mt-2 text-center text-[11px] text-ink-400 lg:hidden">{meta}</p>
    </li>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Qayda
   ═══════════════════════════════════════════════════════════════ */

const STEPS = [
  {
    title: 'Dəvət',
    text: 'Oyunçular siyahısından rəqib seçirsiniz, məkanı göstərib dəvət göndərirsiniz.',
  },
  {
    title: 'Oyun',
    text: 'Klubda oynayırsınız. Hesabı tərəflərdən biri platformaya daxil edir.',
  },
  {
    title: 'Təsdiq',
    text: 'Rəqib nəticəni təsdiqləyir — yalnız bundan sonra Elo yenidən hesablanır.',
  },
]

function HowItWorks() {
  return (
    <section aria-labelledby="qayda">
      <SectionHead
        id="qayda"
        label="Qayda"
        title="Nəticəni tək tərəf yaza bilmir"
        note="Cədvəlin dəyəri onun dürüstlüyündədir. Ona görə hər maç iki imza tələb edir."
      />

      {/* Xətlər boşluqdan doğur: gap-px + fon rəngi */}
      <ol className="grid gap-px border-y border-rail bg-rail sm:grid-cols-3">
        {STEPS.map((step, i) => (
          <li key={step.title} className="bg-paper px-0 py-6 sm:px-6 sm:first:pl-0">
            <span className="font-display text-[11px] font-semibold tracking-[0.22em] text-gold-400/75">
              0{i + 1}
            </span>
            <h3 className="mt-3 font-display text-[17px] font-semibold text-ink-950">{step.title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-ink-500">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Yekun çağırış
   ═══════════════════════════════════════════════════════════════ */

function ClosingCta({ user }: { user: { fullName: string } | null }) {
  return (
    <section className="felt-weave relative overflow-hidden rounded-[20px] border border-rail bg-felt-950 px-6 py-11 sm:px-12 sm:py-14">
      <span aria-hidden className="rule-gold absolute inset-x-0 top-0 h-px" />

      {/*
       * Səth düz rəng ləkəsi kimi qalmasın deyə saytın qalanı ilə eyni
       * işıq məntiqi: yuxarı-soldan düşən tək spot, küncdə qaranlıq və
       * üstündə görünməyən dənə. Qradiyent bəzək deyil — işığın izidir.
       */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(85% 120% at 18% -10%, rgba(215,181,109,0.13) 0%, rgba(215,181,109,0.04) 38%, transparent 70%), radial-gradient(100% 90% at 100% 110%, rgba(0,0,0,0.5) 0%, transparent 62%)',
        }}
      />
      <div aria-hidden className="film-grain absolute inset-0 opacity-[0.04] mix-blend-overlay" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h2 className="max-w-lg font-display text-[28px] font-semibold leading-tight tracking-[-0.025em] text-ink-950 sm:text-[36px]">
            {user ? 'Növbəti maçınız sizi gözləyir' : 'Cədvəldəki yerinizi bu gün alın'}
          </h2>
          <p className="mt-3.5 max-w-md text-[15px] leading-relaxed text-felt-100/70">
            {user
              ? 'Rəqib çağırın, klubunuzun turnirinə qoşulun və reytinqinizi yüksəldin.'
              : 'Qeydiyyat bir neçə saniyə çəkir. Başlanğıc reytinqiniz 1200 xaldır — qalanını masa həll edir.'}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-x-7 gap-y-4">
          {user ? (
            <>
              <Link to="/players" className={buttonClass('gold', 'lg', 'px-6')}>
                Rəqib tap
              </Link>
              <TextLink to="/academy">Dərs paketləri</TextLink>
            </>
          ) : (
            <>
              <Link to="/register" className={buttonClass('gold', 'lg', 'px-6')}>
                Hesab yarat
              </Link>
              <TextLink to="/venues/register">Məkan sahibisiniz?</TextLink>
              <TextLink to="/coaches/register">Məşqçisiniz?</TextLink>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Ortaq kiçik hissələr
   ═══════════════════════════════════════════════════════════════ */

function SectionHead({
  id,
  label,
  title,
  note,
  action,
}: {
  id: string
  label: string
  title: string
  note?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-7 border-t border-rail pt-5">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-gold-400/70">
            {label}
          </p>
          <h2
            id={id}
            className="mt-2.5 font-display text-[26px] font-semibold leading-tight tracking-[-0.025em] text-ink-950 sm:text-[32px]"
          >
            {title}
          </h2>
          {note && <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-ink-500">{note}</p>}
        </div>
        {action}
      </div>
    </header>
  )
}

/** Düymə deyil, altdan xətli keçid — səhifədə çox düymə olmasın deyə */
function QuietLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex shrink-0 items-center gap-1.5 border-b border-rail-strong pb-1.5 text-[13px] font-medium text-ink-700 transition-colors hover:border-gold-400 hover:text-ink-950"
    >
      {children}
      <IconArrowRight
        size={14}
        className="transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Link>
  )
}

/** Tünd səth üzərində ikinci dərəcəli çağırış */
function TextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-2 text-sm font-medium text-ink-800 transition-colors hover:text-gold-300"
    >
      {children}
      <IconArrowRight
        size={15}
        className="transition-transform duration-200 group-hover:translate-x-0.5"
      />
    </Link>
  )
}

/** Boş vəziyyət — punktir çərçivə və ikon xanası olmadan */
function Quiet({ children }: { children: ReactNode }) {
  return (
    <p className="border-y border-rail py-12 text-center text-sm text-ink-400">{children}</p>
  )
}
