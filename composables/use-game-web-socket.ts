import type { FieldRules } from '#shared/types/field-rules'
import type { GameFeatures } from '#shared/types/game-features'
import { useWebSocket } from '@vueuse/core'

export function useGameWebSocket(protocol: string, host: string) {
  const webSocketsProtocol = protocol === 'https:' ? 'wss:' : 'ws:'
  const { status, data, send, open, close } = useWebSocket(`${webSocketsProtocol}//${host}/api/games/ws`, { immediate: false })

  // Create or join a room
  function createRoom(fieldRules: FieldRules, gameFeatures: GameFeatures) {
    if (status.value !== 'OPEN') {
      open()
    }

    send(JSON.stringify({ action: 'create-room', data: { fieldRules, gameFeatures } }))
  }

  function joinRoom(room: string) {
    if (status.value !== 'OPEN') {
      open()
    }

    send(JSON.stringify({ action: 'join-room', data: { sessionId: room } }))
  }

  function makeMove(room: string, x: number, y: number) {
    if (status.value !== 'OPEN') {
      throw new Error('WebSocket is not open')
    }

    send(JSON.stringify({ action: 'make-move', data: { sessionId: room, move: { x, y } } }))
  }

  function restart(room: string) {
    if (status.value !== 'OPEN') {
      throw new Error('WebSocket is not open')
    }

    send(JSON.stringify({ action: 'restart', data: { sessionId: room } }))
  }

  function endSession(room: string) {
    if (status.value !== 'OPEN') {
      throw new Error('WebSocket is not open')
    }

    send(JSON.stringify({ action: 'end-session', data: { sessionId: room } }))
  }

  return {
    status,
    close,
    data,
    createRoom,
    joinRoom,
    makeMove,
    restart,
    endSession
  }
}
