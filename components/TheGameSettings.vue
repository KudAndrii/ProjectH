<script setup lang="ts">
import type { GameSettings } from '#shared/types/game-settings'
import type { FieldRules } from '#shared/types/field-rules'
import type { RadioGroupItem } from '#ui/components/RadioGroup.vue'

const props = defineProps<{
  modelValue: GameSettings
}>()

const emit = defineEmits<{
  'update:modelValue': [newValue: GameSettings]
  'on-create-room': [fieldRules: FieldRules]
  'on-join-room': [roomId: string]
}>()

const model = computed({
  get: () => props.modelValue,
  set: (newValue) => emit('update:modelValue', newValue)
})

const { copy: copyToClipboard, isSupported: clipboardSupported } = useClipboard()
const toast = useToast()
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
    <NuxtRadioGroup v-model="model.mode" color="primary" variant="table" default-value="singleplayer" :items="items" />
    <template #footer>
      <NuxtButtonGroup v-if="model.mode === 'host-multiplayer'">
        <NuxtButton label="Host" @click.stop="emit('on-create-room', model.fieldRules)" />
        <NuxtInput v-model="model.roomId" readonly color="neutral" variant="outline" placeholder="Session ID" />
        <NuxtTooltip v-if="clipboardSupported" text="Copy to clipboard">
          <NuxtButton
              @click.stop="!!model.roomId && !!copyToClipboard(model.roomId) && toast.add({ title: 'Session ID copied to the clipboard' })"
              color="neutral"
              variant="subtle"
              icon="material-symbols:content-copy"
          />
        </NuxtTooltip>
      </NuxtButtonGroup>
      <NuxtButtonGroup v-else-if="model.mode === 'participant-multiplayer'">
        <NuxtInput v-model="model.roomId" color="neutral" variant="outline" placeholder="Enter a session ID" />
        <NuxtButton label="Join" @click.stop="!!model.roomId && emit('on-join-room', model.roomId)" />
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
      <NuxtInputNumber label="Rows" v-model="model.fieldRules.rows" />
      <NuxtInputNumber label="Columns" v-model="model.fieldRules.columns" />
      <NuxtInputNumber label="Points to win" v-model="model.fieldRules.pointsInRowToWin" />
    </div>
  </NuxtCard>
</template>
