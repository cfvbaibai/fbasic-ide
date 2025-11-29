# BASIC

## When you want to move Mario freely up-down-left-right

**When you want to move Mario freely up-down-left-right, use program 5 on p. 28 and enter the lines from no. 60 to 130 and from 3000 to 3020.**

### Program 6

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
60 S=STICK(0): IF STRIG(0)<>0 THEN END
65 IF S=0 THEN 60
70 IF S>2 THEN 100
80 X=X+2: IF S=2 THEN X=X-4
90 GOTO 101
100 Y=Y+2: IF S=8 THEN Y=Y-4
101 IF X>255 THEN X=X-252
102 IF X<3 THEN X=X+252
103 IF Y>240 THEN Y=Y-237
104 IF Y<3 THEN Y=Y+237
110 IF S=1 THEN 1000
120 IF S=2 THEN 2000
130 IF S>2 THEN 3000
1000 PAUSE 5: SPRITE C,X,Y: SWAP C,D
1010 SPRITE A: SPRITE B: SPRITE C: SPRITE E: SPRITE F
1020 GOTO 60
2000 PAUSE 5: SPRITE A,X,Y: SWAP A,B
2010 SPRITE A: SPRITE C: SPRITE D: SPRITE E: SPRITE F
2020 GOTO 60
3000 PAUSE 5: SPRITE E,X,Y: SWAP E,F
3010 SPRITE A: SPRITE B: SPRITE C: SPRITE D: SPRITE E
3020 GOTO 60
```

**Program Features:**

This program is based on program 5 on p. 28 but we have made additions in order to make Mario move up and down, that he does not stick out of the screen and also a way to finish the program.

**Additions:**

- **Up-down movement and display of Mario:** Done with lines number 100, 130 and from 3000 to 3020.
- **Screen boundary handling:** Mario does not stick out of the screen thanks to the lines from number 101 to 104.
- **Program termination:** On the lines from number 60 to 65, there is an STRIG command to finish the program using the trigger buttons of the controller.

**Movement Directions:**

- **Right:** S=1 (jumps to line 1000)
- **Left:** S=2 (jumps to line 2000)
- **Up/Down:** S>2 (S=4 for down, S=8 for up, jumps to line 3000)

**Screen Boundary Wrapping:**

- Lines 101-102: Wraps X coordinate (left-right boundaries)
- Lines 103-104: Wraps Y coordinate (up-down boundaries)

---

*Page 30*

