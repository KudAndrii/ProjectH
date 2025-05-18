import { GameSession } from '#shared/types/game-session'

export type SessionWithClients = GameSession & {
  clients: Set<{
    id: string
    controller: ReadableStreamDefaultController
  }>
}

declare module 'nitropack' {
  interface NitroApp {
    sessionsStore: Record<string, SessionWithClients>
  }
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.sessionsStore = {}
  
  console.log('Session store initialized')
})
