import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { TournamentApi } from '../api'
import { Modal } from './Modal'
import { Button, ErrorText, Field, Input, Select, Textarea, cx } from './ui'
import { IconCheck, IconChevronRight, IconInfo, IconUsers } from './icons'
import { extractErrorMessage } from '../api/client'
import { useLanguage } from '../context/LanguageContext'
import { appCopy } from '../i18n/app'
import { DEFAULT_GAME_TYPE, GAME_TYPES, GAME_TYPE_LABEL } from '../constants/gameTypes'
import {
  BRACKET_SIZES,
  CATEGORY_LABEL,
  DEFAULT_DISCIPLINE,
  DISCIPLINES_BY_GAME,
  DISCIPLINE_LABEL,
  FORMAT_HINT,
  FORMAT_LABEL,
  GENDER_LABEL,
  PARTICIPANT_GENDERS,
  RACE_TO_PRESETS,
  TOURNAMENT_CATEGORIES,
  TOURNAMENT_FORMATS,
} from '../constants/tournament'
import type {
  Discipline,
  GameType,
  ParticipantGender,
  TournamentCategory,
  TournamentFormat,
} from '../api/types'

/* ── Addımlar ───────────────────────────────────────────────── */

type Step = 0 | 1 | 2

/**
 * Sihirbazın mətnləri. `appCopy` `as const` olduğu üçün hər dil öz literal
 * tipini alır — burada onları ümumi forma altında birləşdiririk ki, addım
 * komponentlərinə dildən asılı olmayan bir tip ötürə bilək.
 */
interface Copy {
  title: string
  steps: readonly string[]
  stepOf: (n: number, total: number, name: string) => string
  name: string
  namePlaceholder: string
  gameType: string
  seedHint: string
  subType: string
  subTypeNote: (game: string) => string
  description: string
  descriptionHint: string
  descriptionPlaceholder: string
  scheme: string
  limit: string
  limitHint: string
  raceTo: string
  groupCount: string
  advancePerGroup: string
  groupNote: (groups: number, advance: number, seats: number) => string
  level: string
  participants: string
  genderNote: string
  start: string
  end: string
  deadline: string
  deadlineHint: string
  hidden: string
  hiddenHint: string
  summary: string
  sumLimit: (max: number, race: number) => string
  sumGroups: (groups: number, advance: number) => string
  cancel: string
  back: string
  next: string
  create: string
  errNameShort: string
  errNameLong: string
  errGroupsTooBig: (seats: number) => string
  errEndBeforeStart: string
  errDeadlineAfterStart: string
}

interface FormState {
  name: string
  description: string
  gameType: GameType
  discipline: Discipline
  format: TournamentFormat
  category: TournamentCategory
  participantGender: ParticipantGender
  maxParticipants: number
  raceTo: number
  groupCount: number
  advancePerGroup: number
  startAt: string
  endAt: string
  registrationDeadline: string
  hidden: boolean
}

const initialForm = (): FormState => ({
  name: '',
  description: '',
  gameType: DEFAULT_GAME_TYPE,
  discipline: DEFAULT_DISCIPLINE[DEFAULT_GAME_TYPE],
  format: 'SINGLE_ELIMINATION',
  category: 'CLUB',
  participantGender: 'ANY',
  maxParticipants: 8,
  raceTo: 5,
  groupCount: 2,
  advancePerGroup: 2,
  startAt: '',
  endAt: '',
  registrationDeadline: '',
  hidden: false,
})

/** datetime-local dəyərini ISO-ya çevirir; boş sahə üçün undefined qaytarır */
const toIso = (value: string) => (value ? new Date(value).toISOString() : undefined)

/**
 * Turnir yaratma sihirbazı — bill4you-dakı çoxsahəli formanın üç addıma
 * bölünmüş variantı. Hər addım öz-özlüyündə yoxlanılır, ona görə istifadəçi
 * yarımçıq məlumatla sona çata bilmir.
 */
