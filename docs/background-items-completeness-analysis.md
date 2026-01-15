# Background Items Completeness Analysis

## Comparison: Family Basic Manual vs Current Implementation

Based on the Family Basic Manual (Character Code List B, pages 108-109), this document compares what should be available vs what we currently have implemented.

---

## Character Code List B (Background Screen Characters)

### System Codes (0-31)
**Status:** ❌ **NOT IMPLEMENTED** (and not needed - these are system codes, not background items)

These codes (A0-A7, B0-B7, C0-C7, D0-D7) are system codes that cannot be specified directly for background use according to the manual (page 109: "hexadecimal codes from 00 to 1F may not be specified directly because they are used by the system").

**Action:** No action needed - these are intentionally excluded.

---

### Standard ASCII Characters (32-95)

#### Space and Symbols (32-47)
**Manual:** Codes 32-47
**Current:** ✅ **COMPLETE**
- 32: space ✓
- 33: ! ✓
- 34: " ✓
- 35: # ✓
- 36: $ ✓
- 37: % ✓
- 38: & ✓
- 39: ' ✓
- 40: ( ✓
- 41: ) ✓
- 42: * ✓
- 43: + ✓
- 44: , ✓
- 45: - ✓
- 46: . ✓
- 47: / ✓

#### Numbers (48-57)
**Manual:** Codes 48-57
**Current:** ✅ **COMPLETE**
- 48: 0 ✓
- 49: 1 ✓
- 50: 2 ✓
- 51: 3 ✓
- 52: 4 ✓
- 53: 5 ✓
- 54: 6 ✓
- 55: 7 ✓
- 56: 8 ✓
- 57: 9 ✓

#### Symbols (58-64)
**Manual:** Codes 58-64
**Current:** ✅ **COMPLETE**
- 58: : ✓
- 59: ; ✓
- 60: < ✓
- 61: = ✓
- 62: > ✓
- 63: ? ✓
- 64: @ ✓

#### Letters (65-90)
**Manual:** Codes 65-90
**Current:** ✅ **COMPLETE**
- 65-90: A-Z ✓

#### Symbols (91-95)
**Manual:** Codes 91-95
**Current:** ✅ **COMPLETE**
- 91: [ (「) ✓
- 92: ¥ ✓
- 93: ] (」) ✓
- 94: ^ ✓
- 95: _ ✓

---

### Kana Characters (96-183)

#### Basic Kana (96-127)
**Manual:** Codes 96-127
**Current:** ⚠️ **OFF-BY-ONE DISCREPANCY**

**Issue:** The manual shows codes starting at 96, but our implementation starts at 97.

**Manual Mapping:**
- 96: ア
- 97: イ
- 98: ウ
- ... (continues to 127: ミ)

**Current Implementation:**
- 97: ア (should be 96)
- 98: イ (should be 97)
- 99: ウ (should be 98)
- ... (continues to 128: ミ, should be 127)

**Missing:** Code 96 (ア)

**Action Required:** 
1. Verify if this is an intentional offset or a bug
2. Add code 96 if needed, OR
3. Adjust all kana codes to match manual (shift down by 1)

#### Extended Kana (128-175)
**Manual:** Codes 128-175
**Current:** ⚠️ **OFF-BY-ONE DISCREPANCY** (same issue as above)

**Manual Mapping:**
- 128: ム
- 129: メ
- ... (continues to 175: ポ)

**Current Implementation:**
- 129: ム (should be 128)
- 130: メ (should be 129)
- ... (continues to 176: ポ, should be 175)

**Missing:** All codes are shifted by +1

#### Special Kana (183)
**Manual:** Code 183: ファ
**Current:** ✅ **PRESENT** (code 183)

---

### Special Symbols (176-182)
**Manual:** Codes 176-182
**Current:** ⚠️ **PARTIAL - CONFLICT WITH KANA**

