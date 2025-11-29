# BASIC

## Let's have 8 Mario's march horizontally

**Please use program 6 on p. 31 and enter:**

```basic
40 DEF MOVE(N)=SPRITE(0,3,N+1,255,0,0)
55 FOR N=0 TO 3:POSITION 2*N+1,120,180:NEXT
70 END
RUN
```

**Explanation:**

8 Mario's are walking from left to right.

**Program Details:**

- Line 40: Defines a movement pattern for a sprite (Mario, type 0) with:
  - Direction: N+1 (varies for each sprite)
  - Speed: 3
  - Distance: 255
  - Display priority: 0
  - Color combination: 0
- Line 55: Sets the initial position for sprites N=0 to 3 using POSITION command
- Line 70: Ends the program

## Hey Mario, stop!

**You can stop all the characters which are moving at the same time, or you can stop one specific character. Please add the following to the program from above:**

```basic
70 PAUSE
80 CUT 0,1,2,3,4,5,6,7
90 END
RUN
```

**Stopping all Marios:**

Please press the SPACE key once when the 8 Mario's are walking. As soon as you press the SPACE key, the command on line number 80 is executed and the 8 Mario's who were walking, stop walking exactly at the same time.

**Restarting specific Marios:**

When you enter `MOVE 0,2 [RETURN]` only action number 0 and 2 Mario which had stopped, will start walking.

**Stopping specific Marios:**

Please enter also:

```basic
80 CUT 0,3
RUN
```

Please press the SPACE key once when the 8 Mario's start walking. Only action number 0 and 3 Mario stop walking, all the other Mario's continue walking from left to right as if nothing happened.

**CUT command usage:**

You can use the CUT command in direct mode and program mode.

## Ah! Mario has disappeared!

**Making animated characters disappear from the screen is a very important technique to make games more interesting. You can erase 8 types of characters simultaneously or only erase specific characters. Please enter:**

```basic
80 ERA 0,1,2,3,4,5,6,7
RUN
```

**Erasing all Marios:**

Please press the SPACE key once when the 8 Mario's start walking. The command on line number 80 is executed and the 8 walking Mario's disappear.

**Making specific Marios appear/disappear:**

When you enter `MOVE 0,1 [RETURN]` action number 0 and 1 Mario appear and start walking.

Please also enter:

```basic
80 ERA 3,4
RUN
```

Please press the SPACE key once when the 8 Mario's start walking. Only action number 3 and 4 Mario disappear, the other Mario's continue walking from left to right, as if nothing happened.

**ERA command usage:**

The ERA command can be used in Direct Mode and in Program Mode.

## Concluding Note

**When you execute a MOVE command after a CUT or ERA command, the animated character will execute the remaining value of the value of D (total movement volume) defined by the DEF MOVE command starting from the position which was CUT or ERAsed, and stop.**

This means that if a character was stopped or erased before completing its full movement distance, restarting it with MOVE will cause it to continue from where it stopped/erased, moving only the remaining distance.

---

*Page 33*

