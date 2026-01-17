# BASIC

## CGEN

**Working**

Decides the allocation of the sprites on the background screen and the sprite screen.

**Grammar**

```
CGEN n
```

- n: Allocation combination 0 to 3

**Abbreviation**

CGE.

**Explanation**

Selects which characters from character table A (back cover) and B (p. 113) such as Mario's animated characters (sprites), numbers, letters, symbols, kana, background pattern characters (BG GRAPHIC) to use on either the background screen or the sprite screen. This allows you to display Mario and other animated characters on the background screen, as well as display character symbols as sprites on the sprite screen.

**Character Table Reference:**

- **Character table A:** Mario and other animated characters
- **Character table B:** Background patterns including alphanumerics, symbols and kana

*Please refer to the character code list from p. [106](page-106.md) to [109](page-109.md).*

**Allocation Table**

| n | Background screen | Sprite screen | Meaning |
|---|-------------------|---------------|---------|
| 0 | A | A | Uses the characters from character table A on both background and sprite screens. |
| 1 | A | B | Uses char. from table A in BG screen, char. from table B in sprite screen. |
| 2 | B | A | Uses char. from table B in BG screen, char. from table A in sprite screen. |
| 3 | B | B | Uses the characters from character table B on both background and sprite screens. |

**Default Value**

Default value: `CGEN2`

**Reset Key**

`CTR+D` key resets CGEN to value 2.

**Sample Program**

```basic
10 REM * CGEN *
20 CLS:SPRITE ON:CGSET 0,1
30 FOR I=32 TO 255
40 PRINT CHR$(I);
50 NEXT
60 DEF SPRITE 0, (0, 1, 0, 0, 0)=CHR$(64)+CHR$(65)+CHR$(66)+CHR$(67)
70 SPRITE 0, 100, 150
80 PAUSE 100:BEEP
90 CGEN 0
100 PAUSE 100:BEEP
110 CGEN 1
120 PAUSE 100:BEEP
130 CGEN 3
140 PAUSE 100:BEEP
150 CGEN 2
```

**Explanation of Sample Program:**

- Line number 10-80: Displayed by CGEN2.
- Line number 90-100: Displayed by CGEN0.
- Line number 110-120: Displayed by CGEN1.
- Line number 130-140: Displayed by CGEN3.
- Line number 150: Returns to display by CGEN2.

## CLS

**Working**

Clears the screen.

**Grammar**

```
CLS
```

**Abbreviation**

CL.

**Explanation**

Clears the background screen. BG GRAPHIC copied to the background screen will disappear at the same time. Use the VIEW command instead of the CLS command when copying BG GRAPHIC to the background screen in a program.

**Sample Program**

*Please refer to LOCATE*

**Direct Command Usage:**

`CLS [RETURN]` - Screen gets cleared, OK appears on upper left of the screen.

**Program Usage:**

```basic
10 CLS
```

After clearing the screen, it executes the program of the next line number.

---

*Page 71*

