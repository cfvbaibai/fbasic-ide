# BASIC

## READ

**Working**

Inputs the data prepared with DATA into a variable in a READ sentence.

**Grammar**

```
READ variable [, variable, variable, ......]
```

- Variable -> variable that takes data from a `DATA` sentence.

**Abbreviation**

REA.

**Explanation**

`READ` sentences are used to input data, similar to `INPUT` sentences. However, `READ` is preferred when certain data needs to be used during program execution, as `INPUT` can be unhandy in such cases.

`READ` statements always work in conjunction with `DATA` sentences. A variable must be written after `READ`, and it must match the constant data in the `DATA` sentence.

The `READ` sentence variable and `DATA` sentence constant data must be in a one-to-one correspondence and of the same type.

A `DATA` sentence can be placed anywhere in the program. One `READ` sentence can read data from two or more `DATA` sentences, and conversely, one `DATA` sentence can be read by several `READ` sentences. `DATA` sentence line numbers are read from the smallest, and data is read sequentially from the beginning.

If the amount of data in `DATA` sentences exceeds the number of variables in `READ` sentences, the program continues reading from the next `READ` sentence. If no more `READ` sentences exist, the remaining data is ignored.

Conversely, if the amount of data from `DATA` sentences is insufficient for the `READ` variables, an "OD ERROR" message appears.

The `RESTORE` command (refer to `RESTORE`) allows reading the same `DATA` sentence multiple times and changing the line number of the `DATA` sentence being read.

*Please refer to DATA and RESTORE.*

**Sample Programs**

#### (1) Numerical value data reading

```basic
10 REM * READ --- (1) *
20 FOR I=1 TO 10
30 READ X
40 PRINT X;
50 NEXT
60 DATA 3, 4, 1, 6, 2, 7, 8, 3, 4, 9
RUN
```

**Output:**

```
3 4 1 6 2 7 8 3 4 9
OK
```

#### (2) Character data reading

```basic
10 REM * READ --- (2) *
20 READ A$,B$,C$
30 PRINT A$;" ";B$;"."
40 PRINT A$;" ";C$;"."
50 DATA GOOD, MORNING, EVENING
RUN
```

**Output:**

```
GOOD MORNING.
GOOD EVENING.
OK
```

#### (3) Array reading

```basic
10 REM * READ --- (3) *
20 DIM A(5)
30 FOR I=0 TO 5
40 READ A(I)
50 PRINT A(I);
60 NEXT
70 DATA 9,1,8,3,4,8
RUN
```

**Output:**

```
9 1 8 3 4 8
OK
```

## DATA

**Working**

Prepares the data to be read by READ.

**Grammar**

```
DATA constant [,constant, constant, ......]
```

- Constant -> a numerical constant (-32768 to +32767) or a character constant (character string) type of data.

**Abbreviation**

D.

**Explanation**

A `DATA` sentence is a statement that prepares data to be read by `READ` sentences (refer to `READ`).

`DATA` sentences accept numerical or character constant data, up to 255 characters per line.

Since `DATA` statements do not execute anything, they can be placed anywhere within the program. However, it is generally recommended to place them directly below a `READ` sentence or all together at the end of the program for better readability.

Character constant data (character strings) do not need to be enclosed in double quotes.

However, if a comma (`,`) or a colon (`:`) is intended to be part of the data itself (as these are used as separators), it must be surrounded by double quotes (`"`).

*Please refer to READ and RESTORE.*

**Sample Program**

*Refer to READ.*

**Example of DATA usage:**

```
DATA ABC, DE, ", ", F
```

This data would be interpreted as `ABC`, `DE`, `,`, `F`.

---

*Page 68*

