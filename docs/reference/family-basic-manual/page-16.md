# BASIC

*All the animated characters which you can display on-screen in Basic are introduced in the Character Table A on the back cover.*

## About Direct Mode

Commands are entered from the keyboard, followed by pressing the `RETURN` key. If correct, "OK" is displayed; if incorrect, a "?SN ERROR" (syntax error) message appears. Instructions are given to use `▲▼◀▶` keys to move the cursor to correct mistakes, then press `RETURN` again.

**Direct Mode** is entering and executing commands directly from the keyboard.

The goal is to make Mario appear and move on screen, using Mario from the animated characters to explain the Program Input Method.

## Preparation to have Mario appear on-screen

### Choosing the animated character...

Mario character sprites are shown with labels indicating different character numbers and their corresponding `CHR$` values:

- **No. 0**: Mario facing right, standing
- **No. 3**: Mario facing right, walking (left leg forward)
- **No. 2**: Mario facing right, walking (right leg forward)

Text labels associate `CHR$` values with directions:
- `CHR$ (0)`: Right Up
- `CHR$ (1)`: Left Up
- `CHR$ (2)`: Right Down
- `CHR$ (3)`: Left Down

*(We're using Mario (Walk 1) from left to right.)*

### Code Example 1: `SPRITE ON`

**Instruction**: Enter `SPRITE ON RETURN`

**Explanation**: The preparation to have Mario appear on-screen is completed.

### Code Example 2: `DEF SPRITE`

**Instruction**: Please enter `DEF SPRITE O, (0,1,0,1,0)=CHR$ (1)+CHR$(0)+CHR$(3)+CHR$(2) RETURN`

**Explanation**: This line of command is the command which assigns the 4 characters which compose the character (the animated character). From now on, Mario can be displayed at any time.

## Let's choose Mario's display position

### Code Example 3: `SPRITE 0,100,100`

**Instruction**: When you enter `SPRITE 0,100,100 RETURN`

**Explanation**: Mario will be displayed close to the center of the screen.

### Coordinate System

The screen coordinate system is illustrated as follows:

- Top-left corner: `(0,0)`
- Top-right corner: `(255, 0)`
- Bottom-left corner: `(0, 239)`
- Bottom-right corner: `(255, 239)`
- Horizontal axis: labeled "x" with "100" marked
- Vertical axis: labeled "y" with "100" marked

**Explanation**: This command means that Mario will be displayed at the specified coordinates of the screen (x:100, y:100).

**General advice**: When entering a command, take a look at p. 4's keyboard layout and enter the right alphanumerics and symbols. If you made a mistake, use the `▲▼◀▶` keys to move the cursor to the place of mistake and enter the correct command.

## Let's try to change Mario's display position freely

### Code Example 4: `SPRITE 0,150,150`

**Instruction**: When you enter `SPRITE 0,150,150 RETURN`

**Explanation**: Mario will be displayed a little further below to the right.

### Method to change the SPRITE COMMAND's 100, 100 to 150, 150

Detailed steps are provided for editing a previous command:

1. Press the `▲` key to move the cursor to the SPRITE line.
2. Press the `▶` key to move the cursor to the position to correct. `SPRITE 0,100,100`
3. Press the `5` key, 0 changes into 5. `SPRITE 0,150,100`
4. Press the `▶` key, move the cursor to another position. `SPRITE 0,150,100`
5. Press the `5` key, 0 changes into 5. `SPRITE 0,150,150`
6. When pressing the `RETURN` key, the command will be rewritten.

**General statement**: When doing the same kind of operation and changing the numbers, you'll be able to display Mario at the position of your choice.

## Change Mario's color

### Code Example 5: `CGSET 1,1`

**Instruction**: When you enter `CGSET 1,1 RETURN`

**Explanation**: you will notice that the color in which Mario was displayed has changed and that Mario is now wearing a red hat.

---

*Page 16*

