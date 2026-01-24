/**
 * F-BASIC Chevrotain Parser
 * 
 * Complete Chevrotain-based parser implementation for F-BASIC language.
 * This replaces the Peggy.js parser with a TypeScript-native solution.
 * 
 * Uses line-by-line parsing approach: split code by line breaks,
 * parse each line independently, then combine results.
 * 
 * Note: Parsing is line-based (BASIC syntax requires line numbers),
 * but execution is statement-based (statements are expanded into a flat list).
 */

import {
  CstParser
} from 'chevrotain';
import type {
  CstNode,
  ILexingError,
  IRecognitionException
} from 'chevrotain';
import {
  // Keywords
  Let, Print, For, To, Step, Next, End, Pause, If, Then, Goto, Gosub, Return, On, Dim, Data, Read, Restore, Cls, Locate, Color, Cgset, Cgen, Palet, Paletb, Palets,
  // String functions
  Len, Left, Right, Mid, Str, Hex, Chr, Asc,
  // Arithmetic functions
  Abs, Sgn, Rnd, Val,
  // Controller input functions
  Stick, Strig,
  // Logical operators
  And, Or, Xor, Not,
  // Comparison operators
  GreaterThan, LessThan, NotEqual, GreaterThanOrEqual, LessThanOrEqual,
  // Operators
  Equal, Plus, Minus, Multiply, Divide, Mod,
  // Punctuation
  Comma, Semicolon, Colon, LParen, RParen,
  // Literals
  StringLiteral, NumberLiteral, Identifier,
  // Lexer
  lexer,
  allTokens
} from './parser-tokens';

// ============================================================================
// PARSER CLASS
// ============================================================================

class FBasicChevrotainParser extends CstParser {
  // Declare rule methods for TypeScript
  declare primary: () => CstNode;
  declare unary: () => CstNode;
  declare multiplicative: () => CstNode;
  declare modExpression: () => CstNode;
  declare additive: () => CstNode;
  declare expression: () => CstNode;
  declare printItem: () => CstNode;
  declare printList: () => CstNode;
  declare printStatement: () => CstNode;
  declare letStatement: () => CstNode;
  declare forStatement: () => CstNode;
  declare nextStatement: () => CstNode;
  declare endStatement: () => CstNode;
  declare pauseStatement: () => CstNode;
  declare comparisonExpression: () => CstNode;
  declare logicalNotExpression: () => CstNode;
  declare logicalAndExpression: () => CstNode;
  declare logicalOrExpression: () => CstNode;
  declare logicalExpression: () => CstNode;
  declare ifThenStatement: () => CstNode;
  declare gotoStatement: () => CstNode;
  declare gosubStatement: () => CstNode;
  declare returnStatement: () => CstNode;
  declare onStatement: () => CstNode;
  declare lineNumberList: () => CstNode;
  declare dimStatement: () => CstNode;
  declare dataStatement: () => CstNode;
  declare readStatement: () => CstNode;
  declare restoreStatement: () => CstNode;
  declare clsStatement: () => CstNode;
  declare locateStatement: () => CstNode;
  declare colorStatement: () => CstNode;
  declare cgsetStatement: () => CstNode;
  declare cgenStatement: () => CstNode;
  declare paletStatement: () => CstNode;
  declare paletParameterList: () => CstNode;
  declare arrayDeclaration: () => CstNode;
  declare dimensionList: () => CstNode;
  declare expressionList: () => CstNode;
  declare dataConstant: () => CstNode;
  declare dataConstantList: () => CstNode;
  declare functionCall: () => CstNode;
  declare arrayAccess: () => CstNode;
  declare singleCommand: () => CstNode;
  declare command: () => CstNode;
  declare commandList: () => CstNode;
  declare statement: () => CstNode;

