import type { WebSocketStatus } from '@vueuse/core'
import type { FieldRules } from '#shared/types/field-rules'
import type { GameFeatures } from '#shared/types/game-features'
import type { GameSession } from '#shared/types/game-session'
import type { Player } from '#shared/types/player'
import type { ActionResult } from '~/composables/use-game-sockets.server'
import { useGameState } from '~/composables/use-game-state'
import { useGameSettings } from '~/composables/use-game-settings'
import TheErrorModal from '~/components/TheErrorModal.vue'

type UseClientGameSocketsReturnType = {
  status: Ref<WebSocketStatus>
  sessionId: Ref<string | null>
  session: Ref<GameSession | null>
  close: () => void
  createRoom: (fieldRules: FieldRules, gameFeatures: GameFeatures) => void
  joinRoom: (room: string) => void
  makeMove: (x: number, y: number) => void
  restart: () => void
  endSession: () => void
}

// singleton
let instance: ReturnType<typeof useClientGameSockets> | null = null

export function useClientGameSockets(): UseClientGameSocketsReturnType {
  if (!!instance) return instance

  const { protocol, host } = location
  const webSocketsProtocol = protocol === 'https:' ? 'wss:' : 'ws:'
  const { settingsOpened, gameSettings } = useGameSettings()
  const { gameState, resetGameState } = useGameState()
  const sessionId = useState<string | null>('game-session-id', () => null)
  const session = useState<GameSession | null>('game-session', () => null)
  const { status, data, send, open, close: closeSockets } =
    useWebSocket(`${ webSocketsProtocol }//${ host }/api/ws/games`, { immediate: false })

  // Create or join a room
  function createRoom(fieldRules: FieldRules, gameFeatures: GameFeatures) {
    if (status.value !== 'OPEN') {
      open()
    }

    send(JSON.stringify({ action: 'create-room', data: { fieldRules, gameFeatures } }))
  }

  function joinRoom(room: string) {
    if (!room) {
      throw new Error('Room is not defined')
    }

    if (status.value !== 'OPEN') {
      open()
    }

    send(JSON.stringify({ action: 'join-room', data: { sessionId: room } }))
  }

  function makeMove(x: number, y: number) {
    if (status.value !== 'OPEN') {
      throw new Error('WebSocket is not open')
    }

    send(JSON.stringify({ action: 'make-move', data: { sessionId: sessionId.value, move: { x, y } } }))
  }

  function restart() {
    if (!sessionId.value) {
      throw new Error('Session is not defined')
    }

    if (status.value !== 'OPEN') {
      throw new Error('WebSocket is not open')
    }

    send(JSON.stringify({ action: 'restart', data: { sessionId: sessionId.value } }))
  }

  function endSession() {
    if (!sessionId.value || status.value !== 'OPEN') {
      return
    }

    send(JSON.stringify({ action: 'end-session', data: { sessionId: sessionId.value } }))
  }

  function close() {
    gameSettings.value.mode = 'singleplayer'
    sessionId.value = null
    session.value = null

    resetGameState(false)
    closeSockets()
  }

  watch(data, (newValue) => {
    let parsed: ActionResult
    let errorMessage: string = 'Unknown error occurred during multiplayer session'

    try {
      parsed = JSON.parse(newValue)
    } catch {
      console.error('Unable to parse data: ', newValue)
      errorMessage = 'Unable to process response from the server'
      parsed = { action: undefined!, session: undefined! }
    }

    const { action, session: sessionWithId } = parsed
    const { sessionId: id, ...updatedSession } = sessionWithId || { sessionId: undefined }

    switch (action) {
      case 'room-created':
        sessionId.value = id
        session.value = { ...updatedSession }
        break;

      case 'room-joined':
        let currentPlayer: Player;

        switch (gameSettings.value.mode) {
          case 'multiplayer':
            currentPlayer = 'circle'
            break;
          case 'multiplayer-host':
            currentPlayer = 'cross'
            break;
          default:
            throw new Error(`Unexpected mode for 'room-joined' action: ${ gameSettings.value.mode }`)
        }

        gameState.value = {
          ...gameState.value,
          currentPlayer: currentPlayer
        }
        sessionId.value = id
        session.value = { ...updatedSession }

        settingsOpened.value = false
        break;

      case 'move-made':
        session.value = { ...updatedSession }
        break;

      case 'restarted':
        session.value = { ...updatedSession }
        break

      case 'session-ended':
      default:
        if ('error' in parsed && typeof parsed.error === 'string' && parsed.error.length > 0) {
          errorMessage = parsed.error
        }

        useOverlay().create(TheErrorModal, {
          props: {
            message: errorMessage
          }
        }).open()
        close()
        break;
    }
  })

  instance = {
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

  return instance
}
