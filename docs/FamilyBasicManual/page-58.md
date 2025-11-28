# BASIC

## LOAD?

**Working**

Checks whether a SAVEd program has been correctly saved as a file.

**Grammar**

```
LOAD? ("File name")
```

**Abbreviation**

LO.? or LO. P.

**Explanation**

Use the LOAD? command to check whether the program saved on the cassette tape is the same as the program saved in the memory.

When specifying the file name (name added to a program, 16 characters or less), all the other programs will be skipped until it finds the program with that name. When it finds the specified program, the checking starts.

When omitting the file name, the program of the first found file name will be checked against the program in the memory.

When a program is SAVEd on a cassette tape, it is important to check whether it has been saved correctly by using LOAD?.

*Please refer to p. 47 to learn how to use this command.*

**Sample Program**

**Scenario 1: No file name specified**

```basic
LOAD?
LOADING TEST
OK
```

In case there is no file name.

-Checking.

Check result OK check finished.

**Scenario 2: File name specified**

```basic
LOAD?"TEST"
LOADING TEST
OK
```

In case a file name was added.

**Scenario 3: Error case**

```basic
?TP ERROR
OK
```

In case the check result is unavailable.

Please SAVE again.

---

*Page 58*

