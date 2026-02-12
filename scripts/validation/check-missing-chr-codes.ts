/**
 * Script to check which CHR$ codes (0-255) are not associated with 8x8 pixel data
 * 
 * Based on:
 * - Family Basic Manual page 83: CHR$(x) accepts values 0-255
 * - Family Basic Manual pages 108-109: Character code list B (background characters)
 * - Current background items implementation in src/shared/data/bg/
 */

import { getBackgroundItemByCode } from '../../src/shared/utils/backgroundLookup'

/**
 * Check all CHR$ codes from 0-255 and identify which ones don't have pixel data
 */
function checkMissingChrCodes(): void {
  const missingCodes: number[] = []
  const presentCodes: number[] = []
  const systemCodes: number[] = [] // 0-31 (cannot be specified directly per manual page 109)
  const specialGraphicsCodes: number[] = [] // 184-255 (not yet implemented)

  // Check all codes 0-255
  for (let code = 0; code <= 255; code++) {
    const bgItem = getBackgroundItemByCode(code)
    
    if (code >= 0 && code <= 31) {
      // System codes (0-31) - cannot be specified directly per manual page 109
      systemCodes.push(code)
    } else if (code >= 184 && code <= 255) {
      // Special graphics codes (184-255) - not yet implemented
      specialGraphicsCodes.push(code)
      if (!bgItem) {
        missingCodes.push(code)
      } else {
        presentCodes.push(code)
      }
    } else {
      // Codes 32-183 should have pixel data for background rendering
      if (!bgItem) {
        missingCodes.push(code)
      } else {
        presentCodes.push(code)
      }
    }
  }

  // Report results
  console.log('='.repeat(80))
  console.log('CHR$ Code Analysis: Missing Pixel Data')
  console.log('='.repeat(80))
  console.log()

  console.log(`Total CHR$ codes (0-255): ${256}`)
  console.log()

  console.log(`System codes (0-31): ${systemCodes.length} codes`)
  console.log('  These codes cannot be specified directly (used by system)')
  console.log('  Per manual page 109: "hexadecimal codes from 00 to 1F may not be specified directly because they are used by the system"')
  console.log(`  Codes: ${systemCodes.join(', ')}`)
  console.log()

  console.log(`Standard background codes (32-183): ${152} codes`)
  console.log(`  Present: ${presentCodes.filter(c => c >= 32 && c <= 183).length} codes`)
  console.log(`  Missing: ${missingCodes.filter(c => c >= 32 && c <= 183).length} codes`)
  
  const standardMissing = missingCodes.filter(c => c >= 32 && c <= 183)
  if (standardMissing.length > 0) {
    console.log(`  Missing codes: ${standardMissing.join(', ')}`)
  }
  console.log()

  console.log(`Special graphics codes (184-255): ${72} codes`)
  console.log(`  Present: ${presentCodes.filter(c => c >= 184 && c <= 255).length} codes`)
  console.log(`  Missing: ${missingCodes.filter(c => c >= 184 && c <= 255).length} codes`)
  
  const specialMissing = missingCodes.filter(c => c >= 184 && c <= 255)
  if (specialMissing.length > 0 && specialMissing.length <= 72) {
    console.log(`  Missing codes: ${specialMissing.join(', ')}`)
  } else if (specialMissing.length === 72) {
    console.log(`  All special graphics codes are missing (not yet implemented)`)
  }
  console.log()

  console.log('='.repeat(80))
  console.log('SUMMARY: CHR$ codes without 8x8 pixel data')
  console.log('='.repeat(80))
  console.log()

  // Focus on codes that SHOULD have pixel data but don't (32-183)
  const criticalMissing = missingCodes.filter(c => c >= 32 && c <= 183)
  
  if (criticalMissing.length === 0) {
    console.log('✅ All standard background codes (32-183) have pixel data!')
  } else {
    console.log(`⚠️  Missing pixel data for ${criticalMissing.length} standard background code(s):`)
    console.log(`   Codes: ${criticalMissing.join(', ')}`)
    console.log()
    console.log('   Note: These codes should have pixel data per Character Code List B (pages 108-109)')
  }

  console.log()
  console.log(`System codes (0-31): ${systemCodes.length} codes - intentionally excluded (cannot be specified directly)`)
  console.log(`Special graphics (184-255): ${specialMissing.length} codes - not yet implemented`)
  console.log()

  // Detailed breakdown if there are critical missing codes
  if (criticalMissing.length > 0) {
    console.log('='.repeat(80))
    console.log('DETAILED BREAKDOWN OF MISSING CODES')
    console.log('='.repeat(80))
    console.log()
    
    // Group by ranges
    const ranges: { [key: string]: number[] } = {}
    
    criticalMissing.forEach(code => {
      let range = ''
      if (code >= 32 && code <= 47) {
        range = 'Symbols (32-47)'
      } else if (code >= 48 && code <= 57) {
        range = 'Numbers (48-57)'
      } else if (code >= 58 && code <= 64) {
        range = 'Symbols (58-64)'
      } else if (code >= 65 && code <= 90) {
        range = 'Letters (65-90)'
      } else if (code >= 91 && code <= 95) {
        range = 'Symbols (91-95)'
      } else if (code >= 96 && code <= 183) {
        range = 'Kana/Symbols (96-183)'
      } else {
        range = 'Other'
      }
      
      if (!ranges[range]) {
        ranges[range] = []
      }
      ranges[range].push(code)
    })
    
    Object.keys(ranges).forEach(range => {
      console.log(`${range}:`)
      console.log(`  Missing codes: ${ranges[range].join(', ')}`)
      console.log()
    })
  }
}

// Run the check
checkMissingChrCodes()