# BASIC

## Special symbols

BASIC has operators with specific functions represented by the symbols below.

### (1) - (Hyphen)

Used for defining the scope of `LIST` sentences or lines, specifying a range from one line to another.

**Example:**

```basic
LIST 100-300
```

### (2) , (Comma)

Used as a separating symbol (separator) when operands are lined up in `PRINT`, `INPUT`, or `DATA` sentences.

**Examples:**

```basic
PRINT A,B,C
INPUT A,B,C
DATA 10,13,9,14,13
```

### (3) : (Colon)

Used as a separating symbol in a multi-statement.

**Examples:**

```basic
A=B-C: PRINT A
FOR I=0 TO 9: PRINT X$(I): NEXT
X1=X:Y1=Y: GOSUB10000: GOSUB20000
```

### (4) ; (Semi-colon)

Used as a separating symbol in a `PRINT` sentence.

**Examples:**

```basic
PRINT "answer="; A
INPUT "A="; A
```

### (5) ? (Question mark)

Can be used as a substitute for a `PRINT` sentence.

**Example:**

```basic
?A, B,C
```

### (6) &H (shows a hexadecimal)

Indicates a hexadecimal number. "All others are decimals."

**Example:**

`&H2C` is 44 in decimals.

---

*Page 53*

