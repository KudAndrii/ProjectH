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

    if (Object.values($sessions).filter(x => x.hostId === peer.id).length >= 2) {
      throw new Error('2 or more sessions for the same peer created')
    }

    const sessionId = generateCode()
    peer.subscribe(sessionId)

    $sessions[sessionId] = {
      hostId: peer.id,
      guestId: undefined,
      state: {
        sessionStarted: false,
        fieldRules: data.fieldRules,
        gameFeatures: data.gameFeatures,
        currentMove: 'cross',
        points: [],
        winner: undefined
      }
    }

    return { action: 'room-created', session: { ...$sessions[sessionId].state, sessionId } }
  }

  const joinRoom: IGameAction = (peer, data) => {
    const session = $sessions[data.sessionId] ?? throwUndefinedRoom(data.sessionId)
    peer.subscribe(data.sessionId)

    if (session.state.sessionStarted) {
      console.error('error-details: ', session)
      throw new Error('Room is full')
    }

    session.guestId = peer.id
    session.state.sessionStarted = true

    return { action: 'room-joined', session: { ...session.state, sessionId: data.sessionId } }
  }

  const makeMove: IGameAction = (peer, data) => {
    const session = $sessions[data.sessionId] ?? throwUndefinedRoom(data.sessionId)
    const sessionState = session.state

    const newPoint = { X: data.move.x, Y: data.move.y, player: sessionState.currentMove }
    const moveResults =
      makeGameMove(newPoint, sessionState.points, sessionState.gameFeatures, sessionState.fieldRules.pointsInRowToWin)

    session.state.points = moveResults.updatedPoints
    session.state.winner = moveResults.winner
    session.state.currentMove = moveResults.nextTurn

    return { action: 'move-made', session: { ...session.state, sessionId: data.sessionId} }
  }

  const restart: IGameAction = (peer, data) => {
    const session = $sessions[data.sessionId] ?? throwUndefinedRoom(data.sessionId)

    session.state.currentMove = 'cross'
    session.state.points = []
    session.state.winner = undefined

    return { action: 'restarted', session: { ...session.state, sessionId: data.sessionId} }
  }

  const endSession: IGameAction = (peer, data) => {
    if (data.sessionId in $sessions) {
      delete $sessions[data.sessionId]
    }

    return { action: 'session-ended', session: undefined! }
  }

  const clearSessionsForPeer = (peer: Peer) => {
    try {
      const { $sessions } = useNitroApp()
      const peerSessions = Object.entries($sessions)
        .filter(([_, session]) => session.hostId === peer.id || session.guestId === peer.id)

      //TODO: for those sessions where peer is guest - change state instead of deletion
      for (const [sessionId, _] of peerSessions) {
        delete $sessions[sessionId]
      }
    } catch (error) {
      console.error('Error occurred during clearing sessions for peer: ', peer.id, error)
    }
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
    endSession,
    clearSessionsForPeer
  }
}
