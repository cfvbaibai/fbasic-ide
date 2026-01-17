# BASIC

## Sample program 7

### ** EXERCISE 7 ** - CARD

**Program Listing:**

```basic
10 VIEW:CGEN 3:CGSET 1,1:SPRITE ON
20 I=JA=C:S=TX-1:Y=-1:ED=P:CX=XY:T0=T1:TT=0
30 N$=CHR$(254):N$=N$+N$+N$+N$:M0$=CHR$(243)+CHR$(247):M1$=CHR$(245)+CHR$(248)
40 DIM D(5,5),PT(17),PR(1)
50 FOR I=0 TO 5:FOR J=0 TO 5
60 LOCATE I*4+1,J*3+1:PRINT M0$
70 LOCATE I*4+1,J*3+2:PRINT M1$
80 A=RND(18):IF PT(A)=2 THEN 80
90 D(I,J)=A:PT(A)=PT(A)+1:NEXT:NEXT
100 PALETS 0,13,&H12,&H22,2:PALETS 1,13,&H14,&H24,4:PALETS 2,13,&H16,&H26,6:PALETS 3,13,2,25,&H36
110 DEF SPRITE 0,(3,1,0,0,0)=N$:DEF SPRITE 5,(3,1,0,0,0)=N$
120 LOCATE 25,9:PRINT "LEFT":LOCATE 25,12:PRINT "RIGHT"
130 SPRITE 8,CX*32+24,CY*24+31:T0=-1:T1=-1:TT=7:GOSUB 170:SWAP T0,T1:X=CX:Y=CY:TT=6:GOSUB 170
140 IF T0<>T1 THEN 150
150 PLAY "T204C1E1G105C6":ED=ED+1:IF ED=18 THEN 300
160 PR(P)=PR(P)+10:LOCATE 23,10+P*3:PRINT PR(P):SPRITE 6:SPRITE 7:GOTO 130
170 PLAY "01T2D5E5C5"
180 D(X,Y)=T1:D(CX,CY)=T0:LOCATE CX*4+1,CY*3+1:PRINT M0$:LOCATE CX*4+1,CY*3+2:PRINT M1$:LOCATE X*4+1,Y*3+1:PRINT M0$:LOCATE X*4+1,Y*3+2:PRINT M1$:P=1-P:GOTO 130
190 SPRITE 5,216,95+24*P:PAUSE 10:SPRITE 5:S=STICK(P):T=STRIG(P)
200 IF S=1 THEN CX=CX+1:IF CX>5 THEN CX=0
210 IF S=2 THEN CX=CX-1:IF CX<0 THEN CX=5
220 IF S=4 THEN CY=CY+1:IF CY>5 THEN CY=0
230 IF S=8 THEN CY=CY-1:IF CY<0 THEN CY=5
240 IF S=0 THEN 260
250 SPRITE 0,CX*32+24,CY*24+31
260 IF T<8 THEN 190
270 SWAP D(CX,CY),T0
280 IF T0=-1 THEN SWAP D(CX,CY),T0:GOTO 190
290 SPRITE 0:PLAY "05T1C1C1":PAUSE 10:LOCATE CX*4+1,CY*3+1:PRINT " ":LOCATE CX*4+1,CY*3+2:PRINT " "
300 DEF SPRITE TT,(T0/6,1,1,0,0)=CHR$(48+T0-T0/6*6):SPRITE TT,CX*32+24,CY*24+31
310 RETURN
320 PRINT "TRY AGAIN!!"
330 T=STRIG(0):IF T=0 THEN 330
340 IF T=1 THEN RUN
350 IF T=2 THEN END
360 GOTO 320
370 END
```

**Note:** The program listing above is a reconstruction based on the visible commands. Some lines may need adjustment based on the actual game logic. Variable initialization and subroutine flow may require refinement.

### CARD

**Description:**

It's a card memorizing game. You can either memorize the numbers and colors of all the cards which you have flipped or challenge your sixth sense. Which one will you do?

**How to play:**

2 players.

