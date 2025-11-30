<template>
  <el-switch
    v-model="isDark"
    :active-icon="Moon"
    :inactive-icon="Sunny"
    @change="handleToggle"
    :title="themeMode === 'auto' ? 'Auto (follows system)' : isDark ? 'Dark mode' : 'Light mode'"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Sunny, Moon } from '@element-plus/icons-vue'
import { useTheme } from '../composables/useTheme'

const { themeMode, isDark, toggleTheme } = useTheme()

const handleToggle = () => {
  toggleTheme()
}
</script>

<style scoped>
/* Theme toggle styles are handled by Element Plus switch component */
</style>

