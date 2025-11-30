# BASIC

## Sample program 3

### ** EXERCISE 3 ** - UFO

**Program Listing:**

```basic
10 REM * UFO *
20 VIEW:CGEN 2
30 CGSET 1,1
40 U0$=CHR$(64)+CHR$(65)+CHR$(66)+CHR$(67)
50 U1$=CHR$(68)+CHR$(69)+CHR$(70)+CHR$(71)
60 B$=CHR$(72)+CHR$(73)+CHR$(74)+CHR$(75)
70 G0$=CHR$(76)+CHR$(77)+CHR$(78)+CHR$(79)
80 G1$=CHR$(80)+CHR$(81)+CHR$(82)+CHR$(83)
90 D0$=CHR$(84)+CHR$(85)+CHR$(86)+CHR$(87)
100 D1$=CHR$(88)+CHR$(89)+CHR$(90)+CHR$(91)
110 DEF SPRITE 0,(0,1,0,0,0)=U0$
120 DEF SPRITE 1,(0,1,0,0,0)=U1$
130 DEF SPRITE 2,(0,1,0,0,0)=B$
140 DEF SPRITE 3,(0,1,0,0,0)=G0$
150 DEF SPRITE 4,(0,1,0,0,0)=G1$
160 DEF SPRITE 5,(0,1,0,0,0)=D0$
170 DEF SPRITE 6,(0,1,0,0,0)=D1$
180 PALETS 0,1,48,25,18
190 PALETS 1,1,48,25,18
200 PALETS 2,1,48,25,18
210 SPRITE ON
220 LG=2:RG=25:TG=2:BG=18
230 GX=13:GY=18:BV=0:DV=0:R=0
240 PR=0
250 GOSUB 300
260 S=STICK(0)
270 IF S=1 THEN GX=GX+1
280 IF S=2 THEN GX=GX-1
290 IF GX<LG THEN GX=LG
300 IF GX>RG THEN GX=RG
310 SPRITE 2,GX*8+16,GY*8+24
320 IF STRIG(0)<>0 THEN 340
330 GOTO 260
340 BV=GY-2:DV=GX
350 SPRITE 3,DV*8+16,BV*8+24
360 IF BV<TG THEN 380
370 BV=BV-1:GOTO 350
380 SPRITE 3,0,0
390 R=RND(10)
400 IF R<3 THEN 420
410 GOTO 260
420 GOSUB 440
430 GOTO 260
440 REM * ENEMY *
450 EX=RND(24)+2
460 EY=TG
470 SPRITE 0,EX*8+16,EY*8+24
480 IF EY>=GY THEN 500
490 EY=EY+1:GOTO 470
500 IF EX=DV AND EY>=BV THEN 520
510 GOTO 480
520 SPRITE 0,0,0:SPRITE 3,0,0
530 PR=PR+10
540 LOCATE 0,0:PRINT "SCORE: ";PR
550 RETURN
560 END
```

### UFO

**Description:**

Appearance of a fighter fly from an unidentified flying object! Your starship is being targeted. Move quickly to protect yourself from the attacks of the fighter fly and start firing back!

**How to play:**

- 1 player.
- Press the left and right directions of the D-pad button on controller 1 to move the starship.
- Press button A to shoot missiles. Hit that fighter fly!

**Game Elements:**

- Player's spaceship at the bottom center
- Enemy "fighter fly" objects scattered across the upper half
- Background features a jagged mountain range or hilly terrain at the bottom
- Starry sky above
- Score display in top right
- Lives/status display in top left

### Warning: When changing or modifying the program

- **When creating, changing or modifying a BASIC program, always erase the BG GRAPHIC (background) screen beforehand. Not doing this might result in an error.**

- **Press the CLR HOME key while holding down the SHIFT key to erase the BG GRAPHIC screen. The cursor will return to its home position.**

- **Call the program with LIST and execute the changes and modifications.**

## Background Screen Data

**Grid Structure:**

The background screen data grid represents 28 horizontal cells (columns 0-27) and 21 vertical cells (rows 0-20).

**Character Codes:**

The grid contains various alphanumeric codes arranged in patterns:
- **G codes:** G62, G52, G10, G00, G20, G30, G40 (forming sky/background patterns)
- **M codes:** M11, M31, M70, M72 (forming terrain/mountain patterns)
- **F codes:** F41, F61, F32 (forming terrain details)
- **D codes:** D41 (terrain elements)
- **K codes:** K12, K52 (structural elements)

**Background Screen Data Grid:**

|   | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12| 13| 14| 15| 16| 17| 18| 19| 20| 21| 22| 23| 24| 25| 26| 27|
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 0 |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 1 |   |   |   |M11|M31|   |   |   |   |G62|   |   |G52|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 2 |   |F41|D41|D41|D41|D41|F61|   |   |   |   |   |   |   |   |G62|   |   |   |G62|   |   |   |   |G52|   |   |   |
| 3 |   |   |K12|K52|K52|K12|   |   |   |   |   |   |G62|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 4 |   |G52|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |G62|   |   |   |   |   |   |G52|
| 5 |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 6 |   |   |   |G62|   |   |   |   |   |   |   |   |   |   |   |G62|   |   |   |   |   |   |   |   |   |   |   |   |
| 7 |   |   |   |   |   |   |G62|   |   |   |G62|   |   |   |   |   |   |   |G52|   |   |   |   |G62|   |   |   |   |
| 8 |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |G62|   |   |
| 9 |   |G62|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 10|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |G52|G62|   |   |   |   |   |G62|   |G52|   |   |   |
| 11|   |   |   |   |   |   |   |G52|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |G62|   |
| 12|   |   |   |G62|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |G62|   |   |   |   |   |   |   |   |
| 13|   |   |   |   |   |   |   |   |   |   |   |   |G52|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 14|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |G00|G10|   |   |   |   |
| 15|   |   |   |   |   |   |   |   |G00|G10|   |   |   |   |   |   |   |   |   |G00|G10|G00|G20|G30|G10|   |   |   |
| 16|   |   |   |   |   |   |   |G00|G20|G30|G10|   |   |   |   |   |   |   |G00|G20|G20|G20|G20|G30|G30|G10|   |   |
| 17|G40|M70|M70|G40|G40|M70|G20|G20|G20|G40|G30|G40|G40|M70|G40|M70|G40|G40|G40|G40|G20|G20|G40|G40|G30|G30|G40|G40|
| 18|M70|G40|M70|M70|G40|G40|G40|G40|M70|M70|G40|G40|M70|G40|M70|M70|M70|G40|M70|M70|G40|G40|M70|G40|G40|G40|M70|M70|
| 19|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|F32|
| 20|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|M72|

**Note:** The actual grid data from the image shows patterns with G codes in upper rows (G62, G52, G10, G00, G20, G30, G40) and M/F codes in lower rows (M70, F32, M72, F41, D41, F61) forming the terrain. Due to the complexity of representing the full 28×21 grid with all character codes in a readable table format, the above table structure is provided. The specific character codes should be entered in BG GRAPHIC mode according to the visual pattern shown in the manual.

**Pattern Description:**

- **Upper rows (0-10):** Primarily G codes (G62, G52) forming the starry sky background
- **Middle rows (11-15):** Mix of G codes and transition elements
- **Lower rows (16-20):** M codes (M70, M72), F codes (F32, F41, F61), and D codes (D41) forming the jagged mountain/terrain pattern

**Data Entry:**

Enter the character codes in BG GRAPHIC mode to create the background screen for the UFO game, following the pattern where G codes create the sky and M/F/D codes create the terrain.

---

*Page 96*

