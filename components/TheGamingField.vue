<script setup lang="ts">
import type { Point } from '#shared/types/point'

const props = defineProps<{
  dimensions: { X: number, Y: number }
  points: Point[]
}>()

const emit = defineEmits<{
  'add-point': [ X: number, Y: number ]
}>()

function findPoint(x: number, y: number): Point | undefined {
  return props.points.find(point => point.X === x && point.Y === y)
}
</script>

<template>
  <div class="gaming-field">
    <template v-for="row in dimensions.Y" :key="`field-row-${row}`">
      <template v-for="column in dimensions.X" :key="`field-column-${column}`">
        <div @click.stop="emit('add-point', column, row)" class="cell">
          <Transition name="bounce">
            <ThePlayerIcon
                v-if="findPoint(column, row)"
                :player="findPoint(column, row)!.player"
                width="100%"
                height="100%"
                class="symbol"
            />
          </Transition>
        </div>
      </template>
    </template>
    <NuxtSeparator class="separator h1" orientation="horizontal" type="solid" color="primary" size="xl"/>
    <NuxtSeparator class="separator h2" orientation="horizontal" type="solid" color="primary" size="xl"/>
    <NuxtSeparator class="separator v1" orientation="vertical" type="solid" color="primary" size="xl"/>
    <NuxtSeparator class="separator v2" orientation="vertical" type="solid" color="primary" size="xl"/>
  </div>
</template>

<style scoped>
.bounce-enter-active {
  animation: bounce-in 0.5s;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}

.gaming-field {
  --cell-size: min(25svw, 25svh);

  position: relative;
  display: grid;
  grid-template-columns: repeat(3, var(--cell-size));
  grid-template-rows: repeat(3, var(--cell-size));
  width: max-content;
  height: max-content;
  margin: auto;

  .cell {
    background-color: var(--ui-bg-elevated);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border-radius: 1rem;
    aspect-ratio: 1;
    transition-property: background-color;
    transition-duration: var(--default-transition-duration);
    transition-timing-function: var(--default-transition-timing-function);
    padding: 1rem;

    &:not(:has(.symbol)):hover {
      background-color: var(--ui-bg-accented);
      cursor: pointer;
    }

    .symbol {
      object-fit: contain;
      display: inline-block;
    }
  }

  .separator {
    position: absolute;

    &[data-orientation="horizontal"] {
      transform: translateY(-50%);
    }

    &[data-orientation="vertical"] {
      transform: translateX(-50%);
    }

    &.h1 {
      top: var(--cell-size);
    }

    &.h2 {
      top: calc(var(--cell-size) * 2);
    }

    &.v1 {
      left: var(--cell-size);
    }

    &.v2 {
      left: calc(var(--cell-size) * 2);
    }
  }
}
</style>