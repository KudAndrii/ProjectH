<script setup lang="ts">
import type { Player } from '#shared/types/player'

defineProps<{
  winner: Player | undefined
}>()

const emit = defineEmits<{ close: [boolean] }>()
</script>

<template>
  <NuxtModal
      title="Game over"
      description="Click 'Again' if you want to play again or close modal if you wanna leave."
      close-icon="material-symbols:arrow-forward-rounded"
      :close="{ onClick: () => emit('close', false) }"
  >
    <template #body>
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
    <template #footer>
      <NuxtButton label="Again" @click="emit('close', true)" />
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