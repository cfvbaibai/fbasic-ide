---
name: fbasic-reference
description: Family BASIC language reference for the fbasic-emu project. Use when implementing F-BASIC commands, functions, or features. Provides accurate specifications from the original Family BASIC manual including character codes, screen system, sprite system, and input handling. Trigger on: implementing BASIC commands (PRINT, LOCATE, COLOR, SPRITE, etc.), character code lookups (CHR$, ASC), screen coordinate calculations, sprite animations (DEF MOVE), controller input (STICK, STRIG).
---

# F-BASIC Language Reference

Quick reference for Family BASIC language specifications based on the original manual.

## Reference Files

| File | Use When |
|------|----------|
| [commands.md](references/commands.md) | Implementing basic statements (PRINT, GOTO, GOSUB, IF-THEN, FOR-NEXT, etc.) |
| [screen.md](references/screen.md) | Working with screen output (LOCATE, COLOR, CLS, PRINT coordinates) |
| [sprites.md](references/sprites.md) | Implementing sprite system (DEF SPRITE, SPRITE, DEF MOVE, MOVE) |
| [input.md](references/input.md) | Controller/keyboard input (STICK, STRIG, INKEY$) |
| [character-codes.md](references/character-codes.md) | Character code lookups for CHR$/ASC (codes 0-255) |
| [functions.md](references/functions.md) | Built-in functions (ABS, RND, LEN, MID$, VAL, STR$, etc.) |

## Quick Facts

- **Screen size**: 28×24 characters (background screen)
- **Sprite screen**: 256×240 dots (visible: 0-240 x, 5-220 y)
- **Max sprites**: 8 (numbered 0-7), max 4 visible per horizontal line
- **Character codes**: 0-255 (32-95 ASCII, 96-183 Kana, 184-255 special graphics)
- **Integer range**: -32768 to +32767
- **String length**: max 31 characters

## Coordinate Conversion

Sprite to BG GRAPHIC:
```
sprite_x = (bg_x × 8) + 16
sprite_y = (bg_y × 8) + 24
```

## Source Documentation

Full manual pages available at: `docs/reference/family-basic-manual/page-*.md`
