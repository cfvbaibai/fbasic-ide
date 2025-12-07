import { MoveCharacterCode, type SpriteDefinition } from "../types"

const SPRITE_STARSHIP_LEFT_164 = [
  [0,0,0,0,0,0,1,1],
  [0,0,0,0,0,1,1,1],
  [0,0,0,0,0,0,0,3],
  [0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,3,3],
  [0,0,0,0,2,1,1,1],
  [0,0,1,1,1,3,3,1],
  [0,1,1,3,3,3,1,1]
]

const SPRITE_STARSHIP_LEFT_165 = [
  [2,1,1,0,0,0,0,0],
  [2,1,1,1,0,0,0,0],
  [3,3,0,0,0,0,0,0],
  [1,1,1,0,0,0,0,0],
  [3,3,3,3,0,0,0,0],
  [1,1,1,3,3,2,3,0],
  [1,1,1,1,3,2,3,0],
  [1,2,2,2,2,2,3,0]
]

const SPRITE_STARSHIP_LEFT_166 = [
  [0,1,1,3,3,3,1,1],
  [0,0,1,1,1,3,3,1],
  [0,0,0,0,2,1,1,1],
  [0,0,0,0,0,0,3,3],
  [0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,0,3],
  [0,0,0,0,0,1,1,1],
  [0,0,0,0,0,0,1,1]
]

const SPRITE_STARSHIP_LEFT_167 = [
  [1,2,2,2,2,2,3,0],
  [1,1,1,1,3,2,3,0],
  [1,1,1,3,3,2,3,0],
  [3,3,3,3,0,0,0,0],
  [1,1,1,0,0,0,0,0],
  [3,3,0,0,0,0,0,0],
  [2,1,1,1,0,0,0,0],
  [2,1,1,0,0,0,0,0]
]

const SPRITE_STARSHIP_LEFTUP_168 = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
  [0,0,1,1,1,0,0,0],
  [0,0,1,1,1,1,2,0],
  [0,0,1,1,3,3,1,1],
  [0,0,0,1,3,3,3,3],
  [0,0,0,1,3,3,1,1],
  [0,0,0,2,1,3,1,1]
]

const SPRITE_STARSHIP_LEFTUP_169 = [
  [0,0,0,0,0,0,0,0],
  [0,1,1,1,0,0,0,0],
  [0,0,1,1,1,0,0,0],
  [0,0,3,1,2,2,0,0],
  [3,1,1,3,2,1,1,0],
  [1,3,1,1,3,1,1,0],
  [1,1,3,1,0,0,1,0],
  [2,1,1,3,0,0,0,0]
]

const SPRITE_STARSHIP_UP_170 = [
  [0,0,0,0,1,3,1,2],
  [0,0,0,0,3,1,1,2],
  [0,1,0,0,1,3,1,1],
  [0,1,1,3,1,1,3,1],
  [0,1,1,1,3,1,1,3],
  [0,0,1,2,2,3,1,1],
  [0,0,0,2,1,1,0,0],
  [0,0,0,0,1,1,1,0]
]

const SPRITE_STARSHIP_UP_171 = [
  [2,2,1,3,3,0,0,0],
  [2,2,2,3,2,0,0,0],
  [2,2,2,2,2,2,0,0],
  [1,2,2,2,2,3,0,0],
  [3,3,2,2,3,0,0,0],
  [3,2,2,3,0,0,0,0],
  [0,0,3,0,0,0,0,0],
  [0,0,0,0,0,0,0,0]
]

const SPRITE_STARSHIP_UP_172 = [
  [0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,1,1],
  [0,0,0,0,0,0,1,3],
  [0,0,0,0,0,2,1,3],
  [0,1,0,0,0,1,3,3],
  [1,1,0,0,3,1,3,3],
  [1,1,3,1,3,1,3,1]
]

const SPRITE_STARSHIP_UP_173 = [
  [1,0,0,0,0,0,0,0],
  [1,0,0,0,0,0,0,0],
  [1,1,0,0,0,0,0,0],
  [3,1,0,0,0,0,0,0],
  [3,1,2,0,0,0,0,0],
  [3,3,1,0,0,0,1,0],
  [3,3,1,3,0,0,1,1],
  [1,3,1,3,1,3,1,1]
]

const SPRITE_STARSHIP_UP_174 = [
  [1,1,3,1,3,1,1,1],
  [2,2,3,1,3,1,1,2],
  [1,1,3,1,3,1,1,2],
  [1,1,0,1,3,1,1,2],
  [0,1,0,0,3,3,1,2],
  [0,0,0,0,0,3,3,2],
  [0,0,0,0,0,2,2,2],
  [0,0,0,0,0,3,3,3]
]

const SPRITE_STARSHIP_UP_175 = [
  [1,1,1,3,1,3,1,1],
  [2,1,1,3,1,3,2,2],
  [2,1,1,3,1,3,1,1],
  [2,1,1,3,1,0,1,1],
  [2,1,3,3,0,0,1,0],
  [2,3,3,0,0,0,0,0],
  [2,2,2,0,0,0,0,0],
  [3,3,3,0,0,0,0,0]
]

export const STARSHIP_SPRITES: SpriteDefinition[] = [
  {
    name: "Starship (LEFT)",
    moveCharacterCode: MoveCharacterCode.STARSHIP,
    defaultPaletteCode: 1,
    defaultColorCombination: 0,
    charCodes: [164, 165, 166, 167],
    tiles: [SPRITE_STARSHIP_LEFT_164, SPRITE_STARSHIP_LEFT_165, SPRITE_STARSHIP_LEFT_166, SPRITE_STARSHIP_LEFT_167],
  },
  {
    name: "Starship (LEFTUP)",
    moveCharacterCode: MoveCharacterCode.STARSHIP,
    defaultPaletteCode: 1,
    defaultColorCombination: 0,
    charCodes: [168, 169, 170, 171],
    tiles: [SPRITE_STARSHIP_LEFTUP_168, SPRITE_STARSHIP_LEFTUP_169, SPRITE_STARSHIP_UP_170, SPRITE_STARSHIP_UP_171],
  },
  {
    name: "Starship (UP)",
    moveCharacterCode: MoveCharacterCode.STARSHIP,
    defaultPaletteCode: 1,
    defaultColorCombination: 0, 
    charCodes: [172, 173, 174, 175],
    tiles: [SPRITE_STARSHIP_UP_172, SPRITE_STARSHIP_UP_173, SPRITE_STARSHIP_UP_174, SPRITE_STARSHIP_UP_175],
  },
]
