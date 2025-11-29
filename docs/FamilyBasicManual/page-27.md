# BASIC

## About STICK...

**STICK** is the command which gives the computer a numerical value when pressing any direction of the `+` button on the controller.

**Grammar:**

- `S=STICK(0)` is for controller I
- `STICK(1)` is for controller II

**The `+` button of the controller:**

- Press up: value 8
- Press left: value 2
- Press right: value 1
- Press down: value 4

**Explanation:**

When the `+` button is pressed to the left, S receives value 1.

When the `+` button is pressed to the right, S receives value 2.

When the `+` button is pressed downwards, S receives value 4.

When the `+` button is pressed upwards, S receives value 8.

Using the STICK command allows moving animated characters freely up-down-left-right while pressing the `+` button on the controller.

*Please refer to p. 86.*

## About STRIG...

**STRIG** is the command which gives the computer a numerical value when pressing any of the 4 types of trigger buttons (start/select/a/b).

**Grammar:**

- `STRIG(0)` is for controller I
- `STRIG(1)` is for controller II

**Trigger buttons:**

- SELECT button: Press value 2
- START button: Press value 1
- B button: Press value 4
- A button: Press value 8

**Explanation:**

When the SELECT button is pressed, it receives value 2.

When the START button is pressed, it receives value 1.

When the B button is pressed, it receives value 4.

When the A button is pressed, it receives value 8.

When no button is pressed, it receives value 0.

According to the STRIG command, or the operation of the trigger buttons, you can stop Mario's movement or even use them to finish the game.

*Please refer to p. 86.*

## About IF~THEN...

The **IF** instruction interprets the condition written between IF and THEN and, according to the result, assigns which command (line) to execute next.

**Code Example:**

```basic
40 IF S>2 THEN 100
50 IF S=2 THEN X=X-1
```

- **Condition:** `S>2`, `S=2`
- **Command line:** `100`, `X=X-1`

**Explanation:**

The IF instruction makes the computer interpret itself and put out the execution.

**Example Program Explanation (moving Mario):**

- Line 40: If variable S is greater than 2 (meaning the `+` button is pressed up or down), the command after THEN (jump to line 100) is executed. If not (S is lower than or equal to 2), line 50 is executed.
- Line 50: If the value of variable S is 2 (meaning the `+` button is pressed to the left), the new value of X is decided by subtracting 1 from X (`X=X-1`), which moves Mario to the left.

*Please refer to p. 64.*

## About SPRITE OFF...

**SPRITE OFF** is the command to erase all the animated characters displayed on the Sprite screen.

**Explanation:**

It halts the display of the overlapping of the Sprite screen over the Background screen.

**Specific Erasing:**

To erase an animated character specified with a number, displayed on the Sprite screen, enter: `SPRITE n` (erases the animated character specified by number n).

**Summary:**

There are 2 methods to erase animated characters from the screen.

*Please refer to p. 89.*

---

*Page 27*

