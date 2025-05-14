import type { Player } from '#shared/types/player'
import type { Point } from '#shared/types/point'
import type { FieldRules } from '#shared/types/field-rules'
import type { GameFeatures } from '#shared/types/game-features'

export type GameSession = {
  sessionStarted: boolean
  fieldRules: FieldRules
  gameFeatures: GameFeatures
  currentMove: Player
  points: Point[]
  winner: Player | undefined
}
