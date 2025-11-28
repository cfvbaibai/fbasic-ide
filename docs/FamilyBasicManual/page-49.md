# BASIC GRAMMAR

## BASIC Specification Standards

| Features related to language elements | Features related to system capabilities |
|---------------------------------------|------------------------------------------|
| **Type of characters:** `numbers/alphabet/kana/symbols` | **Screen modes:** `BG GRAPHIC screen, sprite screen, background screen, backdrop screen` |
| **Display range for numbers (integers):**<br>- `decimal (-32768 to + 32767)`<br>- `hexadecimal (&H0000 to &HFFFF)`<br>- `line of characters (0 to 31 characters)` | **Graphical resolution:**<br>- `Background screen (28 characters x 24 lines)`<br>- `Sprite screen (256 x 240 dots)`<br>- `1 character (8 x 8 dots)` |
| **Variable name types:** `Besides the 2 letters at the beginning, up to 255 characters` | **Colors:** `Color generator for 52 colors` |
| **Range for line numbers:** `0 to 65535` | **Sound function:** `Scale, tempo, 3 note polyphony, tone` |
| **Digits per line of text:** `255 digits` | **Controller input:** `Left-right controller (directional/trigger input possible)` |
| **Size of array:** `Up to 2 dimensions, no element limit (within scope of memory)` | **File function:** `Cassette tape (1200 bauds)` |
| **Multi statement:** `Possible : separate by colon` | **Amount of commands:** `Basic 74` |
| **Sub-routine, nest:** `No limit (within scope of memory)` | **Animated character setup:** `Selection among 16 types of preset characters` |
| **FOR NEXT loop:** `No limit (within scope of memory)` | |
| **Editing function:** `Screen editor` | |

**Note:** The display of results from calculations which handle numbers beyond the display range of -32768 to +32767 is not guaranteed.

## Warning

This manual was created based on NS-HUBASIC.

1. Please check the version number carefully, as the system software version or this manual might have been modified without notice (NS-HUBASIC V2.0A).
2. It is forbidden to duplicate the system software and also this book.
3. A lot of effort was put into the development of this extremely complicated product, including its manual. If you were to find a defect within these, please contact Nintendo or the place where you bought this product. Moreover, please understand that we can not be held responsible for any effects of what you create with this.

---

*Page 49*

