import Konva from 'konva'

import { getBackgroundItemByChar } from '@/shared/utils/backgroundLookup'

import { createBackgroundItemImage } from './useBackgroundItems'

const CELL_SIZE = 8
const BG_OFFSET_X = 16
const BG_OFFSET_Y = 24

// Words and phrases to randomly print
const WORDS_AND_PHRASES = [
  'HELLO',
  'WORLD',
  'GAME',
  'BASIC',
  'FAMILY',
  'NINTENDO',
  'SPRITE',
  'ANIMATION',
  'TEST',
  'FUN',
  'COOL',
  'AWESOME',
  'GREAT',
  'NICE',
  'HI',
  'BYE',
  'YES',
  'NO',
  'OK',
  'GO',
  'RUN',
  'PLAY',
  'CODE',
  '2024',
  '2025',
  '123',
  'ABC',
  'XYZ',
  'WOW',
  'COOL!',
]

/**
 * Add a random word or phrase as background items at a random position
 */
export async function addRandomBackgroundItem(
  backgroundLayer: Konva.Layer,
  bgCols: number,
  bgRows: number,
  randomBgItemRefs: Array<Konva.Image | Konva.Node>
): Promise<void> {
  // Select a random word/phrase
  const text = WORDS_AND_PHRASES[Math.floor(Math.random() * WORDS_AND_PHRASES.length)]!
  
  // Random starting position within background screen area (28×24 characters)
  const randomRow = Math.floor(Math.random() * bgRows)
  
  // Calculate starting column (ensure the word fits)
  const textLength = text.length
  const maxStartCol = Math.max(0, bgCols - textLength)
  const startCol = Math.floor(Math.random() * (maxStartCol + 1))
  
  // Random color pattern for the entire word/phrase
  const colorPattern = Math.floor(Math.random() * 4)
  const paletteCode = 1
  
  // Print each character in the word/phrase
  for (let i = 0; i < text.length; i++) {
    const char = text[i]!
    const bgItem = getBackgroundItemByChar(char)
    
    // Skip if character not found
    if (!bgItem) continue
    
    // Calculate pixel position with offset
    const col = startCol + i
    const x = BG_OFFSET_X + col * CELL_SIZE
    const y = BG_OFFSET_Y + randomRow * CELL_SIZE
    
    // Create background item image
    const bgImage = await createBackgroundItemImage(bgItem, colorPattern, paletteCode)
    
    // Create Konva image (scale by 2 to match canvas display scale)
    const konvaImage = new Konva.Image({
      x: x * 2,
      y: y * 2,
      image: bgImage,
      scaleX: 2,
      scaleY: 2,
    })
    
    backgroundLayer.add(konvaImage)
    randomBgItemRefs.push(konvaImage)
  }
  
  // Clear cache and redraw background layer to show new items
  backgroundLayer.clearCache()
  backgroundLayer.draw()
}
