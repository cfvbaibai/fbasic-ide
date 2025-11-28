# BASIC

## Logical operators

Logical operators are symbols that perform bit unit 0 and 1 boolean calculations or other bit operations.

There are 4 main logical operators.

### Table of Logical Operators

| Calculation order | Logical operator | Abbreviation | Meaning |
|-------------------|------------------|--------------|---------|
| 1. | `NOT` | NO. | not (negation) |
| 2. | `AND` | A. | and (logical product) |
| 3. | `OR` | | inclusive or (logical sum) |
| 4. | `XOR` | XO. | exclusive or (exclusive logical sum) |

### Logical Calculations Explanation

Logical calculations are performed between two values: true (1) and false (0).

The result is also either 1 (true) or 0 (false).

### Summary of Logical Operators

#### NOT (negation)

**Truth Table:**

| X | NOT X |
|---|-------|
| 1 | 0     |
| 0 | 1     |

**Explanation:** When X is 1, NOT X is 0. When X is 0, NOT X is 1.

#### AND (logical product)

**Truth Table:**

| X Y | X AND Y |
|-----|---------|
| 1 1 | 1       |
| 1 0 | 0       |
| 0 1 | 0       |
| 0 0 | 0       |

**Explanation:** X AND Y equals 1 only when both X and Y are 1. Otherwise, it's 0. This is analogous to multiplication.

#### OR (logical sum)

**Truth Table:**

| X Y | X OR Y |
|-----|--------|
| 1 1 | 1      |
| 1 0 | 1      |
| 0 1 | 1      |
| 0 0 | 0      |

**Explanation:** This applies to the sum of X and Y and their sum. (Implies that if either X or Y is 1, the result is 1).

#### XOR (exclusive logical sum)

**Truth Table:**

| X Y | X XOR Y |
|-----|---------|
| 1 1 | 0       |
| 1 0 | 1       |
| 0 1 | 1       |
| 0 0 | 0       |

**Explanation:** Exclusive means that when X and Y have the same value, it becomes 0 (false).

### Warning on Operator Chains

When writing chains of variables and logical operators, leave spaces between them.

### Examples of Logical Operations

Examples are provided for NOT, AND, OR, and XOR, showing decimal numbers converted to 16-bit binary, the operation performed bit by bit, and the resulting decimal value.

#### NOT 13

```
13 = (0000 0000 0000 1101)₂
NOT13 = (1111 1111 1111 0010)₂
= -14
```

#### 15 AND 5

```
15 = (0000 0000 0000 1111)₂
5 = (0000 0000 0000 0101)₂
15 AND 5 = (0000 0000 0000 0101)₂
= 5
```

#### 50 OR 44

```
50 = (0000 0000 0011 0010)₂
44 = (0000 0000 0010 1100)₂
50 OR 44 = (0000 0000 0011 1110)₂
= 62
```

#### 42 XOR 36

```
42 = (0000 0000 0010 1010)₂
36 = (0000 0000 0010 0100)₂
42 XOR 36 = (0000 0000 0000 1110)₂
= 14
```

**Binary Number Notation:** `(000)₂` is used to display binary numbers.

### Logical Operators in IF Sentences

Logical operators in `IF` statements can alter the program's flow.

**Example 1:** `IF X>0 AND X<10 THEN 1000`

**Meaning:** If the value of X is between 0 and 10, jump to line 1000.

**Example 2:** `IF X<0 OR X>10 THEN 1000`

**Meaning:** If the value of X is less than 0 or greater than 10, jump to line 1000.

### Order of Execution for Operators

The 3 types of operators (Arithmetical, Relational, Logical) have a specific order of execution.

**Summary of Operator Order of Execution:**

1. Part between `()`
2. Functions
3. `*`, `/` (Multiplications and divisions)
4. `MOD` (Remainders)
5. `+`, `-` (Additions and subtractions)
6. `=`, `<>`, `>`, `<`, `>=`, `<=`
7. `NOT` (Negations)
8. `AND` (Logical products)
9. `OR` (Logical sums)
10. `XOR` (Exclusive logical sums)

---

*Page 52*

