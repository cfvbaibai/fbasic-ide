# BASIC

## ★Changing Mario's color

Use the "Leave only Mario on-screen..." program on p. 18 and enter:

```basic
40 CGSET 1,1 [RETURN]
```

When you enter `RUN [RETURN]` the color of Mario from right before will change. Please enter:

```basic
40 PALETS 0,13,22,39,3 [RETURN]
```

When you enter `RUN [RETURN]` a Mario of a slightly different color will be displayed. Enter:

```basic
LIST [RETURN]
```

and check if the PALETS command which you entered right before has been memorized. When you enter the line number 40's PALETS, the previous program will be rewritten (line number 40's CGSET 1,1).

Press the `▲▼◀▶` keys to move the cursor to the PALETS command line. In order to change the color of Mario and the backdrop, change the PALETS command like below:

```basic
40 PALETS 0,17,22,39,3 [RETURN]
```

And now enter: `RUN [RETURN]` The backdrop has a new color, right?

And now we'll revert the original color of Mario. Please enter:

```basic
40 PALETS 0,13,54,22,2 [RETURN]
RUN [RETURN]
```

### Screen Display (Program 1)

```
┌─────────────────────────────────────────┐
│ OK                                      │
│ LIST                                    │
│ 5 CLS                                   │
│ 10 SPRITE ON                            │
│ 20 DEF SPRITE 0,(0,1,0,1,0)=            │
│    CHR$(1)+CHR$(0)+CHR$(3)+CHR$(2)      │
│ 30 SPRITE 0,120,140                     │
│ 40 PALETS 0,13,22,39,3                  │
│ OK                                      │
│                                         │
│                     ██                  │
│                     ██                  │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

## ●About CGSET...

`CGSET` is the command which defines the preferred group of colors among the combination of colors which are pre-provided.

### Syntax Diagram

```
CGSET m, n
      ^  ^
      |  |
      |  +-- Background screen palette code
      |      (Designs the groups from No. 0 to No. 1)
      +----- Animated character (sprite) palette code
             (Designs the groups from No. 0 to No. 2)
```

## ●About PALET...

`PALET` is the command which selects among 52 colors and displays the pattern of the animated characters and backdrops. There are 2 types of PALETS.

- `PALETS`.....For animated characters (sprites)
- `PALETB`.....For the backdrop pattern

### Syntax Diagram

```
PALETS 0,17,22,39,3
            ^
            |
            +-- Indicates the color set for the backdrop screen. The color of the backdrop screen becomes active afterwards with an effectively assigned command.
```

**Notes:**
- Indicates the 52 color code.
- The range of numbers is from 0 to 60.
- *Please refer to the color chart on p. 113*
- *or the 52 color code on p.73.*

## ●About CTR+D...

`CTR+D` means pressing the `D` key while holding down the `CTR` key.

When you execute this, you will execute the `CGEN 2, SPRITE OFF` command.

- *Please refer to CGEN on p. 71.*
- *Please refer to SPRITE OFF on p. 27.*

The color palette becomes the color scheme of the palette code for the background, and for the background + sprite.

Cancels `CTR+A` (auto insert function).

However, the values of the variables remain unchanged.

If you use this function, in case you change the program, the sprites (animated characters) displayed on-screen will disappear, the color of the font will become white, and therefore, the screen will be easier to see.

*Please refer to the Control Code on p. 104.*

## ●If the computer's condition becomes incomprehensible...

When executing a program in BASIC, if you can't find the cursor anymore or if you don't know what's going on with the computer, perform the following operations.

### Operations List

1. Press the `STOP` key
2. Press the `CTR+D` keys
3. Press the `SHIFT+HOME` keys (The `HOME` key has "CLR" written above it, indicating `SHIFT+CLR HOME`)

With these operations, you will go back to the condition where there is nothing on-screen except the cursor blinking in the upper left corner. If, even after performing these operations, the screen doesn't go back to this condition, it has turned into a condition in which the computer can not be controlled (this condition is called "computer on reckless run"). Please press the reset switch of the famicom and restart the operation from the start screen.

**Caution**: this problem can occur when an error arises in programs which use the `POKE` or `CALL` commands.

---

*Page 19*

