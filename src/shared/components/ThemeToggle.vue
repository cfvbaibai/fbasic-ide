<template>
  <div class="theme-toggle-wrapper" :title="themeMode === 'auto' ? 'Auto (follows system)' : isDark ? 'Dark mode' : 'Light mode'">
    <GameSwitch v-model="isDark" @update:modelValue="handleToggle" />
    <GameIcon 
      :icon="isDark ? 'mdi:weather-night' : 'mdi:weather-sunny'" 
      size="medium"
      class="theme-icon"
    />
  </div>
</template>

<script setup lang="ts">
import GameSwitch from './ui/GameSwitch.vue'
import GameIcon from './ui/GameIcon.vue'
import { useTheme } from '../composables/useTheme'

const { themeMode, isDark, toggleTheme } = useTheme()

const handleToggle = () => {
  toggleTheme()
}
</script>

<style scoped>
.theme-toggle-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.theme-icon {
  color: var(--game-text-secondary);
  transition: color 0.2s ease;
}

.theme-toggle-wrapper:hover .theme-icon {
  color: var(--game-accent-color);
}
</style>

