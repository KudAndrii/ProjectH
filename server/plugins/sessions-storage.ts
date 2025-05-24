import type { GameSession } from '#shared/types/game-session'

declare module 'nitropack' {
  interface NitroApp {
    $sessions: Record<string, GameSession>
  }
}

export default defineNitroPlugin((nuxtApp) => {
  nuxtApp.$sessions = {}
})
