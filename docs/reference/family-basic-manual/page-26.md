# BASIC

## Let's move it with the controller

**Let's expand the fun of the games even more by making game programs in which you can use the controller, or even games for two players!**

### Family Computer and Controllers

The Family Computer console has two controller ports:
- **Controller I**: Connected to the left port, featuring D-pad, SELECT, START, B, and A buttons.
- **Controller II**: Connected to the right port, similar to Controller I but also including a VOLUME slider and a microphone.

### Controller Commands

**STICK** and **STRIG** commands:

- `STICK`: Reads the numerical value of the D-pad direction pressed.
- `STRIG`: Reads the numerical value of the "START," "SELECT," "A," or "B" buttons pressed.

**Controller I:**
- `STICK(0)`: Reads D-pad direction
- `STRIG(0)`: Reads START, SELECT, A, or B buttons

**Controller II:**
- `STICK(1)`: Reads D-pad direction
- `STRIG(1)`: Reads START, SELECT, A, or B buttons

### Let's move Mario left and right with the controller

**Use `SPRITE OFF` to erase Mario and refer to a program on page 25 for displaying Mario.**

**Program Listing:**

```basic
26 X=100
30 S=STICK(0)
40 IF S>2 THEN 100
50 IF S=2 THEN X=X-1
60 IF S=1 THEN X=X+1
70 IF X>250 THEN X=X-240
80 IF X<5 THEN X=X+245
90 SPRITE 0,X,150
100 GOTO 30
```

**Execution:**

Please enter: `RUN [RETURN]`

Press the D-pad button (left side or right side) of controller I, Mario moves left or right.

When you press the STOP key, the cursor will appear.

---

*Page 26*

