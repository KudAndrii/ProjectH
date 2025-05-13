import type { FieldRules } from '#shared/types/field-rules'
import { useWebSocket } from '@vueuse/core'

export function useGameSocket(host: string) {
  //TODO: In prod: check if secure, then use 'wss://...'
  const { status, data, send, open, close } = useWebSocket(`ws://${host}/api/games`, { immediate: false })

  // Create or join a room
  function createRoom(fieldRules: FieldRules) {
    if (status.value !== 'OPEN') {
      open()
    }

    send(JSON.stringify({ action: 'create-room', data: { fieldRules } }))
  }

  function joinRoom(room: string) {
    console.warn('joining the room: ', room)
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

  return {
    status,
    close,
    data,
    createRoom,
    joinRoom,
    makeMove
  }
}
