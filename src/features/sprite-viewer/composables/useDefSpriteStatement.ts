import { computed } from 'vue'
import type { SpriteDefinition } from '@/shared/data/characters/types'
import { isEightTileSprite, isFourTileSprite, isSixTileSprite, isOneTileSprite } from '@/shared/data/characters/types'

export function useDefSpriteStatement(
  selectedSprite: { value: SpriteDefinition | null },
  selectedColorCombination: { value: number },
  reverseX: { value: boolean } | (() => boolean),
  reverseY: { value: boolean } | (() => boolean)
) {
  const getReverseX = () => typeof reverseX === 'function' ? reverseX() : reverseX.value
  const getReverseY = () => typeof reverseY === 'function' ? reverseY() : reverseY.value
  const defSpriteStatement = computed(() => {
    if (!selectedSprite.value) {
      return ''
    }

    const sprite = selectedSprite.value
    const colorCombination = selectedColorCombination.value
    const xInversion = getReverseX() ? 1 : 0
    const yInversion = getReverseY() ? 1 : 0
    const displayPriority = 0 // Default to 0 (in front of background)

    // Generate character set string
    let charSet = ''
    
    if (isOneTileSprite(sprite)) {
      // B=0: 1 character (8x8)
      const charCode = sprite.charCodes
      charSet = `CHR$(${charCode})`
    } else if (isFourTileSprite(sprite)) {
      // B=1: 4 characters (16x16)
      const [c0, c1, c2, c3] = sprite.charCodes
      
      // When X is inverted, swap left and right columns
      // When Y is inverted, swap top and bottom rows
      let codes: [number, number, number, number]
      if (xInversion && yInversion) {
        // Both inverted: swap both rows and columns
        codes = [c3, c2, c1, c0]
      } else if (xInversion) {
        // X inverted: swap left-right
        codes = [c1, c0, c3, c2]
      } else if (yInversion) {
        // Y inverted: swap top-bottom
        codes = [c2, c3, c0, c1]
      } else {
        codes = [c0, c1, c2, c3]
      }
      
      charSet = `CHR$(${codes[0]})+CHR$(${codes[1]})+CHR$(${codes[2]})+CHR$(${codes[3]})`
    } else if (isSixTileSprite(sprite)) {
      // 6-tile sprites (48x8): Use multiple DEF SPRITE statements with B=0
      // Layout: 6 tiles in a single row [0] [1] [2] [3] [4] [5]
      // Each tile is 8x8, so we need 6 separate DEF SPRITE statements
      const codes = sprite.charCodes
      const statements: string[] = []
      
      // Handle inversions: for X inversion, reverse the order; for Y inversion, each tile is flipped
      let orderedCodes = [...codes]
      if (xInversion) {
        orderedCodes = orderedCodes.reverse()
      }
      
      for (let i = 0; i < 6; i++) {
        const charCode = orderedCodes[i]
        const yInv = yInversion ? 1 : 0 // Y inversion applies to each individual tile
        statements.push(`DEF SPRITE ${i},(${colorCombination},0,${displayPriority},0,${yInv})=CHR$(${charCode})`)
      }
      
      // Generate SPRITE commands to position them side-by-side
      // Each tile is 8 pixels wide, so position at x, x+8, x+16, x+24, x+32, x+40
      const spriteCommands: string[] = []
      const baseX = 100 // Example X coordinate
      const baseY = 100 // Example Y coordinate
      for (let i = 0; i < 6; i++) {
        spriteCommands.push(`SPRITE ${i},${baseX + i * 8},${baseY}`)
      }
      
      return (
        `REM 6-tile sprite (48x8): Requires 6 separate DEF SPRITE statements\n` +
        `${statements.join('\n')}\n` +
        `REM Position sprites side-by-side:\n` +
        `${spriteCommands.join('\n')}`
      )
    } else if (isEightTileSprite(sprite)) {
      // 8-tile sprites (16x32): Use 2 DEF SPRITE statements with B=1 (each 16x16)
      // Layout: 2 columns × 4 rows
      // [0] [1]
      // [2] [3]
      // [4] [5]
      // [6] [7]
      const codes = sprite.charCodes
      
      // Top 16x16 block: tiles 0, 1, 2, 3
      let topCodes: [number, number, number, number]
      // Bottom 16x16 block: tiles 4, 5, 6, 7
      let bottomCodes: [number, number, number, number]
      
      if (xInversion && yInversion) {
        // Both inverted: swap both rows and columns
        topCodes = [codes[3], codes[2], codes[1], codes[0]]
        bottomCodes = [codes[7], codes[6], codes[5], codes[4]]
      } else if (xInversion) {
        // X inverted: swap left-right in each row
        topCodes = [codes[1], codes[0], codes[3], codes[2]]
        bottomCodes = [codes[5], codes[4], codes[7], codes[6]]
      } else if (yInversion) {
        // Y inverted: swap top-bottom
        topCodes = [codes[2], codes[3], codes[0], codes[1]]
        bottomCodes = [codes[6], codes[7], codes[4], codes[5]]
      } else {
        topCodes = [codes[0], codes[1], codes[2], codes[3]]
        bottomCodes = [codes[4], codes[5], codes[6], codes[7]]
      }
      
      const topCharSet = `CHR$(${topCodes[0]})+CHR$(${topCodes[1]})+CHR$(${topCodes[2]})+CHR$(${topCodes[3]})`
      const bottomCharSet = `CHR$(${bottomCodes[0]})+CHR$(${bottomCodes[1]})+CHR$(${bottomCodes[2]})+CHR$(${bottomCodes[3]})`
      
      const baseX = 100 // Example X coordinate
      const baseY = 100 // Example Y coordinate
      
      return (
        `REM 8-tile sprite (16x32): Requires 2 DEF SPRITE statements with B=1\n` +
        `DEF SPRITE 0,(${colorCombination},1,${displayPriority},${xInversion},0)=${topCharSet}\n` + 
        `DEF SPRITE 1,(${colorCombination},1,${displayPriority},${xInversion},0)=${bottomCharSet}\n` + 
        `REM Position sprites vertically:\n` + 
        `SPRITE 0,${baseX},${baseY}\n` + 
        `SPRITE 1,${baseX},${baseY + 16}`
      )
    }

    // Determine B parameter (character construction pattern)
    const constructionPattern = isOneTileSprite(sprite) ? 0 : 1

    return `DEF SPRITE 0,(${colorCombination},${constructionPattern},${displayPriority},${xInversion},${yInversion})=${charSet}`
  })

  return {
    defSpriteStatement
  }
}

