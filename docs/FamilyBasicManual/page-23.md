# BASIC

## Let's make Mario move horizontally with the FOR NEXT instruction

### Program 3 (Modified)

**Please use program 3 on p. 22 and enter:**

```basic
40 FOR X=0 TO 200
60 NEXT
```

**Program Listing:**

```basic
LIST
5 CLS
10 SPRITE ON
20 DEF SPRITE 0,(0,1,0,1,0)=CHR$(1)+CHR$(0)+CHR$(3)+CHR$
30 INPUT "Y=";Y
40 FOR X=0 TO 200
50 SPRITE 0,X,Y
60 NEXT
OK
```

**Execution:**

Please enter: `RUN [RETURN]`

When Y=?, please enter: `100 [RETURN]`

Mario will move from left to right.

*FOR NEXT is explained on the next page in the "About multiple loops" section.*

### Program 3 (With STEP)

**Please enter:**

```basic
LIST [RETURN]
```

Use the ▲▼ keys to move the cursor to line number 40 and rewrite the command.

```basic
40 FOR X=0 TO 200 STEP 2
```

Next, press the ▼ key, move the cursor to the line below line number 60. Enter `RUN [RETURN]` and because Y=? is displayed, please enter: `100 [RETURN]`

You will notice that Mario moves faster than before from left to right.

**Program Listing:**

```basic
LIST
5 CLS
10 SPRITE ON
20 DEF SPRITE 0,(0,1,0,1,0)=CHR$(1)+CHR$(0)+CHR$(3)+CHR$
30 INPUT "Y=";Y
40 FOR X=0 TO 200 STEP 2
50 SPRITE 0,X,Y
60 NEXT
OK
```

### Program 4 (Nested Loops)

**Please enter:**

```basic
30 FOR Y=0 TO 200 STEP 5
70 NEXT
```

When you enter: `RUN [RETURN]`

Mario moves from the upper left of the screen to the lower right of the screen.

**Program Listing:**

```basic
LIST
5 CLS
10 SPRITE ON
20 DEF SPRITE 0,(0,1,0,1,0)=CHR$(1)+CHR$(0)+CHR$(3)+CHR$
30 FOR Y=0 TO 200 STEP 5
40 FOR X=0 TO 200 STEP 2
50 SPRITE 0,X,Y
60 NEXT
70 NEXT
OK
```

---

*Page 23*

