<script setup lang="ts">
import GameIcon from './GameIcon.vue'

interface Props {
  title: string
  subtitle?: string
  description?: string
  icon?: any
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  description: '',
  icon: null
})
</script>

<template>
  <div class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">
        <GameIcon v-if="icon" :icon="icon" size="large" class="hero-icon" />
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
  color: var(--game-accent-color);
  text-shadow: 
    0 0 20px var(--game-accent-glow),
    0 4px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: 3px;
  margin: 0 0 1.5rem 0;
}

.hero-icon {
  font-size: 4rem;
  filter: drop-shadow(0 0 12px var(--game-accent-glow));
}

.hero-subtitle {
  font-size: 1.5rem;
  font-family: var(--game-font-family);
  color: var(--game-text-secondary);
  margin: 0 0 1rem 0;
  font-weight: 500;
}

.hero-description {
  font-size: 1.1rem;
  font-family: var(--game-font-family);
  color: var(--game-text-tertiary);
  line-height: 1.6;
  margin: 0;
}

/* Responsive design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-icon {
    font-size: 3rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .hero-icon {
    font-size: 2.5rem;
  }
}
</style>
