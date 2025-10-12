"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/core/parser/fbasic-parser.js
  var fbasic_parser_exports = {};
  __export(fbasic_parser_exports, {
    SyntaxError: () => peg$SyntaxError,
    parse: () => peg$parse
  });
  function peg$subclass(child, parent) {
    function C() {
      this.constructor = child;
    }
    C.prototype = parent.prototype;
    child.prototype = new C();
  }
  function peg$SyntaxError(message, expected, found, location) {
    var self2 = Error.call(this, message);
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(self2, peg$SyntaxError.prototype);
    }
    self2.expected = expected;
    self2.found = found;
    self2.location = location;
    self2.name = "SyntaxError";
    return self2;
  }
  function peg$padEnd(str, targetLength, padString) {
    padString = padString || " ";
    if (str.length > targetLength) {
      return str;
    }
    targetLength -= str.length;
    padString += padString.repeat(targetLength);
    return str + padString.slice(0, targetLength);
  }
  function peg$parse(input, options) {
    options = options !== void 0 ? options : {};
    var peg$FAILED = {};
    var peg$source = options.grammarSource;
    var peg$startRuleFunctions = { Program: peg$parseProgram };
    var peg$startRuleFunction = peg$parseProgram;
    var peg$c0 = "\n";
    var peg$c1 = "\r\n";
    var peg$c2 = "\r";
    var peg$c3 = ":";
    var peg$c4 = "print";
    var peg$c5 = ",";
    var peg$c6 = ";";
    var peg$c7 = "let";
    var peg$c8 = "=";
    var peg$c9 = "if";
    var peg$c10 = "then";
    var peg$c11 = "for";
    var peg$c12 = "to";
    var peg$c13 = " ";
    var peg$c14 = "step";
    var peg$c15 = "next";
    var peg$c16 = "goto";
    var peg$c17 = "gosub";
    var peg$c18 = "return";
    var peg$c19 = "end";
    var peg$c20 = "pause";
    var peg$c21 = "input";
    var peg$c22 = "data";
    var peg$c23 = "read";
    var peg$c24 = "restore";
    var peg$c25 = "dim";
    var peg$c26 = "(";
    var peg$c27 = ")";
    var peg$c28 = "rem";
    var peg$c29 = "cls";
    var peg$c30 = "color";
    var peg$c31 = "or";
    var peg$c32 = "and";
    var peg$c33 = "<>";
    var peg$c34 = "<=";
    var peg$c35 = ">=";
    var peg$c36 = "<";
    var peg$c37 = ">";
    var peg$c38 = "+";
    var peg$c39 = "-";
    var peg$c40 = "*";
    var peg$c41 = "/";
    var peg$c42 = "mod";
    var peg$c43 = "^";
    var peg$c44 = "not";
    var peg$c45 = "abs";
    var peg$c46 = "atn";
    var peg$c47 = "cos";
    var peg$c48 = "exp";
    var peg$c49 = "fix";
    var peg$c50 = "int";
    var peg$c51 = "left";
    var peg$c52 = "len";
    var peg$c53 = "log";
    var peg$c54 = "mid";
    var peg$c55 = "right";
    var peg$c56 = "rnd";
    var peg$c57 = "sgn";
    var peg$c58 = "sin";
    var peg$c59 = "sqr";
    var peg$c60 = "stick";
    var peg$c61 = "strig";
    var peg$c62 = "tan";
    var peg$c63 = ".";
    var peg$c64 = '"';
    var peg$r0 = /^[ \t]/;
    var peg$r1 = /^[0-9]/;
    var peg$r2 = /^[\r\n]/;
    var peg$r3 = /^[A-Za-z]/;
    var peg$r4 = /^[A-Za-z0-9$_]/;
    var peg$r5 = /^[eE]/;
    var peg$r6 = /^[+\-]/;
    var peg$r7 = /^[^"]/;
    var peg$r8 = /^[ \t\r\n]/;
    var peg$e0 = peg$literalExpectation("\n", false);
    var peg$e1 = peg$literalExpectation("\r\n", false);
    var peg$e2 = peg$literalExpectation("\r", false);
    var peg$e3 = peg$classExpectation([" ", "	"], false, false);
    var peg$e4 = peg$classExpectation([["0", "9"]], false, false);
    var peg$e5 = peg$literalExpectation(":", false);
    var peg$e6 = peg$literalExpectation("PRINT", true);
    var peg$e7 = peg$literalExpectation(",", false);
    var peg$e8 = peg$literalExpectation(";", false);
    var peg$e9 = peg$literalExpectation("LET", true);
    var peg$e10 = peg$literalExpectation("=", false);
    var peg$e11 = peg$literalExpectation("IF", true);
    var peg$e12 = peg$literalExpectation("THEN", true);
    var peg$e13 = peg$literalExpectation("FOR", true);
    var peg$e14 = peg$literalExpectation("TO", true);
    var peg$e15 = peg$literalExpectation(" ", false);
    var peg$e16 = peg$literalExpectation("STEP", true);
    var peg$e17 = peg$literalExpectation("NEXT", true);
    var peg$e18 = peg$literalExpectation("GOTO", true);
    var peg$e19 = peg$literalExpectation("GOSUB", true);
    var peg$e20 = peg$literalExpectation("RETURN", true);
    var peg$e21 = peg$literalExpectation("END", true);
    var peg$e22 = peg$literalExpectation("PAUSE", true);
    var peg$e23 = peg$literalExpectation("INPUT", true);
    var peg$e24 = peg$literalExpectation("DATA", true);
    var peg$e25 = peg$literalExpectation("READ", true);
    var peg$e26 = peg$literalExpectation("RESTORE", true);
    var peg$e27 = peg$literalExpectation("DIM", true);
    var peg$e28 = peg$literalExpectation("(", false);
    var peg$e29 = peg$literalExpectation(")", false);
    var peg$e30 = peg$literalExpectation("REM", true);
    var peg$e31 = peg$classExpectation(["\r", "\n"], false, false);
    var peg$e32 = peg$anyExpectation();
    var peg$e33 = peg$literalExpectation("CLS", true);
    var peg$e34 = peg$literalExpectation("COLOR", true);
    var peg$e35 = peg$literalExpectation("OR", true);
    var peg$e36 = peg$literalExpectation("AND", true);
    var peg$e37 = peg$literalExpectation("<>", false);
    var peg$e38 = peg$literalExpectation("<=", false);
    var peg$e39 = peg$literalExpectation(">=", false);
    var peg$e40 = peg$literalExpectation("<", false);
    var peg$e41 = peg$literalExpectation(">", false);
    var peg$e42 = peg$literalExpectation("+", false);
    var peg$e43 = peg$literalExpectation("-", false);
    var peg$e44 = peg$literalExpectation("*", false);
    var peg$e45 = peg$literalExpectation("/", false);
    var peg$e46 = peg$literalExpectation("MOD", true);
    var peg$e47 = peg$literalExpectation("^", false);
    var peg$e48 = peg$literalExpectation("NOT", true);
    var peg$e49 = peg$literalExpectation("ABS", true);
    var peg$e50 = peg$literalExpectation("ATN", true);
    var peg$e51 = peg$literalExpectation("COS", true);
    var peg$e52 = peg$literalExpectation("EXP", true);
    var peg$e53 = peg$literalExpectation("FIX", true);
    var peg$e54 = peg$literalExpectation("INT", true);
    var peg$e55 = peg$literalExpectation("LEFT", true);
    var peg$e56 = peg$literalExpectation("LEN", true);
    var peg$e57 = peg$literalExpectation("LOG", true);
    var peg$e58 = peg$literalExpectation("MID", true);
    var peg$e59 = peg$literalExpectation("RIGHT", true);
    var peg$e60 = peg$literalExpectation("RND", true);
    var peg$e61 = peg$literalExpectation("SGN", true);
    var peg$e62 = peg$literalExpectation("SIN", true);
    var peg$e63 = peg$literalExpectation("SQR", true);
    var peg$e64 = peg$literalExpectation("STICK", true);
    var peg$e65 = peg$literalExpectation("STRIG", true);
    var peg$e66 = peg$literalExpectation("TAN", true);
    var peg$e67 = peg$classExpectation([["A", "Z"], ["a", "z"]], false, false);
    var peg$e68 = peg$classExpectation([["A", "Z"], ["a", "z"], ["0", "9"], "$", "_"], false, false);
    var peg$e69 = peg$literalExpectation(".", false);
    var peg$e70 = peg$classExpectation(["e", "E"], false, false);
    var peg$e71 = peg$classExpectation(["+", "-"], false, false);
    var peg$e72 = peg$literalExpectation('"', false);
    var peg$e73 = peg$classExpectation(['"'], true, false);
    var peg$e74 = peg$classExpectation([" ", "	", "\r", "\n"], false, false);
    var peg$f0 = function(statements) {
      return {
        type: "Program",
        statements
      };
    };
    var peg$f1 = function(lineNumber, command) {
      return {
        type: "Statement",
        lineNumber,
        command
      };
    };
    var peg$f2 = function(lineNumber, command) {
      return {
        type: "Statement",
        lineNumber,
        command
      };
    };
    var peg$f3 = function(digits) {
      return parseInt(digits.join(""), 10);
    };
    var peg$f4 = function(command, nextCommand) {
      return nextCommand;
    };
    var peg$f5 = function(command, tail) {
      if (tail.length === 0) {
        return command;
      } else {
        return {
          type: "StatementBlock",
          statements: [command, ...tail]
        };
      }
    };
    var peg$f6 = function(printList) {
      return {
        type: "PrintStatement",
        printList: printList || []
      };
    };
    var peg$f7 = function(head, separator, item) {
      return { item, separator };
    };
    var peg$f8 = function(head, tail) {
      return [head, ...tail];
    };
    var peg$f9 = function(expression) {
      return { type: "Expression", expression };
    };
    var peg$f10 = function(string) {
      return { type: "StringLiteral", value: string };
    };
    var peg$f11 = function(variable, expression) {
      return {
        type: "LetStatement",
        variable,
        expression,
        hasLetKeyword: true
      };
    };
    var peg$f12 = function(condition, thenCommand) {
      return {
        type: "IfStatement",
        condition,
        thenStatement: thenCommand
      };
    };
    var peg$f13 = function(variable, start, end, stepValue) {
      return stepValue;
    };
    var peg$f14 = function(variable, start, end, step) {
      return {
        type: "ForStatement",
        variable,
        start,
        end,
        step: step || { type: "NumberLiteral", value: 1 }
      };
    };
    var peg$f15 = function(variable) {
      return {
        type: "NextStatement",
        variable
      };
    };
    var peg$f16 = function(target) {
      return {
        type: "GotoStatement",
        target
      };
    };
    var peg$f17 = function(target) {
      return {
        type: "GosubStatement",
        target
      };
    };
    var peg$f18 = function() {
      return { type: "ReturnStatement" };
    };
    var peg$f19 = function() {
      return { type: "EndStatement" };
    };
    var peg$f20 = function(duration) {
      return {
        type: "PauseStatement",
        duration
      };
    };
    var peg$f21 = function(str) {
      return str;
    };
    var peg$f22 = function(prompt, variable, varName) {
      return varName;
    };
    var peg$f23 = function(prompt, variable, variables) {
      return {
        type: "InputStatement",
        prompt,
        variables: [variable, ...variables]
      };
    };
    var peg$f24 = function(constants) {
      return {
        type: "DataStatement",
        constants
      };
    };
    var peg$f25 = function(head, constant) {
      return constant;
    };
    var peg$f26 = function(head, tail) {
      return [head, ...tail];
    };
    var peg$f27 = function(variables) {
      return {
        type: "ReadStatement",
        variables
      };
    };
    var peg$f28 = function(lineNumber) {
      return {
        type: "RestoreStatement",
        lineNumber
      };
    };
    var peg$f29 = function() {
      return {
        type: "RestoreStatement",
        lineNumber: null
      };
    };
    var peg$f30 = function(head, arr) {
      return arr;
    };
    var peg$f31 = function(head, tail) {
      return {
        type: "DimStatement",
        arrays: [head, ...tail]
      };
    };
    var peg$f32 = function(name, dimensions) {
      return {
        variable: {
          type: "Variable",
          name,
          subscript: null
        },
        dimensions
      };
    };
    var peg$f33 = function(comment) {
      return {
        type: "RemStatement",
        comment: comment.join("")
      };
    };
    var peg$f34 = function() {
      return { type: "ClsStatement" };
    };
    var peg$f35 = function(foreground, bg) {
      return bg;
    };
    var peg$f36 = function(foreground, background) {
      return {
        type: "ColorStatement",
        foreground,
        background
      };
    };
    var peg$f37 = function(left, right) {
      return right;
    };
    var peg$f38 = function(left, tail) {
      return tail.reduce((left2, right) => ({
        type: "BinaryExpression",
        operator: "OR",
        left: left2,
        right
      }), left);
    };
    var peg$f39 = function(left, right) {
      return right;
    };
    var peg$f40 = function(left, tail) {
      return tail.reduce((left2, right) => ({
        type: "BinaryExpression",
        operator: "AND",
        left: left2,
        right
      }), left);
    };
    var peg$f41 = function(left, op, right) {
      return { op, right };
    };
    var peg$f42 = function(left, tail) {
      return tail.reduce((left2, { op, right }) => ({
        type: "BinaryExpression",
        operator: op,
        left: left2,
        right
      }), left);
    };
    var peg$f43 = function(left, op, right) {
      return { op, right };
    };
    var peg$f44 = function(left, tail) {
      return tail.reduce((left2, { op, right }) => ({
        type: "BinaryExpression",
        operator: op,
        left: left2,
        right
      }), left);
    };
    var peg$f45 = function(left, op, right) {
      return { op, right };
    };
    var peg$f46 = function(left, tail) {
      return tail.reduce((left2, { op, right }) => ({
        type: "BinaryExpression",
        operator: op,
        left: left2,
        right
      }), left);
    };
    var peg$f47 = function(left, op, right) {
      return { op, right };
    };
    var peg$f48 = function(left, tail) {
      return tail.reduce((left2, { op, right }) => ({
        type: "BinaryExpression",
        operator: op,
        left: left2,
        right
      }), left);
    };
    var peg$f49 = function(left, op, right) {
      return { op, right };
    };
    var peg$f50 = function(left, tail) {
      return tail.reduce((left2, { op, right }) => ({
        type: "BinaryExpression",
        operator: op,
        left: left2,
        right
      }), left);
    };
    var peg$f51 = function(operand) {
      return {
        type: "UnaryExpression",
        operator: "NOT",
        operand
      };
    };
    var peg$f52 = function(operand) {
      return {
        type: "UnaryExpression",
        operator: "-",
        operand
      };
    };
    var peg$f53 = function(expression) {
      return expression;
    };
    var peg$f54 = function(name, args) {
      return {
        type: "FunctionCall",
        name,
        arguments: args || []
      };
    };
    var peg$f55 = function() {
      return "ABS";
    };
    var peg$f56 = function() {
      return "ATN";
    };
    var peg$f57 = function() {
      return "COS";
    };
    var peg$f58 = function() {
      return "EXP";
    };
    var peg$f59 = function() {
      return "FIX";
    };
    var peg$f60 = function() {
      return "INT";
    };
    var peg$f61 = function() {
      return "LEFT";
    };
    var peg$f62 = function() {
      return "LEN";
    };
    var peg$f63 = function() {
      return "LOG";
    };
    var peg$f64 = function() {
      return "MID";
    };
    var peg$f65 = function() {
      return "RIGHT";
    };
    var peg$f66 = function() {
      return "RND";
    };
    var peg$f67 = function() {
      return "SGN";
    };
    var peg$f68 = function() {
      return "SIN";
    };
    var peg$f69 = function() {
      return "SQR";
    };
    var peg$f70 = function() {
      return "STICK";
    };
    var peg$f71 = function() {
      return "STRIG";
    };
    var peg$f72 = function() {
      return "TAN";
    };
    var peg$f73 = function(name, indices) {
      return {
        type: "Variable",
        name,
        subscript: indices
      };
    };
    var peg$f74 = function(name) {
      return {
        type: "Variable",
        name,
        subscript: null
      };
    };
    var peg$f75 = function(first, rest) {
      return (first + rest.join("")).toUpperCase();
    };
    var peg$f76 = function(number) {
      return {
        type: "NumberLiteral",
        value: number
      };
    };
    var peg$f77 = function(integer, fraction, exponent) {
      let value = integer;
      if (fraction) value += fraction;
      if (exponent) value *= Math.pow(10, exponent);
      return parseFloat(value.toString());
    };
    var peg$f78 = function(digits) {
      return parseInt(digits.join(""), 10);
    };
    var peg$f79 = function(digits) {
      return parseFloat("0." + digits.join(""));
    };
    var peg$f80 = function(sign, digits) {
      return parseInt((sign || "") + digits.join(""), 10);
    };
    var peg$f81 = function(chars) {
      return {
        type: "StringLiteral",
        value: chars.join("")
      };
    };
    var peg$f82 = function(command) {
      return {
        type: "InvalidCommand",
        command: command.join("")
      };
    };
    var peg$f83 = function(head, expr) {
      return expr;
    };
    var peg$f84 = function(head, tail) {
      return [head, ...tail];
    };
    var peg$f85 = function(head, varName) {
      return varName;
    };
    var peg$f86 = function(head, tail) {
      return [head, ...tail];
    };
    var peg$currPos = 0;
    var peg$savedPos = 0;
    var peg$posDetailsCache = [{ line: 1, column: 1 }];
    var peg$maxFailPos = 0;
    var peg$maxFailExpected = [];
    var peg$silentFails = 0;
    var peg$result;
    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error(`Can't start parsing from rule "` + options.startRule + '".');
      }
      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }
    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }
    function offset() {
      return peg$savedPos;
    }
    function range() {
      return {
        source: peg$source,
        start: peg$savedPos,
        end: peg$currPos
      };
    }
    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }
    function expected(description, location2) {
      location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
      throw peg$buildStructuredError(
        [peg$otherExpectation(description)],
        input.substring(peg$savedPos, peg$currPos),
        location2
      );
    }
    function error(message, location2) {
      location2 = location2 !== void 0 ? location2 : peg$computeLocation(peg$savedPos, peg$currPos);
      throw peg$buildSimpleError(message, location2);
    }
    function peg$literalExpectation(text2, ignoreCase) {
      return { type: "literal", text: text2, ignoreCase };
    }
    function peg$classExpectation(parts, inverted, ignoreCase) {
      return { type: "class", parts, inverted, ignoreCase };
    }
    function peg$anyExpectation() {
      return { type: "any" };
    }
    function peg$endExpectation() {
      return { type: "end" };
    }
    function peg$otherExpectation(description) {
      return { type: "other", description };
    }
    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos];
      var p;
      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }
        details = peg$posDetailsCache[p];
        details = {
          line: details.line,
          column: details.column
        };
        while (p < pos) {
          if (input.charCodeAt(p) === 10) {
            details.line++;
            details.column = 1;
          } else {
            details.column++;
          }
          p++;
        }
        peg$posDetailsCache[pos] = details;
        return details;
      }
    }
    function peg$computeLocation(startPos, endPos, offset2) {
      var startPosDetails = peg$computePosDetails(startPos);
      var endPosDetails = peg$computePosDetails(endPos);
      var res = {
        source: peg$source,
        start: {
          offset: startPos,
          line: startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line: endPosDetails.line,
          column: endPosDetails.column
        }
      };
      if (offset2 && peg$source && typeof peg$source.offset === "function") {
        res.start = peg$source.offset(res.start);
        res.end = peg$source.offset(res.end);
      }
      return res;
    }
    function peg$fail(expected2) {
      if (peg$currPos < peg$maxFailPos) {
        return;
      }
      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }
      peg$maxFailExpected.push(expected2);
    }
    function peg$buildSimpleError(message, location2) {
      return new peg$SyntaxError(message, null, null, location2);
    }
    function peg$buildStructuredError(expected2, found, location2) {
      return new peg$SyntaxError(
        peg$SyntaxError.buildMessage(expected2, found),
        expected2,
        found,
        location2
      );
    }
    function peg$parseProgram() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      s1 = peg$parse_();
      s2 = [];
      s3 = peg$parseStatement();
      while (s3 !== peg$FAILED) {
        s2.push(s3);
        s3 = peg$parseStatement();
      }
      s3 = peg$parse_();
      peg$savedPos = s0;
      s0 = peg$f0(s2);
      return s0;
    }
    function peg$parseEOL() {
      var s0;
      if (input.charCodeAt(peg$currPos) === 10) {
        s0 = peg$c0;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e0);
        }
      }
      if (s0 === peg$FAILED) {
        if (input.substr(peg$currPos, 2) === peg$c1) {
          s0 = peg$c1;
          peg$currPos += 2;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e1);
          }
        }
        if (s0 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 13) {
            s0 = peg$c2;
            peg$currPos++;
          } else {
            s0 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e2);
            }
          }
        }
      }
      return s0;
    }
    function peg$parseWS() {
      var s0, s1;
      s0 = [];
      if (peg$r0.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e3);
        }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (peg$r0.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e3);
          }
        }
      }
      return s0;
    }
    function peg$parseLine() {
      var s0, s1, s2, s3, s4;
      s0 = peg$currPos;
      s1 = peg$parseLineNumber();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parseCommand();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          peg$savedPos = s0;
          s0 = peg$f1(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseStatement() {
      var s0, s1, s2, s3, s4;
      s0 = peg$currPos;
      s1 = peg$parseLineNumber();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parseCommand();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          peg$savedPos = s0;
          s0 = peg$f2(s1, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseLineNumber() {
      var s0, s1, s2;
      s0 = peg$currPos;
      s1 = [];
      if (peg$r1.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e4);
        }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$r1.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e4);
            }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f3(s1);
      }
      s0 = s1;
      return s0;
    }
    function peg$parseCommand() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseSingleCommand();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 58) {
          s5 = peg$c3;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e5);
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parseSingleCommand();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f4(s1, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 58) {
            s5 = peg$c3;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e5);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parseSingleCommand();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f4(s1, s7);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f5(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseSingleCommand() {
      var s0;
      s0 = peg$parseprintStatement();
      if (s0 === peg$FAILED) {
        s0 = peg$parseletStatement();
        if (s0 === peg$FAILED) {
          s0 = peg$parseifStatement();
          if (s0 === peg$FAILED) {
            s0 = peg$parseforStatement();
            if (s0 === peg$FAILED) {
              s0 = peg$parsenextStatement();
              if (s0 === peg$FAILED) {
                s0 = peg$parsegotoStatement();
                if (s0 === peg$FAILED) {
                  s0 = peg$parsegosubStatement();
                  if (s0 === peg$FAILED) {
                    s0 = peg$parsereturnStatement();
                    if (s0 === peg$FAILED) {
                      s0 = peg$parseendStatement();
                      if (s0 === peg$FAILED) {
                        s0 = peg$parsepauseStatement();
                        if (s0 === peg$FAILED) {
                          s0 = peg$parseinputStatement();
                          if (s0 === peg$FAILED) {
                            s0 = peg$parsedataStatement();
                            if (s0 === peg$FAILED) {
                              s0 = peg$parserestoreStatement();
                              if (s0 === peg$FAILED) {
                                s0 = peg$parsereadStatement();
                                if (s0 === peg$FAILED) {
                                  s0 = peg$parsedimStatement();
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$parseremStatement();
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$parseclsStatement();
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$parsecolorStatement();
                                        if (s0 === peg$FAILED) {
                                          s0 = peg$parseinvalidCommand();
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return s0;
    }
    function peg$parseprintStatement() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c4) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e6);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseWS();
        s3 = peg$parsePrintList();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        peg$savedPos = s0;
        s0 = peg$f6(s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsePrintList() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parsePrintItem();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 44) {
          s5 = peg$c5;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e7);
          }
        }
        if (s5 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 59) {
            s5 = peg$c6;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e8);
            }
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parsePrintItem();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f7(s1, s5, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c5;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s5 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 59) {
              s5 = peg$c6;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e8);
              }
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parsePrintItem();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f7(s1, s5, s7);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f8(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsePrintItem() {
      var s0, s1;
      s0 = peg$currPos;
      s1 = peg$parselogicalOr();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f9(s1);
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseStringLiteral();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f10(s1);
        }
        s0 = s1;
      }
      return s0;
    }
    function peg$parseletStatement() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c7) {
        s1 = input.substr(peg$currPos, 3);
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e9);
        }
      }
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      s2 = peg$parse_();
      s3 = peg$parseVariable();
      if (s3 !== peg$FAILED) {
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 61) {
          s5 = peg$c8;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e10);
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parselogicalOr();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f11(s3, s7);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseifStatement() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 2).toLowerCase() === peg$c9) {
        s1 = input.substr(peg$currPos, 2);
        peg$currPos += 2;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e11);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parselogicalOr();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (input.substr(peg$currPos, 4).toLowerCase() === peg$c10) {
            s5 = input.substr(peg$currPos, 4);
            peg$currPos += 4;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e12);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parseCommand();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f12(s3, s7);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseforStatement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c11) {
        s1 = input.substr(peg$currPos, 3);
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e13);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parseVariable();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 61) {
            s5 = peg$c8;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e10);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parselogicalOr();
            if (s7 !== peg$FAILED) {
              s8 = peg$parse_();
              if (input.substr(peg$currPos, 2).toLowerCase() === peg$c12) {
                s9 = input.substr(peg$currPos, 2);
                peg$currPos += 2;
              } else {
                s9 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e14);
                }
              }
              if (s9 !== peg$FAILED) {
                s10 = peg$parse_();
                s11 = peg$parselogicalOr();
                if (s11 !== peg$FAILED) {
                  s12 = peg$currPos;
                  if (input.charCodeAt(peg$currPos) === 32) {
                    s13 = peg$c13;
                    peg$currPos++;
                  } else {
                    s13 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e15);
                    }
                  }
                  if (s13 !== peg$FAILED) {
                    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c14) {
                      s14 = input.substr(peg$currPos, 4);
                      peg$currPos += 4;
                    } else {
                      s14 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e16);
                      }
                    }
                    if (s14 !== peg$FAILED) {
                      s15 = peg$parse_();
                      s16 = peg$parselogicalOr();
                      if (s16 !== peg$FAILED) {
                        peg$savedPos = s12;
                        s12 = peg$f13(s3, s7, s11, s16);
                      } else {
                        peg$currPos = s12;
                        s12 = peg$FAILED;
                      }
                    } else {
                      peg$currPos = s12;
                      s12 = peg$FAILED;
                    }
                  } else {
                    peg$currPos = s12;
                    s12 = peg$FAILED;
                  }
                  if (s12 === peg$FAILED) {
                    s12 = null;
                  }
                  peg$savedPos = s0;
                  s0 = peg$f14(s3, s7, s11, s12);
                } else {
                  peg$currPos = s0;
                  s0 = peg$FAILED;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$FAILED;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsenextStatement() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c15) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e17);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parseVariable();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        peg$savedPos = s0;
        s0 = peg$f15(s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsegotoStatement() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c16) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e18);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parselogicalOr();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f16(s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsegosubStatement() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c17) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e19);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parselogicalOr();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f17(s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsereturnStatement() {
      var s0, s1;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 6).toLowerCase() === peg$c18) {
        s1 = input.substr(peg$currPos, 6);
        peg$currPos += 6;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e20);
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f18();
      }
      s0 = s1;
      return s0;
    }
    function peg$parseendStatement() {
      var s0, s1;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c19) {
        s1 = input.substr(peg$currPos, 3);
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e21);
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f19();
      }
      s0 = s1;
      return s0;
    }
    function peg$parsepauseStatement() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c20) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e22);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parselogicalOr();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f20(s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseinputStatement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c21) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e23);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$currPos;
        s4 = peg$parseStringLiteral();
        if (s4 !== peg$FAILED) {
          s5 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 44) {
            s6 = peg$c5;
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s6 !== peg$FAILED) {
            s7 = peg$parse_();
            peg$savedPos = s3;
            s3 = peg$f21(s4);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        s4 = peg$parseVariable();
        if (s4 !== peg$FAILED) {
          s5 = [];
          s6 = peg$currPos;
          s7 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 44) {
            s8 = peg$c5;
            peg$currPos++;
          } else {
            s8 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s8 !== peg$FAILED) {
            s9 = peg$parse_();
            s10 = peg$parseVariable();
            if (s10 !== peg$FAILED) {
              peg$savedPos = s6;
              s6 = peg$f22(s3, s4, s10);
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
          } else {
            peg$currPos = s6;
            s6 = peg$FAILED;
          }
          while (s6 !== peg$FAILED) {
            s5.push(s6);
            s6 = peg$currPos;
            s7 = peg$parse_();
            if (input.charCodeAt(peg$currPos) === 44) {
              s8 = peg$c5;
              peg$currPos++;
            } else {
              s8 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e7);
              }
            }
            if (s8 !== peg$FAILED) {
              s9 = peg$parse_();
              s10 = peg$parseVariable();
              if (s10 !== peg$FAILED) {
                peg$savedPos = s6;
                s6 = peg$f22(s3, s4, s10);
              } else {
                peg$currPos = s6;
                s6 = peg$FAILED;
              }
            } else {
              peg$currPos = s6;
              s6 = peg$FAILED;
            }
          }
          peg$savedPos = s0;
          s0 = peg$f23(s3, s4, s5);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsedataStatement() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c22) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e24);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parseConstantList();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f24(s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseConstantList() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseConstant();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 44) {
          s5 = peg$c5;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e7);
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parseConstant();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f25(s1, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c5;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parseConstant();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f25(s1, s7);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f26(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsereadStatement() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c23) {
        s1 = input.substr(peg$currPos, 4);
        peg$currPos += 4;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e25);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parseVariableList();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f27(s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parserestoreStatement() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 7).toLowerCase() === peg$c24) {
        s1 = input.substr(peg$currPos, 7);
        peg$currPos += 7;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e26);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseWS();
        s3 = peg$parselogicalOr();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f28(s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 7).toLowerCase() === peg$c24) {
          s1 = input.substr(peg$currPos, 7);
          peg$currPos += 7;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e26);
          }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f29();
        }
        s0 = s1;
      }
      return s0;
    }
    function peg$parsedimStatement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c25) {
        s1 = input.substr(peg$currPos, 3);
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e27);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parseArrayDeclaration();
        if (s3 !== peg$FAILED) {
          s4 = [];
          s5 = peg$currPos;
          s6 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 44) {
            s7 = peg$c5;
            peg$currPos++;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s7 !== peg$FAILED) {
            s8 = peg$parse_();
            s9 = peg$parseArrayDeclaration();
            if (s9 !== peg$FAILED) {
              peg$savedPos = s5;
              s5 = peg$f30(s3, s9);
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          while (s5 !== peg$FAILED) {
            s4.push(s5);
            s5 = peg$currPos;
            s6 = peg$parse_();
            if (input.charCodeAt(peg$currPos) === 44) {
              s7 = peg$c5;
              peg$currPos++;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e7);
              }
            }
            if (s7 !== peg$FAILED) {
              s8 = peg$parse_();
              s9 = peg$parseArrayDeclaration();
              if (s9 !== peg$FAILED) {
                peg$savedPos = s5;
                s5 = peg$f30(s3, s9);
              } else {
                peg$currPos = s5;
                s5 = peg$FAILED;
              }
            } else {
              peg$currPos = s5;
              s5 = peg$FAILED;
            }
          }
          peg$savedPos = s0;
          s0 = peg$f31(s3, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseArrayDeclaration() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseIdentifier();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 40) {
          s3 = peg$c26;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e28);
          }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          s5 = peg$parseExpressionList();
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            if (input.charCodeAt(peg$currPos) === 41) {
              s7 = peg$c27;
              peg$currPos++;
            } else {
              s7 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e29);
              }
            }
            if (s7 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f32(s1, s5);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseremStatement() {
      var s0, s1, s2, s3, s4, s5, s6;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c28) {
        s1 = input.substr(peg$currPos, 3);
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e30);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = [];
        s4 = peg$currPos;
        s5 = peg$currPos;
        peg$silentFails++;
        if (peg$r2.test(input.charAt(peg$currPos))) {
          s6 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s6 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e31);
          }
        }
        peg$silentFails--;
        if (s6 === peg$FAILED) {
          s5 = void 0;
        } else {
          peg$currPos = s5;
          s5 = peg$FAILED;
        }
        if (s5 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s6 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e32);
            }
          }
          if (s6 !== peg$FAILED) {
            s5 = [s5, s6];
            s4 = s5;
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        } else {
          peg$currPos = s4;
          s4 = peg$FAILED;
        }
        while (s4 !== peg$FAILED) {
          s3.push(s4);
          s4 = peg$currPos;
          s5 = peg$currPos;
          peg$silentFails++;
          if (peg$r2.test(input.charAt(peg$currPos))) {
            s6 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e31);
            }
          }
          peg$silentFails--;
          if (s6 === peg$FAILED) {
            s5 = void 0;
          } else {
            peg$currPos = s5;
            s5 = peg$FAILED;
          }
          if (s5 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s6 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s6 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e32);
              }
            }
            if (s6 !== peg$FAILED) {
              s5 = [s5, s6];
              s4 = s5;
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f33(s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseclsStatement() {
      var s0, s1;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c29) {
        s1 = input.substr(peg$currPos, 3);
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e33);
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f34();
      }
      s0 = s1;
      return s0;
    }
    function peg$parsecolorStatement() {
      var s0, s1, s2, s3, s4, s5, s6, s7, s8;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c30) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e34);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parselogicalOr();
        if (s3 !== peg$FAILED) {
          s4 = peg$currPos;
          s5 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 44) {
            s6 = peg$c5;
            peg$currPos++;
          } else {
            s6 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s6 !== peg$FAILED) {
            s7 = peg$parse_();
            s8 = peg$parselogicalOr();
            if (s8 !== peg$FAILED) {
              peg$savedPos = s4;
              s4 = peg$f35(s3, s8);
            } else {
              peg$currPos = s4;
              s4 = peg$FAILED;
            }
          } else {
            peg$currPos = s4;
            s4 = peg$FAILED;
          }
          if (s4 === peg$FAILED) {
            s4 = null;
          }
          peg$savedPos = s0;
          s0 = peg$f36(s3, s4);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parselogicalOr() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parselogicalAnd();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.substr(peg$currPos, 2).toLowerCase() === peg$c31) {
          s5 = input.substr(peg$currPos, 2);
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e35);
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parselogicalAnd();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f37(s1, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.substr(peg$currPos, 2).toLowerCase() === peg$c31) {
            s5 = input.substr(peg$currPos, 2);
            peg$currPos += 2;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e35);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parselogicalAnd();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f37(s1, s7);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f38(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parselogicalAnd() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseequality();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c32) {
          s5 = input.substr(peg$currPos, 3);
          peg$currPos += 3;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e36);
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parseequality();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f39(s1, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.substr(peg$currPos, 3).toLowerCase() === peg$c32) {
            s5 = input.substr(peg$currPos, 3);
            peg$currPos += 3;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e36);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parseequality();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f39(s1, s7);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f40(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseequality() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parserelational();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 61) {
          s5 = peg$c8;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e10);
          }
        }
        if (s5 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c33) {
            s5 = peg$c33;
            peg$currPos += 2;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e37);
            }
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parserelational();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f41(s1, s5, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 61) {
            s5 = peg$c8;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e10);
            }
          }
          if (s5 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c33) {
              s5 = peg$c33;
              peg$currPos += 2;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e37);
              }
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parserelational();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f41(s1, s5, s7);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f42(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parserelational() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseadditive();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.substr(peg$currPos, 2) === peg$c34) {
          s5 = peg$c34;
          peg$currPos += 2;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e38);
          }
        }
        if (s5 === peg$FAILED) {
          if (input.substr(peg$currPos, 2) === peg$c35) {
            s5 = peg$c35;
            peg$currPos += 2;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e39);
            }
          }
          if (s5 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 60) {
              s5 = peg$c36;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e40);
              }
            }
            if (s5 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 62) {
                s5 = peg$c37;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e41);
                }
              }
            }
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parseadditive();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f43(s1, s5, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.substr(peg$currPos, 2) === peg$c34) {
            s5 = peg$c34;
            peg$currPos += 2;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e38);
            }
          }
          if (s5 === peg$FAILED) {
            if (input.substr(peg$currPos, 2) === peg$c35) {
              s5 = peg$c35;
              peg$currPos += 2;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e39);
              }
            }
            if (s5 === peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 60) {
                s5 = peg$c36;
                peg$currPos++;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e40);
                }
              }
              if (s5 === peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 62) {
                  s5 = peg$c37;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e41);
                  }
                }
              }
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parseadditive();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f43(s1, s5, s7);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f44(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseadditive() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parsemultiplicative();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 43) {
          s5 = peg$c38;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e42);
          }
        }
        if (s5 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 45) {
            s5 = peg$c39;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e43);
            }
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parsemultiplicative();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f45(s1, s5, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 43) {
            s5 = peg$c38;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e42);
            }
          }
          if (s5 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 45) {
              s5 = peg$c39;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e43);
              }
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parsemultiplicative();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f45(s1, s5, s7);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f46(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parsemultiplicative() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseexponentiation();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 42) {
          s5 = peg$c40;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e44);
          }
        }
        if (s5 === peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 47) {
            s5 = peg$c41;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e45);
            }
          }
          if (s5 === peg$FAILED) {
            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c42) {
              s5 = input.substr(peg$currPos, 3);
              peg$currPos += 3;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e46);
              }
            }
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parseexponentiation();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f47(s1, s5, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 42) {
            s5 = peg$c40;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e44);
            }
          }
          if (s5 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 47) {
              s5 = peg$c41;
              peg$currPos++;
            } else {
              s5 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e45);
              }
            }
            if (s5 === peg$FAILED) {
              if (input.substr(peg$currPos, 3).toLowerCase() === peg$c42) {
                s5 = input.substr(peg$currPos, 3);
                peg$currPos += 3;
              } else {
                s5 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e46);
                }
              }
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parseexponentiation();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f47(s1, s5, s7);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f48(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseexponentiation() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseunary();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 94) {
          s5 = peg$c43;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e47);
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parseunary();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f49(s1, s5, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 94) {
            s5 = peg$c43;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e47);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parseunary();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f49(s1, s5, s7);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f50(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseunary() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c44) {
        s1 = input.substr(peg$currPos, 3);
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e48);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parseunary();
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f51(s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.charCodeAt(peg$currPos) === 45) {
          s1 = peg$c39;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e43);
          }
        }
        if (s1 !== peg$FAILED) {
          s2 = peg$parse_();
          s3 = peg$parseunary();
          if (s3 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f52(s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
        if (s0 === peg$FAILED) {
          s0 = peg$parseprimary();
        }
      }
      return s0;
    }
    function peg$parseprimary() {
      var s0, s1, s2, s3, s4, s5;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 40) {
        s1 = peg$c26;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e28);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        s3 = peg$parselogicalOr();
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 41) {
            s5 = peg$c27;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e29);
            }
          }
          if (s5 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f53(s3);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$parsefunctionCall();
        if (s0 === peg$FAILED) {
          s0 = peg$parseVariable();
          if (s0 === peg$FAILED) {
            s0 = peg$parseNumberLiteral();
            if (s0 === peg$FAILED) {
              s0 = peg$parseStringLiteral();
            }
          }
        }
      }
      return s0;
    }
    function peg$parsefunctionCall() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseFunctionName();
      if (s1 !== peg$FAILED) {
        s2 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 40) {
          s3 = peg$c26;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e28);
          }
        }
        if (s3 !== peg$FAILED) {
          s4 = peg$parse_();
          s5 = peg$parseExpressionList();
          if (s5 === peg$FAILED) {
            s5 = null;
          }
          s6 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 41) {
            s7 = peg$c27;
            peg$currPos++;
          } else {
            s7 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e29);
            }
          }
          if (s7 !== peg$FAILED) {
            peg$savedPos = s0;
            s0 = peg$f54(s1, s5);
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseFunctionName() {
      var s0, s1;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c45) {
        s1 = input.substr(peg$currPos, 3);
        peg$currPos += 3;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e49);
        }
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f55();
      }
      s0 = s1;
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c46) {
          s1 = input.substr(peg$currPos, 3);
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e50);
          }
        }
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f56();
        }
        s0 = s1;
        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          if (input.substr(peg$currPos, 3).toLowerCase() === peg$c47) {
            s1 = input.substr(peg$currPos, 3);
            peg$currPos += 3;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e51);
            }
          }
          if (s1 !== peg$FAILED) {
            peg$savedPos = s0;
            s1 = peg$f57();
          }
          s0 = s1;
          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c48) {
              s1 = input.substr(peg$currPos, 3);
              peg$currPos += 3;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e52);
              }
            }
            if (s1 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$f58();
            }
            s0 = s1;
            if (s0 === peg$FAILED) {
              s0 = peg$currPos;
              if (input.substr(peg$currPos, 3).toLowerCase() === peg$c49) {
                s1 = input.substr(peg$currPos, 3);
                peg$currPos += 3;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e53);
                }
              }
              if (s1 !== peg$FAILED) {
                peg$savedPos = s0;
                s1 = peg$f59();
              }
              s0 = s1;
              if (s0 === peg$FAILED) {
                s0 = peg$currPos;
                if (input.substr(peg$currPos, 3).toLowerCase() === peg$c50) {
                  s1 = input.substr(peg$currPos, 3);
                  peg$currPos += 3;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e54);
                  }
                }
                if (s1 !== peg$FAILED) {
                  peg$savedPos = s0;
                  s1 = peg$f60();
                }
                s0 = s1;
                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;
                  if (input.substr(peg$currPos, 4).toLowerCase() === peg$c51) {
                    s1 = input.substr(peg$currPos, 4);
                    peg$currPos += 4;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e55);
                    }
                  }
                  if (s1 !== peg$FAILED) {
                    peg$savedPos = s0;
                    s1 = peg$f61();
                  }
                  s0 = s1;
                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c52) {
                      s1 = input.substr(peg$currPos, 3);
                      peg$currPos += 3;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e56);
                      }
                    }
                    if (s1 !== peg$FAILED) {
                      peg$savedPos = s0;
                      s1 = peg$f62();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                      s0 = peg$currPos;
                      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c53) {
                        s1 = input.substr(peg$currPos, 3);
                        peg$currPos += 3;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e57);
                        }
                      }
                      if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f63();
                      }
                      s0 = s1;
                      if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c54) {
                          s1 = input.substr(peg$currPos, 3);
                          peg$currPos += 3;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e58);
                          }
                        }
                        if (s1 !== peg$FAILED) {
                          peg$savedPos = s0;
                          s1 = peg$f64();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                          s0 = peg$currPos;
                          if (input.substr(peg$currPos, 5).toLowerCase() === peg$c55) {
                            s1 = input.substr(peg$currPos, 5);
                            peg$currPos += 5;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e59);
                            }
                          }
                          if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$f65();
                          }
                          s0 = s1;
                          if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c56) {
                              s1 = input.substr(peg$currPos, 3);
                              peg$currPos += 3;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e60);
                              }
                            }
                            if (s1 !== peg$FAILED) {
                              peg$savedPos = s0;
                              s1 = peg$f66();
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                              s0 = peg$currPos;
                              if (input.substr(peg$currPos, 3).toLowerCase() === peg$c57) {
                                s1 = input.substr(peg$currPos, 3);
                                peg$currPos += 3;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e61);
                                }
                              }
                              if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$f67();
                              }
                              s0 = s1;
                              if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.substr(peg$currPos, 3).toLowerCase() === peg$c58) {
                                  s1 = input.substr(peg$currPos, 3);
                                  peg$currPos += 3;
                                } else {
                                  s1 = peg$FAILED;
                                  if (peg$silentFails === 0) {
                                    peg$fail(peg$e62);
                                  }
                                }
                                if (s1 !== peg$FAILED) {
                                  peg$savedPos = s0;
                                  s1 = peg$f68();
                                }
                                s0 = s1;
                                if (s0 === peg$FAILED) {
                                  s0 = peg$currPos;
                                  if (input.substr(peg$currPos, 3).toLowerCase() === peg$c59) {
                                    s1 = input.substr(peg$currPos, 3);
                                    peg$currPos += 3;
                                  } else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                      peg$fail(peg$e63);
                                    }
                                  }
                                  if (s1 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$f69();
                                  }
                                  s0 = s1;
                                  if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    if (input.substr(peg$currPos, 5).toLowerCase() === peg$c60) {
                                      s1 = input.substr(peg$currPos, 5);
                                      peg$currPos += 5;
                                    } else {
                                      s1 = peg$FAILED;
                                      if (peg$silentFails === 0) {
                                        peg$fail(peg$e64);
                                      }
                                    }
                                    if (s1 !== peg$FAILED) {
                                      peg$savedPos = s0;
                                      s1 = peg$f70();
                                    }
                                    s0 = s1;
                                    if (s0 === peg$FAILED) {
                                      s0 = peg$currPos;
                                      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c61) {
                                        s1 = input.substr(peg$currPos, 5);
                                        peg$currPos += 5;
                                      } else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                          peg$fail(peg$e65);
                                        }
                                      }
                                      if (s1 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s1 = peg$f71();
                                      }
                                      s0 = s1;
                                      if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c62) {
                                          s1 = input.substr(peg$currPos, 3);
                                          peg$currPos += 3;
                                        } else {
                                          s1 = peg$FAILED;
                                          if (peg$silentFails === 0) {
                                            peg$fail(peg$e66);
                                          }
                                        }
                                        if (s1 !== peg$FAILED) {
                                          peg$savedPos = s0;
                                          s1 = peg$f72();
                                        }
                                        s0 = s1;
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return s0;
    }
    function peg$parseVariable() {
      var s0, s1, s2, s3, s4;
      s0 = peg$currPos;
      s1 = peg$parseIdentifier();
      if (s1 !== peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 40) {
          s2 = peg$c26;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e28);
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = peg$parseExpressionList();
          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 41) {
              s4 = peg$c27;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e29);
              }
            }
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s0 = peg$f73(s1, s3);
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      if (s0 === peg$FAILED) {
        s0 = peg$currPos;
        s1 = peg$parseIdentifier();
        if (s1 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$f74(s1);
        }
        s0 = s1;
      }
      return s0;
    }
    function peg$parseIdentifier() {
      var s0, s1, s2, s3, s4;
      s0 = peg$currPos;
      s1 = peg$currPos;
      peg$silentFails++;
      s2 = peg$parseReservedWord();
      peg$silentFails--;
      if (s2 === peg$FAILED) {
        s1 = void 0;
      } else {
        peg$currPos = s1;
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        if (peg$r3.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e67);
          }
        }
        if (s2 !== peg$FAILED) {
          s3 = [];
          if (peg$r4.test(input.charAt(peg$currPos))) {
            s4 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s4 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e68);
            }
          }
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$r4.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e68);
              }
            }
          }
          peg$savedPos = s0;
          s0 = peg$f75(s2, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseReservedWord() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.substr(peg$currPos, 5).toLowerCase() === peg$c4) {
        s1 = input.substr(peg$currPos, 5);
        peg$currPos += 5;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e6);
        }
      }
      if (s1 === peg$FAILED) {
        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c7) {
          s1 = input.substr(peg$currPos, 3);
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e9);
          }
        }
        if (s1 === peg$FAILED) {
          if (input.substr(peg$currPos, 2).toLowerCase() === peg$c9) {
            s1 = input.substr(peg$currPos, 2);
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e11);
            }
          }
          if (s1 === peg$FAILED) {
            if (input.substr(peg$currPos, 4).toLowerCase() === peg$c10) {
              s1 = input.substr(peg$currPos, 4);
              peg$currPos += 4;
            } else {
              s1 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e12);
              }
            }
            if (s1 === peg$FAILED) {
              if (input.substr(peg$currPos, 3).toLowerCase() === peg$c11) {
                s1 = input.substr(peg$currPos, 3);
                peg$currPos += 3;
              } else {
                s1 = peg$FAILED;
                if (peg$silentFails === 0) {
                  peg$fail(peg$e13);
                }
              }
              if (s1 === peg$FAILED) {
                if (input.substr(peg$currPos, 2).toLowerCase() === peg$c12) {
                  s1 = input.substr(peg$currPos, 2);
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;
                  if (peg$silentFails === 0) {
                    peg$fail(peg$e14);
                  }
                }
                if (s1 === peg$FAILED) {
                  if (input.substr(peg$currPos, 4).toLowerCase() === peg$c14) {
                    s1 = input.substr(peg$currPos, 4);
                    peg$currPos += 4;
                  } else {
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                      peg$fail(peg$e16);
                    }
                  }
                  if (s1 === peg$FAILED) {
                    if (input.substr(peg$currPos, 4).toLowerCase() === peg$c15) {
                      s1 = input.substr(peg$currPos, 4);
                      peg$currPos += 4;
                    } else {
                      s1 = peg$FAILED;
                      if (peg$silentFails === 0) {
                        peg$fail(peg$e17);
                      }
                    }
                    if (s1 === peg$FAILED) {
                      if (input.substr(peg$currPos, 4).toLowerCase() === peg$c16) {
                        s1 = input.substr(peg$currPos, 4);
                        peg$currPos += 4;
                      } else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                          peg$fail(peg$e18);
                        }
                      }
                      if (s1 === peg$FAILED) {
                        if (input.substr(peg$currPos, 5).toLowerCase() === peg$c17) {
                          s1 = input.substr(peg$currPos, 5);
                          peg$currPos += 5;
                        } else {
                          s1 = peg$FAILED;
                          if (peg$silentFails === 0) {
                            peg$fail(peg$e19);
                          }
                        }
                        if (s1 === peg$FAILED) {
                          if (input.substr(peg$currPos, 6).toLowerCase() === peg$c18) {
                            s1 = input.substr(peg$currPos, 6);
                            peg$currPos += 6;
                          } else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                              peg$fail(peg$e20);
                            }
                          }
                          if (s1 === peg$FAILED) {
                            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c19) {
                              s1 = input.substr(peg$currPos, 3);
                              peg$currPos += 3;
                            } else {
                              s1 = peg$FAILED;
                              if (peg$silentFails === 0) {
                                peg$fail(peg$e21);
                              }
                            }
                            if (s1 === peg$FAILED) {
                              if (input.substr(peg$currPos, 5).toLowerCase() === peg$c21) {
                                s1 = input.substr(peg$currPos, 5);
                                peg$currPos += 5;
                              } else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                  peg$fail(peg$e23);
                                }
                              }
                              if (s1 === peg$FAILED) {
                                if (input.substr(peg$currPos, 4).toLowerCase() === peg$c22) {
                                  s1 = input.substr(peg$currPos, 4);
                                  peg$currPos += 4;
                                } else {
                                  s1 = peg$FAILED;
                                  if (peg$silentFails === 0) {
                                    peg$fail(peg$e24);
                                  }
                                }
                                if (s1 === peg$FAILED) {
                                  if (input.substr(peg$currPos, 4).toLowerCase() === peg$c23) {
                                    s1 = input.substr(peg$currPos, 4);
                                    peg$currPos += 4;
                                  } else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                      peg$fail(peg$e25);
                                    }
                                  }
                                  if (s1 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 7).toLowerCase() === peg$c24) {
                                      s1 = input.substr(peg$currPos, 7);
                                      peg$currPos += 7;
                                    } else {
                                      s1 = peg$FAILED;
                                      if (peg$silentFails === 0) {
                                        peg$fail(peg$e26);
                                      }
                                    }
                                    if (s1 === peg$FAILED) {
                                      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c25) {
                                        s1 = input.substr(peg$currPos, 3);
                                        peg$currPos += 3;
                                      } else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                          peg$fail(peg$e27);
                                        }
                                      }
                                      if (s1 === peg$FAILED) {
                                        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c28) {
                                          s1 = input.substr(peg$currPos, 3);
                                          peg$currPos += 3;
                                        } else {
                                          s1 = peg$FAILED;
                                          if (peg$silentFails === 0) {
                                            peg$fail(peg$e30);
                                          }
                                        }
                                        if (s1 === peg$FAILED) {
                                          if (input.substr(peg$currPos, 3).toLowerCase() === peg$c29) {
                                            s1 = input.substr(peg$currPos, 3);
                                            peg$currPos += 3;
                                          } else {
                                            s1 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                              peg$fail(peg$e33);
                                            }
                                          }
                                          if (s1 === peg$FAILED) {
                                            if (input.substr(peg$currPos, 5).toLowerCase() === peg$c30) {
                                              s1 = input.substr(peg$currPos, 5);
                                              peg$currPos += 5;
                                            } else {
                                              s1 = peg$FAILED;
                                              if (peg$silentFails === 0) {
                                                peg$fail(peg$e34);
                                              }
                                            }
                                            if (s1 === peg$FAILED) {
                                              if (input.substr(peg$currPos, 3).toLowerCase() === peg$c32) {
                                                s1 = input.substr(peg$currPos, 3);
                                                peg$currPos += 3;
                                              } else {
                                                s1 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                  peg$fail(peg$e36);
                                                }
                                              }
                                              if (s1 === peg$FAILED) {
                                                if (input.substr(peg$currPos, 2).toLowerCase() === peg$c31) {
                                                  s1 = input.substr(peg$currPos, 2);
                                                  peg$currPos += 2;
                                                } else {
                                                  s1 = peg$FAILED;
                                                  if (peg$silentFails === 0) {
                                                    peg$fail(peg$e35);
                                                  }
                                                }
                                                if (s1 === peg$FAILED) {
                                                  if (input.substr(peg$currPos, 3).toLowerCase() === peg$c45) {
                                                    s1 = input.substr(peg$currPos, 3);
                                                    peg$currPos += 3;
                                                  } else {
                                                    s1 = peg$FAILED;
                                                    if (peg$silentFails === 0) {
                                                      peg$fail(peg$e49);
                                                    }
                                                  }
                                                  if (s1 === peg$FAILED) {
                                                    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c46) {
                                                      s1 = input.substr(peg$currPos, 3);
                                                      peg$currPos += 3;
                                                    } else {
                                                      s1 = peg$FAILED;
                                                      if (peg$silentFails === 0) {
                                                        peg$fail(peg$e50);
                                                      }
                                                    }
                                                    if (s1 === peg$FAILED) {
                                                      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c47) {
                                                        s1 = input.substr(peg$currPos, 3);
                                                        peg$currPos += 3;
                                                      } else {
                                                        s1 = peg$FAILED;
                                                        if (peg$silentFails === 0) {
                                                          peg$fail(peg$e51);
                                                        }
                                                      }
                                                      if (s1 === peg$FAILED) {
                                                        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c48) {
                                                          s1 = input.substr(peg$currPos, 3);
                                                          peg$currPos += 3;
                                                        } else {
                                                          s1 = peg$FAILED;
                                                          if (peg$silentFails === 0) {
                                                            peg$fail(peg$e52);
                                                          }
                                                        }
                                                        if (s1 === peg$FAILED) {
                                                          if (input.substr(peg$currPos, 3).toLowerCase() === peg$c49) {
                                                            s1 = input.substr(peg$currPos, 3);
                                                            peg$currPos += 3;
                                                          } else {
                                                            s1 = peg$FAILED;
                                                            if (peg$silentFails === 0) {
                                                              peg$fail(peg$e53);
                                                            }
                                                          }
                                                          if (s1 === peg$FAILED) {
                                                            if (input.substr(peg$currPos, 3).toLowerCase() === peg$c50) {
                                                              s1 = input.substr(peg$currPos, 3);
                                                              peg$currPos += 3;
                                                            } else {
                                                              s1 = peg$FAILED;
                                                              if (peg$silentFails === 0) {
                                                                peg$fail(peg$e54);
                                                              }
                                                            }
                                                            if (s1 === peg$FAILED) {
                                                              if (input.substr(peg$currPos, 3).toLowerCase() === peg$c53) {
                                                                s1 = input.substr(peg$currPos, 3);
                                                                peg$currPos += 3;
                                                              } else {
                                                                s1 = peg$FAILED;
                                                                if (peg$silentFails === 0) {
                                                                  peg$fail(peg$e57);
                                                                }
                                                              }
                                                              if (s1 === peg$FAILED) {
                                                                if (input.substr(peg$currPos, 3).toLowerCase() === peg$c56) {
                                                                  s1 = input.substr(peg$currPos, 3);
                                                                  peg$currPos += 3;
                                                                } else {
                                                                  s1 = peg$FAILED;
                                                                  if (peg$silentFails === 0) {
                                                                    peg$fail(peg$e60);
                                                                  }
                                                                }
                                                                if (s1 === peg$FAILED) {
                                                                  if (input.substr(peg$currPos, 3).toLowerCase() === peg$c57) {
                                                                    s1 = input.substr(peg$currPos, 3);
                                                                    peg$currPos += 3;
                                                                  } else {
                                                                    s1 = peg$FAILED;
                                                                    if (peg$silentFails === 0) {
                                                                      peg$fail(peg$e61);
                                                                    }
                                                                  }
                                                                  if (s1 === peg$FAILED) {
                                                                    if (input.substr(peg$currPos, 3).toLowerCase() === peg$c58) {
                                                                      s1 = input.substr(peg$currPos, 3);
                                                                      peg$currPos += 3;
                                                                    } else {
                                                                      s1 = peg$FAILED;
                                                                      if (peg$silentFails === 0) {
                                                                        peg$fail(peg$e62);
                                                                      }
                                                                    }
                                                                    if (s1 === peg$FAILED) {
                                                                      if (input.substr(peg$currPos, 3).toLowerCase() === peg$c59) {
                                                                        s1 = input.substr(peg$currPos, 3);
                                                                        peg$currPos += 3;
                                                                      } else {
                                                                        s1 = peg$FAILED;
                                                                        if (peg$silentFails === 0) {
                                                                          peg$fail(peg$e63);
                                                                        }
                                                                      }
                                                                      if (s1 === peg$FAILED) {
                                                                        if (input.substr(peg$currPos, 3).toLowerCase() === peg$c62) {
                                                                          s1 = input.substr(peg$currPos, 3);
                                                                          peg$currPos += 3;
                                                                        } else {
                                                                          s1 = peg$FAILED;
                                                                          if (peg$silentFails === 0) {
                                                                            peg$fail(peg$e66);
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$currPos;
        peg$silentFails++;
        if (peg$r4.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e68);
          }
        }
        peg$silentFails--;
        if (s3 === peg$FAILED) {
          s2 = void 0;
        } else {
          peg$currPos = s2;
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          s1 = [s1, s2];
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseNumberLiteral() {
      var s0, s1;
      s0 = peg$currPos;
      s1 = peg$parseNumber();
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f76(s1);
      }
      s0 = s1;
      return s0;
    }
    function peg$parseNumber() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      s1 = peg$parseInteger();
      if (s1 !== peg$FAILED) {
        s2 = peg$parseFraction();
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        s3 = peg$parseExponent();
        if (s3 === peg$FAILED) {
          s3 = null;
        }
        peg$savedPos = s0;
        s0 = peg$f77(s1, s2, s3);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseInteger() {
      var s0, s1, s2;
      s0 = peg$currPos;
      s1 = [];
      if (peg$r1.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e4);
        }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$r1.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e4);
            }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f78(s1);
      }
      s0 = s1;
      return s0;
    }
    function peg$parseFraction() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 46) {
        s1 = peg$c63;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e69);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$r1.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e4);
          }
        }
        if (s3 !== peg$FAILED) {
          while (s3 !== peg$FAILED) {
            s2.push(s3);
            if (peg$r1.test(input.charAt(peg$currPos))) {
              s3 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s3 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e4);
              }
            }
          }
        } else {
          s2 = peg$FAILED;
        }
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f79(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseExponent() {
      var s0, s1, s2, s3, s4;
      s0 = peg$currPos;
      if (peg$r5.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e70);
        }
      }
      if (s1 !== peg$FAILED) {
        if (peg$r6.test(input.charAt(peg$currPos))) {
          s2 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s2 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e71);
          }
        }
        if (s2 === peg$FAILED) {
          s2 = null;
        }
        s3 = [];
        if (peg$r1.test(input.charAt(peg$currPos))) {
          s4 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s4 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e4);
          }
        }
        if (s4 !== peg$FAILED) {
          while (s4 !== peg$FAILED) {
            s3.push(s4);
            if (peg$r1.test(input.charAt(peg$currPos))) {
              s4 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s4 = peg$FAILED;
              if (peg$silentFails === 0) {
                peg$fail(peg$e4);
              }
            }
          }
        } else {
          s3 = peg$FAILED;
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f80(s2, s3);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseStringLiteral() {
      var s0, s1, s2, s3;
      s0 = peg$currPos;
      if (input.charCodeAt(peg$currPos) === 34) {
        s1 = peg$c64;
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e72);
        }
      }
      if (s1 !== peg$FAILED) {
        s2 = [];
        if (peg$r7.test(input.charAt(peg$currPos))) {
          s3 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e73);
          }
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          if (peg$r7.test(input.charAt(peg$currPos))) {
            s3 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e73);
            }
          }
        }
        if (input.charCodeAt(peg$currPos) === 34) {
          s3 = peg$c64;
          peg$currPos++;
        } else {
          s3 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e72);
          }
        }
        if (s3 !== peg$FAILED) {
          peg$savedPos = s0;
          s0 = peg$f81(s2);
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseConstant() {
      var s0;
      s0 = peg$parseNumberLiteral();
      if (s0 === peg$FAILED) {
        s0 = peg$parseStringLiteral();
      }
      return s0;
    }
    function peg$parseinvalidCommand() {
      var s0, s1, s2;
      s0 = peg$currPos;
      s1 = [];
      if (peg$r3.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e67);
        }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$r3.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e67);
            }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$f82(s1);
      }
      s0 = s1;
      return s0;
    }
    function peg$parseExpressionList() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parselogicalOr();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 44) {
          s5 = peg$c5;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e7);
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parselogicalOr();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f83(s1, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c5;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parselogicalOr();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f83(s1, s7);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f84(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parseVariableList() {
      var s0, s1, s2, s3, s4, s5, s6, s7;
      s0 = peg$currPos;
      s1 = peg$parseVariable();
      if (s1 !== peg$FAILED) {
        s2 = [];
        s3 = peg$currPos;
        s4 = peg$parse_();
        if (input.charCodeAt(peg$currPos) === 44) {
          s5 = peg$c5;
          peg$currPos++;
        } else {
          s5 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e7);
          }
        }
        if (s5 !== peg$FAILED) {
          s6 = peg$parse_();
          s7 = peg$parseVariable();
          if (s7 !== peg$FAILED) {
            peg$savedPos = s3;
            s3 = peg$f85(s1, s7);
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        } else {
          peg$currPos = s3;
          s3 = peg$FAILED;
        }
        while (s3 !== peg$FAILED) {
          s2.push(s3);
          s3 = peg$currPos;
          s4 = peg$parse_();
          if (input.charCodeAt(peg$currPos) === 44) {
            s5 = peg$c5;
            peg$currPos++;
          } else {
            s5 = peg$FAILED;
            if (peg$silentFails === 0) {
              peg$fail(peg$e7);
            }
          }
          if (s5 !== peg$FAILED) {
            s6 = peg$parse_();
            s7 = peg$parseVariable();
            if (s7 !== peg$FAILED) {
              peg$savedPos = s3;
              s3 = peg$f85(s1, s7);
            } else {
              peg$currPos = s3;
              s3 = peg$FAILED;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$FAILED;
          }
        }
        peg$savedPos = s0;
        s0 = peg$f86(s1, s2);
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }
      return s0;
    }
    function peg$parse_() {
      var s0, s1;
      s0 = [];
      if (peg$r8.test(input.charAt(peg$currPos))) {
        s1 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) {
          peg$fail(peg$e74);
        }
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        if (peg$r8.test(input.charAt(peg$currPos))) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;
          if (peg$silentFails === 0) {
            peg$fail(peg$e74);
          }
        }
      }
      return s0;
    }
    const keywords = {
      // Control Flow
      IF: "IF",
      THEN: "THEN",
      ELSE: "ELSE",
      FOR: "FOR",
      NEXT: "NEXT",
      TO: "TO",
      STEP: "STEP",
      GOTO: "GOTO",
      GOSUB: "GOSUB",
      RETURN: "RETURN",
      END: "END",
      STOP: "STOP",
      PAUSE: "PAUSE",
      // Data and Variables
      LET: "LET",
      DIM: "DIM",
      DATA: "DATA",
      READ: "READ",
      RESTORE: "RESTORE",
      // Input/Output
      PRINT: "PRINT",
      INPUT: "INPUT",
      // Functions
      DEF: "DEF",
      FN: "FN",
      // Mathematical Functions
      ABS: "ABS",
      ATN: "ATN",
      COS: "COS",
      EXP: "EXP",
      FIX: "FIX",
      INT: "INT",
      LOG: "LOG",
      RND: "RND",
      SGN: "SGN",
      SIN: "SIN",
      SQR: "SQR",
      TAN: "TAN",
      // Graphics (Basic)
      CLS: "CLS",
      COLOR: "COLOR",
      PSET: "PSET",
      LINE: "LINE",
      CIRCLE: "CIRCLE",
      PAINT: "PAINT",
      // Comments
      REM: "REM"
    };
    peg$result = peg$startRuleFunction();
    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail(peg$endExpectation());
      }
      throw peg$buildStructuredError(
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1) : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }
  var init_fbasic_parser = __esm({
    "src/core/parser/fbasic-parser.js"() {
      "use strict";
      peg$subclass(peg$SyntaxError, Error);
      peg$SyntaxError.prototype.format = function(sources) {
        var str = "Error: " + this.message;
        if (this.location) {
          var src = null;
          var k;
          for (k = 0; k < sources.length; k++) {
            if (sources[k].source === this.location.source) {
              src = sources[k].text.split(/\r\n|\n|\r/g);
              break;
            }
          }
          var s = this.location.start;
          var offset_s = this.location.source && typeof this.location.source.offset === "function" ? this.location.source.offset(s) : s;
          var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
          if (src) {
            var e = this.location.end;
            var filler = peg$padEnd("", offset_s.line.toString().length, " ");
            var line = src[s.line - 1];
            var last = s.line === e.line ? e.column : line.length + 1;
            var hatLen = last - s.column || 1;
            str += "\n --> " + loc + "\n" + filler + " |\n" + offset_s.line + " | " + line + "\n" + filler + " | " + peg$padEnd("", s.column - 1, " ") + peg$padEnd("", hatLen, "^");
          } else {
            str += "\n at " + loc;
          }
        }
        return str;
      };
      peg$SyntaxError.buildMessage = function(expected, found) {
        var DESCRIBE_EXPECTATION_FNS = {
          literal: function(expectation) {
            return '"' + literalEscape(expectation.text) + '"';
          },
          class: function(expectation) {
            var escapedParts = expectation.parts.map(function(part) {
              return Array.isArray(part) ? classEscape(part[0]) + "-" + classEscape(part[1]) : classEscape(part);
            });
            return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
          },
          any: function() {
            return "any character";
          },
          end: function() {
            return "end of input";
          },
          other: function(expectation) {
            return expectation.description;
          }
        };
        function hex(ch) {
          return ch.charCodeAt(0).toString(16).toUpperCase();
        }
        function literalEscape(s) {
          return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
            return "\\x0" + hex(ch);
          }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
            return "\\x" + hex(ch);
          });
        }
        function classEscape(s) {
          return s.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(ch) {
            return "\\x0" + hex(ch);
          }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(ch) {
            return "\\x" + hex(ch);
          });
        }
        function describeExpectation(expectation) {
          return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
        }
        function describeExpected(expected2) {
          var descriptions = expected2.map(describeExpectation);
          var i, j;
          descriptions.sort();
          if (descriptions.length > 0) {
            for (i = 1, j = 1; i < descriptions.length; i++) {
              if (descriptions[i - 1] !== descriptions[i]) {
                descriptions[j] = descriptions[i];
                j++;
              }
            }
            descriptions.length = j;
          }
          switch (descriptions.length) {
            case 1:
              return descriptions[0];
            case 2:
              return descriptions[0] + " or " + descriptions[1];
            default:
              return descriptions.slice(0, -1).join(", ") + ", or " + descriptions[descriptions.length - 1];
          }
        }
        function describeFound(found2) {
          return found2 ? '"' + literalEscape(found2) + '"' : "end of input";
        }
        return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
      };
    }
  });

  // src/core/constants.ts
  var EXECUTION_LIMITS = {
    // Test environment limits (strict to prevent infinite loops in tests)
    MAX_ITERATIONS_TEST: 1e4,
    MAX_OUTPUT_LINES_TEST: 1e3,
    // Production environment limits (more permissive for real user interaction)
    MAX_ITERATIONS_PRODUCTION: 1e6,
    // Much higher limit for production
    MAX_OUTPUT_LINES_PRODUCTION: 1e4,
    // Legacy limits (for backward compatibility)
    MAX_ITERATIONS: 1e4,
    MAX_OUTPUT_LINES: 1e3,
    // Other limits (same for both environments)
    MAX_LINE_NUMBER: 99999,
    MAX_VARIABLE_NAME_LENGTH: 255,
    MAX_STRING_LENGTH: 32767
  };
  var DEFAULTS = {
    FOR_LOOP_STEP: 1,
    TAB_SIZE: 2,
    MAX_OUTPUT_LINES: 1e3,
    ASYNC_EXECUTION: {
      ENABLED_PRODUCTION: true,
      ENABLED_TEST: false,
      YIELD_INTERVAL: 100,
      // Yield every 100 iterations in production
      YIELD_DURATION: 1
      // Yield for 1ms to allow browser to process events
    },
    SERVICE_WORKER: {
      ENABLED_PRODUCTION: true,
      ENABLED_TEST: false,
      WORKER_SCRIPT: "/basic-interpreter-worker.js",
      MESSAGE_TIMEOUT: 3e4
      // 30 seconds timeout for service worker messages
    }
  };
  var ERROR_TYPES = {
    SYNTAX: "SYNTAX",
    RUNTIME: "RUNTIME",
    COMPILATION: "COMPILATION"
  };

  // src/core/parser/FBasicParser.ts
  var FBasicParser = class {
    constructor() {
      __publicField(this, "parser", null);
      this.initializeParser();
    }
    /**
     * Initialize the parser from the generated parser file
     */
    async initializeParser() {
      try {
        const parserModule = await Promise.resolve().then(() => (init_fbasic_parser(), fbasic_parser_exports));
        this.parser = parserModule.parse;
        console.log("Generated parser loaded successfully");
      } catch {
        console.warn("Generated parser not found. Using fallback parser.");
        console.log("Using fallback parser");
        this.parser = this.createFallbackParser();
      }
    }
    /**
     * Create a fallback parser for development
     */
    createFallbackParser() {
      return (source) => {
        const lines = source.split("\n").filter((line) => line.trim());
        const statements = [];
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;
          const lineNumberMatch = trimmedLine.match(/^(\d+)/);
          if (!lineNumberMatch) continue;
          const lineNumber = parseInt(lineNumberMatch[1], 10);
          const commandText = trimmedLine.substring(lineNumberMatch[1].length).trim();
          const command = this.parseCommand(commandText);
          if (command) {
            statements.push({
              type: "Statement",
              lineNumber,
              command
            });
          }
        }
        return {
          type: "Program",
          statements
        };
      };
    }
    /**
     * Parse a command string into a command node
     */
    parseCommand(commandText) {
      const upperCommand = commandText.toUpperCase();
      if (upperCommand.startsWith("PRINT")) {
        return {
          type: "PrintStatement",
          printList: []
        };
      } else if (upperCommand.startsWith("LET")) {
        return {
          type: "LetStatement",
          variable: { type: "Variable", name: "A", subscript: null },
          expression: { type: "NumberLiteral", value: 0 },
          hasLetKeyword: true
        };
      } else if (upperCommand.startsWith("IF")) {
        return {
          type: "IfStatement",
          condition: { type: "NumberLiteral", value: 1 },
          thenStatement: { type: "EndStatement" }
        };
      } else if (upperCommand.startsWith("FOR")) {
        return {
          type: "ForStatement",
          variable: { type: "Variable", name: "I", subscript: null },
          start: { type: "NumberLiteral", value: 1 },
          end: { type: "NumberLiteral", value: 10 },
          step: { type: "NumberLiteral", value: 1 }
        };
      } else if (upperCommand.startsWith("NEXT")) {
        return {
          type: "NextStatement",
          variable: { type: "Variable", name: "I", subscript: null }
        };
      } else if (upperCommand.startsWith("GOTO")) {
        return {
          type: "GotoStatement",
          target: { type: "NumberLiteral", value: 100 }
        };
      } else if (upperCommand.startsWith("GOSUB")) {
        return {
          type: "GosubStatement",
          target: { type: "NumberLiteral", value: 100 }
        };
      } else if (upperCommand.startsWith("RETURN")) {
        return { type: "ReturnStatement" };
      } else if (upperCommand.startsWith("END")) {
        return { type: "EndStatement" };
      } else if (upperCommand.startsWith("REM")) {
        return {
          type: "RemStatement",
          comment: commandText.substring(3).trim()
        };
      } else if (upperCommand.startsWith("CLS")) {
        return { type: "ClsStatement" };
      }
      return null;
    }
    /**
     * Parse F-Basic source code into an AST
     * 
     * @param source - The F-Basic source code to parse
     * @returns Parse result with AST or errors
     */
    async parse(source) {
      try {
        if (!this.parser) {
          await this.initializeParser();
        }
        if (!this.parser) {
          throw new Error("Failed to initialize parser");
        }
        const ast = this.parser(source);
        return {
          success: true,
          ast
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Parse error";
        return {
          success: false,
          errors: [{
            message: errorMessage,
            location: {
              start: { offset: 0, line: 1, column: 1 },
              end: { offset: 0, line: 1, column: 1 }
            }
          }]
        };
      }
    }
    /**
     * Parse a single statement
     * 
     * @param statementText - The statement text to parse
     * @returns Parsed statement or null
     */
    async parseStatement(statementText) {
      const result = await this.parse(statementText);
      if (result.success && result.ast && result.ast.statements.length > 0) {
        return result.ast.statements[0] || null;
      }
      return null;
    }
    /**
     * Parse an expression
     * 
     * @param expressionText - The expression text to parse
     * @returns Parsed expression or null
     */
    async parseExpression(expressionText) {
      const trimmed = expressionText.trim();
      if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
        return {
          type: "NumberLiteral",
          value: parseFloat(trimmed)
        };
      }
      if (/^"[^"]*"$/.test(trimmed)) {
        return {
          type: "StringLiteral",
          value: trimmed.slice(1, -1)
        };
      }
      if (/^[A-Za-z][A-Za-z0-9$]*$/.test(trimmed)) {
        return {
          type: "Variable",
          name: trimmed.toUpperCase(),
          subscript: null
        };
      }
      return null;
    }
    /**
     * Validate parsed AST
     * 
     * @param ast - The AST to validate
     * @returns Array of validation errors
     */
    validateAST(ast) {
      const errors = [];
      for (const statement of ast.statements) {
        if (statement.lineNumber < 1 || statement.lineNumber > 65535) {
          errors.push({
            message: "Line number must be between 1 and 65535",
            location: {
              start: { offset: 0, line: 1, column: 1 },
              end: { offset: 0, line: 1, column: 1 }
            }
          });
        }
      }
      return errors;
    }
    /**
     * Get parser version and capabilities
     */
    getParserInfo() {
      return {
        name: "F-Basic Parser",
        version: "1.0.0",
        capabilities: [
          "Complete F-Basic syntax support",
          "280+ keywords including gaming APIs",
          "Sprite and animation commands",
          "Character generator commands",
          "Sound and music commands",
          "Input handling commands",
          "Tile-based graphics commands",
          "Collision detection commands",
          "Advanced graphics commands",
          "System commands"
        ],
        features: ["ast-parsing", "error-reporting", "multi-statement"],
        supportedStatements: ["PRINT", "LET", "IF", "FOR", "NEXT", "GOTO", "GOSUB", "RETURN", "END", "REM", "CLS", "DATA", "READ", "RESTORE", "DIM", "COLOR"],
        supportedFunctions: ["ABS", "SQR", "SIN", "COS", "TAN", "ATN", "LOG", "EXP", "INT", "FIX", "SGN", "RND", "LEN", "LEFT", "RIGHT", "MID"],
        supportedOperators: ["+", "-", "*", "/", "^", "MOD", "=", "<>", "<", ">", "<=", ">=", "AND", "OR", "NOT"]
      };
    }
  };

  // src/core/state/ExecutionContext.ts
  var ExecutionContext = class {
    constructor(config) {
      // Core state
      __publicField(this, "variables", /* @__PURE__ */ new Map());
      __publicField(this, "isRunning", false);
      __publicField(this, "shouldStop", false);
      __publicField(this, "currentStatementIndex", 0);
      __publicField(this, "statements", []);
      __publicField(this, "iterationCount", 0);
      // Configuration
      __publicField(this, "config");
      // Control flow
      __publicField(this, "loopStack", []);
      __publicField(this, "gosubStack", []);
      // Stack for GOSUB/RETURN
      // Data management
      __publicField(this, "dataValues", []);
      // Storage for DATA values
      __publicField(this, "dataIndex", 0);
      // Current position in DATA
      __publicField(this, "arrays", /* @__PURE__ */ new Map());
      // Array storage
      // Device integration
      __publicField(this, "deviceAdapter");
      __publicField(this, "errors", []);
      this.config = config;
    }
    /**
     * Reset the execution context to initial state
     */
    reset() {
      this.variables.clear();
      this.isRunning = false;
      this.shouldStop = false;
      this.currentStatementIndex = 0;
      this.statements = [];
      this.iterationCount = 0;
      this.loopStack = [];
      this.gosubStack = [];
      this.dataValues = [];
      this.dataIndex = 0;
      this.arrays.clear();
    }
    /**
     * Add output to the context
     */
    addOutput(value) {
      this.deviceAdapter?.printOutput(value);
    }
    /**
     * Add error to the context
     */
    addError(error) {
      this.deviceAdapter?.errorOutput(error.message);
      this.errors.push(error);
    }
    /**
     * Get errors
     */
    getErrors() {
      return this.errors;
    }
    /**
     * Add debug output
     */
    addDebugOutput(message) {
      if (this.config.enableDebugMode) {
        this.deviceAdapter?.debugOutput(message);
      }
    }
    /**
     * Check if execution should continue
     */
    shouldContinue() {
      return this.isRunning && !this.shouldStop && this.iterationCount < this.config.maxIterations && this.currentStatementIndex < this.statements.length;
    }
    /**
     * Increment iteration count and check limits
     */
    incrementIteration() {
      this.iterationCount++;
      if (this.iterationCount >= this.config.maxIterations) {
        this.addError({
          line: 0,
          message: "Maximum iterations exceeded",
          type: ERROR_TYPES.RUNTIME
        });
        this.shouldStop = true;
      }
    }
    /**
     * Get current statement
     */
    getCurrentStatement() {
      return this.statements[this.currentStatementIndex];
    }
    /**
     * Move to next statement
     */
    nextStatement() {
      this.currentStatementIndex++;
    }
    /**
     * Jump to statement by index
     */
    jumpToStatement(index) {
      this.currentStatementIndex = index;
    }
    /**
     * Find statement index by line number
     */
    findStatementIndexByLine(lineNumber) {
      return this.statements.findIndex((stmt) => stmt.lineNumber === lineNumber);
    }
    /**
     * Get joystick state (cross buttons)
     */
    getStickState(joystickId) {
      if (this.deviceAdapter) {
        return this.deviceAdapter.getStickState(joystickId);
      }
      return 0;
    }
    /**
     * Get trigger state (action buttons)
     */
    consumeStrigState(joystickId) {
      if (this.deviceAdapter) {
        const consumedValue = this.deviceAdapter.consumeStrigState(joystickId);
        if (consumedValue > 0) {
          console.log(`\u{1F3AE} [EXECUTION] STRIG event consumed: joystickId=${joystickId}, value=${consumedValue}`);
          return consumedValue;
        }
      }
      return 0;
    }
  };

  // src/core/evaluation/ExpressionEvaluator.ts
  var ExpressionEvaluator = class {
    constructor(context) {
      this.context = context;
    }
    /**
     * Evaluate a BASIC expression
     */
    evaluateExpression(expr) {
      switch (expr.type) {
        case "Expression":
          return this.evaluateExpression(expr.expression);
        case "NumberLiteral":
          return expr.value;
        case "StringLiteral":
          return expr.value;
        case "Variable": {
          if (expr.subscript) {
            const array = this.context.arrays.get(expr.name);
            if (array) {
              const indices = expr.subscript.map((index) => this.evaluateExpression(index));
              let value = array;
              for (const index of indices) {
                const numIndex = this.toNumber(index);
                if (Array.isArray(value)) {
                  const element = value[Math.floor(numIndex)];
                  if (element !== void 0) {
                    value = element;
                  } else {
                    return 0;
                  }
                } else {
                  return 0;
                }
              }
              return typeof value !== "object" ? value : 0;
            }
            return 0;
          } else {
            const variable = this.context.variables.get(expr.name);
            return variable ? variable.value : 0;
          }
        }
        case "BinaryExpression": {
          const left = this.evaluateExpression(expr.left);
          const right = this.evaluateExpression(expr.right);
          const leftNum = typeof left === "number" ? left : typeof left === "boolean" ? left ? 1 : 0 : 0;
          const rightNum = typeof right === "number" ? right : typeof right === "boolean" ? right ? 1 : 0 : 0;
          switch (expr.operator) {
            case "+":
              if (typeof left === "string" || typeof right === "string") {
                return String(left) + String(right);
              }
              return leftNum + rightNum;
            case "-":
              return leftNum - rightNum;
            case "*":
              return leftNum * rightNum;
            case "/":
              return rightNum !== 0 ? leftNum / rightNum : 0;
            case "MOD":
              return rightNum !== 0 ? leftNum % rightNum : 0;
            case "^":
              return Math.pow(leftNum, rightNum);
            case "=":
              return left === right ? 1 : 0;
            case "<>":
              return left !== right ? 1 : 0;
            case "<":
              return leftNum < rightNum ? 1 : 0;
            case ">":
              return leftNum > rightNum ? 1 : 0;
            case "<=":
              return leftNum <= rightNum ? 1 : 0;
            case ">=":
              return leftNum >= rightNum ? 1 : 0;
            case "AND":
              return left && right ? 1 : 0;
            case "OR":
              return left || right ? 1 : 0;
            default:
              return 0;
          }
        }
        case "UnaryExpression": {
          const operand = this.evaluateExpression(expr.operand);
          switch (expr.operator) {
            case "-":
              return -this.toNumber(operand);
            case "NOT":
              return !operand ? 1 : 0;
            default:
              return operand;
          }
        }
        case "FunctionCall":
          return this.evaluateFunctionCall(expr);
        default:
          return 0;
      }
    }
    /**
     * Evaluate a function call
     */
    evaluateFunctionCall(funcCall) {
      const args = funcCall.arguments.map((arg) => {
        return this.evaluateExpression(arg);
      });
      switch (funcCall.name) {
        // Mathematical functions
        case "ABS":
          return Math.abs(this.toNumber(args[0] || 0));
        case "SQR":
          return Math.sqrt(this.toNumber(args[0] || 0));
        case "SIN":
          return Math.sin(this.toNumber(args[0] || 0));
        case "COS":
          return Math.cos(this.toNumber(args[0] || 0));
        case "TAN":
          return Math.tan(this.toNumber(args[0] || 0));
        case "ATN":
          return Math.atan(this.toNumber(args[0] || 0));
        case "LOG":
          return Math.log(this.toNumber(args[0] || 0));
        case "EXP":
          return Math.exp(this.toNumber(args[0] || 0));
        case "INT": {
          const intValue = this.toNumber(args[0] || 0);
          return intValue >= 0 ? Math.floor(intValue) : Math.ceil(intValue);
        }
        case "FIX":
          return Math.trunc(this.toNumber(args[0] || 0));
        case "SGN":
          return Math.sign(this.toNumber(args[0] || 0));
        case "RND":
          return Math.random();
        // String functions
        case "LEN": {
          const str = args[0];
          return typeof str === "string" ? str.length : 0;
        }
        case "LEFT": {
          const str = args[0];
          const count = this.toNumber(args[1] || 0);
          if (typeof str !== "string") return "";
          return str.substring(0, Math.max(0, count));
        }
        case "RIGHT": {
          const str = args[0];
          const count = this.toNumber(args[1] || 0);
          if (typeof str !== "string") return "";
          return str.substring(Math.max(0, str.length - count));
        }
        case "MID": {
          const str = args[0];
          const start = this.toNumber(args[1] || 0);
          const count = this.toNumber(args[2] || 0);
          if (typeof str !== "string") return "";
          const startIndex = Math.max(0, start - 1);
          return str.substring(startIndex, startIndex + count);
        }
        // Joystick functions (Family BASIC v3)
        case "STICK": {
          const joystickId = this.toNumber(args[0] || 0);
          return this.context.deviceAdapter?.getStickState(joystickId) || 0;
        }
        case "STRIG": {
          const joystickId = this.toNumber(args[0] || 0);
          return this.context.deviceAdapter?.consumeStrigState(joystickId) || 0;
        }
        default:
          return 0;
      }
    }
    /**
     * Convert a value to a number
     */
    toNumber(value) {
      if (typeof value === "number") return value;
      if (typeof value === "boolean") return value ? 1 : 0;
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    }
  };

  // src/core/services/IoService.ts
  var IoService = class {
    constructor(context, evaluator, deviceAdapter) {
      this.context = context;
      this.evaluator = evaluator;
      this.deviceAdapter = deviceAdapter;
    }
    /**
     * Print values to output
     */
    printValues(expressions) {
      let output = "";
      for (let i = 0; i < expressions.length; i++) {
        const expr = expressions[i];
        let actualExpr;
        let separator;
        const hasSeparator = (obj) => {
          return obj !== null && typeof obj === "object" && "item" in obj && "separator" in obj;
        };
        if (hasSeparator(expr)) {
          actualExpr = expr.item;
          separator = expr.separator;
        } else {
          actualExpr = expr;
          separator = void 0;
        }
        const value = this.evaluator.evaluateExpression(actualExpr);
        const formatted = this.formatValue(value);
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`PRINT: evaluating expression ${JSON.stringify(actualExpr)} = ${value}, separator: ${separator}`);
        }
        if (separator === ";") {
          output += formatted;
        } else if (separator === ",") {
          if (output.length > 0) {
            output += " " + formatted;
          } else {
            output += formatted;
          }
        } else {
          output += formatted;
        }
      }
      this.context.addOutput(output);
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`PRINT: ${output}`);
      }
    }
    /**
     * Print a single value
     */
    printValue(expression) {
      const value = this.evaluator.evaluateExpression(expression);
      const formatted = this.formatValue(value);
      this.context.addOutput(formatted);
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`PRINT: ${formatted}`);
      }
    }
    /**
     * Clear the screen (output)
     */
    clearScreen() {
      this.context.deviceAdapter?.clearScreen();
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput("CLS: Screen cleared");
      }
    }
    /**
     * Handle INPUT statement (placeholder for now)
     */
    inputValue(prompt) {
      const message = prompt ? `INPUT: ${prompt}` : "INPUT: Waiting for user input";
      this.context.addOutput(message);
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(message);
      }
    }
    /**
     * Format a value for output
     */
    formatValue(value) {
      if (typeof value === "string") {
        return value;
      } else if (typeof value === "boolean") {
        return value ? "1" : "0";
      } else if (typeof value === "number") {
        if (Number.isInteger(value)) {
          return value.toString();
        } else {
          return value.toString();
        }
      }
      return "0";
    }
    /**
     * Add raw output
     */
    addRawOutput(text) {
      this.context.addOutput(text);
    }
  };

  // src/core/execution/executors/PrintExecutor.ts
  var PrintExecutor = class {
    constructor(ioService) {
      this.ioService = ioService;
    }
    /**
     * Execute a PRINT statement
     */
    execute(printStmt) {
      this.ioService.printValues(printStmt.printList || []);
    }
  };

  // src/core/services/VariableService.ts
  var VariableService = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Get a variable value
     */
    getVariable(name) {
      return this.context.variables.get(name);
    }
    /**
     * Set a simple variable value
     */
    setVariable(name, value) {
      const variable = {
        value,
        type: typeof value === "string" ? "string" : "number"
      };
      this.context.variables.set(name, variable);
    }
    /**
     * Set a variable from an expression
     */
    setVariableFromExpression(name, expression) {
      const value = this.evaluator.evaluateExpression(expression);
      const basicValue = typeof value === "boolean" ? value ? 1 : 0 : value;
      this.setVariable(name, basicValue);
    }
    /**
     * Set an array element
     */
    setArrayElement(name, indices, value) {
      let array = this.context.arrays.get(name);
      if (!array) {
        array = [];
        this.context.arrays.set(name, array);
      }
      let current = array;
      for (let i = 0; i < indices.length - 1; i++) {
        const index = Math.floor(indices[i] ?? 0);
        if (!Array.isArray(current)) {
          current = [];
        }
        if (!current[index]) {
          current[index] = [];
        }
        current = current[index];
      }
      if (Array.isArray(current)) {
        const finalIndex = Math.floor(indices[indices.length - 1] ?? 0);
        current[finalIndex] = value;
      }
    }
    /**
     * Set an array element from expressions
     */
    setArrayElementFromExpressions(name, indexExpressions, valueExpression) {
      const indices = indexExpressions.map((expr) => this.toNumber(this.evaluator.evaluateExpression(expr)));
      const value = this.evaluator.evaluateExpression(valueExpression);
      const basicValue = typeof value === "boolean" ? value ? 1 : 0 : value;
      this.setArrayElement(name, indices, basicValue);
    }
    /**
     * Get an array element
     */
    getArrayElement(name, indices) {
      const array = this.context.arrays.get(name);
      if (!array) return 0;
      let value = array;
      for (const index of indices) {
        const numIndex = Math.floor(index);
        if (Array.isArray(value)) {
          const element = value[numIndex];
          if (element !== void 0) {
            value = element;
          } else {
            return 0;
          }
        } else {
          return 0;
        }
      }
      return typeof value !== "object" ? value : 0;
    }
    /**
     * Get an array element from expressions
     */
    getArrayElementFromExpressions(name, indexExpressions) {
      const indices = indexExpressions.map((expr) => this.toNumber(this.evaluator.evaluateExpression(expr)));
      return this.getArrayElement(name, indices);
    }
    /**
     * Create an array with specified dimensions
     */
    createArray(name, dimensions) {
      const array = this.createArrayRecursive(dimensions, 0);
      this.context.arrays.set(name, array);
    }
    /**
     * Recursively create array structure
     */
    createArrayRecursive(dimensions, currentDim) {
      if (currentDim >= dimensions.length) {
        return [];
      }
      const size = Math.floor(dimensions[currentDim] ?? 0);
      const array = [];
      for (let i = 0; i < size; i++) {
        if (currentDim === dimensions.length - 1) {
          array[i] = 0;
        } else {
          array[i] = this.createArrayRecursive(dimensions, currentDim + 1);
        }
      }
      return array;
    }
    /**
     * Check if a variable exists
     */
    hasVariable(name) {
      return this.context.variables.has(name);
    }
    /**
     * Check if an array exists
     */
    hasArray(name) {
      return this.context.arrays.has(name);
    }
    /**
     * Get all variable names
     */
    getVariableNames() {
      return Array.from(this.context.variables.keys());
    }
    /**
     * Get all array names
     */
    getArrayNames() {
      return Array.from(this.context.arrays.keys());
    }
    /**
     * Clear all variables
     */
    clearVariables() {
      this.context.variables.clear();
    }
    /**
     * Clear all arrays
     */
    clearArrays() {
      this.context.arrays.clear();
    }
    /**
     * Convert a value to a number
     */
    toNumber(value) {
      if (typeof value === "number") return value;
      if (typeof value === "boolean") return value ? 1 : 0;
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    }
  };

  // src/core/execution/executors/LetExecutor.ts
  var LetExecutor = class {
    constructor(variableService) {
      this.variableService = variableService;
    }
    /**
     * Execute a LET statement
     */
    execute(letStmt) {
      if (letStmt.variable.subscript) {
        this.variableService.setArrayElementFromExpressions(
          letStmt.variable.name,
          letStmt.variable.subscript,
          letStmt.expression
        );
      } else {
        this.variableService.setVariableFromExpression(
          letStmt.variable.name,
          letStmt.expression
        );
        if (this.variableService.context.config.enableDebugMode) {
          const value = this.variableService.evaluator.evaluateExpression(letStmt.expression);
          this.variableService.context.addDebugOutput(`LET: ${letStmt.variable.name} = ${value}`);
        }
      }
    }
  };

  // src/core/services/DataService.ts
  var DataService = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Add data values from a DATA statement
     */
    addDataValues(expressions) {
      for (const expr of expressions) {
        const value = this.evaluator.evaluateExpression(expr);
        this.context.dataValues.push(value);
      }
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`DATA: Added ${expressions.length} values`);
      }
    }
    /**
     * Read the next data value
     */
    readNextDataValue() {
      if (this.context.dataIndex >= this.context.dataValues.length) {
        this.context.addError({
          line: 0,
          message: "Out of data",
          type: ERROR_TYPES.RUNTIME
        });
        return 0;
      }
      const value = this.context.dataValues[this.context.dataIndex];
      this.context.dataIndex++;
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`READ: ${value}`);
      }
      return value ?? 0;
    }
    /**
     * Restore data pointer to beginning or specific line
     */
    restoreData(lineNumber) {
      if (lineNumber !== void 0) {
        const targetIndex = this.findDataStatementIndex(lineNumber);
        if (targetIndex !== -1) {
          this.context.dataIndex = targetIndex;
        } else {
          this.context.addError({
            line: 0,
            message: `RESTORE target line ${lineNumber} not found`,
            type: ERROR_TYPES.RUNTIME
          });
        }
      } else {
        this.context.dataIndex = 0;
      }
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`RESTORE: Data index set to ${this.context.dataIndex}`);
      }
    }
    /**
     * Get current data index
     */
    getCurrentDataIndex() {
      return this.context.dataIndex;
    }
    /**
     * Get total number of data values
     */
    getDataValueCount() {
      return this.context.dataValues.length;
    }
    /**
     * Get all data values
     */
    getAllDataValues() {
      return [...this.context.dataValues];
    }
    /**
     * Clear all data values
     */
    clearDataValues() {
      this.context.dataValues = [];
      this.context.dataIndex = 0;
    }
    /**
     * Check if there are more data values to read
     */
    hasMoreData() {
      return this.context.dataIndex < this.context.dataValues.length;
    }
    /**
     * Find the index of the first DATA statement at or after the specified line
     */
    findDataStatementIndex(lineNumber) {
      let valueIndex = 0;
      for (let i = 0; i < this.context.statements.length; i++) {
        const statement = this.context.statements[i];
        if (statement && statement.type === "Statement" && statement.command.type === "DataStatement") {
          if (statement.lineNumber >= lineNumber) {
            return valueIndex;
          }
          valueIndex += (statement.command.constants || []).length;
        }
      }
      return -1;
    }
    /**
     * Preprocess all DATA statements to build the data array
     */
    preprocessDataStatements() {
      this.context.dataValues = [];
      for (const statement of this.context.statements) {
        if (statement && statement.type === "Statement" && statement.command.type === "DataStatement") {
          this.addDataValues(statement.command.constants || []);
        }
      }
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`Preprocessed ${this.context.dataValues.length} data values`);
      }
    }
  };

  // src/core/execution/StatementRouter.ts
  var StatementRouter = class {
    constructor(context, evaluator, variableService, ioService, dataService) {
      this.context = context;
      this.evaluator = evaluator;
      this.variableService = variableService;
      this.ioService = ioService;
      this.dataService = dataService;
      __publicField(this, "printExecutor");
      __publicField(this, "letExecutor");
      this.printExecutor = new PrintExecutor(ioService);
      this.letExecutor = new LetExecutor(variableService);
    }
    /**
     * Route a statement to its appropriate executor
     */
    async executeStatement(statement) {
      switch (statement.command.type) {
        case "PrintStatement":
          this.printExecutor.execute(statement.command);
          break;
        case "LetStatement":
          this.letExecutor.execute(statement.command);
          break;
        case "IfStatement":
          await this.executeIfStatement(statement.command);
          break;
        case "ForStatement":
          await this.executeForStatement(statement.command);
          break;
        case "NextStatement":
          await this.executeNextStatement(statement.command);
          break;
        case "GotoStatement":
          await this.executeGotoStatement(statement.command);
          break;
        case "GosubStatement":
          await this.executeGosubStatement(statement.command);
          break;
        case "ReturnStatement":
          await this.executeReturnStatement(statement.command);
          break;
        case "InputStatement":
          await this.executeInputStatement(statement.command);
          break;
        case "DataStatement":
          this.dataService.addDataValues(statement.command.constants || []);
          break;
        case "ReadStatement":
          await this.executeReadStatement(statement.command);
          break;
        case "RestoreStatement":
          await this.executeRestoreStatement(statement.command);
          break;
        case "DimStatement":
          await this.executeDimStatement(statement.command);
          break;
        case "ClsStatement":
          this.ioService.clearScreen();
          break;
        case "ColorStatement":
          await this.executeColorStatement(statement.command);
          break;
        case "EndStatement":
          this.context.shouldStop = true;
          break;
        case "PauseStatement":
          await this.executePauseStatement(statement.command);
          break;
        case "RemStatement":
          break;
        case "StatementBlockExecutor":
          await this.executeStatementBlock(statement.command.statements);
          break;
        default:
          this.context.addError({
            line: statement.lineNumber,
            message: `Unsupported statement type: ${statement.command.type}`,
            type: ERROR_TYPES.RUNTIME
          });
      }
    }
    /**
     * Execute a StatementBlock by executing each statement in sequence
     */
    async executeStatementBlock(statements) {
      for (const cmd of statements) {
        const statementNode = {
          type: "Statement",
          lineNumber: 0,
          // Use 0 for nested statements
          command: cmd
        };
        await this.executeStatement(statementNode);
      }
    }
    // Placeholder methods for statements not yet extracted
    async executeIfStatement(ifStmt) {
      const condition = this.evaluator.evaluateExpression(ifStmt.condition);
      if (condition) {
        await this.executeStatement({
          type: "Statement",
          lineNumber: 0,
          command: ifStmt.thenStatement
        });
      }
    }
    async executeForStatement(forStmt) {
      const varName = forStmt.variable.name;
      const existingLoopIndex = this.context.loopStack.findIndex((loop) => loop.variableName === varName);
      if (existingLoopIndex !== -1) {
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`FOR: reusing existing loop state for ${varName}`);
        }
        return;
      }
      const startValue = this.evaluator.evaluateExpression(forStmt.start);
      const endValue = this.evaluator.evaluateExpression(forStmt.end);
      const stepValue = forStmt.step ? this.evaluator.evaluateExpression(forStmt.step) : 1;
      const startNum = this.toNumber(startValue);
      const endNum = this.toNumber(endValue);
      const stepNum = this.toNumber(stepValue);
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`FOR: ${varName} = ${startValue} TO ${endValue} STEP ${stepValue}`);
      }
      this.variableService.setVariable(varName, startValue);
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`FOR: creating new loop state for ${varName}, storing statementIndex ${this.context.currentStatementIndex}`);
      }
      const shouldExecute = stepNum > 0 && startNum <= endNum || stepNum < 0 && startNum >= endNum;
      this.context.loopStack.push({
        variableName: varName,
        startValue: startNum,
        endValue: endNum,
        stepValue: stepNum,
        currentValue: startNum,
        statementIndex: this.context.currentStatementIndex,
        shouldExecute
      });
      if (!shouldExecute) {
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`FOR: loop will not execute (${startNum} ${stepNum > 0 ? ">" : "<"} ${endNum}), skipping to NEXT`);
        }
        const nextStatementIndex = this.findNextStatementIndex(this.context.currentStatementIndex, varName);
        if (nextStatementIndex !== -1) {
          this.context.currentStatementIndex = nextStatementIndex;
        }
      }
    }
    async executeNextStatement(nextStmt) {
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`NEXT: loopStack length = ${this.context.loopStack.length}`);
      }
      if (this.context.loopStack.length === 0) {
        this.context.addError({
          line: 0,
          message: "NEXT without FOR",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      let loopStateIndex = -1;
      if (nextStmt.variable) {
        const variableName = nextStmt.variable.name;
        for (let i = this.context.loopStack.length - 1; i >= 0; i--) {
          if (this.context.loopStack[i] && this.context.loopStack[i].variableName === variableName) {
            loopStateIndex = i;
            break;
          }
        }
      } else {
        loopStateIndex = this.context.loopStack.length - 1;
      }
      if (loopStateIndex === -1) {
        if (this.context.loopStack.length > 0) {
          loopStateIndex = this.context.loopStack.length - 1;
          if (this.context.config.enableDebugMode) {
            this.context.addDebugOutput(`NEXT: no matching FOR found for variable ${nextStmt.variable?.name || "unnamed"}, using most recent FOR loop`);
          }
        } else {
          if (this.context.config.enableDebugMode) {
            this.context.addDebugOutput(`NEXT: no matching FOR found for variable ${nextStmt.variable?.name || "unnamed"}, continuing execution`);
          }
          return;
        }
      }
      const loopState = this.context.loopStack[loopStateIndex];
      if (!loopState) {
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`NEXT: no valid loop state found, continuing execution`);
        }
        return;
      }
      if (loopState.shouldExecute === false) {
        this.context.loopStack.splice(loopStateIndex, 1);
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`NEXT: loop was not executed, popping from stack`);
        }
        return;
      }
      loopState.currentValue += loopState.stepValue;
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`NEXT: currentValue=${loopState.currentValue}, endValue=${loopState.endValue}, stepValue=${loopState.stepValue}`);
      }
      if (loopState.stepValue > 0 && loopState.currentValue <= loopState.endValue || loopState.stepValue < 0 && loopState.currentValue >= loopState.endValue) {
        this.variableService.setVariable(loopState.variableName, loopState.currentValue);
        this.context.currentStatementIndex = loopState.statementIndex;
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`NEXT: continuing loop, jumping to statement ${loopState.statementIndex}`);
        }
      } else {
        this.context.loopStack.splice(loopStateIndex, 1);
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`NEXT: loop completed, removed from stack`);
        }
      }
    }
    async executeGotoStatement(gotoStmt) {
      const targetLine = this.evaluator.evaluateExpression(gotoStmt.target);
      const targetIndex = this.context.findStatementIndexByLine(this.toNumber(targetLine));
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`GOTO: target line ${targetLine}, target index ${targetIndex}`);
        this.context.addDebugOutput(`GOTO: available statements: ${this.context.statements.map((s, i) => `${i}:L${s.lineNumber}`).join(", ")}`);
      }
      if (targetIndex !== -1) {
        this.context.currentStatementIndex = targetIndex;
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`GOTO: jumping to statement ${targetIndex}`);
        }
      } else {
        this.context.addError({
          line: 0,
          message: `GOTO target line ${targetLine} not found`,
          type: ERROR_TYPES.RUNTIME
        });
      }
    }
    async executeGosubStatement(gosubStmt) {
      this.context.gosubStack.push(this.context.currentStatementIndex + 1);
      const targetLine = this.evaluator.evaluateExpression(gosubStmt.target);
      const targetIndex = this.context.findStatementIndexByLine(this.toNumber(targetLine));
      if (targetIndex !== -1) {
        this.context.currentStatementIndex = targetIndex;
      } else {
        this.context.addError({
          line: 0,
          message: `GOSUB target line ${targetLine} not found`,
          type: ERROR_TYPES.RUNTIME
        });
      }
    }
    async executeReturnStatement(_returnStmt) {
      if (this.context.gosubStack.length === 0) {
        this.context.addError({
          line: 0,
          message: "RETURN without GOSUB",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const returnIndex = this.context.gosubStack.pop();
      this.context.currentStatementIndex = returnIndex;
    }
    async executeInputStatement(_inputStmt) {
      this.ioService.inputValue();
    }
    async executeReadStatement(readStmt) {
      for (const variable of readStmt.variables) {
        const value = this.dataService.readNextDataValue();
        if (variable.subscript) {
          this.variableService.setArrayElementFromExpressions(
            variable.name,
            variable.subscript,
            { type: "NumberLiteral", value }
          );
        } else {
          this.variableService.setVariable(variable.name, value);
        }
      }
    }
    async executeRestoreStatement(restoreStmt) {
      const lineNumber = restoreStmt.lineNumber ? this.evaluator.evaluateExpression(restoreStmt.lineNumber) : void 0;
      this.dataService.restoreData(lineNumber ? this.toNumber(lineNumber) : void 0);
    }
    async executeDimStatement(dimStmt) {
      for (const arrayDecl of dimStmt.arrays) {
        const dimensions = arrayDecl.dimensions.map(
          (dim) => this.toNumber(this.evaluator.evaluateExpression(dim))
        );
        this.variableService.createArray(arrayDecl.variable.name, dimensions);
      }
    }
    async executeColorStatement(colorStmt) {
      const foreground = this.toNumber(this.evaluator.evaluateExpression(colorStmt.foreground));
      const background = colorStmt.background ? this.toNumber(this.evaluator.evaluateExpression(colorStmt.background)) : 0;
      this.context.addDebugOutput(`COLOR: foreground=${foreground}, background=${background}`);
    }
    async executePauseStatement(pauseStmt) {
      const durationValue = this.evaluator.evaluateExpression(pauseStmt.duration);
      const durationMs = this.toNumber(durationValue);
      const pauseDuration = Math.max(0, durationMs);
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`PAUSE: ${pauseDuration}ms`);
      }
      if (pauseDuration > 0) {
        await new Promise((resolve) => setTimeout(resolve, pauseDuration));
      }
    }
    toNumber(value) {
      if (typeof value === "number") return value;
      if (typeof value === "boolean") return value ? 1 : 0;
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    }
    /**
     * Find the NEXT statement for a given variable
     */
    findNextStatementIndex(startIndex, variableName) {
      for (let i = startIndex + 1; i < this.context.statements.length; i++) {
        const stmt = this.context.statements[i];
        if (stmt && stmt.command.type === "NextStatement") {
          if (!stmt.command.variable || stmt.command.variable.name === variableName) {
            return i;
          }
        }
      }
      return -1;
    }
  };

  // src/core/execution/ExecutionEngine.ts
  var ExecutionEngine = class {
    constructor(context, deviceAdapter) {
      __publicField(this, "context");
      __publicField(this, "evaluator");
      __publicField(this, "variableService");
      __publicField(this, "ioService");
      __publicField(this, "dataService");
      __publicField(this, "statementRouter");
      this.context = context;
      this.evaluator = new ExpressionEvaluator(this.context);
      this.variableService = new VariableService(this.context, this.evaluator);
      this.ioService = new IoService(this.context, this.evaluator, deviceAdapter);
      this.dataService = new DataService(this.context, this.evaluator);
      this.statementRouter = new StatementRouter(
        this.context,
        this.evaluator,
        this.variableService,
        this.ioService,
        this.dataService
      );
    }
    /**
     * Preprocess statement blocks by flattening colon-separated statements
     */
    preprocessStatementBlocks() {
      const flattenedStatements = [];
      for (const statement of this.context.statements) {
        if (statement.command.type === "StatementBlock") {
          const block = statement.command;
          for (const cmd of block.statements) {
            const processedCmd = this.processNestedStatementBlocks(cmd);
            flattenedStatements.push({
              type: "Statement",
              lineNumber: statement.lineNumber,
              command: processedCmd
            });
          }
        } else {
          const processedStatement = {
            ...statement,
            command: this.processNestedStatementBlocks(statement.command)
          };
          flattenedStatements.push(processedStatement);
        }
      }
      this.context.statements = flattenedStatements;
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`Preprocessed ${flattenedStatements.length} statements (flattened statement blocks)`);
        for (let i = 0; i < flattenedStatements.length; i++) {
          const stmt = flattenedStatements[i];
          if (stmt) {
            this.context.addDebugOutput(`Statement ${i}: Line ${stmt.lineNumber}, Type: ${stmt.command.type}`);
          }
        }
      }
    }
    /**
     * Recursively process nested StatementBlocks in commands
     */
    processNestedStatementBlocks(command) {
      if (command.type === "StatementBlock") {
        return {
          type: "StatementBlockExecutor",
          statements: command.statements
        };
      } else if (command.type === "IfStatement") {
        return {
          ...command,
          thenStatement: this.processNestedStatementBlocks(command.thenStatement)
        };
      } else {
        return command;
      }
    }
    /**
     * Execute the BASIC program
     */
    async execute() {
      const startTime = Date.now();
      try {
        this.dataService.preprocessDataStatements();
        this.preprocessStatementBlocks();
        this.context.isRunning = true;
        this.context.shouldStop = false;
        while (this.context.shouldContinue()) {
          const statement = this.context.getCurrentStatement();
          if (!statement) break;
          const statementIndexBefore = this.context.currentStatementIndex;
          if (this.context.config.enableDebugMode) {
            this.context.addDebugOutput(`Executing statement ${statementIndexBefore}: ${statement.command.type}`);
          }
          await this.statementRouter.executeStatement(statement);
          if (this.context.currentStatementIndex === statementIndexBefore) {
            this.context.nextStatement();
            if (this.context.config.enableDebugMode) {
              this.context.addDebugOutput(`Moved to next statement: ${this.context.currentStatementIndex}`);
            }
          } else {
            if (this.context.config.enableDebugMode) {
              this.context.addDebugOutput(`Statement index modified to: ${this.context.currentStatementIndex}`);
            }
          }
          this.context.incrementIteration();
        }
        this.context.isRunning = false;
        if (this.context.loopStack.length > 0) {
          this.context.addError({
            line: 0,
            message: "Missing NEXT statement for FOR loop",
            type: ERROR_TYPES.RUNTIME
          });
        }
        return {
          success: this.context.getErrors().length === 0,
          errors: this.context.getErrors(),
          variables: this.context.variables,
          executionTime: Date.now() - startTime
        };
      } catch (error) {
        this.context.isRunning = false;
        this.context.addError({
          line: 0,
          message: `Execution error: ${error}`,
          type: ERROR_TYPES.RUNTIME
        });
        return {
          success: false,
          errors: this.context.getErrors(),
          variables: this.context.variables,
          executionTime: Date.now() - startTime
        };
      }
    }
    /**
     * Stop execution
     */
    stop() {
      this.context.shouldStop = true;
      this.context.isRunning = false;
    }
    /**
     * Reset execution state
     */
    reset() {
      this.context.reset();
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
      this.context.config = {
        ...this.context.config,
        ...newConfig
      };
    }
  };

  // src/core/BasicInterpreter.ts
  var BasicInterpreter = class {
    constructor(config) {
      __publicField(this, "config");
      __publicField(this, "parser");
      __publicField(this, "executionEngine");
      __publicField(this, "context");
      console.log("\u{1F527} [MAIN] BasicInterpreter constructor called with config:", {
        hasDeviceAdapter: !!config?.deviceAdapter,
        maxIterations: config?.maxIterations,
        maxOutputLines: config?.maxOutputLines,
        enableDebugMode: config?.enableDebugMode,
        strictMode: config?.strictMode
      });
      this.config = {
        maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_TEST,
        maxOutputLines: EXECUTION_LIMITS.MAX_OUTPUT_LINES_TEST,
        enableDebugMode: false,
        strictMode: false,
        ...config
      };
      console.log("\u{1F527} [MAIN] Final config after merge:", {
        maxIterations: this.config.maxIterations,
        maxOutputLines: this.config.maxOutputLines,
        enableDebugMode: this.config.enableDebugMode,
        strictMode: this.config.strictMode
      });
      this.parser = new FBasicParser();
    }
    /**
     * Execute BASIC code
     */
    async execute(code) {
      console.log("\u{1F680} [MAIN] BasicInterpreter.execute called with code length:", code.length);
      try {
        const parseResult = await this.parser.parse(code);
        if (!parseResult.success) {
          return {
            success: false,
            errors: parseResult.errors?.map((error) => ({
              line: error.location?.start?.line || 0,
              message: error.message,
              type: ERROR_TYPES.SYNTAX
            })) || [],
            variables: /* @__PURE__ */ new Map(),
            executionTime: 0
          };
        }
        if (!this.context || !this.context.deviceAdapter) {
          this.context = new ExecutionContext(this.config);
          if (this.config.deviceAdapter) {
            this.context.deviceAdapter = this.config.deviceAdapter;
          }
          this.executionEngine = new ExecutionEngine(this.context, this.config.deviceAdapter);
        } else {
          this.executionEngine = new ExecutionEngine(this.context, this.config.deviceAdapter);
        }
        const preservedDeviceAdapter = this.context.deviceAdapter;
        this.context.reset();
        this.context.statements = parseResult.ast?.statements || [];
        this.context.deviceAdapter = preservedDeviceAdapter;
        const result = await this.executionEngine.execute();
        return result;
      } catch (error) {
        return {
          success: false,
          errors: [{
            line: 0,
            message: `Execution error: ${error}`,
            type: ERROR_TYPES.RUNTIME
          }],
          variables: /* @__PURE__ */ new Map(),
          executionTime: 0
        };
      }
    }
    /**
     * Reset interpreter state
     */
    reset() {
      if (this.executionEngine) {
        this.executionEngine.reset();
      }
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
      this.config = {
        ...this.config,
        ...newConfig
      };
      if (this.executionEngine) {
        this.executionEngine.updateConfig(this.config);
      }
    }
    /**
     * Stop execution and cleanup resources
     */
    stop() {
      if (this.executionEngine) {
        this.executionEngine.stop();
      }
    }
    /**
     * Get current configuration
     */
    getConfig() {
      return { ...this.config };
    }
    /**
     * Check if interpreter is currently running
     */
    isRunning() {
      return this.context?.isRunning || false;
    }
    /**
     * Get current variables
     */
    getVariables() {
      return this.context?.variables || /* @__PURE__ */ new Map();
    }
  };

  // src/core/devices/ServiceWorkerDeviceAdapter.ts
  var ServiceWorkerDeviceAdapter = class _ServiceWorkerDeviceAdapter {
    constructor() {
      // === DEVICE STATE ===
      __publicField(this, "strigClickBuffer", /* @__PURE__ */ new Map());
      __publicField(this, "stickStates", /* @__PURE__ */ new Map());
      __publicField(this, "isEnabled", true);
      // === SERVICE WORKER MANAGEMENT ===
      __publicField(this, "worker", null);
      __publicField(this, "messageId", 0);
      __publicField(this, "pendingMessages", /* @__PURE__ */ new Map());
      console.log("\u{1F50C} [SERVICE_WORKER_DEVICE] ServiceWorkerDeviceAdapter created");
      this.setupMessageListener();
    }
    // === SERVICE WORKER MANAGEMENT METHODS ===
    /**
     * Check if service workers are supported
     */
    static isSupported() {
      const supported = typeof Worker !== "undefined" && "serviceWorker" in navigator;
      console.log("\u{1F50D} [SERVICE_WORKER] isSupported check:", {
        hasWorker: typeof Worker !== "undefined",
        hasServiceWorker: "serviceWorker" in navigator,
        supported
      });
      return supported;
    }
    /**
     * Check if we're currently running in a service worker context
     */
    static isInServiceWorker() {
      const inServiceWorker = typeof window === "undefined" && typeof self !== "undefined" && "importScripts" in self;
      console.log("\u{1F50D} [SERVICE_WORKER] isInServiceWorker check:", {
        hasWindow: typeof window !== "undefined",
        hasSelf: typeof self !== "undefined",
        hasImportScripts: typeof self !== "undefined" && "importScripts" in self,
        inServiceWorker
      });
      return inServiceWorker;
    }
    /**
     * Initialize the service worker
     */
    async initialize(workerScript) {
      console.log("\u{1F527} [SERVICE_WORKER] ServiceWorkerDeviceAdapter.initialize called with script:", workerScript);
      if (!_ServiceWorkerDeviceAdapter.isSupported()) {
        console.error("\u274C [SERVICE_WORKER] Service workers are not supported in this environment");
        throw new Error("Service workers are not supported in this environment");
      }
      if (this.worker) {
        console.log("\u2705 [SERVICE_WORKER] Worker already initialized");
        return;
      }
      const script = workerScript || DEFAULTS.SERVICE_WORKER.WORKER_SCRIPT;
      console.log("\u{1F527} [SERVICE_WORKER] Creating worker with script:", script);
      try {
        this.worker = new Worker(script);
        console.log("\u2705 [SERVICE_WORKER] Worker created successfully");
      } catch (error) {
        console.error("\u274C [SERVICE_WORKER] Failed to create worker:", error);
        throw error;
      }
      this.setupMessageListener();
      this.worker.onerror = (error) => {
        console.error("\u274C [SERVICE_WORKER] Service worker error:", error);
        this.rejectAllPending("Service worker error: " + error.message);
      };
      this.worker.onmessageerror = (error) => {
        console.error("\u274C [SERVICE_WORKER] Service worker message error:", error);
        this.rejectAllPending("Service worker message error");
      };
      console.log("\u2705 [SERVICE_WORKER] Worker initialization completed successfully");
    }
    /**
     * Execute BASIC code in the service worker
     */
    async executeInWorker(code, config, options = {}) {
      console.log("executeInWorker called with code:", code.substring(0, 50) + "...");
      if (!this.worker) {
        console.log("Worker not initialized, initializing...");
        await this.initialize(DEFAULTS.SERVICE_WORKER.WORKER_SCRIPT);
      }
      if (!this.worker) {
        throw new Error("Failed to initialize service worker");
      }
      const messageId = (++this.messageId).toString();
      const timeout = options.timeout || DEFAULTS.SERVICE_WORKER.MESSAGE_TIMEOUT;
      console.log("Sending message with ID:", messageId, "timeout:", timeout);
      return new Promise((resolve, reject) => {
        const timeoutHandle = setTimeout(() => {
          console.log("Service worker timeout after", timeout, "ms for message ID:", messageId);
          this.pendingMessages.delete(messageId);
          reject(new Error(`Service worker execution timeout after ${timeout}ms`));
        }, timeout);
        this.pendingMessages.set(messageId, {
          resolve,
          reject,
          timeout: timeoutHandle
        });
        const message = {
          type: "EXECUTE",
          id: messageId,
          timestamp: Date.now(),
          data: {
            code,
            config,
            options: {
              timeout,
              enableProgress: options.onProgress !== void 0
            }
          }
        };
        console.log("\u{1F504} [MAIN\u2192WORKER] Posting message to worker:", {
          type: message.type,
          id: message.id,
          timestamp: message.timestamp,
          dataSize: JSON.stringify(message.data).length,
          hasDeviceAdapter: !!config.deviceAdapter
        });
        this.worker.postMessage(message);
        console.log("\u2705 [MAIN\u2192WORKER] Message posted to worker successfully");
      });
    }
    /**
     * Stop execution in the service worker
     */
    stopExecution() {
      if (!this.worker) return;
      const message = {
        type: "STOP",
        id: "stop",
        timestamp: Date.now(),
        data: {
          executionId: "current",
          reason: "user_request"
        }
      };
      console.log("\u{1F6D1} [MAIN\u2192WORKER] Posting STOP message to worker:", {
        type: message.type,
        id: message.id,
        timestamp: message.timestamp,
        reason: message.data.reason
      });
      this.worker.postMessage(message);
      console.log("\u2705 [MAIN\u2192WORKER] STOP message posted to worker successfully");
    }
    /**
     * Send a STRIG event to the service worker
     */
    sendStrigEvent(joystickId, state) {
      if (!this.worker) {
        console.log("\u{1F50C} [SERVICE_WORKER] No worker available for STRIG event");
        return;
      }
      const message = {
        type: "STRIG_EVENT",
        id: `strig-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          joystickId,
          state,
          timestamp: Date.now()
        }
      };
      console.log("\u{1F50C} [SERVICE_WORKER] Sending STRIG event to service worker:", {
        joystickId,
        state,
        messageId: message.id
      });
      this.worker.postMessage(message);
    }
    /**
     * Send a message to the service worker
     */
    sendMessage(message) {
      if (this.worker) {
        this.worker.postMessage(message);
      }
    }
    /**
     * Terminate the service worker
     */
    terminate() {
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
        this.rejectAllPending("Service worker terminated");
      }
    }
    // === DEVICE ADAPTER METHODS ===
    /**
     * Enable or disable the device adapter
     */
    setEnabled(enabled) {
      this.isEnabled = enabled;
      console.log("\u{1F50C} [SERVICE_WORKER_DEVICE] Device adapter enabled:", enabled);
    }
    // === JOYSTICK INPUT METHODS ===
    getJoystickCount() {
      return 2;
    }
    getStickState(joystickId) {
      return this.stickStates.get(joystickId) || 0;
    }
    setStickState(joystickId, state) {
      this.stickStates.set(joystickId, state);
      console.log("\u{1F50C} [SERVICE_WORKER_DEVICE] Stick state set:", { joystickId, state });
    }
    pushStrigState(joystickId, state) {
      if (!this.isEnabled) return;
      console.log("\u{1F50C} [SERVICE_WORKER_DEVICE] pushStrigState called:", { joystickId, state });
      if (state > 0) {
        if (!this.strigClickBuffer.has(joystickId)) {
          this.strigClickBuffer.set(joystickId, []);
        }
        const buffer = this.strigClickBuffer.get(joystickId);
        buffer.push(state);
        console.log("\u{1F50C} [SERVICE_WORKER_DEVICE] STRIG pulse buffered:", {
          joystickId,
          state,
          bufferSize: buffer.length
        });
      }
    }
    consumeStrigState(joystickId) {
      if (!this.isEnabled) {
        return 0;
      }
      if (!this.strigClickBuffer.has(joystickId)) {
        return 0;
      }
      const buffer = this.strigClickBuffer.get(joystickId);
      if (buffer.length === 0) {
        return 0;
      }
      const clickValue = buffer.shift();
      console.log(`\u{1F50C} [SERVICE_WORKER_DEVICE] consumeStrigState: consumed STRIG event for joystick ${joystickId}, value=${clickValue}, remaining=${buffer.length}`);
      return clickValue;
    }
    // === TEXT OUTPUT METHODS ===
    printOutput(output) {
      console.log("\u{1F50C} [SERVICE_WORKER_DEVICE] Print output:", output);
      self.postMessage({
        type: "OUTPUT",
        id: `output-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: "current",
          output,
          outputType: "print"
        }
      });
    }
    debugOutput(output) {
      console.log("\u{1F50C} [SERVICE_WORKER_DEVICE] Debug output:", output);
      self.postMessage({
        type: "OUTPUT",
        id: `debug-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: "current",
          output,
          outputType: "debug"
        }
      });
    }
    errorOutput(output) {
      console.error("\u{1F50C} [SERVICE_WORKER_DEVICE] Error output:", output);
      self.postMessage({
        type: "OUTPUT",
        id: `error-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: "current",
          output,
          outputType: "error"
        }
      });
    }
    clearScreen() {
      console.log("\u{1F50C} [SERVICE_WORKER_DEVICE] Clear screen");
      self.postMessage({
        type: "CLEAR_SCREEN",
        id: `clear-${Date.now()}`,
        timestamp: Date.now(),
        data: { executionId: "current" }
      });
    }
    // === PRIVATE METHODS ===
    /**
     * Set up message listener for service worker responses
     */
    setupMessageListener() {
      if (typeof window === "undefined") return;
      if (this.worker) {
        this.worker.onmessage = (event) => {
          console.log("\u{1F4E8} [WORKER\u2192MAIN] Main thread received message from worker:", {
            type: event.data.type,
            id: event.data.id,
            timestamp: event.data.timestamp,
            dataSize: JSON.stringify(event.data).length
          });
          const message = event.data;
          this.handleWorkerMessage(message);
        };
      }
    }
    /**
     * Handle messages from the service worker
     */
    handleWorkerMessage(message) {
      console.log("\u{1F50D} [MAIN] Processing worker message:", {
        type: message.type,
        id: message.id,
        timestamp: message.timestamp
      });
      if (message.type === "OUTPUT") {
        console.log("\u{1F4E4} [MAIN] Handling OUTPUT message:", {
          outputType: message.data.outputType,
          outputLength: message.data.output.length
        });
        this.handleOutputMessage(message);
        return;
      }
      const pending = this.pendingMessages.get(message.id);
      if (!pending) {
        console.log("\u26A0\uFE0F [MAIN] No pending message found for ID:", message.id);
        return;
      }
      console.log("\u2705 [MAIN] Found pending message for ID:", message.id);
      switch (message.type) {
        case "RESULT": {
          const resultMessage = message;
          console.log("\u{1F4CA} [MAIN] Received RESULT message:", {
            success: resultMessage.data.success,
            executionTime: resultMessage.data.executionTime
          });
          clearTimeout(pending.timeout);
          this.pendingMessages.delete(message.id);
          if (resultMessage.data.errors?.some((error) => error.message.includes("not yet fully implemented"))) {
            console.log("\u26A0\uFE0F [MAIN] Service worker indicates fallback needed, rejecting to trigger fallback");
            pending.reject(new Error("Service worker execution not implemented, falling back to main thread"));
          } else {
            console.log("\u2705 [MAIN] Service worker result is valid, resolving pending promise");
            pending.resolve(resultMessage.data);
          }
          break;
        }
        case "ERROR": {
          const errorMessage = message;
          console.log("\u274C [MAIN] Received ERROR message:", {
            message: errorMessage.data.message,
            errorType: errorMessage.data.errorType,
            recoverable: errorMessage.data.recoverable
          });
          clearTimeout(pending.timeout);
          this.pendingMessages.delete(message.id);
          console.log("\u274C [MAIN] Rejecting pending promise due to error");
          pending.reject(new Error(errorMessage.data.message));
          break;
        }
        case "PROGRESS": {
          const progressMessage = message;
          console.log("\u{1F4C8} [MAIN] Received PROGRESS message:", {
            progress: progressMessage.data.progress
          });
          break;
        }
      }
    }
    /**
     * Handle OUTPUT messages from the service worker
     */
    handleOutputMessage(message) {
      console.log("\u{1F4E4} [MAIN] Handling OUTPUT message:", {
        outputType: message.data.outputType,
        outputLength: message.data.output.length
      });
    }
    /**
     * Reject all pending messages (cleanup)
     */
    rejectAllPending(reason) {
      for (const [_id, pending] of this.pendingMessages) {
        clearTimeout(pending.timeout);
        pending.reject(new Error(reason));
      }
      this.pendingMessages.clear();
    }
  };

  // src/core/workers/ServiceWorkerInterpreter.ts
  var ServiceWorkerInterpreter = class {
    constructor() {
      __publicField(this, "interpreter", null);
      __publicField(this, "isRunning", false);
      __publicField(this, "currentExecutionId", null);
      __publicField(this, "serviceWorkerDeviceAdapter", null);
      this.interpreter = null;
      this.isRunning = false;
      this.currentExecutionId = null;
      this.serviceWorkerDeviceAdapter = new ServiceWorkerDeviceAdapter();
      this.setupMessageListener();
    }
    setupMessageListener() {
      if (typeof self === "undefined") return;
      self.addEventListener("message", (event) => {
        console.log("\u{1F4E8} [WORKER] Service worker received message from main thread:", {
          type: event.data.type,
          id: event.data.id,
          timestamp: event.data.timestamp,
          dataSize: JSON.stringify(event.data).length
        });
        this.handleMessage(event.data);
      });
    }
    async handleMessage(message) {
      console.log("\u{1F50D} [WORKER] Processing message:", {
        type: message.type,
        id: message.id,
        timestamp: message.timestamp
      });
      try {
        switch (message.type) {
          case "EXECUTE":
            console.log("\u25B6\uFE0F [WORKER] Handling EXECUTE message");
            await this.handleExecute(message);
            break;
          case "STOP":
            console.log("\u23F9\uFE0F [WORKER] Handling STOP message");
            this.handleStop(message);
            break;
          case "STRIG_EVENT":
            console.log("\u{1F3AE} [WORKER] Handling STRIG_EVENT message");
            this.handleStrigEvent(message);
            break;
          case "STICK_EVENT":
            console.log("\u{1F3AE} [WORKER] Handling STICK_EVENT message");
            this.handleStickEvent(message);
            break;
        }
      } catch (error) {
        console.log("\u274C [WORKER] Error processing message:", error);
        this.sendError(message.id, error instanceof Error ? error : new Error(String(error)));
      }
    }
    async handleExecute(message) {
      try {
        const { code, config } = message.data;
        this.currentExecutionId = message.id;
        console.log("\u25B6\uFE0F [WORKER] Starting execution:", {
          executionId: message.id,
          codeLength: code.length
        });
        console.log("\u{1F527} [WORKER] Creating interpreter with ServiceWorkerDeviceAdapter:", {
          hasOriginalDeviceAdapter: !!config.deviceAdapter,
          maxIterations: config.maxIterations,
          maxOutputLines: config.maxOutputLines
        });
        this.interpreter = new BasicInterpreter({
          ...config,
          deviceAdapter: this.serviceWorkerDeviceAdapter
          // Use ServiceWorkerDeviceAdapter (non-null assertion)
        });
        console.log("\u2705 [WORKER] Interpreter created with ServiceWorkerDeviceAdapter");
        console.log("\u{1F680} [WORKER] Executing BASIC code");
        this.isRunning = true;
        const result = await this.interpreter.execute(code);
        this.isRunning = false;
        console.log("\u2705 [WORKER] Execution completed:", {
          success: result.success,
          outputLines: this.serviceWorkerDeviceAdapter?.printOutput.length || 0,
          executionTime: result.executionTime
        });
        const enhancedResult = {
          ...result,
          executionId: message.id,
          workerId: "service-worker-1"
        };
        this.sendResult(message.id, enhancedResult);
      } catch (error) {
        this.isRunning = false;
        this.sendError(message.id, error instanceof Error ? error : new Error(String(error)));
      }
    }
    handleStop(_message) {
      console.log("\u23F9\uFE0F [WORKER] Stopping execution:", {
        wasRunning: this.isRunning,
        currentExecutionId: this.currentExecutionId
      });
      this.isRunning = false;
      if (this.interpreter) {
        console.log("\u{1F6D1} [WORKER] Calling interpreter.stop()");
        this.interpreter.stop();
      }
    }
    handleStrigEvent(message) {
      const { joystickId, state } = message.data;
      console.log("\u{1F3AE} [WORKER] Processing STRIG event:", { joystickId, state });
      if (this.serviceWorkerDeviceAdapter) {
        console.log("\u{1F3AE} [WORKER] Updating ServiceWorkerDeviceAdapter STRIG buffer");
        this.serviceWorkerDeviceAdapter.pushStrigState(joystickId, state);
      } else {
        console.log("\u{1F3AE} [WORKER] No ServiceWorkerDeviceAdapter available for STRIG event");
      }
    }
    handleStickEvent(message) {
      const { joystickId, state } = message.data;
      console.log("\u{1F3AE} [WORKER] Processing STICK event:", { joystickId, state });
      if (this.serviceWorkerDeviceAdapter) {
        console.log("\u{1F3AE} [WORKER] Updating ServiceWorkerDeviceAdapter STICK state");
        this.serviceWorkerDeviceAdapter.setStickState(joystickId, state);
      } else {
        console.log("\u{1F3AE} [WORKER] No ServiceWorkerDeviceAdapter available for STICK event");
      }
    }
    sendOutput(output, outputType) {
      if (!this.currentExecutionId) return;
      const message = {
        type: "OUTPUT",
        id: `output-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: this.currentExecutionId,
          output,
          outputType,
          timestamp: Date.now()
        }
      };
      console.log("\u{1F4E4} [WORKER\u2192MAIN] Sending OUTPUT message:", {
        outputType,
        outputLength: output.length,
        executionId: this.currentExecutionId
      });
      self.postMessage(message);
    }
    sendResult(messageId, result) {
      const message = {
        type: "RESULT",
        id: messageId,
        timestamp: Date.now(),
        data: result
      };
      console.log("\u{1F4CA} [WORKER\u2192MAIN] Sending RESULT message:", {
        messageId,
        success: result.success,
        executionTime: result.executionTime
      });
      self.postMessage(message);
    }
    sendError(messageId, error) {
      const message = {
        type: "ERROR",
        id: messageId,
        timestamp: Date.now(),
        data: {
          executionId: messageId,
          message: error.message,
          stack: error.stack,
          errorType: "execution",
          recoverable: true
        }
      };
      console.log("\u274C [WORKER\u2192MAIN] Sending ERROR message:", {
        messageId,
        errorMessage: error.message,
        errorType: "execution",
        recoverable: true
      });
      self.postMessage(message);
    }
  };
  new ServiceWorkerInterpreter();
})();
