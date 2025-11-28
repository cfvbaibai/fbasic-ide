# BASIC

## RETURN

**Working**

Returns from the subroutine.

**Grammar**

```
RETURN [{line number}]
```

Line number -> line number of the subroutine to return to

**Abbreviation**

RE.

**Explanation**

`RETURN` is placed at the end of a subroutine called by GOSUB to return. When defining a line number, it returns to that line, but when omitting it, it will go to the end of the GOSUB sentence.

**Sample Program**

*Please refer to GOSUB.*

## IF-THEN

**Working**

Creates a ramification in a logical equation.

**Grammar**

```
IF equation THEN {line number | sentence}
```

- Equation -> logical equation, refer to p. 52.
- Line number -> line number to jump to
- sentence -> optional statement

**Abbreviation**

IF-T.

**Explanation**

IF sentences can be used with THEN as a condition ramification executing statement. Write the logical equation between IF and THEN, and in case the logical equation is established, it executes the part after THEN, if it is not established, it executes the next line.

**Examples**

- `IF X=10 THEN 500` (If X equals 10, jumps to line 500 and executes it.)
- or, `IF X=10 GOTO 500` when there's THEN after the GOTO sentence, you can omit THEN.

You can enter other IF sentences within an IF sentence.

**Program Flow**

The IF-THEN statement works as follows:

- If the logical equation written between IF and THEN is established (YES), it executes the command sentence after THEN, then continues to the following line written after the IF sentence.
- If the logical equation is not established (NO), it bypasses the command sentence after THEN and directly executes the following line written after the IF sentence.

**Sample Program**

```basic
10 REM * IF - THEN *
20 PRINT "PUSH Y!";
30 A$=INKEY$(0)
40 IF A$<>"Y" THEN BEEP:GOTO 30
50 PRINT:PRINT"Y was pressed."
60 PRINT
70 GOTO 20
```

**Explanation of Sample Program**

On line 30, the computer awaits the input of one character. Upon pressing one character, it will check whether it was "Y" or not. If it wasn't "Y", it will emit a "BEEP" and go back to line 30 to wait for the input of one character.

If "Y" was pressed, because the logical equation on line 40 (A$<>"Y") will not be established, the command after THEN will not be executed and line 50 will be executed instead.

---

*Page 64*

