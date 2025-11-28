# BASIC

## Operators

`+`, `-` type of symbols which are used in calculations are called operators.

There are 3 types: arithmetical operators, relational operators, and logical operators.

## Arithmetical operators

There are 5 arithmetical operators.

### Table of Arithmetical Operators

| Operator | Operator content | Example | Mathematical display |
|----------|------------------|---------|---------------------|
| `+` | Addition | `A+B` | `A+B` |
| `-` | Subtraction | `A-B` | `A-B` |
| `*` | Multiplication | `A*B` | `AB` |
| `/` | Division | `A/B` | `A÷B` or (fraction A over B, yet B≠0) |
| `MOD` | Residue | `A MOD B` | Remainder |

### MOD explanation

`MOD` calculates the remainder of a division.

For example 10:3=3 remainder 1, when you enter `10MOD3 [RETURN]` the result will be 1.

### Order of Operations (Priority)

Operations are executed in the following order. This order is considered as a priority order, but in case of equal priority, the operations are executed from the operator on the left.

1. `* /` (Multiplication / Division)
2. `MOD` (Residue)
3. `+ -` (Addition / Subtraction)

In case you would like to change the order of operation, use `()` to enclose the operation which you would like to execute first.

### Expression Examples

**Display in BASIC vs. Mathematical display:**

- `A*X+Y` (BASIC) -> `AX+Y` (Mathematical)
- `(X+Y)/2` (BASIC) -> `(X+Y) / 2` (Mathematical, shown as a fraction with X+Y over 2)
- `X+Y/2` (BASIC) -> `X + Y / 2` (Mathematical, shown as X plus a fraction with Y over 2)

**Warning:** NS-HUBASIC is an integer type. It can not calculate with decimals.

In case of the result for a division, it will display integer results, getting rid of the decimals.

## Relational operators

Relational operators are used when comparing fixed values or variables. The result becomes -1 if true, 0 if false.

### Table of Relational Operators

| Relational operator | Meaning |
|---------------------|---------|
| `=` | Both sides are equal |
| `<>` | Both sides are not equal (≠) You can not use `><`. |
| `>` | The left side is greater than the right one |
| `<` | The left side is smaller than the right one |
| `>=` | The left side is greater than or equal to the right side (≥) You can not use `=>`. |
| `<=` | The left side is smaller than or equal to the right side (≤) You can not use `=<`. |

### Usage with IF statements

Relational operators are used within programs using IF statements like below.

**Example:** `IF X>0 THEN 1000` (meaning) "if the value of X is greater than 0, jump to no. 1000."

*Please refer to IF-THEN statements for more details.*

### Assignment example

Also, `A=X>0` or `A=(X>0)`

when used like this, if X is greater than 0, A is replaced by -1 and if X is smaller than or equal to 0, A is replaced by 0.

Thus, you can know from the value of A if X is greater than 0 or not.

---

*Page 51*

