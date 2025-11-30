# BASIC

## APPENDIX

### LIST OF ERROR MESSAGES

When NS-HUBASIC finds an error while executing a program, it displays an error message on screen, halts the execution of the program and goes into a command waiting status.

**Error Message Format:**

- **When executing in direct mode (example):** `?SN ERROR`
  - SN...error message

- **When executing in program mode (example):** `?SN ERROR IN 100`
  - SN...error message
  - 100...line number which contains the error

Please refer to the list below when you encounter an error message while executing a program for which you do not know the cause.

| Error Code | Error Message | Explanation |
|------------|---------------|-------------|
| NF | NEXT without FOR | There's a NEXT but no FOR. |
| SN | Syntax error | The grammar is wrong. |
| RG | RETURN without GOSUB | There's a RETURN but there's no GOSUB. |
| OD | Out of DATA | The data that is supposed to be read by READ can't be found within the DATA sentence. |
| IL | Illegal function call | The statement or function call is wrong. |
| OV | Overflow | The result of the calculus has transgressed the limit of the allowed scope. |
| OM | Out of memory | There's not enough memory. |
| UL | Undefined line Number | The line number specified by GOTO, GOSUB, IF etc. does not exist. |
| SO | Subscript out of range | The subscript of the array variable is out of range. |
| DD | Duplicate Definition | The array has been defined twice. |
| DZ | Division by zero | Division by zero. |
| TM | Type mismatch | Mismatch of type of variable. |
| ST | String too long | The characters contain more than 31 characters. |
| FT | Formula Too complex | The formula is too complex. For example, there are too many brackets. |
| CC | Can't continue | Can't continue the execution of the program with CONT. |
| MO | Missing operand | There's no designation towards the necessary command of the parameter. |
| TP | Tape read ERROR | Can't read correctly the data from the cassette tape. |

---

*Page 105*

