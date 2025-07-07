<script setup lang="ts">
import type { Point } from '#shared/types/point'
import { MULTIPLAYER_MODES } from '#shared/utils/constants'
import { makeMove as makeGameMove } from '#shared/utils/make-move'
import { useClientGameSockets } from '~/composables/use-game-sockets.client'
import { useGameSettings } from '~/composables/use-game-settings'
import { useGameState } from '~/composables/use-game-state'
import ThePlayerIcon from '~/components/ThePlayerIcon.vue'
import TheWinnerModal from '~/components/TheWinnerModal.vue'
import TheGameSettings from '~/components/TheGameSettings.vue'

const overlay = useOverlay()
const winnerModal = overlay.create(TheWinnerModal)

const { status, sessionId, session, close, makeMove, restart, endSession } = useClientGameSockets()
const { settingsOpened, gameSettings } = useGameSettings()
const { gameState, resetGameState } = useGameState()
const myTurn = computed(() => gameState.value.currentMove === gameState.value.currentPlayer)
const gameOver = computed(() => !!gameState.value.winner ||
  gameState.value.points.length === gameSettings.value.fieldRules.columns * gameSettings.value.fieldRules.rows)

watch(session, (newValue) => {
  if (!newValue) {
    return
  }

  gameState.value = {
    ...gameState.value,
    currentMove: newValue.currentMove,
    points: newValue.points ?? [],
    winner: newValue.winner
  }

  if (gameOver.value) {
    showTheWinner()
  }
})

const addPoint = async (x: number, y: number) => {
  if (MULTIPLAYER_MODES.includes(gameSettings.value.mode)) {
    if (sessionId.value) {
      try {
        // Make the move via HTTP but wait for the SSE update to actually update the UI
        makeMove(x, y)
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
        await showTheWinner()
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
  let isMultiplayer = MULTIPLAYER_MODES.includes(gameSettings.value.mode)

  if (isMultiplayer) {
    const action = playAgain ? restart : endSession
    action()
    isMultiplayer = playAgain

  }

  resetGameState(isMultiplayer)
}

onUnmounted(close)
</script>

<template>
  <NuxtContainer as="main">
    <NuxtCard variant="outline">
      <template #header>
        <div class="grid grid-cols-3 gap-4 w-full">
          <div
            v-if="MULTIPLAYER_MODES.includes(gameSettings.mode) && status === 'OPEN'"
            class="flex gap-2 items-center"
          >
            <NuxtButtonGroup
              class="justify-self-start"
            >
              <NuxtInput
                :value="sessionId"
                readonly
                color="neutral"
                variant="outline"
                :ui="{ base: 'pl-[160px] w-[240px]', leading: 'pointer-events-none' }"
              >
                <template #leading>
                  <span style="color: var(--ui-primary)">Multiplayer session:</span>
                </template>
              </NuxtInput>
              <NuxtTooltip text="Leave current multiplayer session">
                <NuxtButton
                  @click.stop="() => {endSession(); close()}"
                  color="warning"
                  variant="subtle"
                  icon="material-symbols:googler-travel"
                  class="cursor-pointer"
                />
              </NuxtTooltip>
            </NuxtButtonGroup>
            <NuxtBadge
              size="sm"
              variant="subtle"
              :color="session?.sessionStarted ? 'success' : 'neutral'"
            >{{ session?.sessionStarted ? 'started' : 'waiting' }}
            </NuxtBadge>
          </div>
          <div class="col-start-2 mx-auto flex items-center">
            <span>Current player:</span>
            <ThePlayerIcon :player="gameState.currentPlayer"/>
          </div>
          <NuxtSlideover
            v-model:open="settingsOpened"
            title="Game Settings"
            description="Configure game for yourself."
            class="col-start-3 justify-self-end"
          >
            <NuxtButton
              icon="material-symbols:settings-outline-rounded"
              size="md"
              color="primary"
              variant="solid"
              class="self-end"
            />

            <template #body>
              <TheGameSettings/>
            </template>
          </NuxtSlideover>
        </div>
      </template>
      <TheGamingField
        :points="gameState.points"
        :dimensions="{ X: gameSettings.fieldRules.columns, Y: gameSettings.fieldRules.rows }"
        @add-point="addPoint"
        :class="{ 'pointer-events-none': session?.sessionStarted && !myTurn }"
      />
    </NuxtCard>
  </NuxtContainer>
</template>
