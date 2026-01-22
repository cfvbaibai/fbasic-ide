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
60 END`
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
100 END`
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
380 END`
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
210 END`
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
300 END`
  },

  allChars: {
    name: 'All Chars',
    description: 'Print all characters from CHR$(0) to CHR$(255) without newline breaks',
    code: `10 FOR I = 0 TO 255
20   PRINT CHR$(I);
30 NEXT
40 END`
  }
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

