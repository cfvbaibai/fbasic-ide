# BASIC

## About multiple loops...

`FOR~NEXT` repeats and executes a program only for a limited number of times. In other words, the loop of `FOR~NEXT` only makes up 1 loop. Within this loop, you can use 1 extra `FOR~NEXT`. Multiple loops is the name given to the fact that you can create any number of `FOR~NEXT` loops within a `FOR~NEXT` loop.

**Nested Loops Example:**

```basic
FOR I=0 TO 10
  FOR J=0 TO 20
    FOR K=0 TO 30
      ' ... code inside innermost loop ...
    NEXT
  NEXT
NEXT
```

Multiple loops are executed in the order which starts with the `FOR~NEXT` which is located the furthest outside. However, as a program, you cannot assign 1 loop to cross another loop.

**Correct Nested Loop Structure:**

```basic
FOR I=0 TO 100
  FOR J=0 TO 30
  NEXT
NEXT
```

Also, you cannot use a `GOTO` command to cut in the middle of a `FOR~NEXT` instruction.

*Please refer to p. 65. (`FOR~TO~STEP NEXT`)*

## About program content modification/revision/addition...

### 1. When you want to erase a specific line.

Type the number of the line you would like to erase and press `RETURN`. On-screen it will remain as is, but the command on that line will not be executed.

*When calling the program by pressing `LIST [RETURN]`, you can check if the line number has disappeared.

### 2. When you want to overwrite a specific line.

Re-type the line number and type the command. If the command of the previous line number remains and the numbers overlap one another, it executes what was written afterwards.

*Use `LIST [RETURN]` to check.

### 3. When you want to modify/revise/add a part.

Use the `INS DEL` keys.

*Please refer to P. 5 for the detailed usage.

---

*Page 24*

