# BASIC

## END

**Working**

Declares the end of the execution of a program.

**Grammar**

```
END
```

**Abbreviation**

E.

**Explanation**

`END` ends the execution of a program. When executing this statement, it ends the program and goes into a command awaiting status. When you want to end a program with `END`, you can put it anywhere. You can also omit `END` at the end of a program.

**Sample Program**

```basic
10 REM * END *
20 FOR I=1 TO 1000
30 PRINT I;
40 A$=INKEY$
50 IF A$="Z" THEN END
60 NEXT
RUN
```

**Sample Program Output**

```
1 2 3 4 5 6 7 8
OK
```

**Explanation of Sample Program Output**

When you press the `[Z]` key, the program execution ends. (This is an example where the `[Z]` key was pressed when the numbers up to 8 had been printed.)

The program receives key input on line 40, then interprets the key input on line 50. Upon pressing the `Z` key, the program execution ends, but in other cases, it reads and displays the numerical values up to 1000. (However, it still receives the `STOP` key press as usual.)

## SWAP

**Working**

Swaps the contents of 2 variables.

**Grammar**

```
SWAP variable¹, variable²
```

Variable -> content swapping variable (the types have to be the same)

**Abbreviation**

SW.

**Explanation**

A `SWAP` sentence swaps the contents between 2 variables.

Example: `SWAP A,B`

In this case, the contents of variables A and B are swapped. However, the types of the contents must match each other. (You cannot use `SWAP A, B$`)

**Sample Program**

```basic
10 REM * SWAP *
20 DIM A(10)
30 FOR I=1 TO 10
40 READ A(I)
50 PRINT A(I);
60 NEXT
70 FOR I=1 TO 10
80 FOR J=1 TO 10
90 IF A(I)<A(J) THEN SWAP A(I), A(J)
100 NEXT
110 NEXT
120 PRINT
130 FOR I=1 TO 10
140 PRINT A(I);
150 NEXT
160 DATA 2,3,5,1,7,4,8,9,6,0
RUN
```

**Sample Program Output**

```
2 3 5 1 7 4 8 9 6 0
0 1 2 3 4 5 6 7 8 9
OK
```

**Explanation of Sample Program Output**

Reads the data inside the array variables and rearranges the order from smallest to biggest value, becoming a base for sorting.

## REM

**Working**

Inserts comments within a program sentence.

**Grammar**

```
REM {Comment}
```

Comment -> optional character string (message) up to 255 characters

Please use `''` (apostrophe) when using it in the subroutine of a `GOSUB` sentence

You cannot use `"REM"`

**Abbreviation**

`'` (apostrophe)

**Explanation**

Statement to insert a comment in a program which has no effect on the execution of a program. You can write it anywhere within a program.

You can use (apostrophe) instead of `REM`.

Program lines written inside `REM` sentences will not be executed at all. (They do take up program memory though.)

**Sample Program**

```basic
10 REM *
20 REM
30 REM NS-HUBASIC V1.0
40 ' SAMPLE PROGRAM
50 '
60 REM 「REM」=「」
70 REM
RUN
OK
```

---

*Page 67*

