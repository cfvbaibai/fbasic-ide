# BASIC

## HEX$

**Working**

Converts a mathematical expression into a hexadecimal character string.

**Grammar**

```
HEX$(x)
```

- `x`: Mathematical expression, with a range of -32768 to +32767.

**Abbreviation**

H.

**Explanation**

The function takes the result of a mathematical expression and converts it into its hexadecimal character string representation, which then becomes the value of the function.

**Sample Program**

Displays a conversion table of decimals from 0 to 20, rewritten as hexadecimals.

```basic
10 REM * HEX$ *
20 FOR I=0 TO 20
30 PRINT"&H"; HEX$(I);"="; I
40 NEXT
```

## LEFT$

**Working**

Extracts a specified number of characters from a character string, starting from the left. (`↔RIGHT$`)

**Grammar**

```
LEFT$ (Character string, n)
```

- Character string: Can be up to 31 characters long.
- `n`: Specifies the amount of characters to extract, ranging from 0 to 255.

**Abbreviation**

LEF.

**Explanation**

This function returns `n` characters from the left side of the input character string. If `n` is greater than the length of the character string, the entire string is returned. If `n` is 0, a null string (`""`) is returned.

**Sample Program**

```basic
10 REM * LEFT$ *
20 A$="HELLO"
30 FOR I=1 TO 5
40 PRINT LEFT$(A$,I)
50 NEXT
RUN
```

**Output:**

```
H
HE
HEL
HELL
HELLO
OK
```

## RIGHT$

**Working**

Extracts a specified number of characters from a character string, starting from the right. (`↔LEFT$`)

**Grammar**

```
RIGHT$ (Character string, n)
```

- Character string: Can be up to 31 characters long.
- `n`: Specifies the amount of characters to extract, ranging from 0 to 255.

**Abbreviation**

RI.

**Explanation**

This function returns `n` characters from the right side of the input character string. If `n` is greater than the length of the character string, the entire string is returned. If `n` is 0, a null string (`""`) is returned.

**Sample Program**

```basic
10 REM * RIGHT$ *
20 A$="HELLO"
30 FOR I=1 TO 5
40 PRINT RIGHT$(A$, I)
50 NEXT
RUN
```

**Output:**

```
O
LO
LLO
ELLO
HELLO
OK
```

---

*Page 84*

