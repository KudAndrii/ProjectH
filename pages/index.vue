<script setup lang="ts">
import type { Point } from '~/shared/types/point'
import type { Player } from '~/shared/types/player'

const currentPlayer = ref<Player>('cross')
const points = reactive<Point[]>([])

const addPoint = (x: number, y: number) => {
  const newPoint: Point = { X: x, Y: y, player: currentPlayer.value }

  if (!points.some(point => point.X === newPoint.X && point.Y === newPoint.Y)) {
    points.push(newPoint)
    currentPlayer.value = currentPlayer.value === 'cross' ? 'circle' : 'cross'
  }
}
</script>

<template>
  <NuxtContainer as="main">
    <TheGamingField :points="points" :dimensions="{ X: 3, Y: 3 }" @add-point="addPoint" />
  </NuxtContainer>
</template>

<style scoped>

</style>
