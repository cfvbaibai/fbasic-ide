import { ref, watch, onUnmounted } from 'vue'

export function useSpriteAnimation(selectedIndex: { value: number }) {
  const isAnimating = ref<boolean>(false)
  let animationInterval: number | null = null

  // Mario walk sprite indices - sequence: WALK1 → WALK2 → WALK3
  const marioWalkIndices = [0, 1, 2] // WALK1, WALK2, WALK3
  let currentWalkIndex = 0

  // Toggle animation
  const toggleAnimation = () => {
    if (isAnimating.value) {
      // Stop animation
      if (animationInterval !== null) {
        clearInterval(animationInterval)
        animationInterval = null
      }
      isAnimating.value = false
    } else {
      // Start animation
      isAnimating.value = true
      currentWalkIndex = 0
      selectedIndex.value = marioWalkIndices[currentWalkIndex] ?? 0
      
      animationInterval = window.setInterval(() => {
        currentWalkIndex = (currentWalkIndex + 1) % marioWalkIndices.length
        const nextIndex = marioWalkIndices[currentWalkIndex]
        if (nextIndex !== undefined) {
          selectedIndex.value = nextIndex
        }
      }, 150) // Change sprite every 150ms
    }
  }

  // Stop animation if user manually changes sprite selection
  watch(selectedIndex, (newIndex) => {
    if (isAnimating.value && !marioWalkIndices.includes(newIndex.value)) {
      // User manually selected a different sprite, stop animation
      if (animationInterval !== null) {
        clearInterval(animationInterval)
        animationInterval = null
      }
      isAnimating.value = false
    }
  })

  // Clean up interval on unmount
  onUnmounted(() => {
    if (animationInterval !== null) {
      clearInterval(animationInterval)
    }
  })

  return {
    isAnimating,
    toggleAnimation
  }
}

