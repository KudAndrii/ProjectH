import type { Peer } from 'crossws'
import { v4 as uuid } from 'uuid';
import type { GameSession } from '#shared/types/game-session'
import { defineWinner } from '#shared/utils/define-winner'

type ActionResult = {
  action: string
  [key: string]: any
}

interface IGameAction {
  (peer: Peer, data: any): ActionResult
}

const sessions: Record<string, GameSession> = {};

export default defineWebSocketHandler({
  open(peer) {
    console.log('WebSocket connection opened', peer)
  },
  close(peer) {
    console.log('WebSocket connection closed', peer)
  },
  message(peer, message) {
    const { action, data } = JSON.parse(message.text())
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

      actionResult = { action: 'error', message: (error as Error).message }
      peer.send(JSON.stringify(actionResult))
    }

    console.log('Action result: ', actionResult)

    // Publish to all other peers in the room except the publisher
    if (!!data.sessionId && action === 'make-move') {
      peer.publish(data.sessionId, JSON.stringify(actionResult))
    } else if (action === 'end-session') {
      peer.publish(data.sessionId, JSON.stringify(actionResult))
    }

    peer.send(JSON.stringify(actionResult))
  },
})

const createRoom: IGameAction = (peer, data) => {
  const sessionId = uuid()
  peer.subscribe(sessionId)

  sessions[sessionId] = {
    sessionStarted: false,
    fieldRules: data.fieldRules,
    currentMove: 'cross',
    points: [],
    winner: undefined
  }

  return { action: 'room-created', sessionId }
}

const joinRoom: IGameAction = (peer, data) => {
  const session = sessions[data.sessionId] ?? throwUndefinedRoom()
  peer.subscribe(data.sessionId)

  if (session.sessionStarted) {
    throw new Error('Room is full')
  }

  session.sessionStarted = true

  return { action: 'room-joined', session }
}

const makeMove: IGameAction = (peer, data) => {
  const session = sessions[data.sessionId] ?? throwUndefinedRoom()

  if (session.points.at(-1)?.player === session.currentMove) {
    throw new Error('It is not your turn')
  }

  const { x, y } = data.move

  if (session.points.some(point => point.X === x && point.Y === y)) {
    throw new Error('Point already taken')
  }

  session.points.push({ X: x, Y: y, player: session.currentMove })
  session.winner = defineWinner(session.points, session.fieldRules.pointsInRowToWin)
  session.currentMove = session.currentMove === 'cross' ? 'circle' : 'cross'

  return { action: 'move-made', session }
}

const restart: IGameAction = (peer, data) => {
  const session = sessions[data.sessionId] ?? throwUndefinedRoom()

  session.currentMove = 'cross'
  session.points = []
  session.winner = undefined

  return { action: 'restarted', session }
}

const endSession: IGameAction = (peer, data) => {
  if (!(data.sessionId in sessions)) {
    throwUndefinedRoom()
  }

  delete sessions[data.sessionId]

  return { action: 'session-ended', sessionId: data.sessionId }
}

function throwUndefinedRoom() {
  throw new Error('Room does not exist')
}
