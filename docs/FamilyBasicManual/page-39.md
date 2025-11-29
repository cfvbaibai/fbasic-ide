# BASIC

## Rock'n Rouge - Musical Notation

**Title:** Rock'n Rouge

**Composer:** Karuho Kureta (composer)

**Musical Notation:**

The top section of this page contains the complete sheet music for "Rock'n Rouge" arranged for piano/keyboard. The notation includes:
- Multiple systems with grand staff (treble and bass clefs)
- Notes, rests, bar lines, and time signatures
- Chord symbols above the staves: C, Bb, Fm, A, Ab, Bbm, Dm7, G7, Am7, Dm, Gsus4, Fm7
- Sections marked with letters 'A' and 'B' in boxes

## Let's synchronize sounds with Mario's movements!

**Adding sound is very effective to increase the fun of a game!**

**Please enter the following program.**

**Program Listing:**

```basic
5 CLS: SPRITE ON: CGSET 1,0
10 FOR N=0 TO 2: DEF MOVE (N)=SPRITE(0,N+2,1,20,1,0): NEXT
20 FOR K=3 TO 7: DEF MOVE(K)=SPRITE(8+K,7,1,255,1,0): NEXT
30 POSITION 7,0,30: MOVE 1
40 PLAY "T104C1D1G1B1CGAB "
50 IF MOVE(1)=-1 THEN 50
60 ERA 1: POSITION 0, XPOS(1), YPOS(1): MOVE 0,6
70 PLAY "T105CDEABGD"
80 IF MOVE(0)=-1 THEN 80
90 ERA 0: POSITION 2, XPOS(0), YPOS(0): MOVE 2,5
100 IF MOVE(2)=-1 THEN 100
110 ERA 2: POSITION 1, XPOS(2), YPOS(2): MOVE 7,3: GOTO 30
```

**Program Explanation:**

- Line 5: Clears screen, enables sprites, sets color palette
- Line 10: Defines movement patterns for Mario (N=0 to 2) with different directions
- Line 20: Defines movement patterns for other characters (K=3 to 7)
- Line 30: Sets initial position for action 7 and starts movement 1
- Line 40: Plays sound effect synchronized with Mario's first movement
- Line 50: Waits for movement 1 to complete
- Line 60: Erases sprite, positions new sprite at old position, starts movement 0
- Line 70: Plays sound effect synchronized with Mario's second movement
- Line 80: Waits for movement 0 to complete
- Line 90: Erases sprite, positions new sprite at old position, starts movement 2
- Line 100: Waits for movement 2 to complete
- Line 110: Erases sprite, positions new sprite at old position, starts movements 7 and 3, loops back to line 30

**Execution:**

Upon entering `RUN [RETURN]` sound will be played at the same time as Mario's actions on screen, making it even more fun!

**References:**

*Please refer to p. 80 for more info about the PLAY command. Also, refer to p. 70 for more info about the LOCATE command.*

---

*Page 39*

