# BASIC

## CLEAR

**Working**

Assigns the top address of the memory region which you can use in BASIC.

**Grammar**

```
CLEAR address
```

Address -> Top address of the memory region which you can use in BASIC &H77FF or less

(refer to the memory map on p. 104)

**Abbreviation**

CLE.

**Explanation**

Assigns the top address of the region which BASIC uses within the memory.

When using a machine language program concurrently with a BASIC program, it is necessary to assign the top address of the memory region used by BASIC to avoid destruction by BASIC programs or variables.

At the same time CLEAR assigns the top address, nesting with FOR-NEXT, GOSUB, etc. or variables and arrays will be erased.

This command can not be written in the header of a regular program or in a subroutine. Moreover, an assigned address remains valid until it is reassigned by CLEAR.

When skipping an address with CLEAR, variables and array variables which have number variables assigned to them are cleared into 0, those with character variables are cleared into "" (null string).

*Refer to p. 61 for CLEAR*

**Sample Program**

```basic
10 REM * CLEAR *
20 CLEAR &H7600
```

**Explanation of Sample Program:** The top address of the memory region which you can use in BASIC is assigned to &H7600. Check it with PRINT FRE.

## NEW

**Working**

Deletes the whole program.

**Grammar**

```
NEW
```

**Abbreviation**

N/A.

**Explanation**

When entering a new program, deleting an old program from the memory entered until then will avoid trouble. In order to do this, you should use the NEW command to delete the old program.

NEW doesn't just delete the program, it also deletes all of the variable content from the memory. However, even if you execute NEW, you will not change the status of the user area or the screen within the memory.

Also, there is no abbreviated form for NEW, in order to avoid deleting a program by mistake. Please be careful when using this command.

(Do not use it within a program)

**Sample Program**

```basic
10 REM * NEW *
20 X=999
30 PRINT X
LIST
```

**Explanation of Sample Program (first part):** Entering the program. Checking the program list. The program was entered without error.

```basic
10 REM * NEW *
20 X=999
30 PRINT X
OK
RUN
```

**Explanation of Sample Program (second part):** Execute the entered program. The 999 value of X is displayed on-screen.

```basic
999
OK
NEW
OK
LIST
OK
```

**Explanation of Sample Program (third part):** Deleting the program. Checking the program list. The program has been deleted.

---

*Page 55*

