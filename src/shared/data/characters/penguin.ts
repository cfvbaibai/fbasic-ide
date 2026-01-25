import { MoveCharacterCode, type SpriteDefinition } from '@/shared/data/types'

const SPRITE_PENGUIN_LEFTSTEP1_96 = [
  [0, 0, 0, 0, 3, 3, 3, 3],
  [0, 0, 0, 3, 1, 1, 3, 3],
  [0, 0, 0, 1, 1, 1, 1, 3],
  [0, 0, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 0, 1, 1, 1, 1],
  [0, 0, 1, 0, 1, 1, 1, 3],
  [0, 2, 2, 2, 2, 2, 3, 3],
  [2, 2, 2, 2, 2, 2, 2, 3],
]

const SPRITE_PENGUIN_LEFTSTEP1_97 = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0],
  [3, 3, 0, 0, 0, 0, 0, 0],
  [3, 3, 0, 0, 0, 0, 0, 0],
  [3, 3, 3, 0, 0, 0, 0, 0],
  [3, 3, 3, 0, 0, 0, 0, 0],
  [3, 3, 3, 0, 0, 0, 0, 0],
  [3, 3, 3, 3, 0, 0, 0, 0],
]

const SPRITE_PENGUIN_LEFTSTEP1_98 = [
  [0, 0, 1, 2, 2, 2, 1, 3],
  [0, 0, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 2, 2, 2],
  [0, 0, 0, 1, 1, 1, 2, 2],
  [0, 0, 0, 2, 2, 1, 1, 1],
  [0, 2, 2, 2, 2, 2, 2, 0],
]

