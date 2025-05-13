<script setup lang="ts">
import type { Point } from '#shared/types/point'
import type { Player } from '#shared/types/player'
import type { GameSettings } from '#shared/types/game-settings'
import { defineWinner } from '#shared/utils/define-winner'
import { useGameSocket } from '~/composables/useGameSocket'
import ThePlayerIcon from '~/components/ThePlayerIcon.vue'
import TheWinnerModal from '~/components/TheWinnerModal.vue'
import TheGameSettings from '~/components/TheGameSettings.vue'

const overlay = useOverlay()
const winnerModal = overlay.create(TheWinnerModal)

const settingsOpened = ref(false)
const gameSettings = reactive<GameSettings>({
  mode: 'singleplayer',
  fieldRules: {
    columns: 3,
    rows: 3,
    pointsInRowToWin: 3
  }
})

const currentPlayer = ref<Player>('cross')
const myTurn = ref<boolean>(true)
const winner = ref<Player | undefined>()
const points = ref<Point[]>([])

const { close, data, createRoom, joinRoom, makeMove } = useGameSocket(location.protocol, location.host)

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
      gameSettings.roomId = parsed.sessionId
      currentPlayer.value = 'cross'
      myTurn.value = true
      break;

    case 'room-joined':
      currentPlayer.value = 'circle'
      myTurn.value = false
      settingsOpened.value = false
      break;

    case 'move-made':
      myTurn.value = parsed.session.currentMove === currentPlayer.value
      points.value = [...parsed.session.points]
      winner.value = parsed.session.winner

      if (gameOver.value) {
        showTheWinner()
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

const gameOver = computed(() =>
    !!winner.value || points.value.length === gameSettings.fieldRules.columns * gameSettings.fieldRules.rows)

const addPoint = (x: number, y: number) => {
  if (gameSettings.mode === 'singleplayer') {
    const newPoint: Point = { X: x, Y: y, player: currentPlayer.value }

    if (points.value.some(point => point.X === newPoint.X && point.Y === newPoint.Y)) {
      return
    }

    points.value = [...points.value, newPoint]
    winner.value = defineWinner(points.value, gameSettings.fieldRules.pointsInRowToWin)

    if (gameOver.value) {
      showTheWinner()
    } else {
      currentPlayer.value = currentPlayer.value === 'cross' ? 'circle' : 'cross'
    }
  } else if (gameSettings.mode === 'host-multiplayer' || gameSettings.mode === 'participant-multiplayer') {
    makeMove(gameSettings.roomId!, x, y)
  }
}

async function showTheWinner() {
  winnerModal.patch({ winner: winner.value })
  const instance = winnerModal.open()

  console.warn('Waiting for the modal to close')
  // waiting for the modal to close
  await instance.result
  console.warn('The modal is closed')

  points.value = []
  winner.value = undefined
  gameSettings.mode = 'singleplayer'
  gameSettings.roomId = undefined
  currentPlayer.value = 'cross'
}
</script>

<template>
  <NuxtContainer as="main">
    <NuxtCard variant="outline">
      <template #header>
        <div class="flex justify-between w-full">
          <div class="self-center mx-auto flex items-center">
            <span>Current player:</span>
            <ThePlayerIcon :player="currentPlayer"/>
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
                  v-model="gameSettings"
                  @on-create-room="(rules) => createRoom(rules)"
                  @on-join-room="(id) => joinRoom(id)"
              />
            </template>
          </NuxtSlideover>
        </div>
      </template>
      <TheGamingField
          :points="points"
          :dimensions="{ X: gameSettings.fieldRules.columns, Y: gameSettings.fieldRules.rows }"
          @add-point="addPoint"
          :style="{ 'pointer-events': !!winner || !myTurn ? 'none' : 'unset' }"
      />
    </NuxtCard>
  </NuxtContainer>
</template>
