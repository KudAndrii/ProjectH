import type { Player } from '#shared/types/player'
import type { Point } from '#shared/types/point'

export type GameState = {
  currentMove: Player
  currentPlayer: Player
  points: Point[]
  winner: Player | undefined
}