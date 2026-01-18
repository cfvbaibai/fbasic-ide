# Functions Reference

## Numeric Functions

### ABS
Absolute value.
```
ABS(x)
```
Returns: `|x|`
Range: -32768 to +32767
Abbreviation: `AB.`

### SGN
Sign of number.
```
SGN(x)
```
Returns:
- `1` if x > 0
- `0` if x = 0
- `-1` if x < 0

Abbreviation: `SG.`

### RND
Random number.
```
RND(x)
```
Returns: Random integer from 0 to (x-1)
- `RND(1)` always returns 0
- `RND(10)` returns 0-9

Abbreviation: `RN.`

Example:
```basic
N = RND(6) + 1  ' Dice roll 1-6
```

### INT
Integer part (floor).
```
INT(x)
```
Abbreviation: `IN.`

## Character Functions

### ASC
Character to code.
```
ASC(string)
```
Returns: Character code (0-255) of first character
- Empty string returns 0

Abbreviation: `AS.`

Example:
```basic
A = ASC("H")  ' Returns 72
```

### CHR$
Code to character.
```
CHR$(x)
```
Returns: Character for code x (0-255)

Abbreviation: `CH.`

Example:
```basic
A$ = CHR$(65)  ' Returns "A"
```

### VAL
String to number.
```
VAL(string)
```
Returns: Numeric value of string
- Non-numeric first char returns 0
- Supports hex with `&H` prefix

Abbreviation: `VA.`

Example:
```basic
N = VAL("123")    ' Returns 123
N = VAL("&HFF")   ' Returns 255
```

### STR$
Number to string.
```
STR$(x)
```
Returns: String representation of number
- Positive numbers have leading space

Abbreviation: `STR.`

## String Functions

### LEN
String length.
```
LEN(string)
```
Returns: Number of characters (0-31)

Abbreviation: `LE.`

### LEFT$
Left substring.
```
LEFT$(string, n)
```
Returns: First n characters

Abbreviation: `LEF.`

### RIGHT$
Right substring.
```
RIGHT$(string, n)
```
Returns: Last n characters

Abbreviation: `RI.`

### MID$
Middle substring.
```
MID$(string, start, length)
```
- start: Position (1-based)
- length: Number of characters

Returns: Substring from position

Abbreviation: `MI.`

Example:
```basic
A$ = MID$("HELLO", 2, 3)  ' Returns "ELL"
```

## Screen Functions

### POS
Cursor horizontal position.
```
POS(0)
```
Returns: X position (0-27)

### CSRLIN
Cursor vertical position (if available).
Returns: Y position (0-23)

## Memory Functions

### PEEK
Read memory byte.
```
PEEK(address)
```
Returns: Byte value at address (0-255)

Abbreviation: `PE.`

### FRE
Free memory.
```
FRE
```
Returns: Unused bytes in user memory

Abbreviation: `FR.`

## Source
Manual pages: 82-86
