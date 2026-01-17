# BASIC

## Sprite Control Statements

### DEF SPRITE

**Working**

Defines the sprites (animated characters) to be displayed on the sprite screen.

**Grammar**

```
DEF SPRITE n, (A, B, C, D, E) = char. set
```

- `char. set` can be `CHR$(N)` or a character string like `"@ABC"` or a character variable.

**Parameters:**

- `n`: Sprite number (0 to 7).
- `A`: Color combination number (0 to 3, refers to color chart or CGSET).
- `B`: Character construction pattern (0 or 1).
  - `0`: 8x8 dots (size of 1 character).
  - `1`: 16x16 dots (size of 4 characters).
- `C`: Display priority level (0 or 1).
  - `0`: On sprite screen in front of background screen.
  - `1`: On sprite screen behind background screen.
- `D`: X-axis inversion instruction (0 or 1).
  - `0`: Same as character table.
  - `1`: Left-right inverted.
- `E`: Y-axis inversion instruction (0 or 1).
  - `0`: Same as character table.
  - `1`: Up-down inverted.

**Abbreviation**

DE.SP.

**Explanation**

Defines the sprites to be displayed on the sprite screen. You can specify and define up to 8 sprite numbers from 0 to 7.

**Character Construction Pattern (B parameter):**

- **B=0**: Creates 1 animated character with 1 character (1 character size).
  - Dimensions: 8 dots horizontally × 8 dots vertically
  - Size: 1 character

- **B=1**: Creates an animated character of 4 characters (4 character sizes).
  - Dimensions: 16 dots horizontally × 16 dots vertically
  - Size: 4 characters

**Display Priority Level (C parameter):**

- `C=0`: Sprite appears in front of the background screen.
- `C=1`: Sprite appears behind the background screen.

**X, Y Inversion Instruction (D, E parameters):**

- `D=1` or `E=1`: Defines characters inverted along the specified axis.
- `D=0` or `E=0`: Character remains as is (referring to character table A and B).

**Additional Notes:**

- Can use `MOVE` command independently from `DEF MOVE`.
- Can use characters or symbols as sprites with `CGEN` commands.
- `CHR$(N)` can be specified with numbers of the 4 corners of the character table or codes from character table A and B. Also mentions `&H00` hexadecimal value.
- In `CGEN2`, provides two alternative ways to define a sprite:
  - `DEF SPRITE 0,(0,1,0,0,0) = CHR$(68)+CHR$(69)+CHR$(70)+CHR$(71)`
  - `DEF SPRITE 0,(0,1,0,0,0) = "DEFG"`

**Sample Program**

```basic
10 REM * DEF SPRITE *
20 SPRITE ON
30 DEF SPRITE 0, (0, 1, 0, 0, 0) = CHR$(0) + CHR$(1) + CHR$(2) + CHR$(3)
40 DEF SPRITE 1, (0, 1, 0, 0, 0) = "@ABC"
50 SPRITE 0, 100, 150
60 SPRITE 1, 100, 100
```

**Character set and character response:**

Example: `DEF SPRITE 0,(0,1,0,0,0) = CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)`

**Diagram:** A grid divided into four quadrants, labeled 0, 1, 2, and 3. A pixelated character resembling Mario is drawn across these four quadrants. Arrows point from:
- `CHR$(0)` to quadrant 0 (top-left)
- `CHR$(1)` to quadrant 1 (top-right)
- `CHR$(2)` to quadrant 2 (bottom-left)
- `CHR$(3)` to quadrant 3 (bottom-right)

This illustrates how multiple character definitions combine to form a larger sprite.

**Definition of inverted characters:**

**Example 1 (Character 'F' with B=0):**

- Original: `B=0, D=0, E=0` (Character 'F')
- X-axis inverted: `B=0, D=1, E=0` (Character 'F' mirrored horizontally)
- Y-axis inverted: `B=0, D=0, E=1` (Character 'F' mirrored vertically)

**Example 2 (Character 'E' with B=0):**

- Original: `B=0, D=0, E=0` (Character 'E')
- X-axis inverted: `B=0, D=1, E=0` (Character 'E' mirrored horizontally)
- Y-axis inverted: `B=0, D=0, E=1` (Character 'E' mirrored vertically)

**Example 3 (Characters 'FG JL' with B=1):**

- Original: `B=1, D=0, E=0` (Characters 'FG' on top, 'JL' below)
- X-axis inverted: `B=1, D=1, E=0` (Characters 'GF' on top, 'LJ' below, each character mirrored horizontally)
- Y-axis inverted: `B=1, D=0, E=1` (Characters 'JL' on top, 'FG' below, each character mirrored vertically)

**Example 4 (Characters 'EG JL' with B=1):**

- Original: `B=1, D=0, E=0` (Characters 'EG' on top, 'JL' below)
- X-axis inverted: `B=1, D=1, E=0` (Characters 'GE' on top, 'LJ' below, each character mirrored horizontally)
- Y-axis inverted: `B=1, D=0, E=1` (Characters 'JL' on top, 'EG' below, each character mirrored vertically)

---

*Page 88*

