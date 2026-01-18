# Kana Ku (ク) and Ke (ケ) Pixel Data Validation

## Current Pixel Data

### Ku (ク) - Code 103

```
Row 0: [0,1,1,1,1,1,0,0]  ▄▄▄▄▄  
Row 1: [0,0,0,0,0,1,0,0]      ▄  
Row 2: [0,0,0,0,0,1,0,0]      ▄  
Row 3: [1,1,0,0,0,1,0,0]  ▄▄   ▄  
Row 4: [0,0,0,0,0,1,0,0]      ▄  
Row 5: [0,0,0,0,1,1,0,0]     ▄▄  
Row 6: [0,0,1,1,1,0,0,0]   ▄▄▄   
Row 7: [0,0,0,0,0,0,0,0]        
```

Visualization:
```
 ▄▄▄▄▄  
     ▄  
     ▄  
▄▄   ▄  
     ▄  
    ▄▄  
  ▄▄▄   
        
```

### Ke (ケ) - Code 104

```
Row 0: [0,0,0,0,0,0,0,0]        
Row 1: [0,1,1,1,1,1,1,0]  ▄▄▄▄▄▄ 
Row 2: [0,0,0,0,1,0,0,0]     ▄   
Row 3: [1,1,0,0,1,0,0,0]  ▄▄  ▄   
Row 4: [0,0,0,0,1,0,0,0]     ▄   
Row 5: [0,0,0,1,1,0,0,0]    ▄▄   
Row 6: [0,0,1,1,0,0,0,0]   ▄▄    
Row 7: [0,0,0,0,0,0,0,0]        
```

Visualization:
```
        
 ▄▄▄▄▄▄ 
    ▄   
▄▄  ▄   
    ▄   
   ▄▄   
  ▄▄    
        
```

## Issues Identified

### Ke (ケ) - Potential Issues

1. **Empty first row**: Row 0 is completely empty `[0,0,0,0,0,0,0,0]`
   - Most kana characters start from row 0
   - This causes the character to appear shifted down
   - The horizontal stroke starts at row 1 instead of row 0

2. **Top alignment**: The character appears to be missing the top portion

### Ku (ク) - Potential Issues

1. **Row 3 pattern**: Row 3 has `[1,1,0,0,0,1,0,0]` which creates two separate pixel blocks
   - Left side: `[1,1,0,0,0,0,0,0]` (two pixels)
   - Right side: `[0,0,0,0,0,1,0,0]` (one pixel)
   - This might be correct for the curved shape of ク, but needs validation

## Comparison with Similar Kana

### Ka (カ) - Code 101
- Has vertical stroke on left side
- Starts from row 0
- No empty top row

### Ki (キ) - Code 102  
- Has vertical lines
- Starts from row 0
- No empty top row

### Ko (コ) - Code 105
- Box shape
- Starts from row 0
- No empty top row

## Recommendation

**Ke (ケ)** likely needs correction:
- Remove empty row 0 OR
- Shift all rows up by 1 (move row 1→row 0, row 2→row 1, etc., add new row 7)
- Most kana characters start from the top row

**Ku (ク)** needs validation:
- The pattern looks more plausible than Ke
- Row 3's split pattern might be correct for the curved shape
- Need reference to confirm

## Next Steps

1. Check if there's a character table reference image
2. Compare with actual Family Basic system output
3. Validate against known correct kana pixel patterns
4. If no reference available, test by displaying and comparing visually