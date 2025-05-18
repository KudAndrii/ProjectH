import type { GameSettings } from '#shared/types/game-settings'

export const useGameSettings = () => {
  const settingsOpened = useState<boolean>('game-settings-opened', () => false)
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

  return { settingsOpened, gameSettings }
}
