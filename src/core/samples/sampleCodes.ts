/**
 * Sample codes for F-Basic IDE - organized by category for testing
 */

export interface SampleCode {
  name: string
  description: string
  code: string
  category: 'basics' | 'control' | 'data' | 'screen' | 'sprites' | 'interactive' | 'comprehensive' | 'debug'
}

export const SAMPLE_CODES: Record<string, SampleCode> = {
  basic: {
    name: 'Basic F-Basic Program',
    description: 'Simple arithmetic with LET and PRINT',
    category: 'basics',
    code: `10 PRINT "Basic F-Basic Program"
20 LET A = 10
30 LET B = 20
40 LET C = A + B
50 PRINT "A + B = "; C
60 END`,
  },

  pause: {
    name: 'PAUSE Command Demo',
    description: 'Demonstrates PAUSE with countdown and timing delays',
    category: 'control',
    code: `10 PRINT "PAUSE Command Demo"
20 PRINT "Starting countdown..."
30 FOR I = 5 TO 1 STEP -1
40   PRINT "Countdown: "; I
50   PAUSE 3
60 NEXT
70 PRINT "Blast off!"
80 PAUSE 10
90 PRINT "Mission complete!"
100 END`,
  },

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
    description: 'Multiple sprites with DEF MOVE - animation demo',
    category: 'sprites',
    code: `10 CLS
20 SPRITE ON
30 DEF MOVE(0)=SPRITE(0,2,15,60,0,0)
40 DEF MOVE(1)=SPRITE(1,4,15,60,0,0)
50 DEF MOVE(2)=SPRITE(2,6,15,60,0,0)
60 MOVE 0: MOVE 1: MOVE 2
70 PRINT "Three sprites moving..."
80 PAUSE 200
90 CUT 0: CUT 1: CUT 2
100 PRINT "Movement stopped!"
110 PAUSE 60
120 ERA 0: ERA 1: ERA 2
130 END`,
  },

  spriteControl: {
    name: 'Sprite Control',
    description: 'POSITION, XPOS, YPOS, CUT, ERA - single sprite control',
    category: 'sprites',
    code: `10 CLS
20 SPRITE ON
30 POSITION 0, 50, 100
40 DEF MOVE(0)=SPRITE(0,3,15,60,0,0)
50 MOVE 0
60 PRINT "Moving..."
70 PAUSE 100
80 CUT 0
90 PRINT "XPOS="; XPOS(0)
100 PRINT "YPOS="; YPOS(0)
110 PAUSE 100
120 ERA 0
130 END`,
  },

  spriteSimpleMove: {
    name: 'Simple MOVE Test (DEBUG)',
    description: 'Minimal DEF MOVE + POSITION + MOVE test - loop keeps program alive for animation',
    category: 'debug',
    code: `10 CLS
20 SPRITE ON
30 PRINT "Simple MOVE Test"
40 DEF MOVE(0)=SPRITE(0,3,15,60,0,0)
50 POSITION 0,128,120
60 MOVE 0
70 PRINT "Movement started"
80 PRINT "Watch sprite animate..."
90 ' Wait for movement to complete (MOVE(0) returns 0 when done)
100 FOR I = 1 TO 200
110 IF MOVE(0)=0 THEN PRINT "Done!": GOTO 140
120 PAUSE 1
130 NEXT
140 PRINT "Movement complete"
150 END`,
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

  strigTest: {
    name: 'STRIG Button Test (DEBUG)',
    description: 'Dedicated STRIG button test - shows button presses with values',
    category: 'debug',
    code: `10 CLS
20 PRINT "=== STRIG BUTTON TEST ==="
30 PRINT "Press buttons: START(1) SELECT(2) B(4) A(8)"
40 PRINT "Watch value below change"
50 PRINT ""
60 PRINT "Last button: "
70 LOCATE 0,6
80 T = STRIG(0)
90 IF T = 0 THEN 110
100 PRINT "Button pressed: ";T
110 IF T = 1 THEN CLS:PRINT "START pressed!":PAUSE 60:GOTO 10
120 IF T = 2 THEN CLS:PRINT "SELECT pressed!":PAUSE 60:GOTO 10
130 IF T = 4 THEN CLS:PRINT "B button pressed!":PAUSE 60:GOTO 10
140 IF T = 8 THEN CLS:PRINT "A button pressed!":PAUSE 60:GOTO 10
150 PAUSE 2
160 GOTO 70
170 END`,
  },

  shooting: {
    name: 'Shooting Game',
    description: 'Full shooting game with levels, sprites, and scoring',
    category: 'comprehensive',
    code: `5 S=4:CLS
7 LOCATE 10,12:IF S=0 THEN 2000
8 PRINT "LEVEL:";5-S: PAUSE 53:CLS
10 SPRITE ON:FOR X=0 TO 7:GOSUB 1000:NEXT
20 PLAY "T1CDEFAB1O5"
30 PRINT "SCORE:";K
100 E=14:F=12:C=0:D=0
110 A=STICK(0)
111 IF E<>C OR F<>D THEN LOCATE C,D:PRINT " ":LOCATE E,F:PRINT CHR$(&HDD):C=E:D=F
115 IF STRIG(0)=8 THEN 130
117 'MOVE AIM CONTINUOUSLY WHILE HOLDING BUTTONS
120 E=E+((A AND 1)=1)*(E<27)-((A AND 2)=2)*(E>0):F=F+((A AND 4)=4)*(F<23)-((A AND 8)=8)*(F>0):GOTO 180
125 'IF NOT SHOT, GOTO 200 FOR REST OF LOGIC
130 PLAY "B":LOCATE E,F:PRINT "*";:PAUSE 1:LOCATE E,F:PRINT " ":LOCATE E,F:PRINT CHR$(&HDD);
135 'MOVE SPRITES AND CHECK HIT ONE BY ONE
140 FOR X=0 TO 7
150 IF C=XPOS(X)/8-2 AND D=YPOS(X)/8-3 THEN ERA X:GOSUB 1000:PLAY "ABFEAFEFCDGF":K=K+1:LOCATE 7,0:PRINT K;
155 'IF SPRITE'S LAST MOVE IS DONE, GIVE ANOTHER MOVE
160 NEXT
180 FOR Y=0 TO 7
181 IF MOVE(Y)=0 THEN X=Y:GOSUB 1000
182 NEXT
190 IF K<(5-S)*1000 THEN PAUSE 3:GOTO 110
200 SPRITE OFF:CLS:LOCATE 10,12:PRINT "ALL RIGHT":PAUSE 54:S=S-1:CLS:GOTO 7
1000 DEF MOVE(X)=SPRITE(RND(16),RND(9),5,255,0,0):POSITION X,RND(255),RND(255):MOVE X:RETURN
2000 CLS:PRINT "YOU PASSED!":LOCATE 4,10:PRINT "PROGRAM BY LI YA PING":PRINT:PRINT "ADDRESS: ZHENG ZHOU UNIVERSITY":PRINT "DEP.PHYSICS 91-5#"
2010 PRINT "POST NUMBER: 450052"`,
  },

  eraMoveTest: {
    name: 'ERA → MOVE Test (DEBUG)',
    description: 'Minimal test for ERA followed immediately by MOVE - reproduces teleportation bug',
    category: 'debug',
    code: `10 CLS
20 SPRITE ON
30 PRINT "ERA/MOVE Test"
40 PRINT "Watch sprite 0"
50 PRINT "Press A button to ERA+MOVE"
60 '
100 ' Initialize sprite
110 DEF MOVE(0)=SPRITE(0,3,15,60,0,0)
120 POSITION 0,128,120
130 MOVE 0
140 '
150 ' Main loop
160 T=STRIG(0)
170 IF (T AND 8)=8 THEN 210
180 GOTO 160
190 '
200 ' ERA followed immediately by MOVE
210 ERA 0
220 DEF MOVE(0)=SPRITE(1,3,15,60,0,0)
230 POSITION 0,RND(256),RND(256)
240 MOVE 0
250 PRINT "Restarted!"
260 GOTO 160`,
  },

  eraMoveLoopTest: {
    name: 'ERA → MOVE Loop Test (DEBUG)',
    description: 'Auto-repeating ERA+MOVE loop - teleports should happen rapidly',
    category: 'debug',
    code: `10 CLS
20 SPRITE ON
30 PRINT "Auto ERA/MOVE Test"
40 PRINT "Sprite should keep moving"
50 PRINT "Press SELECT to stop"
60 '
100 ' Initialize sprite
110 DEF MOVE(0)=SPRITE(0,3,15,60,0,0)
120 POSITION 0,128,120
130 MOVE 0
140 '
150 ' Auto ERA+MOVE loop
160 IF MOVE(0)=0 THEN 210
170 T=STRIG(0)
180 IF (T AND 2)=2 THEN 260
190 GOTO 160
200 ' ERA followed immediately by MOVE (when movement completes)
210 ERA 0
220 DEF MOVE(0)=SPRITE(RND(8),3,15,60,0,0)
230 POSITION 0,RND(256),RND(256)
240 MOVE 0
245 GOTO 160
250 ' Stop
260 CUT 0
270 PRINT "Stopped. Press A to restart"
280 T=STRIG(0)
285 IF (T AND 8)=8 THEN 110
290 GOTO 280`,
  },

  multiSpriteEraMoveTest: {
    name: 'Multi-Sprite ERA → MOVE Test (DEBUG)',
    description: 'Multiple sprites with simultaneous ERA+MOVE - like shooting game hit scenario',
    category: 'debug',
    code: `10 CLS
20 SPRITE ON
30 PRINT "Multi-Sprite ERA/MOVE"
40 PRINT "Watch all 4 sprites"
50 PRINT "Press A to ERA+MOVE sprite 0"
60 '
100 ' Initialize 4 sprites
110 FOR I=0 TO 3
120 DEF MOVE(I)=SPRITE(I*2,3,15,60,0,0)
130 POSITION I,50+I*40,50+(I AND 1)*80
140 MOVE I
150 NEXT
160 '
170 ' Main loop
180 S=STRIG(0)
190 IF (S AND 8)=8 THEN 270
200 GOTO 180
210 '
250 ' ERA sprite 0 and immediately MOVE it
260 ' (simulates hitting enemy in shooting game)
270 ERA 0
280 DEF MOVE(0)=SPRITE(RND(8),3,15,60,0,0)
290 POSITION 0,RND(256),RND(256)
300 MOVE 0
310 '
320 ' Check other sprites for completion and restart
330 FOR I=1 TO 3
340 IF MOVE(I)=0 THEN 410
350 NEXT
360 GOTO 180
370 '
400 ' Sprite I completed - restart it
410 ERA I
420 DEF MOVE(I)=SPRITE(I*2,3,15,60,0,0)
430 POSITION I,RND(256),RND(256)
440 MOVE I
450 GOTO 360`,
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
