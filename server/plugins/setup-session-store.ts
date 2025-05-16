import { GameSession } from '#shared/types/game-session'

// This plugin ensures we have a global session store that persists across requests
// It's especially important for the SSE implementation

export interface SessionWithClients {
  session: GameSession;
  clients: Set<{
    id: string;
    controller: ReadableStreamDefaultController;
  }>;
}

declare module 'nitropack' {
  interface NitroApp {
    sessionsStore: Record<string, SessionWithClients>;
  }
}

export default defineNitroPlugin((nitroApp) => {
  // Initialize the sessions store
  nitroApp.sessionsStore = {};
  
  console.log('Session store initialized');
})
