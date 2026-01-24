/**
 * F-BASIC Parser Tokens
 * 
 * Token definitions and lexer setup for F-BASIC language parser.
 * Separated from parser class for better code organization.
 */

import {
  createToken,
  Lexer
} from 'chevrotain';

// ============================================================================
// TOKEN DEFINITIONS
// ============================================================================

// Keywords (must be before Identifier)
export const Let = createToken({ name: 'Let', pattern: /\bLET\b/i });
export const Print = createToken({ name: 'Print', pattern: /\bPRINT\b/i });
export const For = createToken({ name: 'For', pattern: /\bFOR\b/i });
export const To = createToken({ name: 'To', pattern: /\bTO\b/i });
export const Step = createToken({ name: 'Step', pattern: /\bSTEP\b/i });
export const Next = createToken({ name: 'Next', pattern: /\bNEXT\b/i });
export const End = createToken({ name: 'End', pattern: /\bEND\b/i });
export const Rem = createToken({ name: 'Rem', pattern: /\bREM\b/i });
export const Pause = createToken({ name: 'Pause', pattern: /\bPAUSE\b/i });
export const If = createToken({ name: 'If', pattern: /\bIF\b/i });
export const Then = createToken({ name: 'Then', pattern: /\bTHEN\b/i });
export const Goto = createToken({ name: 'Goto', pattern: /\bGOTO\b/i });
export const Gosub = createToken({ name: 'Gosub', pattern: /\bGOSUB\b/i });
export const Return = createToken({ name: 'Return', pattern: /\bRETURN\b/i });
export const On = createToken({ name: 'On', pattern: /\bON\b/i });
export const Dim = createToken({ name: 'Dim', pattern: /\bDIM\b/i });
export const Data = createToken({ name: 'Data', pattern: /\bDATA\b/i });
export const Read = createToken({ name: 'Read', pattern: /\bREAD\b/i });
export const Restore = createToken({ name: 'Restore', pattern: /\bRESTORE\b/i });
export const Cls = createToken({ name: 'Cls', pattern: /\bCLS\b/i });
export const Locate = createToken({ name: 'Locate', pattern: /\bLOCATE\b/i });
export const Color = createToken({ name: 'Color', pattern: /\bCOLOR\b/i });
export const Cgset = createToken({ name: 'Cgset', pattern: /\bCGSET\b/i });
export const Cgen = createToken({ name: 'Cgen', pattern: /\bCGEN\b/i });

// String function keywords (must be before Identifier)
export const Len = createToken({ name: 'Len', pattern: /\bLEN\b/i });
export const Left = createToken({ name: 'Left', pattern: /\bLEFT\$/i });
export const Right = createToken({ name: 'Right', pattern: /\bRIGHT\$/i });
export const Mid = createToken({ name: 'Mid', pattern: /\bMID\$/i });
export const Str = createToken({ name: 'Str', pattern: /\bSTR\$/i });
export const Hex = createToken({ name: 'Hex', pattern: /\bHEX\$/i });
export const Chr = createToken({ name: 'Chr', pattern: /\bCHR\$/i });
export const Asc = createToken({ name: 'Asc', pattern: /\bASC\b/i });

// Arithmetic function keywords (must be before Identifier)
// Family BASIC only supports: ABS, SGN, RND
export const Abs = createToken({ name: 'Abs', pattern: /\bABS\b/i });
export const Sgn = createToken({ name: 'Sgn', pattern: /\bSGN\b/i });
export const Rnd = createToken({ name: 'Rnd', pattern: /\bRND\b/i });
export const Val = createToken({ name: 'Val', pattern: /\bVAL\b/i });

// Controller input function keywords (must be before Identifier)
export const Stick = createToken({ name: 'Stick', pattern: /\bSTICK\b/i });
export const Strig = createToken({ name: 'Strig', pattern: /\bSTRIG\b/i });

// Logical operators (must be before Identifier)
export const And = createToken({ name: 'And', pattern: /\bAND\b/i });
export const Or = createToken({ name: 'Or', pattern: /\bOR\b/i });
export const Xor = createToken({ name: 'Xor', pattern: /\bXOR\b/i });
export const Not = createToken({ name: 'Not', pattern: /\bNOT\b/i });

// Comparison operators (must come before Equal to avoid ambiguity)
export const GreaterThan = createToken({ name: 'GreaterThan', pattern: />/ });
export const LessThan = createToken({ name: 'LessThan', pattern: /</ });
export const NotEqual = createToken({ name: 'NotEqual', pattern: /<>/ });
export const GreaterThanOrEqual = createToken({ name: 'GreaterThanOrEqual', pattern: />=/ });
export const LessThanOrEqual = createToken({ name: 'LessThanOrEqual', pattern: /<=/ });

