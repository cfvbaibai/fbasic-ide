# Basic Commands Reference

## Control Flow

### GOTO
Jump unconditionally to line number.
```
GOTO line_number
```
Abbreviation: `G.`

### GOSUB / RETURN
Call subroutine and return.
```
GOSUB line_number
...
RETURN
```
Abbreviation: `GOS.`

### IF-THEN
Conditional execution.
```
IF condition THEN statement
IF condition THEN line_number
```
Abbreviation: `I.`, `TH.`

### FOR-NEXT
Loop construct.
```
FOR var = start TO end [STEP increment]
...
NEXT [var]
```
Abbreviation: `F.`, `T.`, `STE.`, `N.`

### END
Terminate program execution.
```
END
```
Abbreviation: `EN.`

## Input/Output

### PRINT
Output to screen.
```
PRINT expression [; expression ...]
PRINT expression [, expression ...]
```
- `;` - no separator between items
- `,` - tab to next column
- Trailing `;` suppresses newline

Abbreviation: `P.` or `?`

### INPUT
Get user input.
```
INPUT "prompt"; variable
INPUT variable
```
Abbreviation: `IN.`

### DATA / READ / RESTORE
Store and read data values.
```
DATA value1, value2, ...
READ var1, var2, ...
RESTORE [line_number]
```
Abbreviation: `DA.`, `REA.`, `RES.`

## Variables

### LET
Assign value to variable (LET keyword optional).
```
LET var = expression
var = expression
```

### DIM
Declare array dimensions.
```
DIM array(size)
DIM array(size1, size2)
```
Abbreviation: `DI.`

## Program Control

### REM
Comment (remark).
```
REM comment text
```
Abbreviation: `R.`

Note: In GOSUB subroutines, use `'` instead of REM for comments.

### PAUSE
Pause execution for frames (1 frame = ~1/30 second).
```
PAUSE frames
```

### STOP
Stop program execution (can resume with CONT).
```
STOP
```
Abbreviation: `ST.`

## Screen

### CLS
Clear screen and reset cursor to home position.
```
CLS
```
Abbreviation: `CL.`

### VIEW
Displays BG GRAPHIC screen.
```
VIEW
```
Abbreviation: `VI.`

## Source
Manual pages: 49-69
