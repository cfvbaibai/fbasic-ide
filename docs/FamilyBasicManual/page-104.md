# BASIC

## APPENDIX

### CONTROL CODES

In NS-HUBASIC there are many key functions which are ready to be used besides the regular operation keys.

| CTR+ | Processing contents | Reference |
|------|---------------------|-----------|
| A | `INS` mode's ON/OFF switch. | |
| C | `BREAK`. Cannot be used while executing a program. | |
| D | Initializes settings `CGEN2`, `SPRITE OFF`, and releases `CTR+A`. Turns the color palette of Sprite and Background into palette code 1 for background. | |
| E | Erases one line after the cursor. | |
| G | Emits a BEEP sound. | |
| H | Same function as `DEL`. | `DEL` |
| J | Line feed. Goes to the next line. Same as the `▼` key. | |
| K | Returns the cursor to the home position. | `SHIFT` + `CLR HOME` |
| L | Screen clear. | |
| M | Enters one line and goes to the next line (carriage return). | `RETURN` |
| R | Same function as `INS`. | `INS` |
| V | Turns to Kana mode. | |
| W | Turns to alphanumeric status. | |
| Z | Clears from the cursor to the end of the screen. | |

**Note:** ※CTR+A means pressing the `A` key while holding down the `CTR` key.

### MEMORY MAP

| Hexadecimal Address | Memory Usage |
|---------------------|--------------|
| `&H0000` - `&H07FF` | Work RAM (Family Computer Internal parts of machine) |
| `&H0800` - `&H1FFF` | Unused |
| `&H2000` - `&H5FFF` | Used by system |
| `&H6000` - `&H6FFF` | Unused |
| `&H7000` - `&H77FF` | For work RAM (inside the BASIC cassette) Each type of board data and Basic free area |
| `&H7800` - `&H7FFF` | Unused |
| `&H8000` - `&HFFFF` | Program ROM |

**Important Warning:** Do not use the POKE command for the area from `&H7000` to `&H703F`. It's used by the system.

---

*Page 104*