  constructor() {
    super(allTokens, {
      recoveryEnabled: true
    });

    // Define rules in dependency order (bottom-up)
    
    // ExpressionList = Expression (Comma Expression)*
    this.expressionList = this.RULE('expressionList', () => {
      this.SUBRULE(this.expression);
      this.MANY(() => {
        this.CONSUME(Comma);
        this.SUBRULE2(this.expression);
      });
    });

    // FunctionCall = (StringFunction | ArithmeticFunction) LParen ExpressionList? RParen
    // Family BASIC arithmetic functions: ABS, SGN, RND, VAL
    // String functions: LEN, LEFT$, RIGHT$, MID$, STR$, HEX$, CHR$, ASC
    this.functionCall = this.RULE('functionCall', () => {
      this.OR([
        // String functions
        { ALT: () => this.CONSUME(Len) },
        { ALT: () => this.CONSUME(Left) },
        { ALT: () => this.CONSUME(Right) },
        { ALT: () => this.CONSUME(Mid) },
        { ALT: () => this.CONSUME(Str) },
        { ALT: () => this.CONSUME(Hex) },
        { ALT: () => this.CONSUME(Chr) },
        { ALT: () => this.CONSUME(Asc) },
        // Arithmetic functions (Family BASIC only supports these)
        { ALT: () => this.CONSUME(Abs) },
        { ALT: () => this.CONSUME(Sgn) },
        { ALT: () => this.CONSUME(Rnd) },
        { ALT: () => this.CONSUME(Val) },
        // Controller input functions
        { ALT: () => this.CONSUME(Stick) },
        { ALT: () => this.CONSUME(Strig) }
      ]);
      this.CONSUME(LParen);
      this.OPTION(() => {
        this.SUBRULE(this.expressionList);
      });
      this.CONSUME(RParen);
    });

    // ArrayAccess = Identifier LParen ExpressionList RParen
    // Handles array element access like A(I) or A$(I, J)
    this.arrayAccess = this.RULE('arrayAccess', () => {
      this.CONSUME(Identifier);
      this.CONSUME(LParen);
      this.SUBRULE(this.expressionList);
      this.CONSUME(RParen);
    });

    // Primary = NumberLiteral | StringLiteral | ArrayAccess | FunctionCall | Identifier | (LParen Expression RParen)
    this.primary = this.RULE('primary', () => {
      this.OR([
        {
          GATE: () => this.LA(1).tokenType === StringLiteral,
          ALT: () => this.CONSUME(StringLiteral)
        },
        { ALT: () => this.CONSUME(NumberLiteral) },
        {
          // Function call: String functions and arithmetic functions
          // Family BASIC arithmetic functions: ABS, SGN, RND, VAL
          // String functions: LEN, LEFT$, RIGHT$, MID$, STR$, HEX$, CHR$, ASC
          GATE: () => 
            this.LA(1).tokenType === Len ||
            this.LA(1).tokenType === Left ||
            this.LA(1).tokenType === Right ||
            this.LA(1).tokenType === Mid ||
            this.LA(1).tokenType === Str ||
            this.LA(1).tokenType === Hex ||
            this.LA(1).tokenType === Chr ||
            this.LA(1).tokenType === Asc ||
            this.LA(1).tokenType === Abs ||
            this.LA(1).tokenType === Sgn ||
            this.LA(1).tokenType === Rnd ||
            this.LA(1).tokenType === Val ||
            this.LA(1).tokenType === Stick ||
            this.LA(1).tokenType === Strig,
          ALT: () => this.SUBRULE(this.functionCall)
        },
        {
          // Array access: Identifier LParen ExpressionList RParen
          // Must check before plain Identifier to avoid ambiguity
          GATE: () => 
            this.LA(1).tokenType === Identifier && 
            this.LA(2).tokenType === LParen,
          ALT: () => this.SUBRULE(this.arrayAccess)
        },
        { ALT: () => this.CONSUME(Identifier) },
        {
          ALT: () => {
            this.CONSUME(LParen);
            this.SUBRULE(this.expression);
            this.CONSUME(RParen);
          }
        }
      ]);
    });

    // Unary = (Plus | Minus)? Primary
    // Handles unary plus and minus operators (e.g., -5, +10, -X)
    this.unary = this.RULE('unary', () => {
      this.OPTION(() => {
        this.OR([
          { ALT: () => this.CONSUME(Plus) },
          { ALT: () => this.CONSUME(Minus) }
        ]);
      });
      this.SUBRULE(this.primary);
    });

    // Multiplicative = Unary ((Multiply | Divide) Unary)*
    // Priority 1: *, /
    this.multiplicative = this.RULE('multiplicative', () => {
      this.SUBRULE(this.unary);
      this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(Multiply) },
          { ALT: () => this.CONSUME(Divide) }
        ]);
        this.SUBRULE2(this.unary);
      });
    });

    // ModExpression = Multiplicative ((MOD) Multiplicative)*
    // Priority 2: MOD (after *, / but before +, -)
    this.modExpression = this.RULE('modExpression', () => {
      this.SUBRULE(this.multiplicative);
      this.MANY(() => {
        this.CONSUME(Mod);
        this.SUBRULE2(this.multiplicative);
      });
    });

    // Additive = ModExpression ((Plus | Minus) ModExpression)*
    // Priority 3: +, -
    this.additive = this.RULE('additive', () => {
      this.SUBRULE(this.modExpression);
      this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(Plus) },
          { ALT: () => this.CONSUME(Minus) }
        ]);
        this.SUBRULE2(this.modExpression);
      });
    });

    // Expression = Additive (for now, simplified)
    this.expression = this.RULE('expression', () => {
      this.SUBRULE(this.additive);
    });

    // ComparisonExpression = Expression (ComparisonOperator Expression)?
    // Supports: =, <>, <, >, <=, >=
    // In BASIC, a single expression can be used as a condition (non-zero = true, zero = false)
    // Or two expressions can be compared
    this.comparisonExpression = this.RULE('comparisonExpression', () => {
      this.SUBRULE(this.expression);
      this.OPTION(() => {
        this.OR([
          { ALT: () => this.CONSUME(Equal) },
          { ALT: () => this.CONSUME(NotEqual) },
          { ALT: () => this.CONSUME(LessThan) },
          { ALT: () => this.CONSUME(GreaterThan) },
          { ALT: () => this.CONSUME(LessThanOrEqual) },
          { ALT: () => this.CONSUME(GreaterThanOrEqual) }
        ]);
        this.SUBRULE2(this.expression);
      });
    });

    // LogicalNotExpression = (NOT)? ComparisonExpression
    // NOT has highest precedence (applies to ComparisonExpression)
    this.logicalNotExpression = this.RULE('logicalNotExpression', () => {
      this.OPTION(() => {
        this.CONSUME(Not);
      });
      this.SUBRULE(this.comparisonExpression);
    });

    // LogicalAndExpression = LogicalNotExpression (AND LogicalNotExpression)*
    // AND has middle precedence (combines LogicalNotExpressions)
    this.logicalAndExpression = this.RULE('logicalAndExpression', () => {
      this.SUBRULE(this.logicalNotExpression);
      this.MANY(() => {
        this.CONSUME(And);
        this.SUBRULE2(this.logicalNotExpression);
      });
    });

    // LogicalOrExpression = LogicalAndExpression (OR LogicalAndExpression)*
    // OR combines LogicalAndExpressions
    this.logicalOrExpression = this.RULE('logicalOrExpression', () => {
      this.SUBRULE(this.logicalAndExpression);
      this.MANY(() => {
        this.CONSUME(Or);
        this.SUBRULE2(this.logicalAndExpression);
      });
    });

    // LogicalExpression = LogicalOrExpression (XOR LogicalOrExpression)*
    // XOR has lowest precedence (combines LogicalOrExpressions)
    // This ensures correct precedence: NOT > AND > OR > XOR
    this.logicalExpression = this.RULE('logicalExpression', () => {
      this.SUBRULE(this.logicalOrExpression);
      this.MANY(() => {
        this.CONSUME(Xor);
        this.SUBRULE2(this.logicalOrExpression);
      });
    });

    // PrintItem = Expression | StringLiteral
    this.printItem = this.RULE('printItem', () => {
      this.OR([
        {
          GATE: () => this.LA(1).tokenType === StringLiteral,
          ALT: () => this.CONSUME(StringLiteral)
        },
        { ALT: () => this.SUBRULE(this.expression) }
      ]);
    });

    // PrintList = PrintItem (Comma|Semicolon PrintItem?)*
    // Allows trailing comma or semicolon (e.g., PRINT X; or PRINT A, B,)
    // Trailing separator is consumed but PrintItem is optional
    this.printList = this.RULE('printList', () => {
      this.SUBRULE(this.printItem);
      this.MANY(() => {
        this.OR([
          { ALT: () => this.CONSUME(Comma) },
          { ALT: () => this.CONSUME(Semicolon) }
        ]);
        // PrintItem is optional - allows trailing separator
        this.OPTION(() => {
          this.SUBRULE2(this.printItem);
        });
      });
    });

    // PRINT PrintList?
    this.printStatement = this.RULE('printStatement', () => {
      this.CONSUME(Print);
      this.OPTION(() => {
        this.SUBRULE(this.printList);
      });
    });

    // LET? Identifier = Expression
    // LET (Identifier | ArrayAccess) = Expression
    // Supports both simple variable assignment and array element assignment
    // Examples: LET X = 5, LET A(0) = 10, LET A$(I, J) = "Hello"
    this.letStatement = this.RULE('letStatement', () => {
      this.OPTION(() => {
        this.CONSUME(Let);
      });
      // Variable or array element (must check ArrayAccess before Identifier)
      this.OR([
        {
          // Array access: Identifier LParen ExpressionList RParen
          GATE: () => 
            this.LA(1).tokenType === Identifier && 
            this.LA(2).tokenType === LParen,
          ALT: () => this.SUBRULE(this.arrayAccess)
        },
        { ALT: () => this.CONSUME(Identifier) }
      ]);
      this.CONSUME(Equal);
      this.SUBRULE(this.expression);
    });

    // FOR Identifier = Expression TO Expression (STEP Expression)?
    this.forStatement = this.RULE('forStatement', () => {
      this.CONSUME(For);
      this.CONSUME(Identifier); // Loop variable
      this.CONSUME(Equal);
      this.SUBRULE(this.expression); // Start value
      this.CONSUME(To);
      this.SUBRULE2(this.expression); // End value
      this.OPTION(() => {
        this.CONSUME(Step);
        this.SUBRULE3(this.expression); // Step value (defaults to 1)
      });
    });

    // NEXT (no variable name allowed - Family BASIC spec)
    // According to spec: "You can not add a loop variable name after NEXT. (An error will occur)"
    this.nextStatement = this.RULE('nextStatement', () => {
      this.CONSUME(Next);
      // No identifier allowed - NEXT must be standalone
    });

    // END
    this.endStatement = this.RULE('endStatement', () => {
      this.CONSUME(End);
    });

    // PAUSE Expression
    // Pauses program execution for the specified number of milliseconds/frames
    this.pauseStatement = this.RULE('pauseStatement', () => {
      this.CONSUME(Pause);
      this.SUBRULE(this.expression);
    });

    // GOTO NumberLiteral
    // Jumps unconditionally to the specified line number
    this.gotoStatement = this.RULE('gotoStatement', () => {
      this.CONSUME(Goto);
      this.CONSUME(NumberLiteral); // Line number to jump to
    });

    // GOSUB NumberLiteral
    // Calls a subroutine at the specified line number
    // Example: GOSUB 1000
    this.gosubStatement = this.RULE('gosubStatement', () => {
      this.CONSUME(Gosub);
      this.CONSUME(NumberLiteral);
    });

    // RETURN (NumberLiteral)?
    // Returns from a subroutine
    // Example: RETURN or RETURN 100
    this.returnStatement = this.RULE('returnStatement', () => {
      this.CONSUME(Return);
      this.OPTION(() => {
        this.CONSUME(NumberLiteral); // Optional line number
      });
    });

    // LineNumberList = NumberLiteral (Comma NumberLiteral)*
    // List of line numbers for ON statement
    // Example: 100, 200, 300
    this.lineNumberList = this.RULE('lineNumberList', () => {
      this.CONSUME(NumberLiteral);
      this.MANY(() => {
        this.CONSUME(Comma);
        this.CONSUME2(NumberLiteral);
      });
    });

    // ON Expression {GOTO | GOSUB | RETURN | RESTORE} LineNumberList
    // Jumps to line number based on expression value (1 = first, 2 = second, etc.)
    // If value is 0 or exceeds list length, proceeds to next line
    // Example: ON X GOTO 100, 200, 300
    // Example: ON N GOSUB 100, 200, 300, 400, 500, 600
    // Example: ON X RETURN 100, 200, 300
    // Example: ON X RESTORE 100, 200, 300
    this.onStatement = this.RULE('onStatement', () => {
      this.CONSUME(On);
      this.SUBRULE(this.expression);
      // GOTO, GOSUB, RETURN, or RESTORE
      this.OR([
        {
          ALT: () => {
            this.CONSUME(Goto);
            this.SUBRULE(this.lineNumberList);
          }
        },
        {
          ALT: () => {
            this.CONSUME(Gosub);
            this.SUBRULE2(this.lineNumberList);
          }
        },
        {
          ALT: () => {
            this.CONSUME(Return);
            this.SUBRULE3(this.lineNumberList);
          }
        },
        {
          ALT: () => {
            this.CONSUME(Restore);
            this.SUBRULE4(this.lineNumberList);
          }
        }
      ]);
    });

    // DimensionList = Expression (Comma Expression)?
    // For 1D array: (m1)
    // For 2D array: (m1, m2)
    this.dimensionList = this.RULE('dimensionList', () => {
      this.SUBRULE(this.expression); // First dimension
      this.OPTION(() => {
        this.CONSUME(Comma);
        this.SUBRULE2(this.expression); // Second dimension (optional)
      });
    });

    // ArrayDeclaration = Identifier LParen DimensionList RParen
    // Examples: A(3), B(3,3), A$(3), B$(3,3)
    this.arrayDeclaration = this.RULE('arrayDeclaration', () => {
      this.CONSUME(Identifier); // Array name (can include $ for string arrays)
      this.CONSUME(LParen);
      this.SUBRULE(this.dimensionList);
      this.CONSUME(RParen);
    });

    // DIM ArrayDeclaration (Comma ArrayDeclaration)*
    // Declares one or more arrays
    // Example: DIM A(3), B(3,3), A$(3), B$(3,3)
    this.dimStatement = this.RULE('dimStatement', () => {
      this.CONSUME(Dim);
      this.SUBRULE(this.arrayDeclaration);
      this.MANY(() => {
        this.CONSUME(Comma);
        this.SUBRULE2(this.arrayDeclaration);
      });
    });

    // DataConstant = NumberLiteral | StringLiteral | Identifier
    // DATA statements only accept constants (not expressions/variables)
    // Identifiers in DATA are treated as string constants (unquoted strings)
    // Example: DATA 10, GOOD, "Hello, World"
    this.dataConstant = this.RULE('dataConstant', () => {
      this.OR([
        { ALT: () => this.CONSUME(NumberLiteral) },
        {
          GATE: () => this.LA(1).tokenType === StringLiteral,
          ALT: () => this.CONSUME(StringLiteral)
        },
        { ALT: () => this.CONSUME(Identifier) } // Unquoted string constant
      ]);
    });

    // DataConstantList = DataConstant (Comma DataConstant)*
    // List of constants for DATA statement (optional - empty DATA is allowed)
    this.dataConstantList = this.RULE('dataConstantList', () => {
      this.OPTION(() => {
        this.SUBRULE(this.dataConstant);
        this.MANY(() => {
          this.CONSUME(Comma);
          this.SUBRULE2(this.dataConstant);
        });
      });
    });

    // DATA DataConstantList
    // Stores data values that can be read by READ
    // Only accepts constants: NumberLiteral, StringLiteral (quoted), Identifier (unquoted string)
    // Example: DATA 10, 20, GOOD, MORNING, "Hello, World"
    // Empty DATA statement is allowed: DATA
    this.dataStatement = this.RULE('dataStatement', () => {
      this.CONSUME(Data);
      this.SUBRULE(this.dataConstantList);
    });

    // READ (Identifier | ArrayAccess) (Comma (Identifier | ArrayAccess))*
    // Reads data values from DATA statements into variables or array elements
    // Example: READ A, B, C$, D$, A(I), B$(I, J)
    this.readStatement = this.RULE('readStatement', () => {
      this.CONSUME(Read);
      // First variable: Identifier or ArrayAccess
      this.OR([
        {
          // Array access: Identifier LParen ExpressionList RParen
          GATE: () => 
            this.LA(1).tokenType === Identifier && 
            this.LA(2).tokenType === LParen,
          ALT: () => this.SUBRULE(this.arrayAccess)
        },
        { ALT: () => this.CONSUME(Identifier) }
      ]);
      // Additional variables
      this.MANY(() => {
        this.CONSUME(Comma);
        this.OR2([
          {
            // Array access: Identifier LParen ExpressionList RParen
            GATE: () => 
              this.LA(1).tokenType === Identifier && 
              this.LA(2).tokenType === LParen,
            ALT: () => this.SUBRULE2(this.arrayAccess)
          },
          { ALT: () => this.CONSUME2(Identifier) }
        ]);
      });
    });

    // RESTORE (NumberLiteral)?
    // Restores data pointer to beginning or specific line
    // Example: RESTORE or RESTORE 100
    this.restoreStatement = this.RULE('restoreStatement', () => {
      this.CONSUME(Restore);
      this.OPTION(() => {
        this.CONSUME(NumberLiteral); // Optional line number
      });
    });

    // CLS
    // Clears the background screen
    // Example: CLS
    this.clsStatement = this.RULE('clsStatement', () => {
      this.CONSUME(Cls);
    });

    // LOCATE
    // Moves cursor to specified position
    // Example: LOCATE X, Y
    // X: Horizontal column (0 to 27)
    // Y: Vertical line (0 to 23)
    this.locateStatement = this.RULE('locateStatement', () => {
      this.CONSUME(Locate);
      this.SUBRULE(this.expression); // X coordinate
      this.CONSUME(Comma);
      this.SUBRULE2(this.expression); // Y coordinate
    });

    // COLOR X, Y, n
    // Sets color pattern for a 2×2 character area containing position (X, Y)
    this.colorStatement = this.RULE('colorStatement', () => {
      this.CONSUME(Color);
      this.SUBRULE(this.expression); // X coordinate
      this.CONSUME(Comma);
      this.SUBRULE2(this.expression); // Y coordinate
      this.CONSUME2(Comma);
      this.SUBRULE3(this.expression); // Color pattern number (0-3)
    });

    // CGSET [m][,n]
    // Sets color palette for background (m: 0-1) and sprites (n: 0-2)
    // Both parameters are optional (default: m=1, n=1)
    this.cgsetStatement = this.RULE('cgsetStatement', () => {
      this.CONSUME(Cgset);
      // First parameter (m) is optional
      this.OPTION(() => {
        this.SUBRULE(this.expression); // Background palette code (0-1)
        // Second parameter (n) is optional if first is present
        this.OPTION2(() => {
          this.CONSUME(Comma);
          this.SUBRULE2(this.expression); // Sprite palette code (0-2)
        });
      });
    });

    // CGEN n
    // Sets character generator mode (n: 0-3)
    // 0: A on BG, A on sprite
    // 1: A on BG, B on sprite
    // 2: B on BG, A on sprite (default)
    // 3: B on BG, B on sprite
    this.cgenStatement = this.RULE('cgenStatement', () => {
      this.CONSUME(Cgen);
      this.SUBRULE(this.expression); // Character generator mode (0-3)
    });

    // PALET parameter list: n, C1, C2, C3, C4
    // Common parameter parsing for all PALET forms
    this.paletParameterList = this.RULE('paletParameterList', () => {
      this.SUBRULE(this.expression); // n (color combination number 0-3)
      this.CONSUME(Comma);
      this.SUBRULE2(this.expression); // C1
      this.CONSUME2(Comma);
      this.SUBRULE3(this.expression); // C2
      this.CONSUME3(Comma);
      this.SUBRULE4(this.expression); // C3
      this.CONSUME4(Comma);
      this.SUBRULE5(this.expression); // C4
    });

    // PALET {B|S} n, C1, C2, C3, C4
    // or PALETB n, C1, C2, C3, C4 (for background, no space)
    // or PALETS n, C1, C2, C3, C4 (for sprites, no space)
    // Sets color codes for color combination n (0-3)
    // C1, C2, C3, C4 are color codes (0-60)
    // When n=0 and target is B, C1 is the backdrop color
    this.paletStatement = this.RULE('paletStatement', () => {
      // Handle both forms: PALETB/PALETS (no space) or PALET B/S (with space)
      this.OR([
        {
          // PALETB n, C1, C2, C3, C4 (background, no space)
          ALT: () => {
            this.CONSUME(Paletb);
            this.SUBRULE(this.paletParameterList);
          }
        },
        {
          // PALETS n, C1, C2, C3, C4 (sprites, no space)
          ALT: () => {
            this.CONSUME(Palets);
            this.SUBRULE2(this.paletParameterList);
          }
        },
        {
          // PALET B n, C1, C2, C3, C4 (background, with space)
          ALT: () => {
            this.CONSUME(Palet);
            // B or S identifier (must be uppercase B or S)
            this.CONSUME(Identifier, { LABEL: 'target' }); // B or S
            this.SUBRULE3(this.paletParameterList);
          }
        }
      ]);
    });

    // IF LogicalExpression THEN (CommandList | NumberLiteral)
    // IF LogicalExpression GOTO NumberLiteral
    // Executes the commands after THEN or jumps to line number if condition is true
    // Supports colon-separated statements: IF X THEN PRINT A: PRINT B
    // Supports line number jumps: IF X=10 THEN 500 or IF X=10 GOTO 500
    // Supports logical operators: IF X>0 AND Y<10 THEN 100, IF NOT X=0 THEN PRINT X
    this.ifThenStatement = this.RULE('ifThenStatement', () => {
      this.CONSUME(If);
      this.SUBRULE(this.logicalExpression);
      // THEN or GOTO (GOTO can be used without THEN)
      this.OR([
        {
          // IF ... THEN NumberLiteral (line number jump)
          GATE: () => this.LA(1).tokenType === Then && this.LA(2).tokenType === NumberLiteral,
          ALT: () => {
            this.CONSUME(Then);
            this.CONSUME(NumberLiteral);
          }
        },
        {
          // IF ... THEN CommandList (statements)
          GATE: () => this.LA(1).tokenType === Then,
          ALT: () => {
            this.CONSUME2(Then); // Use CONSUME2 for second occurrence
            this.SUBRULE(this.commandList);
          }
        },
        {
          // IF ... GOTO NumberLiteral (GOTO without THEN)
          ALT: () => {
            this.CONSUME(Goto);
            this.CONSUME2(NumberLiteral); // Use CONSUME2 for second occurrence
          }
        }
      ]);
    });

    // SingleCommand = IfThenStatement | GotoStatement | LetStatement | PrintStatement | ForStatement | NextStatement | EndStatement | PauseStatement
    // Order matters: keyword-based statements (that start with a keyword) should come before letStatement
    // because letStatement can start with just an Identifier (LET is optional)
    // Use GATE conditions to ensure keywords are matched correctly before trying letStatement
    this.singleCommand = this.RULE('singleCommand', () => {
      this.OR([
        {
          GATE: () => this.LA(1).tokenType === If,
          ALT: () => this.SUBRULE(this.ifThenStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === On,
          ALT: () => this.SUBRULE(this.onStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Goto,
          ALT: () => this.SUBRULE(this.gotoStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Gosub,
          ALT: () => this.SUBRULE(this.gosubStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Return,
          ALT: () => this.SUBRULE(this.returnStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Print,
          ALT: () => this.SUBRULE(this.printStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === For,
          ALT: () => this.SUBRULE(this.forStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Next,
          ALT: () => this.SUBRULE(this.nextStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === End,
          ALT: () => this.SUBRULE(this.endStatement)
        },
        // REM statement removed - REM lines are handled at line level before parsing
        // In Family BASIC, REM cannot appear after colons
        {
          GATE: () => this.LA(1).tokenType === Pause,
          ALT: () => this.SUBRULE(this.pauseStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Dim,
          ALT: () => this.SUBRULE(this.dimStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Data,
          ALT: () => this.SUBRULE(this.dataStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Read,
          ALT: () => this.SUBRULE(this.readStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Restore,
          ALT: () => this.SUBRULE(this.restoreStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Cls,
          ALT: () => this.SUBRULE(this.clsStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Locate,
          ALT: () => this.SUBRULE(this.locateStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Color,
          ALT: () => this.SUBRULE(this.colorStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Cgset,
          ALT: () => this.SUBRULE(this.cgsetStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Cgen,
          ALT: () => this.SUBRULE(this.cgenStatement)
        },
        {
          GATE: () => this.LA(1).tokenType === Paletb || this.LA(1).tokenType === Palets || this.LA(1).tokenType === Palet,
          ALT: () => this.SUBRULE(this.paletStatement)
        },
        { ALT: () => this.SUBRULE(this.letStatement) } // Must be last since it can start with Identifier
      ]);
    });

    // Command = SingleCommand
    this.command = this.RULE('command', () => {
      this.SUBRULE(this.singleCommand);
    });

    // CommandList = Command (Colon Command)*
    // Allows multiple commands per line separated by colons
    this.commandList = this.RULE('commandList', () => {
      this.SUBRULE(this.command);
      this.MANY(() => {
        this.CONSUME(Colon);
        this.SUBRULE2(this.command);
      });
    });

    // Statement = LineNumber CommandList
    // LineNumber is a NumberLiteral at the start (acts as a label for GOTO/GOSUB)
    // CommandList may contain multiple commands separated by colons
    this.statement = this.RULE('statement', () => {
      this.CONSUME(NumberLiteral); // Line number (label)
      this.SUBRULE(this.commandList);
    });

    this.performSelfAnalysis();
  }
}

// ============================================================================
// PARSER INSTANCE AND EXPORT
// ============================================================================

// Create parser instance
const parserInstance = new FBasicChevrotainParser();

// Export parse function
export function parseWithChevrotain(source: string): {
  success: boolean;
  cst?: CstNode;
  errors?: Array<{
    message: string;
    line?: number;
    column?: number;
    length?: number;
    location?: { start: { line?: number; column?: number } };
  }>;
} {
  // Split source code by line breaks
  const lines = source.split(/\r?\n/);
  const allErrors: Array<{
    message: string;
    line?: number;
    column?: number;
    length?: number;
    location?: { start: { line?: number; column?: number } };
  }> = [];
  const statements: CstNode[] = [];

  // Parse each line independently
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const line = lines[lineIndex]?.trim();
    if (!line) {
      continue;
    }

    // Check if line is a REM statement (comment line)
    // Format: <lineNumber> REM <comment text>
    // After trimming, check if line starts with a number followed by REM
    const remMatch = line.match(/^\s*(\d+)\s+REM\b/i);
    if (remMatch) {
      // This is a REM line - skip it entirely (don't tokenize or parse)
      // REM lines are treated as comments and ignored
      continue;
    }

    // Tokenize the line
    const lexResult = lexer.tokenize(line);

    // Check for lexing errors
    if (lexResult.errors.length > 0) {
      allErrors.push(...lexResult.errors.map((err: ILexingError) => ({
        message: err.message || 'Lexical error',
        line: lineIndex + 1,
        column: err.column,
        length: err.length,
        location: {
          start: {
            line: lineIndex + 1,
            column: err.column || 1
          }
        }
      })));
      continue;
    }

    // Parse the line
    parserInstance.input = lexResult.tokens;
    const cst = parserInstance.statement();
    
    // Clear errors before checking (they accumulate)
    const parseErrors = [...parserInstance.errors];
    parserInstance.errors = [];

    // Check for parsing errors
    if (parseErrors.length > 0) {
      allErrors.push(...parseErrors.map((err: IRecognitionException) => {
        const token = err.token;
        return {
          message: err.message || 'Syntax error',
          line: lineIndex + 1,
          column: token?.startColumn,
          length: token?.endOffset
            ? token.endOffset - token.startOffset
            : 1,
          location: {
            start: {
              line: lineIndex + 1,
              column: token?.startColumn || 1
            }
          }
        };
      }));
      continue;
    }

    // Successfully parsed - add to statements
    if (cst) {
      statements.push(cst);
    }
  }

  // If there were any errors, return failure
  if (allErrors.length > 0) {
    return {
      success: false,
      errors: allErrors
    };
  }

  // Combine all statements into a program CST
  const programCst: CstNode = {
    name: 'program',
    children: {
      statement: statements
    }
  };

  return {
    success: true,
    cst: programCst
  };
}

// Export for use in CST to AST converter
export { parserInstance };
