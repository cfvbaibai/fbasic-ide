<script setup lang="ts">
import GameIcon from './GameIcon.vue'

interface Props {
  title: string
  subtitle?: string
  description?: string
  icon?: string // Icon name in format "prefix:name" (e.g., "mdi:play")
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  description: '',
  icon: undefined,
})
</script>

<template>
  <div class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">
        <GameIcon v-if="icon" :icon="icon" :size="80" class="hero-icon" />
        {{ title }}
      </h1>
      <p v-if="subtitle" class="hero-subtitle">{{ subtitle }}</p>
      <p v-if="description" class="hero-description">{{ description }}</p>
      <slot />
    </div>
  </div>
</template>

<style scoped>
.hero-section {
  text-align: center;
  padding: 4rem 2rem;
  margin-bottom: 4rem;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
}

.hero-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-size: 3.5rem;
  font-weight: 700;
  font-family: var(--game-font-family-heading);
  color: var(--base-solid-primary);
  text-shadow:
    0 0 20px var(--game-accent-glow),
    0 4px 8px var(--base-alpha-gray-00-80);
  letter-spacing: 3px;
  margin: 0 0 1.5rem;
}

.hero-icon {
  filter: drop-shadow(0 0 12px var(--game-accent-glow));
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--game-text-secondary);
  margin: 0 0 1rem;
  font-weight: 500;
}

.hero-description {
  font-size: 1.1rem;
  color: var(--game-text-tertiary);
  line-height: 1.6;
  margin: 0;
}

/* Responsive design */
@media (width <= 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-icon {
    /* Icon size handled by GameIcon size prop */
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }
}

@media (width <= 480px) {
  .hero-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .hero-icon {
    /* Icon size handled by GameIcon size prop - adjust via size prop if needed */
  }
}
</style>
