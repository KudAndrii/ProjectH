import type { Peer } from 'crossws'
import { makeMove as makeGameMove } from '#shared/utils/make-move'
import { generateCode } from '#shared/utils/generate-code'
import type { GameSession } from '#shared/types/game-session'

export type ActionResult = {
  action: 'room-created' | 'room-joined' | 'move-made' | 'restarted' | 'session-ended'
  session: GameSession & { sessionId: string }
}

interface IGameAction {
  (peer: Peer, data: any): ActionResult
}

export const useServerGameSockets = () => {
  const { $sessions } = useNitroApp()

  const createRoom: IGameAction = (peer, data) => {
    const sessionIds = Object.keys($sessions)
    const sessionsCount: number = sessionIds.length
    const config = useRuntimeConfig()

    if (sessionsCount >= config.sessionsLimit) {
      console.error('error-details: ', { sessionsCount, sessionsLimit: config.sessionsLimit, sessionIds })
      throw new Error('Server is full, try again later')
    }

    const sessionId = generateCode()
    peer.subscribe(sessionId)

    $sessions[sessionId] = {
      sessionStarted: false,
      fieldRules: data.fieldRules,
      gameFeatures: data.gameFeatures,
      currentMove: 'cross',
      points: [],
      winner: undefined
    }

    return { action: 'room-created', session: { ...$sessions[sessionId], sessionId } }
  }

  const joinRoom: IGameAction = (peer, data) => {
    const session = $sessions[data.sessionId] ?? throwUndefinedRoom(data.sessionId)
    peer.subscribe(data.sessionId)

    if (session.sessionStarted) {
      console.error('error-details: ', session)
      throw new Error('Room is full')
    }

    session.sessionStarted = true

    return { action: 'room-joined', session: { ...session, sessionId: data.sessionId } }
  }

  const makeMove: IGameAction = (peer, data) => {
    const session = $sessions[data.sessionId] ?? throwUndefinedRoom(data.sessionId)

    const newPoint = { X: data.move.x, Y: data.move.y, player: session.currentMove }
    const moveResults =
      makeGameMove(newPoint, session.points, session.gameFeatures, session.fieldRules.pointsInRowToWin)

    session.points = moveResults.updatedPoints
    session.winner = moveResults.winner
    session.currentMove = moveResults.nextTurn

    return { action: 'move-made', session: { ...session, sessionId: data.sessionId} }
  }

  const restart: IGameAction = (peer, data) => {
    const session = $sessions[data.sessionId] ?? throwUndefinedRoom(data.sessionId)

    session.currentMove = 'cross'
    session.points = []
    session.winner = undefined

    return { action: 'restarted', session: { ...session, sessionId: data.sessionId} }
  }

  const endSession: IGameAction = (peer, data) => {
    if (data.sessionId in $sessions) {
      delete $sessions[data.sessionId]
    }

    return { action: 'session-ended', session: undefined! }
  }

  function throwUndefinedRoom(id: string) {
    console.error('error-details: ', { sessionId: id, $sessions })
    throw new Error('Room does not exist')
  }

  return {
    createRoom,
    joinRoom,
    makeMove,
    restart,
    endSession
  }
}
