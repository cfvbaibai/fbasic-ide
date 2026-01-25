import type { SpriteDefinition } from '@/shared/data/types'

const SPRITE_NUMBER_1_240 = [
  [0, 1, 1, 1, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

const SPRITE_NUMBER_2_241 = [
  [0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0],
  [0, 1, 1, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

const SPRITE_NUMBER_3_242 = [
  [0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 0, 0],
  [0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

const SPRITE_NUMBER_4_243 = [
  [1, 0, 1, 1, 0, 0, 0, 0],
  [1, 0, 1, 1, 0, 0, 0, 0],
  [1, 0, 1, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

export const NUMBER_SPRITES: SpriteDefinition[] = [
  {
    name: 'Number (1)',
    defaultPaletteCode: 0,
    defaultColorCombination: 0,
    charCodes: 240,
    tiles: SPRITE_NUMBER_1_240,
  },
  {
    name: 'Number (2)',
    defaultPaletteCode: 0,
    defaultColorCombination: 0,
    charCodes: 241,
    tiles: SPRITE_NUMBER_2_241,
  },
  {
    name: 'Number (3)',
    defaultPaletteCode: 0,
    defaultColorCombination: 0,
    charCodes: 242,
    tiles: SPRITE_NUMBER_3_242,
  },
  {
    name: 'Number (4)',
    defaultPaletteCode: 0,
    defaultColorCombination: 0,
    charCodes: 243,
    tiles: SPRITE_NUMBER_4_243,
  },
]
