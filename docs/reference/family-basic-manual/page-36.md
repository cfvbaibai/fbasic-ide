# BASIC

## Screen Display Process

The BASIC display screen is composed of 4 screens, which are the Sprite Screen (Front), the Background Screen, the Sprite Screen (Back) and the Backdrop Screen. (You can set Sprite Screens in front of and behind the Background Screen) There is also a BG GRAPHIC Screen which draws BG GRAPHIC.

**Screen Layering (from back to front):**

1. Backdrop Screen (furthest back)
2. Sprite Screen (Back)
3. Background Screen
4. Sprite Screen (Front) (furthest front)

**BG GRAPHIC Screen:**

Upon executing the VIEW command, the BG GRAPHIC Screen will be copied to the Background Screen.

## Explanation of Each Display Screen

### Background Screen

**Dimensions:** 24 vertical lines and 28 horizontal characters

**Purpose:** To create BASIC programs, always displayed in GAME BASIC mode.

**Content:** Alphanumeric characters, Kana, and symbols entered with the keyboard.

**Functionality:** Acts as a central point in GAME BASIC mode; Sprite Screens can be displayed in front or behind it via BASIC commands.

**Interaction:** Contents of the BG GRAPHIC screen can be copied (duplicated) with the VIEW command.

**Grid Structure:**
- 1 CHARACTER = 8 DOTS horizontally
- 28 characters horizontally
- 24 lines vertically

### Sprite Screen (Front), (Back)

**Dimensions:** 256 dots horizontally and 240 dots vertically (display scope depends on TV receiver)

**Purpose:** Displays Mario and other animated characters (sprites).

**Positioning:** Sprites can be set within 240 vertical dots and 256 horizontal dots.

**Control:** BASIC commands are used to call and erase this screen, making sprites visible or disappear.

**Perspective:** Priority values between alphanumeric characters, Kana, symbols, and graphical characters of sprite and background screens can be changed to create perspective (animated characters appear/disappear on background screen).

### BG GRAPHIC Screen

**Dimensions:** 21 vertical lines and 28 horizontal characters

**Purpose:** Draws BG GRAPHIC.

**Functionality:** In GAME BASIC mode, content can be called and copied (duplicated) onto the background screen via the VIEW command.

**Optimization:** In GAME BASIC mode, game display can be optimized by showing the same drawing as in BG GRAPHIC on the background screen and moving animated characters on the sprite screen.

**Modification:** Copied BG GRAPHIC screen content on the background screen can be freely modified via BASIC commands, but the original drawing on the BG GRAPHIC screen is saved.

### Backdrop Screen

**Dimensions:** 30 vertical lines and 32 horizontal characters (bigger than the background screen)

**Purpose:** Displays the background color of the background screen, always visible.

**Color:** The whole screen can be displayed in 1 color.

**Default:** Default setting is black (transparent).

**Use Case:** Convenient for displaying skies or oceans.

**Structure:**
- Adds 3 lines to the top and bottom of the Background Screen
- Adds 2 lines to the left and right of the Background Screen
- Total: 30 lines vertically, 32 characters horizontally

## Screen Coordinate System

The image above shows the relative positional relation for each screen. The numbers above show the coordinate values which can be fixed for each screen.

**Coordinate Ranges:**

- **Backdrop Screen:** (0,0) to (31,8)
- **Sprite Screen (Back):** (0,0) to (27,23)
- **Background Screen:** (0,0) to (27,23)
- **Sprite Screen (Front):** (0,0) to (27,23)

**Character Dimensions:**

- 3 characters and 2 characters are shown along the edges of the screens, indicating character dimensions.

---

*Page 36*

