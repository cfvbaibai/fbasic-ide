# Grammar Patterns Reference

This reference covers common grammar patterns in the F-BASIC Chevrotain parser.

## Token Definition Patterns

### Keywords (Case-Insensitive)

```typescript
const CommandName = createToken({
  name: "CommandName",
  pattern: /COMMANDNAME/i,
  longer_alt: Identifier
})
```

### Operators and Punctuation

```typescript
const LParen = createToken({ name: "LParen", pattern: /\(/ })
const RParen = createToken({ name: "RParen", pattern: /\)/ })
const Comma = createToken({ name: "Comma", pattern: /,/ })
const Semicolon = createToken({ name: "Semicolon", pattern: /;/ })
const Equals = createToken({ name: "Equals", pattern: /=/ })
```

### Literals

```typescript
const NumberLiteral = createToken({
  name: "NumberLiteral",
  pattern: /\d+(\.\d+)?/
})

const StringLiteral = createToken({
  name: "StringLiteral",
  pattern: /"[^"]*"/
})
```

## Grammar Rule Patterns

### Simple Command (No Arguments)

```typescript
private clsStatement(): void {
  this.CONSUME(Cls)
}
```

### Command with Single Expression

```typescript
private endStatement(): void {
  this.CONSUME(End)
}
```

### Command with Parenthesized Arguments

```typescript
private circleStatement(): void {
  this.CONSUME(Circle)
  this.CONSUME(LParen)
  this.SUBRULE(this.expression)
  this.CONSUME(Comma)
  this.SUBRULE2(this.expression)
  this.CONSUME(Comma)
  this.SUBRULE3(this.expression)
  this.CONSUME(RParen)
}
```

### Command with Variable Assignment

```typescript
private letStatement(): void {
  this.CONSUME(Let)
  this.CONSUME(Identifier)
  this.CONSUME(Equals)
  this.SUBRULE(this.expression)
}
```

### Command with String Literal

```typescript
private printStatement(): void {
  this.CONSUME(Print)
  this.OR([
    { ALT: () => this.SUBRULE(this.expressionList) },
    { ALT: () => this.CONSUME(StringLiteral) }
  ])
}
```

### Conditional Statement (IF/THEN)

```typescript
private ifStatement(): void {
  this.CONSUME(If)
  this.SUBRULE(this.expression)
  this.CONSUME(Then)
  this.OR([
    { ALT: () => this.SUBRULE(this.statementList) },
    { ALT: () => this.SUBRULE1(this.statement) }
  ])
}
```

### Loop Statement (FOR/NEXT)

```typescript
private forStatement(): void {
  this.CONSUME(For)
  this.CONSUME(Identifier)
  this.CONSUME(Equals)
  this.SUBRULE(this.expression)
  this.CONSUME(To)
  this.SUBRULE1(this.expression)
  this.OR([
    { ALT: () => {
      this.CONSUME(Step)
      this.SUBRULE2(this.expression)
    }}
  ], "Step clause is optional")
}

private nextStatement(): void {
  this.CONSUME(Next)
  this.OR([
    { ALT: () => this.CONSUME(Identifier) },
    { ALT: () => { /* Empty - NEXT without var is valid */ } }
  ])
}
```

### Array Access

```typescript
private arrayAccessExpression(): void {
  this.CONSUME(Identifier)
  this.CONSUME(LParen)
  this.SUBRULE(this.expressionList)
  this.CONSUME(RParen)
}
```

### Function Call

```typescript
private functionCallExpression(): void {
  this.CONSUME(Identifier)
  this.CONSUME(LParen)
  this.OR([
    { ALT: () => this.SUBRULE(this.expressionList) },
    { ALT: () => { /* Empty - no arguments */ } }
  ])
  this.CONSUME(RParen)
}
```

## Expression Grammar Patterns

### Binary Operations (Precedence Levels)

