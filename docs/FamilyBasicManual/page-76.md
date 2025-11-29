# BASIC

## POSITION

**Working**

Assigns the initial coordinates before starting the movement with the MOVE sentence. (Sprite screen coordinates.)

**Grammar**

```
POSITION n, X, Y
```

- `n`: Action number defined by `DEF MOVE` (0 to 7).
- `X`: Horizontal coordinate (0 to 255).
- `Y`: Vertical coordinate (0 to 255).

**Note:** However, the available range on the sprite screen is X: 0 to 240 and Y: 5 to 220. (The available display range on the screen might differ depending on the TV set.)

**Abbreviation**

POS.

**Explanation**

Assigns the initial coordinates at which to start the action before starting the movement of the animated characters with the MOVE sentence. The values of X and Y are the coordinates on the sprite screen which are located on the upper left corner of the animated characters.

When not specified, the movement starts at the default values X = 120 and Y = 120.

When you start the movement of animated characters of the same action number within a program repeatedly with MOVE, you can start the position of the finished movement defined by DEF MOVE as the initial coordinates of the next movement. With RUN or with another POSITION command you can respecify the initial coordinates of the movement, or, until you redefine the movement with DEF MOVE, the animated characters with the same action number keep the coordination position of the finished movement from before.

**Sample Program**

```basic
10 REM * POSITION *
20 CLS:SPRITE ON
30 DEF MOVE (0)=SPRITE (11,3,2,10,1,2)
40 X=RND (256): Y=RND (240)
50 PRINT"X, Y=";X; ", ";Y
60 POSITION 0, X, Y
70 MOVE 0
80 PAUSE 80
90 GOTO 20
```

**Explanation of Sample Program:**

- Line number 30: Defines that Smiley moves 20 dots to the right.
- Line number 40: Generates X and Y with random numbers.
- Line number 50: Displays the value of X and Y.
- Line number 60: Specifies the start position of Smiley's movement.
- Line number 70: Starts Smiley's movement.

## XPOS

**Working**

Invokes the horizontal coordinate value of the position of the animated character of the action number defined by DEF MOVE.

**Grammar**

```
XPOS(n)
```

- `n`: Action number of the animated character defined by `DEF MOVE` (0 to 7).

**Abbreviation**

XP.

**Explanation**

When an XPOS function is executed, it invokes the value of the horizontal coordinate of the character of the action number specified by n. During a sequential transition of the action, use this together with the POSITION sentence.

**Sample Program**

```basic
10 REM * XPOS YPOS *
20 CLS:SPRITE ON
30 DEF MOVE (0)=SPRITE (0,2,2,10,0,0)
40 MOVE 0
50 LOCATE 8,20:PRINT" "
60 LOCATE 8,21:PRINT" "
70 LOCATE 8,20:PRINT"XPOS (0)=";XPOS (0)
80 LOCATE 0,21:PRINT"YPOS (0)=";YPOS (0)
90 PAUSE 50
100 GOTO 40
```

**Explanation of Sample Program:**

- Line number 30: Defines that Mario moves X and Y 20 dots each to the upper right.
- Line number 70-80: Displays the value of Mario's XPOS and YPOS.

## YPOS

**Working**

Invokes the vertical coordinate value of the position of the animated character of the action number defined by DEF MOVE.

**Grammar**

```
YPOS(n)
```

- `n`: Action number of the animated character defined by `DEF MOVE` (0 to 7).

**Abbreviation**

YP.

**Explanation**

When a YPOS function is executed, it invokes the value of the vertical coordinate of the character of the action number specified by n. During a sequential transition of the action, use this together with the POSITION sentence.

**Sample Program**

*Refer to XPOS*

---

*Page 76*

