# BASIC

## Let's make Mario jump

**Enter the following program to make it look as if Mario is jumping.**

**Program Listing:**

```basic
5 CLS
10 SPRITE ON
20 CGSET 1,0
30 FOR N=2 TO 4
40 DEF MOVE(N)=SPRITE(0,N,1,20,1,0)
50 NEXT
60 MOVE 3
70 IF MOVE(3)=-1 THEN 70
80 ERA 3: POSITION 2, XPOS(3), YPOS(3): MOVE 2
90 IF MOVE(2)=-1 THEN 90
100 ERA 2: POSITION 4, XPOS(2), YPOS(2): MOVE 4
110 IF MOVE(4)=-1 THEN 110
120 ERA 4: POSITION 3, XPOS(4), YPOS(4): GOTO 60
```

**Movement Sequence:**

1. **MOVE 3**: Straight horizontal movement (walking)
2. **MOVE 2**: Upward arc movement (jumping up)
3. **MOVE 4**: Downward arc movement (landing)

**Visual Representation:**

- Mario starts on the left, walking horizontally
- Mario jumps in the middle, following an upward curve
- Mario lands on the right, following a downward curve
- The cycle repeats

**Execution:**

Upon entering `RUN [RETURN]`, Mario will walk from the left, jump in the middle, and then resume walking upon landing.

**Sound Effect Integration:**

Enter the following as well if you would like to add a sound effect synchronized with Mario's movement:

```basic
65 PLAY "T104C1B1DEG1CDE1"
85 PLAY "O3CDE1G1A"
```

## About MOVE (n)...

**MOVE(n)** is a command to request the execution or halt of an animated character's movement.

**Grammar**

```
MOVE(n)
```

- `n`: Action number of the animated character (0 to 7)

**Return Values:**

- If the animated character is in the middle of an action, -1 can be requested.
- If the animated character has halted the action, 0 can be requested.

**Program Explanation:**

Specifically explains lines 70 and 80 of the main program:

- Line 70: `IF MOVE(3)=-1 THEN 70` checks if action number 3 is executing. If so, it loops back to line 70; otherwise, it proceeds to line 80.
- This pattern is used throughout the program to wait for each movement to complete before starting the next one.

*Please refer to page 77.*

## About POSITION...

**POSITION** is the command to set the initial coordinates for an animated character before its movement starts.

**Grammar**

```
POSITION n, X, Y
```

- `n`: Action number of the animated character (0 to 7)
- `X`: Horizontal coordinate (0 to 255)
- `Y`: Vertical coordinate (0 to 255)

**Usage in Program:**

- Line 80: `POSITION 2, XPOS(3), YPOS(3)` - Sets the starting position for action 2 (jump up) at the current position of action 3 (walking)
- Line 100: `POSITION 4, XPOS(2), YPOS(2)` - Sets the starting position for action 4 (landing) at the current position of action 2 (jump up)
- Line 120: `POSITION 3, XPOS(4), YPOS(4)` - Sets the starting position for action 3 (walking) at the current position of action 4 (landing)

*Please refer to page 76.*

## About XPOS, YPOS...

**XPOS** is the command to request the horizontal coordinate value and **YPOS** for the vertical coordinate value of an animated character's action number.

**Grammar**

```
XPOS(n), YPOS(n)
```

- `n`: Action number of the animated character (0 to 7)

**Usage in Program:**

These functions are used to get the current position of a sprite after it completes a movement, so the next movement can start from that exact position, creating smooth transitions between different movement patterns.

*Please refer to page 76.*

---

*Page 34*

