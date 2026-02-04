/**
 * Sample codes for F-Basic IDE - organized by category for testing
 */

export interface SampleCode {
  name: string
  description: string
  code: string
  category: 'basics' | 'control' | 'data' | 'screen' | 'sprites' | 'interactive' | 'comprehensive'
}

export const SAMPLE_CODES: Record<string, SampleCode> = {
  hello: {
    name: 'Hello World',
    description: 'Simple PRINT demonstration',
    category: 'basics',
    code: `10 PRINT "Family BASIC v3"
20 PRINT "=============="
30 PRINT "Hello, World"
40 END`,
  },

  variables: {
    name: 'Variables & Math',
    description: 'LET, arithmetic, functions',
    category: 'basics',
    code: `10 LET A = 10
20 LET B = 25
30 PRINT "A="; A; " B="; B
40 PRINT "A+B="; A+B
50 PRINT "ABS(-5)="; ABS(-5)
60 PRINT "SGN(3)="; SGN(3)
70 LET S$ = "Hello"
80 PRINT "LEN="; LEN(S$)
90 END`,
  },

  input: {
    name: 'INPUT / LINPUT',
    description: 'User input commands',
    category: 'basics',
    code: `10 INPUT "Name"; N$
20 PRINT "Hello "; N$
30 INPUT "Num"; X
40 PRINT "Square="; X*X
50 END`,
  },

  loops: {
    name: 'FOR-NEXT',
    description: 'Looping statements',
    category: 'control',
    code: `10 FOR I = 1 TO 5
20 PRINT I
30 NEXT
40 PRINT "Done"
50 END`,
  },

  conditionals: {
    name: 'IF-THEN',
    description: 'Conditional logic',
    category: 'control',
    code: `10 FOR I = 1 TO 5
20 IF I=3 THEN PRINT "Three"
30 NEXT
40 END`,
  },

  subroutines: {
    name: 'GOSUB-RETURN',
    description: 'Subroutines',
    category: 'control',
    code: `10 GOSUB 100
20 GOSUB 200
30 END
100 PRINT "Sub 1"
110 RETURN
200 PRINT "Sub 2"
210 RETURN`,
  },

  dataRead: {
    name: 'DATA & READ',
    description: 'Data storage',
    category: 'data',
    code: `10 FOR I = 1 TO 3
20 READ N
30 PRINT N
40 NEXT
50 DATA 10, 20, 30
60 END`,
  },

  arrays: {
    name: 'DIM Arrays',
    description: 'Array usage',
    category: 'data',
    code: `10 DIM A(3)
20 FOR I = 1 TO 3
30 A(I) = I*10
40 NEXT
50 PRINT A(1); A(2); A(3)
60 END`,
  },

  screen: {
    name: 'Screen & Colors',
    description: 'LOCATE, CGSET, PALETB',
    category: 'screen',
    code: `10 CLS
20 PRINT "Screen Demo"
30 LOCATE 10, 5
40 PRINT "Hi"
50 CGSET 0
60 PALETB 0, 1, 0, 0, 0
70 END`,
  },

  spriteBasic: {
    name: 'Sprite Basics',
    description: 'DEF SPRITE, SPRITE commands (8x8 sprite)',
    category: 'sprites',
    code: `10 CLS
20 SPRITE ON
30 DEF SPRITE 0, (0,0,0,0,0)=CHR$(0)
40 SPRITE 0, 100, 100
50 END`,
  },

  spriteAnimation: {
    name: 'Sprite Animation',
    description: 'DEF MOVE, MOVE commands',
    category: 'sprites',
    code: `10 CLS
20 SPRITE ON
30 DEF MOVE(0)=SPRITE(0,3,15,50,0,0)
40 MOVE 0
50 PAUSE 100
60 CUT 0
70 ERA 0
80 END`,
  },

  spriteControl: {
    name: 'Sprite Control',
    description: 'CUT, ERA, POSITION, XPOS, YPOS',
    category: 'sprites',
    code: `10 CLS
20 SPRITE ON
30 POSITION 0, 50, 100
40 DEF MOVE(0)=SPRITE(0,3,15,60,0,0)
50 MOVE 0
60 PRINT "XPOS="; XPOS(0)
70 PAUSE 50
80 CUT 0
90 ERA 0
100 END`,
  },

  spriteInteractive: {
    name: 'Interactive Sprites',
    description: 'Control sprites with joystick - hold DPAD to move',
    category: 'interactive',
    code: `10 CLS
20 SPRITE ON
30 DEF SPRITE 0, (0,0,0,0,0)=CHR$(0)
40 SPRITE 0, 150, 100
50 PX = 150
60 PY = 100
70 S = STICK(0)
80 T = STRIG(0)
90 IF T=1 THEN 170
100 IF S=1 THEN PX = PX + 2
110 IF S=2 THEN PX = PX - 2
120 IF S=4 THEN PY = PY + 2
130 IF S=8 THEN PY = PY - 2
140 SPRITE 0, PX, PY
150 PAUSE 5
160 GOTO 70
170 ERA 0
180 END`,
  },

  joystick: {
    name: 'Joystick Test',
    description: 'STICK and STRIG functions',
    category: 'interactive',
    code: `10 PRINT "Joystick Test"
20 S = STICK(0)
30 T = STRIG(0)
40 IF T=1 THEN 90
50 IF S>0 THEN PRINT S
60 PAUSE 5
70 GOTO 20
80 PRINT "Done"
90 END`,
  },

  comprehensive: {
    name: 'Full Demo',
    description: 'All major features',
    category: 'comprehensive',
    code: `10 CLS
20 PRINT "Full Demo"
30 A=10 : B=20
40 PRINT "A="; A; " B="; B
50 FOR I = 1 TO 3
60 PRINT "I="; I
70 NEXT
80 SPRITE ON
90 DEF SPRITE 0, (0,0,0,0,0)=CHR$(0)
100 SPRITE 0, 150, 100
110 END`,
  },

  screenCoalesce: {
    name: 'Performance Test',
    description: 'Screen update test',
    category: 'screen',
    code: `10 CLS
20 FOR I = 1 TO 50
30 PRINT "Line "; I
40 NEXT
50 PRINT "Done"
60 END`,
  },

  allChars: {
    name: 'All Characters',
    description: 'Print all CHR$(0) to CHR$(255)',
    category: 'screen',
    code: `10 FOR I = 0 TO 31
20 PRINT CHR$(I);
30 NEXT
40 PRINT ""
50 PRINT "Done"
60 END`,
  },
}

export function getSampleCode(key: string): SampleCode | undefined {
  return SAMPLE_CODES[key]
}

export function getAllSampleCodes(): SampleCode[] {
  return Object.values(SAMPLE_CODES)
}

export function getSampleCodeKeys(): string[] {
  return Object.keys(SAMPLE_CODES)
}
