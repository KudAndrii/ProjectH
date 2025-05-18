import { makeMove } from '#shared/utils/make-move'
import { broadcastToSession } from '~/composables/broadcast-to-session.server'
import { GameSession } from '#shared/types/game-session'

export default defineEventHandler(async (event) : Promise<GameSession> => {
  const body = await readBody(event)

  const sessionsStore = useNitroApp().sessionsStore
  const sessionEntry = sessionsStore[body.sessionId]

  if (!sessionEntry) {
    console.error('error-details: ', { sessionId: body.sessionId, sessionsStore })
    throw new Error('Room does not exist')
  }

  const newPoint =
    { X: body.move.x, Y: body.move.y, player: sessionEntry.currentMove }
  const moveResults = makeMove(
    newPoint,
    sessionEntry.points,
    sessionEntry.gameFeatures,
    sessionEntry.fieldRules.pointsInRowToWin
  )

  sessionEntry.points = moveResults.updatedPoints
  sessionEntry.winner = moveResults.winner
  sessionEntry.currentMove = moveResults.nextTurn

  broadcastToSession(body.sessionId, sessionEntry)
  const { clients, ...gameSession } = sessionEntry

  return gameSession
})