// Minimal F-Basic Grammar for Testing
// This is a simplified grammar that focuses on core BASIC commands
// to ensure the parser works before adding F-Basic specific features

{
  // Grammar options
  const keywords = {
    // Control Flow
    IF: 'IF', THEN: 'THEN', ELSE: 'ELSE',
    FOR: 'FOR', NEXT: 'NEXT', TO: 'TO', STEP: 'STEP',
    GOTO: 'GOTO', GOSUB: 'GOSUB', RETURN: 'RETURN',
    END: 'END', STOP: 'STOP', PAUSE: 'PAUSE',
    
    // Data and Variables
    LET: 'LET', DIM: 'DIM', DATA: 'DATA', READ: 'READ', RESTORE: 'RESTORE',
    
    // Input/Output
    PRINT: 'PRINT', INPUT: 'INPUT',
    
    // Functions
    DEF: 'DEF', FN: 'FN',
    
    // Mathematical Functions
    ABS: 'ABS', ATN: 'ATN', COS: 'COS', EXP: 'EXP', FIX: 'FIX',
    INT: 'INT', LOG: 'LOG', RND: 'RND', SGN: 'SGN', SIN: 'SIN',
    SQR: 'SQR', TAN: 'TAN',
    
    // Graphics (Basic)
    CLS: 'CLS', COLOR: 'COLOR', PSET: 'PSET', LINE: 'LINE',
    CIRCLE: 'CIRCLE', PAINT: 'PAINT',
    
    // Comments
    REM: 'REM'
  };
}

// Main program rule
Program = _ statements:Statement* _ {
  return {
    type: 'Program',
    statements
  };
}

// Explicit EOL rule
EOL = "\n" / "\r\n" / "\r"

// Whitespace that doesn't include newlines
WS = [ \t]*

Line = lineNumber:LineNumber _ command:Command _ {
  return {
    type: 'Statement',
    lineNumber: lineNumber,
    command: command
  };
}

// Statement rule
Statement = lineNumber:LineNumber _ command:Command _ {
  return {
    type: 'Statement',
    lineNumber: lineNumber,
    command: command
  };
}

// Line number
LineNumber = digits:[0-9]+ {
  return parseInt(digits.join(''), 10);
}

// Command rules - can be followed by colon-separated statements
Command = command:SingleCommand tail:(_ ":" _ nextCommand:SingleCommand { return nextCommand; })* {
  if (tail.length === 0) {
    return command;
  } else {
    return {
      type: 'StatementBlock',
      statements: [command, ...tail]
    };
  }
}

// Single command (without colon-separated statements)
SingleCommand = 
  printStatement /
  letStatement /
  ifStatement /
  forStatement /
  nextStatement /
  gotoStatement /
  gosubStatement /
  returnStatement /
  endStatement /
  pauseStatement /
  inputStatement /
  dataStatement /
  restoreStatement /
  readStatement /
  dimStatement /
  remStatement /
  clsStatement /
  colorStatement /
  invalidCommand

// PRINT Statement
printStatement = "PRINT"i WS printList:PrintList? {
  return {
    type: 'PrintStatement',
    printList: printList || []
  };
}

PrintList = head:PrintItem tail:(_ separator:("," / ";") _ item:PrintItem { return { item, separator }; })* {
  return [head, ...tail];
}

PrintItem = 
  expression:Expression { return { type: 'Expression', expression: expression }; } /
  string:StringLiteral { return { type: 'StringLiteral', value: string }; }

// LET Statement
letStatement = "LET"i? _ variable:Variable _ "=" _ expression:Expression {
  return {
    type: 'LetStatement',
    variable: variable,
    expression: expression,
    hasLetKeyword: true
  };
}

// IF Statement
ifStatement = "IF"i _ condition:Expression _ "THEN"i _ thenCommand:Command {
  return {
    type: 'IfStatement',
    condition: condition,
    thenStatement: thenCommand
  };
}

// FOR Statement
forStatement = "FOR"i _ variable:Variable _ "=" _ start:Expression _ "TO"i _ end:Expression step:(" " "STEP"i _ stepValue:Expression { return stepValue; })? {
  return {
    type: 'ForStatement',
    variable: variable,
    start: start,
    end: end,
    step: step || { type: 'NumberLiteral', value: 1 }
  };
}

// NEXT Statement
nextStatement = "NEXT"i _ variable:Variable? {
  return {
    type: 'NextStatement',
    variable: variable
  };
}

