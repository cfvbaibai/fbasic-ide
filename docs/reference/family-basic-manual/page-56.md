# BASIC

## LIST

**Working**

Displays the program from the memory on the screen.

**Grammar**

```
LIST ((m) (-(n)))
```

- `m`: Number of the first line to be displayed.
- `n`: Number of the last line to be displayed.

**Abbreviation**

L.

**Explanation**

`LIST` is used to display a program from memory for viewing or editing.

It describes five ways to use `LIST` by specifying line numbers:

1. `LIST m`: Displays only line number `m`.
2. `LIST m,` or `LIST m -`: Displays from line number `m` and above.
3. `LIST m, n` or `LIST m - n`: Displays from line number `m` to `n`.
4. `LIST , n` or `LIST - n`: Displays up to line number `n`.
5. `LIST`: Displays everything.

It explains the behavior if a specified line number does not exist for each case (1, 2, 3, 4).

Pressing the `ESC` button temporarily halts the display, and any key resumes it.

**Sample Program**

Entering the program:

```basic
10 REM * LIST *
20 INPUT X
30 Y=X*X
40 PRINT X;Y
50 END
```

**Example of (1) lists only program line number 30:**

```basic
LIST 30
30 Y=X*X
OK
```

**Example of (2) lists program line number 40 and above:**

```basic
LIST 40-
40 PRINT X;Y
50 END
OK
```

**Example of (3) lists program lines from number 20 to 40:**

```basic
LIST 20-40
20 INPUT X
30 Y=X*X
40 PRINT X;Y
OK
```

**Example of (4) lists program lines up to number 20:**

```basic
LIST -20
10 REM * LIST *
20 INPUT X
OK
```

**Example of (5) lists all of the program lines:**

```basic
LIST
10 REM * LIST *
20 INPUT X
30 Y=X*X
40 PRINT X;Y
50 END
OK
```

## RUN

**Working**

Executes the program.

**Grammar**

```
RUN n
```

- `n`: Number of the line to start the execution.

**Abbreviation**

R.

**Explanation**

`RUN` executes a program from the beginning, clearing all variables.

`RUN n` executes the program starting from line number `n`.

It advises that if variables should not be cleared (e.g., after stopping with `STOP`), `GOTO` or `CONT` should be used instead of `RUN` or `RUN n`.

Examples: `RUN 1000 [RETURN]`, `GOTO 1000 [RETURN]`.

*Refer to GOTO, CONT.*

**Sample Program**

Entering the program:

```basic
10 REM * RUN *
20 PRINT "ハイ!"
30 PRINT "コンニチハ"
40 END
```

**Translator's note:** line 20 means 'YES!', 30 'Hello'.

Executing the program. The program is being executed:

```basic
RUN
ハイ!
コンニチハ
OK
```

---

*Page 56*

