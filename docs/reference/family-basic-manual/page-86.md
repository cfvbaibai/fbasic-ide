# BASIC

## FRE

**Working**

Yields the size of the unused area of the user memory.

**Grammar**

```
FRE
```

**Abbreviation**

FR.

**Explanation**

The amount of unused bytes of the user memory for BASIC programs becomes the value of this function.

**Warning:** The value may differ depending on the version of BASIC, the status of variables, the presence of programs and the execution of programs, before and after.

**Sample Program**

```basic
PRINT FRE
```

**Output:**

```
1854
OK
```

## STICK

**Working**

Yields the input value from the cross-shaped directional pad button of the controller.

**Grammar**

```
STICK (x)
```

- `x`: 0 for controller I, 1 for controller II.

**Abbreviation**

STI.

**Explanation**

Yields the value of the cross-shaped directional pad button of the controller.

**Controller I Directional Pad Values:**

- Up direction: 8
- Right direction: 1
- Left direction: 2
- Down direction: 4
- No button pressed: 0

**Sample Program**

```basic
10 REM * STICK *
20 S=STICK(0)
30 IF S=0 THEN PRINT "NOT PRESSED"
40 IF S=1 THEN PRINT "RIGHT"
50 IF S=2 THEN PRINT "LEFT"
60 IF S=4 THEN PRINT "DOWN"
70 IF S=8 THEN PRINT "UP"
80 GOTO 20
```

**Instructions:**

When doing RUN, "NOT PRESSED" will appear immediately on the screen. Please press the cross-shaped directional pad button of controller I to check whether the input value is correct. Press the `STOP` key to quit.

## STRIG

**Working**

Yields the input status value of the trigger buttons of the controller.

**Grammar**

```
STRIG (x)
```

- `x`: 0 for controller I, 1 for controller II.

**Abbreviation**

STR.

**Explanation**

Yields a value when a trigger button of the controller is pressed.

**Controller I Trigger Button Values:**

- SELECT button: 2
- START button: 1
- B button: 4
- A button: 8
- No button pressed: 0

**Controller II Trigger Button Values:**

- B button: 4
- A button: 8
- No button pressed: 0

**Sample Program**

```basic
10 REM * STRIG *
20 T=STRIG(0)
30 IF T=1 THEN PRINT "START"
40 IF T=2 THEN PRINT "SELECT"
50 IF T=4 THEN PRINT "B"
60 IF T=8 THEN PRINT "A"
70 GOTO 20
```

**Instructions:**

Please press the trigger buttons of controller I to check whether the input value is correct. Press the `STOP` key to quit.

---

*Page 86*

