<script setup lang="ts">
import type { Point } from '#shared/types/point'
import { defineWinner } from '#shared/utils/define-winner'
import { MULTIPLAYER_MODES } from '#shared/utils/constants'
import { useGameSocket } from '~/composables/use-game-socket'
import { useGameSettings } from '~/composables/use-game-settings'
import { useGameState } from '~/composables/use-game-state'
import { useRoomId } from '~/composables/use-room-id'
import ThePlayerIcon from '~/components/ThePlayerIcon.vue'
import TheWinnerModal from '~/components/TheWinnerModal.vue'
import TheGameSettings from '~/components/TheGameSettings.vue'

const overlay = useOverlay()
const winnerModal = overlay.create(TheWinnerModal)

const { close, data, createRoom, joinRoom, makeMove, restart, endSession } =
    useGameSocket(location.protocol, location.host)
const { gameSettings } = useGameSettings()
const { gameState, resetGameState } = useGameState()
const roomId = useRoomId()
const settingsOpened = ref(false)

const myTurn = computed(() => gameState.value.currentMove === gameState.value.currentPlayer)
const gameOver = computed(() => !!gameState.value.winner ||
    gameState.value.points.length === gameSettings.value.fieldRules.columns * gameSettings.value.fieldRules.rows)

watch(gameSettings, (newValue) => {
  if (newValue.mode === 'singleplayer') {
    close()
  }
})

watch(data, (newValue) => {
  if (!newValue) {
    return
  }

  const parsed = JSON.parse(newValue)

  switch (parsed.action) {
    case 'room-created':
      roomId.value = parsed.sessionId
      gameState.value.currentPlayer = 'cross'
      break;

    case 'room-joined':
      gameState.value.currentPlayer = 'circle'
      settingsOpened.value = false
      break;

    case 'move-made':
      gameState.value.points = [ ...parsed.session.points ]
      gameState.value.currentMove = parsed.session.currentMove
      gameState.value.winner = parsed.session.winner

      if (gameOver.value) {
        showTheWinner()
      }
      break;

    case 'restarted':
      gameState.value.points = [ ...parsed.session.points ]
      gameState.value.currentMove = parsed.session.currentMove
      gameState.value.winner = parsed.session.winner
      break

    case 'session-ended':
      gameSettings.value.mode = 'singleplayer'
      roomId.value = undefined
      resetGameState(false)
      break;

    case 'error':
      console.error('Error from the server: ', parsed.message)
      break;

    default:
      console.error('Unknown action', parsed.action)
      break;
  }
})

const addPoint = (x: number, y: number) => {
  if (MULTIPLAYER_MODES.includes(gameSettings.value.mode)) {
    !!roomId.value && makeMove(roomId.value, x, y)
  } else if (gameSettings.value.mode === 'singleplayer') {
    const newPoint: Point = { X: x, Y: y, player: gameState.value.currentPlayer }

    if (gameState.value.points.some(point => point.X === newPoint.X && point.Y === newPoint.Y)) {
      return
    }

    gameState.value.points = [ ...gameState.value.points, newPoint ]
    gameState.value.winner = defineWinner(gameState.value.points, gameSettings.value.fieldRules.pointsInRowToWin)

    if (gameOver.value) {
      showTheWinner()
      return
    }

    gameState.value.currentPlayer = gameState.value.currentPlayer === 'cross' ? 'circle' : 'cross'
    gameState.value.currentMove = gameState.value.currentPlayer
  }
}

async function showTheWinner() {
  winnerModal.patch({ winner: gameState.value.winner })
  const instance = winnerModal.open()

  // waiting for the modal to close
  const playAgain = await instance.result
  const isMultiplayer = MULTIPLAYER_MODES.includes(gameSettings.value.mode)

  resetGameState(isMultiplayer)

  if (!playAgain) {
    !!roomId.value && endSession(roomId.value)
  } else {
    !!roomId.value && restart(roomId.value)
  }
}
</script>

<template>
  <NuxtContainer as="main">
    <NuxtCard variant="outline">
      <template #header>
        <div class="flex justify-between w-full">
          <div class="self-center mx-auto flex items-center">
            <span>Current player:</span>
            <ThePlayerIcon :player="gameState.currentPlayer"/>
          </div>
          <NuxtSlideover
              v-model:open="settingsOpened"
              title="Game Settings"
              description="Configure game for yourself."
          >
            <NuxtButton
                icon="material-symbols:settings-outline-rounded"
                size="md"
                color="primary"
                variant="solid"
                class="self-end"
            />

            <template #body>
              <TheGameSettings
                  @on-create-room="(rules) => createRoom(rules)"
                  @on-join-room="(id) => joinRoom(id)"
              />
            </template>
          </NuxtSlideover>
        </div>
      </template>
      <TheGamingField
          :points="gameState.points"
          :dimensions="{ X: gameSettings.fieldRules.columns, Y: gameSettings.fieldRules.rows }"
          @add-point="addPoint"
          :class="{ 'pointer-events-none': !myTurn }"
      />
    </NuxtCard>
  </NuxtContainer>
</template>
