# BASIC

## Particular Statements

### KEY

**Working**

Defines character strings according to function keys.

**Grammar**

```
KEY Function key number, character string
```

- `Function key number`: 1 to 8 (matches the 1, 2, 3, 4, 5, 6, 7 and 8 function keys from the left corner).
- `Character string`: You can define up to 15 characters, and all characters above 15 to the right are ignored.

**Abbreviation**

K.

**Explanation**

Makes a character string responsive to the key specified by a function number. When defining a character string with this statement, pressing that key will input the defined string. The function keys are defined when selecting the BASIC screen from the GAME BASIC mode screen.

**Default Function Key Definitions:**

- `F1. LOAD(M)`
- `F2. PRINT`
- `F3. GOTO`
- `F4. CHR$(`
- `F5. SPRITE`
- `F6. CONT(M)`
- `F7. LIST(M)`
- `F8. RUN(M)`

**Note:** (M) stands for RETURN. Please enter +CHR$(13) behind a character string in order to define (M).

**Sample Program**

```basic
KEYLIST
F1 LOAD (M)
F2 PRINT
F3 GOTO
F4 CHR$(
F5 SPRITE
F6 CONT (M)
F7 LIST (M)
F8 RUN (M)
OK
KEY1, "SAVE"+CHR$ (13)
OK
KEY5, "DEF MOVE("
OK
KEYLIST
F1 SAVE (M)
F2 PRINT
F3 GOTO
F4 CHR$(
F5 DEF MOVE (
F6 CONT (M)
F7 LIST (M)
F8 RUN (M)
OK
```

**Explanation of Sample Program:**

- Displays the contents of the function keys.
- (M) stands for RETURN.
- Defines SAVE RETURN on F1. CHR$(13) means RETURN.
- Defines DEF MOVE (on F5.
- Defined in F1 and F5.

*Please refer to KEY LIST*

### KEYLIST

**Working**

Displays the definition status of the function keys.

**Grammar**

```
KEY LIST
```

**Abbreviation**

K.L.

**Explanation**

When executing this statement, a list of the function key numbers and character strings will be displayed on screen.

*Please refer to KEY*

### PAUSE

**Working**

Halts temporarily the execution of the program.

**Grammar**

```
PAUSE [n]
```

- `n`: Range 0 to 32767.

**Abbreviation**

PA.

**Explanation**

When executing this statement, the program execution will resume after halting during the set unit of time. When omitting `n`, the program halts until a key is pressed. Upon pressing a key, it moves on to the next program.

**Sample Program**

```basic
10 REM * PAUSE *
20 FOR I=0 TO 10
30 BEEP: PAUSE 10
40 NEXT
50 PAUSE
60 FOR I=0 TO 10
70 PLAY"C": PAUSE 20
80 NEXT
```

**Explanation of Sample Program:**

- Line number 50: Halts the progression of the program here until a key is pressed.

---

*Page 78*

