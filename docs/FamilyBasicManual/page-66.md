# BASIC

## ON

**Working**

Jumps to the specified line according to the value of the equation.

**Grammar**

```
ON equation {GOTO | GOSUB | RETURN | RESTORE} line number(, line number, line number, ......)
```

- Equation: Numerical value variable where the value of the integer starts with 1.
- Line: 0 to 65534.

**Abbreviation**

O.

**Explanation**

When the value of the equation is 1, it jumps to the first line of the range of lines which is written after `{ }`.

If the equation value is 1, it jumps to the first line; if 2, the second line; if 3, the third line, and so on.

When the value of the equation is 0 or when it exceeds the specified number of lines, it moves to the next sentence after the `ON` sentence.

**Comparison with IF-THEN**

The `ON X GOTO` provides a more concise way to handle multiple conditional jumps compared to a series of `IF-THEN` statements:

```basic
IF X=1 THEN 1000
IF X=2 THEN 2000
IF X=3 THEN 3000
IF X=4 THEN 4000
IF X=5 THEN 5000
↓
ON X GOTO 1000, 2000, 3000, 4000, 5000
```

**Program Flow**

The ON command works as follows:

- If equation value = 1, jump to first line number
- If equation value = 2, jump to second line number
- If equation value = 3, jump to third line number
- If equation value = 4, jump to fourth line number
- If equation value = 5, jump to fifth line number
- If equation value is other than 1 to 5, proceed to next line

*Please refer to GOTO, GOSUB, RETURN and RESTORE.*

**Sample Program**

```basic
10 REM * ON-GOSUB *
20 INPUT "CHOOSE A NUMBER FROM 1 TO 6. "; N
30 ON N GOSUB 100,200,300,400,500,600
40 IF N<1 OR N>6 THEN 20
50 PRINT N; " IS THE SYMBOL OF ";X$;"."
60 GOTO 20
100 X$="ETERNITY": RETURN
200 X$="HOPE": RETURN
300 X$="WOMAN": RETURN
400 X$="MAN": RETURN
500 X$="PERFECTION": RETURN
600 X$="WEDDING": RETURN
```

**Explanation of Sample Program:**

The numerical value selected on line 20 will be interpreted on line 30. Then it jumps to the matching line numbers (100 to 600), each character variable will be given and will be displayed on line 50. If a number other than 1 to 6 was entered, it will return to line 20 and ask for a number once more.

## STOP

**Working**

Stops the program execution.

**Grammar**

```
STOP
```

**Abbreviation**

STO.

**Explanation**

When entering a `STOP` sentence inside a program, "BREAK IN line number OK." appears on screen and stops. When this happens, the line number shows the line which contains `STOP`.

Programs stopped by a `STOP` sentence, because the content of the variables is not cleared and you can resume from the next sentence using a `CONT` sentence (refer to `CONT`), it is considered as the best statement to debug programs. When pressing the `[STOP]` key while executing a program, this will stop a program in the same way and show the stopped line number.

*Please refer to CONT, RUN.*

**Sample Program**

```basic
10 REM * STOP *
20 FOR I=1 TO 100
30 PRINT I
40 STOP
50 NEXT
RUN
```

**Program Output and Explanation:**

```
1
BREAK IN 40
OK.
```

This output indicates that the program executed `PRINT I` for `I=1`, then hit `STOP` on line 40.

```basic
CONT
```

This command is entered by the user.

```
2
BREAK IN 40
OK.
```

This output indicates that after `CONT`, the program resumed from the line after `STOP` (line 50, which is `NEXT`), incremented `I` to 2, printed `I`, and hit `STOP` again on line 40.

---

*Page 66*

