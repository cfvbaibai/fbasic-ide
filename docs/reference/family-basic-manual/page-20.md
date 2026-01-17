# BASIC

## ★Let's use variables to move Mario around

### Program 2 Display

#### Screen Display 1: Code Listing

```
┌─────────────────────────────────────────┐
│ LIST                                    │
│ 5 CLS                                   │
│ 10 SPRITE ON                            │
│ 20 DEF SPRITE 0,(0,1,0,1,0)=            │
│    CHR$(1)+CHR$(0)+CHR$(3)+CHR$(2)      │
│ 30 INPUT "Y=";Y                         │
│ 40 INPUT "X=";X                         │
│ 50 SPRITE 0,X,Y                         │
│ OK                                      │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

#### Screen Display 2: Program Output

```
┌─────────────────────────────────────────┐
│ Y=?180                                  │
│ X=?150                                  │
│ OK                                      │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                     ██                  │
│                     ██                  │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### Program Instructions

Use the program on p. 19 and enter:

```basic
30 INPUT "Y="; Y [RETURN]
40 INPUT "X="; X [RETURN]
50 SPRITE 0,X,Y [RETURN]
```

### Execution Steps

When you enter `RUN [RETURN]`:

1. `Y=?` is displayed, and the user is instructed to enter `180 [RETURN]`.
2. `X=?` is displayed, and the user is instructed to enter `150 [RETURN]`.

**Resulting Mario Display**: Mario will be displayed on the location of the (150, 180) coordinates.

**Re-execution**: To execute it as many times as you want, please enter `RUN [RETURN]`

### Coordinate Limits

There's a limit to the numbers which you can use in the commands. 

- **X**: 0~255
- **Y**: 0~255 (however, it can only display X:0~240, Y:5~220)

**Display Range Note**: *The display range may vary depending on the TV set.*

## ●About INPUT...

`INPUT` is the command which, when waiting for the data input of a number or a letter from the keyboard, when entering it, substitutes that data in the assigned variable.

### Syntax Note

A `"` (double quotation) mark is used in the INPUT command in the program above.

### Example

```basic
INPUT "Y= "; Y
```

**Display Note**: The `Y=` symbol enclosed by `"` is displayed as is on-screen.

*Please refer to p. 60.*

## ●About PRINT...

`PRINT` is the command which displays letters or the result of a calculation on-screen.

### `PRINT` alone

`PRINT` creates 1 blank line.

### String Concatenation Example

```basic
A$= "MARIO SAMPLE V. 100.0":B$= "ノ プログラム"
PRINT A$+B$
```

Displays the variable letters A$ and B$ on 1 continuous line. (displays as `MARIO SAMPLE V.100.0ノ プログラム`)

### Direct Command Calculation Example

**Enter**: `PRINT 100+100 [RETURN]`

It calculates 100+100 and displays 200. (Direct Command)

*Please refer to p. 59.*

---

*Page 20*

