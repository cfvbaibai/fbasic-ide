<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useSkin } from './shared/composables/useSkin'

/**
 * App component - Root component of the application.
 * Handles locale synchronization with HTML lang attribute.
 * Initializes skin system early.
 */
defineOptions({
  name: 'App',
})

const { locale } = useI18n()

// Initialize skin system early
const { currentSkin: _currentSkin } = useSkin()

// Update HTML lang attribute when locale changes
watch(
  locale,
  newLocale => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLocale
    }
  },
  { immediate: true }
)
</script>

<template>
  <router-view />
</template>

<style>
/* Global styles */
</style>
