# Sprite System Reference

## Overview

- Max 8 sprites (numbered 0-7)
- Max 4 sprites visible per horizontal line
- Lower sprite number = higher display priority

## SPRITE ON / OFF

Enable/disable sprite screen display.
```
SPRITE ON   ' Enable sprite display
SPRITE OFF  ' Disable sprite display
```
Abbreviation: `SP.O.`, `SP.OF.`

Must execute `SPRITE ON` before DEF SPRITE or DEF MOVE.

## DEF SPRITE

Define a sprite's appearance.
```
DEF SPRITE n, (A, B, C, D, E) = char_set
```

Parameters:
- `n`: Sprite number (0-7)
- `A`: Color combination (0-3)
- `B`: Size pattern
  - 0: 8×8 dots (1 character)
  - 1: 16×16 dots (4 characters)
- `C`: Display priority
  - 0: In front of background
  - 1: Behind background
- `D`: X-axis flip (0=normal, 1=mirrored)
- `E`: Y-axis flip (0=normal, 1=mirrored)
- `char_set`: Character codes (CHR$ or string)

Abbreviation: `DE.SP.`

Example:
```basic
DEF SPRITE 0, (0,1,0,0,0) = CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
DEF SPRITE 1, (0,1,0,0,0) = "@ABC"
```

### 16×16 Sprite Character Layout
```
+---+---+
| 0 | 1 |  (top-left, top-right)
+---+---+
| 2 | 3 |  (bottom-left, bottom-right)
+---+---+
```

## SPRITE

Display or hide sprite at position.
```
SPRITE n, x, y    ' Display at position
SPRITE n          ' Hide sprite
```
- `n`: Sprite number (0-7)
- `x`: X coordinate (0-255, visible 0-240)
- `y`: Y coordinate (0-255, visible 5-220)

Abbreviation: `SP.`

## DEF MOVE

Define animated character movement.
```
DEF MOVE(n) = SPRITE(A, B, C, D, E, F)
```

Parameters:
- `n`: Movement number (0-7)
- `A`: Character type (0-15, see table below)
- `B`: Direction (0-8, see table below)
- `C`: Speed (1-255, lower=faster)
- `D`: Distance (1-255 dots × 2)
- `E`: Priority (0=front, 1=back)
- `F`: Color combination (0-3)

Abbreviation: `DE.M.`

### Character Types (A)
| Type | Character |
|------|-----------|
| 0 | Mario |
| 1 | Lady |
| 2 | Fighter Fly |
| 3 | Achilles |
| 4 | Penguin |
| 5 | Fireball |
| 6 | Car |
| 7 | Spinner |
| 8 | Star Killer |
| 9 | Starship |
| 10 | Explosion |
| 11 | Smiley |
| 12 | Laser |
| 13 | Shell Creeper |
| 14 | Side Stepper |
| 15 | Nitpicker |

### Movement Directions (B)
| Dir | Direction |
|-----|-----------|
| 0 | No movement |
| 1 | Up-right |
| 2 | Right |
| 3 | Down-right |
| 4 | Down |
| 5 | Down-left |
| 6 | Left |
| 7 | Up-left |
| 8 | Up |

### Speed Formula
Speed = 60/C dots per second

### Distance Formula
Total movement = 2 × D dots

## MOVE

Start/stop sprite movement.
```
MOVE n, x, y    ' Start movement at position
MOVE n          ' Stop movement
```

## Source
Manual pages: 74-78, 88-89
