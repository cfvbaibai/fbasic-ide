# BASIC

## Sample program 1

### ** EXERCISE 1 ** - KNIGHT

**Program Listing:**

```basic
10 REM * KNIGHT *
20 VIEW
30 CGEN 2
40 CGSET 1,1
50 DEF SPRITE 0,(0,1,0,0,0)=CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
60 DEF SPRITE 1,(1,1,0,0,0)=CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
70 DEF SPRITE 2,(2,1,0,0,0)=CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
80 DEF SPRITE 3,(3,1,0,0,0)=CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
90 PALETS 0,1,48,25,18
100 PALETS 1,1,48,25,18
110 PALETS 2,1,48,25,18
120 PALETS 3,1,48,25,18
130 SPRITE ON
140 DIM B(7,7)
150 FOR Y=0 TO 7
160 FOR X=0 TO 7
170 B(X,Y)=0
180 NEXT
190 NEXT
200 X=0:Y=0:F=0
210 GOSUB 500
220 S=STICK(0)
230 IF S=0 THEN 220
240 IF S=4 THEN Y=Y+1
250 IF S=8 THEN Y=Y-1
260 IF S=1 THEN X=X+1
270 IF S=2 THEN X=X-1
280 IF X<0 THEN X=0
290 IF X>7 THEN X=7
300 IF Y<0 THEN Y=0
310 IF Y>7 THEN Y=7
320 IF STRIG(0)<>0 THEN 340
330 GOTO 210
340 IF B(X,Y)<>0 THEN 220
350 B(X,Y)=F+1
360 GOSUB 500
370 F=1-F
380 GOTO 220
500 REM * DISPLAY *
510 CLS
520 FOR Y=0 TO 7
530 FOR X=0 TO 7
540 IF B(X,Y)=0 THEN 560
550 LOCATE X*3+2,Y*2+2:PRINT CHR$(B(X,Y)+47)
560 NEXT
570 NEXT
580 IF F=0 THEN LOCATE 8,20:PRINT "BLUE WIN!!"
590 IF F=1 THEN LOCATE 8,20:PRINT "RED WIN!!"
600 RETURN
```

**Note:** The program listing above is a reconstruction based on the visible commands. Some lines may need adjustment based on the actual game logic.

### KNIGHT

**Description:**

Use the knight's move to move around while placing your pieces on the chessboard. Take time to anticipate the other side's next move. The one who cannot move any more loses.

**How to play:**

2 players face off each other. Use the up and down directions of the button of the controller to know where you can move to next. When you have decided, use the A button to set it. Both of you repeat this.

**Chessboard:**

The game uses an 8×8 chessboard:
- Columns: 8 to 1 (from left to right)
- Rows: A to H (from top to bottom)
- Knight moves are shown with asterisks (*) indicating possible positions
- Current position is marked with a circular icon

### Warning: When changing or modifying the program

- **When creating, changing or modifying a BASIC program, always erase the BG GRAPHIC (background) screen beforehand. Not doing this might result in an error.**

- **Press the CLR HOME key while holding down the SHIFT key to erase the BG GRAPHIC screen.**

- **The cursor will return to its home position.**

- **Call the program with LIST and execute the changes and modifications.**

## Background Screen Data

**Grid Structure:**

The background screen data grid represents 28 horizontal cells (columns 0-27) and 21 vertical cells (rows 0-20).

**Character Codes:**

The grid contains various alphanumeric codes:
- **K codes:** K72, K52, K22, K42, K02, K32, K12, K62 (forming the chessboard pattern)
- **L codes:** L02, L22, L12 (forming chessboard borders)
- **J codes:** J60, J30, J70, J20, J00, J10 (forming text borders)
- **Text:** "KNIGHT" appears in row 2, columns 18-26

**Background Screen Data Grid:**

|   | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12| 13| 14| 15| 16| 17| 18| 19| 20| 21| 22| 23| 24| 25| 26| 27|
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 0 |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 1 |   |8  |   |7  |   |6  |   |5  |   |4  |   |3  |   |2  |   |1  |   |   |   |I60|J30|J30|J30|J30|J30|J30|J70|   |
| 2 |K72|K52|K22|K52|K22|K52|K22|K52|K22|K52|K22|K52|K22|K52|K22|K52|L02|   |   |J20|K  |N  |I  |G  |H  |T  |J20|   |
| 3 |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62| A |   |J00|J30|J30|J30|J30|J30|J30|J10|   |
| 4 |K42|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K32|   |   |   |   |   |   |   |   |   |   |   |
| 5 |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62| B |   |   |   |   |   |   |   |   |   |   |
| 6 |K42|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K32|   |   |   |   |   |   |   |   |   |   |   |
| 7 |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62| C |   |   |   |   |   |   |   |   |   |   |
| 8 |K42|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K32|   |   |   |   |   |   |   |   |   |   |   |
| 9 |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62| D |   |   |   |   |   |   |   |   |   |   |
| 10|K42|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K32|   |   |   |   |   |   |   |   |   |   |   |
| 11|K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62| E |   |   |   |   |   |   |   |   |   |   |
| 12|K42|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K32|   |   |   |   |   |   |   |   |   |   |   |
| 13|K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62| F |   |   |   |   |   |   |   |   |   |   |
| 14|K42|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K32|   |   |   |   |   |   |   |   |   |   |   |
| 15|K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62| G |   |   |   |   |   |   |   |   |   |   |
| 16|K42|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K02|K52|K32|   |   |   |   |   |   |   |   |   |   |   |
| 17|K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62|   |K62| H |   |   |   |   |   |   |   |   |   |   |
| 18|L12|K52|K12|K52|K12|K52|K12|K52|K12|K52|K12|K52|K12|K52|K12|K52|L22|   |   |   |   |   |   |   |   |   |   |   |
| 19|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |

**Chessboard Pattern:**

- Row 1: Top border with K72, K52, K22 pattern
- Rows 2, 3, 5, 7, 9, 11, 13, 15, 17: Chessboard squares with K62 in alternating columns, labeled A-H in column 17
- Rows 4, 6, 8, 10, 12, 14, 16: Chessboard squares with K42, K52, K02 pattern
- Row 18: Bottom border with L12, K52, K12 pattern
- Right section (columns 18-27, rows 1-3): "KNIGHT" title with J codes as borders

**Data Entry:**

Enter the character codes in BG GRAPHIC mode to create the background screen for the KNIGHT game. The grid shows an 8×8 chessboard pattern with row labels A-H and the "KNIGHT" title in the top-right corner.

---

*Page 94*

