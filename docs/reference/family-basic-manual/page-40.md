# BASIC

## BG GRAPHIC

**Here we shall explain how to draw the backgrounds over which the animated characters will interact. All the characters which you can use in these background drawings are introduced in character table B, p. 113.**

**Instructions:**

*Please enter `SYSTEM [RETURN]` to call the GAME BASIC mode screen from the BASIC screen.*

### GAME BASIC Mode Screens

**GAME BASIC Mode Selection Screen:**

```
GAME BASIC

1--BASIC
2--BG GRAPHIC
3--END

1,2,3 KEY IN !!
```

Press key ② to execute BG GRAPHIC. (Do not press key ③ as this will end the GAME BASIC mode.)

**BG GRAPHIC Drawing Screen:**

Use BG GRAPHIC to draw a background or to create patterns.

The screen displays:
- Cursor position: `X:00 MODE 0` and `Y:00 SELECT X`
- Mode indicators: `D C M L R F H`

### FUNCTION MENU

**Press the ESC key to display the function menu in this position.**

**Function Table:**

| Function | Description |
|----------|-------------|
| **SELECT** | Selects the character(s) displayed on screen. Use the D key to delete the character(s) within the cursor. |
| **COPY** | Copies a character which is displayed on screen to duplicate it in a different position. |
| **MOVE** | Moves a character which is displayed on screen to a different position. |
| **CLEAR** | Deletes all the characters which are displayed on screen. |
| **FILE** | Used to SAVE the drawing displayed on screen onto a cassette tape, or to LOAD a drawing from a cassette tape. Please refer to p. 46. |
| **CHAR** | Displays alphanumerics, symbols and kana. |

**Usage:**

Use the ▼ key to select a function. Upon pressing the SPACE key, the menu of the selected function will be executed.

### Coordinate Value Display

**X (horizontal) and Y (vertical) show the position of the cursor which displays the character on screen. (Only during SELECT, COPY and MOVE. During CHAR, the value of the coordinates does not change.)**

**Drawing Range:**

The characters can be drawn within the following range:
- X: 00-27 (28 squares)
- Y: 00-20 (21 lines)

**The relation between the sprite screen and the BG GRAPHIC screen coordinates:**

- `x` ... x coordinate for sprites
- `y` ... y coordinate for sprites
- `X` ... X coordinate for BG GRAPHIC
- `Y` ... Y coordinate for BG GRAPHIC

**Coordinate Conversion Formula:**

When fixing the coordinates of the sprite screen and the BG GRAPHIC screen as above, the coordinates to assemble animated characters use the following type of formula:

```
x = (X×8) + 16
y = (Y×8) + 24
```

**Therefore, when you would like to display animated characters over the background pattern, please use the formula from above to create programs.**

**Character Construction:**

- **(4 character construction)**: Sprites composed of 4 characters, with coordinates at top-left corner (x, y)
- **(1 character construction)**: Sprites composed of 1 character, with coordinates at top-left corner (x, y)

**Cursor Movement:**

Use the ▲ ▼ ◀ ▶ keys to move the cursor (□) in the coordinate values which display the character.

*Please refer to p. 36 "Screen Display Process".*

---

*Page 40*

