// Plate colours. Like a real kaiten bar the colour of the plate is its price, so the same five
// colours mark price on the belt, in the menu, on the plate stacks and in the panels.
export const TIER_COLORS = ['#3a7cc2', '#3f9450', '#cf4430', '#c99317', '#2b2a28'] as const
export const TIER_NAMES = ['Biru', 'Hijau', 'Merah', 'Emas', 'Hitam'] as const

export function tierColor(tier: number): string {
  return TIER_COLORS[Math.max(1, Math.min(5, Math.round(tier))) - 1]
}
