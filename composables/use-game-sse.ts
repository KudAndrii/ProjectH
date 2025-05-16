import type { FieldRules } from '#shared/types/field-rules'
import type { GameFeatures } from '#shared/types/game-features'
import { ref } from 'vue'

export function useGameSSE() {
  const data = ref<string | null>(null)
  const status = ref<'CONNECTING' | 'OPEN' | 'CLOSING' | 'CLOSED'>('CLOSED')
  let eventSource: EventSource | null = null
  
  // Create or join a room
  async function createRoom(fieldRules: FieldRules, gameFeatures: GameFeatures) {
    const response = await $fetch('/api/games', {
      method: 'POST',
      body: { 
        action: 'create-room', 
        data: { fieldRules, gameFeatures } 
      }
    })
    
    data.value = JSON.stringify(response)
    
    // Connect to SSE after creating a room as well
    if (response.sessionId) {
      connectToEventSource(response.sessionId)
    }
    
    return response
  }

  async function joinRoom(room: string) {
    const response = await $fetch('/api/games', {
      method: 'POST',
      body: { 
        action: 'join-room', 
        data: { sessionId: room } 
      }
    })
    
    data.value = JSON.stringify(response)
    
    // Connect to SSE after joining
    connectToEventSource(room)
    
    return response
  }

  async function makeMove(room: string, x: number, y: number) {
    const response = await $fetch('/api/games', {
      method: 'POST',
      body: { 
        action: 'make-move', 
        data: { sessionId: room, move: { x, y } } 
      }
    })
    
    // Update local data immediately after making a move
    // This ensures the host also sees their own moves immediately
    if (response && response.action === 'move-made') {
      data.value = JSON.stringify(response)
    }
    
    return response
  }

  async function restart(room: string) {
    const response = await $fetch('/api/games', {
      method: 'POST',
      body: { 
        action: 'restart', 
        data: { sessionId: room } 
      }
    })
    
    return response
  }

  async function endSession(room: string) {
    const response = await $fetch('/api/games', {
      method: 'POST',
      body: { 
        action: 'end-session', 
        data: { sessionId: room } 
      }
    })
    
    close()
    return response
  }

  function connectToEventSource(sessionId: string) {
    if (eventSource) {
      eventSource.close()
    }
    
    status.value = 'CONNECTING'
    
    eventSource = new EventSource(`/api/games/sse/${sessionId}`)
    
    eventSource.onopen = () => {
      status.value = 'OPEN'
    }
    
    eventSource.onmessage = (event) => {
      data.value = event.data
    }
    
    eventSource.onerror = () => {
      status.value = 'CLOSED'
      eventSource?.close()
      eventSource = null
    }
  }

  function close() {
    if (eventSource) {
      status.value = 'CLOSING'
      eventSource.close()
      eventSource = null
      status.value = 'CLOSED'
    }
  }

  return {
    status,
    data,
    close,
    createRoom,
    joinRoom,
    makeMove,
    restart,
    endSession
  }
}
