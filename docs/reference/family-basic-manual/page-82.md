# BASIC

## Numeric Functions

### ABS (Absolute Value)

**Working**

Gives the absolute value of a mathematical expression.

**Grammar**

```
ABS (x)
```

- `x`: Mathematical expression which requests an absolute value (integer -32768 to +32767).

**Abbreviation**

AB.

**Explanation**

The absolute value `|x|` of the mathematical expression `x` becomes the value of this function.

**Sample Program**

```basic
PRINT ABS (41)
```

**Output:** `41`

```basic
PRINT ABS (-41)
```

**Output:** `41`

```basic
PRINT ABS (10-34)
```

**Output:** `24`

### SGN (Sign)

**Working**

Gives the sign of the mathematical expression.

**Grammar**

```
SGN (x)
```

- `x`: Mathematical expression (integer -32768 to +32767).

**Abbreviation**

SG.

**Explanation**

According to the mathematical expression, the following value becomes the value of this function:

- `x > 0` -> `1`
- `x = 0` -> `0`
- `x < 0` -> `-1`

**Sample Program**

```basic
PRINT SGN (41)
```

**Output:** `1 ...Positive.`

```basic
PRINT SGN (0)
```

**Output:** `0`

```basic
PRINT SGN (-41)
```

**Output:** `-1 ...Negative.`

### RND (Random Number)

**Working**

Generates random numbers (integers) without arguments.

**Grammar**

```
RND (x)
```

- `x`: Mathematical expression (integer) 1 to 32767.

**Abbreviation**

RN.

**Explanation**

The generated random integer becomes the value of this function. It becomes a random number of "argument (x) -1". `RND(1)` is always equal to 0.

**Sample Program**

Let's play back music with random numbers through RND:

```basic
10 REM * RND *
20 PLAY "M1V6T201"
30 A$="CDEFGABR"
40 N=RND (8)
50 B$=MID$(A$, N+1,1)
60 PRINT B$;
70 PLAY B$
80 GOTO 40
```

**Explanation of Sample Program:**

Extracts 1 character from the `A$` character string and calls it `B$`.

The extracted character uses the random value generated on line 40, which is lower than 8 (0 to 7).

Plays back the sound of the extracted character while displaying that character.

---

*Page 82*

