# BASIC

## Sprite Control Statements (Continued)

### SPRITE

**Working**

Erases or displays defined sprites on any position.

**Grammar**

```
SPRITE n [, x, y]
```

- `n`: Sprite number 0 to 7
- `x`: Sprite screen horizontal coordinate 0 to 255
- `y`: Sprite screen vertical coordinate 0 to 255

**Note:** (However, the available coordinates are x: 0 to 240 and y: 5 to 220)

**Abbreviation**

SP.

**Explanation**

Displays an animated character which has already been defined by DEF SPRITE on the position of your choice on the sprite screen.

When you omit the horizontal and vertical coordinates, the animated character of the specified sprite number will disappear from the displayed animated characters. (`SPRITE n`)

When multiple animated characters are displayed on the same coordinates, the one with the lowest sprite number will appear in the front. (The display priority ranking among sprites is greater.)

You can display simultaneously up to 4 (8 character parts) animated characters horizontally. (More than 4 characters will not be visible on screen.)

The display of animated characters on the sprite screen will appear on the specified coordinates of the position of the upper left border of the character defined by DEF SPRITE.

When superimposing with BG GRAPHIC, please keep in mind the relationship of the position of the sprite screen and the BG GRAPHIC screen or the sprite display coordinates.

**Relational expression:**

```
x = (X × 8) + 16
y = (Y × 8) + 24
```

- `x`: x coordinate of the sprite
- `y`: y coordinate of the sprite
- `X`: X coordinate of BG GRAPHIC
- `Y`: Y coordinate of BG GRAPHIC

**Sprite Screen Diagram:**

The diagram illustrates the relationship between the "Sprite screen" and the "BG GRAPHIC screen".

**Sprite Screen:**
- Coordinates: (0,5) to (240,220)
- Horizontal range: 0 to 240
- Vertical range: 5 to 220
- Measurements relative to sprite:
  - Left: 2 characters (16 dots)
  - Right: 1 dot, then 3 characters (24 dots)
  - Top: 3 characters (24 dots)
  - Bottom: 3 characters (24 dots)

**BG GRAPHIC Screen:**
- Encompasses the Sprite screen
- *The displayable screen range might differ depending on your TV set.

### SPRITE ON

**Working**

Enables the display of the sprite screen. Sprite display mode.

**Grammar**

```
SPRITE ON
```

**Abbreviation**

SP.O.

**Explanation**

Enables the stacking of the sprite screen over the background screen and displaying it.

Sprites (animated characters) on the sprite screen become visible on the screen.

You have to enable SPRITE ON before executing DEF SPRITE or DEF MOVE.

It remains active continuously until executing SPRITE OFF.

**Sample Program**

**Direct command:**

```basic
SPRITE ON
OK
```

**Within program:**

```basic
10 SPRITE ON
```

### SPRITE OFF

**Working**

Disable the display of the sprite screen. Turns off the sprite mode.

**Grammar**

```
SPRITE OFF
```

**Abbreviation**

SP.OF.

**Explanation**

All of the animated characters displayed on the sprite screen stop being visible.

The sprite screen is not stacked on the background screen and displayed anymore.

**Sample Program**

**Direct command:**

```basic
SPRITE OFF
OK
```

**Within program:**

```basic
10 SPRITE OFF
```

---

*Page 89*

