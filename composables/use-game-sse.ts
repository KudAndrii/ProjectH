import type { FieldRules } from '#shared/types/field-rules'
import type { GameFeatures } from '#shared/types/game-features'
import type { GameSession } from '#shared/types/game-session'
import { useGameState } from '~/composables/use-game-state'
import { useGameSettings } from '~/composables/use-game-settings'

export function useGameSSE() {
  const { settingsOpened, gameSettings } = useGameSettings()
  const { gameState } = useGameState()
  const sessionId = useState<string | null>('game-session-id', () => null)
  const session = useState<GameSession | null>('game-session', () => null)
  const status = useState<'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'>(
    'game-session-status', () => 'CLOSED')
  let eventSource: EventSource | null = null
  
  // Create or join a room
  async function createRoom(fieldRules: FieldRules, gameFeatures: GameFeatures) {
    const response = await $fetch('/api/games/create-room', {
      method: 'POST',
      body: { fieldRules, gameFeatures }
    })

    sessionId.value = response.sessionId
    session.value = { ...response.session }

    if (!response.sessionId) {
      throw new Error('Failed to create a room')
    }

    // Connect to SSE after creating a room
    connectToEventSource()
  }

  async function joinRoom(room: string) {
    if (!room) {
      throw new Error('Room is not defined')
    }

    const response = await $fetch('/api/games/join-room', {
      // @ts-ignore
      method: 'PATCH',
      body: { sessionId: room }
    })

    gameState.value = {
      ...gameState.value,
      currentPlayer: 'circle'
    }
    sessionId.value = room
    session.value = { ...(response as GameSession) }
    
    // Connect to SSE after joining
    connectToEventSource()
  }

  async function makeMove(x: number, y: number) {
    const response = await $fetch('/api/games/make-move', {
      // @ts-ignore
      method: 'PATCH',
      body: { sessionId: sessionId.value, move: { x, y } }
    })

    session.value = { ...(response as GameSession) }
  }

  async function restart() {
    if (!sessionId.value) {
      throw new Error('Session is not defined')
    }

    const response = await $fetch('/api/games/restart', {
      // @ts-ignore
      method: 'PATCH',
      body: { sessionId: sessionId.value }
    })

    session.value = { ...(response as GameSession) }
  }

  async function endSession() {
    if (!sessionId.value) {
      throw new Error('Session is not defined')
    }

    await $fetch('/api/games/end-session', {
      // @ts-ignore
      method: 'DELETE',
      body: { sessionId: sessionId.value }
    })

    close()
  }

  function connectToEventSource() {
    if (eventSource) {
      eventSource.close()
    }
    
    status.value = 'CONNECTING'
    
    eventSource = new EventSource(`/api/games/sse/${sessionId.value}`)
    
    eventSource.onopen = () => {
      status.value = 'OPEN'
      if (gameSettings.value.mode === 'participant-multiplayer' && settingsOpened.value) {
        settingsOpened.value = false
      }
    }
    
    eventSource.onmessage = (event) => {
      session.value = JSON.parse(event.data)
    }
    
    eventSource.onerror = () => {
      status.value = 'CLOSED'
      eventSource?.close()
      eventSource = null
    }
  }

  function close() {
    gameSettings.value.mode = 'singleplayer'
    sessionId.value = null
    session.value = null

    if (eventSource) {
      status.value = 'CLOSING'
      eventSource.close()
      eventSource = null
      status.value = 'CLOSED'
    }
  }

  return {
    status,
    sessionId,
    session,
    close,
    createRoom,
    joinRoom,
    makeMove,
    restart,
    endSession
  }
}
