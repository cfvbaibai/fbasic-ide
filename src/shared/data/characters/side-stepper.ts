import { MoveCharacterCode, type SpriteDefinition } from '@/shared/data/types'

const SPRITE_SIDESTEPPER_1_192 = [
  [0, 0, 3, 3, 0, 0, 0, 0],
  [0, 3, 3, 0, 0, 1, 1, 0],
  [3, 3, 0, 3, 0, 1, 1, 0],
  [3, 3, 0, 3, 0, 1, 2, 0],
  [3, 3, 3, 3, 0, 1, 2, 0],
  [3, 3, 3, 0, 0, 1, 1, 0],
  [3, 3, 0, 0, 0, 0, 3, 0],
  [0, 3, 0, 0, 0, 3, 3, 3],
]

const SPRITE_SIDESTEPPER_1_193 = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 0, 0, 0, 0],
  [1, 1, 0, 0, 1, 1, 0, 0],
  [2, 1, 0, 0, 3, 3, 1, 0],
  [2, 1, 0, 3, 0, 3, 3, 1],
  [1, 1, 0, 3, 3, 0, 3, 1],
  [3, 0, 0, 3, 3, 3, 3, 3],
  [3, 3, 0, 0, 3, 3, 3, 3],
]

const SPRITE_SIDESTEPPER_1_194 = [
  [0, 3, 3, 0, 0, 3, 2, 3],
  [0, 0, 3, 3, 2, 3, 3, 3],
  [0, 0, 0, 0, 2, 3, 3, 3],
  [0, 2, 3, 3, 2, 3, 3, 3],
  [0, 3, 0, 0, 2, 2, 3, 3],
  [0, 3, 0, 3, 0, 2, 2, 2],
  [0, 3, 0, 3, 0, 3, 0, 0],
  [0, 3, 0, 3, 0, 3, 0, 0],
]

const SPRITE_SIDESTEPPER_1_195 = [
  [2, 1, 0, 0, 0, 0, 3, 3],
  [3, 3, 1, 3, 3, 3, 3, 0],
  [3, 3, 3, 0, 0, 0, 0, 0],
  [3, 3, 3, 3, 3, 2, 0, 0],
  [3, 3, 2, 0, 0, 0, 3, 0],
  [2, 2, 0, 3, 3, 0, 3, 0],
  [0, 0, 3, 0, 3, 0, 0, 0],
  [0, 0, 3, 0, 0, 0, 0, 0],
]

const SPRITE_SIDESTEPPER_2_196 = [
  [0, 0, 0, 0, 0, 1, 1, 0],
  [0, 0, 0, 0, 0, 1, 1, 0],
  [0, 0, 3, 3, 0, 1, 2, 0],
  [0, 3, 3, 0, 0, 1, 2, 0],
  [3, 3, 0, 3, 0, 1, 1, 0],
  [3, 3, 0, 3, 0, 0, 3, 0],
  [3, 3, 3, 3, 0, 3, 3, 3],
  [3, 3, 3, 0, 0, 3, 2, 3],
]

const SPRITE_SIDESTEPPER_2_197 = [
  [1, 1, 0, 1, 1, 1, 0, 0],
  [1, 1, 0, 0, 3, 3, 1, 0],
  [2, 1, 0, 3, 0, 3, 1, 0],
  [2, 1, 0, 3, 3, 0, 3, 1],
  [1, 1, 0, 3, 3, 3, 3, 1],
  [3, 0, 0, 0, 3, 3, 3, 3],
  [3, 3, 0, 0, 0, 0, 3, 3],
  [2, 1, 0, 0, 0, 3, 3, 0],
]

const SPRITE_SIDESTEPPER_2_198 = [
  [3, 3, 0, 3, 2, 3, 3, 3],
  [0, 3, 3, 0, 2, 3, 3, 3],
  [0, 0, 2, 3, 2, 3, 3, 3],
  [0, 3, 0, 0, 2, 2, 3, 3],
  [3, 3, 0, 3, 0, 2, 2, 2],
  [3, 0, 3, 0, 3, 0, 0, 0],
  [0, 0, 0, 0, 3, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
]

const SPRITE_SIDESTEPPER_2_199 = [
  [3, 3, 1, 3, 3, 3, 0, 0],
  [3, 3, 3, 0, 0, 0, 0, 0],
  [3, 3, 3, 3, 3, 0, 0, 0],
  [3, 3, 2, 0, 3, 2, 0, 0],
  [2, 2, 0, 3, 0, 3, 0, 0],
  [0, 3, 0, 3, 0, 3, 0, 0],
  [0, 3, 0, 3, 0, 3, 0, 0],
  [3, 0, 0, 3, 0, 3, 0, 0],
]

export const SIDESTEPPER_SPRITES: SpriteDefinition[] = [
  {
    name: 'Side Stepper (1)',
    moveCharacterCode: MoveCharacterCode.SIDE_STEPPER,
    defaultPaletteCode: 2,
    defaultColorCombination: 2,
    charCodes: [192, 193, 194, 195],
    tiles: [SPRITE_SIDESTEPPER_1_192, SPRITE_SIDESTEPPER_1_193, SPRITE_SIDESTEPPER_1_194, SPRITE_SIDESTEPPER_1_195],
  },
  {
    name: 'Side Stepper (2)',
    moveCharacterCode: MoveCharacterCode.SIDE_STEPPER,
    defaultPaletteCode: 2,
    defaultColorCombination: 2,
    charCodes: [188, 189, 190, 191],
    tiles: [SPRITE_SIDESTEPPER_2_196, SPRITE_SIDESTEPPER_2_197, SPRITE_SIDESTEPPER_2_198, SPRITE_SIDESTEPPER_2_199],
  },
]
