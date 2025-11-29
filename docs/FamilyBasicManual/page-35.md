# BASIC

## Let's use the controller to move Mario

**Let's try to move Mario up, down, left, right while using controller I. Please enter the following program.**

**Program Listing:**

```basic
5 CLS
10 SPRITE ON
20 CGSET 1,0
30 FOR N=0 TO 7
40 DEF MOVE (N)=SPRITE(0,N,1,3,0,0)
50 NEXT
60 S=STICK(0)
70 IF S=0 THEN N=0: GOTO 120
80 IF S=1 THEN N=3: GOTO 120
90 IF S=2 THEN N=7: GOTO 120
100 IF S=4 THEN N=5: GOTO 120
110 IF S=8 THEN N=1
120 IF MOVE (M)=-1 THEN 120
130 IF M=N THEN 160
140 ERA M: POSITION N, XPOS(M), YPOS(M): M=N
150 MOVE N: GOTO 60
160 MOVE M: GOTO 60
```

**Program Explanation:**

- Lines 30-50: Defines 8 movement patterns (N=0 to 7) for different directions
- Line 60: Reads controller I D-pad input
- Lines 70-110: Maps STICK values to movement directions:
  - S=0: No movement (N=0)
  - S=1: Right (N=3)
  - S=2: Left (N=7)
  - S=4: Down (N=5)
  - S=8: Up (N=1)
- Line 120: Waits for current movement M to complete
- Line 130: Checks if new direction N is the same as current direction M
- Line 140: If different direction, erases old sprite, positions new sprite at old position, sets M=N
- Line 150: Starts new movement N and loops back
- Line 160: If same direction, continues current movement M

**Execution:**

When you enter `RUN [RETURN]` you can move Mario freely around while using controller I.

Compare this program to the one on page 30 and you will see that to execute the same actions, using the MOVE command will help you shorten the program.

## The specialties of the MOVE command

1. **You can press the [blank space] key while executing the program of the MOVE command and display the program list, correct the program, etc.**

2. **While executing the MOVE command, the tempo of the performance becomes slower (1/2).**

3. **You can instruct the movement of up to 8 types of characters simultaneously with the MOVE command. However, for animated characters, you can only instruct up to 4 simultaneously horizontally.**

4. **You can use 16 types of characters with the MOVE command.**

5. **You can move 16 types of characters by combining and using the DEF SPRITE and SPRITE commands.**

---

*Page 35*

