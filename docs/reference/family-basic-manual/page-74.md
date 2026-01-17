# BASIC

## MOVE

**Description**

Cluster of commands to display and move animated characters over the sprite screen. They are similar to DEF SPRITE and SPRITE n, x, y, but allow for a much easier execution of game expressions.

### DEF MOVE

**Working**

Defines a specific movement for an animated character. (There is a total of 16 types of animated characters which you can use.)

**Grammar**

```
DEF MOVE(n)=SPRITE (A,B,C,D,E,F)
```

- `n`: Animated character movement number (0 to 7)
- `A`: Animated character type (0 to 15)
- `B`: Appointment of the movement direction (0 to 8)
- `C`: Speed of movement (1 to 255). "in case of 0, it will move every 256 frames) 1...fastest 255... slowest"
- `D`: Complete movement distance (1 to 255). "(0 doesn't display anything)"
- `E`: Display priority (0 to 1).
  - `0`: displays on the sprite screen in front of the background
  - `1`: displays on the sprite screen behind the background
- `F`: Color combination number (0 to 3)

**Abbreviation**

DE.M.

**Explanation**

Select up to 8 animated characters among the 16 types and define their movement.

-The animated character movement number is the number after = defined for the movement of a specific character.

-The type of animated character is allocated among the following animated characters. (Please refer to character table A on the back cover.)

**List of 16 Animated Characters (Type A):**

| Type | Character Name |
|------|----------------|
| 0    | Mario          |
| 1    | Lady           |
| 2    | Fighter Fly    |
| 3    | Achilles       |
| 4    | Penguin        |
| 5    | Fireball       |
| 6    | Car            |
| 7    | Spinner        |
| 8    | Star Killer    |
| 9    | Starship       |
| 10   | Explosion      |
| 11   | Smiley         |
| 12   | Laser          |
| 13   | Shell Creeper  |
| 14   | Side Stepper   |
| 15   | Nitpicker      |

**Movement Directions:**

The movement directions match the eight directions clockwise. When specifying 0, the character does not move.

- `DIR0`: No movement
- `DIR1`: Up-right
- `DIR2`: Right
- `DIR3`: Down-right
- `DIR4`: Down
- `DIR5`: Down-left
- `DIR6`: Left
- `DIR7`: Up-left
- `DIR8`: Up

**Further Explanations:**

-The speed of movement is displayed as a movement of 2 dots (in case of diagonal movement, 2 dots for both X and Y) per amount of frames (about 1/30 second) which is the double of the specified speed of movement (C), and the speed (1 dot/second)=2dots/(CX1/30 second) = 60/C (1 dot/second).

For example, when you specify 1, the speed moves 60 dots per second, in case of 255, the speed moves 60 dots per 255 seconds.

-The complete movement distance specifies the distance of movement of animated characters. The animated characters move only the double of the specified amount of dots. The complete movement amount of dots = 2 x D (dots) (in case of diagonal movement, 2 dots for both X and Y).

-The display priority specifies whether an animated character is displayed on the sprite screen in front of the background screen (0) or on the sprite screen behind the background screen (1).

-The color combination code specifies the color combination to display with the color combination number (0 to 3) specified within the palet code by CGSET.

---

*Page 74*

