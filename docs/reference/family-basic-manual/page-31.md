# BASIC

## About the MOVE command

The `MOVE` command is specific to Family Basic and allows dynamic movement of characters like Mario or Lady.

## Let's move Mario in 8 directions simultaneously

**Instructions:**

Enter `NEW [RETURN]` to erase the previous program.

**Program 6**

```basic
5 CLS
10 SPRITE ON
20 CGSET 1,0
30 FOR N=0 TO 7
40 DEF MOVE (N)=SPRITE (0,N+1,3,255,0,0)
50 NEXT
60 MOVE 0,1,2,3,4,5,6,7
70 GOTO 60
```

**Execution:**

When you enter `RUN [RETURN]` 8 Mario's will move into 8 different directions.

**Program Explanation:**

- Lines 30-50: Defines 8 different movement patterns (N=0 to 7) using a FOR loop
- Line 40: Each DEF MOVE defines a sprite with:
  - Character type: 0 (Mario)
  - Direction: N+1 (directions 1-8)
  - Speed: 3
  - Distance: 255
  - Display priority: 0
  - Color combination: 0
- Line 60: Starts movement for all 8 Mario sprites simultaneously
- Line 70: Loops back to continue movement

**Visual Result:**

Eight Mario sprites move outward from a central point in 8 different directions:
- Up
- Up-right
- Right
- Down-right
- Down
- Down-left
- Left
- Up-left

---

*Page 31*

