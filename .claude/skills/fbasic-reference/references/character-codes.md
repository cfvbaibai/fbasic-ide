# Character Codes Reference

Character codes for CHR$(x) and ASC() functions. Range: 0-255.

## Code Ranges

| Range | Category | Notes |
|-------|----------|-------|
| 0-31 | System codes | Cannot be specified directly |
| 32-95 | ASCII | Space, symbols, numbers, uppercase letters |
| 96-183 | Katakana | Japanese kana characters |
| 184-255 | Special graphics | Game graphics (Mario, landscapes, etc.) |

## ASCII Characters (32-95)

| Code | Char | Code | Char | Code | Char | Code | Char |
|------|------|------|------|------|------|------|------|
| 32 | (space) | 48 | 0 | 64 | @ | 80 | P |
| 33 | ! | 49 | 1 | 65 | A | 81 | Q |
| 34 | " | 50 | 2 | 66 | B | 82 | R |
| 35 | # | 51 | 3 | 67 | C | 83 | S |
| 36 | $ | 52 | 4 | 68 | D | 84 | T |
| 37 | % | 53 | 5 | 69 | E | 85 | U |
| 38 | & | 54 | 6 | 70 | F | 86 | V |
| 39 | ' | 55 | 7 | 71 | G | 87 | W |
| 40 | ( | 56 | 8 | 72 | H | 88 | X |
| 41 | ) | 57 | 9 | 73 | I | 89 | Y |
| 42 | * | 58 | : | 74 | J | 90 | Z |
| 43 | + | 59 | ; | 75 | K | 91 | [ |
| 44 | , | 60 | < | 76 | L | 92 | ¥ |
| 45 | - | 61 | = | 77 | M | 93 | ] |
| 46 | . | 62 | > | 78 | N | 94 | ^ |
| 47 | / | 63 | ? | 79 | O | 95 | _ |

## Katakana Characters (96-183)

### Basic Kana (96-140)
| Code | Char | Code | Char | Code | Char | Code | Char |
|------|------|------|------|------|------|------|------|
| 96 | ア | 108 | ス | 120 | ノ | 132 | ユ |
| 97 | イ | 109 | セ | 121 | ハ | 133 | ヨ |
| 98 | ウ | 110 | ソ | 122 | ヒ | 134 | ラ |
| 99 | エ | 111 | タ | 123 | フ | 135 | リ |
| 100 | オ | 112 | チ | 124 | ヘ | 136 | ル |
| 101 | カ | 113 | ツ | 125 | ホ | 137 | レ |
| 102 | キ | 114 | テ | 126 | マ | 138 | ロ |
| 103 | ク | 115 | ト | 127 | ミ | 139 | ワ |
| 104 | ケ | 116 | ナ | 128 | ム | 140 | ン |
| 105 | コ | 117 | ニ | 129 | メ | 141 | ヲ |
| 106 | サ | 118 | ヌ | 130 | モ | | |
| 107 | シ | 119 | ネ | 131 | ヤ | | |

### Small Kana (142-150)
| Code | Char | Code | Char |
|------|------|------|------|
| 142 | ァ | 147 | ャ |
| 143 | ィ | 148 | ュ |
| 144 | ゥ | 149 | ョ |
| 145 | ェ | 150 | ッ |
| 146 | ォ | | |

### Voiced Kana (151-175)
| Code | Char | Code | Char | Code | Char |
|------|------|------|------|------|------|
| 151 | ガ | 161 | ダ | 171 | パ |
| 152 | ギ | 162 | ヂ | 172 | ピ |
| 153 | グ | 163 | ヅ | 173 | プ |
| 154 | ゲ | 164 | デ | 174 | ペ |
| 155 | ゴ | 165 | ド | 175 | ポ |
| 156 | ザ | 166 | バ | | |
| 157 | ジ | 167 | ビ | | |
| 158 | ズ | 168 | ブ | | |
| 159 | ゼ | 169 | ベ | | |
| 160 | ゾ | 170 | ボ | | |

### Special Symbols (176-183)
| Code | Char | Description |
|------|------|-------------|
| 176 | □ | Square |
| 177 | ° | Degree |
| 178 | [ | Left bracket |
| 179 | ] | Right bracket |
| 180 | © | Copyright |
| 181 | × | Multiply |
| 182 | ÷ | Divide |
| 183 | ファ | Fa (combined) |

## Special Graphics (184-255)

| Range | Category |
|-------|----------|
| 184-191 | E0-E7 |
| 192-199 | F0-F7 (MARIO) |
| 200-207 | G0-G7 (LANDSCAPE) |
| 208-215 | H0-H7 (DONKEY KONG Jr.) |
| 216-223 | I0-I7 (ISLAND MAN) |
| 224-231 | J0-J7 (MAZE) |
| 232-239 | K0-K7 (RULER FOR GRAPH) |
| 240-247 | L0-L7 (BOARD FRAME) |
| 248-255 | M0-M7 (INKPOT PAINT) |

## Usage Examples

```basic
' Print uppercase A
PRINT CHR$(65)

' Print katakana ア
PRINT CHR$(96)

' Get character code
A = ASC("H")  ' Returns 72

' Build string from codes
A$ = CHR$(72) + CHR$(73)  ' "HI"
```

## Source
Manual pages: 108-109
