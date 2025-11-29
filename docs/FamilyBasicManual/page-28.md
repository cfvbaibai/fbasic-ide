# BASIC

## Let's make Mario walk with the controller

**Enter the following program to show Mario walking to the left or to the right. Halt the "Let's move Mario left and right with the controller" program of p. 26 and enter the lines from number 30 to 2020 from Program 5 below.**

*In case the cursor or the program does not appear on screen, press the [STOP] key to make the cursor appear and use LIST to call the program.*

### Program 5

**Program Listing:**

```basic
5 CLS
10 SPRITE ON
15 CGSET 1,0
20 DEF SPRITE 0,(0,1,0,1,0)=CHR$(1)+CHR$(0)+CHR$(3)+CHR$(2)
21 DEF SPRITE 1,(0,1,0,0,0)=CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)
22 DEF SPRITE 2,(0,1,0,1,0)=CHR$(5)+CHR$(4)+CHR$(7)+CHR$(6)
23 DEF SPRITE 3,(0,1,0,0,0)=CHR$(4)+CHR$(5)+CHR$(6)+CHR$(7)
24 DEF SPRITE 4,(0,1,0,0,0)=CHR$(20)+CHR$(21)+CHR$(22)+CHR$(23)
25 DEF SPRITE 5,(0,1,0,1,0)=CHR$(21)+CHR$(20)+CHR$(23)+CHR$(22)
26 X=100
30 READ X,Y,A,B,C,D,E,F
40 DATA 120,140,1,3,0,2,4,5
50 SPRITE A,X,Y
60 S=STICK(0): IF S=0 THEN 60
70 IF S>2 THEN 60
80 X=X+2: IF S=2 THEN X=X-4
90 IF S=1 THEN 1000
100 IF S=2 THEN 2000
1000 PAUSE 5: SPRITE C,X,Y: SWAP C,D
1010 SPRITE A: SPRITE B: SPRITE C: SPRITE E: SPRITE F
1020 GOTO 60
2000 PAUSE 5: SPRITE A,X,Y: SWAP A,B
2010 SPRITE A: SPRITE C: SPRITE D: SPRITE E: SPRITE F
2020 GOTO 60
```

**Line-by-Line Explanations:**

**Setup (Lines 5-15):**
- Line 5: `CLS` - Erases the display on-screen.
- Line 10: `SPRITE ON` - Prepares the display of animated characters on-screen.
- Line 15: `CGSET 1,0` - Fixes the color of the animated characters and the backdrop.

**DEF SPRITE definitions (Lines 20-25):**
- Line 20: `DEF SPRITE 0,(0,1,0,1,0)=CHR$(1)+CHR$(0)+CHR$(3)+CHR$(2)` - Fixes the pattern of WALK1 Mario (facing left) (Mario No. 0)
- Line 21: `DEF SPRITE 1,(0,1,0,0,0)=CHR$(0)+CHR$(1)+CHR$(2)+CHR$(3)` - Fixes the pattern of WALK1 Mario (Mario No. 1).
- Line 22: `DEF SPRITE 2,(0,1,0,1,0)=CHR$(5)+CHR$(4)+CHR$(7)+CHR$(6)` - Fixes the pattern of WALK2 Mario (facing right) (Mario No. 2).
- Line 23: `DEF SPRITE 3,(0,1,0,0,0)=CHR$(4)+CHR$(5)+CHR$(6)+CHR$(7)` - Fixes the pattern of WALK2 Mario (Mario No. 3).
- Line 24: `DEF SPRITE 4,(0,1,0,0,0)=CHR$(20)+CHR$(21)+CHR$(22)+CHR$(23)` - Fixes the pattern of ladder Mario (Mario No. 4).
- Line 25: `DEF SPRITE 5,(0,1,0,1,0)=CHR$(21)+CHR$(20)+CHR$(23)+CHR$(22)` - Fixes the pattern of ladder Mario (left-right inverted) (Mario No. 5).

*Refer to back cover "Character Table A".*

**Initialization and Display (Lines 26-50):**
- Line 26: `X=100` - Fixes the X coordinate to 100.
- Line 30: `READ X,Y,A,B,C,D,E,F` - Reads the data from X to F (enters a value in the number (variable) of each type of Mario and the position coordinates which display Mario)
- Line 40: `DATA 120,140,1,3,0,2,4,5` - Data read by the READ command.
- Line 50: `SPRITE A,X,Y` - Displays Mario No. 1 at the (X:120, Y:140) coordinate position.

**Controller Input and Movement Logic (Lines 60-100):**
- Line 60: `S=STICK(0): IF S=0 THEN 60` - Checks if the D-pad button has been pressed. If it hasn't been pressed (S=0), it re-executes line number 60.
- Line 70: `IF S>2 THEN 60` - When the D-pad button is pressed up or down (Y direction) it jumps to line no. 60
- Line 80: `X=X+2: IF S=2 THEN X=X-4` - When facing right, it adds 2 to the value of X. When facing left, it subtracts 4 from the value of X.
- Line 90: `IF S=1 THEN 1000` - Jumps to line number 1000 when facing right.
- Line 100: `IF S=2 THEN 2000` - Jumps to line number 2000 when facing left.

*Decisive conditions*

**Right Movement Animation (Lines 1000-1020):**
- Line 1000: `PAUSE 5: SPRITE C,X,Y: SWAP C,D` - Displays Mario No. 0. When right is pressed on the D-pad button, Mario No. 0 and No. 2 are swapped. The other Mario characters (1, 3, 0, 4 and 5) disappear.
- Line 1010: `SPRITE A: SPRITE B: SPRITE C: SPRITE E: SPRITE F`
- Line 1020: `GOTO 60`

**Left Movement Animation (Lines 2000-2020):**
- Line 2000: `PAUSE 5: SPRITE A,X,Y: SWAP A,B` - Displays Mario No. 1. When left is pressed on the D-pad button, Mario No. 1 and No. 3 are swapped. The other Mario characters (1, 0, 2, 4 and 5) disappear.
- Line 2010: `SPRITE A: SPRITE C: SPRITE D: SPRITE E: SPRITE F`
- Line 2020: `GOTO 60`

**Execution:**

Please enter: `RUN [RETURN]`

When you press the D-pad button on controller I (left side or right side) you can see that Mario is walking smoothly to the left or to the right.

**Warning:**

*Try not to let Mario stick out to the left or to the right of the screen. If Mario sticks out, an error arises and Mario stops. Please enter RUN [RETURN] again to move Mario once more.*

---

*Page 28*

