# BASIC

## General Statements

### Substitutes

**Working**

Substitutes values of variables in functions.

**Grammar**

```
Variables = Functions
```

**Explanation**

A substitution substitutes the value of the function to the right of the "=" with the variable value to the left.

While the function to the right may contain just invariables or variables, there can only be variables to the left. The variables to the right must be defined before (this is not limited to the previous line). If not defined, a variable, in case of a numerical variable, will be seen as 0, in case of a character variable, as `""` (null string).

Also, when connected by "=", both left and right sides have to be numerical value functions or character variable functions. (You cannot mix character variables and numerical variables.)

**(Correct)**

```basic
X=A
Y=A*X+10
X$="&H" +A$
```

**(Incorrect)**

```basic
X$=A
Y$=A*X+"10"
X="&H" +A$
```

**Sample Program**

```basic
10 REM ---Substitutes---
20 A=10          ' Substitutes numerical value 10 with numerical variable A
30 A$="ABC"      ' Substitutes characters ABC with character variable A$.
40 PRINT A$;A    ' Prints variables A$ and A.
RUN
```

**Output:**

`ABC 10` (Substituted by A$ and A.)

## PRINT

**Working**

Displays information such as results of computation etc. on screen.

**Grammar**

```
PRINT {Constant | Variable | Function} [; | , {Constant | Variable | Function} ......]
```

Constants, variables, functions -> information displayed on screen

**Abbreviation**

`?` or `P.`

**Explanation**

`PRINT` outputs constant and numerical variable values, character variable values (character strings) as well as function values (calculation results) on screen.

`PRINT` means "to print out" but this all originates from the first output devices called the teletypewriter. Because `PRINT` is a statement which is used a lot, we decided to abbreviate it as "?".

When outputting values with `PRINT`, these can be separated by `;` or `,` to write several multiples. In this case `;` and `,` are called "separators".

When using `;` as a separator, you can write immediately after a character. However, a ` ` (blank) is needed right before and right after the symbol of a value (for a positive value). For negative numbers, no leading space is added because the minus sign (`-`) occupies the sign position that would otherwise be a space for positive numbers.

**Number Formatting:**
- Positive numbers (including zero): Always have a leading space before them (reserved for the sign position)
- Negative numbers: No leading space (the minus sign takes the sign position)
- Examples:
  - `PRINT 5` outputs ` 5` (with leading space)
  - `PRINT -5` outputs `-5` (no leading space)
  - `PRINT 1-3` outputs `-2` (no leading space for negative result)

When using `,` as a separator, it is output consecutively in units of 8 characters on screen. The display field on screen is divided in 4 blocks like below and the output information is always displayed at the beginning of each block.

**Display field structure:**

The display field is divided into four blocks.

- Block 1: 8 characters, starting at position 0.
- Block 2: 8 characters, starting at position 7 (or 8, depending on 0-indexing vs 1-indexing, but visually aligned after 7).
- Block 3: 8 characters, starting at position 15 (or 16).
- Block 4: 4 characters, starting at position 24 (or 25), ending at position 28.

**Output Examples:**

| Output Example | Corresponding `PRINT` Statement |
|---|---|
| `A       B       C       D` | `PRINT "A", "B", "C", "D", "E", "F"` |
| `ABC     ABC     ABC     ABC` | `PRINT "ABC", "ABC", "ABC", "ABC"` |
| `ABCDEFG ABCDEFG` | `PRINT "ABCDEFG", "ABCDEFG"` |
| `ABCDEFGHI ABCDEFGHI` | `PRINT "ABCDEFGHI", "ABCDEFGHI"` |

Moreover, when writing character constants, only when there's no separating symbol at the end, you may omit the double quotation mark at the end. Also, when adding `;` at the end of a `PRINT` sentence, the content of the following `PRINT` sentence will be displayed in connection.

When using `PRINT` by itself, there will be a one line break.

---

*Page 59*

