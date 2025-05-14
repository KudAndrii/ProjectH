import type { GameSettings } from '#shared/types/game-settings'

export const useGameSettings = () => {
  const gameSettings = useState<GameSettings>('game-settings', () => ({
    mode: 'singleplayer',
    fieldRules: {
      columns: 3,
      rows: 3,
      pointsInRowToWin: 3
    },
    gameFeatures: {
      infinitePlay: false
    }
  }))

  return { gameSettings }
}
