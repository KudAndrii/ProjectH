import { GameSession } from '#shared/types/game-session'

export default defineEventHandler(async (event) : Promise<GameSession> => {
  const body = await readBody(event)

  const sessionsStore = useNitroApp().sessionsStore
  const sessionEntry = sessionsStore[body.sessionId]

  if (!sessionEntry) {
    console.error('error-details: ', { sessionId: body.sessionId, sessionsStore })
    throw new Error('Room does not exist')
  }

  sessionEntry.currentMove = 'cross'
  sessionEntry.points = []
  sessionEntry.winner = undefined
  const { clients, ...gameSession } = sessionEntry

  return gameSession

})