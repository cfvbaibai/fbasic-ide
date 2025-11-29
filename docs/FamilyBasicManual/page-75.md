# BASIC

## MOVE

**Working**

Starts the movement of the animated character.

**Grammar**

```
MOVE n0[, n1, n2, n3, n4, n5, n6, n7]
```

- `n0~n7`: Represents the action number, which is defined by the `DEF MOVE` command and ranges from 0 to 7.

**Abbreviation**

M.

**Explanation**

Initiates the movement of animated characters that were previously defined using the `DEF MOVE` command.

Requires `SPRITE ON` to enable the display of sprites.

Allows simultaneous movement of up to 8 animated characters.

Once a `MOVE` sentence is executed, the animated characters move asynchronously to the BASIC controls until the movement specified by `DEF MOVE` ends. This means they continue moving even if the program itself ends, completing their defined distance, direction, and speed.

Up to 4 characters can be displayed on the same horizontal direction on the sprite screen.

## CUT

**Working**

Stops the movement of animated characters started in a MOVE sentence.

**Grammar**

```
CUT n0[, n1, n2, n3, n4, n5, n6, n7]
```

- `n0~n7`: Represents the action number, defined by `DEF MOVE`, ranging from 0 to 7.

**Abbreviation**

CU.

**Explanation**

Stops the movement of specified animated characters that were initiated by a `MOVE` sentence.

Up to 8 characters can be specified simultaneously.

If the movement of these characters is restarted after a `CUT` command (using the same action numbers), they will resume moving from the exact position where they stopped, continuing until they complete the remaining portion of the total movement distance (D) originally defined by `DEF MOVE`.

**Sample Program**

```basic
CUT 0,1,2
OK
10 CUT 0, 1, 2, 3, 4, 5, 6, 7
```

## ERA

**Working**

Stops the movement of animated characters started with a MOVE sentence and erases them from the sprite screen.

**Grammar**

```
ERA n0[, n1, n2, n3, n4, n5, n6, n7]
```

- `n0~n7`: Represents the action number, defined by `DEF MOVE`, ranging from 0 to 7.

**Abbreviation**

ER.

**Explanation**

Erases animated characters from the display. This applies to characters whose movement was started by a `MOVE` sentence, stopped by a `CUT` sentence, or whose movement was completed.

If the movement of these characters is restarted after an `ERA` command (using the same action numbers), they will reappear at the position where they disappeared and continue moving until they complete the remaining portion of the total movement distance (D) originally defined by `DEF MOVE`.

**Sample Program**

```basic
ERA 0,1,2
OK
10 ERA 0, 1, 2, 3, 4, 5, 6, 7
```

---

*Page 75*

