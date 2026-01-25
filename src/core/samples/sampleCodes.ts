/**
 * Centralized sample codes for F-Basic IDE
 * Contains all predefined sample programs for easy maintenance and reuse
 */

export interface SampleCode {
  name: string
  description: string
  code: string
}

export const SAMPLE_CODES: Record<string, SampleCode> = {
  basic: {
    name: 'Basic',
    description: 'Simple arithmetic and variable operations',
    code: `10 PRINT "Basic F-Basic Program"
20 LET A = 10
30 LET B = 20
40 LET C = A + B
50 PRINT "A + B = "; C
60 END`,
  },

  pause: {
    name: 'Pause Demo',
    description: 'Demonstrates PAUSE command for timing delays',
    code: `10 PRINT "PAUSE Command Demo"
20 PRINT "Starting countdown..."
30 FOR I = 5 TO 1 STEP -1
40   PRINT "Countdown: "; I
50   PAUSE 1000
60 NEXT
70 PRINT "Blast off!"
80 PAUSE 2000
90 PRINT "Mission complete!"
100 END`,
  },

  gaming: {
    name: 'Joystick Test',
    description: 'Interactive joystick testing with continuous input monitoring',
    code: `10 REM Interactive Joystick Test
20 PRINT "Family BASIC v3 Interactive Joystick Test"
30 PRINT "=========================================="
40 PRINT ""
50 PRINT "This program continuously monitors joystick inputs"
60 PRINT "STICK(joystick) returns cross-button state:"
70 PRINT "  1=right, 2=left, 4=down, 8=top"
80 PRINT "STRIG(joystick) returns button state:"
90 PRINT "  1=start, 2=select, 4=B, 8=A"
100 PRINT ""
110 PRINT "Press START button on joystick #1 to exit"
120 PRINT "=========================================="
130 PRINT ""
140 REM Main input monitoring loop
150 PRINT "Monitoring joystick inputs..."
160 PRINT ""
170 REM Check for any joystick input
180 LET S0 = 0: LET S1 = 0
185 LET T0 = 0: LET T1 = 0
190 LET S0 = STICK(0): LET S1 = STICK(1)
195 LET T0 = STRIG(0): LET T1 = STRIG(1)
250 IF S0 > 0 OR T0 > 0 OR S1 > 0 OR T1 > 0 THEN PRINT "INPUT DETECTED!"
260 IF S0 > 0 OR T0 > 0 THEN PRINT "  Joystick 0: STICK="; S0; ", STRIG="; T0
270 IF S1 > 0 OR T1 > 0 THEN PRINT "  Joystick 1: STICK="; S1; ", STRIG="; T1
310 REM Check for exit condition (START button on joystick #1)
320 IF T1 = 1 THEN GOTO 360
330 PAUSE 200
340 GOTO 180
350 PRINT ""
360 PRINT "START button pressed on joystick #1"
370 PRINT "Exiting joystick test..."
380 END`,
  },

  complex: {
    name: 'Complex',
    description: 'Advanced programming with loops, conditions, and string functions',
    code: `10 REM Complex F-Basic Program
20 PRINT "Complex F-Basic Demo"
30 PRINT
40 FOR I = 1 TO 10
50   IF I MOD 2 = 0 THEN PRINT "Even: "; I
60   IF I MOD 2 = 1 THEN PRINT "Odd: "; I
70 NEXT
80 PRINT
90 LET S = 0
100 FOR J = 1 TO 100
110   S = S + J
120 NEXT
130 PRINT "Sum of 1 to 100 = "; S
140 PRINT
150 PRINT "String functions demo:"
160 LET T$ = "Hello World"
170 PRINT "Length of '"; T$; "' = "; LEN(T$)
180 PRINT "Left 5 chars: "; LEFT$(T$, 5)
190 PRINT "Right 5 chars: "; RIGHT$(T$, 5)
200 PRINT "Middle chars: "; MID$(T$, 3, 5)
210 END`,
  },

  comprehensive: {
    name: 'Full Demo',
    description: 'Comprehensive demonstration of all supported F-Basic features',
    code: `10 REM F-Basic Comprehensive Demo
20 PRINT "F-Basic Comprehensive Demo"
30 PRINT "=========================="
40 PRINT ""
50 PRINT "Mathematical functions:"
60 PRINT "ABS(-5) = "; ABS(-5)
70 PRINT "SGN(-10) = "; SGN(-10)
80 PRINT "SGN(10) = "; SGN(10)
90 PRINT "RND(100) = "; RND(100)
100 PRINT ""
110 PRINT "String functions:"
120 LET T$ = "Hello World"
130 PRINT "LEN('"; T$; "') = "; LEN(T$)
140 PRINT "LEFT$('"; T$; "', 5) = "; LEFT$(T$, 5)
150 PRINT "RIGHT$('"; T$; "', 5) = "; RIGHT$(T$, 5)
160 PRINT "MID$('"; T$; "', 3, 5) = "; MID$(T$, 3, 5)
170 PRINT ""
180 PRINT "Control structures:"
190 FOR I = 1 TO 3
200   IF I MOD 2 = 0 THEN PRINT "Even: "; I
205   IF I MOD 2 = 1 THEN PRINT "Odd: "; I
210 NEXT
220 PRINT ""
230 PRINT "Variables and expressions:"
240 LET A = 10
250 LET B = 20
260 LET C = A + B * 2
270 PRINT "A = "; A; ", B = "; B; ", C = A + B * 2 = "; C
280 PRINT ""
290 PRINT "Demo completed successfully!"
300 END`,
  },

  allChars: {
    name: 'All Chars',
    description: 'Print all characters from CHR$(0) to CHR$(255) without newline breaks',
    code: `10 FOR I = 0 TO 255
20   PRINT CHR$(I);
30 NEXT
40 END`,
  },

  spriteTest: {
    name: 'Sprite测试',
    description: 'Sprite system test - demonstrates DEF SPRITE and SPRITE commands',
    code: `10 REM Sprite Test Program
20 CLS
30 PRINT "Sprite Test Program"
40 PRINT "==================="
50 PRINT ""
60 PRINT "Testing sprite system..."
70 PRINT ""
80 REM Enable sprite screen
90 SPRITE ON
100 PRINT "SPRITE ON executed"
110 PRINT ""
120 REM Define sprite 0: 8x8 sprite with color combination 0
130 DEF SPRITE 0, (0, 0, 0, 0, 0) = CHR$(0)
140 PRINT "DEF SPRITE 0 defined (8x8, color 0)"
150 REM Display sprite at position (120, 100)
160 SPRITE 0, 120, 100
170 PRINT "SPRITE 0 displayed at (120, 100)"
180 PRINT ""
190 REM Define sprite 1: 16x16 sprite with color combination 1
200 DEF SPRITE 1, (1, 1, 0, 0, 0) = CHR$(0) + CHR$(1) + CHR$(2) + CHR$(3)
210 PRINT "DEF SPRITE 1 defined (16x16, color 1)"
220 REM Display sprite at position (150, 120)
230 SPRITE 1, 150, 120
240 PRINT "SPRITE 1 displayed at (150, 120)"
250 PRINT ""
260 REM Define sprite 2: 8x8 sprite with X-axis flip
270 DEF SPRITE 2, (0, 0, 0, 1, 0) = CHR$(0)
280 PRINT "DEF SPRITE 2 defined (8x8, X-flipped)"
290 SPRITE 2, 100, 150
300 PRINT "SPRITE 2 displayed at (100, 150)"
310 PRINT ""
320 REM Define sprite 3: 8x8 sprite with Y-axis flip
330 DEF SPRITE 3, (0, 0, 0, 0, 1) = CHR$(0)
340 PRINT "DEF SPRITE 3 defined (8x8, Y-flipped)"
350 SPRITE 3, 180, 150
360 PRINT "SPRITE 3 displayed at (180, 150)"
370 PRINT ""
380 PRINT "Sprite test completed!"
390 PRINT "All sprites should be visible on screen"
400 END`,
  },

  moveTest: {
    name: 'Move Test',
    description: 'Animation movement test - demonstrates DEF MOVE and MOVE commands',
    code: `10 REM Move Test Program
20 CLS
30 PRINT "Move Test Program"
40 PRINT "================="
50 PRINT ""
60 PRINT "Testing DEF MOVE and MOVE commands..."
70 PRINT ""
80 REM Character type variable (0=Mario, 1=Lady, 2=Fighter Fly, etc.)
90 LET C = 0
100 PRINT "Character type: "; C; " (Change C to switch characters)"
110 PRINT ""
120 REM Enable sprite screen
130 SPRITE ON
140 PRINT "SPRITE ON executed"
150 PRINT ""
160 REM Define movements for all 8 directions (0-7)
170 REM DEF MOVE(n) = SPRITE(A, B, C, D, E, F)
180 REM A: character type (0=Mario, 1=Lady, etc.)
190 REM B: direction (0=none, 1=up, 2=up-right, 3=right, 4=down-right, 5=down, 6=down-left, 7=left, 8=up-left)
200 REM C: speed (1-255, 60/C dots per second)
210 REM D: distance (1-255, total = 2*D dots)
220 REM E: priority (0=front, 1=behind background)
230 REM F: color combination (0-3)
240 REM Action 0: Direction 0 (none)
250 DEF MOVE(0) = SPRITE(C, 0, 10, 50, 0, 0)
260 PRINT "DEF MOVE(0) defined: Direction 0 (none), Speed 10, Distance 50"
270 REM Action 1: Direction 1 (up)
280 DEF MOVE(1) = SPRITE(C, 1, 10, 50, 0, 0)
290 PRINT "DEF MOVE(1) defined: Direction 1 (up), Speed 10, Distance 50"
300 REM Action 2: Direction 2 (up-right)
310 DEF MOVE(2) = SPRITE(C, 2, 10, 50, 0, 0)
320 PRINT "DEF MOVE(2) defined: Direction 2 (up-right), Speed 10, Distance 50"
330 REM Action 3: Direction 3 (right)
340 DEF MOVE(3) = SPRITE(C, 3, 10, 50, 0, 0)
350 PRINT "DEF MOVE(3) defined: Direction 3 (right), Speed 10, Distance 50"
360 REM Action 4: Direction 4 (down-right)
370 DEF MOVE(4) = SPRITE(C, 4, 10, 50, 0, 0)
380 PRINT "DEF MOVE(4) defined: Direction 4 (down-right), Speed 10, Distance 50"
390 REM Action 5: Direction 5 (down)
400 DEF MOVE(5) = SPRITE(C, 5, 10, 50, 0, 0)
410 PRINT "DEF MOVE(5) defined: Direction 5 (down), Speed 10, Distance 50"
420 REM Action 6: Direction 6 (down-left)
430 DEF MOVE(6) = SPRITE(C, 6, 10, 50, 0, 0)
440 PRINT "DEF MOVE(6) defined: Direction 6 (down-left), Speed 10, Distance 50"
450 REM Action 7: Direction 7 (left)
460 DEF MOVE(7) = SPRITE(C, 7, 10, 50, 0, 0)
470 PRINT "DEF MOVE(7) defined: Direction 7 (left), Speed 10, Distance 50"
480 PRINT ""
490 PRINT "Starting movements for all 8 directions..."
500 PRINT ""
510 REM Start all movements (0-7)
520 MOVE 0
530 PRINT "MOVE 0 started (direction 0: none)"
540 MOVE 1
550 PRINT "MOVE 1 started (direction 1: up)"
560 MOVE 2
570 PRINT "MOVE 2 started (direction 2: up-right)"
580 MOVE 3
590 PRINT "MOVE 3 started (direction 3: right)"
600 MOVE 4
610 PRINT "MOVE 4 started (direction 4: down-right)"
620 MOVE 5
630 PRINT "MOVE 5 started (direction 5: down)"
640 MOVE 6
650 PRINT "MOVE 6 started (direction 6: down-left)"
660 MOVE 7
670 PRINT "MOVE 7 started (direction 7: left)"
680 PRINT ""
690 PRINT "All movements started!"
700 PRINT "Check the screen to see sprites moving"
710 PRINT ""
720 PRINT "Tip: Change variable C (line 90) to test different characters"
730 PRINT "     C=0: Mario, C=1: Lady, C=2: Fighter Fly, etc."
740 END`,
  },
}

/**
 * Get a sample code by key
 */
export function getSampleCode(key: string): SampleCode | undefined {
  return SAMPLE_CODES[key]
}

/**
 * Get all available sample codes
 */
export function getAllSampleCodes(): SampleCode[] {
  return Object.values(SAMPLE_CODES)
}

/**
 * Get sample code keys
 */
export function getSampleCodeKeys(): string[] {
  return Object.keys(SAMPLE_CODES)
}