const SPRITE_PENGUIN_LEFTSTEP1_99 = [
  [3, 3, 3, 3, 3, 3, 3, 0],
  [3, 3, 3, 3, 3, 3, 0, 0],
  [1, 3, 3, 3, 3, 0, 0, 0],
  [1, 3, 3, 3, 0, 0, 0, 0],
  [1, 3, 3, 3, 0, 0, 0, 0],
  [2, 3, 3, 3, 3, 0, 0, 0],
  [2, 2, 3, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

const SPRITE_PENGUIN_LEFTSTEP2_100 = [
  [0, 0, 0, 0, 0, 0, 0, 3],
  [0, 0, 0, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 0, 1, 1, 1],
  [0, 0, 0, 0, 1, 1, 0, 1],
  [0, 0, 0, 0, 1, 0, 1, 1],
  [0, 0, 2, 2, 2, 2, 1, 1],
  [0, 0, 0, 2, 2, 2, 2, 2],
  [0, 0, 0, 0, 2, 2, 2, 2],
]

const SPRITE_PENGUIN_LEFTSTEP2_101 = [
  [3, 3, 0, 0, 0, 0, 0, 0],
  [3, 3, 3, 0, 0, 0, 0, 0],
  [1, 3, 3, 3, 0, 0, 0, 0],
  [1, 1, 3, 3, 0, 0, 0, 0],
  [1, 1, 3, 3, 0, 0, 0, 0],
  [1, 3, 3, 3, 0, 0, 0, 0],
  [3, 3, 3, 3, 0, 0, 0, 0],
  [3, 3, 3, 3, 3, 0, 0, 0],
]

const SPRITE_PENGUIN_LEFTSTEP2_102 = [
  [0, 0, 0, 1, 1, 1, 2, 3],
  [0, 0, 0, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 1, 1, 1, 1, 1],
  [0, 2, 2, 2, 1, 1, 1, 1],
  [0, 0, 2, 2, 2, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 2],
]

const SPRITE_PENGUIN_LEFTSTEP2_103 = [
  [3, 3, 3, 3, 3, 0, 0, 0],
  [3, 3, 3, 3, 3, 3, 0, 0],
  [1, 3, 3, 3, 3, 3, 3, 0],
  [1, 3, 3, 3, 3, 3, 3, 0],
  [1, 3, 3, 3, 0, 0, 0, 0],
  [3, 3, 3, 3, 0, 0, 0, 0],
  [3, 3, 3, 3, 3, 0, 0, 0],
  [2, 2, 2, 3, 0, 0, 0, 0],
]

const SPRITE_PENGUIN_FRONT_104 = [
  [0, 0, 0, 0, 0, 3, 3, 3],
  [0, 0, 0, 0, 3, 3, 3, 3],
  [0, 0, 0, 0, 3, 1, 1, 3],
  [0, 0, 0, 3, 3, 1, 1, 1],
  [0, 0, 0, 3, 1, 1, 0, 1],
  [0, 0, 0, 3, 1, 1, 0, 1],
  [0, 0, 0, 3, 1, 1, 2, 2],
  [0, 0, 3, 3, 2, 2, 2, 2],
]

const SPRITE_PENGUIN_FRONT_105 = [
  [3, 3, 0, 0, 0, 0, 0, 0],
  [3, 3, 3, 0, 0, 0, 0, 0],
  [1, 1, 3, 0, 0, 0, 0, 0],
  [1, 1, 1, 3, 0, 0, 0, 0],
  [0, 1, 1, 3, 0, 0, 0, 0],
  [0, 1, 1, 3, 0, 0, 0, 0],
  [2, 1, 3, 3, 3, 3, 0, 0],
  [2, 2, 2, 3, 3, 3, 3, 0],
]

const SPRITE_PENGUIN_FRONT_106 = [
  [0, 0, 3, 3, 3, 2, 2, 2],
  [0, 3, 3, 3, 3, 1, 1, 1],
  [0, 3, 3, 3, 3, 1, 1, 1],
  [3, 3, 3, 0, 3, 1, 1, 1],
  [0, 0, 0, 0, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 1, 1, 1],
  [0, 0, 0, 2, 2, 2, 2, 1],
  [0, 0, 2, 2, 2, 2, 2, 2],
]

const SPRITE_PENGUIN_FRONT_107 = [
  [2, 2, 3, 3, 3, 3, 3, 3],
  [1, 1, 1, 3, 3, 0, 0, 0],
  [1, 1, 1, 1, 3, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 0, 0],
  [1, 1, 1, 1, 1, 2, 2, 0],
  [1, 1, 1, 2, 2, 2, 0, 0],
  [1, 2, 2, 2, 2, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

const SPRITE_PENGUIN_BACK_108 = [
  [0, 0, 0, 0, 0, 3, 3, 3],
  [0, 0, 0, 0, 3, 3, 3, 3],
  [0, 0, 0, 0, 3, 3, 3, 3],
  [0, 0, 0, 3, 3, 3, 3, 3],
  [0, 0, 0, 3, 3, 3, 3, 3],
  [0, 0, 0, 3, 3, 3, 3, 3],
  [0, 0, 0, 3, 3, 3, 3, 3],
  [0, 0, 3, 3, 3, 3, 3, 3],
]

const SPRITE_PENGUIN_BACK_109 = [
  [3, 3, 0, 0, 0, 0, 0, 0],
  [3, 3, 3, 0, 0, 0, 0, 0],
  [3, 3, 3, 0, 0, 0, 0, 0],
  [3, 3, 3, 3, 0, 0, 0, 0],
  [3, 3, 3, 3, 0, 0, 0, 0],
  [3, 3, 3, 3, 0, 0, 0, 0],
  [3, 3, 3, 3, 3, 3, 0, 0],
  [3, 3, 3, 3, 3, 3, 3, 0],
]

const SPRITE_PENGUIN_BACK_110 = [
  [0, 0, 3, 3, 3, 3, 3, 3],
  [0, 3, 3, 3, 3, 3, 3, 3],
  [0, 3, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 0, 3, 3, 3, 3],
  [0, 0, 0, 0, 3, 3, 3, 3],
  [0, 0, 0, 0, 3, 3, 3, 3],
  [0, 0, 0, 2, 2, 3, 3, 3],
  [0, 0, 2, 2, 2, 2, 2, 0],
]

const SPRITE_PENGUIN_BACK_111 = [
  [3, 3, 3, 3, 3, 3, 3, 3],
  [3, 3, 3, 3, 3, 0, 0, 0],
  [3, 3, 3, 3, 3, 0, 0, 0],
  [3, 3, 3, 3, 3, 0, 0, 0],
  [3, 3, 3, 3, 3, 2, 2, 0],
  [3, 3, 3, 3, 2, 2, 0, 0],
  [3, 3, 2, 2, 2, 0, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0],
]

export const PENGUIN_SPRITES: SpriteDefinition[] = [
  {
    name: 'Penguin (LEFTSTEP1)',
    moveCharacterCode: MoveCharacterCode.PENGUIN,
    defaultPaletteCode: 2,
    defaultColorCombination: 0,
    charCodes: [96, 97, 98, 99],
    tiles: [
      SPRITE_PENGUIN_LEFTSTEP1_96,
      SPRITE_PENGUIN_LEFTSTEP1_97,
      SPRITE_PENGUIN_LEFTSTEP1_98,
      SPRITE_PENGUIN_LEFTSTEP1_99,
    ],
  },
  {
    name: 'Penguin (LEFTSTEP2)',
    moveCharacterCode: MoveCharacterCode.PENGUIN,
    defaultPaletteCode: 2,
    defaultColorCombination: 0,
    charCodes: [100, 101, 102, 103],
    tiles: [
      SPRITE_PENGUIN_LEFTSTEP2_100,
      SPRITE_PENGUIN_LEFTSTEP2_101,
      SPRITE_PENGUIN_LEFTSTEP2_102,
      SPRITE_PENGUIN_LEFTSTEP2_103,
    ],
  },
  {
    name: 'Penguin (FRONT)',
    moveCharacterCode: MoveCharacterCode.PENGUIN,
    defaultPaletteCode: 2,
    defaultColorCombination: 0,
    charCodes: [104, 105, 106, 107],
    tiles: [SPRITE_PENGUIN_FRONT_104, SPRITE_PENGUIN_FRONT_105, SPRITE_PENGUIN_FRONT_106, SPRITE_PENGUIN_FRONT_107],
  },
  {
    name: 'Penguin (BACK)',
    moveCharacterCode: MoveCharacterCode.PENGUIN,
    defaultPaletteCode: 2,
    defaultColorCombination: 0,
    charCodes: [108, 109, 110, 111],
    tiles: [SPRITE_PENGUIN_BACK_108, SPRITE_PENGUIN_BACK_109, SPRITE_PENGUIN_BACK_110, SPRITE_PENGUIN_BACK_111],
  },
]
