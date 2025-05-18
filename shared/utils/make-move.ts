import type { Point } from '#shared/types/point'
import type { Player } from '#shared/types/player'
import type { GameFeatures } from '#shared/types/game-features'
import { defineWinner } from '#shared/utils/define-winner'

export const makeMove = (newPoint: Point, existingPoints: Point[], gameFeatures: GameFeatures, pointsInRowToWin: number) => {
  if (existingPoints.at(-1)?.player === newPoint.player) {
    console.error('error-details: ', { newPoint, existingPoints })
    throw new Error('Against rules making a move 2 times in a row')
  }

  if (existingPoints.some(point => point.X === newPoint.X && point.Y === newPoint.Y)) {
    console.error('error-details: ', { newPoint, existingPoints })
    throw new Error('Against rules making a move on a taken point')
  }

  const updatedPoints = [...existingPoints, newPoint]
  
  if (gameFeatures.infinitePlay && updatedPoints.filter(x => x.player === newPoint.player).length > pointsInRowToWin) {
    updatedPoints.shift()
  }
  
  const winner = defineWinner(updatedPoints, pointsInRowToWin)
  const nextTurn: Player = newPoint.player === 'cross' ? 'circle' : 'cross'

  return { winner, updatedPoints, nextTurn }
}
