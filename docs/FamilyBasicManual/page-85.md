# BASIC

## MID$

**Working**

Takes out only a specified amount sequence of characters from within a character string. (`↔LEFT$`, `RIGHT$`)

**Grammar**

```
MID$ (Character string, initial position, n)
```

- Character string: Up to 31 characters
- Initial position: Initial character position which considers the first character position of the character string as number 1
- `n`: Amount of characters to take out, starting from the specified initial position (0 to 255)

**Abbreviation**

MI.

**Explanation**

The `n` amount of character strings taken out from within the character string becomes the value of this function. When the initial position is bigger than the amount of the character string, a null string becomes the value of this function.

**Sample Program**

```basic
10 REM * MID$ *
20 A$="HIYA "
30 FOR I=1 TO 4
40 PRINT MID$ (A$, I, 1)
50 NEXT
RUN
```

**Output:**

```
H
I
Y
A
OK
```

## LEN

**Working**

Yields the amount of characters of a character string.

**Grammar**

```
LEN (Character string)
```

**Abbreviation**

LE.

**Explanation**

All of the characters included within a character string become the value of this function. The amount of characters can go from 0 to 31, and when the character string is a null string, it becomes 0. However, spaces and control codes which do not appear on screen are also counted as one character.

**Sample Program**

```basic
10 REM * LEN *
20 INPUT "PLEASE ENTER CHARACTERS";A$
30 L=LEN (A$)
40 PRINT"THE LENGTH IS";L;"CHARACTERS"
```

## Particular Functions

### PEEK

**Working**

Takes out data from the specified memory address. (`↔POKE`)

**Grammar**

```
PEEK (address)
```

- Address: address inside the memory
  (Please refer to p. 104 for the memory map.)

**Abbreviation**

PE.

**Explanation**

The 1 byte data taken out of the specified memory address becomes the value of this function.

**Sample Program**

*Please refer to POKE.*

### POS

**Working**

Yields the horizontal position of the cursor on screen.

**Grammar**

```
POS (Mathematical expression)
```

- Mathematical expression: dummy value 0

**Abbreviation**

None

**Explanation**

The value of the current horizontal position of the cursor on screen becomes the value of this function. The range of the value is 0 to 27.

**Sample Program**

```basic
10 REM * POS *
20 CLS
30 FOR X=0 TO 25
40 LOCATE X, 0
50 PRINT POS (0)
60 PAUSE 10
70 NEXT
```

**Explanation of Sample Program**

On lines 30 to 70, moves the cursor horizontally from 0 to 25, and displays then the horizontal position with line 50.

---

*Page 85*