```typescript
private expression(): void {
  this.SUBRULE(this.relationalExpression)
}

private relationalExpression(): void {
  this.SUBRULE(this.additiveExpression)
  this.MANY(() => {
    this.OR([
      { ALT: () => {
        this.CONSUME(LessThan)
        this.SUBRULE1(this.additiveExpression)
      }},
      { ALT: () => {
        this.CONSUME(GreaterThan)
        this.SUBRULE2(this.additiveExpression)
      }},
      { ALT: () => {
        this.CONSUME(EqualsEquals)
        this.SUBRULE3(this.additiveExpression)
      }}
      // ... other relational operators
    ])
  })
}

private additiveExpression(): void {
  this.SUBRULE(this.multiplicativeExpression)
  this.MANY(() => {
    this.OR([
      { ALT: () => {
        this.CONSUME(Plus)
        this.SUBRULE1(this.multiplicativeExpression)
      }},
      { ALT: () => {
        this.CONSUME(Minus)
        this.SUBRULE2(this.multiplicativeExpression)
      }}
    ])
  })
}

private multiplicativeExpression(): void {
  this.SUBRULE(this.unaryExpression)
  this.MANY(() => {
    this.OR([
      { ALT: () => {
        this.CONSUME(Star)
        this.SUBRULE1(this.unaryExpression)
      }},
      { ALT: () => {
        this.CONSUME(Slash)
        this.SUBRULE2(this.unaryExpression)
      }}
    ])
  })
}
```

### Unary Operations

```typescript
private unaryExpression(): void {
  this.OR([
    { ALT: () => {
      this.CONSUME(Minus)
      this.SUBRULE(this.unaryExpression)
    }},
    { ALT: () => {
      this.CONSUME(Not)
      this.SUBRULE1(this.unaryExpression)
    }},
    { ALT: () => this.SUBRULE(this.primaryExpression) }
  ])
}
```

### Primary Expression

```typescript
private primaryExpression(): void {
  this.OR([
    { ALT: () => this.CONSUME(NumberLiteral) },
    { ALT: () => this.CONSUME(StringLiteral) },
    { ALT: () => this.CONSUME(Identifier) },
    { ALT: () => {
      this.CONSUME(LParen)
      this.SUBRULE(this.expression)
      this.CONSUME(RParen)
    }},
    { ALT: () => this.SUBRULE(this.functionCallExpression) },
    { ALT: () => this.SUBRULE(this.arrayAccessExpression) }
  ])
}
```

## Statement Dispatcher Pattern

```typescript
private statement(): void {
  this.OR([
    { ALT: () => this.SUBRULE(this.clsStatement) },
    { ALT: () => this.SUBRULE(this.printStatement) },
    { ALT: () => this.SUBRULE(this.inputStatement) },
    { ALT: () => this.SUBRULE(this.gotoStatement) },
    { ALT: () => this.SUBRULE(this.ifStatement) },
    { ALT: () => this.SUBRULE(this.forStatement) },
    { ALT: () => this.SUBRULE(this.letStatement) },
    // ... add new statement types here
    { ALT: () => this.SUBRULE(this.expressionStatement) }
  ])
}
```

## CST Structure Examples

### Simple Command CST

```
circleStatement: [
  Circle: [Token],
  LParen: [Token],
  expression: [{ ...CST for expression... }],
  Comma: [Token],
  expression: [{ ...CST for expression... }],
  Comma: [Token],
  expression: [{ ...CST for expression... }],
  RParen: [Token]
]
```

### Expression CST

```
expression: [{
  relationalExpression: [{
    additiveExpression: [{
      multiplicativeExpression: [{
        unaryExpression: [{
          primaryExpression: [{
            NumberLiteral: [Token]
          }]
        }]
      }]
    }]
  }]
}]
```

## Error Recovery Patterns

### Optional Clause with Recovery

```typescript
private optionalClause(): void {
  this.OR([
    { ALT: () => {
      this.CONSUME(OptionalKeyword)
      this.SUBRULE(this.expression)
    }},
    { ALT: () => { /* Empty - skip */ } }
  ])
}
```

### List with Recovery

```typescript
private expressionList(): void {
  this.SUBRULE(this.expression)
  this.MANY(() => {
    this.CONSUME(Comma)
    this.SUBRULE1(this.expression)
  })
}
```
