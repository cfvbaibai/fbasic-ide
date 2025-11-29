# BASIC

## About SWAP...

**SWAP** is the command which exchanges the values between variables.

**Constraint:**

The exchanged variables have to be both numerical value variables or both letter variables or an error arises.

You can not use it as `SWAP A, A$` or `SWAP A$, B`.

**Examples:**

```basic
SWAP A, B
```

(Exchanges the values between the numerical value variable A and the numerical value variable B. The value that B contained becomes A, the value that A contained becomes B)

```basic
SWAP A$, B$
```

(Exchanges the values between the letter variable A$ and the letter variable B$)

*Please refer to p. 67.*

## About multi-statement...

In Program 5, the use of 2 or more commands and a : (colon) within 1 line number is called multi-statement.

**Constraint:**

Within one line number you can write a command of up to 256 letters, colon included.

## About READ~DATA...

**READ** is the command which reads the data prepared by DATA. Also, **DATA** is the command which prepares the data read by READ. Like this, READ and DATA are always used together. Moreover, DATA can be placed anywhere within a program.

**Example 1 (READ statement):**

```basic
READ X,Y,A,B,C,D,E,F
```

- Reads the data from X to F (Mario's display position coordinates and each type of Mario's number).

**Example 2 (DATA statement):**

```basic
DATA 120,140,1,3,0,2,4,5
```

- Data read by READ

**How READ and DATA work together:**

Write a variable (numerical value variable name or letter variable name) after READ and write the corresponding constant data (numerical value variable value or letter variable value) after DATA. For this reason, the variable for READ and the constant data for DATA correspond to each other on a 1 on 1 basis and they both must have the same form.

**Visual representation:**

- `DATA 120` → Variable X (120)
- `DATA 140` → Variable Y (140)
- `DATA 1` → Variable A (1)
- `DATA 3` → Variable B (3)
- `DATA 0` → Variable C (0)
- `DATA 2` → Variable D (2)
- `DATA 4` → Variable E (4)
- `DATA 5` → Variable F (5)

*Please refer to p. 68.*

## About PAUSE...

**PAUSE** is the command which halts temporarily the execution of the program.

**Grammar**

```
PAUSE n
```

- `n`: Time to halt the execution of the program (assigned from 0 to 32767)

**Explanation**

When n (time to halt the execution of the program) is omitted, there is a function which halts the execution of the program at the place where PAUSE is inserted until any key is pressed. When any key is pressed, the execution of the program continues right after the place where PAUSE is inserted.

*Please refer to p. 78.*

---

*Page 29*

