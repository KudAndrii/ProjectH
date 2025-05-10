<script setup lang="ts">
import type { Player } from '~/shared/types/player'

defineProps<{
  winner: Player | undefined
}>()
</script>

<template>
  <NuxtModal>
    <template #content>
      <h2>
        <template v-if="!winner">
          Its even
        </template>
        <template v-else>
          <span>And the winner is </span>
          <span :class="winner">{{ winner }}</span>
        </template>
      </h2>
    </template>
  </NuxtModal>
</template>

<style scoped>
h2 {
  font-size: 2rem;

  .cross {
    color: var(--ui-primary);
  }

  .circle {
    color: var(--ui-secondary);
  }
}
</style>