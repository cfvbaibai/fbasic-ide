# BASIC

## RESTORE

**Working**

Specifies the DATA sentences read with READ sentences.

**Grammar**

```
RESTORE [line number]
```

Line number -> DATA sentence from where it starts reading

**Abbreviation**

RES.

**Explanation**

The BASIC interpreter has pointers which point to DATA and when executing READ sentences, it starts looking for DATA sentences at the beginning of that program and sets a pointer at the DATA that appears first. When executing RESTORE, the pointers for DATA get set on the line of the specified line number. Only when using RESTORE the pointer is set at the beginning of the program. When using RESTORE sentences, you can use the same DATA sentence as many times as you wish and you can specify the read DATA sentence as optional.

*Please refer to READ, DATA*

**Sample Program**

```basic
10 REM * RESTORE *
20 RESTORE 1010
30 FOR I=0 TO 5
40 READ A
50 PRINT A;
60 NEXT
70 PRINT
80 RESTORE 1000
90 FOR I=0 TO 5
100 READ A
110 PRINT A;
120 NEXT
130 REM
1000 DATA 23, 43, 55, 65, 42,9
1010 DATA 12,56,34,68,53,2
RUN
```

**Sample Program Output**

```
12 56 34 68 53 2
23 43 55 65 42 9
OK
```

## CALL

**Working**

Calls machine language subroutines directly.

**Grammar**

```
CALL Address
```

Address -> execution start address of the subroutine.

**Abbreviation**

CA.

**Explanation**

Calls machine language subroutines using the specified address as the execution start address. The address is specified with a hexadecimal literal (in this form &H0000 where O are numbers), a decimal integer literal (between -32768~+32767) or an integer variable expression. Please place the machine language subroutine after the address specified with the CLEAR statement.

**Work area structure:**

The work area contains a "BASIC program" and a "Machine language subroutine". The machine language subroutine should be placed after the address specified with the CLEAR statement.

## POKE

**Working**

Writes 1 byte of data in the memory. (PEEK)

**Grammar**

```
POKE address, data (, data, data, ...)
```

- Address -> address where to write data to (please refer to the memory map on p. 104)
- Data -> integer from 0 to 255

**Abbreviation**

PO.

**Explanation**

Writes 1 byte (8 bits) of data directly into the specified address of the memory. The data must be a value from 0 to 255 (&H0 to HFF). When writing data continuously separated by "," (comma), you can write all the addresses continuously after the specified address. However, since POKE rewrites the content of the current memory, because a careless usage destroys the system region of family basic, you must be careful when using it. The memory scope which you can use with POKE goes from &H7040 to &H77FF. Because &H7000 to &H703F is used by the system, you should not use it.

**Sample Program**

```basic
10 REM * POKE *
20 CLEAR &H7600
30 D=0
40 FOR A=&H7600 TO &H761F
50 POKE A, D
60 D=D+1
70 NEXT
80 FOR A=&H7600 TO &H761F
90 RD=PEEK (A)
100 PRINT "; HEX$ (RD);
110 NEXT
```

**Explanation of Sample Program**

The loop from line 40 to 70 writes the numerical values from 0 to 31 in the memory addresses from 7600 to 761F. The loop from 80 to 110, in order to check whether data has been actually entered or not in each address, uses the PEEK function (p. 85), reads the data and shows it in hexadecimal.

---

*Page 69*

