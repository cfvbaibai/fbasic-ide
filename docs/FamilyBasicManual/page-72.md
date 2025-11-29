# BASIC

## CGSET

**Working**

Selects the allocation of the palet used for BG and sprites. (specifies the color combination to display)

**Grammar**

```
CGSET [m][,n]
```

- `m`: Palet code 0 or 1 for the background screen
- `n`: Palet code 0 to 2 for sprites (animated characters)

**Abbreviation**

CG.

**Explanation**

The `CGSET` command selects among the group of combined colors prepared in advance and chooses a display color for the animated characters and backdrop.

All of the color palet colors (color codes) have been set in order to display color charts (p. 113) for background and sprites among all of the 52 displayable colors.

There are 2 types of background color palets (palet code 0 and 1) and 3 types of sprite color palets (palet code 0, 1, and 2).

You can maintain a total of 12 color codes, 3 types per color group of color combination number (0 to 3) for each color palet.

Once defined, the setting remains valid until you redefine it or until you use the PALET command to change the color code of the color combination.

**Note:** (The backdrop screen color is black (see-through).)

**Color Palet Structure:**

**Sprites:**
- Palet codes: n = 0, 1, 2
- Color combination numbers: 0, 1, 2, 3
- Each combination contains 4 color codes (0, 1, 2, 3)

**Background:**
- Palet codes: m = 0, 1
- Color combination numbers: 0, 1, 2, 3
- Each combination contains 4 color codes (0, 1, 2, 3)

The color codes matching every color within all of the displayable 52 colors. (Please refer to the PALET command.)

**Sample Program**

```basic
CGSET 0,0
OK
10 CGSET 0,1
```

**Further Explanations:**

The color combination number, specified by the DEF SPRITE and DEF MOVE sentences, specifies the color of the sprite to be displayed by specifying the combination of the color of the color combination number (0 to 3) within the palet selected by CGSET.

**For example:**

```basic
CGSET 1,1
DEF SPRITE 0, (0, 1, 0, 0, 0) =...
DEF MOVE (N) =SPRITE (0, 3, 1, 10, 0, 3)
```

Specifies the color combination number within palet number 1 for a sprite specified by CGSET above. (0 and 3)

Sprites are displayed in this color combination.

**Note about background color:** The background screen color combination specification is done through the COLOR sentence. Please refer to p. 70.

**Usage Instructions:**

Please use the background screen palet code 1 (CGSET 1,1) to copy the drawing from the BG GRAPHIC screen with the VIEW command on the background screen with the same colors.

**Default Value**

`m=1, n=1`

When using `CTR+D` or selecting 1--BASIC from the GAME BASIC mode screen, when you have reached the BASIC screen, the color palet becomes the background palet code 1 for background and sprites.

*Please refer to the color chart (CGSET) on p. 113.*

---

*Page 72*

