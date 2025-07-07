import type { GameSession } from '#shared/types/game-session'

declare module 'nitropack' {
  interface NitroApp {
    $sessions: Record<string, { hostId: string, guestId: string | undefined, state: GameSession }>
  }
}

export default defineNitroPlugin((nuxtApp) => {
  nuxtApp.$sessions = {}
})
