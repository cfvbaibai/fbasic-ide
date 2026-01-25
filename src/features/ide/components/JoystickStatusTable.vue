<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { GameSubBlock, GameTable } from '@/shared/components/ui'

/**
 * JoystickStatusTable component - Displays joystick status in a table format.
 */
defineOptions({
  name: 'JoystickStatusTable'
})

defineProps<Props>()

const { t } = useI18n()

interface StatusRow extends Record<string, unknown> {
  id: number
  stick: number
  strig: number
}

interface Column {
  prop: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  formatter?: (row: Record<string, unknown>, column: Column, cellValue: unknown) => unknown
}

interface Props {
  statusData: StatusRow[]
  flashingCells: Record<string, boolean>
}

const tableColumns: Column[] = [
  {
    prop: 'id',
    label: t('ide.joystick.columns.id'),
    width: 40,
    align: 'center'
  },
  {
    prop: 'stick',
    label: t('ide.joystick.columns.stick'),
    width: 60,
    align: 'center'
  },
  {
    prop: 'strig',
    label: t('ide.joystick.columns.strig'),
    width: 60,
    align: 'center'
  }
]
</script>

<template>
  <GameSubBlock :title="t('ide.joystick.status')">
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
  animation: cell-flash 0.4s ease-in-out infinite;
  transform-origin: center center;
}

@keyframes cell-flash {
  0% {
    color: var(--base-solid-primary);
    text-shadow: 0 0 8px var(--game-accent-glow);
    transform: scale(1.3);
    font-weight: 700;
  }

  50% {
    color: var(--base-solid-primary);
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