**Issue:** Code 176 is used for both:
- Symbol: □ (in SYMBOL_BG_ITEMS)
- Kana: ポ (in KANA_BG_ITEMS)

**Manual Mapping:**
- 176: □
- 177: ° (but we have '。' - may be different character)
- 178: [
- 179: ]
- 180: ©
- 181: ×
- 182: ÷

**Current Implementation:**
- 176: □ ✓ (in symbols)
- 177: 。 ✓ (may be different from °)
- 178: [ ✓
- 179: ] ✓
- 180: © ✓
- 181: × ✓
- 182: ÷ ✓

**Conflict:** Code 176 appears in both SYMBOL_BG_ITEMS and KANA_BG_ITEMS

**Action Required:** Resolve code 176 conflict - determine which is correct per manual

---

### Special Graphics (184-255)
**Manual:** Codes 184-255
**Current:** ❌ **NOT IMPLEMENTED**

These are special graphics characters used for game-specific elements:

#### E0-E7 (Codes 184-191)
- 184: (E0)
- 185: (E1)
- 186: (E2)
- 187: (E3)
- 188: (E4)
- 189: (E5)
- 190: (E6)
- 191: (E7)

#### F0-FF - MARIO (Codes 192-199)
- 192: (F0) **MARIO**
- 193: (F1) **MARIO**
- 194: (F2) **MARIO**
- 195: (F3) **MARIO**
- 196: (F4) **MARIO**
- 197: (F5) **MARIO**
- 198: (F6) **MARIO**
- 199: (F7) **MARIO**

#### G0-G7 - LANDSCAPE (Codes 200-207)
- 200: (G0) **LANDSCAPE**
- 201: (G1) **LANDSCAPE**
- 202: (G2) **LANDSCAPE**
- 203: (G3) **LANDSCAPE**
- 204: (G4) **LANDSCAPE**
- 205: (G5) Star (1)
- 206: (G6) Star (2)
- 207: (G7) Ball

#### H0-H7 - DONKEY KONG Jr. (Codes 208-215)
- 208: (H0) **DONKEY KONG Jr.**
- 209: (H1) **DONKEY KONG Jr.**
- 210: (H2) **DONKEY KONG Jr.**
- 211: (H3) **DONKEY KONG Jr.**
- 212: (H4) **DONKEY KONG Jr.**
- 213: (H5) **DONKEY KONG Jr.**
- 214: (H6) **DONKEY KONG Jr.**
- 215: (H7) **DONKEY KONG Jr.**

#### I0-I7 - ISLAND MAN (Codes 216-223)
- 216: (I0) **ISLAND MAN**
- 217: (I1) **ISLAND MAN**
- 218: (I2) **ISLAND MAN**
- 219: (I3) **ISLAND MAN**
- 220: (I4) **ISLAND MAN**
- 221: (I5) **ISLAND MAN**
- 222: (I6) **ISLAND MAN**
- 223: (I7) **ISLAND MAN**

#### J0-J7 - MAZE (Codes 224-231)
- 224: (J0) **MAZE**
- 225: (J1) **MAZE**
- 226: (J2) **MAZE**
- 227: (J3) **MAZE**
- 228: (J4) **MAZE**
- 229: (J5) **MAZE**
- 230: (J6) **MAZE**
- 231: (J7) **MAZE**

#### K0-K7 - RULER FOR GRAPH (Codes 232-239)
- 232: (K0) **RULER FOR GRAPH**
- 233: (K1) **RULER FOR GRAPH**
- 234: (K2) **RULER FOR GRAPH**
- 235: (K3) **RULER FOR GRAPH**
- 236: (K4) **RULER FOR GRAPH**
- 237: (K5) **RULER FOR GRAPH**
- 238: (K6) **RULER FOR GRAPH**
- 239: (K7) **RULER FOR GRAPH**

