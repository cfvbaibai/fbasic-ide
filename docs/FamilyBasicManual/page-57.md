# BASIC

## CONT

**Working**

Resume the program.

**Grammar**

```
CONT
```

**Abbreviation**

C.

**Explanation**

Describes how the `CONT` command resumes a program that was stopped by the `STOP` command or by pressing the `[STOP]` key. When `CONT` is pressed, the program continues execution from the next line number, and variables retain their values from before the stop.

However, if the program stopped due to an `END` command, an error, after executing `CLEAR`, or if the program was rewritten after stopping, `CONT` will not execute correctly and will result in a "CC ERROR".

If the program can resume, "OK. (with a full stop)" will appear. If it cannot resume, "OK (without a full stop)" will appear.

*Refer to STOP, END*

**Sample Program**

*Refer to STOP*

## LOAD

**Working**

Read a program from a cassette tape.

*Refer to SAVE*

**Grammar**

```
LOAD ("File name")
```

- File name: name added to a program, 16 characters or less

**Abbreviation**

LO.

**Explanation**

The `LOAD` command is used to load a program saved on a cassette tape into the read memory.

When a file name is specified, the command will skip programs on the tape until it finds and reads the program with that specific name.

The file name can be omitted only when loading the very first program found on the cassette tape.

*Please refer to p. 45 to learn how to use this command.*

**Sample Program**

**Example 1:**

```basic
LOAD
LOADING TEST
OK
```

......LOAD the program from the cassette tape without specifying the file name.

**Example 2:**

```basic
LOAD "TEST-2"
SKIP TEST
SKIP TEST-1
LOADING TEST-2
OK
```

......Specify the file name and LOAD.

......If the file name of the program differs, it will SKIP it.

## SAVE

**Working**

Record a program on a cassette tape.

*Refer to LOAD*

**Grammar**

```
SAVE ("File name")
```

- File name: Name added to the saved program, 16 characters or less

**Abbreviation**

SA.

**Explanation**

The `SAVE` command is used to save programs currently in memory onto a cassette tape.

The file name, if provided, is added to the saved program and must be enclosed in double quotation marks.

While omitting the file name is possible, adding file names is recommended for better management of multiple programs.

*Please refer to p. 45 to learn how to use this command.*

**Sample Program**

**Example 1:**

```basic
SAVE
WRITING
OK
```

......SAVE without adding a file name.

**Example 2:**

```basic
SAVE "TEST"
WRITING TEST
OK
```

......Adds a file name (ex.: TEST) and SAVEs the program on the cassette tape.

---

*Page 57*

