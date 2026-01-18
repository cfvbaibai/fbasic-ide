# Input Reference

## STICK

Read directional pad input.
```
STICK(x)
```
- `x`: Controller number (0=Controller I, 1=Controller II)

Returns bitmask:
| Value | Direction |
|-------|-----------|
| 0 | Not pressed |
| 1 | Right |
| 2 | Left |
| 4 | Down |
| 8 | Up |

Diagonal combinations: Add values (e.g., Up+Right = 8+1 = 9)

Abbreviation: `STI.`

Example:
```basic
10 S = STICK(0)
20 IF S = 0 THEN PRINT "NOT PRESSED"
30 IF S = 1 THEN PRINT "RIGHT"
40 IF S = 2 THEN PRINT "LEFT"
50 IF S = 4 THEN PRINT "DOWN"
60 IF S = 8 THEN PRINT "UP"
70 GOTO 10
```

## STRIG

Read trigger button input.
```
STRIG(x)
```
- `x`: Controller number (0=Controller I, 1=Controller II)

### Controller I Returns:
| Value | Button |
|-------|--------|
| 0 | Not pressed |
| 1 | START |
| 2 | SELECT |
| 4 | B |
| 8 | A |

### Controller II Returns:
| Value | Button |
|-------|--------|
| 0 | Not pressed |
| 4 | B |
| 8 | A |

Multiple buttons: Add values (e.g., A+B = 8+4 = 12)

Abbreviation: `STR.`

Example:
```basic
10 T = STRIG(0)
20 IF T = 1 THEN PRINT "START"
30 IF T = 2 THEN PRINT "SELECT"
40 IF T = 4 THEN PRINT "B"
50 IF T = 8 THEN PRINT "A"
60 GOTO 10
```

## INKEY$

Read keyboard input (non-blocking).
```
INKEY$(n)
```
- `n`: Number of characters to wait for (0-255)
- Returns empty string if no key pressed (when n=0)

Abbreviation: `INK.`

Example:
```basic
10 A$ = INKEY$(0)
20 IF A$ = "" THEN 10
30 PRINT "You pressed: "; A$
40 GOTO 10
```

## INPUT

Read keyboard input with prompt (blocking).
```
INPUT "prompt"; variable
INPUT variable
```

Abbreviation: `IN.`

Example:
```basic
INPUT "Enter your name"; N$
PRINT "Hello, "; N$
```

## Source
Manual pages: 86, 56-57
