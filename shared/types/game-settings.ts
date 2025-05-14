import type { FieldRules } from '#shared/types/field-rules'
import type { GameFeatures } from '#shared/types/game-features'

export type GameSettings = {
  mode: 'singleplayer' | 'host-multiplayer' | 'participant-multiplayer'
  fieldRules: FieldRules
  gameFeatures: GameFeatures
}
