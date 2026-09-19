import { Badge, type BadgeTone } from './ui'
import { TIER_LABEL } from '../constants/gameTypes'
import type { Tier } from '../api/types'

/**
 * Oyunçunun bir intizam üzrə liqa/klass nişanı.
 *
 * Ton seçimi qəsdən sakitdir: yalnız Pro A qızıl vurğu alır (medal rəngləri ilə
 * eyni dildə), aşağı klasslar getdikcə neytrallaşır. Həvəskar isə heç bir
 * rəng iddiası daşımır — başlanğıc vəziyyətdir, xəbərdarlıq deyil.
 */
const TIER_TONE: Record<Tier, BadgeTone> = {
  PRO_A: 'gold',
  PRO_B: 'yellow',
  PRO_C: 'blue',
  AMATEUR: 'neutral',
}

export function TierBadge({
  tier,
  className = '',
}: {
  tier: Tier | null | undefined
  className?: string
}) {
  if (!tier) return null
  return (
    <Badge tone={TIER_TONE[tier]} className={className}>
      {TIER_LABEL[tier]}
    </Badge>
  )
}
