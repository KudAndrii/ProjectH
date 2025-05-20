import type { SessionWithClients } from '~/server/plugins/setup-session-store'

export function broadcastToSession(sessionId: string, sessionData: SessionWithClients) {
  if (!sessionData || !sessionData.clients) return

  console.log(`Broadcasting to ${sessionData.clients.size} clients in session ${sessionId}`)
  const encodedData = `data: ${JSON.stringify(sessionData)}\n\n`

  // Convert to array to safely remove during iteration
  const clientsToRemove: string[] = []

  sessionData.clients.forEach(client => {
    try {
      client.controller.enqueue(encodedData)
    } catch (error) {
      console.error('Error sending to client:', error)
      // Mark this client for removal
      clientsToRemove.push(client.id)
    }
  })

  // Clean up any disconnected clients
  if (clientsToRemove.length > 0) {
    clientsToRemove.forEach(id => {
      const clientToRemove = Array.from(sessionData.clients).find(c => c.id === id)
      if (clientToRemove) {
        sessionData.clients.delete(clientToRemove)
      }
    })
    console.log(`Removed ${clientsToRemove.length} disconnected clients`)
  }
}
