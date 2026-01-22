<script setup lang="ts">
import { computed } from 'vue'

/**
 * GameTable component - A styled table component with columns, data, and various display options.
 * 
 * @example
 * ```vue
 * <GameTable
 *   :data="tableData"
 *   :columns="columns"
 *   :stripe="true"
 *   :border="true"
 *   size="medium"
 * />
 * ```
 */
defineOptions({
  name: 'GameTable'
})

interface Column {
  prop: string
  label: string
  width?: string | number
  align?: 'left' | 'center' | 'right'
  formatter?: (row: any, column: Column, cellValue: any) => any
}

interface Props {
  data: any[]
  columns: Column[]
  showHeader?: boolean
  stripe?: boolean
  border?: boolean
  size?: 'small' | 'medium' | 'large'
  highlightRow?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showHeader: true,
  stripe: false,
  border: false,
  size: 'medium',
  highlightRow: true
})

const tableSize = computed(() => {
  const sizeMap = {
    small: '0.75rem',
    medium: '0.875rem',
    large: '1rem'
  }
  return sizeMap[props.size]
})
</script>

<template>
  <div class="game-table-wrapper">
    <table class="game-table" :class="{ 'game-table-stripe': stripe, 'game-table-border': border }">
      <thead v-if="showHeader" class="game-table-header">
        <tr class="game-table-header-row">
          <th
            v-for="column in columns"
            :key="column.prop"
            :class="['game-table-header-cell', `align-${column.align || 'left'}`]"
            :style="{ width: typeof column.width === 'number' ? `${column.width}px` : column.width }"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody class="game-table-body">
        <tr
          v-for="(row, rowIndex) in data"
          :key="rowIndex"
          :class="['game-table-row', { 'game-table-row-highlight': highlightRow }]"
        >
          <td
            v-for="column in columns"
            :key="column.prop"
            :class="['game-table-cell', `align-${column.align || 'left'}`]"
          >
            <slot
              :name="`cell-${column.prop}`"
              :row="row"
              :column="column"
              :value="row[column.prop]"
            >
              {{ column.formatter ? column.formatter(row, column, row[column.prop]) : row[column.prop] }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.game-table-wrapper {
  width: 100%;
  overflow: auto hidden;
  border-radius: 6px;
}

.game-table {
  width: 100%;
  border-collapse: collapse;
  background: transparent;
  font-size: v-bind(tableSize);
}

.game-table-header {
  background: transparent;
}

.game-table-header-row {
  border-bottom: 2px solid var(--game-surface-border);
}

.game-table-header-cell {
  padding: 0.75rem 0.5rem;
  background: linear-gradient(135deg, var(--base-alpha-primary-10) 0%, var(--base-alpha-primary-10) 100%);
  color: var(--base-solid-primary);
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  text-shadow: 0 0 6px var(--game-accent-glow);
  text-align: left;
  transition: all 0.2s ease;
}

.game-table-header-cell.align-center {
  text-align: center;
}

.game-table-header-cell.align-right {
  text-align: right;
}

.game-table-body {
  background: transparent;
}

.game-table-row {
  border-bottom: 1px solid var(--game-surface-border);
  transition: all 0.2s ease;
}

.game-table-row:last-child {
  border-bottom: none;
}

.game-table-row-highlight:hover {
  background: var(--base-alpha-primary-10);
}

.game-table-cell {
  padding: 0.625rem 0.5rem;
  background: transparent;
  color: var(--game-text-primary);
  font-family: var(--game-font-family-mono);
  font-weight: 600;
  text-align: left;
  transition: all 0.2s ease;
}

.game-table-row-highlight:hover .game-table-cell {
  color: var(--base-solid-primary);
  text-shadow: 0 0 6px var(--game-accent-glow);
}

.game-table-cell.align-center {
  text-align: center;
}

.game-table-cell.align-right {
  text-align: right;
}

.game-table-stripe .game-table-row:nth-child(even) {
  background: var(--base-alpha-primary-10);
}

.game-table-border {
  border: 1px solid var(--game-surface-border);
}

.game-table-border .game-table-header-cell:last-child,
.game-table-border .game-table-cell:last-child {
  border-right: none;
}
</style>
