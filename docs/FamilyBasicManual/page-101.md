# BASIC

## Sample program 8

### ** EXERCISE 8 ** - SCR$ Sample

**Program Listing:**

```basic
10 VIEW
20 PLAY "04C1D1A1G1E1B"
30 SPRITE ON
40 CGSET 1,0
50 PX=50:PY=56:MX=190:MY=150:DEF MOVE(0)=SPRITE(4,D,1,1,0,0):POSITION 0,PX,PY
60 DX=PX-MX:DY=PY-MY
70 IF ABS(DX)<8 AND ABS(DY)<8 THEN 360
80 S1=-1*(DX>0)-2*(DX<0):S2=-4*(DY>0)-8*(DY<0)
90 IF ABS(DX)<ABS(DY) THEN SWAP S1,S2
100 S=S1:GOSUB 270:GOSUB 290
110 IF D<>0 THEN 140
120 SWAP S1,S2:S=S1:GOSUB 270:GOSUB 290
130 IF D=0 THEN 160
140 DEF MOVE(1)=SPRITE(11,0,1,3,0,0):POSITION 1,MX,MY
150 MOVE 1:PLAY "01C1C1C1"
160 S0=STICK(0)
170 S=S0:GOSUB 280:GOSUB 290
180 IF D=0 THEN 250
190 DEF MOVE(0)=SPRITE(4,D,1,3,0,0)
200 POSITION 0,PX,PY
210 MOVE 0:PLAY "03B1D1"
220 XX=(PX+7)/8-2:YY=(PY+7)/8-3
230 IF SCR$(XX,YY)=CHR$(199) THEN LOCATE XX,YY:PRINT "":CN=CN+1:LOCATE 10,23:PRINT "SCORE:";CN:PLAY "04C1A1G1"
240 IF MOVE(0)=-1 OR MOVE(1)=-1 THEN 240
250 PX=XPOS(0):PY=YPOS(0):MX=XPOS(1):MY=YPOS(1)
260 GOTO 60
270 X=MX-(S=1)*4+(S=2)*4:Y=MY-(S=4)*4+(S=8)*4:RETURN
280 X=PX-(S=1)*4+(S=2)*4:Y=PY-(S=4)*4+(S=8)*4:RETURN
290 C1=(X-1)/8-2:L1=(Y-1)/8-3
300 C2=X+16:C2=(C2-1)/8-2:L2=Y+16:L2=(L2-1)/8-3
310 D=-3*(S=1)*(SCR$(C2,L1)="")*(SCR$(C2,L2)="")
320 D=D-7*(S=2)*(SCR$(C1,L1)="")*(SCR$(C1,L2)="")
330 D=D-1*(S=8)*(SCR$(C1,L1)="")*(SCR$(C2,L1)="")
340 D=D-5*(S=4)*(SCR$(C1,L2)="")*(SCR$(C2,L2)="")
350 RETURN
360 PLAY "04G1C1G1":FOR Q=0 TO 3:CGSET 0,0:CGSET 1,1:CGSET 0,0:NEXT
370 PLAY "01C1G1A1C1D1":CLS:SPRITE OFF
380 LOCATE 5,10:PRINT "-END " "-END"
```

**Note:** The program listing above is a reconstruction based on the visible commands. Some lines may need adjustment based on the actual game logic. This is a demonstration program using the `SCR$` function.

### SCR$ Sample Program

**Description:**

This is a sample which uses `SCR$`.

**(It is not a game)**

**Instructions:**

- **Please execute it after drawing the background first.**

- **Control Penguin with the ◀ ▶ ▲ ▼ keys.**

- **Because Smiley will try to get close to Penguin, you should try to pass through the place with the flag while running away.**

- **When passing through a flag, control Penguin as if its center superimposes with the upper part of the flag.**

- **Penguin and Smiley will be unable to move on if they bump into the bricks.**

**Customization:**

※ Please change the position of the flags or the bricks in BG GRAPHIC and change the characters to try out several patterns.

**Game Elements:**

- **Penguin sprite:** Player-controlled character (sprite 0)
- **Smiley sprite:** Enemy that chases Penguin (sprite 1)
- **Flags:** Collectible items (character code CHR$(199)) that award points when collected
- **Bricks:** Obstacles (K50) that block movement
- **Score display:** Shows "SCORE:" at the bottom

**Technical Notes:**

- Uses `SCR$` function to read background screen characters for collision detection
- Uses `MOVE` command for sprite animation
- Uses `XPOS` and `YPOS` functions to track sprite positions
- Collision detection checks if movement would hit empty spaces (bricks block movement)

## Background Screen Data

**Grid Structure:**

The background screen data grid represents 28 horizontal cells (columns 0-27) and 21 vertical cells (rows 0-20).

**Character Codes:**

