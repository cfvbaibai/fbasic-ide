# BASIC

## INPUT

**Working**

Inputs numerical values or characters from the keyboard.

**Grammar**

```
INPUT ["char. string"] {; variable(, variable, ...)}
```

- Character string -> character string to be displayed on screen.
- Variable -> variable which takes the numerical value or character entered by keyboard

**Abbreviation**

I.

**Explanation**

`INPUT` is used to enter numerical and character data from the keyboard into variables.

A variable must be added after `INPUT`. It can be a numerical or character variable.

A comma (`,`) can be used as a separator for multiple variables. When inputting data, corresponding data should be separated by commas and input once. The amount of data must match the number of variables.

Character variables can be entered. If a comma (`,`) is part of the character string, it should be surrounded by double quotation marks (`"`), as `,` is otherwise used as a separator.

When an `INPUT` statement is executed, a `?` appears on screen. To provide context for the input, a character string `PRINT` function can be included in `INPUT`.

To display a character string, surround it with `"` and use a semicolon (`;`) to interleave and write variables.

If the `?` prompt is not desired, `"` can surround a character string, and a comma (`,`) can be used to interleave between variables.

When inputting character variables, numerical values are treated as characters. When inputting numerical variables, characters are treated as 0-value variables.

Pressing the `RETURN` key without entering anything will clear the current value or characters attributed to that variable.

**Sample Program**

The following sample is a program which adds, subtracts and multiplies the data read on line 20 and 30.

```basic
10 REM * INPUT *
20 INPUT"A=";A
30 INPUT"B=";B
40 C=A+B
50 D=A-B
60 E=A*B
70 PRINT"A+B=";C
80 PRINT"A-B=";D
90 PRINT"A*B=";E
```

(The computer can handle numerical values from -32768 to +32767.)

## LINPUT

**Working**

Inputs characters from the keyboard.

**Grammar**

```
LINPUT ["char string"] {; character variable}
```

- Character variable -> variable which takes the character string entered by keyboard

**Abbreviation**

LIN.

**Explanation**

`LINPUT` is similar to `INPUT` for keyboard data input, but it allows a comma (`,`) to be input as data.

Only character strings up to 31 characters can be input, and only one variable can be specified.

`LINPUT` also includes a character string `PRINT` function to display a message on screen.

Since the message is also entered as data within the variable, a program processing step is required to remove the message part to isolate the actual input characters.

The total amount of characters, including the message, must be 31 or less.

Like `INPUT`, the `?` prompt will not appear. Character strings and character constants surrounded by `"` can be interleaved with either a semicolon (`;`) or a comma (`,`) to achieve the same effect.

**Sample Program**

```basic
LINPUT "STRING=";A$
STRING=23.5,"",,,;
OK
PRINT A$
STRING=23.5,"",,,;
OK
```

---

*Page 60*

