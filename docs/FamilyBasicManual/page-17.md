# BASIC

## About Program Mode

**Direct Mode** is entering commands directly for immediate, single execution.

**Program Mode** is entering commands into memory, allowing for repeated execution without re-entry.

## ★The difference between Program Mode and Direct mode...

Here is a code example to display Mario:

```basic
10 SPRITE ON
20 DEF SPRITE 0, (0,1,0,1,0)=CHR$(1)+CHR$(0)+CHR$(3)+CHR$(2)
30 SPRITE 0,100,100
```

- `10`, `20`, `30` are **Line numbers**
- The corresponding commands are **Command Line** or **Command**

In Program Mode, commands are given line numbers, memorized, and can be executed multiple times.

The computer executes programs starting from the lowest line number.

**Advice**: When creating programs, increase line numbers by 10 to allow for easy insertion or modification.

## Before programming, enter

### `CLS [RETURN]`

Erases alphanumerics, kana's, and symbols from the screen background/backdrop, and returns the cursor to the home position (top-left). Used to clear on-screen commands.

### `NEW [RETURN]`

Deletes all memorized programs from the memory. Used to erase unnecessary previous programs.

### `CTR+D`

(Press `D` while holding `CTR` key) Erases sprites and restores the original color scheme. If Mario was on-screen, he disappears.

## ★Let's call Mario in Program Mode

### Screen Display

```
┌─────────────────────────────────────────┐
│ OK                                      │
│ NEW                                     │
│ OK                                      │
│ 10 SPRITE ON                            │
│ 20 DEF SPRITE 0,(0,1,0,1,0)=            │
│ CHR$(1)+CHR$(0)+CHR$(3)+CHR$(2)         │
│ 30 SPRITE 0,120,140                     │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

### Program Code

Enter the following program:

```basic
10 SPRITE ON [RETURN]
20 DEF SPRITE 0,(0,1,0,1,0)=CHR$(1)+CHR$(0)+CHR$(3)+CHR$(2) [RETURN]
30 SPRITE 0,120,140 [RETURN]
```

## Explanation of the program entered above through the line number order

### `10 SPRITE ON`

This command enables the display of animated characters and remains effective until `SPRITE OFF` is entered.

### `20 DEF SPRITE`

This command composes and defines an animated character. Here is a detailed breakdown of its parameters:

```
DEF SPRITE 0, (0,1,0,1,0) = CHR$( )
           │  │ │ │ │ │
           │  │ │ │ │ └─ Animated character's inverted instruction's X and Y direction
           │  │ │ │ │    (In this program, it instructs the inversion of the X direction)
           │  │ │ │ └──── Display priority
           │  │ │ └────── Matching shape
           │  │ └──────── Color
           │  └────────── (Unlabeled parameter, part of the sequence)
           └───────────── Animated character number
```

**Note**: When you modify the numbers inside `CHR$()`, you can switch to a different character.

### `30 SPRITE 0, 120, 140`

Animated character number `0` will be displayed at X:120 and Y:140 coordinates.

---

*Page 17*

