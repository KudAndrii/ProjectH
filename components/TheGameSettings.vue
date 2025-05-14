<script setup lang="ts">
import type { FieldRules } from '#shared/types/field-rules'
import { useGameSettings } from '~/composables/use-game-settings'
import { useRoomId } from '~/composables/use-room-id'
import type { RadioGroupItem } from '#ui/components/RadioGroup.vue'

const emit = defineEmits<{
  'on-create-room': [fieldRules: FieldRules]
  'on-join-room': [roomId: string]
}>()

const toast = useToast()
const { copy: copyToClipboard, isSupported: clipboardSupported } = useClipboard()
const { gameSettings } = useGameSettings()
const roomId = useRoomId()

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
        <NuxtButton label="Host" @click.stop="emit('on-create-room', gameSettings.fieldRules)" />
        <NuxtInput v-model="roomId" readonly color="neutral" variant="outline" placeholder="Session ID" />
        <NuxtTooltip v-if="clipboardSupported" text="Copy to clipboard">
          <NuxtButton
              @click.stop="!!roomId && !!copyToClipboard(roomId) && toast.add({ title: 'Session ID copied to the clipboard' })"
              color="neutral"
              variant="subtle"
              icon="material-symbols:content-copy"
          />
        </NuxtTooltip>
      </NuxtButtonGroup>
      <NuxtButtonGroup v-else-if="gameSettings.mode === 'participant-multiplayer'">
        <NuxtInput v-model="roomId" color="neutral" variant="outline" placeholder="Enter a session ID" />
        <NuxtButton label="Join" @click.stop="!!roomId && emit('on-join-room', roomId)" />
      </NuxtButtonGroup>
    </template>
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
