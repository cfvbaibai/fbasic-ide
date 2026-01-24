# Screen System Reference

**Reference**: F-BASIC Manual Page 36

## Screen Dimensions

### Background Screen (PRINT output)
- Size: 28 columns × 24 rows
- Coordinates: X (0-27), Y (0-23)
- Origin: Top-left (0,0)
- Purpose: Primary screen for BASIC programs, displays alphanumeric characters, Kana, and symbols

### Backdrop Screen
- Size: 32 columns × 30 rows
- Coordinates: X (0-31), Y (0-29)
- Purpose: Displays background color, always visible
- Structure: Extends beyond Background Screen (adds 3 lines top/bottom, 2 columns left/right)

### BG GRAPHIC Screen
- Size: 28 columns × 21 rows
- Coordinates: X (0-27), Y (0-20)
- Purpose: Draws BG GRAPHIC patterns
- Can be copied to Background Screen via VIEW command

### Sprite Screen
- Size: 256 × 240 dots (pixel-based)
- Coordinates: X (0-255), Y (0-239) in dots
- Visible range: X (0-240), Y (5-220)
- Note: Uses pixel coordinates, not character coordinates

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
CGSET [m][,n]
```
- m: Background palette code (0 or 1), optional, default: 1
- n: Sprite palette code (0 to 2), optional, default: 1

Abbreviation: `CG.`

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
- Manual page 36: Screen Display Process
- Manual pages 70-73: Screen Control Statements
- Manual page 113: Character tables
