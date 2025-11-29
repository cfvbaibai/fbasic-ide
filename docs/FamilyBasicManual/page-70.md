# BASIC

## Screen Control Statements

### LOCATE

**Working**

Moves the cursor to the specified position.

**Grammar**

```
LOCATE X, Y
```

- X......Horizontal display column (0 to 27)
- Y......Vertical display line (0 to 23)

**Abbreviation**

LOC.

**Explanation**

LOCATE specifies the cursor position of the background screen.

**Screen Coordinate System:**

The screen coordinate system is illustrated as follows:

- Top-left corner: `(0,0)`
- Top-right corner: `(27,0)`
- Bottom-left corner: `(0,23)`
- Bottom-right corner: `(27,23)`
- Horizontal dimension: 28 columns (0-27)
- Vertical dimension: 24 lines (0-23)

**Sample Program**

```basic
10 REM * LOCATE *
20 CLS
30 FOR I=0 TO 20
40 LOCATE I, I: PRINT"*"
50 NEXT
60 LOCATE 0,10
```

**Explanation of Sample Program:**

Line number 40 specifies the position of the cursor and prints *.

Line number 60 moves the display position and ends the execution of the program.

(It can not receive more commands after the end position. Please move the cursor to a line which has no display of *.)

### COLOR

**Working**

Specifies the color pattern number of the characters to display on the background screen per area of the screen.

**Grammar**

```
COLOR X, Y, n
```

- X...Horizontal display column (0 to 27)
- Y...Vertical display line (0 to 23)
- n...Color pattern number (0 to 3)

**Abbreviation**

COL.

**Explanation**

Selects display color of the background or character from within the color pattern number inside the color pallet code specified by CGSET for each area on screen which includes the position specified by X, Y.

*Please refer to the color chart on p. 113.*

BG GRAPHIC is displayed in the color pattern of color pattern number (0 to 3) from color pallet 1.

Even if you change the color pallet code with CGSET, the color pattern number specified within the area by the COLOR sentence remains active.

**The area for which you can specify colors:**

The screen is divided into a grid where each area can have its color pattern specified. The grid coordinates are:

- Horizontal: 0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26
- Vertical: 0, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23

**Sample Program**

```basic
10 REM * COLOR *
20 CLS
30 FOR I=0 TO 447
40 PRINT CHR$(195);
50 NEXT
60 FOR C=0 TO 3
70 COLOR 5+C*3, 5+C*2, C
80 NEXT
90 LOCATE 0,20
```

**Explanation of Sample Program:**

Displays the area which includes the position specified on line number 70 in color pattern according to the specified color pattern number.

On line number 90 it moves the cursor to the specified position and ends the execution of the program.

**Additional Explanation:**

COLOR can specify the color pattern number of each area of the scope shown by [blank square].

**Example:** For example, if you pick `COLOR 10, 10, 3` the 4 characters (letters, symbols, graphical characters) within the area (A, B, C and D) on screen which included the (10, 10) specified by X, Y will be displayed in the colors of color pattern number 3.

The area includes:
- Column 10, 9th line (A)
- Column 11, 9th line (B)
- Column 10, 10th line (C)
- Column 11, 10th line (D)

---

*Page 70*