// Operators
export const Equal = createToken({ name: 'Equal', pattern: /=/ });
export const Plus = createToken({ name: 'Plus', pattern: /\+/ });
export const Minus = createToken({ name: 'Minus', pattern: /-/ });
export const Multiply = createToken({ name: 'Multiply', pattern: /\*/ });
export const Divide = createToken({ name: 'Divide', pattern: /\// });
export const Mod = createToken({ name: 'Mod', pattern: /\bMOD\b/i });

// Punctuation
export const Comma = createToken({ name: 'Comma', pattern: /,/ });
export const Semicolon = createToken({ name: 'Semicolon', pattern: /;/ });
export const Colon = createToken({ name: 'Colon', pattern: /:/ });
export const LParen = createToken({ name: 'LParen', pattern: /\(/ });
export const RParen = createToken({ name: 'RParen', pattern: /\)/ });

// Additional punctuation and special characters for REM statements
// These are only used in REM comments, so they have lower priority
export const Period = createToken({ name: 'Period', pattern: /\./ });
export const Hash = createToken({ name: 'Hash', pattern: /#/ });
export const Dollar = createToken({ name: 'Dollar', pattern: /\$/ });
export const LBracket = createToken({ name: 'LBracket', pattern: /\[/ });
export const RBracket = createToken({ name: 'RBracket', pattern: /\]/ });
export const Exclamation = createToken({ name: 'Exclamation', pattern: /!/ });
export const Question = createToken({ name: 'Question', pattern: /\?/ });
export const AtSign = createToken({ name: 'AtSign', pattern: /@/ });
export const Percent = createToken({ name: 'Percent', pattern: /%/ });
export const LBrace = createToken({ name: 'LBrace', pattern: /\{/ });
export const RBrace = createToken({ name: 'RBrace', pattern: /\}/ });
export const Pipe = createToken({ name: 'Pipe', pattern: /\|/ });
export const Tilde = createToken({ name: 'Tilde', pattern: /~/ });
export const Underscore = createToken({ name: 'Underscore', pattern: /_/ });
export const Backslash = createToken({ name: 'Backslash', pattern: /\\/ });
export const Apostrophe = createToken({ name: 'Apostrophe', pattern: /'/ });

// Literals
export const StringLiteral = createToken({
  name: 'StringLiteral',
  pattern: /"[^"]*"/
});

// NumberLiteral - only integers allowed (no decimal point, no scientific notation)
// Family Basic only supports integer numerical variables
export const NumberLiteral = createToken({
  name: 'NumberLiteral',
  pattern: /\d+/
});

// Identifier (must come after keywords)
export const Identifier = createToken({
  name: 'Identifier',
  pattern: /[A-Za-z][A-Za-z0-9$]*/
});

// Whitespace (skipped)
export const Whitespace = createToken({
  name: 'Whitespace',
  pattern: /\s+/,
  group: Lexer.SKIPPED
});

// All tokens in order (more specific patterns first)
export const allTokens = [
  Whitespace,
  // Keywords
  Let, Print, For, To, Step, Next, End, Rem, Pause, If, Then, Goto, Gosub, Return, On, Dim, Data, Read, Restore, Cls, Locate, Color, Cgset, Cgen,
  // String functions (must come before Identifier)
  Len, Left, Right, Mid, Str, Hex, Chr, Asc,
  // Arithmetic functions (must come before Identifier)
  // Family BASIC only supports: ABS, SGN, RND, VAL
  Abs, Sgn, Rnd, Val,
  // Controller input function keywords (must come before Identifier)
  Stick, Strig,
  // Logical operators (must come before Identifier)
  And, Or, Xor, Not,
  // Comparison operators (must come before Equal to avoid ambiguity)
  GreaterThanOrEqual, LessThanOrEqual, NotEqual, GreaterThan, LessThan,
  // Operators
  Equal, Plus, Minus, Multiply, Divide, Mod,
  // Punctuation
  Comma, Semicolon, Colon, LParen, RParen,
  // Additional punctuation for REM statements (lower priority, after main punctuation)
  Period, Hash, Dollar, LBracket, RBracket, Exclamation, Question, AtSign, Percent,
  LBrace, RBrace, Pipe, Tilde, Underscore, Backslash, Apostrophe,
  // Literals
  StringLiteral,
  NumberLiteral,
  Identifier
];

// ============================================================================
// LEXER
// ============================================================================

// Create lexer
export const lexer = new Lexer(allTokens, {
  positionTracking: 'full'
});