// GOTO Statement
gotoStatement = "GOTO"i _ target:Expression {
  return {
    type: 'GotoStatement',
    target: target
  };
}

// GOSUB Statement
gosubStatement = "GOSUB"i _ target:Expression {
  return {
    type: 'GosubStatement',
    target: target
  };
}

// RETURN Statement
returnStatement = "RETURN"i {
  return { type: 'ReturnStatement' };
}

// END Statement
endStatement = "END"i {
  return { type: 'EndStatement' };
}

// PAUSE Statement
pauseStatement = "PAUSE"i _ duration:Expression {
  return {
    type: 'PauseStatement',
    duration: duration
  };
}

// INPUT Statement
inputStatement = "INPUT"i _ prompt:(str:StringLiteral _ "," _ { return str; })? variable:Variable variables:(_ "," _ varName:Variable { return varName; })* {
  return {
    type: 'InputStatement',
    prompt: prompt,
    variables: [variable, ...variables]
  };
}

// DATA Statement
dataStatement = "DATA"i _ constants:ConstantList {
  return {
    type: 'DataStatement',
    constants: constants
  };
}

ConstantList = head:Constant tail:(_ "," _ constant:Constant { return constant; })* {
  return [head, ...tail];
}

// READ Statement
readStatement = "READ"i _ variables:VariableList {
  return {
    type: 'ReadStatement',
    variables: variables
  };
}

// RESTORE Statement
restoreStatement = 
  "RESTORE"i WS lineNumber:Expression {
    return {
      type: 'RestoreStatement',
      lineNumber: lineNumber
    };
  } /
  "RESTORE"i {
    return {
      type: 'RestoreStatement',
      lineNumber: null
    };
  }

// DIM Statement
dimStatement = "DIM"i _ head:ArrayDeclaration tail:(_ "," _ arr:ArrayDeclaration { return arr; })* {
  return {
    type: 'DimStatement',
    arrays: [head, ...tail]
  };
}

ArrayDeclaration = name:Identifier _ "(" _ dimensions:ExpressionList _ ")" {
  return {
    variable: {
      type: 'Variable',
      name: name,
      subscript: null
    },
    dimensions: dimensions
  };
}

// REM Statement
remStatement = "REM"i _ comment:(![\r\n] .)* {
  return {
    type: 'RemStatement',
    comment: comment.join('')
  };
}

// CLS Statement
clsStatement = "CLS"i {
  return { type: 'ClsStatement' };
}

// COLOR Statement
colorStatement = "COLOR"i _ foreground:Expression background:(_ "," _ bg:Expression { return bg; })? {
  return {
    type: 'ColorStatement',
    foreground: foreground,
    background: background
  };
}



// Expression rules
Expression = logicalOr

logicalOr = left:logicalAnd tail:(_ "OR"i _ right:logicalAnd { return right; })* {
  return tail.reduce((left, right) => ({
    type: 'BinaryExpression',
    operator: 'OR',
    left: left,
    right: right
  }), left);
}

logicalAnd = left:equality tail:(_ "AND"i _ right:equality { return right; })* {
  return tail.reduce((left, right) => ({
    type: 'BinaryExpression',
    operator: 'AND',
    left: left,
    right: right
  }), left);
}

equality = left:relational tail:(_ op:("=" / "<>") _ right:relational { return { op: op, right: right }; })* {
  return tail.reduce((left, { op, right }) => ({
    type: 'BinaryExpression',
    operator: op,
    left: left,
    right: right
  }), left);
}

relational = left:additive tail:(_ op:("<=" / ">=" / "<" / ">") _ right:additive { return { op: op, right: right }; })* {
  return tail.reduce((left, { op, right }) => ({
    type: 'BinaryExpression',
    operator: op,
    left: left,
    right: right
  }), left);
}

additive = left:multiplicative tail:(_ op:("+" / "-") _ right:multiplicative { return { op: op, right: right }; })* {
  return tail.reduce((left, { op, right }) => ({
    type: 'BinaryExpression',
    operator: op,
    left: left,
    right: right
  }), left);
}

multiplicative = left:exponentiation tail:(_ op:("*" / "/" / "MOD"i) _ right:exponentiation { return { op: op, right: right }; })* {
  return tail.reduce((left, { op, right }) => ({
    type: 'BinaryExpression',
    operator: op,
    left: left,
    right: right
  }), left);
}

