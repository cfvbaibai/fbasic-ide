import { MoveCharacterCode, type SpriteDefinition } from "./types"

const SPRITE_SHELLCREEPER_1_184 = [
  [0,0,0,0,1,0,0,0],
  [0,0,0,1,1,1,0,0],
  [0,0,2,1,1,1,0,0],
  [0,2,2,0,1,1,2,0],
  [0,2,2,0,1,1,2,0],
  [2,0,2,1,1,2,2,0],
  [2,2,2,2,2,2,2,0],
  [2,2,2,2,2,2,0,0]
]

const SPRITE_SHELLCREEPER_1_185 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,3,3,3,1,0,0,0],
  [3,0,3,3,0,1,0,0],
  [3,3,0,0,3,3,1,0]
]

const SPRITE_SHELLCREEPER_1_186 = [
  [2,2,0,0,2,2,0,3],
  [0,0,0,0,2,2,1,3],
  [0,0,0,2,2,2,1,0],
  [0,0,2,2,2,2,1,3],
  [0,0,0,0,2,2,1,1],
  [0,0,0,0,0,0,2,1],
  [0,0,0,0,2,2,2,2],
  [0,0,0,2,2,2,2,0]
]

const SPRITE_SHELLCREEPER_1_187 = [
  [3,0,3,3,0,3,1,0],
  [0,3,3,3,3,0,3,0],
  [3,0,3,3,0,3,0,2],
  [3,3,0,0,3,3,3,0],
  [3,0,3,3,0,3,1,1],
  [1,3,3,3,3,1,1,0],
  [1,1,1,1,1,1,2,0],
  [0,0,0,0,0,2,2,2]
]

const SPRITE_SHELLCREEPER_2_188 = [
  [0,0,0,0,1,0,0,0],
  [0,0,0,1,1,1,0,0],
  [0,0,2,1,1,1,0,0],
  [0,2,2,0,1,1,2,0],
  [0,2,2,0,1,1,2,0],
  [2,0,2,1,1,2,2,0],
  [2,2,2,2,2,2,2,0],
  [2,2,2,0,2,2,0,3]
]

const SPRITE_SHELLCREEPER_2_189 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,3,3,3,1,0,0,0],
  [3,0,3,3,0,1,0,0],
  [3,3,0,0,3,3,1,0],
  [3,0,3,3,0,3,1,0]
]

const SPRITE_SHELLCREEPER_2_190 = [
  [2,2,0,2,2,2,1,3],
  [0,0,2,2,2,2,1,0],
  [0,0,0,2,2,2,1,3],
  [0,0,0,0,2,2,1,1],
  [0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,2,2],
  [0,0,0,0,0,0,2,2],
  [0,0,0,0,0,0,0,2]
]

const SPRITE_SHELLCREEPER_2_191 = [
  [0,3,3,3,3,0,3,0],
  [3,0,3,3,0,3,0,2],
  [3,3,0,0,3,3,3,0],
  [3,0,3,3,0,3,1,1],
  [1,3,3,3,3,1,1,0],
  [1,1,1,1,1,1,2,0],
  [2,0,0,0,2,2,0,0],
  [2,2,0,2,2,2,0,0]
]

export const SHELLCREEPER_SPRITES: SpriteDefinition[] = [
  {
    name: "Shell Creeper (1)",
    moveCharacterCode: MoveCharacterCode.SHELL_CREEPER,
    defaultPaletteCode: 2,
    defaultColorCombination: 3,
    charCodes: [184, 185, 186, 187],
    tiles: [SPRITE_SHELLCREEPER_1_184, SPRITE_SHELLCREEPER_1_185, SPRITE_SHELLCREEPER_1_186, SPRITE_SHELLCREEPER_1_187],
  },
  {
    name: "Shell Creeper (2)",
    moveCharacterCode: MoveCharacterCode.SHELL_CREEPER,
    defaultPaletteCode: 0,
    defaultColorCombination: 3,
    charCodes: [188, 189, 190, 191],
    tiles: [SPRITE_SHELLCREEPER_2_188, SPRITE_SHELLCREEPER_2_189, SPRITE_SHELLCREEPER_2_190, SPRITE_SHELLCREEPER_2_191],
  },
]
