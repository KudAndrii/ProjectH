<script setup lang="ts">
import type { Point } from "#shared/types/point";

const props = defineProps<{
  dimensions: { X: number; Y: number };
  points: Point[];
}>();

const emit = defineEmits<{
  "add-point": [X: number, Y: number];
}>();

function findPoint(x: number, y: number): Point | undefined {
  return props.points.find((point) => point.X === x && point.Y === y);
}

function isEdgeCell(row: number, column: number): boolean {
  return (
    row === 1 ||
    row === props.dimensions.Y ||
    column === 1 ||
    column === props.dimensions.X
  );
}
</script>

<template>
  <div
    class="gaming-field"
    :style="{
      'grid-template-columns': `repeat(${dimensions.X}, var(--cell-size))`,
      'grid-template-rows': `repeat(${dimensions.Y}, var(--cell-size))`,
    }"
  >
    <template v-for="row in dimensions.Y" :key="`field-row-${row}`">
      <template v-for="column in dimensions.X" :key="`field-column-${column}`">
        <div
          @click.stop="emit('add-point', column, row)"
          class="cell"
          :class="{ 'edge-cell': isEdgeCell(row, column) }"
        >
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
    <template v-for="row in dimensions.Y - 1" :key="`separator-h-${row}`">
      <NuxtSeparator
        class="separator"
        :style="{ top: `calc(var(--cell-size) * ${row})` }"
        orientation="horizontal"
        type="solid"
        color="primary"
        size="xl"
      />
    </template>
    <template v-for="column in dimensions.X - 1" :key="`separator-v-${column}`">
      <NuxtSeparator
        class="separator"
        :style="{ left: `calc(var(--cell-size) * ${column})` }"
        orientation="vertical"
        type="solid"
        color="primary"
        size="xl"
      />
    </template>
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

  width: max-content;
  height: max-content;
  margin: auto;

  .cell {
    background-color: var(--ui-bg-elevated);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    aspect-ratio: 1;
    transition-property: background-color;
    transition-duration: var(--default-transition-duration);
    transition-timing-function: var(--default-transition-timing-function);
    padding: 1rem;

    &.edge-cell {
      border-radius: 1rem;
    }

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
  }
}
</style>
