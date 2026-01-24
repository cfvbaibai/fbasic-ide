<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'

/**
 * App component - Root component of the application.
 * Handles locale synchronization with HTML lang attribute.
 */
defineOptions({
  name: 'App'
})

const { locale } = useI18n()

// Update HTML lang attribute when locale changes
watch(locale, (newLocale) => {
  if (typeof document !== 'undefined') {
    document.documentElement.lang = newLocale
  }
}, { immediate: true })
</script>

<template>
  <router-view />
</template>

<style>
/* Global styles */
</style>
