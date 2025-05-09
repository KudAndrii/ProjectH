<script setup lang="ts">
import type { Player } from '~/shared/types/player'

defineProps<{
  player: Player
  width?: string
  height?: string
}>()
</script>

<template>
  <Icon
      :name="player === 'cross' ? 'material-symbols:close-rounded' : 'material-symbols:circle-outline'"
      :class="player"
      :style="{ width, height }"
  />
</template>

<style scoped>
.cross {
  background-color: var(--ui-primary);
  transform: scale(1.1);
}

.circle {
  background-color: var(--ui-secondary);
  transform: scale(0.9);
}
</style>