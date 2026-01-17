# BASIC

## Sample program 5

### ** EXERCISE 5 ** - TYPE MASTER

**Program Listing:**

```basic
10 CGEN 3:CGSET 1,1
20 VIEW
30 PLAY "T120"
40 PO=0:PP=0
50 DIM A$(10),B$(10)
60 FOR I=0 TO 9
70 A$(I)=CHR$(48+I)
80 NEXT
90 FOR I=0 TO 9
100 READ B$(I)
110 NEXT
120 DEF SPRITE 0,(0,1,0,0,0)=CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
130 SPRITE ON
140 LOCATE 0,0:PRINT "TYPE"
150 FOR I=0 TO 9
160 LOCATE I*2+2,1:PRINT A$(I)
170 NEXT
180 LOCATE 10,3:PRINT "THIS..."
190 LOCATE 15,3:PRINT CHR$(0)
200 LOCATE 0,4:PRINT "     "
210 PAUSE 60
220 FOR I=0 TO 9
230 SWAP A$(I),A$(RND(1)*10)
240 NEXT
250 FOR I=0 TO 9
260 LOCATE I*2+2,1:PRINT A$(I)
270 NEXT
280 GOSUB 400
290 K$=INKEY$
300 IF K$="" THEN 290
310 IF ASC(K$)<48 OR ASC(K$)>57 THEN 290
320 FOR I=0 TO 9
330 IF A$(I)=K$ THEN 360
340 NEXT
350 GOTO 290
360 IF I=PP THEN 380
370 GOTO 290
380 PO=PO+1
390 IF PO>9 THEN 200
400 REM * SOUND *
410 FOR J=0 TO 5
420 GOSUB 400
430 NEXT
440 RETURN
450 DATA "0","1","2","3","4","5","6","7","8","9"
460 FOR J=0 TO 5:GOSUB 400: NEXT: RETURN
```

**Note:** The program listing above is a reconstruction based on the visible commands. Some lines may need adjustment based on the actual game logic. The DATA statements and subroutine structure may require refinement.

### TYPE MASTER

**Description:**

Remembering the placement of keys is hard, right? But, it's all right. Let's memorize their placement while having fun by playing TYPE MASTER! Can you become a master typist?

**How to play:**

1 player.

- **Objective:** Search the keys and enter the same letters, numbers or symbols which appear to the right in the middle.
- **Gameplay:** 
  - Numbers are displayed at the top (9 8 7 6 5 4 3 2 1 0)
  - A target character appears in the middle ("THIS..." followed by a character)
  - Player must find and type the matching character
  - If the flag moves completely to the right, time is up.

**Game Elements:**

- Top display: Numbers 9-0 in a row with a pointer indicator
- Middle display: "THIS..." followed by a target character to type
- Bottom display: Input area for player's typed characters
- Score tracking based on correct matches

### Warning: When changing or modifying the program

- **When creating, changing or modifying a BASIC program, always erase the BG GRAPHIC (background) screen beforehand. Not doing this might result in an error.**

- **Press the CLR key while holding down the SHIFT key to erase the BG GRAPHIC screen. The cursor will return to its home position.**

- **Call the program with LIST and execute the changes and modifications.**

## Background Screen Data

**Grid Structure:**

The background screen data grid represents 28 horizontal cells (columns 0-27) and 21 vertical cells (rows 0-20).

**Character Codes:**

The grid contains various alphanumeric codes arranged in patterns:
- **K codes:** K72, K52, K62, K22 (forming borders and frames)
- **L codes:** L02, L12, L22 (forming borders)
- **J codes:** J30, J20, J00, J10, J32, J22, J02, J12, J33, J23, J03, J13 (forming text boxes and frames)
- **I codes:** I60, I70, I62, I72, I63, I73 (forming corner elements)
- **Text:** "TYPE" appears in row 1, columns 14-17

**Background Screen Data Grid:**

|   | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10| 11| 12| 13| 14| 15| 16| 17| 18| 19| 20| 21| 22| 23| 24| 25| 26| 27|
|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| 0 |   |K72|K52|K52|K52|K52|L02|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 1 |   |K62| T | Y | P | E |K62|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 2 |   |L12|K52|K52|K52|K52|L22|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 3 |   |I60|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|I70|   |   |   |   |
| 4 |   |J20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |J20|   |   |   |   |
| 5 |   |J20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |J20|   |   |   |   |
| 6 |   |J00|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J30|J10|   |   |   |   |
| 7 |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 8 |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 9 |   |I60|J30|J30|J30|J30|J30|J30|J30|J30|J30|I70|I62|J32|I72|   |   |   |   |   |   |   |   |   |   |   |   |   |
| 10|   |J20|   |   |   |   |   |   |   |   |   |J20|J22|   |J22|   |   |   |   |   |   |   |   |   |   |   |   |   |
| 11|   |J00|J30|J30|J30|J30|J30|J30|J30|J30|J30|J10|J02|J32|J12|   |   |   |   |   |   |   |   |   |   |   |   |   |
| 12|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 13|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 14|   |I63|J33|J33|J33|J33|J33|J33|J33|J33|J33|J33|J33|J33|J33|J33|I73|   |   |   |   |   |   |   |   |   |   |   |
| 15|   |J23|   |   |   |   |   |   |   |   |   |   |   |   |   |   |J23|   |   |   |   |   |   |   |   |   |   |   |
| 16|   |J23|   |   |   |   |   |   |   |   |   |   |   |   |   |   |J23|   |   |   |   |   |   |   |   |   |   |   |
| 17|   |J03|J33|J33|J33|J33|J33|J33|J33|J33|J33|J33|J33|J33|J33|J33|J13|   |   |   |   |   |   |   |   |   |   |   |
| 18|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 19|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |
| 20|   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |   |

**Pattern Description:**

- **Row 0:** Top border with K codes and corner elements, "TYPE" title frame
- **Row 1:** "TYPE" text in a bordered frame (K62 borders)
- **Row 2:** Bottom border of "TYPE" frame
- **Rows 3-6:** Large text input box frame (I60, J30, J20, J00, J10 pattern)
- **Rows 7-8:** Empty space
- **Rows 9-11:** Smaller frame/box in upper left area (I60, I70, I62, I72, J codes)
- **Rows 12-13:** Empty space
- **Rows 14-17:** Medium-sized frame/box (I63, I73, J33, J23, J03, J13 pattern)
- **Rows 18-20:** Empty space

**Data Entry:**

Enter the character codes in BG GRAPHIC mode to create the background screen for the TYPE MASTER game. The grid shows various text boxes and frames for displaying game elements, including the "TYPE" title, input areas, and display boxes.

---

*Page 98*

