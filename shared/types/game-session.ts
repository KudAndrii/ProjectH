import type { Player } from '#shared/types/player'
import type { Point } from '#shared/types/point'
import type { FieldRules } from '#shared/types/field-rules'

export type GameSession = {
  sessionStarted: boolean
  fieldRules: FieldRules
  currentMove: Player
  points: Point[]
  winner: Player | undefined
}