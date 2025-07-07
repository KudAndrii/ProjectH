import { ActionResult, useServerGameSockets } from "~/composables/use-game-sockets.server"

export default defineWebSocketHandler({
  open(peer) {
    console.log("[ws] open", peer);
  },

  message(peer, message) {
    const { action, data } = JSON.parse(message.text())
    const { createRoom, joinRoom, makeMove, restart, endSession } = useServerGameSockets()
    let actionResult: ActionResult

    try {
      switch (action) {
        case 'create-room':
          actionResult = createRoom(peer, data)
          break

        case 'join-room':
          actionResult = joinRoom(peer, data)
          break

        case 'make-move':
          actionResult = makeMove(peer, data)
          break

        case 'restart':
          actionResult = restart(peer, data)
          break

        case 'end-session':
          actionResult = endSession(peer, data)
          break;

        default:
          throw new Error('Unknown action')
      }
    } catch (error) {
      console.error(error)

      // timestamp needed to handle updates on the client side properly
      // since the rest payload might not change so it wont be detected
      peer.send({ timestamp: Date.now(), error: (error as Error).message })

      return
    }

    console.log('Action result: ', actionResult)

    // Publish update to all other peers in the room except the publisher
    if (!!data.sessionId && [ 'make-move', 'end-session', 'join-room' ].includes(action)) {
      peer.publish(data.sessionId, JSON.stringify(actionResult))
    }

    peer.send(JSON.stringify(actionResult))
  },

  close(peer, event) {
    const { clearSessionsForPeer } = useServerGameSockets()

    try {
      clearSessionsForPeer(peer)
    } finally {
      console.log("[ws] close", peer, event);
    }
  },

  error(peer, error) {
    const { clearSessionsForPeer } = useServerGameSockets()

    try {
      clearSessionsForPeer(peer)
    } finally {
      console.error("[ws] error", peer, error);
    }
  },
});

