import type { GameState } from '#shared/types/game-state'

export const useGameState = () => {
  const gameState = useState<GameState>('game-state', () => ({
    currentMove: 'cross',
    currentPlayer: 'cross',
    points: [],
    winner: undefined
  }))

  const resetGameState = (isMultiplayer: boolean) => {
    gameState.value = {
      currentMove: 'cross',
      currentPlayer: isMultiplayer ? gameState.value.currentPlayer : 'cross',
      points: [],
      winner: undefined
    }
  }

  return { gameState, resetGameState }
}