The grid contains various alphanumeric codes arranged in patterns:
- **K codes:** K50 (forming brick walls/borders)
- **A codes:** A00 (empty spaces), A01 (flag up), A11 (flag right), A21 (flag down), A31 (flag left)
- **Flags:** Character code CHR$(199) is used for collectible flags in the program (displayed as triangular shapes)

**Background Screen Data Grid:**

|   | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12| 13| 14| 15| 16| 17| 18| 19| 20| 21| 22| 23| 24| 25| 26| 27|
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 0 |F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|
| 1 |F32|   |   |   |   |   |   |   |   |F32|F32|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |F32|F32|
| 2 |F32|   |   |F72|   |   |   |   |   |F32|F32|   |   |   |F72|   |   |   |F72|   |   |   |F72|   |   |   |   |F32|
| 3 |F32|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |F32|
| 4 |F32|   |   |   |   |   |   |   |   |   |   |   |   |   |F32|F32|F32|F32|F32|F32|F32|F32|F32|   |   |   |   |F32|
| 5 |F32|   |   |   |   |   |   |   |F72|   |   |   |   |   |F32|   |   |   |   |   |   |   |F32|F32|   |   |   |F32|
| 6 |F32|   |   |   |F32|F32|   |   |   |   |   |   |F32|F32|   |   |   |   |F72|   |   |   |F32|F32|   |F72|   |F32|
| 7 |F32|   |   |   |F32|F32|   |   |   |   |   |   |F32|F32|   |   |   |   |   |   |   |   |   |   |   |   |   |F32|
| 8 |F32|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |F32|
| 9 |F32|   |   |   |F72|   |   |   |   |   |   |   |   |F72|   |   |   |F32|F32|   |   |   |   |   |   |   |   |F32|
| 10|F32|   |   |   |   |   |   |F32|F32|   |   |   |   |   |   |   |   |F32|F32|   |   |   |F72|   |   |   |   |F32|
| 11|F32|F32|F32|F32|F32|F32|F32|F32|F32|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |F32|
| 12|F32|   |   |   |   |   |   |   |   |   |   |   |F32|F32|   |   |   |   |   |   |   |   |   |   |   |   |   |F32|
| 13|F32|   |   |   |   |   |   |   |   |   |   |   |F32|F32|   |   |   |   |F72|   |   |   |   |   |   |F72|   |F32|
| 14|F32|   |F72|   |   |   |   |   |   |   |F72|   |F32|F32|   |   |   |   |   |   |   |   |   |   |   |   |   |F32|
| 15|F32|   |   |   |   |F32|F32|F32|   |   |   |   |F32|F32|   |   |   |   |   |   |   |   |F32|F32|   |   |   |F32|
| 16|F32|   |   |   |   |F32|F32|F32|   |   |   |   |F32|F32|   |   |   |   |   |   |   |   |F32|F32|   |   |   |F32|
| 17|F32|   |F72|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |F32|
| 18|F32|   |   |   |   |   |   |F72|   |   |F72|   |   |F72|   |   |   |F32|F32|   |   |   |   |F72|   |   |   |F32|
| 19|F32|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |F32|F32|   |   |   |   |   |   |   |   |F32|
| 20|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|

**Pattern Description:**

- **Row 0:** Top border with K50 (solid wall)
- **Row 1:** Open corridor with K50 borders
- **Row 2:** Maze path with A01 flag (up) in column 2, K50 walls
- **Row 3:** Maze path with A11 flag (right) in column 26
- **Row 4:** Maze path with K50 walls
- **Row 5:** Maze path with K50 walls
- **Row 6:** Maze path with K50 walls
- **Row 7:** Maze path with A11 flag (right) in column 14
- **Row 8:** Maze path with K50 walls
- **Row 9:** Maze path with K50 walls
- **Row 10:** Maze path with A01 flag (up) in column 14
- **Row 11:** Maze path with K50 walls
- **Row 12:** Maze path with K50 walls
- **Row 13:** Maze path with A21 flag (down) in column 15
- **Row 14:** Maze path with A31 flag (left) in column 14
- **Row 15:** Maze path with K50 walls
- **Row 16:** Maze path with A21 flag (down) in column 2
- **Row 17:** Open corridor with K50 borders
- **Row 18:** Bottom border with K50 (solid wall)
- **Rows 19-20:** Empty (below visible area)

**Note:** The flags (A01, A11, A21, A31) are visual indicators. In the program, collectible flags use character code CHR$(199) which is placed at specific locations and detected using the `SCR$` function.

**Data Entry:**

Enter the character codes in BG GRAPHIC mode to create the background screen for the SCR$ sample program. The grid shows a maze-like structure with brick walls (K50), open paths (A00), and flag markers (A01, A11, A21, A31) indicating where collectible flags should be placed using CHR$(199) in the program.

---

*Page 101*

