# BASIC

## FOR~TO~STEP NEXT

**Working**

Repeats and executes the process between the FOR-NEXT loop.

**Grammar**

```
FOR i=l TO m (STEPs)
NEXT
```

- `i` → Loop variable
- `l` → Start value
- `m` → End value
- `s` → Incremental, negative numbers also O.K.
- Default value is 1. If you omit STEPs, executed as STEP1.
- Integers from -32768 to +32767.

**Abbreviation**

F.-TO-ST. N.

**Explanation**

In a FOR-NEXT loop, FOR sentences show the beginning of the loop, NEXT sentences show the end of the loop.

**Program flow:**

If the flow of the program comes into the FOR sentence, the loop variable `I` value becomes 1 and enters the first process. When the first process finishes and finds NEXT, the value of `I` increases by 2 (as per STEP2 in the example), `I` becomes the next value 3, goes back to FOR and enters the second process. This continues, with `I` taking values like 3, 5, 7, 9, 11. The loop ends when the value of `I` exceeds the end value 10. (The process will repeat until the value of `I` is equal to the end value or the value right before it.)

However, when omitting STEPs, the incremental value becomes 1.

When there's no matching FOR sentence for a NEXT sentence, an "NF ERROR" message will appear.

When the conditions of the loop variable `i`'s start value and `m`'s end value are met, the program will proceed to the NEXT sentence.

**Sample Program (1):**

```basic
10 REM * FOR-NEXT (1) *
20 FOR I=0 TO 10 STEP 2
30 PRINT I;
40 NEXT
RUN
```

**Output:**

```
0 2 4 6 8 10
OK
```

**Sample Program (2) - Nested Loops:**

```basic
10 REM * FOR - NEXT (2) *
20 CLS
30 FOR I=1 TO 20
40 FOR J=1 TO I
50 FOR K=1 TO J
60 PRINT "X";
70 NEXT
80 PRINT
90 NEXT
100 PRINT
110 NEXT
```

**Nesting structure:**

- `FOR I=1 TO 20`
  - `FOR J=1 TO I`
    - `FOR K=1 TO J`
      - `PRINT "X";`
    - `NEXT` (for K)
  - `PRINT`
  - `NEXT` (for J)
- `PRINT`
- `NEXT` (for I)

**Incorrect Usage:**

You can not add a loop variable name after NEXT. (An error will occur)

**Wrong examples:**

```basic
NEXT K
NEXT J
NEXT I
```

---

*Page 65*

