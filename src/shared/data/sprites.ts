import { ACHILLES_SPRITES } from "./characters/achilles"
import { CAR_SPRITES } from "./characters/car"
import { COMPUTEROPERATOR_SPRITES } from "./characters/com-opr"
import { EXPLOSION_SPRITES } from "./characters/explosion"
import { FIGHTERFLY_SPRITES } from "./characters/fighter-fly"
import { FIREBALL_SPRITES } from "./characters/fireball"
import { LADY_SPRITES } from "./characters/lady"
import { LASER_SPRITES } from "./characters/laser"
import { LUIGI_SPRITES, MARIO_SPRITES } from "./characters/mario"
import { MISC_SPRITES } from "./characters/misc"
import { NITPICKER_SPRITES } from "./characters/nitpicker"
import { NUMBER_SPRITES } from "./characters/number"
import { PENGUIN_SPRITES } from "./characters/penguin"
import { QUILL_SPRITES } from "./characters/quill"
import { SHELLCREEPER_SPRITES } from "./characters/shell-creeper"
import { SIDESTEPPER_SPRITES } from "./characters/side-stepper"
import { SMILEY_SPRITES } from "./characters/smiley"
import { SPINNER_SPRITES } from "./characters/spinner"
import { STARKILLER_SPRITES } from "./characters/star-killer"
import { STARSHIP_SPRITES } from "./characters/starship"
import type { SpriteDefinition } from "./characters/types"

export const CHARACTER_SPRITES: SpriteDefinition[] = [
  ...MARIO_SPRITES,
  ...LUIGI_SPRITES,
  ...LADY_SPRITES,
  ...FIGHTERFLY_SPRITES,
  ...ACHILLES_SPRITES,
  ...SMILEY_SPRITES,
  ...PENGUIN_SPRITES,
  ...FIREBALL_SPRITES,
  ...CAR_SPRITES,
  ...SPINNER_SPRITES,
  ...STARKILLER_SPRITES,
  ...STARSHIP_SPRITES,
  ...EXPLOSION_SPRITES,
  ...SHELLCREEPER_SPRITES,
  ...SIDESTEPPER_SPRITES,
  ...NITPICKER_SPRITES,
  ...LASER_SPRITES,
  ...MISC_SPRITES,
  ...QUILL_SPRITES,
  ...NUMBER_SPRITES,
  ...COMPUTEROPERATOR_SPRITES,
]