#### L0-L7 - BOARD FRAME (Codes 240-247)
- 240: (L0) **BOARD FRAME**
- 241: (L1) **BOARD FRAME**
- 242: (L2) **BOARD FRAME**
- 243: (L3) **BOARD FRAME**
- 244: (L4) **BOARD FRAME**
- 245: (L5) **BOARD FRAME**
- 246: (L6) **BOARD FRAME**
- 247: (L7) **BOARD FRAME**

#### M0-M7 - INKPOT PAINT (Codes 248-255)
- 248: (M0) **INKPOT PAINT**
- 249: (M1) **INKPOT PAINT**
- 250: (M2) **INKPOT PAINT**
- 251: (M3) **INKPOT PAINT**
- 252: (M4) **INKPOT PAINT**
- 253: (M5)(1) **INKPOT PAINT**
- 254: (M6)(2) **INKPOT PAINT**
- 255: (M7)(3) **INKPOT PAINT**

**Total Missing:** 72 codes (184-255)

---

## Summary

### ✅ Complete Categories
1. **Standard ASCII (32-95)**: ✅ Complete
   - Space, symbols, numbers, letters
   - Total: 64 codes

### ⚠️ Issues to Resolve
1. **Kana Codes (96-183)**: Off-by-one discrepancy
   - Missing: Code 96 (ア)
   - All kana codes shifted by +1
   - Code 176 conflict (symbol vs kana)

2. **Code 176 Conflict**: 
   - Appears in both SYMBOL_BG_ITEMS (□) and KANA_BG_ITEMS (ポ)
   - Need to verify which is correct per manual

### ❌ Missing Categories
1. **Special Graphics (184-255)**: Not implemented
   - Total: 72 missing codes
   - Includes: E0-E7, MARIO (F0-F7), LANDSCAPE (G0-G7), DONKEY KONG Jr. (H0-H7), ISLAND MAN (I0-I7), MAZE (J0-J7), RULER FOR GRAPH (K0-K7), BOARD FRAME (L0-L7), INKPOT PAINT (M0-M7)

---

## Missing Background Item Codes

### Critical Missing (for standard background rendering):
- **Code 96**: ア (if kana offset is incorrect)

### Missing Special Graphics (184-255):
**Total: 72 codes**

**By Category:**
- E0-E7: 8 codes (184-191)
- MARIO (F0-F7): 8 codes (192-199)
- LANDSCAPE (G0-G7): 8 codes (200-207)
- DONKEY KONG Jr. (H0-H7): 8 codes (208-215)
- ISLAND MAN (I0-I7): 8 codes (216-223)
- MAZE (J0-J7): 8 codes (224-231)
- RULER FOR GRAPH (K0-K7): 8 codes (232-239)
- BOARD FRAME (L0-L7): 8 codes (240-247)
- INKPOT PAINT (M0-M7): 8 codes (248-255)

---

## Recommendations

### Priority 1: Fix Kana Offset
1. Verify if code 96 should be ア
2. Either add code 96 OR adjust all kana codes to match manual
3. Resolve code 176 conflict

### Priority 2: Add Special Graphics (if needed)
1. Determine if special graphics (184-255) are needed for background rendering
2. These may be game-specific and not essential for basic PRINT functionality
3. If needed, extract tile data from character table images

### Priority 3: Verification
1. Cross-reference with actual Family Basic character table images
2. Verify code mappings match actual system behavior
3. Test with sample programs from manual

---

## Notes

1. **System Codes (0-31)**: Intentionally excluded - these are system codes that cannot be used directly for background.

2. **Special Graphics**: These may be optional depending on use case. For basic PRINT functionality, standard ASCII and Kana may be sufficient.

3. **Code Conflicts**: Code 176 appears in both symbol and kana arrays - this needs resolution.

4. **Kana Offset**: The off-by-one discrepancy suggests either:
   - A bug in our implementation
   - A difference in how the manual numbers codes vs actual system
   - An intentional offset for some reason

5. **Character Table Reference**: The manual references "character table B" on page 113 - this may provide visual reference for verification.
