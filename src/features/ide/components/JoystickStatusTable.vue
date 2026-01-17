<template>
  <GameSubBlock title="Joystick Status">
    <GameTable 
      :data="statusData" 
      :columns="tableColumns"
      size="small"
      :show-header="true"
      :border="false"
      :stripe="false"
      :highlight-row="true"
    >
      <template #cell-id="{ row }">
        <span class="cell-id text-game-accent">{{ row.id }}</span>
      </template>
      <template #cell-stick="{ row }">
        <span class="cell-wrapper">
          <span :class="{ 'flashing-cell': flashingCells[`stick-${row.id}`] }">
            {{ row.stick }}
          </span>
        </span>
      </template>
      <template #cell-strig="{ row }">
        <span class="cell-wrapper">
          <span :class="{ 'flashing-cell': flashingCells[`strig-${row.id}`] }">
            {{ row.strig }}
          </span>
        </span>
      </template>
    </GameTable>
  </GameSubBlock>
</template>

<script setup lang="ts">
import { GameTable, GameSubBlock } from '../../../shared/components/ui'

interface Column {
  prop: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  formatter?: (row: any, column: Column, cellValue: any) => any
}

interface StatusRow {
  id: number
  stick: number
  strig: number
}

interface Props {
  statusData: StatusRow[]
  flashingCells: Record<string, boolean>
}

defineProps<Props>()

const tableColumns: Column[] = [
  {
    prop: 'id',
    label: 'ID',
    width: 40,
    align: 'center'
  },
  {
    prop: 'stick',
    label: 'STICK',
    width: 60,
    align: 'center'
  },
  {
    prop: 'strig',
    label: 'STRIG',
    width: 60,
    align: 'center'
  }
]
</script>

<style scoped>
.cell-wrapper {
  display: inline-block;
  height: 1.2em;
  line-height: 1.2em;
  overflow: visible;
  vertical-align: middle;
}

.flashing-cell {
  display: inline-block;
  animation: cellFlash 0.4s ease-in-out infinite;
  transform-origin: center center;
}

@keyframes cellFlash {
  0% {
    color: var(--game-accent-color);
    text-shadow: 0 0 8px var(--game-accent-glow);
    transform: scale(1.3);
    font-weight: 700;
  }
  50% {
    color: var(--game-accent-color);
    text-shadow: 0 0 16px var(--game-accent-glow);
    transform: scale(4);
    font-weight: 700;
  }
  100% {
    color: var(--game-text-primary);
    text-shadow: none;
    transform: scale(1);
    font-weight: normal;
  }
}
</style>
