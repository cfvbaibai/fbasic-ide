# BASIC

## PALET

**Working**

Resets the color code within a color combination number to an arbitrary color code.

**Grammar**

```
PALET {B|S} n, C1, C2, C3, C4
```

- `B`: Stands for BG (Background).
- `S`: Stands for Sprite (animated character).
- `n`: Color combination number 0 to 3.
- `C1`: Defines the color of the background screen. It becomes valid when the value of `n` is 0.
- `C1`, `C2`, `C3`, `C4`: Define the color codes of the 52 colors. `C2`, `C3`, and `C4` match every color on the left edge, center, and right edge of the color combination number.

**Example:** Color combination number 0 contains three color codes: `C2`, `C3`, `C4`.

Each code uses a value (0 to 60) from the list below.

**Abbreviation**

`PAL.B`, `PAL.S`

**Explanation**

Picks a color code within the 52 colors and colorizes the background and the sprites. The backdrop color colorizes the screen even if you use that color also for the background and for the sprites.

(Disregarding PALETB and PALETS) within a program, the color defined in the greatest execution line number program will eventually be used to display. It is displayed according to the palet chosen with a CGSET sentence. On top of this, it chooses the n value matching the color group within that palet and sets the 4 color (C1, C2, C3 and C4) code. The color code can select among the 52 colors produced by the color generator.

**Sample Program**

```basic
10 REM * PALET *
20 SPRITE ON
30 DEF SPRITE 0, (3, 1, 0, 0, 0) =CHR$(88)+CHR$(89)+CHR$(90)+CHR$(91)
40 SPRITE 0, 100, 150
RUN
OK Displays with the colors of color combination number 3 through sprite palet code 1.
CGSET 1,0
OK Displays with the colors of color combination number 3 through sprite palet code 0.
PALETS 3, &H0F, &H30, &H26, &H12
OK Displays with colors &H30, &H26 and &H12.
```

## 61 Color Codes

```
        ┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
        │ Hex │ DEC │ HEX │ DEC │ HEX │ DEC │ HEX │ DEC │     │
        ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤Gray │
H   ↑   │ 00  │  0  │ 10  │ 16  │ 20  │ 32  │ 30  │ 48  │  ~  │
U   │   ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤White│
E   │   │ 01  │  1  │ 11  │ 17  │ 21  │ 33  │ 31  │ 49  │     │
    │ B │ 02  │  2  │ 12  │ 18  │ 22  │ 34  │ 32  │ 50  │     │
    │ L │ 03  │  3  │ 13  │ 19  │ 23  │ 35  │ 33  │ 51  │     │
    │ U │ 04  │  4  │ 14  │ 20  │ 24  │ 36  │ 34  │ 52  │     │
    │ E ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤     │
    │   │ 05  │  5  │ 15  │ 21  │ 25  │ 37  │ 35  │ 53  │     │
    │ R │ 06  │  6  │ 16  │ 22  │ 26  │ 38  │ 36  │ 54  │     │
    │ E │ 07  │  7  │ 17  │ 23  │ 27  │ 39  │ 37  │ 55  │Color│
    │ D │ 08  │  8  │ 18  │ 24  │ 28  │ 40  │ 38  │ 56  │     │
    │   ├─────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┤     │
    │ G │ 09  │  9  │ 19  │ 25  │ 29  │ 41  │ 39  │ 57  │     │
    │ R │ 0A  │ 10  │ 1A  │ 26  │ 2A  │ 42  │ 3A  │ 58  │     │
    │ E │ 0B  │ 11  │ 1B  │ 27  │ 2B  │ 43  │ 3B  │ 59  │     │
    │ E │ 0C  │ 12  │ 1C  │ 28  │ 2C  │ 44  │ 3C  │ 60  │     │
    │ N ├─────┼─────┼─────┼─────┼─────┼─────┼─────┴─────┤     │
    │   │ 0D  │ 13  │ 1D  │ 29  │ 2D  │ 45  │           │     │
    │   │ 0E  │ 14  │ 1E  │ 30  │ 2E  │ 46  │           │Black│
    ↓   │ 0F  │ 15  │ 1F  │ 31  │ 2F  │ 47  │           │     │
        └─────┴─────┴─────┴─────┴─────┴─────┴───────────┴─────┘
       Dark  ←──────────────────────────────────────────→  Bright
```

**Color Categories:**

- **Gray~White**: `30` (48) to `34` (52)
- **Colored**: `35` (53) to `38` (56)
- **Black**: `2D` (45) to `2F` (47)

**Color Gradient:** Dark ← → Bright

**Color Groups:**
- **BLUE**: Hex `01`-`04`, `11`-`14`, `21`-`24`, `31`-`34`
- **RED**: Hex `05`-`08`, `15`-`18`, `25`-`28`, `35`-`38`
- **GREEN**: Hex `09`-`0C`, `19`-`1C`, `29`-`2C`, `39`-`3C`

## Additional Command Explanations

**CGSET 1,0**

Defines sprite palet code 0.

**DEF SPRITE 0, (0,1,0,0,0)="@ABC"**

Defines color combination number 0 among palet code 0.

The sprite will be shown this time with a color combination of color codes 54, 22 and 2.

**PALETS 0,1,48,25,18**

- `0,1`: Change backdrop color to 1.
- `48`: Change color 54 to 48.
- `25`: Change color 22 to 25.
- `18`: Change color 2 to 18.

---

*Page 73*

