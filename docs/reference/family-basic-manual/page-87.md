# BASIC

## CSRLIN

**Working**

Yields the vertical position of the cursor.

**Grammar**

```
CSRLIN
```

There are no arguments.

**Abbreviation**

CSR.

**Explanation**

The current vertical position of the cursor becomes the value of this variable. The range of the value is 0 to 23.

**Sample Program**

```basic
10 REM * CSRLIN *
20 CLS
30 FOR I=0 TO 20
40 LOCATE I, I
50 PRINT POS(0);", ";CSRLIN
60 PAUSE 20
70 NEXT
```

**Description of Sample Program**

Through lines 30 to 70, moves the cursor horizontally and vertically 1 character and 1 line, and displays the horizontal and vertical position of the cursor at that time from line 50.

## SCR$

**Working**

Function which requests the characters or pictures displayed on the BG GRAPHIC screen.

**Grammar**

```
SCR$ (X, Y, Sw)
```

- `X`......Horizontal display column 0 to 27
- `Y`......Vertical display row 0 to 23
- `Sw`... Request a color combination 0 or 1 (You may omit 0.)
- Please refer to the color chart on p. 113.

**Abbreviation**

SC.

**Explanation**

Specifies the columns and rows on the BG GRAPHIC screen and lets you know about the characters or pictures displayed there. When selecting 1 for Sw, you can request the color combination number (0 to 3) for that character or that picture. Please refer to the sample program to learn how to request.

**Sample Program**

```basic
10 CLS
20 LOCATE 0,10
30 PRINT"FAMILY - COMPUTER"
40 PRINT"-----------------"
50 LOCATE 10,15
60 PRINT SCR$(0,10);
70 A$=SCR$(1,10)
80 PRINT A$
90 C$=SCR$(1,10,1)
100 PRINT"COLOR=";ASC(C$)
110 END
```

**Description of Sample Program**

The X and Y of `SCR$(X,Y)` specify columns and rows and this program takes out the characters of the specified position from the "FAMILY-COMPUTER" character string entered on the screen.

## Input output character functions

### INKEY$

**Working**

Yields one character from the keyboard.

**Grammar**

```
INKEY$ {{ (n) } { omit }}
```

- `n` = Argument

**Abbreviation**

INK.

**Explanation**

The character input from the keyboard becomes the value of this function.

**(1) When omitting the argument:** When a key is pressed, that character becomes the value. When no key is pressed, null string becomes the value of the function.

**(2) When n=0:** The cursor blinks and waits until the input of a character.

*You cannot rely on group A to D from character table B on p. 113.*

**Sample Program**

*Please refer to END and GOTO.*

---

*Page 87*

