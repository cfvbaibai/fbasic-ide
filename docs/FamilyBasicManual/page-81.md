# BASIC

## Sound Control Statements (Continued)

**6) Rest...** Specifies the length of a rest from R0 to R9.

**7) Length...** Specifies the length of sounds or rests by adding integers 0~9 after intervals, rests, or symbols.

**Length of Sound and Matching Integers:**

| Length of sound       | Matching integers |
|-----------------------|-------------------|
| (32nd note)           | 0                 |
| (16th note)           | 1                 |
| (dotted 16th note)    | 2                 |
| (8th note)            | 3                 |
| (dotted 8th note)     | 4                 |
| 1 (4th note)          | 5                 |
| 1+ (dotted 4th note)  | 6                 |
| 2 (2nd note)          | 7                 |
| 3 (dotted 2nd note)   | 8                 |
| 4 (whole note)        | 9                 |

**Warning:** The length of the note is equal to the relative value of a quarter note (integer 5) considered as 1.

(Written as C5R1)

When no integer is specified, it takes the same length of note as the one written before.

**8) Multiphonic...** Insert a channel separator : (colon) to play back 2 or 3 sounds at the same time.

`"Channel A:Channel B:Channel C"`

You have to specify the interval, length of note, tempo, envelope and duty for each channel.

However, envelope and duty do not change for channel C.

**Default Value:**

T4, M0, V15, O3, length of sound or length of rest 5.

Once specified, the values for each parameter remain unchanged until they are respecified.

---

*Page 81*