export function CreateTournamentWizard({
  venueId,
  onClose,
  onCreated,
}: {
  venueId: number
  onClose: () => void
  onCreated: () => void
}) {
  const { language } = useLanguage()
  const copy: Copy = appCopy[language].createTournament
  const [step, setStep] = useState<Step>(0)
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const patch = (changes: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...changes }))
    setError('')
  }

  /** Oyun növü dəyişəndə alt intizam da həmin növün standartına sıfırlanır */
  const pickGameType = (gameType: GameType) =>
    patch({ gameType, discipline: DEFAULT_DISCIPLINE[gameType] })

  const stepError = useMemo(() => validateStep(step, form, copy), [step, form, copy])

  const next = () => {
    if (stepError) return setError(stepError)
    setError('')
    setStep((s) => Math.min(2, s + 1) as Step)
  }

  const back = () => {
    setError('')
    setStep((s) => Math.max(0, s - 1) as Step)
  }

  const submit = async () => {
    // Son addımda bütün addımları yenidən yoxlayırıq — istifadəçi geri qayıdıb
    // dəyişiklik etmiş ola bilər.
    for (const s of [0, 1, 2] as Step[]) {
      const problem = validateStep(s, form, copy)
      if (problem) {
        setStep(s)
        return setError(problem)
      }
    }

    setLoading(true)
    setError('')
    try {
      await TournamentApi.create({
        name: form.name.trim(),
        venueId,
        gameType: form.gameType,
        discipline: form.discipline,
        format: form.format,
        category: form.category,
        participantGender: form.participantGender,
        description: form.description.trim() || undefined,
        startAt: toIso(form.startAt),
        endAt: toIso(form.endAt),
        registrationDeadline: toIso(form.registrationDeadline),
        maxParticipants: form.maxParticipants,
        raceTo: form.raceTo,
        // Qrup sahələri yalnız müvafiq formatda mənalıdır
        groupCount: form.format === 'GROUP_PLAYOFF' ? form.groupCount : undefined,
        advancePerGroup: form.format === 'GROUP_PLAYOFF' ? form.advancePerGroup : undefined,
        hidden: form.hidden,
      })
      onCreated()
    } catch (e) {
      setError(extractErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      open
      size="lg"
      onClose={onClose}
      title={copy.title}
      description={copy.stepOf(step + 1, copy.steps.length, copy.steps[step])}
    >
      <div className="space-y-5">
        <StepRail
          step={step}
          labels={copy.steps}
          onJump={(s) => (s < step ? setStep(s) : next())}
        />

        {step === 0 && (
          <BasicsStep
            form={form}
            patch={patch}
            pickGameType={pickGameType}
            language={language}
            copy={copy}
          />
        )}
        {step === 1 && <FormatStep form={form} patch={patch} language={language} copy={copy} />}
        {step === 2 && <DetailsStep form={form} patch={patch} language={language} copy={copy} />}

        <ErrorText>{error}</ErrorText>

        <div className="flex gap-2 pt-1">
          {step === 0 ? (
            <Button variant="secondary" block onClick={onClose} disabled={loading}>
              {copy.cancel}
            </Button>
          ) : (
            <Button variant="secondary" block onClick={back} disabled={loading}>
              {copy.back}
            </Button>
          )}
          {step < 2 ? (
            <Button block onClick={next} icon={<IconChevronRight size={16} />}>
              {copy.next}
            </Button>
          ) : (
            <Button block loading={loading} onClick={submit}>
              {copy.create}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

/* ── Addım yoxlamaları ──────────────────────────────────────── */

function validateStep(step: Step, form: FormState, copy: Copy): string {
  if (step === 0) {
    if (form.name.trim().length < 2) return copy.errNameShort
    if (form.name.trim().length > 120) return copy.errNameLong
    return ''
  }

  if (step === 1) {
    if (form.format === 'GROUP_PLAYOFF') {
      // Hər qrupda keçən sayından ən azı bir nəfər çox olmalıdır, yoxsa
      // qrup mərhələsi heç kimi eləmir — server də bunu rədd edir.
      const needed = form.groupCount * (form.advancePerGroup + 1)
      if (needed > form.maxParticipants) return copy.errGroupsTooBig(needed)
    }
    return ''
  }

  const start = form.startAt ? Date.parse(form.startAt) : null
  const end = form.endAt ? Date.parse(form.endAt) : null
  const deadline = form.registrationDeadline ? Date.parse(form.registrationDeadline) : null

  if (start != null && end != null && end < start) return copy.errEndBeforeStart
  if (start != null && deadline != null && deadline > start) return copy.errDeadlineAfterStart
  return ''
}

/* ── Addım göstəricisi ──────────────────────────────────────── */

function StepRail({
  step,
  labels,
  onJump,
}: {
  step: Step
  labels: readonly string[]
  onJump: (s: Step) => void
}) {
  return (
    <ol className="flex items-center gap-1.5">
      {labels.map((label, i) => {
        const done = i < step
        const active = i === step
        return (
          <li key={label} className="flex min-w-0 flex-1 items-center gap-1.5">
            <button
              type="button"
              onClick={() => onJump(i as Step)}
              disabled={i > step}
              aria-current={active ? 'step' : undefined}
              className={cx(
                'flex min-w-0 flex-1 items-center gap-2 rounded-lg border px-2.5 py-1.5 text-left transition-colors',
                active && 'border-felt-600 bg-felt-500/12',
                done && 'border-rail-strong bg-cream hover:border-gold-400/40',
                !active && !done && 'border-rail bg-cream/50 opacity-60',
              )}
            >
              <span
                className={cx(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums',
                  active ? 'bg-felt-500 text-ivory' : done ? 'bg-felt-600/70 text-ivory' : 'bg-rail text-ink-400',
                )}
              >
                {done ? <IconCheck size={12} /> : i + 1}
              </span>
              <span
                className={cx(
                  'truncate text-xs font-semibold',
                  active ? 'text-felt-300' : 'text-ink-500',
                )}
              >
                {label}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

/* ── Ümumi seçim elementləri ────────────────────────────────── */

function ChipGroup<T extends string | number>({
  value,
  onChange,
  options,
  columns = 4,
}: {
  value: T
  onChange: (v: T) => void
  options: Array<{ value: T; label: ReactNode }>
  columns?: 2 | 3 | 4
}) {
  const grid = { 2: 'grid-cols-2', 3: 'grid-cols-3', 4: 'grid-cols-4' }[columns]
  return (
    <div className={cx('grid gap-2', grid)}>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cx(
            'rounded-lg border px-2 py-2 text-xs font-semibold transition-colors',
            value === o.value
              ? 'border-felt-600 bg-felt-500/12 text-felt-300'
              : 'border-rail-strong bg-cream text-ink-600 hover:border-gold-400/40',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Checkbox({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-felt-500"
      />
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink-800">{label}</span>
        {hint && <span className="mt-0.5 block text-xs text-ink-400">{hint}</span>}
      </span>
    </label>
  )
}

/** Field-dən kənarda duran seçim qruplarının başlığı — Label ilə eyni görkəm */
function GroupLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">
      {children}
    </p>
  )
}

function Note({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 text-xs leading-relaxed text-ink-400">
      <IconInfo size={13} className="mt-px shrink-0" />
      <span>{children}</span>
    </p>
  )
}

/* ── 1. Əsas ────────────────────────────────────────────────── */

type StepProps = {
  form: FormState
  patch: (changes: Partial<FormState>) => void
  language: ReturnType<typeof useLanguage>['language']
  copy: Copy
}

function BasicsStep({
  form,
  patch,
  pickGameType,
  language,
  copy,
}: StepProps & { pickGameType: (g: GameType) => void }) {
  const disciplines = DISCIPLINES_BY_GAME[form.gameType]

  return (
    <div className="space-y-4">
      <Field label={copy.name}>
        <Input
          value={form.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder={copy.namePlaceholder}
          maxLength={120}
          autoFocus
        />
      </Field>

      <div>
        <GroupLabel>{copy.gameType}</GroupLabel>
        <ChipGroup
          columns={3}
          value={form.gameType}
          onChange={pickGameType}
          options={GAME_TYPES.map((t) => ({ value: t, label: GAME_TYPE_LABEL[language][t] }))}
        />
        <p className="mt-1.5 text-xs text-ink-400">{copy.seedHint}</p>
      </div>

      <div>
        <GroupLabel>{copy.subType}</GroupLabel>
        <ChipGroup
          columns={2}
          value={form.discipline}
          onChange={(discipline) => patch({ discipline })}
          options={disciplines.map((d) => ({ value: d, label: DISCIPLINE_LABEL[language][d] }))}
        />
        <div className="mt-1.5">
          <Note>{copy.subTypeNote(GAME_TYPE_LABEL[language][form.gameType])}</Note>
        </div>
      </div>

      <Field label={copy.description} optional hint={copy.descriptionHint}>
        <Textarea
          rows={3}
          maxLength={1000}
          value={form.description}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder={copy.descriptionPlaceholder}
        />
      </Field>
    </div>
  )
}

/* ── 2. Format ──────────────────────────────────────────────── */

function FormatStep({ form, patch, language, copy }: StepProps) {
  const isGroups = form.format === 'GROUP_PLAYOFF'
  const minimumSeats = form.groupCount * (form.advancePerGroup + 1)

  return (
    <div className="space-y-4">
      <div>
        <GroupLabel>{copy.scheme}</GroupLabel>
        <div className="space-y-2">
          {TOURNAMENT_FORMATS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => patch({ format: f })}
              aria-pressed={form.format === f}
              className={cx(
                'flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors',
                form.format === f
                  ? 'border-felt-600 bg-felt-500/12'
                  : 'border-rail-strong bg-cream hover:border-gold-400/40',
              )}
            >
              <span
                className={cx(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2',
                  form.format === f ? 'border-felt-500 bg-felt-500' : 'border-rail-strong',
                )}
              >
                {form.format === f && <IconCheck size={10} className="text-ivory" />}
              </span>
              <span className="min-w-0">
                <span
                  className={cx(
                    'block text-sm font-semibold',
                    form.format === f ? 'text-felt-300' : 'text-ink-800',
                  )}
                >
                  {FORMAT_LABEL[language][f]}
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-ink-500">
                  {FORMAT_HINT[language][f]}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <GroupLabel>{copy.limit}</GroupLabel>
        <ChipGroup
          columns={4}
          value={form.maxParticipants}
          onChange={(maxParticipants) => patch({ maxParticipants })}
          options={BRACKET_SIZES.map((n) => ({ value: n, label: n }))}
        />
        <p className="mt-1.5 text-xs text-ink-400">{copy.limitHint}</p>
      </div>

      <div>
        <GroupLabel>{copy.raceTo}</GroupLabel>
        <ChipGroup
          columns={4}
          value={form.raceTo}
          onChange={(raceTo) => patch({ raceTo })}
          options={RACE_TO_PRESETS.map((n) => ({ value: n, label: n }))}
        />
      </div>

      {isGroups && (
        <div className="space-y-4 rounded-lg border border-rail-strong bg-cream p-3">
          <div>
            <GroupLabel>{copy.groupCount}</GroupLabel>
            <ChipGroup
              columns={4}
              value={form.groupCount}
              onChange={(groupCount) => patch({ groupCount })}
              options={[2, 4, 6, 8].map((n) => ({ value: n, label: n }))}
            />
          </div>
          <div>
            <GroupLabel>{copy.advancePerGroup}</GroupLabel>
            <ChipGroup
              columns={4}
              value={form.advancePerGroup}
              onChange={(advancePerGroup) => patch({ advancePerGroup })}
              options={[1, 2, 3, 4].map((n) => ({ value: n, label: n }))}
            />
          </div>
          <Note>{copy.groupNote(form.groupCount, form.advancePerGroup, minimumSeats)}</Note>
        </div>
      )}
    </div>
  )
}

/* ── 3. Təfərrüat ───────────────────────────────────────────── */

function DetailsStep({ form, patch, language, copy }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.level}>
          <Select
            value={form.category}
            onChange={(e) => patch({ category: e.target.value as TournamentCategory })}
          >
            {TOURNAMENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[language][c]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={copy.participants}>
          <Select
            value={form.participantGender}
            onChange={(e) => patch({ participantGender: e.target.value as ParticipantGender })}
          >
            {PARTICIPANT_GENDERS.map((g) => (
              <option key={g} value={g}>
                {GENDER_LABEL[language][g]}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      {form.participantGender !== 'ANY' && <Note>{copy.genderNote}</Note>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={copy.start} optional>
          <Input
            type="datetime-local"
            value={form.startAt}
            onChange={(e) => patch({ startAt: e.target.value })}
          />
        </Field>
        <Field label={copy.end} optional>
          <Input
            type="datetime-local"
            value={form.endAt}
            onChange={(e) => patch({ endAt: e.target.value })}
          />
        </Field>
      </div>

      <Field label={copy.deadline} optional hint={copy.deadlineHint}>
        <Input
          type="datetime-local"
          value={form.registrationDeadline}
          onChange={(e) => patch({ registrationDeadline: e.target.value })}
        />
      </Field>

      <Checkbox
        checked={form.hidden}
        onChange={(hidden) => patch({ hidden })}
        label={copy.hidden}
        hint={copy.hiddenHint}
      />

      <Summary form={form} language={language} copy={copy} />
    </div>
  )
}

/* ── Yekun xülasə ───────────────────────────────────────────── */

function Summary({
  form,
  language,
  copy,
}: {
  form: FormState
  language: StepProps['language']
  copy: Copy
}) {
  const rows: Array<[string, string]> = [
    [
      copy.gameType,
      `${GAME_TYPE_LABEL[language][form.gameType]} · ${DISCIPLINE_LABEL[language][form.discipline]}`,
    ],
    [copy.scheme, FORMAT_LABEL[language][form.format]],
    [copy.limit, copy.sumLimit(form.maxParticipants, form.raceTo)],
  ]
  if (form.format === 'GROUP_PLAYOFF') {
    rows.push([copy.groupCount, copy.sumGroups(form.groupCount, form.advancePerGroup)])
  }
  rows.push([copy.level, CATEGORY_LABEL[language][form.category]])

  return (
    <div className="rounded-lg border border-rail bg-cream/60 p-3">
      <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-gold-300">
        <IconUsers size={13} />
        {copy.summary}
      </p>
      <dl className="space-y-1.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-3 text-sm">
            <dt className="shrink-0 text-ink-500">{label}</dt>
            <dd className="min-w-0 text-right font-medium text-ink-800">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
