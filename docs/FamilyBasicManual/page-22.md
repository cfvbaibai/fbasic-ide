# BASIC

## Learning repetition techniques

**Let's try to change Mario's position one after another using the GOTO instruction.**

Use program 2 on p. 20 and enter:

```basic
60 GOTO 30
RETURN
```

### Program 3

**Program Listing:**

```basic
LIST
5 CLS
10 SPRITE ON
20 DEF SPRITE 0,(0,1,0,1,0)=CHR$(1)+CHR$(0)+CHR$(3)+CHR$
30 INPUT "Y=";Y
40 INPUT "X=";X
50 SPRITE 0,X,Y
60 GOTO 30
OK
```

**Interactive Console Output:**

```
Y=?100
X=?100
Y=?140
X=?120
Y=?
BREAK IN 30
CONT
X=?180
```

**Step-by-step Instructions:**

1. Please enter: `RUN [RETURN]`

2. Y=? appears and enter: `100 [RETURN]`

3. X=? appears and enter: `100 [RETURN]`

   Mario is displayed in the (100, 100) position.

4. When Y=? appears again, enter: `140 [RETURN]`

5. X=? appears and enter: `120 [RETURN]`

   Mario's display position changes from (100, 100) to (120, 140).

6. When Y=? appears again, press the STOP key if you want to stop the execution of the program.

   The output `BREAK IN 30` appears (the program was halted at line number 30.)

   This shows that the program was halted while executing the command on line number 30. Please enter:

7. `CONT [RETURN]` (This is the command to continue the execution of a halted program.)

8. Because X=? is displayed again, please enter: `180 [RETURN]`

   Mario's position changes from (120, 140) to (180, 140).

### About GOTO

**GOTO** is the command which repeats the execution of a program by forcing a jump to the defined line number.

**Example:**

```basic
30 INPUT "Y=";Y
40 INPUT "X=";X
50 SPRITE 0,X,Y
60 GOTO 30
```

**Repeated infinitely**

When displaying Mario on line number 50, it will force a jump to line number 30 and execute.

*Please refer to p. 63.*

---

*Page 22*

