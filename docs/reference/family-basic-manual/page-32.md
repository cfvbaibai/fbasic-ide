# BASIC

## About DEF MOVE...

**DEF MOVE** is the command used to assign the type and movement of animated characters.

**Grammar**

```
DEF MOVE(n)=SPRITE(A,B,C,D,E,F)
```

- `n`: Animated character's action number (0 to 7).
- `A`: Animated character's type (0 to 15), allowing up to 16 kinds of animated characters.
- `B`: Movement direction (0 to 8), where 0 means inactivity.
- `C`: Movement speed (1 to 255), with 1 being fastest and 255 slowest.
- `D`: Total movement distance (1 to 255), where 0 means the character is not displayed.
- `E`: Display priority (0 or 1), where 0 displays in front of the background and 1 behind.
- `F`: Animated character's color set number (0 to 3), with a note to refer to the color chart on page 113.

**List of 16 Animated Character Types:**

| Type | Character Name |
|------|----------------|
| 0    | Mario          |
| 1    | Lady           |
| 2    | Fighter Fly    |
| 3    | Achilles       |
| 4    | Penguin        |
| 5    | Fireball       |
| 6    | Car            |
| 7    | Spinner        |
| 8    | Star Killer    |
| 9    | Starship       |
| 10   | Explosion      |
| 11   | Smiley         |
| 12   | Laser          |
| 13   | Shell Creeper  |
| 14   | Side Stepper   |
| 15   | Nitpicker      |

**Movement Direction:**

A square diagram illustrates 8 possible movement directions (1-8) radiating from a central point (Direction 0, representing inactivity).

- Direction 0: Inactivity (no movement)
- Direction 1: Up
- Direction 2: Up-right
- Direction 3: Right
- Direction 4: Down-right
- Direction 5: Down
- Direction 6: Down-left
- Direction 7: Left
- Direction 8: Up-left

*Please refer to p. 74.*

## About MOVE...

**MOVE** is the command that starts the movement of animated characters defined by `DEF MOVE`.

**Example Usage:**

```basic
MOVE 0, 1, 2, 3, 4, 5, 6, 7
```

**Explanation:**

The `MOVE` command can start up to 8 animated characters simultaneously. Characters move until their defined movement volume (parameter D in `DEF MOVE`) reaches 0. Users can select specific action numbers (0 to 7) to move.

**Specific Examples:**

- `MOVE 1`: Only moves the animated character of action number 1.
- `MOVE 0, 3, 6`: Moves animated characters of action numbers 0, 3, and 6 simultaneously.

*Please refer to p. 75.*

## Let's simultaneously move 8 types of animated characters in 8 directions

**Description:**

Similar to Mario, 8 different characters can be moved simultaneously.

**Instructions:**

Use program 6 on p. 31 and enter:

```basic
40 DEF MOVE(N)=SPRITE(N,N+1,3,255,0,0)
```

**Execution:**

Upon entering `RUN [RETURN]`, 8 types of characters, such as Mario, Lady, Penguin etc., will move from the center of the screen to the borders of the screen.

**Program Explanation:**

- Line 40: Defines movement for each character type (N=0 to 7) where:
  - Character type: N (uses different character for each)
  - Direction: N+1 (each moves in a different direction)
  - Speed: 3
  - Distance: 255
  - Display priority: 0
  - Color combination: 0

**Visual Result:**

Eight different animated characters move outward from a central point in 8 different directions, each character type moving in its own direction.

---

*Page 32*

