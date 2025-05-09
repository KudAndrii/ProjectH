<script setup lang="ts">
import type { Point } from '~/shared/types/point'
import type { Player } from '~/shared/types/player'
import { defineWinner } from '~/shared/utils/define-winner'
import ThePlayerIcon from '~/components/ThePlayerIcon.vue'

const currentPlayer = ref<Player>('cross')
const winner = ref<Player | undefined>()
const points = reactive<Point[]>([])

const addPoint = (x: number, y: number) => {
  const newPoint: Point = { X: x, Y: y, player: currentPlayer.value }

  if (points.some(point => point.X === newPoint.X && point.Y === newPoint.Y)) {
    return
  }

  points.push(newPoint)
  winner.value = defineWinner(points, 3)

  if (!!winner.value) {
    return
  }

  currentPlayer.value = currentPlayer.value === 'cross' ? 'circle' : 'cross'
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
          :dimensions="{ X: 3, Y: 3 }"
          @add-point="addPoint"
          :style="{ 'pointer-events': !!winner ? 'none' : 'unset' }"
      />
    </NuxtCard>
  </NuxtContainer>
</template>
