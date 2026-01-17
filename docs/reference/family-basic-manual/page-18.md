# BASIC

## ★To run a program...

Please enter `RUN [RETURN]`

(You can also execute the command by just pressing the F8 key)

Now you can see Mario on-screen, right?

### Screen Display After RUN

```
┌─────────────────────────────────────────┐
│ OK                                      │
│ NEW                                     │
│ OK                                      │
│ 10 SPRITE ON                            │
│ 20 DEF SPRITE 0,(0,1,0,1,0)=            │
│    CHR$(1)+CHR$(0)+CHR$(3)+CHR$(2)      │
│ 30 SPRITE 0,120,140                     │
│ RUN                                     │
│ OK                                      │
│                                         │
│                     ██                  │
│                     ██                  │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

## ●About the Function keys...

Function keys F1 to F8 have pre-assigned commands useful for creating programs.

### Function Key Assignments

- `F1...LOAD [RETURN]`
- `F2...PRINT`
- `F3...GOTO`
- `F4...CHR$(`
- `F5...SPRITE`
- `F6...CONT [RETURN]`
- `F7...LIST [RETURN]`
- `F8...RUN [RETURN]`

**Notes:**
- *The content which is assigned to each key gets executed just by pressing one key from F1 to F8. (However, F1 F6 F7 F8 get displayed and then executed)*
- *Your program input will progress smoothly by remembering every command.*

## ★To leave only Mario on-screen...

Use the 'Let's call Mario in Program Mode' on p. 17 and enter this command:

```basic
5 CLS [RETURN]
```

Please enter:

```basic
RUN [RETURN]
```

The command lines entered previously have disappeared and only Mario remains on-screen, right?

### Screen Display After CLS and RUN

```
┌─────────────────────────────────────────┐
│ OK                                      │
│                                         │
│                                         │
│                                         │
│                     ██                  │
│                     ██                  │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

## ★Check the memorized program

Please enter `LIST [RETURN]` (Command to display the memorized program on-screen)

A program like the one in the figure on the left gets displayed on-screen. The computer has added the entered `5 CLS` and memorized it while arranging neatly the program. Thus, if you enter a commands with line numbers into the program, you will be able to add more programs later on.

### Screen Display After LIST

```
┌─────────────────────────────────────────┐
│ OK                                      │
│ LIST                                    │
│ 5 CLS                                   │
│ 10 SPRITE ON                            │
│ 20 DEF SPRITE 0,(0,1,0,1,0)=            │
│    CHR$(1)+CHR$(0)+CHR$(3)+CHR$(2)      │
│ 30 SPRITE 0,120,140                     │
│ OK                                      │
│                                         │
│                     ██                  │
│                     ██                  │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

## ●About LIST...

`LIST` is the command to display the memorized program on-screen.

### Syntax

`LIST m-n`: `m` is the first line number, `n` is the last line number of the program to display.

### Examples of LIST command variations

- `LIST [RETURN]`: Displays the whole memorized program.
- `LIST 30 [RETURN]`: Displays the program on line number 30.
- `LIST 20- [RETURN]`: Displays the program starting from line number 20.
- `LIST 20-30 [RETURN]`: Displays the program from line number 20 to 30.
- `LIST -30 [RETURN]`: Displays the program from the beginning to line number 30.

---

*Page 18*

