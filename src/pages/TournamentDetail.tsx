import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { Link, useParams } from 'react-router-dom'
import { GalleryApi, TournamentApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { Avatar } from '../components/Avatar'
import { Lightbox } from '../components/Lightbox'
import { Modal } from '../components/Modal'
import { statusMeta } from '../components/TournamentCard'
import {
  Alert,
  Badge,
  Button,
  Card,
  Empty,
  ErrorText,
  Field,
  Input,
  PageHeader,
  SectionHeader,
  Skeleton,
  buttonClass,
  cx,
} from '../components/ui'
import {
  IconCheck,
  IconChevronDown,
  IconClock,
  IconPin,
  IconTrophy,
  IconUsers,
} from '../components/icons'
import { useToast } from '../components/Toast'
import { extractErrorMessage, mediaUrl } from '../api/client'
import { formatDateTime } from '../utils/format'
import { CATEGORY_LABEL, DISCIPLINE_LABEL, FORMAT_LABEL } from '../constants/tournament'
import { useLanguage } from '../context/LanguageContext'
import { appCopy } from '../i18n/app'
import type {
  TournamentDetail as TDetail,
  BracketMatch,
  GalleryImage,
  GroupStanding,
  PlayerSummary,
} from '../api/types'

export function TournamentDetail() {
  const { id } = useParams()
  const tid = Number(id)
  const { user } = useAuth()
  const toast = useToast()
  const { language } = useLanguage()
  const copy = appCopy[language].tournamentDetail

  const [data, setData] = useState<TDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [reportMatch, setReportMatch] = useState<BracketMatch | null>(null)

  const load = useCallback(async () => {
    try {
      setData(await TournamentApi.get(tid))
      setError('')
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }, [tid])

  useEffect(() => {
    load()
  }, [load])

  const t = data?.tournament
  const isOwner = !!t && user?.id === t.owner.id
  const isParticipant = !!data && !!user && data.participants.some((p) => p.id === user.id)

  const act = async (fn: () => Promise<unknown>, message: string) => {
    setBusy(true)
    try {
      await fn()
      toast.success(message)
      await load()
    } catch (e) {
      toast.error(extractErrorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  // Şəbəkə növlərinə görə ayırma — hər bölmə öz raund nömrələməsi ilə qurulur
  const sections = useMemo(() => {
    const bracket = data?.bracket ?? []
    const of = (type: BracketMatch['bracketType']) => bracket.filter((m) => m.bracketType === type)
    return {
      group: of('GROUP'),
      upper: of('UPPER'),
      lower: of('LOWER'),
      grandFinal: of('GRAND_FINAL'),
      playoff: of('PLAYOFF'),
    }
  }, [data])

  /*
   * Turniri yekunlaşdıran maç — qalib kartında final hesabını göstərmək üçün.
   * Sxemdən asılı olaraq ya böyük final, ya pley-offun, ya da yuxarı şəbəkənin
   * sonuncu raundudur; ilk dolu olan bölmə götürülür.
   */
  const finalMatch = useMemo(() => {
    for (const pool of [sections.grandFinal, sections.playoff, sections.upper]) {
      if (pool.length > 0) {
        return pool.reduce((best, m) => (m.round > best.round ? m : best))
      }
    }
    return null
  }, [sections])

  if (loading) return <DetailSkeleton />
  if (!t || !data) return <Empty title={copy.notFoundTitle} hint={error || copy.notFoundHint} />

  const st = statusMeta[language][t.status]
  const canStart = data.participants.length >= 2

  return (
    <div>
      <PageHeader
        eyebrow={
          <Link to={`/venues/${t.venue.id}`} className="inline-flex items-center gap-1 hover:underline">
            <IconPin size={12} />
            {t.venue.name}
          </Link>
        }
        title={
          <span className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {t.name}
            <Badge tone={st.tone}>{st.text}</Badge>
          </span>
        }
        actions={
          <>
            {/* Qonaq turniri görə bilir, qoşulmaq üçün hesab lazımdır */}
            {t.status === 'REGISTRATION' && !user && (
              <Link
                to="/login"
                state={{ from: `/tournaments/${tid}` }}
                className={buttonClass('primary', 'md')}
              >
                <IconUsers size={16} />
                {copy.loginToJoin}
              </Link>
            )}
            {t.status === 'REGISTRATION' && !!user && !isOwner && (
              isParticipant ? (
                <Button
                  variant="secondary"
                  loading={busy}
                  onClick={() => act(() => TournamentApi.leave(tid), copy.leftTournament)}
                >
                  {copy.leave}
                </Button>
              ) : (
                <Button
                  loading={busy}
                  icon={<IconUsers size={16} />}
                  onClick={() => act(() => TournamentApi.join(tid), copy.joinedTournament)}
                >
                  {copy.join}
                </Button>
              )
            )}
            {t.status === 'REGISTRATION' && isOwner && (
              <Button
                loading={busy}
                disabled={!canStart}
                title={canStart ? undefined : copy.minParticipants}
                onClick={() => act(() => TournamentApi.start(tid), copy.tournamentStarted)}
              >
                {copy.startTournament}
              </Button>
            )}
          </>
        }
      />

      <FactStrip
        facts={[
          { label: copy.factStart, value: t.startAt ? formatDateTime(t.startAt) : '—' },
          { label: copy.factFormat, value: FORMAT_LABEL[language][t.format] },
          { label: copy.factRace, value: copy.raceTo(t.raceTo) },
          /* Alt növ yalnız qaydaları bildirir — reytinq valideyn intizam üzrə hesablanır */
          { label: copy.factDiscipline, value: DISCIPLINE_LABEL[language][t.discipline] },
          { label: copy.factLevel, value: CATEGORY_LABEL[language][t.category] },
        ]}
      />

      {t.description && (
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-ink-600">{t.description}</p>
      )}

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {t.status === 'COMPLETED' && t.winner && (
        <WinnerCard winner={t.winner} finalMatch={finalMatch} />
      )}

      {t.status === 'REGISTRATION' ? (
        <section>
          <SectionHeader title={copy.participants} count={data.participants.length} />

          <RegistrationMeter
            filled={data.participants.length}
            total={t.maxParticipants}
            deadline={t.registrationDeadline}
          />

          {data.participants.length === 0 ? (
            <Empty
              icon={<IconUsers size={20} />}
              title={copy.emptyParticipantsTitle}
              hint={copy.emptyParticipantsHint}
            />
          ) : (
            <>
              <ParticipantGrid participants={data.participants} viewerId={user?.id} />
              <p className="mt-3 text-xs text-ink-400">{copy.seedNote}</p>
            </>
          )}
        </section>
      ) : (
        (() => {
          const canReport = (m: BracketMatch) =>
            isOwner && t.status === 'ONGOING' && m.status === 'READY'
          const bracketProps = {
            viewerId: user?.id,
            canReport,
            onReport: setReportMatch,
          }
          return (
            <>
              {sections.group.length > 0 && (
                <GroupStage
                  standings={data.groupStandings}
                  matches={sections.group}
                  {...bracketProps}
                />
              )}

              {sections.upper.length > 0 && (
                <BracketGrid
                  title={sections.lower.length > 0 ? copy.upperBracket : copy.bracket}
                  matches={sections.upper}
                  /* Böyük final ayrıca olduğundan yuxarı şəbəkənin sonuncu
                     raundu "final" deyil — ona görə adlandırma söndürülür */
                  namedRounds={sections.grandFinal.length === 0}
                  {...bracketProps}
                />
              )}

              {sections.lower.length > 0 && (
                <BracketGrid
                  title={copy.lowerBracket}
                  matches={sections.lower}
                  namedRounds={false}
                  {...bracketProps}
                />
              )}

              {sections.grandFinal.length > 0 && (
                <BracketGrid
                  title={copy.grandFinal}
                  matches={sections.grandFinal}
                  namedRounds={false}
                  {...bracketProps}
                />
              )}

              {sections.playoff.length > 0 && (
                <BracketGrid title={copy.playoff} matches={sections.playoff} {...bracketProps} />
              )}

              {sections.group.length > 0 && sections.playoff.length === 0 && (
                <Alert tone="info" className="mb-6">
                  {copy.playoffPending}
                </Alert>
              )}

              {/* Turnir başlayandan sonra da heyət əlçatan qalsın */}
              <RosterDisclosure participants={data.participants} viewerId={user?.id} />
            </>
          )
        })()
      )}

      <TournamentPhotos tournamentId={tid} />

      {reportMatch && (
        <ReportBracketModal
          tid={tid}
          match={reportMatch}
          onClose={() => setReportMatch(null)}
          onDone={(updated) => {
            setData(updated)
            setReportMatch(null)
            toast.success(copy.resultRecorded)
          }}
        />
      )}
    </div>
  )
}

/* ── Başlıq altındakı məlumat zolağı ────────────────────────── */

/**
 * Turnirin əsas göstəriciləri — etiket + dəyər cütləri.
 *
 * Əvvəl bunlar başlığın altında bir sətirlik boz mətn idi: tarix, format,
 * hesab və səviyyə eyni çəkidə yan-yana düzülürdü, ona görə heç biri
 * seçilmirdi. Etiket üstdə, dəyər altda olanda göz sütun-sütun oxuyur.
 *
 * Ayırıcı xətt qəsdən yoxdur: cədvəl şəbəkəsi bu qədər az məlumat üçün
 * ağır olardı, boşluq və tipoqrafiya kifayət edir.
 */
function FactStrip({ facts }: { facts: Array<{ label: string; value: string }> }) {
  return (
    <dl className="mb-6 flex flex-wrap gap-x-10 gap-y-4 border-b border-rail pb-4">
      {facts.map((f) => (
        <div key={f.label} className="min-w-0">
          <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
            {f.label}
          </dt>
          <dd className="mt-1 truncate text-sm font-medium text-ink-900" title={f.value}>
            {f.value}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/* ── Qalib kartı ────────────────────────────────────────────── */

function WinnerCard({
  winner,
  finalMatch,
}: {
  winner: PlayerSummary
  finalMatch: BracketMatch | null
}) {
  const { language } = useLanguage()
  const copy = appCopy[language].tournamentDetail

  /* Final hesabı qalib tərəfdən oxunur: 5–4, 5–2 kimi */
  const decided = finalMatch?.winnerId != null
  const winnerIsP1 = finalMatch?.player1?.id === winner.id
  const score = decided
    ? winnerIsP1
      ? ([finalMatch.player1Score, finalMatch.player2Score] as const)
      : ([finalMatch.player2Score, finalMatch.player1Score] as const)
    : null
  const loser = decided ? (winnerIsP1 ? finalMatch.player2 : finalMatch.player1) : null

  return (
    <Card className="surface-gold mb-6 flex flex-wrap items-center gap-x-5 gap-y-4">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-400 text-felt-950">
        <IconTrophy size={24} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-300">
          {copy.tournamentWinner}
        </div>
        <Link
          to={`/players/${winner.id}`}
          className="font-display text-xl font-semibold text-ink-950 hover:text-felt-300"
        >
          {winner.fullName}
        </Link>
      </div>

      {score && score[0] != null && score[1] != null && (
        <div className="flex items-center gap-5 border-l border-gold-400/20 pl-5">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
              {copy.finalScore}
            </div>
            <div className="font-display text-lg font-semibold tabular-nums text-ink-900">
              {score[0]}<span className="px-1 text-ink-400">–</span>{score[1]}
            </div>
          </div>
          {loser && (
            <div className="min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-400">
                {copy.runnerUp}
              </div>
              <Link
                to={`/players/${loser.id}`}
                className="block truncate text-sm font-medium text-ink-700 hover:text-felt-300"
              >
                {loser.fullName}
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

/* ── Qeydiyyat göstəricisi ──────────────────────────────────── */

/**
 * Dolu yerlərin nisbəti. Boş yer sayı və son tarix ayrıca verilir —
 * "5/8" tək başına qoşulub-qoşulmamağa qərar verməyə kifayət etmir.
 */
function RegistrationMeter({
  filled,
  total,
  deadline,
}: {
  filled: number
  total: number
  deadline: string | null
}) {
  const { language } = useLanguage()
  const copy = appCopy[language].tournamentDetail
  const pct = total > 0 ? Math.min(100, Math.round((filled / total) * 100)) : 0
  const left = Math.max(0, total - filled)

  return (
    <div className="mb-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-xs text-ink-500">
          {copy.registration}
          <span className="ml-2 font-semibold text-ink-700">
            {left > 0 ? copy.slotsLeft(left) : copy.noSlotsLeft}
          </span>
        </span>
        <span className="text-xs font-semibold tabular-nums text-ink-700">
          {filled}
          <span className="font-normal text-ink-400">/{total}</span>
        </span>
      </div>

      <div
        role="progressbar"
        aria-valuenow={filled}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={copy.registration}
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-rail"
      >
        <div
          className={cx(
            'h-full rounded-full transition-[width] duration-500',
            left > 0 ? 'bg-felt-500' : 'bg-gold-400',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>

      {deadline && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-ink-400">
          <IconClock size={13} />
          {copy.deadline}: <span className="text-ink-600">{formatDateTime(deadline)}</span>
        </p>
      )}
    </div>
  )
}

/* ── İştirakçı siyahısı ─────────────────────────────────────── */

/** Reytinqə görə sıralanmış heyət — sıra nömrəsi seed deməkdir */
function ParticipantGrid({
  participants,
  viewerId,
}: {
  participants: PlayerSummary[]
  viewerId?: number
}) {
  const seeded = useMemo(
    () => [...participants].sort((a, b) => b.rating - a.rating),
    [participants],
  )

  return (
    <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {seeded.map((p, i) => (
        <li key={p.id}>
          <Link
            to={`/players/${p.id}`}
            className={cx(
              'flex items-center gap-3 rounded-xl border bg-card p-3 shadow-xs transition-colors',
              p.id === viewerId
                ? 'border-felt-500/40 bg-felt-500/12'
                : 'border-rail hover:border-rail-strong',
            )}
          >
            <span className="w-5 shrink-0 text-center text-xs font-semibold tabular-nums text-ink-400">
              {i + 1}
            </span>
            <Avatar name={p.fullName} color={p.avatarColor} src={p.avatarUrl} size={38} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-ink-900">
                {p.fullName}
              </span>
              <span className="block truncate text-xs text-ink-400">@{p.username}</span>
            </span>
            <span className="shrink-0 font-display text-sm font-semibold tabular-nums text-felt-300">
              {p.rating}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/**
 * Turnir başladıqdan sonra heyət şəbəkənin arxasında qalmasın deyə
 * yığcam açılan bölmə. Default bağlıdır — səhifənin əsas mövzusu cədvəldir.
 */
function RosterDisclosure({
  participants,
  viewerId,
}: {
  participants: PlayerSummary[]
  viewerId?: number
}) {
  const { language } = useLanguage()
  const copy = appCopy[language].tournamentDetail
  if (participants.length === 0) return null

  return (
    <details className="group mb-6 border-t border-rail pt-4">
      <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-ink-600 transition-colors hover:text-ink-900">
        <IconChevronDown
          size={16}
          className="text-ink-400 transition-transform duration-200 group-open:rotate-180"
        />
        {copy.rosterToggle}
        <span className="tabular-nums text-ink-400">({participants.length})</span>
      </summary>
      <div className="mt-4">
        <ParticipantGrid participants={participants} viewerId={viewerId} />
      </div>
    </details>
  )
}

/* ── Şəbəkə bölməsi ─────────────────────────────────────────── */

interface BracketViewProps {
  viewerId?: number
  canReport: (m: BracketMatch) => boolean
  onReport: (m: BracketMatch) => void
}

/**
 * Bir şəbəkəni raundlar üzrə sütunlara bölüb göstərir.
 *
 * `namedRounds` yalnız sonuncu raundun həqiqətən final olduğu şəbəkələrdə
 * açılır — iki çıxmada final ayrıca "böyük final" bölməsindədir, ona görə
 * yuxarı şəbəkənin sonu "final" adlandırılmır.
 */
function BracketGrid({
  title,
  matches,
  namedRounds = true,
  viewerId,
  canReport,
  onReport,
}: BracketViewProps & {
  title: string
  matches: BracketMatch[]
  namedRounds?: boolean
}) {
  const { language } = useLanguage()
  const copy = appCopy[language].tournamentDetail

  const { rounds, totalRounds } = useMemo(() => {
    const total = matches.reduce((m, b) => Math.max(m, b.round), 0)
    return {
      totalRounds: total,
      rounds: Array.from({ length: total }, (_, i) =>
        matches.filter((b) => b.round === i + 1).sort((a, b) => a.position - b.position),
      ).filter((r) => r.length > 0),
    }
  }, [matches])

  const { trackRef, gridRef, links, size, register } = useBracketLinks(rounds)
  const { scrollState, onScroll } = useEdgeFade(trackRef)

  const roundName = (r: number) => {
    if (!namedRounds) return copy.roundN(r)
    if (r === totalRounds) return copy.final
    if (r === totalRounds - 1) return copy.semifinal
    if (r === totalRounds - 2) return copy.quarterfinal
    return copy.roundN(r)
  }

  return (
    <section className="mb-8">
      <SectionHeader title={title} />

      {/* Kənar sönmələr şəbəkənin yana sürüşdüyünü bildirir */}
      <div className="relative -mx-4">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="no-scrollbar flex overflow-x-auto px-4 pb-4"
        >
          {/*
            `w-max` sütunları öz eninə saxlayır: əvvəl `flex-1` idi və tək maçlı
            bölmələrdə (böyük final) kart bütün səhifəni enləyib gülünc görünürdü.
          */}
          <div ref={gridRef} className="relative flex w-max gap-10">
            <BracketLinkLayer links={links} width={size.w} height={size.h} />

            {rounds.map((roundMatches, i) => (
              <div key={i} className="flex w-60 shrink-0 flex-col">
                {/* Tək raundlu adsız bölmədə ("Böyük final") etiket bölmə
                    başlığını təkrarlayardı — ona görə buraxılır */}
                {!(rounds.length === 1 && !namedRounds) && (
                  <div className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.12em] text-gold-300">
                    {roundName(roundMatches[0].round)}
                  </div>
                )}
                <div className="flex flex-1 flex-col justify-around gap-3">
                  {roundMatches.map((m) => (
                    <BracketCard
                      key={m.id}
                      match={m}
                      viewerId={viewerId}
                      canReport={canReport(m)}
                      onReport={() => onReport(m)}
                      register={register}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {scrollState.left && <EdgeFade side="left" />}
        {scrollState.right && <EdgeFade side="right" />}
      </div>
    </section>
  )
}

/* ── Raundları birləşdirən xətlər ───────────────────────────── */

interface BracketLink {
  x1: number
  y1: number
  x2: number
  y2: number
  /** Mənbə maçı bitibsə xətt qalibin yolunu göstərir */
  decided: boolean
}

function sameLinks(a: BracketLink[], b: BracketLink[]) {
  if (a.length !== b.length) return false
  return a.every((l, i) => {
    const o = b[i]
    return l.x1 === o.x1 && l.y1 === o.y1 && l.x2 === o.x2 && l.y2 === o.y2 && l.decided === o.decided
  })
}

/**
 * Kartların həqiqi mövqeyini ölçüb raundlar arasındakı birləşdirici
 * xətləri hesablayır.
 *
 * Ölçmə lazımdır, çünki kart hündürlükləri eyni deyil: yalnız təşkilatçıya
 * görünən "nəticə daxil et" düyməsi bəzi kartları uzadır. Sabit faizlə
 * çəkilən xətlər belə hallarda kartın ortasını tutmur.
 */
function useBracketLinks(rounds: BracketMatch[][]) {
  const trackRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const cards = useRef(new Map<number, HTMLElement>())
  const [links, setLinks] = useState<BracketLink[]>([])
  const [size, setSize] = useState({ w: 0, h: 0 })

  const register = useCallback((id: number, el: HTMLElement | null) => {
    if (el) cards.current.set(id, el)
    else cards.current.delete(id)
  }, [])

  useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return

    const measure = () => {
      const base = grid.getBoundingClientRect()
      const next: BracketLink[] = []

      for (let r = 0; r < rounds.length - 1; r++) {
        rounds[r].forEach((m, j) => {
          /* Hədəf: serverin verdiyi nextMatchId, yoxdursa klassik cütləşmə */
          const target =
            rounds[r + 1].find((n) => n.id === m.nextMatchId) ??
            rounds[r + 1][Math.floor(j / 2)]
          const from = cards.current.get(m.id)
          const to = target && cards.current.get(target.id)
          if (!from || !to) return

          const a = from.getBoundingClientRect()
          const b = to.getBoundingClientRect()
          next.push({
            x1: a.right - base.left,
            y1: a.top + a.height / 2 - base.top,
            x2: b.left - base.left,
            y2: b.top + b.height / 2 - base.top,
            decided: m.winnerId != null,
          })
        })
      }

      setLinks((prev) => (sameLinks(prev, next) ? prev : next))
      setSize((prev) =>
        prev.w === grid.scrollWidth && prev.h === grid.scrollHeight
          ? prev
          : { w: grid.scrollWidth, h: grid.scrollHeight },
      )
    }

    measure()

    const ro = new ResizeObserver(measure)
    ro.observe(grid)
    cards.current.forEach((el) => ro.observe(el))
    return () => ro.disconnect()
  }, [rounds])

  return { trackRef, gridRef, links, size, register }
}

/** Dirsəkli birləşdirici xətlər — kartların arxasında, kliklərə mane olmadan */
function BracketLinkLayer({
  links,
  width,
  height,
}: {
  links: BracketLink[]
  width: number
  height: number
}) {
  if (links.length === 0 || width === 0) return null
  return (
    <svg
      aria-hidden
      width={width}
      height={height}
      className="pointer-events-none absolute left-0 top-0"
      shapeRendering="crispEdges"
    >
      {links.map((l, i) => {
        const mid = Math.round((l.x1 + l.x2) / 2)
        return (
          <path
            key={i}
            d={`M${l.x1} ${Math.round(l.y1)} H${mid} V${Math.round(l.y2)} H${l.x2}`}
            fill="none"
            strokeWidth={1}
            stroke={l.decided ? 'var(--color-felt-500)' : 'var(--color-rail-strong)'}
            opacity={l.decided ? 0.75 : 1}
          />
        )
      })}
    </svg>
  )
}

/* ── Yana sürüşmə işarəsi ───────────────────────────────────── */

/** Sürüşdürülə bilən sahənin hansı tərəfində məzmun gizlidir */
function useEdgeFade(ref: RefObject<HTMLDivElement | null>) {
  const [scrollState, setScrollState] = useState({ left: false, right: false })

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setScrollState((prev) => {
      const next = { left: el.scrollLeft > 1, right: el.scrollLeft < max - 1 }
      return prev.left === next.left && prev.right === next.right ? prev : next
    })
  }, [ref])

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, update])

  return { scrollState, onScroll: update }
}

function EdgeFade({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      aria-hidden
      className={cx(
        'pointer-events-none absolute inset-y-0 w-10',
        side === 'left'
          ? 'left-0 bg-gradient-to-r from-paper to-transparent'
          : 'right-0 bg-gradient-to-l from-paper to-transparent',
      )}
    />
  )
}

/* ── Qrup mərhələsi ─────────────────────────────────────────── */

/** Hər qrup üçün sıralama cədvəli və həmin qrupun maçları */
function GroupStage({
  standings,
  matches,
  viewerId,
  canReport,
  onReport,
}: BracketViewProps & {
  standings: GroupStanding[]
  matches: BracketMatch[]
}) {
  const { language } = useLanguage()
  const copy = appCopy[language].tournamentDetail

  const groupIndexes = [...new Set(matches.map((m) => m.groupIndex ?? 0))].sort((a, b) => a - b)

  /* Qısa sütun başlıqları tək hərfdir — tam adı tooltip və ekran oxuyucu üçün saxlayırıq */
  const cols: Array<{ short: string; full: string; width: string }> = [
    { short: copy.colPlayed, full: copy.colPlayedFull, width: 'w-9' },
    { short: copy.colWon, full: copy.colWonFull, width: 'w-9' },
    { short: copy.colLost, full: copy.colLostFull, width: 'w-9' },
    { short: copy.colGames, full: copy.colGamesFull, width: 'w-14' },
    { short: copy.colDiff, full: copy.colDiffFull, width: 'w-10' },
  ]

  return (
    <section className="mb-8">
      <SectionHeader title={copy.groupStage} />
      <div className="mb-3 grid gap-4 xl:grid-cols-2">
        {groupIndexes.map((g) => {
          const rows = standings
            .filter((s) => s.groupIndex === g)
            .sort((a, b) => a.rank - b.rank)
          const groupMatches = matches
            .filter((m) => (m.groupIndex ?? 0) === g)
            .sort((a, b) => a.round - b.round || a.position - b.position)
          /* Pley-offa keçən sonuncu yer — altından kəsik xətti çəkilir */
          const lastAdvancing = rows.reduce(
            (last, s, i) => (s.advancing ? i : last),
            -1,
          )

          return (
            <Card key={g} padded={false} className="overflow-hidden">
              <div className="border-b border-rail bg-cream px-4 py-2.5">
                <h3 className="font-display text-sm font-semibold text-ink-900">
                  {copy.groupN(g)}
                </h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-rail text-[11px] uppercase tracking-[0.08em] text-ink-400">
                      <th className="w-8 px-2 py-2 text-center font-semibold">#</th>
                      <th className="px-2 py-2 text-left font-semibold">
                        {copy.participants}
                      </th>
                      {cols.map((c) => (
                        <th
                          key={c.full}
                          scope="col"
                          title={c.full}
                          aria-label={c.full}
                          className={cx('px-1 py-2 text-center font-semibold', c.width)}
                        >
                          {c.short}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rail">
                    {rows.map((s, i) => (
                      <tr
                        key={s.player.id}
                        className={cx(
                          /*
                           * Keçid zonası əvvəl yalnız 8% yaşıl fonla verilirdi və
                           * tünd səthdə demək olar görünmürdü. İndi sol kənarda
                           * tam rəngli zolaq var, kəsik xətti isə sərhədi göstərir.
                           */
                          s.advancing &&
                            'bg-felt-500/10 shadow-[inset_2px_0_0_var(--color-felt-500)]',
                          /* Kəsik xətti: `divide-y`-ın qoyduğu üst haşiyəni
                             rəngləyirik — əlavə xətt yaratmasın deyə */
                          i === lastAdvancing + 1 && 'border-felt-500/40',
                        )}
                        title={s.advancing ? copy.advancing : undefined}
                      >
                        <td className="px-2 py-2 text-center text-xs font-semibold tabular-nums text-ink-400">
                          {s.rank}
                        </td>
                        <td className="px-2 py-2">
                          <Link
                            to={`/players/${s.player.id}`}
                            className="flex min-w-0 items-center gap-2 hover:text-felt-300"
                          >
                            <Avatar
                              name={s.player.fullName}
                              color={s.player.avatarColor}
                              src={s.player.avatarUrl}
                              size={24}
                            />
                            <span
                              className={cx(
                                'truncate',
                                s.player.id === viewerId
                                  ? 'font-semibold text-felt-300'
                                  : 'text-ink-800',
                              )}
                            >
                              {s.player.fullName}
                            </span>
                          </Link>
                        </td>
                        <td className="px-1 py-2 text-center tabular-nums text-ink-500">
                          {s.played}
                        </td>
                        <td className="px-1 py-2 text-center font-semibold tabular-nums text-ink-900">
                          {s.won}
                        </td>
                        <td className="px-1 py-2 text-center tabular-nums text-ink-500">
                          {s.lost}
                        </td>
                        <td className="px-1 py-2 text-center tabular-nums text-ink-500">
                          {s.gamesFor}:{s.gamesAgainst}
                        </td>
                        <td
                          className={cx(
                            'px-1 py-2 text-center font-semibold tabular-nums',
                            s.gameDiff > 0
                              ? 'text-felt-300'
                              : s.gameDiff < 0
                                ? 'text-ink-400'
                                : 'text-ink-500',
                          )}
                        >
                          {s.gameDiff > 0 ? `+${s.gameDiff}` : s.gameDiff}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2 border-t border-rail bg-cream/40 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400">
                  {copy.groupMatches}
                </p>
                {groupMatches.map((m) => (
                  <BracketCard
                    key={m.id}
                    match={m}
                    viewerId={viewerId}
                    canReport={canReport(m)}
                    onReport={() => onReport(m)}
                  />
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      <p className="flex items-center gap-2 text-xs text-ink-400">
        <span
          aria-hidden
          className="h-3 w-1 shrink-0 rounded-full bg-felt-500"
        />
        {copy.advanceLegend}
      </p>
    </section>
  )
}

/* ── Turnir şəkilləri ───────────────────────────────────────── */

/**
 * Turnirin qalereya albomu. Şəkil yoxdursa heç nə göstərmir —
 * əksər turnirlərin şəkli olmayacaq, boş bölmə səhifəni uzadardı.
 */
function TournamentPhotos({ tournamentId }: { tournamentId: number }) {
  const { language } = useLanguage()
  const copy = appCopy[language].tournamentDetail
  const [images, setImages] = useState<GalleryImage[]>([])
  const [index, setIndex] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    GalleryApi.byTournament(tournamentId)
      .then((data) => active && setImages(data))
      .catch(() => {
        /* şəkillər əlavə məzmundur — xəta səhifəni pozmasın */
      })
    return () => {
      active = false
    }
  }, [tournamentId])

  if (images.length === 0) return null

  return (
    <section>
      <SectionHeader
        title={copy.photos}
        count={images.length}
        action={
          <Link
            to="/gallery"
            className="text-sm font-medium text-felt-300 transition-colors hover:text-felt-200"
          >
            {copy.gallery}
          </Link>
        }
      />

      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {images.map((image, i) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setIndex(i)}
            className="group h-28 w-40 shrink-0 overflow-hidden rounded-lg border border-rail bg-felt-900 transition-colors hover:border-gold-400/50"
          >
            <img
              src={mediaUrl(image.url)}
              alt={image.title ?? ''}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            />
          </button>
        ))}
      </div>

      <Lightbox
        images={images}
        index={index}
        onIndexChange={setIndex}
        onClose={() => setIndex(null)}
      />
    </section>
  )
}

/* ── Cədvəl kartı ───────────────────────────────────────────── */

function BracketCard({
  match,
  viewerId,
  canReport,
  onReport,
  register,
}: {
  match: BracketMatch
  viewerId?: number
  canReport: boolean
  onReport: () => void
  /** Şəbəkədə birləşdirici xətlərin ölçülməsi üçün — qrup maçlarında verilmir */
  register?: (id: number, el: HTMLElement | null) => void
}) {
  const { language } = useLanguage()
  const copy = appCopy[language].tournamentDetail
  const decided = match.winnerId != null
  const isBye =
    match.round === 1 && (!match.player1 || !match.player2) && (match.player1 || match.player2) != null

  const row = (player: BracketMatch['player1'], score: number | null) => {
    const isWinner = decided && player?.id === match.winnerId
    const isMe = player?.id != null && player.id === viewerId

    return (
      <div
        className={cx(
          'flex items-center gap-2 px-3 py-2',
          isWinner && 'bg-felt-500/12',
          !player && 'text-ink-300',
        )}
      >
        {player ? (
          <>
            <Avatar name={player.fullName} color={player.avatarColor} src={player.avatarUrl} size={22} />
            <span
              className={cx(
                'min-w-0 flex-1 truncate text-sm',
                isWinner ? 'font-semibold text-ink-900' : 'text-ink-600',
              )}
            >
              {player.fullName}
              {isMe && <span className="ml-1 text-[10px] font-bold uppercase text-felt-400">{copy.you}</span>}
            </span>
            {isWinner && <IconCheck size={13} className="shrink-0 text-felt-400" />}
          </>
        ) : (
          <span className="flex-1 truncate text-sm italic">{isBye ? copy.bye : copy.awaiting}</span>
        )}
        <span
          className={cx(
            'w-6 shrink-0 text-right text-sm tabular-nums',
            isWinner ? 'font-bold text-ink-900' : 'text-ink-400',
          )}
        >
          {score ?? '–'}
        </span>
      </div>
    )
  }

  /*
   * Kart öz səthindədir — "hazır" nişanı əvvəl kartın kənarından kənara
   * daşırdı və sürüşdürmə qabında kəsilirdi. İndi kartın daxilindəki
   * zolaqdır: nə kəsilir, nə də qonşu elementlərin üstünə düşür.
   */
  return (
    <div
      ref={register ? (el) => register(match.id, el) : undefined}
      className={cx(
        'relative overflow-hidden rounded-lg border bg-card shadow-xs',
        match.status === 'READY' ? 'border-honey-500/40' : 'border-rail',
      )}
    >
      {match.status === 'READY' && (
        <div className="flex items-center gap-1.5 border-b border-honey-500/20 bg-honey-500/12 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-honey-300">
          <span className="h-1.5 w-1.5 rounded-full bg-honey-400" />
          {copy.ready}
        </div>
      )}

      <div className="divide-y divide-rail">
        {row(match.player1, match.player1Score)}
        {row(match.player2, match.player2Score)}
      </div>

      {canReport && (
        <div className="border-t border-rail bg-cream p-1.5">
          <Button variant="secondary" size="sm" block onClick={onReport}>
            {copy.reportResult}
          </Button>
        </div>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2.5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-44" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

/* ── Cədvəl nəticəsi ────────────────────────────────────────── */

function ReportBracketModal({
  tid,
  match,
  onClose,
  onDone,
}: {
  tid: number
  match: BracketMatch
  onClose: () => void
  onDone: (updated: TDetail) => void
}) {
  const { language } = useLanguage()
  const copy = appCopy[language].tournamentDetail
  const [s1, setS1] = useState('')
  const [s2, setS2] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    const p1 = Number(s1)
    const p2 = Number(s2)
    if (s1 === '' || s2 === '' || Number.isNaN(p1) || Number.isNaN(p2)) {
      return setError(copy.bothScoresRequired)
    }
    if (p1 === p2) return setError(copy.noDraws)

    setLoading(true)
    setError('')
    try {
      onDone(await TournamentApi.reportResult(tid, match.id, { player1Score: p1, player2Score: p2 }))
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title={copy.reportResult} description={copy.reportDescription}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label={match.player1?.fullName ?? copy.player1}>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={s1}
              onChange={(e) => setS1(e.target.value)}
              className="text-center font-display text-lg"
              autoFocus
            />
          </Field>
          <Field label={match.player2?.fullName ?? copy.player2}>
            <Input
              type="number"
              min={0}
              inputMode="numeric"
              value={s2}
              onChange={(e) => setS2(e.target.value)}
              className="text-center font-display text-lg"
            />
          </Field>
        </div>

        <ErrorText>{error}</ErrorText>

        <div className="flex gap-2">
          <Button variant="secondary" block onClick={onClose} disabled={loading}>
            {copy.cancel}
          </Button>
          <Button block loading={loading} onClick={submit}>
            {copy.confirm}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
