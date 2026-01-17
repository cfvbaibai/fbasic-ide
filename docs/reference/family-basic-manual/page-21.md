# BASIC

## About variables...

A variable is a box in which you can enter numerical values or letters. We give this box a name to distinguish it. In this case, we call the box a "name of variable" and the value content of the box a "variable value". If we give it a name of variable and if we enter a variable value in the box, just by assigning the name of the variable, we can produce the variable value from inside the box. Variables include numerical value variables and letter variables.

### Visual Explanation of Variables

**Numerical value variable:**

```
┌───────────────────────────┐
│  numerical value variable │
│  ┌───────┐                │
│  │  100  │                │
│  └───────┘                │
│  variable                 │
│  ┌───────┐                │
│  │   X   │                │
│  └───────┘                │
│  name of variable         │
└───────────────────────────┘
```

**Letter variable:**

```
┌───────────────────────────┐
│  letter variable          │
│  ┌───────┐                │
│  │ "100" │                │
│  └───────┘                │
│  variable                 │
│  ┌───────┐                │
│  │   X$  │                │
│  └───────┘                │
│  name of variable         │
└───────────────────────────┘
```

*(Illustration shows a character saying "Bring me X!" and a penguin character saying "O.K.! It's 100." with an arrow pointing from a box containing "100" to the penguin, symbolizing a variable's value being retrieved.)*

## About numerical value variables...

Numerical value variables' variable names are named with symbols such as X and Y. Variable names can contain up to 255 symbols; however, the computer can only use the first 2 letters to distinguish the variable names. (Even if you use long names, the computer will not discern more than 2 letters.) Also, the first letter symbol has to be an alphabetic letter. However, even if you use alphabetic letters, you cannot use BASIC commands (such as LIST, RUN, PRINT, etc.)

We use integers which express 100, 200, etc. for the variable values.

### Examples

- `X=100` (name of numerical value variables)
- `XA=200` (value of numerical value variables)
- `X1=300`

Still, before entering data into the numerical value variables, the variable values contain the numerical value 0.

### Numerical Value Variable Diagrams

```
┌─────────────────────────────────────────┐
│ numerical value variable values         │
│                                         │
│ ┌───────┐   ┌───────┐   ┌───────┐       │
│ │  100  │   │  200  │   │  300  │       │
│ └───────┘   └───────┘   └───────┘       │
│   ↓           ↓           ↓             │
│ variable                                │
│                                         │
│ ┌───────┐   ┌───────┐   ┌───────┐       │
│ │   X   │   │   XA  │   │   X1  │       │
│ └───────┘   └───────┘   └───────┘       │
│ names of variables                      │
└─────────────────────────────────────────┘
```

## About letter variables...

When entering a `$` (dollar mark) after symbols such as X or Y in the variable names of the letter variables, we can distinguish them from numerical variables. Just like the names of the numerical value variables, the computer cannot distinguish more than the first 2 letters in the variable name although it can accept up to 255 symbols. Also, the first symbol has to be an alphabetic letter.

Variable values are entered between `"` (double quotation marks). These variable values differ from the numerical value variables in that even if they're pure numerics, they're treated as letters.

### Examples

- `A$="MARIO SAMPLE"` (letter variable names)
- `XA$="100"` (letter variable values)

Still, the boxes remain empty until the variable values receive data.

### Letter Variable Diagrams

```
┌─────────────────────────────────────────┐
│ letter variable values                  │
│                                         │
│ ┌────────────────┐   ┌───────┐          │
│ │ "MARIO SAMPLE" │   │ "100" │          │
│ └────────────────┘   └───────┘          │
│      ↓                 ↓                │
│ letters                                 │
│                                         │
│ ┌───────┐          ┌───────┐            │
│ │   A$  │          │   XA$ │            │
│ └───────┘          └───────┘            │
│ names of variables                      │
└─────────────────────────────────────────┘
```

## Try to enter the program which uses letter variables.

### Program

```basic
LIST
10 SPRITE ON
20 DEF SPRITE 0,(0,1,0,1,0)=CHR$(1)+CHR$(0)+CHR$(3)+CHR$(2)
30 INPUT "Y=";Y
40 INPUT "X=";X
50 SPRITE 0,X,Y
60 PRINT
70 A$="MARIO SAMPLE V.100.0"
80 B$="PROGRAM"
90 PRINT A$;B$
OK
```

### Example of execution screen

```
┌─────────────────────────────────────────┐
│ Y=2150                                  │
│ X=2100                                  │
│ MARIO SAMPLE V.100.0 PROGRAM            │
│ OK                                      │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

The letter variable names used in this program are `A$` and `B$`.

The letter variable values are `"MARIO SAMPLE V.100.0"` and `"PROGRAM"`.

---

*Page 21*
