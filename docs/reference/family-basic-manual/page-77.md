# BASIC

## MOVE (n)

**Working**

Provides whether or not the animated characters, of the action numbers which started their movement through the MOVE sentence, have finished their movement defined by DEF MOVE via the value of the function.

**Grammar**

```
MOVE (n)
```

- `n`: Action number of the animated characters defined by DEF MOVE (0 to 7).

**Abbreviation**

M. (n)

**Explanation**

The value granted by this function may differ depending on the movement of the animated character of which the movement was started by the MOVE sentence.

The MOVE(n) function grants value -1 when the movement defined by DEF MOVE is still being executed, and 0 when the movement is finished, to the animated characters for which the movement has been specified by DEF MOVE.

**Sample Program**

```basic
10 REM * MOVE (N) *
20 SPRITE ON :CGSET 1,0
30 DEF MOVE (0)=SPRITE (0,3, 1, 150, 0, 0)
40 MOVE 0
50 IF MOVE (0)=-1 THEN PRINT" MOVE (0) =";MOVE (0):GOTO 50
60 PRINT "MOVE (0)="; MOVE (0)
70 END
```

**Explanation of Sample Program:**

- Line number 30: Specifies Mario to move 300 dots to the right.
- Line number 50: Distinguishes the value of MOVE(0) and decides whether Mario has finished moving or not.
- Line number 60: Displays MOVE(0)=0 when Mario has finished moving.

---

*Page 77*

