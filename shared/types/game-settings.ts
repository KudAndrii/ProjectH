import type { FieldRules } from '#shared/types/field-rules'

export type GameSettings = {
  mode: 'singleplayer' | 'host-multiplayer' | 'participant-multiplayer'
  fieldRules: FieldRules
  roomId?: string
}
