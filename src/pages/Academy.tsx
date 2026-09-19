import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AcademyApi } from '../api'
import { useAuth } from '../context/AuthContext'
import { AcademyTabs, PackageCard, PackageGridSkeleton } from '../components/academy'
import { Alert, Button, Empty, Input, PageHeader, Select } from '../components/ui'
import { IconAcademy, IconPlus, IconSearch } from '../components/icons'
import { extractErrorMessage } from '../api/client'
import { GAME_TYPES, GAME_TYPE_LABEL } from '../constants/gameTypes'
import { COACHING_LEVELS, FORMAT_LABEL, LESSON_FORMATS, LEVEL_LABEL } from '../constants/academy'
import type { CoachingLevel, GameType, LessonFormat, LessonPackage } from '../api/types'

const ALL = 'ALL'

/** Dərs paketlərinin vitrini — qonağa da açıqdır */
export function Academy() {
  const { user } = useAuth()
  const [packages, setPackages] = useState<LessonPackage[]>([])
  const [query, setQuery] = useState('')
  const [gameType, setGameType] = useState<GameType | typeof ALL>(ALL)
  const [level, setLevel] = useState<CoachingLevel | typeof ALL>(ALL)
  const [format, setFormat] = useState<LessonFormat | typeof ALL>(ALL)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    AcademyApi.packages()
      .then(setPackages)
      .catch((e) => setError(extractErrorMessage(e)))
      .finally(() => setLoading(false))
  }, [])

  // Siyahı kiçikdir — filtrlər hər dəyişiklikdə serverə getmədən yerində tətbiq olunur
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return packages.filter((p) => {
      if (gameType !== ALL && p.gameType !== gameType) return false
      if (level !== ALL && p.level !== level) return false
      if (format !== ALL && p.format !== format) return false
      if (!q) return true
      return (
        p.title.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        p.coach.player.fullName.toLowerCase().includes(q)
      )
    })
  }, [packages, query, gameType, level, format])

  const hasFilter = query.trim() !== '' || gameType !== ALL || level !== ALL || format !== ALL

  return (
    <div>
      <PageHeader
        eyebrow="Akademiya"
        title="Dərs paketləri"
        subtitle="Məşqçidən dərs alın — texnikanı öyrənin, reytinqi masada qazanın"
        actions={
          user?.role === 'COACH' ? (
            <Link to="/coaches/panel">
              <Button variant="secondary" icon={<IconPlus size={16} />}>
                Paket əlavə et
              </Button>
            </Link>
          ) : (
            <Link to="/coaches/register">
              <Button variant="secondary">Məşqçi hesabı aç</Button>
            </Link>
          )
        }
      />

      <AcademyTabs value="packages" />

      <div className="mb-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Paket və ya məşqçi axtar..."
          icon={<IconSearch size={16} />}
          aria-label="Paket axtar"
        />
        <Select
          value={gameType}
          onChange={(e) => setGameType(e.target.value as GameType | typeof ALL)}
          aria-label="İntizam"
        >
          <option value={ALL}>Bütün intizamlar</option>
          {GAME_TYPES.map((g) => (
            <option key={g} value={g}>
              {GAME_TYPE_LABEL[g]}
            </option>
          ))}
        </Select>
        <Select
          value={level}
          onChange={(e) => setLevel(e.target.value as CoachingLevel | typeof ALL)}
          aria-label="Səviyyə"
        >
          <option value={ALL}>Bütün səviyyələr</option>
          {COACHING_LEVELS.map((l) => (
            <option key={l} value={l}>
              {LEVEL_LABEL[l]}
            </option>
          ))}
        </Select>
        <Select
          value={format}
          onChange={(e) => setFormat(e.target.value as LessonFormat | typeof ALL)}
          aria-label="Format"
        >
          <option value={ALL}>Fərdi və qrup</option>
          {LESSON_FORMATS.map((f) => (
            <option key={f} value={f}>
              {FORMAT_LABEL[f]}
            </option>
          ))}
        </Select>
      </div>

      {error && <Alert tone="error" className="mb-5">{error}</Alert>}

      {loading ? (
        <PackageGridSkeleton />
      ) : filtered.length === 0 ? (
        <Empty
          icon={<IconAcademy size={20} />}
          title={hasFilter ? 'Uyğun paket tapılmadı' : 'Hələ dərs paketi yoxdur'}
          hint={
            hasFilter
              ? 'Filtrləri dəyişib yenidən yoxlayın.'
              : 'İlk paketi siz yerləşdirin — məşqçi hesabı açmaq bir neçə dəqiqə çəkir.'
          }
          action={
            !hasFilter ? (
              <Link to="/coaches/register">
                <Button icon={<IconPlus size={16} />}>Məşqçi hesabı aç</Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <PackageCard key={p.id} pkg={p} />
          ))}
        </div>
      )}
    </div>
  )
}
