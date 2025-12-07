import { MoveCharacterCode, type SpriteDefinition } from "../types"

const SPRITE_FIGHTERFLY_1_56 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,1,2,2,0,0,0],
  [0,1,1,1,0,2,0,2],
  [0,1,1,1,1,0,3,3],
  [0,0,1,1,1,3,1,3],
  [0,0,1,1,1,3,3,3],
  [0,0,0,0,1,3,3,2],
]

const SPRITE_FIGHTERFLY_1_57 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,2,2,1,0],
  [2,2,0,2,0,1,1,1],
  [2,3,3,0,1,1,1,1],
  [2,3,1,3,1,1,1,1],
  [2,3,3,3,1,1,1,0],
  [2,2,3,3,1,0,0,0],
]

const SPRITE_FIGHTERFLY_1_58 = [
  [0,0,0,0,0,2,2,1],
  [0,0,0,0,2,1,3,1],
  [0,0,0,3,2,1,3,1],
  [0,0,3,0,0,2,2,2],
  [0,0,0,0,1,1,3,3],
  [0,0,2,2,1,0,3,3],
  [0,2,2,2,2,0,0,3],
  [0,0,0,0,0,0,0,0],
]

const SPRITE_FIGHTERFLY_1_59 = [
  [3,1,2,2,0,0,0,0],
  [3,1,3,1,2,0,0,0],
  [3,1,3,1,2,3,0,0],
  [2,2,2,2,0,0,3,0],
  [3,3,3,1,0,0,0,0],
  [3,3,3,0,1,0,0,0],
  [3,3,0,1,2,2,0,0],
  [0,0,0,2,2,2,2,0],
]

const SPRITE_FIGHTERFLY_2_60 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,2,2,0,0,0],
  [0,0,0,0,0,2,0,2],
  [0,0,0,0,0,0,3,3],
  [0,0,0,0,0,3,1,3],
  [0,0,0,1,1,3,3,3],
  [0,0,1,1,1,3,3,2],
]

const SPRITE_FIGHTERFLY_2_61 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,2,2,0,0],
  [2,2,0,2,0,0,0,0],
  [2,3,3,0,0,0,0,0],
  [2,3,1,3,0,0,0,0],
  [2,3,3,3,1,1,0,0],
  [2,2,3,3,1,1,1,0],
]

const SPRITE_FIGHTERFLY_2_62 = [
  [0,1,1,1,1,2,2,1],
  [0,1,1,1,2,1,3,1],
  [0,0,1,3,2,1,3,1],
  [0,0,3,0,0,2,2,2],
  [0,0,0,0,0,1,3,3],
  [0,0,0,0,1,0,3,3],
  [0,0,0,2,2,1,0,3],
  [0,0,2,2,2,2,0,0],
]

const SPRITE_FIGHTERFLY_2_63 = [
  [3,1,2,2,1,1,1,1],
  [3,1,3,1,2,1,1,1],
  [3,1,3,1,2,3,1,0],
  [2,2,2,2,0,0,3,0],
  [3,3,3,1,1,0,0,0],
  [3,3,3,0,1,2,2,0],
  [3,3,0,0,2,2,2,2],
  [0,0,0,0,0,0,0,0],
]

export const FIGHTERFLY_SPRITES: SpriteDefinition[] = [
  {
    name: "Fighter Fly (1)",
    moveCharacterCode: MoveCharacterCode.FIGHTER_FLY,
    defaultPaletteCode: 2,
    defaultColorCombination: 1,
    charCodes: [56, 57, 58, 59],
    tiles: [SPRITE_FIGHTERFLY_1_56, SPRITE_FIGHTERFLY_1_57, SPRITE_FIGHTERFLY_1_58, SPRITE_FIGHTERFLY_1_59],
  },
  {
    name: "Fighter Fly (2)",
    moveCharacterCode: MoveCharacterCode.FIGHTER_FLY,
    defaultPaletteCode: 2,
    defaultColorCombination: 1,
    charCodes: [60, 61, 62, 63],
    tiles: [SPRITE_FIGHTERFLY_2_60, SPRITE_FIGHTERFLY_2_61, SPRITE_FIGHTERFLY_2_62, SPRITE_FIGHTERFLY_2_63],
  },
]
