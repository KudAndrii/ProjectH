<script setup lang="ts">
defineProps<{
  message: string
}>()

</script>

<template>
  <NuxtModal
    title="Error"
    :description="message"
    close-icon="material-symbols:cancel-outline-rounded"
    :close="{ color: 'error' }"
  />
</template>