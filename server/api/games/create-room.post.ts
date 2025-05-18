import { GameSession } from '#shared/types/game-session'

export default defineEventHandler(async (event) : Promise<{ sessionId: string, session: GameSession }> => {
  const body = await readBody(event)

  const sessionsStore = useNitroApp().sessionsStore
  const sessionsCount = Object.keys(sessionsStore).length
  const config = useRuntimeConfig()

  if (sessionsCount >= config.sessionsLimit) {
    console.error('error-details: ', { sessionsCount, sessionsLimit: config.sessionsLimit })
    throw new Error('Server is full, try again later')
  }

  const sessionId = generateCode()

  sessionsStore[sessionId] = {
    sessionStarted: false,
    fieldRules: body.fieldRules,
    gameFeatures: body.gameFeatures,
    currentMove: 'cross',
    points: [],
    winner: undefined,
    clients: new Set()
  }

  return { sessionId, session: sessionsStore[sessionId] }
})

// generates code consist of 6 random uppercase letters
function generateCode(): string {
  const array = new Uint8Array(6)
  crypto.getRandomValues(array)
  return Array.from(array, (value) =>
    String.fromCharCode(65 + (value % 26))).join('')
}
