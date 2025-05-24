<script setup lang="ts">
import type { Player } from '#shared/types/player'
import { MULTIPLAYER_MODES } from '#shared/utils/constants'

defineProps<{
  winner: Player | undefined
}>()

const emit = defineEmits<{ close: [boolean] }>()
const { gameSettings } = useGameSettings()
</script>

<template>
  <NuxtModal
      title="Game over"
      description="Click 'Again' if you want to keep the session, or leave to start a new one."
      close-icon="material-symbols:cancel-outline-rounded"
      :dismissible="MULTIPLAYER_MODES.includes(gameSettings.mode)"
      :close="{ color: 'error', onClick: () => emit('close', false) }"
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
      <NuxtButton label="Leave" color="error" variant="subtle" @click="emit('close', false)" />
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