import type { FieldRules } from '~/shared/types/field-rules'
import { useWebSocket } from '@vueuse/core'

export function useGameSocket(host: string) {
  //TODO: In prod: check if secure, then use 'wss://...'
  const { status, data, send, open, close } = useWebSocket(`ws://${host}/api/games`)

  // Create or join a room
  function createRoom(fieldRules: FieldRules) {
    send(JSON.stringify({ action: 'create-room', data: { fieldRules } }))
  }

  function joinRoom(room: string) {
    send(JSON.stringify({ action: 'join-room', data: { sessionId: room } }))
  }

  function makeMove(room: string, x: number, y: number) {
    send(JSON.stringify({ action: 'make-move', data: { sessionId: room, move: { x, y } } }))
  }

  return {
    status,
    data,
    send,
    createRoom,
    joinRoom,
    makeMove
  }
}
