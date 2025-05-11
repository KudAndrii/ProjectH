<script setup lang="ts">
import type { Point } from '~/shared/types/point'
import type { Player } from '~/shared/types/player'
import type { FieldRules } from '#shared/types/field-rules'
import { defineWinner } from '~/shared/utils/define-winner'
import ThePlayerIcon from '~/components/ThePlayerIcon.vue'
import TheWinnerModal from '~/components/TheWinnerModal.vue'
import { useGameSocket } from '~/composables/useGameSocket'

const overlay = useOverlay()
const winnerModal = overlay.create(TheWinnerModal)

const roomId = ref<string | null>(null)
const currentPlayer = ref<Player>('cross')
const myTurn = ref<boolean | undefined>(undefined)
const winner = ref<Player | undefined>()
const points = ref<Point[]>([])
const fieldRules = reactive<FieldRules>({
  columns: 3,
  rows: 3,
  pointsInRowToWin: 3
})

const { data, createRoom, joinRoom, makeMove } = useGameSocket(location.host)

// Reactively handle server data
watch(data, (newData) => {
  const parsed = JSON.parse(newData)
  console.warn('parsed: ', parsed)
  console.warn('currentPlayer: ', currentPlayer.value)

  switch (parsed.action) {
    case 'room-created':
      roomId.value = parsed.sessionId
      currentPlayer.value = 'cross'
      myTurn.value = true
      break;

    case 'room-joined':
      currentPlayer.value = 'circle'
      myTurn.value = false
      fieldRules.columns = parsed.session.fieldRules.columns
      fieldRules.rows = parsed.session.fieldRules.rows
      fieldRules.pointsInRowToWin = parsed.session.fieldRules.pointsInRowToWin
      break;

    case 'move-made':
      myTurn.value = parsed.session.currentMove === currentPlayer.value
      points.value = [...parsed.session.points]
      winner.value = parsed.session.winner
      break;

    case 'error':
      console.error('Error from the server: ', parsed.message)
      break;

    default:
      console.error('Unknown action', parsed.action)
      break;
  }

  console.warn('myTurn: ', myTurn.value)
})

const addPoint = (x: number, y: number) => {
  if (!roomId.value) {
    const newPoint: Point = { X: x, Y: y, player: currentPlayer.value }

    if (points.value.some(point => point.X === newPoint.X && point.Y === newPoint.Y)) {
      return
    }

    points.value = [...points.value, newPoint]
    winner.value = defineWinner(points.value, fieldRules.pointsInRowToWin)

    if (!!winner.value || points.value.length === fieldRules.columns * fieldRules.rows) {
      showTheWinner()
    } else {
      currentPlayer.value = currentPlayer.value === 'cross' ? 'circle' : 'cross'
    }
  } else if (myTurn.value) {
    makeMove(roomId.value, x, y)
  }
}

async function showTheWinner() {
  winnerModal.patch({ winner: winner.value })
  const instance = winnerModal.open()

  // waiting for the modal to close
  await instance.result

  points.value = []
  winner.value = undefined
  currentPlayer.value = 'cross'
}
</script>

<template>
  <NuxtContainer as="main">
    <NuxtCard variant="outline">
      <template #header>
        <div>
          <div class="multiplayer">
            <h2 class="mb-3">
              <span>Multiplayer</span>
              <span v-if="!!roomId">(Room: {{ roomId }})</span>
            </h2>
            <div class="controls">
              <NuxtButton label="Host" @click.stop="() => createRoom(fieldRules)"/>
              <NuxtForm
                  :state="{ roomId }"
                  :validate="validationData => !validationData.roomId?.length ? [{ name: 'roomId', message: 'Required' }] : []"
                  @submit="() => joinRoom(roomId!)"
              >
                <NuxtFormField name="roomId" label="Room ID">
                  <NuxtInput v-model="roomId"/>
                </NuxtFormField>
                <NuxtButton type="submit" label="Join" class="mt-2" loading-auto/>
              </NuxtForm>
            </div>
          </div>
          <div class="text-center mt-6">
            <span>Current player:</span>
            <ThePlayerIcon :player="currentPlayer"/>
          </div>
        </div>
      </template>
      <TheGamingField
          :points="points"
          :dimensions="{ X: fieldRules.columns, Y: fieldRules.rows }"
          @add-point="addPoint"
          :style="{ 'pointer-events': !!winner || !myTurn ? 'none' : 'unset' }"
      />
    </NuxtCard>
  </NuxtContainer>
</template>

<style scoped>
.multiplayer {
  h2 {
    text-align: center;
  }

  .controls {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    justify-content: center;
    align-items: center;
  }
}
</style>
