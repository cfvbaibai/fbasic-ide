# BASIC

## Sound Control Statements

### BEEP

**Working**

Outputs a 'beep' type of sound.

**Grammar**

```
BEEP
```

**Abbreviation**

B.

**Sample Program**

*Please refer to PAUSE, IF ~ THEN.*

### PLAY

**Working**

Plays back music.

**Grammar**

```
PLAY String data
```

**Abbreviation**

PL.

**Explanation**

Plays back according to the sound specified by the string data. The string data specifies the interval, octave, length of sound, volume, chord, envelope and duty, and looks like the string of characters that we will explain below. You can use the channel separator (colon) to play back up to 3 sounds.

**Sample Programs**

```basic
PLAY"CRDRE"
OK
PLAY"T4Y2M0V1503C5R5D5R5E5"
OK
PLAY"T2Y0M1V901C3R5D6R1E4"
OK
PLAY"C:E:G"
OK (multiphonic (3 simultaneous sound output) separated by colons, half/high tone low tone)
PLAY"05C5:04E5:01G5"
OK (Specifies each parameter for each channel in case of 3 simultaneous sound output.)
```

**Note:** Once specified, T, Y, M, V and O will carry on their values. T (Tempo), Y (Duty effect), M (Envelope), V (Envelope's length or volume), O (Octave).

**String Data Parameters Explanation:**

**1. Tempo**

Specifies the tempo with T1~T8. T1 (fast) <---------> T8 (slow)

**2. Duty effect (tone)**

Specifies tone with Y0~Y3.

- Y0: 12.5%
- Y1: 25.0%
- Y2: 50.0%
- Y3: 75.0%

Duty effect becomes effective after executing the specified envelope (M0 or M1).

After specifying M0 or M1, please specify the tone (Y0~Y3).

**3. Envelope**

Specifies with M0 and M1 whether to use or not the envelope. When using the envelope, the sound becomes resonant, flat or sloppy.

**When using M0 (no envelope):** you can specify the volume with Vn from V0 to V15.

- Volume range: 0 (small volume) <---------> 15 (big volume)
- Example: `M0V15` = Volume 15

**When using M1 (envelope):** you can specify the length of the envelope with Vn from V0 to V15.

- Envelope range: 0 (short envelope) <---------> 15 (long envelope)
- Example: `M1V3` = Envelope 3, volume 15.

**4. Octave**

Specifies the octave with O0 ~ O5. O0 (low tone) <---------> O5 (high tone)

**5. Interval**

The interval is displayed as below by using the characters C~B.

| Interval | Designation |
|----------|-------------|
| Do       | C           |
| Do# (Reb)| #C          |
| Re       | D           |
| Re# (Mib)| #D          |
| Mi       | E           |
| Fa       | F           |
| Fa# (Sob)| #F          |
| So       | G           |
| So# (Lab)| #G          |
| La       | A           |
| La# (Sib)| #A          |
| Si       | B           |

**PLAY String Data Breakdown:**

Example: `PLAY"T4Y2M0V1503C5R5D5R5E5"`

- `T4`: Tempo
- `Y2`: Duty
- `M0`: Envelope
- `V15`: Volume
- `O3`: Octave
- `C5`: Interval, Length
- `R5`: Rest Length
- `D5`: Interval, Length
- `R5`: Rest Length
- `E5`: Interval, Length

---

*Page 80*

