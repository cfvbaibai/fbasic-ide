# BASIC

## Sample program 6

### ** EXERCISE 6 ** - TURTLE

**Program Listing:**

```basic
10 CLS
20 CGEN 3
30 CGSET 1,1
40 PALET 0,1,48,25,18
50 PALET 1,1,48,25,18
60 PALET 2,1,48,25,18
70 PLAY "04T1"
80 DIM AX(5),AY(5),Q(5),P(10,2),C(5)
90 INPUT "HOW MANY PLAYERS?";PL
100 IF PL<1 OR PL>5 THEN 90
110 FOR I=1 TO 5
120 Q(I)=RND(MAX)+BT
130 C(I)=Q(I)
140 NEXT
150 VIEW
160 LOCATE 0,0:PRINT "カメ 1 2 3 4 5"
170 FOR I=1 TO 5
180 LOCATE 0,I:PRINT I
190 NEXT
200 FOR J=1 TO PL
210 INPUT "TURTLE?";P(J,0)
220 IF P(J,0)<1 OR P(J,0)>5 THEN 210
230 P(J,1)=0
240 NEXT
250 FOR I=1 TO 5
260 AX(I)=0
270 AY(I)=I*32+16
280 NEXT
290 DEF SPRITE 0,(0,1,0,0,0)=CHR$(184)+CHR$(185)+CHR$(186)+CHR$(187)
300 SPRITE ON
310 FOR K=1 TO 100
320 FOR I=1 TO 5
330 A=RND(8)
340 IF A<Q(I) THEN AX(I)=AX(I)+1
350 IF AX(I)>200 THEN 600
360 NEXT
370 FOR I=1 TO 5
380 SPRITE 0,AX(I),AY(I)
390 NEXT
400 IF K=50 THEN PLAY MID$("T6CEDFEGC2T1",1,12)
410 IF K=50 THEN LOCATE 10,10:PRINT "CHANGE"
420 IF K=50 THEN FOR I=1 TO 5:Q(I)=RND(MAX)+BT:NEXT
430 NEXT
440 FOR I=1 TO 5
450 IF AX(I)>200 THEN W=I:GOTO 470
460 NEXT
470 FOR J=1 TO PL
480 IF P(J,0)=W THEN P(J,1)=P(J,1)+C(P(J,0))
490 NEXT
500 LOCATE 10,12:PRINT "WINNER:";W
510 FOR J=1 TO PL
520 LOCATE 10,13+J:PRINT "PLAYER";J;":";P(J,1)
530 NEXT
540 SPRITE OFF
550 INPUT "TRY AGAIN?";A$
560 IF A$="Y" OR A$="y" THEN RUN
570 END
600 REM * WINNER ROUTINE *
750 RETURN
```

**Note:** The program listing above is a reconstruction based on the visible commands. Some lines may need adjustment based on the actual game logic. Variables like `MAX`, `BT`, and some subroutine calls may require refinement.

### TURTLE

**Description:**

5 turtles are racing to reach the goal. The ones with a low factor are the favorites, but there could be unexpected changes. Until reaching the goal you can't know who's gonna win, making this game very exciting!

**How to play:**

Up to 5 players can play together.

- **Setup:**
  1. First choose the amount of players
  2. While looking at the factor, imagine which turtle will win
  3. Each player selects their turtle (1-5)

- **Gameplay:**
  - 5 turtles race horizontally across the screen
  - Each turtle has a "factor" that affects its speed
  - Lower factor = favorite (faster)
  - Turtles move based on random chance weighted by their factor
  - When "CHANGE" appears in the middle of the game, it makes it more exciting by changing an internal random number (factors are recalculated)

- **Scoring:**
  - If you're right, you'll receive points according to that factor
  - Points are awarded based on the turtle's original factor value

**Game Elements:**

- Top display: "カメ" (turtle) and numbers 1 2 3 4 5
- Left column: Numbers 1-5 for each racing lane
- 5 turtle sprites racing horizontally
- Goal line on the right side
- Score display showing winner and player points

### Warning: When changing or modifying the program

- **When creating, changing or modifying a BASIC program, always erase the BG GRAPHIC (background) screen beforehand. Not doing this might result in an error.**

- **Press the HOME key while holding down the SHIFT key to erase the BG GRAPHIC screen. The cursor will return to its home position.**

- **Call the program with LIST and execute the changes and modifications.**

## Background Screen Data

**Grid Structure:**

The background screen data grid represents 28 horizontal cells (columns 0-27) and 21 vertical cells (rows 0-20).

**Character Codes:**

The grid contains various alphanumeric codes arranged in patterns:
- **D codes:** D50, D52 (forming top background sections)
- **G codes:** G42, G52 (forming top background sections)
- **K codes:** K50, K52, K22, K62, K02, K12 (forming racing track and borders)
- **J codes:** J20, J22 (forming vertical lane markers)

**Background Screen Data Grid:**

|   | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12| 13| 14| 15| 16| 17| 18| 19| 20| 21| 22| 23| 24| 25| 26| 27|
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 0 |D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|D50|
| 1 |D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|D52|
| 2 |G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|G42|
| 3 |G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|
| 4 |G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|G52|
| 5 |K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K52|K52|K52|K22|
| 6 |   |   |   |J20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |J22|   |K62|
| 7 |1  |   |   |J20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |J22|   |K62|
| 8 |K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K52|K52|K52|K02|
| 9 |   |   |   |J20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |J22|   |K62|
| 10|2  |   |   |J20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |J22|   |K62|
| 11|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K52|K52|K52|K02|
| 12|   |   |   |J20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |J22|   |K62|
| 13|3  |   |   |J20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |J22|   |K62|
| 14|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K52|K52|K52|K02|
| 15|   |   |   |J20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |J22|   |K62|
| 16|4  |   |   |J20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |J22|   |K62|
| 17|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K52|K52|K52|K02|
| 18|   |   |   |J20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |J22|   |K62|
| 19|5  |   |   |J20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |J22|   |K62|
| 20|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K50|K52|K52|K52|K12|

**Pattern Description:**

- **Rows 0-4:** Top background sections with D and G codes creating a sky/background pattern
  - Row 0: D50 (all columns)
  - Row 1: D52 (all columns)
  - Row 2: G42 (all columns)
  - Rows 3-4: G52 (all columns)

- **Rows 5-20:** Racing track pattern with alternating horizontal track rows and lane marker rows
  - **Track rows (5, 8, 11, 14, 17, 20):** K50 across columns 0-23, K52 in columns 24-26, with K22/K02/K12 in column 27 (finish line)
  - **Lane marker rows (6-7, 9-10, 12-13, 15-16, 18-19):** Mostly empty with J20 in column 3 (left lane marker) and J22 in columns 24-26 (right lane markers), K62 in column 27

**Data Entry:**

Enter the character codes in BG GRAPHIC mode to create the background screen for the TURTLE game. The grid shows a racing track with horizontal lanes, lane markers, and a finish line on the right side.

---

*Page 99*