- **Objective:** Select the cards with the cross-shaped button of your controller and use the A button to flip the cards. Flip 2 cards and if they have the same color and number, you win. Then you can continue flipping cards. If the cards are not the same, it's the other one's turn.

- **Gameplay:**
  - Game board: 6 columns × 6 rows grid of face-down cards
  - Each card has a number and color
  - Players take turns selecting and flipping cards
  - Match two cards with the same color and number to score points
  - When a match is found, the player continues their turn
  - If no match, turn switches to the other player

- **Scoring:**
  - Each successful match awards 10 points
  - Game ends when all 18 pairs are matched

**Game Elements:**

- 6×6 grid of face-down cards (36 cards total, 18 pairs)
- Cursor for selecting cards
- "LEFT" and "RIGHT" labels indicating player sides
- Score display for each player
- Card reveal animation and sound effects

### Warning: When changing or modifying the program

- **When creating, changing or modifying a BASIC program, always erase the BG GRAPHIC (background) screen beforehand. Not doing this might result in an error.**

- **Press the CLR HOME key while holding down the SHIFT key to erase the BG GRAPHIC screen. The cursor will return to its home position.**

- **Call the program with LIST and execute the changes and modifications.**

## Background Screen Data

**Grid Structure:**

The background screen data grid represents 28 horizontal cells (columns 0-27) and 21 vertical cells (rows 0-20).

**Character Codes:**

The grid contains various alphanumeric codes arranged in patterns:
- **K codes:** K72, K52, K62, K42, K32 (forming borders and frames)
- **L codes:** L02, L12, L22 (forming borders and corners)
- **F codes:** F72 (markers in specific positions)

**Background Screen Data Grid:**

|   | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12| 13| 14| 15| 16| 17| 18| 19| 20| 21| 22| 23| 24| 25| 26| 27|
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 0 |K72|K52|K52|L02|K72|K52|K52|L02|K72|K52|K52|L02|K72|K52|K52|L02|K72|K52|K52|L02|K72|K52|K52|L02|   |   |   |   |
| 1 |K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|   |   |   |   |
| 2 |K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|   |   |   |   |
| 3 |K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|   |   |   |   |
| 4 |K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|   |   |   |   |
| 5 |K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|   |   |   |   |
| 6 |K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|   |   |   |   |
| 7 |K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|   |   |   |   |
| 8 |K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|   |   |   |   |
| 9 |K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|F72|   |   |   |
| 10|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|   |   |   |   |
| 11|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|   |   |   |   |
| 12|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|F72|   |   |   |
| 13|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|   |   |   |   |
| 14|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|   |   |   |   |
| 15|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|K42|K52|K52|K32|   |   |   |   |
| 16|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|   |   |   |   |
| 17|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|K62|   |   |K62|   |   |   |   |
| 18|L12|K52|K52|L22|L12|K52|K52|L22|L12|K52|K52|L22|L12|K52|K52|L22|L12|K52|K52|L22|L12|K52|K52|L22|   |   |   |   |
| 19|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |

**Pattern Description:**

- **Row 0:** Top border with repeating pattern `K72 K52 K52 L02` (6 times) creating a framed top edge
- **Rows 1-2, 4-5, 7-8, 10-11, 13-14, 16-17:** Vertical border rows with `K62` in columns 0, 3-4, 7-8, 11-12, 15-16, 19-20, 23, creating vertical dividers for the card grid
- **Rows 3, 6, 9, 12, 15:** Horizontal divider rows with repeating pattern `K42 K52 K52 K32` (6 times), with `F72` markers in column 24 for rows 9 and 12
- **Row 18:** Bottom border with repeating pattern `L12 K52 K52 L22` (6 times) creating a framed bottom edge
- **Rows 19-20:** Empty

The pattern creates a 6×6 grid structure suitable for displaying 36 cards (6 columns × 6 rows) with clear borders and dividers.

**Data Entry:**

Enter the character codes in BG GRAPHIC mode to create the background screen for the CARD game. The grid shows a framed card game board with 6×6 cells for displaying face-down cards.

---

*Page 100*

