import { MoveCharacterCode, type SpriteDefinition } from "./types"

const SPRITE_NITPICKER_1_200 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,1,1],
  [0,0,0,0,3,3,1,0],
  [0,0,0,2,2,3,1,0],
  [0,0,2,2,0,2,1,0],
  [0,2,2,2,2,2,3,1]
]

const SPRITE_NITPICKER_1_201 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [1,0,0,0,0,0,0,0],
  [1,1,0,0,0,0,0,0],
  [1,1,3,3,0,0,0,0],
  [1,1,3,3,3,3,0,3],
  [1,1,3,3,3,3,3,3],
  [1,3,3,3,3,3,3,3]
]

const SPRITE_NITPICKER_1_202 = [
  [2,2,2,2,2,2,3,3],
  [0,0,0,0,2,2,3,3],
  [0,2,2,2,2,2,3,1],
  [0,0,0,2,2,3,3,3],
  [0,0,0,0,0,3,3,3],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0]
]

const SPRITE_NITPICKER_1_203 = [
  [3,3,1,1,3,3,3,3],
  [3,3,3,3,3,3,3,3],
  [3,3,3,1,1,3,3,0],
  [1,3,3,3,3,3,2,2],
  [3,1,3,3,1,1,1,0],
  [0,0,3,3,3,3,3,3],
  [0,0,0,0,3,3,3,0],
  [0,0,0,0,0,0,0,0]
]

const SPRITE_NITPICKER_2_204 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,1,1],
  [2,2,2,2,3,3,1,0],
  [0,2,2,2,2,3,1,0],
  [0,0,2,2,0,2,1,0]
]

const SPRITE_NITPICKER_2_205 = [
  [0,0,0,3,3,3,3,0],
  [0,0,3,3,3,3,3,3],
  [0,3,3,3,3,1,1,1],
  [1,3,3,3,3,3,3,0],
  [1,1,3,3,1,1,0,0],
  [1,1,3,3,3,3,0,3],
  [1,1,3,3,3,3,0,3],
  [1,1,3,3,3,3,3,3]
]

const SPRITE_NITPICKER_2_206 = [
  [0,0,0,2,2,2,3,1],
  [0,0,0,0,2,2,3,3],
  [0,0,0,2,2,2,3,3],
  [0,0,2,2,2,3,3,3],
  [0,2,2,2,3,3,3,3],
  [0,0,0,0,0,0,3,3],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0]
]

const SPRITE_NITPICKER_2_207 = [
  [1,3,3,3,3,3,3,3],
  [3,3,3,3,3,3,3,3],
  [3,3,3,3,3,3,3,0],
  [3,3,3,3,2,2,2,2],
  [3,3,3,3,3,0,2,0],
  [3,3,3,3,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0]
]

export const NITPICKER_SPRITES: SpriteDefinition[] = [
  {
    name: "Nit Picker (1)",
    moveCharacterCode: MoveCharacterCode.NITPICKER,
    defaultPaletteCode: 2,
    defaultColorCombination: 0,
    charCodes: [200, 201, 202, 203],
    tiles: [SPRITE_NITPICKER_1_200, SPRITE_NITPICKER_1_201, SPRITE_NITPICKER_1_202, SPRITE_NITPICKER_1_203],
  },
  {
    name: "Nit Picker (2)",
    moveCharacterCode: MoveCharacterCode.NITPICKER,
    defaultPaletteCode: 2,
    defaultColorCombination: 0,
    charCodes: [204, 205, 206, 207],
    tiles: [SPRITE_NITPICKER_2_204, SPRITE_NITPICKER_2_205, SPRITE_NITPICKER_2_206, SPRITE_NITPICKER_2_207],
  },
]
