import type { FieldRules } from '#shared/types/field-rules'
import type { GameFeatures } from '#shared/types/game-features'

export type GameSettings = {
  mode: 'singleplayer' | 'multiplayer' | 'multiplayer-host'
  fieldRules: FieldRules
  gameFeatures: GameFeatures
}
