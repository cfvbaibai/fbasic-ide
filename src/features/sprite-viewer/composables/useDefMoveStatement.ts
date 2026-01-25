import { computed } from 'vue'

import type { SpriteDefinition } from '@/shared/data/types'

export function useDefMoveStatement(
  selectedSprite: { value: SpriteDefinition | null },
  selectedColorCombination: { value: number }
) {
  const defMoveStatement = computed(() => {
    if (!selectedSprite.value) {
      return ''
    }

    const sprite = selectedSprite.value
    const characterType = sprite.moveCharacterCode
    
    if (characterType === undefined) {
      return `REM Note: "${sprite.name}" does not have a moveCharacterCode defined\nREM DEF MOVE only supports character types 0-15:\nREM 0=Mario, 1=Lady, 2=Fighter Fly, 3=Achilles, 4=Penguin, 5=Fireball,\nREM 6=Car, 7=Spinner, 8=Star Killer, 9=Starship, 10=Explosion,\nREM 11=Smiley, 12=Laser, 13=Shell Creeper, 14=Side Stepper, 15=Nitpicker`
    }

    const colorCombination = selectedColorCombination.value
    const actionNumber = 0 // Default action number
    const direction = 0 // Default: inactive (0 = no movement, 1-8 = directions)
    const speed = 3 // Default speed (1=fastest, 255=slowest)
    const distance = 255 // Default distance (1-255, 0=not displayed)
    const displayPriority = 0 // Default: in front of background (0=front, 1=behind)

    return `DEF MOVE(${actionNumber})=SPRITE(${characterType},${direction},${speed},${distance},${displayPriority},${colorCombination})`
  })

  return {
    defMoveStatement
  }
}

