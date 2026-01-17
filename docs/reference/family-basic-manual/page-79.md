# BASIC

## SYSTEM

**Working**

Returns from the BASIC execution mode to the GAME BASIC mode screen.

**Grammar**

```
SYSTEM
```

**Abbreviation**

S.

**Explanation**

Switches to the GAME BASIC screen when entering a SYSTEM command on the BASIC screen. Do not use it within a program. The program remains protected. 1--Select BASIC and upon entering the BASIC screen again, you can continue using BASIC.

**Sample Program**

**Direct command:**

```basic
SYSTEM
```

## VIEW

**Working**

Copies (duplicates) the BG GRAPHIC screen to the background screen.

**Grammar**

```
VIEW
```

**Abbreviation**

V.

**Explanation**

Upon entering the VIEW command while executing BASIC, the picture drawn on the BG GRAPHIC screen gets copied (duplicated) onto the background screen. You can use BASIC to redraw the BG GRAPHIC copied onto the background screen, however that picture remains on the BG GRAPHIC screen. Please use 1 (CGSET 1, 1) from the palet code of the background screen to copy and display the picture drawn on the BG GRAPHIC screen with its colors onto the background screen.

**Sample Program**

**Direct command:**

```basic
VIEW
```

(The cursor returns to the home position)

**Within the program:**

```basic
10 VIEW
```

---

*Page 79*

