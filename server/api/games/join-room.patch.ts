import { readBody } from 'h3'
import { GameSession } from '#shared/types/game-session'

export default defineEventHandler(async (event) : Promise<GameSession> => {
  const body = await readBody(event)

  const sessionsStore = useNitroApp().sessionsStore
  const sessionEntry = sessionsStore[body.sessionId]

  if (!sessionEntry) {
    console.error('error-details: ', { sessionId: body.sessionId, sessionsStore })
    throw new Error('Room does not exist')
  }

  if (sessionEntry.sessionStarted) {
    console.error('error-details: ', sessionEntry)
    throw new Error('Room is full')
  }

  sessionEntry.sessionStarted = true
  const { clients, ...gameSession } = sessionEntry

  return gameSession
})