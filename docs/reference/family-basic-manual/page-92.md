# BASIC

## How to read the sample programs

### Program List

**Please enter the line numbers and command names correctly when entering a program.**

**BASIC Code Example:**

```basic
5 CLS
10 SPRITE ON
20 CGSET 1,1
40 FOR N=0 TO 7
50 DEF MOVE(N)=SPRITE(0,N+1,3,255,0,0)
60 NEXT
70 MOVE 0,1,2,3,4,5,6,7
70 GOTO 70
80 END
```

**Note:** For long commands, the program list and the actual screen which displays what has been entered differ. Even if the lines change, please continue entering.

**Example of line wrapping:**

```basic
30 FOR N=0 TO 7
40 DEF MOVE(N)=SPRITE(0,N+1,
3,255,0,0)
50 NEXT
```

### Sample Screen

**Let's draw a background screen with BG GRAPHIC! Where should the animated character be moving around? The ocean, the mountains or even in space? This time we'll program an original game in BASIC. You can create very exciting games with the MOVE command! And with the VIEW command, when you superimpose the background screen, you'll put together a fun game!**

The sample screen shows a game level with:
- Grid-like or maze-like pathway structure
- Small sprite characters positioned along pathways
- A central square area with circular elements (possibly a control panel)
- Top-down view of a simple game level

### Warning: When changing or modifying a program

- **When creating, changing or modifying a BASIC program, always erase the BG GRAPHIC (background) screen beforehand. Not doing this might result in an error.**

- **Press the HOME key while holding down the SHIFT key to erase the BG GRAPHIC screen. The cursor will return to its home position.**

- **Call the program with LIST and execute the changes and modifications.**

## Background Screen Data

**In BG GRAPHIC you can write background lines within the range of 28 horizontal cells and 21 vertical cells. This data shows the design data of each character which you draw in BG GRAPHIC.**

**Legend for Data Codes:**

- **K50** means that it uses character 5 within group K together with color combination 0 (the color combination of number 0 which you select in SELECT mode).
- **B73** means that it uses character 7 within group B and color combination 3.
- **Character data of 'background screen data' shown in numbers or symbols (example: number 1 or letter A) are to be entered directly with the keyboard in CHAR mode.**

**Background Data Grid Pattern:**

The grid represents 28 horizontal cells (columns 0-27) and 21 vertical cells (rows 0-20).

**Common patterns:**
- **K60**: Forms vertical lines (columns 8, 10, 12, 14, 16, 18, 20, 22, 24, 26)
- **J20**: Forms horizontal lines (rows 7, 9, 11, 13, 15, 17, 19)
- **J30**: Forms large blocks (rows 11-14, columns 0-10 and 20-27)
- **G72**: Forms central square area (rows 11-14, columns 11-14)
- **K50, J10**: Appear at intersections and endpoints
- **J00**: Appears at specific points

**Example of background screen data:**

The grid visually represents the layout of the game screen, with the character codes defining the graphical elements of the background (pathways, walls, and special areas).

---

*Page 92*

