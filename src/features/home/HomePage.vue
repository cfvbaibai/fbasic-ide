<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { GameLayout, HeroSection, GameSection, GameCard, GameBlock } from '../../shared/components/ui'

const router = useRouter()
const { t } = useI18n()

interface FeatureCard {
  title: string
  description: string
  path: string
  icon: string
  color: string
}

const features = computed<FeatureCard[]>(() => [
  {
    title: t('home.features.items.ide.title'),
    description: t('home.features.items.ide.description'),
    path: '/ide',
    icon: 'mdi:pencil',
    color: 'var(--semantic-solid-success)'
  },
  {
    title: t('home.features.items.monaco.title'),
    description: t('home.features.items.monaco.description'),
    path: '/monaco',
    icon: 'mdi:pencil',
    color: 'var(--semantic-solid-info)'
  },
  {
    title: t('home.features.items.imageAnalyzer.title'),
    description: t('home.features.items.imageAnalyzer.description'),
    path: '/image-analyzer',
    icon: 'mdi:image',
    color: 'var(--semantic-solid-warning)'
  },
  {
    title: t('home.features.items.spriteViewer.title'),
    description: t('home.features.items.spriteViewer.description'),
    path: '/character-sprite-viewer',
    icon: 'mdi:grid',
    color: 'var(--semantic-solid-danger)'
  }
])

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <GameLayout>
    <div class="home-content">
      <HeroSection
        :title="t('home.hero.title')"
        :subtitle="t('home.hero.subtitle')"
        :description="t('home.hero.description')"
        icon="mdi:monitor"
      />

      <GameSection :title="t('home.features.title')">
        <div class="features-grid">
          <GameCard
            v-for="feature in features"
            :key="feature.path"
            :title="feature.title"
            :description="feature.description"
            :icon="feature.icon"
            :icon-color="feature.color"
            :action-text="t('home.features.actionText')"
            @click="navigateTo(feature.path)"
          />
        </div>
      </GameSection>

      <div class="info-section">
        <GameBlock :title="t('home.about.title')">
          <span class="content">
            {{ t('home.about.content') }}
          </span>
        </GameBlock>
        <GameBlock :title="t('home.gettingStarted.title')">
          <span class="content">
            {{ t('home.gettingStarted.content') }}
          </span>
        </GameBlock>
      </div>
    </div>
  </GameLayout>
</template>

<style scoped>
.home-content {
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 2rem;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.info-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 4rem;
}

.info-section .content {
  color: var(--game-text-secondary);
  line-height: 1.6;
}

/* Responsive design */
@media (width <= 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .home-content {
    padding: 1.5rem;
  }
}
</style>
