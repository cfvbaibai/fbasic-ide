# BASIC

## Character Functions

### ASC

**Working**

Converts character codes into numerical values. (`<=>CHR$`)

**Grammar**

```
ASC (character string)
```

- Character string...Character strings located to the left where characters are converted into numerical values
- (Only the characters to the left are converted)

**Abbreviation**

AS.

**Explanation**

The character code of the first character of the character string becomes the value of this function. The character code is an integer value from 0 to 255. The character string can also be a formula or a variable. Also, when the character string is a null string, 0 becomes the value of this function.

**Sample Program**

```basic
10 REM * ASC *
20 INPUT "CHARACTER"; A$
30 A=ASC (A$) ' Only converts the first character.
40 PRINT A$; "CHARACTER CODE IS"; A
RUN
CHARACTER?H
H CHARACTER CODE IS 72
OK
```

When entering H

*Please refer to the character code table on p. 102 to 105 to check the ASC code comparison table.*

### CHR$

**Working**

Considers a numerical value as a character code and converts it into the matching character. (`<=>ASC`)

**Grammar**

```
CHR$(x)
```

- `x`......Mathematical expression to convert into characters
- All from 0 to 255

**Abbreviation**

CH.

**Explanation**

Yields a character as a character code from a numerical value. You can obtain one numerical value per character. The characters and symbols to be printed are for the X value from 32 to 255.

**Sample Program**

```basic
10 REM * CHR$ *
20 INPUT "CHARACTER CODE IS (0-255)";A
30 A$=CHR$ (A)
40 PRINT A; "THE MATCHING CHARACTER IS";A$
RUN
CHARACTER CODE IS (0-255)?65
65 THE MATCHING CHARACTER IS A
OK
```

When entering 65

### VAL

**Working**

Converts the number character strings into numerical values.

**Grammar**

```
VAL (character strings)
```

- Character strings...number character strings
- -32768 to +32767
- &H0 to &H7FFF

**Abbreviation**

VA.

**Explanation**

Converts the numbers considered as characters within a character string into numerical values. In case the first character of the character string is not +, -, & or a number, the value of this function becomes 0. Also, if characters which are not numbers appear in the character string (except hexadecimal A to F), the characters appearing after it will be ignored.

**Sample Program**

```basic
10 REM * VAL *
20 INPUT "PLEASE ENTER A HEXADECIMAL NUMBER";A$
30 V=VAL("&H"+A$)
40 PRINT A$, "&H"; A$; "=";V
RUN
PLEASE ENTER A HEXADECIMAL NUMBER?AD
AD &H AD = 173
OK
```

When entering AD

### STR$

**Working**

Converts the values of mathematical expressions to number characters.

**Grammar**

```
STR$ (x)
```

- `x`... Mathematical expression

**Abbreviation**

STR.

**Explanation**

Character strings displaying mathematical expressions or numerical values become the value of this function. In case of positive numbers, 1 character space is entered at the beginning.

**Sample Program**

```basic
10 REM * STR$ *
20 INPUT "NUMERICAL VALUE OF A IS";A
30 A$=STR$ (A) ' Converts the numerical value of A into a character numerical value
40 INPUT "NUMERICAL VALUE OF B IS";B
50 B$=STR$ (B) ' Converts the numerical value of B into a character numerical value
60 PRINT A;B;A+B ' Displays as a numerical value
70 PRINT A$;B$;A$+B$ ' Displays as a character of a numerical value
```

---

*Page 83*

