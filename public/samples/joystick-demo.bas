10 REM Family BASIC v3 Joystick Demo
20 PRINT "Joystick Control Demo"
30 PRINT "==================="
40 PRINT ""
50 PRINT "This program demonstrates STICK and STRIG functions"
60 PRINT "STICK(joystick) returns cross-button state:"
70 PRINT "  1=right, 2=left, 4=down, 8=top"
80 PRINT "STRIG(joystick) returns button state:"
90 PRINT "  1=start, 2=select, 4=B, 8=A"
100 PRINT ""
110 PRINT "Testing all 4 joysticks..."
120 PRINT ""
130 FOR I = 0 TO 3
140   PRINT "Joystick "; I; ":"
150   PRINT "  STICK("; I; ") = "; STICK(I)
160   PRINT "  STRIG("; I; ") = "; STRIG(I)
170   PRINT ""
180 NEXT I
190 PRINT "Demo completed!"
200 END
