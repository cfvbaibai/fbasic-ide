/**
 * F-Basic Parser Configuration
 * 
 * This file configures the Peggy parser generator to build the F-Basic parser
 * from the grammar definition.
 */

import peggy from 'peggy';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Build the F-Basic parser from the grammar file
 */
export function buildParser(): void {
  try {
    console.log('Building F-Basic parser from grammar...');
    
    // Get current directory for ES modules
    const currentDir = dirname(fileURLToPath(import.meta.url));
    console.log('Current directory:', currentDir);
    
    // Read the grammar file
    const grammarPath = join(currentDir, 'fbasic-grammar-minimal.pegjs');
    console.log('Grammar path:', grammarPath);
    
    const grammar = readFileSync(grammarPath, 'utf8');
    console.log('Grammar file size:', grammar.length, 'characters');
    
    // Generate the parser
    console.log('Generating parser...');
    // Define the options with proper typing
    const options = {
      output: 'source' as const,
      format: 'es' as const,
      optimize: 'speed' as const,
      trace: false,
      plugins: [] as never[]
    };
    
    const parserCode = peggy.generate(grammar, options);
    
    // Write the generated parser
    const outputPath = join(currentDir, 'fbasic-parser.js');
    console.log('Writing parser to:', outputPath);
    writeFileSync(outputPath, parserCode.toString());
    
    console.log('F-Basic parser built successfully!');
    console.log(`Output: ${outputPath}`);
  } catch (error) {
    console.error('Error building F-Basic parser:', error);
    throw error;
  }
}

/**
 * Build parser if this file is run directly
 */
buildParser();
