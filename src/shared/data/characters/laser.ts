import { MoveCharacterCode, type SpriteDefinition } from "./types"

const SPRITE_LASER_HORIZONTAL1_208 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,2,2,0,0,0],
  [0,0,2,1,1,2,0,0],
  [0,0,0,2,2,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0]
]

const SPRITE_LASER_HORIZONTAL2_209 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,3,3,3,3,0,0],
  [0,3,2,2,2,2,3,0],
  [3,2,1,1,1,1,2,3],
  [0,3,2,2,2,2,3,0],
  [0,0,3,3,3,3,0,0],
  [0,0,0,0,0,0,0,0]
]

const SPRITE_LASER_DIAGONAL1_210 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,2,2,0,0,0,0],
  [0,0,2,1,2,0,0,0],
  [0,0,0,2,1,2,0,0],
  [0,0,0,0,2,2,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0]
]

const SPRITE_LASER_DIAGONAL2_211 = [
  [0,0,0,0,0,0,0,0],
  [0,2,3,3,3,0,0,0],
  [0,3,1,2,2,3,0,0],
  [0,3,2,1,1,2,3,0],
  [0,3,2,1,1,2,3,0],
  [0,0,3,2,2,1,3,0],
  [0,0,0,3,3,3,2,0],
  [0,0,0,0,0,0,0,0]
]

const SPRITE_LASER_VERTICAL1_212 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,2,0,0,0,0],
  [0,0,2,1,2,0,0,0],
  [0,0,2,1,2,0,0,0],
  [0,0,0,2,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0]
]

const SPRITE_LASER_VERTICAL2_213 = [
  [0,0,0,3,0,0,0,0],
  [0,0,3,2,3,0,0,0],
  [0,3,2,1,2,3,0,0],
  [0,3,2,1,2,3,0,0],
  [0,3,2,1,2,3,0,0],
  [0,3,2,1,2,3,0,0],
  [0,0,3,2,3,0,0,0],
  [0,0,0,3,0,0,0,0]
]

export const LASER_SPRITES: SpriteDefinition[] = [
  {
    name: "Laser (HORIZONTAL1)",
    moveCharacterCode: MoveCharacterCode.LASER,
    defaultPaletteCode: 1,
    defaultColorCombination: 0,
    charCodes: 208,
    tiles: SPRITE_LASER_HORIZONTAL1_208,
  },
  {
    name: "Laser (HORIZONTAL2)",
    moveCharacterCode: MoveCharacterCode.LASER,
    defaultPaletteCode: 1,
    defaultColorCombination: 0,
    charCodes: 209,
    tiles: SPRITE_LASER_HORIZONTAL2_209,
  },
  {
    name: "Laser (DIAGONAL1)",
    moveCharacterCode: MoveCharacterCode.LASER,
    defaultPaletteCode: 1,
    defaultColorCombination: 0,
    charCodes: 210,
    tiles: SPRITE_LASER_DIAGONAL1_210,
  },
  {
    name: "Laser (DIAGONAL2)",
    moveCharacterCode: MoveCharacterCode.LASER,
    defaultPaletteCode: 1,
    defaultColorCombination: 0,
    charCodes: 211,
    tiles: SPRITE_LASER_DIAGONAL2_211,
  },
  {
    name: "Laser (VERTICAL1)",
    moveCharacterCode: MoveCharacterCode.LASER,
    defaultPaletteCode: 1,
    defaultColorCombination: 0,
    charCodes: 212,
    tiles: SPRITE_LASER_VERTICAL1_212,
  },
  {
    name: "Laser (VERTICAL2)",
    moveCharacterCode: MoveCharacterCode.LASER,
    defaultPaletteCode: 1,
    defaultColorCombination: 0,
    charCodes: 213,
    tiles: SPRITE_LASER_VERTICAL2_213,
  },
]
