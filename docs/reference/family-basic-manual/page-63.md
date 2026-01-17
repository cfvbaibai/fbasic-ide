# BASIC

## GOTO

**Working**

Jumps unconditionally to the specified line number.

**Grammar**

```
GOTO {line number}
```

Line number -> jump target line number

**Abbreviation**

G.

**Explanation**

`GOTO` is a statement to jump unconditionally to a specified line number and used to change the flow of a program. When used as a direct command, you can execute a program from a specific line number without clearing the values of constants.

(Ex. `GOTO 2000 [RETURN]`)

*Please refer to RUN.*

**Sample Program**

```basic
10 REM * GOTO *
20 A$=INKEY$(8) ........ Awaits the input of any key.
30 PRINT A$, ASC(A$) ... Displays the ascii code of the pressed character or symbol
40 IF A$="Z" THEN END... Pressing the [Z] key will end the program.
50 GOTO 20 ............. Jumps to line 20 and executes line 20.
```

## GOSUB

**Working**

Calls a subroutine within a program.

**Grammar**

```
GOSUB {line number}
```

Line number -> Subroutine start number

**Abbreviation**

GOS.

**Explanation**

Loops made inside `IF` sentences (refer to IF-THEN) or `FOR-NEXT` sentences (refer to FOR-NEXT) execute a repetition of the same process for an infinite number of times, but when you need to repeat the same process in several places within a program, you can include the part which you would like to repeat within a sub program and when necessary call it from the main program. Calling a sub program from a main program is called a subroutine and you can use the `GOSUB` statement to call the subroutine. The line number which comes after `GOSUB` is the first line of the sub routine and you must add `RETURN` on the last line of the subroutine. You can also write other `GOSUB` sentences within a subroutine. (However, these are limited by the memory's capacity.)

**Sample Program**

```basic
10 REM * GOSUB *
100 FOR I=1 TO 25
110 GOSUB 1000
120 NEXT
130 FOR I=25 TO 1 STEP -1
140 GOSUB 1000
150 NEXT
160 PRINT "END"
170 END
1000 FOR J=0 TO I
1010 PRINT "*";
1020 NEXT
1030 PRINT
1040 RETURN
```

- Lines 100-170 constitute the "Main program".
- Lines 1000-1040 constitute the "Sub program".

**Program Flow Diagram**

The diagram illustrates the execution flow between a "Main program" and a "Subroutine (Sub program)".

The main program goes from line 100 to 170.
The sub program goes from line 1000 to 1040.
Lines 110 and 140 of the main program call the subroutine. The program's flow is described in the diagram on the left.

**Note**

When adding annotations in the subroutine of a `GOSUB` sentence, you can not use "REM". Please use `""`.

---

*Page 63*

