# BASIC

## Sample program 4

### ** EXERCISE 4 ** - ROUTE 66

**Program Listing:**

```basic
10 REM * ROUTE 66 *
20 VIEW
30 CGEN 2
40 CGSET 1,1
50 PALET 0,1,48,25,18
60 PALET 1,1,48,25,18
70 PALET 2,1,48,25,18
80 SPRITE ON
90 X1=120:Y1=180
100 SC=0:CA=3:V=0
110 FOR I=0 TO 3
120 DEF SPRITE I,(I,1,0,0,0)=CHR$(I*4)+CHR$(I*4+1)+CHR$(I*4+2)+CHR$(I*4+3)
130 NEXT
140 FOR I=0 TO 3
150 X(I)=RND(1)*200+28
160 Y(I)=RND(1)*100
170 NEXT
180 GOSUB 500
190 S=STICK(0)
200 IF S=1 THEN X1=X1-4
210 IF S=2 THEN X1=X1+4
220 IF STRIG(0)=0 THEN V=V+1
230 IF STRIG(1)=0 THEN V=V-1
240 IF V<0 THEN V=0
250 IF V>10 THEN V=10
260 FOR I=0 TO 3
270 Y(I)=Y(I)+V
280 IF Y(I)>240 THEN Y(I)=Y(I)-240:X(I)=RND(1)*200+28
290 IF ABS(X(I)-X1)<16 AND ABS(Y(I)-Y1)<16 THEN 350
300 NEXT
310 SC=SC+V
320 IF SC>9999 THEN SC=9999
330 GOSUB 500
340 GOTO 190
350 CA=CA-1
360 IF CA<0 THEN 380
370 GOTO 180
380 PRINT "GAME OVER!"
390 END
500 REM * DISPLAY *
510 CLS
520 LOCATE 0,0:PRINT "HIGH SCORE";SC
530 LOCATE 0,1:PRINT "LEVEL";V
540 LOCATE 0,2:PRINT "SCORE";SC
550 LOCATE 0,3:PRINT "CARS";CA
560 LOCATE 0,4:PRINT "LEFT";9999-SC;"M"
570 LOCATE 0,5:PRINT "SEC";100
580 SPRITE 0,X1,Y1
590 FOR I=0 TO 3
600 SPRITE I+1,X(I),Y(I)
610 NEXT
620 RETURN
```

**Note:** The program listing above is a reconstruction based on the visible commands. Some lines may need adjustment based on the actual game logic.

### ROUTE 66

**Description:**

Scorch the endless road in your racing car! Accelerate, steer sharply and get ahead of those who are in your way.

**How to play:**

1 player game.

- **Objective:** Cover a set distance within a time limit.
- **Controls:**
  - Left/right directions on controller I's button to steer
  - 'A' button to accelerate
  - 'B' button to brake
- **Consequence:** You will explode if you bump into other cars.
- **Starting condition:** Start the run while accelerating from the start position.

**Game Elements:**

- Player's racing car at the bottom center
- Enemy cars scattered across the road
- Road with dashed center lines and solid edge lines
- Score, level, cars remaining, distance, and time displays

### Warning: OM ERROR

**OM ERROR Warning:**

An "OM ERROR" (Out of Memory) occurs due to unnecessary spaces in the program. Remove unnecessary spaces to resolve this error.

### Warning: When changing or modifying the program

- **When creating, changing or modifying a BASIC program, always erase the BG GRAPHIC (background) screen beforehand. Not doing this might result in an error.**

- **Press the CLR HOME key while holding down the SHIFT key to erase the BG GRAPHIC screen. The cursor will return to its home position.**

- **Call the program with LIST and execute the changes and modifications.**

## Background Screen Data

**Grid Structure:**

The background screen data grid represents 28 horizontal cells (columns 0-27) and 21 vertical cells (rows 0-20).

**Character Codes:**

The grid contains various alphanumeric codes arranged in patterns:
- **M codes:** M70, M71 (forming road/background patterns)
- **L codes:** L40 (forming road edge/border patterns)

**Background Screen Data Grid:**

|   | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12| 13| 14| 15| 16| 17| 18| 19| 20| 21| 22| 23| 24| 25| 26| 27|
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 0 |   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 1 |   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 2 |   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 3 |   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 4 |   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 5 |   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 6 |   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 7 |   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 8 |   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 9 |   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 10|   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 11|   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 12|   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 13|   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 14|   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 15|   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 16|   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 17|   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 18|   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 19|   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |
| 20|   |   |   |   |   |   |   |   |   |   |   |   |   |M70|L40|M71|M71|M71|M71|M71|M71|M71|M71|M71|L40|M70|   |   |

**Pattern Description:**

- **Columns 0-12:** Empty (left side of screen)
- **Columns 13-25:** Road pattern with repeating sequence: `M70 L40 M71 M71 M71 M71 M71 M71 M71 M71 M71 L40 M70`
  - `M70` and `L40` form the road edges/borders
  - `M71` forms the road surface (9 characters wide)
- **Columns 26-27:** Empty (right side of screen)
- **All rows (0-20):** Same pattern repeated, creating a vertical road strip

**Data Entry:**

Enter the character codes in BG GRAPHIC mode to create the background screen for the ROUTE 66 game. The grid shows a road pattern with edges and center surface, creating a racing track background.

---

*Page 97*