exponentiation = left:unary tail:(_ op:"^" _ right:unary { return { op: op, right: right }; })* {
  return tail.reduce((left, { op, right }) => ({
    type: 'BinaryExpression',
    operator: op,
    left: left,
    right: right
  }), left);
}

unary = 
  "NOT"i _ operand:unary {
    return {
      type: 'UnaryExpression',
      operator: 'NOT',
      operand: operand
    };
  } /
  "-" _ operand:unary {
    return {
      type: 'UnaryExpression',
      operator: '-',
      operand: operand
    };
  } /
  primary

primary = 
  "(" _ expression:Expression _ ")" { return expression; } /
  functionCall /
  Variable /
  NumberLiteral /
  StringLiteral

// Function call
functionCall = name:FunctionName _ "(" _ args:ExpressionList? _ ")" {
  return {
    type: 'FunctionCall',
    name: name,
    arguments: args || []
  };
}

FunctionName = 
  "ABS"i { return 'ABS'; } /
  "ATN"i { return 'ATN'; } /
  "COS"i { return 'COS'; } /
  "EXP"i { return 'EXP'; } /
  "FIX"i { return 'FIX'; } /
  "INT"i { return 'INT'; } /
  "LEFT"i { return 'LEFT'; } /
  "LEN"i { return 'LEN'; } /
  "LOG"i { return 'LOG'; } /
  "MID"i { return 'MID'; } /
  "RIGHT"i { return 'RIGHT'; } /
  "RND"i { return 'RND'; } /
  "SGN"i { return 'SGN'; } /
  "SIN"i { return 'SIN'; } /
  "SQR"i { return 'SQR'; } /
  "STICK"i { return 'STICK'; } /
  "STRIG"i { return 'STRIG'; } /
  "TAN"i { return 'TAN'; }

// Variable
Variable = name:Identifier "(" indices:ExpressionList ")" {
  return {
    type: 'Variable',
    name: name,
    subscript: indices
  };
} / name:Identifier {
  return {
    type: 'Variable',
    name: name,
    subscript: null
  };
}

// Identifier
Identifier = !ReservedWord first:[A-Za-z] rest:[A-Za-z0-9$_]* {
  return (first + rest.join('')).toUpperCase();
}

// Reserved words that cannot be used as identifiers
ReservedWord = (
  "PRINT"i / "LET"i / "IF"i / "THEN"i / "FOR"i / "TO"i / "STEP"i / "NEXT"i /
  "GOTO"i / "GOSUB"i / "RETURN"i / "END"i / "INPUT"i / "DATA"i / "READ"i /
  "RESTORE"i / "DIM"i / "REM"i / "CLS"i / "COLOR"i / "AND"i / "OR"i /
  "ABS"i / "ATN"i / "COS"i / "EXP"i / "FIX"i / "INT"i / "LOG"i / "RND"i /
  "SGN"i / "SIN"i / "SQR"i / "TAN"i
) ![A-Za-z0-9$_]

// Number literal
NumberLiteral = number:Number {
  return {
    type: 'NumberLiteral',
    value: number
  };
}

Number = 
  integer:Integer fraction:Fraction? exponent:Exponent? {
    let value = integer;
    if (fraction) value += fraction;
    if (exponent) value *= Math.pow(10, exponent);
    return parseFloat(value.toString());
  }

Integer = digits:[0-9]+ {
  return parseInt(digits.join(''), 10);
}

Fraction = "." digits:[0-9]+ {
  return parseFloat('0.' + digits.join(''));
}

Exponent = [eE] sign:[+-]? digits:[0-9]+ {
  return parseInt((sign || '') + digits.join(''), 10);
}

// String literal
StringLiteral = '"' chars:[^"]* '"' {
  return {
    type: 'StringLiteral',
    value: chars.join('')
  };
}

// Constant
Constant = 
  NumberLiteral /
  StringLiteral

// Invalid command rule - catches any unrecognized command
invalidCommand = command:[A-Za-z]+ {
  return {
    type: 'InvalidCommand',
    command: command.join('')
  };
}

// Expression list
ExpressionList = head:Expression tail:(_ "," _ expr:Expression { return expr; })* {
  return [head, ...tail];
}

// Variable list
VariableList = head:Variable tail:(_ "," _ varName:Variable { return varName; })* {
  return [head, ...tail];
}

// Whitespace
_ = [ \t\r\n]*
