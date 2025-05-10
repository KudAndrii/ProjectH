<script setup lang="ts">
import type { Point } from '~/shared/types/point'
import type { Player } from '~/shared/types/player'
import { defineWinner } from '~/shared/utils/define-winner'
import ThePlayerIcon from '~/components/ThePlayerIcon.vue'
import TheWinnerModal from '~/components/TheWinnerModal.vue'

const overlay = useOverlay()
const currentPlayer = ref<Player>('cross')
const winner = ref<Player | undefined>()
const points = reactive<Point[]>([])
const fieldRules = {
  columns: 3,
  rows: 3,
  pointsInRowToWin: 3
}
const winnerModal = overlay.create(TheWinnerModal)

const addPoint = (x: number, y: number) => {
  const newPoint: Point = { X: x, Y: y, player: currentPlayer.value }

  if (points.some(point => point.X === newPoint.X && point.Y === newPoint.Y)) {
    return
  }

  points.push(newPoint)
  winner.value = defineWinner(points, fieldRules.pointsInRowToWin)

  if (!!winner.value || points.length === fieldRules.columns * fieldRules.rows) {
    showTheWinner()
  } else {
    currentPlayer.value = currentPlayer.value === 'cross' ? 'circle' : 'cross'
  }
}

async function showTheWinner() {
  winnerModal.patch({ winner: winner.value })
  const instance = winnerModal.open()

  // waiting for the modal to close
  await instance.result

  points.splice(0, points.length)
  winner.value = undefined
  currentPlayer.value = 'cross'
}
</script>

<template>
  <NuxtContainer as="main">
    <NuxtCard variant="outline">
      <template #header>
        <span>Current player:</span>
        <ThePlayerIcon :player="currentPlayer" />
      </template>
      <TheGamingField
          :points="points"
          :dimensions="{ X: fieldRules.columns, Y: fieldRules.rows }"
          @add-point="addPoint"
          :style="{ 'pointer-events': !!winner ? 'none' : 'unset' }"
      />
    </NuxtCard>
  </NuxtContainer>
</template>
