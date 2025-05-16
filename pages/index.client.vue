<script setup lang="ts">
import type { Point } from '#shared/types/point'
import { MULTIPLAYER_MODES } from '#shared/utils/constants'
import { makeMove as makeGameMove } from '#shared/utils/make-move'
import { useGameSSE } from '~/composables/use-game-sse'
import { useGameSettings } from '~/composables/use-game-settings'
import { useGameState } from '~/composables/use-game-state'
import { useRoomId } from '~/composables/use-room-id'
import ThePlayerIcon from '~/components/ThePlayerIcon.vue'
import TheWinnerModal from '~/components/TheWinnerModal.vue'
import TheGameSettings from '~/components/TheGameSettings.vue'

const overlay = useOverlay()
const winnerModal = overlay.create(TheWinnerModal)

const { close, data, createRoom, joinRoom, makeMove, restart, endSession } =
    useGameSSE()
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

    case 'session-state':
      // Handle initial state from SSE connection
      if (parsed.session) {
        gameState.value.points = [ ...parsed.session.points ]
        gameState.value.currentMove = parsed.session.currentMove
        gameState.value.winner = parsed.session.winner
      }
      break;

    case 'error':
      console.error('Error from the server: ', parsed.message)
      break;

    default:
      console.error('Unknown action', parsed.action)
      break;
  }
})

const addPoint = async (x: number, y: number) => {
  if (MULTIPLAYER_MODES.includes(gameSettings.value.mode)) {
    if (roomId.value) {
      try {
        // Make the move via HTTP, but wait for the SSE update to actually update the UI
        await makeMove(roomId.value, x, y)
        // Note: We don't update the state here directly anymore
        // as the SSE data watcher will handle the update
      } catch (error) {
        console.error('Error making move:', error)
      }
    }
  } else if (gameSettings.value.mode === 'singleplayer') {
    const newPoint: Point = { X: x, Y: y, player: gameState.value.currentPlayer }

    try {
      const moveResults = makeGameMove(newPoint, gameState.value.points, gameSettings.value.gameFeatures,
          gameSettings.value.fieldRules.pointsInRowToWin)

      gameState.value.points = [ ...moveResults.updatedPoints ]
      gameState.value.winner = moveResults.winner
      gameState.value.currentMove = moveResults.nextTurn

      if (gameOver.value) {
        showTheWinner()
        return
      }

      gameState.value.currentPlayer = gameState.value.currentMove
    } catch {
      // just skip in singleplayer
    }
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
                  @on-create-room="(rules, features) => createRoom(rules, features)"
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
