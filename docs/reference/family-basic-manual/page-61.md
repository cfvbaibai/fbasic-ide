# BASIC

## CLEAR

**Working**

Clears variables or arrays.

**Grammar**

```
CLEAR
```

**Abbreviation**

CLE.

**Explanation**

Clears all the variables or arrays completely from the memory. Namely, it turns numerical types into 0 and character types into null strings (empty status).

**Sample Program**

```basic
X$="CLEAR"
OK
Y=125
OK
PRINT X$; Y
CLEAR 125
OK
CLEAR
OK
PRINT X$
OK
PRINT Y
0
OK
```

**Explanation of Sample Program:**

- `X$="CLEAR"` - Substitute X$ with the characters CLEAR.
- `Y=125` - Substitute Y with numerical value 125.
- `PRINT X$; Y` - Print and check the values of X$ and Y.
- `CLEAR 125` - These are substituted.
- `CLEAR` - Let's clear them.
- `PRINT X$` - They have been cleared.
- `PRINT Y` - Y is now 0 (cleared).

---

*Page 61*

