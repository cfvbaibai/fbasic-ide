# Screen System Reference

## Screen Dimensions

### Background Screen (PRINT output)
- Size: 28 columns × 24 rows
- Coordinates: X (0-27), Y (0-23)
- Origin: Top-left (0,0)

### BG GRAPHIC Screen
- Size: 28 columns × 21 rows
- For graphics drawing

### Sprite Screen
- Size: 256 × 240 dots
- Visible range: X (0-240), Y (5-220)

## Screen Layers (front to back)
1. Sprite Screen (Front) - sprites with priority 0
2. Background Screen - PRINT content
3. Sprite Screen (Back) - sprites with priority 1
4. Backdrop Screen - background color

## LOCATE

Move cursor to position.
```
LOCATE X, Y
```
- X: Horizontal column (0-27)
- Y: Vertical row (0-23)

Abbreviation: `LOC.`

Example:
```basic
LOCATE 10, 5: PRINT "HELLO"
```

## COLOR

Set color pattern for screen area.
```
COLOR X, Y, n
```
- X: Horizontal column (0-27)
- Y: Vertical row (0-23)
- n: Color pattern number (0-3)

Abbreviation: `COL.`

Color affects a 2×2 character area containing the specified position.

## CLS

Clear screen and home cursor.
```
CLS
```
Abbreviation: `CL.`

## CGSET

Set color palette code.
```
CGSET palet_code, combination
```
- palet_code: Palette number (0-3)
- combination: Color combination within palette

Abbreviation: `CGS.`

## CGEN

Set character generator mode.
```
CGEN mode
```
- mode: Character set selection (0-3)

Abbreviation: `CG.`

## Coordinate Conversion

### Sprite to BG GRAPHIC
```
sprite_x = (bg_x × 8) + 16
sprite_y = (bg_y × 8) + 24
```

### BG GRAPHIC to Sprite
```
bg_x = (sprite_x - 16) / 8
bg_y = (sprite_y - 24) / 8
```

## Color Codes

52 colors available (codes 0-60, with some reserved).

Color pattern numbers (0-3) reference colors within the active palette set by CGSET.

## Source
Manual pages: 70-73, 113
