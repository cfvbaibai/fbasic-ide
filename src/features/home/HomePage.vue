<script setup lang="ts">
import { useRouter } from 'vue-router'
import { GameLayout, HeroSection, GameSection, GameCard, GameBlock } from '../../shared/components/ui'

const router = useRouter()

interface FeatureCard {
  title: string
  description: string
  path: string
  icon: string
  color: string
}

const features: FeatureCard[] = [
  {
    title: 'Family Basic IDE',
    description: 'Write and execute F-BASIC programs with real-time feedback, syntax highlighting, and debugging tools.',
    path: '/ide',
    icon: 'mdi:pencil',
    color: '#00ff88'
  },
  {
    title: 'Monaco Editor',
    description: 'Advanced code editor with IntelliSense, syntax highlighting, and professional development features.',
    path: '/monaco',
    icon: 'mdi:pencil',
    color: '#409eff'
  },
  {
    title: 'Image Analyzer',
    description: 'Analyze and inspect image files with detailed pixel information and color palette extraction.',
    path: '/image-analyzer',
    icon: 'mdi:image',
    color: '#e6a23c'
  },
  {
    title: 'Sprite Viewer',
    description: 'View and explore character sprites with animation controls, palette selection, and display options.',
    path: '/character-sprite-viewer',
    icon: 'mdi:grid',
    color: '#f56c6c'
  }
]

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <GameLayout>
    <div class="home-content">
      <HeroSection
        :title="'F-BASIC Emulator'"
        :subtitle="'A modern web-based IDE for Family Basic programming language'"
        :description="'Experience the authentic F-BASIC development environment with modern web technologies. Write, execute, and debug Family Basic programs in your browser.'"
        icon="mdi:monitor"
      />

      <GameSection title="Features">
        <div class="features-grid">
          <GameCard
            v-for="feature in features"
            :key="feature.path"
            :title="feature.title"
            :description="feature.description"
            :icon="feature.icon"
            :icon-color="feature.color"
            action-text="Explore →"
            @click="navigateTo(feature.path)"
          />
        </div>
      </GameSection>

      <div class="info-section">
        <GameBlock title="About F-BASIC">
          <span class="content">
            Family Basic (F-BASIC) is a programming language for the Family Computer (Famicom).
            This emulator provides a complete development environment to write and execute
            F-BASIC programs with authentic syntax and behavior.
          </span>
        </GameBlock>
        <GameBlock title="Getting Started">
          <span class="content">
            Start by exploring the Family Basic IDE to write your first program.
            Use the navigation bar above to access all available tools and features.
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
@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .home-content {
    padding: 1.5rem;
  }
}
</style>
