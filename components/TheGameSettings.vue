<script setup lang="ts">
import type { RadioGroupItem } from '#ui/components/RadioGroup.vue'
import { useGameSettings } from '~/composables/use-game-settings'
import { useGameSSE } from '~/composables/use-game-sse'

const toast = useToast()
const { copy: copyToClipboard, isSupported: clipboardSupported } = useClipboard()
const { gameSettings } = useGameSettings()
const { sessionId, createRoom, joinRoom } = useGameSSE()

const items = ref<RadioGroupItem[]>([
  {
    label: 'Singleplayer',
    value: 'singleplayer',
    description: 'Play game on the same screen with a friend.'
  },
  {
    label: 'Host multiplayer',
    value: 'host-multiplayer',
    description: 'Play multiplayer with a friend by creating a session.'
  },
  {
    label: 'Participate multiplayer',
    value: 'participant-multiplayer',
    description: 'Play multiplayer with a friend by joining a session by code.'
  }
])
</script>

<template>
  <NuxtCard>
    <template #header>
      <h3 class="justify-self-start w-full">
        Game Mode
      </h3>
    </template>
    <NuxtRadioGroup v-model="gameSettings.mode" color="primary" variant="table" default-value="singleplayer" :items="items" />
    <template #footer>
      <NuxtButtonGroup v-if="gameSettings.mode === 'host-multiplayer'">
        <NuxtButton label="Host" @click.stop="createRoom(gameSettings.fieldRules, gameSettings.gameFeatures)" />
        <NuxtInput v-model="sessionId" readonly color="neutral" variant="outline" placeholder="Session ID" />
        <NuxtTooltip v-if="clipboardSupported" text="Copy to clipboard">
          <NuxtButton
              @click.stop="!!sessionId && !!copyToClipboard(sessionId) && toast.add({ title: 'Session ID copied to the clipboard' })"
              color="neutral"
              variant="subtle"
              icon="material-symbols:content-copy"
          />
        </NuxtTooltip>
      </NuxtButtonGroup>
      <NuxtButtonGroup v-else-if="gameSettings.mode === 'participant-multiplayer'">
        <NuxtInput v-model="sessionId" color="neutral" variant="outline" placeholder="Enter a session ID" />
        <NuxtButton label="Join" @click.stop="!!sessionId && joinRoom(sessionId)" />
      </NuxtButtonGroup>
    </template>
  </NuxtCard>

  <NuxtCard class="mt-4">
    <template #header>
      <h3 class="justify-self-start w-full">
        Game Features
      </h3>
    </template>
    <div class="flex flex-col gap-3">
      <NuxtSwitch
          v-model="gameSettings.gameFeatures.infinitePlay"
          unchecked-icon="i-lucide-x"
          checked-icon="i-lucide-check"
          label="Infinite play"
      />
    </div>
  </NuxtCard>

  <NuxtCard class="mt-4">
    <template #header>
      <h3 class="justify-self-start w-full">
        Field Rules
      </h3>
    </template>
    <div class="flex flex-col gap-3">
      <NuxtInputNumber label="Rows" v-model="gameSettings.fieldRules.rows" :min="3" :max="10" disabled />
      <NuxtInputNumber label="Columns" v-model="gameSettings.fieldRules.columns" :min="3" :max="10" disabled />
      <NuxtInputNumber label="Points to win" v-model="gameSettings.fieldRules.pointsInRowToWin" :min="3" :max="10" disabled />
    </div>
  </NuxtCard>
</template>
