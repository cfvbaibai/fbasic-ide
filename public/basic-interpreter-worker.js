"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // src/core/animation/AnimationManager.ts
  var AnimationManager = class {
    constructor() {
      __publicField(this, "moveDefinitions", /* @__PURE__ */ new Map());
      __publicField(this, "movementStates", /* @__PURE__ */ new Map());
      __publicField(this, "storedPositions", /* @__PURE__ */ new Map());
      __publicField(this, "deviceAdapter");
      const defaultPositions = [
        { x: 80, y: 80 },
        // Action 0: top-left
        { x: 176, y: 80 },
        // Action 1: top-right
        { x: 80, y: 160 },
        // Action 2: bottom-left
        { x: 176, y: 160 },
        // Action 3: bottom-right
        { x: 128, y: 60 },
        // Action 4: top-center
        { x: 128, y: 180 },
        // Action 5: bottom-center
        { x: 50, y: 120 },
        // Action 6: left-center
        { x: 206, y: 120 }
        // Action 7: right-center
      ];
      for (let i = 0; i < 8; i++) {
        this.storedPositions.set(i, defaultPositions[i] ?? { x: 120, y: 120 });
      }
    }
    /**
     * Set device adapter for sending animation commands
     */
    setDeviceAdapter(adapter) {
      this.deviceAdapter = adapter;
    }
    /**
     * Define a movement (DEF MOVE command)
     * Stores the movement definition but does not start movement
     */
    defineMovement(definition) {
      if (definition.actionNumber < 0 || definition.actionNumber > 7) {
        throw new Error(`Invalid action number: ${definition.actionNumber} (must be 0-7)`);
      }
      if (definition.characterType < 0 || definition.characterType > 15) {
        throw new Error(`Invalid character type: ${definition.characterType} (must be 0-15)`);
      }
      if (definition.direction < 0 || definition.direction > 8) {
        throw new Error(`Invalid direction: ${definition.direction} (must be 0-8)`);
      }
      if (definition.speed < 1 || definition.speed > 255) {
        throw new Error(`Invalid speed: ${definition.speed} (must be 1-255)`);
      }
      if (definition.distance < 1 || definition.distance > 255) {
        throw new Error(`Invalid distance: ${definition.distance} (must be 1-255)`);
      }
      if (definition.priority < 0 || definition.priority > 1) {
        throw new Error(`Invalid priority: ${definition.priority} (must be 0-1)`);
      }
      if (definition.colorCombination < 0 || definition.colorCombination > 3) {
        throw new Error(`Invalid color combination: ${definition.colorCombination} (must be 0-3)`);
      }
      this.moveDefinitions.set(definition.actionNumber, definition);
    }
    /**
     * Get movement definition
     */
    getMoveDefinition(actionNumber) {
      return this.moveDefinitions.get(actionNumber);
    }
    /**
     * Start movement (MOVE command)
     * Initializes movement state and begins animation
     */
    startMovement(actionNumber, startX, startY) {
      const definition = this.moveDefinitions.get(actionNumber);
      if (!definition) {
        throw new Error(`No movement definition for action number ${actionNumber} (use DEF MOVE first)`);
      }
      const storedPos = this.storedPositions.get(actionNumber);
      const initialX = startX ?? storedPos?.x ?? 120;
      const initialY = startY ?? storedPos?.y ?? 120;
      const { deltaX, deltaY } = this.getDirectionDeltas(definition.direction);
      const speedDotsPerSecond = definition.speed > 0 ? 60 / definition.speed : 0;
      const totalDistance = 2 * definition.distance;
      const movementState = {
        actionNumber,
        definition,
        startX: initialX,
        startY: initialY,
        currentX: initialX,
        currentY: initialY,
        remainingDistance: totalDistance,
        totalDistance,
        speedDotsPerSecond,
        directionDeltaX: deltaX,
        directionDeltaY: deltaY,
        isActive: true,
        currentFrameIndex: 0,
        frameCounter: 0
      };
      this.movementStates.set(actionNumber, movementState);
      if (this.deviceAdapter?.sendAnimationCommand) {
        const command = {
          type: "START_MOVEMENT",
          actionNumber,
          definition,
          startX: initialX,
          startY: initialY
        };
        this.deviceAdapter.sendAnimationCommand(command);
      }
    }
    /**
     * Update all active movements (called each frame)
     * @param deltaTime - Time elapsed since last frame in milliseconds
     */
    updateMovements(deltaTime) {
      for (const movement of this.movementStates.values()) {
        if (!movement.isActive || movement.remainingDistance <= 0) {
          movement.isActive = false;
          continue;
        }
        const dotsPerFrame = movement.speedDotsPerSecond * (deltaTime / 1e3);
        const distanceThisFrame = Math.min(dotsPerFrame, movement.remainingDistance);
        movement.currentX += movement.directionDeltaX * distanceThisFrame;
        movement.currentY += movement.directionDeltaY * distanceThisFrame;
        movement.remainingDistance -= distanceThisFrame;
        movement.currentX = Math.max(0, Math.min(255, movement.currentX));
        movement.currentY = Math.max(0, Math.min(239, movement.currentY));
        if (movement.remainingDistance <= 0) {
          movement.isActive = false;
          this.storedPositions.set(movement.actionNumber, {
            x: movement.currentX,
            y: movement.currentY
          });
        }
      }
    }
    /**
     * Stop movement (CUT command)
     * Stops movement but keeps sprite visible at current position
     */
    stopMovement(actionNumbers) {
      for (const actionNumber of actionNumbers) {
        const movement = this.movementStates.get(actionNumber);
        if (movement) {
          movement.isActive = false;
          this.storedPositions.set(actionNumber, {
            x: movement.currentX,
            y: movement.currentY
          });
        }
      }
    }
    /**
     * Erase movement (ERA command)
     * Stops movement and hides sprite
     */
    eraseMovement(actionNumbers) {
      for (const actionNumber of actionNumbers) {
        const movement = this.movementStates.get(actionNumber);
        if (movement) {
          movement.isActive = false;
        }
        this.movementStates.delete(actionNumber);
      }
    }
    /**
     * Set initial position (POSITION command)
     * Stores position for next MOVE command
     */
    setPosition(actionNumber, x, y) {
      if (actionNumber < 0 || actionNumber > 7) {
        throw new Error(`Invalid action number: ${actionNumber} (must be 0-7)`);
      }
      if (x < 0 || x > 255) {
        throw new Error(`Invalid X coordinate: ${x} (must be 0-255)`);
      }
      if (y < 0 || y > 239) {
        throw new Error(`Invalid Y coordinate: ${y} (must be 0-239)`);
      }
      this.storedPositions.set(actionNumber, { x, y });
    }
    /**
     * Get movement status (MOVE(n) function)
     * Returns -1 if movement is active, 0 if complete or not started
     */
    getMovementStatus(actionNumber) {
      const movement = this.movementStates.get(actionNumber);
      if (movement?.isActive) {
        return -1;
      }
      return 0;
    }
    /**
     * Get sprite position (XPOS/YPOS functions)
     */
    getSpritePosition(actionNumber) {
      const movement = this.movementStates.get(actionNumber);
      if (movement) {
        return {
          x: movement.currentX,
          y: movement.currentY
        };
      }
      const stored = this.storedPositions.get(actionNumber);
      if (stored) {
        return stored;
      }
      return null;
    }
    /**
     * Get all active movement states
     */
    getAllMovementStates() {
      return Array.from(this.movementStates.values());
    }
    /**
     * Get movement state for a specific action number
     */
    getMovementState(actionNumber) {
      return this.movementStates.get(actionNumber);
    }
    /**
     * Calculate direction deltas from direction code
     * Direction: 0=none, 1=up, 2=up-right, 3=right, 4=down-right,
     *            5=down, 6=down-left, 7=left, 8=up-left
     * Returns dx, dy in range [-1, 0, 1]
     */
    getDirectionDeltas(direction) {
      switch (direction) {
        case 0:
          return { deltaX: 0, deltaY: 0 };
        case 1:
          return { deltaX: 0, deltaY: -1 };
        case 2:
          return { deltaX: 1, deltaY: -1 };
        case 3:
          return { deltaX: 1, deltaY: 0 };
        case 4:
          return { deltaX: 1, deltaY: 1 };
        case 5:
          return { deltaX: 0, deltaY: 1 };
        case 6:
          return { deltaX: -1, deltaY: 1 };
        case 7:
          return { deltaX: -1, deltaY: 0 };
        case 8:
          return { deltaX: -1, deltaY: -1 };
        default:
          return { deltaX: 0, deltaY: 0 };
      }
    }
    /**
     * Reset all movement states (for program reset)
     */
    reset() {
      this.movementStates.clear();
      this.moveDefinitions.clear();
      for (let i = 0; i < 8; i++) {
        this.storedPositions.set(i, { x: 120, y: 120 });
      }
    }
  };

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
    WEB_WORKER: {
      ENABLED_PRODUCTION: true,
      ENABLED_TEST: false,
      WORKER_SCRIPT: "/basic-interpreter-worker.js",
      MESSAGE_TIMEOUT: 3e4
      // 30 seconds timeout for web worker messages
    }
  };
  var ERROR_TYPES = {
    SYNTAX: "SYNTAX",
    RUNTIME: "RUNTIME",
    COMPILATION: "COMPILATION"
  };
  var TIMING = {
    FRAME_RATE: 30,
    // Family BASIC frame rate (frames per second)
    FRAME_DURATION_MS: 1e3 / 30
    // Duration of one frame in milliseconds (~33.33ms)
  };
  var SCREEN_DIMENSIONS = {
    BACKGROUND: {
      MAX_X: 27,
      // Maximum X coordinate (0-27, 28 columns)
      MAX_Y: 23,
      // Maximum Y coordinate (0-23, 24 lines)
      COLUMNS: 28,
      // Total columns
      LINES: 24
      // Total lines
    },
    BACKDROP: {
      MAX_X: 31,
      // Maximum X coordinate (0-31, 32 columns)
      MAX_Y: 29,
      // Maximum Y coordinate (0-29, 30 lines)
      COLUMNS: 32,
      // Total columns  
      LINES: 30
      // Total lines
    },
    BG_GRAPHIC: {
      MAX_X: 27,
      // Maximum X coordinate (0-27, 28 columns)
      MAX_Y: 20,
      // Maximum Y coordinate (0-20, 21 lines)
      COLUMNS: 28,
      // Total columns
      LINES: 21
      // Total lines
    },
    SPRITE: {
      MAX_X: 255,
      // Maximum X coordinate (0-255, 256 dots)
      MAX_Y: 239,
      // Maximum Y coordinate (0-239, 240 dots)
      WIDTH: 256,
      // Total width in dots
      HEIGHT: 240
      // Total height in dots
    }
  };
  var COLOR_PATTERNS = {
    MIN: 0,
    // Minimum color pattern number
    MAX: 3
    // Maximum color pattern number (0-3)
  };
  var COLOR_CODES = {
    MIN: 0,
    // Minimum color code
    MAX: 60
    // Maximum color code (0-60)
  };
  var PRINT_TAB_STOPS = {
    BLOCK_1_END: 8,
    // End of block 1 (columns 0-7)
    BLOCK_2_END: 16,
    // End of block 2 (columns 8-15)
    BLOCK_3_END: 24,
    // End of block 3 (columns 16-23)
    BLOCK_4_END: 28
    // End of block 4 (columns 24-27)
  };

  // node_modules/.pnpm/decimal.js@10.6.0/node_modules/decimal.js/decimal.mjs
  var EXP_LIMIT = 9e15;
  var MAX_DIGITS = 1e9;
  var NUMERALS = "0123456789abcdef";
  var LN10 = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058";
  var PI = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789";
  var DEFAULTS2 = {
    // These values must be integers within the stated ranges (inclusive).
    // Most of these values can be changed at run-time using the `Decimal.config` method.
    // The maximum number of significant digits of the result of a calculation or base conversion.
    // E.g. `Decimal.config({ precision: 20 });`
    precision: 20,
    // 1 to MAX_DIGITS
    // The rounding mode used when rounding to `precision`.
    //
    // ROUND_UP         0 Away from zero.
    // ROUND_DOWN       1 Towards zero.
    // ROUND_CEIL       2 Towards +Infinity.
    // ROUND_FLOOR      3 Towards -Infinity.
    // ROUND_HALF_UP    4 Towards nearest neighbour. If equidistant, up.
    // ROUND_HALF_DOWN  5 Towards nearest neighbour. If equidistant, down.
    // ROUND_HALF_EVEN  6 Towards nearest neighbour. If equidistant, towards even neighbour.
    // ROUND_HALF_CEIL  7 Towards nearest neighbour. If equidistant, towards +Infinity.
    // ROUND_HALF_FLOOR 8 Towards nearest neighbour. If equidistant, towards -Infinity.
    //
    // E.g.
    // `Decimal.rounding = 4;`
    // `Decimal.rounding = Decimal.ROUND_HALF_UP;`
    rounding: 4,
    // 0 to 8
    // The modulo mode used when calculating the modulus: a mod n.
    // The quotient (q = a / n) is calculated according to the corresponding rounding mode.
    // The remainder (r) is calculated as: r = a - n * q.
    //
    // UP         0 The remainder is positive if the dividend is negative, else is negative.
    // DOWN       1 The remainder has the same sign as the dividend (JavaScript %).
    // FLOOR      3 The remainder has the same sign as the divisor (Python %).
    // HALF_EVEN  6 The IEEE 754 remainder function.
    // EUCLID     9 Euclidian division. q = sign(n) * floor(a / abs(n)). Always positive.
    //
    // Truncated division (1), floored division (3), the IEEE 754 remainder (6), and Euclidian
    // division (9) are commonly used for the modulus operation. The other rounding modes can also
    // be used, but they may not give useful results.
    modulo: 1,
    // 0 to 9
    // The exponent value at and beneath which `toString` returns exponential notation.
    // JavaScript numbers: -7
    toExpNeg: -7,
    // 0 to -EXP_LIMIT
    // The exponent value at and above which `toString` returns exponential notation.
    // JavaScript numbers: 21
    toExpPos: 21,
    // 0 to EXP_LIMIT
    // The minimum exponent value, beneath which underflow to zero occurs.
    // JavaScript numbers: -324  (5e-324)
    minE: -EXP_LIMIT,
    // -1 to -EXP_LIMIT
    // The maximum exponent value, above which overflow to Infinity occurs.
    // JavaScript numbers: 308  (1.7976931348623157e+308)
    maxE: EXP_LIMIT,
    // 1 to EXP_LIMIT
    // Whether to use cryptographically-secure random number generation, if available.
    crypto: false
    // true/false
  };
  var inexact;
  var quadrant;
  var external = true;
  var decimalError = "[DecimalError] ";
  var invalidArgument = decimalError + "Invalid argument: ";
  var precisionLimitExceeded = decimalError + "Precision limit exceeded";
  var cryptoUnavailable = decimalError + "crypto unavailable";
  var tag = "[object Decimal]";
  var mathfloor = Math.floor;
  var mathpow = Math.pow;
  var isBinary = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
  var isHex = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
  var isOctal = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
  var isDecimal = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
  var BASE = 1e7;
  var LOG_BASE = 7;
  var MAX_SAFE_INTEGER = 9007199254740991;
  var LN10_PRECISION = LN10.length - 1;
  var PI_PRECISION = PI.length - 1;
  var P = { toStringTag: tag };
  P.absoluteValue = P.abs = function() {
    var x = new this.constructor(this);
    if (x.s < 0) x.s = 1;
    return finalise(x);
  };
  P.ceil = function() {
    return finalise(new this.constructor(this), this.e + 1, 2);
  };
  P.clampedTo = P.clamp = function(min2, max2) {
    var k, x = this, Ctor = x.constructor;
    min2 = new Ctor(min2);
    max2 = new Ctor(max2);
    if (!min2.s || !max2.s) return new Ctor(NaN);
    if (min2.gt(max2)) throw Error(invalidArgument + max2);
    k = x.cmp(min2);
    return k < 0 ? min2 : x.cmp(max2) > 0 ? max2 : new Ctor(x);
  };
  P.comparedTo = P.cmp = function(y) {
    var i, j, xdL, ydL, x = this, xd = x.d, yd = (y = new x.constructor(y)).d, xs = x.s, ys = y.s;
    if (!xd || !yd) {
      return !xs || !ys ? NaN : xs !== ys ? xs : xd === yd ? 0 : !xd ^ xs < 0 ? 1 : -1;
    }
    if (!xd[0] || !yd[0]) return xd[0] ? xs : yd[0] ? -ys : 0;
    if (xs !== ys) return xs;
    if (x.e !== y.e) return x.e > y.e ^ xs < 0 ? 1 : -1;
    xdL = xd.length;
    ydL = yd.length;
    for (i = 0, j = xdL < ydL ? xdL : ydL; i < j; ++i) {
      if (xd[i] !== yd[i]) return xd[i] > yd[i] ^ xs < 0 ? 1 : -1;
    }
    return xdL === ydL ? 0 : xdL > ydL ^ xs < 0 ? 1 : -1;
  };
  P.cosine = P.cos = function() {
    var pr, rm, x = this, Ctor = x.constructor;
    if (!x.d) return new Ctor(NaN);
    if (!x.d[0]) return new Ctor(1);
    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
    Ctor.rounding = 1;
    x = cosine(Ctor, toLessThanHalfPi(Ctor, x));
    Ctor.precision = pr;
    Ctor.rounding = rm;
    return finalise(quadrant == 2 || quadrant == 3 ? x.neg() : x, pr, rm, true);
  };
  P.cubeRoot = P.cbrt = function() {
    var e, m, n, r, rep, s, sd, t, t3, t3plusx, x = this, Ctor = x.constructor;
    if (!x.isFinite() || x.isZero()) return new Ctor(x);
    external = false;
    s = x.s * mathpow(x.s * x, 1 / 3);
    if (!s || Math.abs(s) == 1 / 0) {
      n = digitsToString(x.d);
      e = x.e;
      if (s = (e - n.length + 1) % 3) n += s == 1 || s == -2 ? "0" : "00";
      s = mathpow(n, 1 / 3);
      e = mathfloor((e + 1) / 3) - (e % 3 == (e < 0 ? -1 : 2));
      if (s == 1 / 0) {
        n = "5e" + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf("e") + 1) + e;
      }
      r = new Ctor(n);
      r.s = x.s;
    } else {
      r = new Ctor(s.toString());
    }
    sd = (e = Ctor.precision) + 3;
    for (; ; ) {
      t = r;
      t3 = t.times(t).times(t);
      t3plusx = t3.plus(x);
      r = divide(t3plusx.plus(x).times(t), t3plusx.plus(t3), sd + 2, 1);
      if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
        n = n.slice(sd - 3, sd + 1);
        if (n == "9999" || !rep && n == "4999") {
          if (!rep) {
            finalise(t, e + 1, 0);
            if (t.times(t).times(t).eq(x)) {
              r = t;
              break;
            }
          }
          sd += 4;
          rep = 1;
        } else {
          if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
            finalise(r, e + 1, 1);
            m = !r.times(r).times(r).eq(x);
          }
          break;
        }
      }
    }
    external = true;
    return finalise(r, e, Ctor.rounding, m);
  };
  P.decimalPlaces = P.dp = function() {
    var w, d = this.d, n = NaN;
    if (d) {
      w = d.length - 1;
      n = (w - mathfloor(this.e / LOG_BASE)) * LOG_BASE;
      w = d[w];
      if (w) for (; w % 10 == 0; w /= 10) n--;
      if (n < 0) n = 0;
    }
    return n;
  };
  P.dividedBy = P.div = function(y) {
    return divide(this, new this.constructor(y));
  };
  P.dividedToIntegerBy = P.divToInt = function(y) {
    var x = this, Ctor = x.constructor;
    return finalise(divide(x, new Ctor(y), 0, 1, 1), Ctor.precision, Ctor.rounding);
  };
  P.equals = P.eq = function(y) {
    return this.cmp(y) === 0;
  };
  P.floor = function() {
    return finalise(new this.constructor(this), this.e + 1, 3);
  };
  P.greaterThan = P.gt = function(y) {
    return this.cmp(y) > 0;
  };
  P.greaterThanOrEqualTo = P.gte = function(y) {
    var k = this.cmp(y);
    return k == 1 || k === 0;
  };
  P.hyperbolicCosine = P.cosh = function() {
    var k, n, pr, rm, len, x = this, Ctor = x.constructor, one = new Ctor(1);
    if (!x.isFinite()) return new Ctor(x.s ? 1 / 0 : NaN);
    if (x.isZero()) return one;
    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
    Ctor.rounding = 1;
    len = x.d.length;
    if (len < 32) {
      k = Math.ceil(len / 3);
      n = (1 / tinyPow(4, k)).toString();
    } else {
      k = 16;
      n = "2.3283064365386962890625e-10";
    }
    x = taylorSeries(Ctor, 1, x.times(n), new Ctor(1), true);
    var cosh2_x, i = k, d8 = new Ctor(8);
    for (; i--; ) {
      cosh2_x = x.times(x);
      x = one.minus(cosh2_x.times(d8.minus(cosh2_x.times(d8))));
    }
    return finalise(x, Ctor.precision = pr, Ctor.rounding = rm, true);
  };
  P.hyperbolicSine = P.sinh = function() {
    var k, pr, rm, len, x = this, Ctor = x.constructor;
    if (!x.isFinite() || x.isZero()) return new Ctor(x);
    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + 4;
    Ctor.rounding = 1;
    len = x.d.length;
    if (len < 3) {
      x = taylorSeries(Ctor, 2, x, x, true);
    } else {
      k = 1.4 * Math.sqrt(len);
      k = k > 16 ? 16 : k | 0;
      x = x.times(1 / tinyPow(5, k));
      x = taylorSeries(Ctor, 2, x, x, true);
      var sinh2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
      for (; k--; ) {
        sinh2_x = x.times(x);
        x = x.times(d5.plus(sinh2_x.times(d16.times(sinh2_x).plus(d20))));
      }
    }
    Ctor.precision = pr;
    Ctor.rounding = rm;
    return finalise(x, pr, rm, true);
  };
  P.hyperbolicTangent = P.tanh = function() {
    var pr, rm, x = this, Ctor = x.constructor;
    if (!x.isFinite()) return new Ctor(x.s);
    if (x.isZero()) return new Ctor(x);
    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 7;
    Ctor.rounding = 1;
    return divide(x.sinh(), x.cosh(), Ctor.precision = pr, Ctor.rounding = rm);
  };
  P.inverseCosine = P.acos = function() {
    var x = this, Ctor = x.constructor, k = x.abs().cmp(1), pr = Ctor.precision, rm = Ctor.rounding;
    if (k !== -1) {
      return k === 0 ? x.isNeg() ? getPi(Ctor, pr, rm) : new Ctor(0) : new Ctor(NaN);
    }
    if (x.isZero()) return getPi(Ctor, pr + 4, rm).times(0.5);
    Ctor.precision = pr + 6;
    Ctor.rounding = 1;
    x = new Ctor(1).minus(x).div(x.plus(1)).sqrt().atan();
    Ctor.precision = pr;
    Ctor.rounding = rm;
    return x.times(2);
  };
  P.inverseHyperbolicCosine = P.acosh = function() {
    var pr, rm, x = this, Ctor = x.constructor;
    if (x.lte(1)) return new Ctor(x.eq(1) ? 0 : NaN);
    if (!x.isFinite()) return new Ctor(x);
    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(Math.abs(x.e), x.sd()) + 4;
    Ctor.rounding = 1;
    external = false;
    x = x.times(x).minus(1).sqrt().plus(x);
    external = true;
    Ctor.precision = pr;
    Ctor.rounding = rm;
    return x.ln();
  };
  P.inverseHyperbolicSine = P.asinh = function() {
    var pr, rm, x = this, Ctor = x.constructor;
    if (!x.isFinite() || x.isZero()) return new Ctor(x);
    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 2 * Math.max(Math.abs(x.e), x.sd()) + 6;
    Ctor.rounding = 1;
    external = false;
    x = x.times(x).plus(1).sqrt().plus(x);
    external = true;
    Ctor.precision = pr;
    Ctor.rounding = rm;
    return x.ln();
  };
  P.inverseHyperbolicTangent = P.atanh = function() {
    var pr, rm, wpr, xsd, x = this, Ctor = x.constructor;
    if (!x.isFinite()) return new Ctor(NaN);
    if (x.e >= 0) return new Ctor(x.abs().eq(1) ? x.s / 0 : x.isZero() ? x : NaN);
    pr = Ctor.precision;
    rm = Ctor.rounding;
    xsd = x.sd();
    if (Math.max(xsd, pr) < 2 * -x.e - 1) return finalise(new Ctor(x), pr, rm, true);
    Ctor.precision = wpr = xsd - x.e;
    x = divide(x.plus(1), new Ctor(1).minus(x), wpr + pr, 1);
    Ctor.precision = pr + 4;
    Ctor.rounding = 1;
    x = x.ln();
    Ctor.precision = pr;
    Ctor.rounding = rm;
    return x.times(0.5);
  };
  P.inverseSine = P.asin = function() {
    var halfPi, k, pr, rm, x = this, Ctor = x.constructor;
    if (x.isZero()) return new Ctor(x);
    k = x.abs().cmp(1);
    pr = Ctor.precision;
    rm = Ctor.rounding;
    if (k !== -1) {
      if (k === 0) {
        halfPi = getPi(Ctor, pr + 4, rm).times(0.5);
        halfPi.s = x.s;
        return halfPi;
      }
      return new Ctor(NaN);
    }
    Ctor.precision = pr + 6;
    Ctor.rounding = 1;
    x = x.div(new Ctor(1).minus(x.times(x)).sqrt().plus(1)).atan();
    Ctor.precision = pr;
    Ctor.rounding = rm;
    return x.times(2);
  };
  P.inverseTangent = P.atan = function() {
    var i, j, k, n, px, t, r, wpr, x2, x = this, Ctor = x.constructor, pr = Ctor.precision, rm = Ctor.rounding;
    if (!x.isFinite()) {
      if (!x.s) return new Ctor(NaN);
      if (pr + 4 <= PI_PRECISION) {
        r = getPi(Ctor, pr + 4, rm).times(0.5);
        r.s = x.s;
        return r;
      }
    } else if (x.isZero()) {
      return new Ctor(x);
    } else if (x.abs().eq(1) && pr + 4 <= PI_PRECISION) {
      r = getPi(Ctor, pr + 4, rm).times(0.25);
      r.s = x.s;
      return r;
    }
    Ctor.precision = wpr = pr + 10;
    Ctor.rounding = 1;
    k = Math.min(28, wpr / LOG_BASE + 2 | 0);
    for (i = k; i; --i) x = x.div(x.times(x).plus(1).sqrt().plus(1));
    external = false;
    j = Math.ceil(wpr / LOG_BASE);
    n = 1;
    x2 = x.times(x);
    r = new Ctor(x);
    px = x;
    for (; i !== -1; ) {
      px = px.times(x2);
      t = r.minus(px.div(n += 2));
      px = px.times(x2);
      r = t.plus(px.div(n += 2));
      if (r.d[j] !== void 0) for (i = j; r.d[i] === t.d[i] && i--; ) ;
    }
    if (k) r = r.times(2 << k - 1);
    external = true;
    return finalise(r, Ctor.precision = pr, Ctor.rounding = rm, true);
  };
  P.isFinite = function() {
    return !!this.d;
  };
  P.isInteger = P.isInt = function() {
    return !!this.d && mathfloor(this.e / LOG_BASE) > this.d.length - 2;
  };
  P.isNaN = function() {
    return !this.s;
  };
  P.isNegative = P.isNeg = function() {
    return this.s < 0;
  };
  P.isPositive = P.isPos = function() {
    return this.s > 0;
  };
  P.isZero = function() {
    return !!this.d && this.d[0] === 0;
  };
  P.lessThan = P.lt = function(y) {
    return this.cmp(y) < 0;
  };
  P.lessThanOrEqualTo = P.lte = function(y) {
    return this.cmp(y) < 1;
  };
  P.logarithm = P.log = function(base) {
    var isBase10, d, denominator, k, inf, num, sd, r, arg = this, Ctor = arg.constructor, pr = Ctor.precision, rm = Ctor.rounding, guard = 5;
    if (base == null) {
      base = new Ctor(10);
      isBase10 = true;
    } else {
      base = new Ctor(base);
      d = base.d;
      if (base.s < 0 || !d || !d[0] || base.eq(1)) return new Ctor(NaN);
      isBase10 = base.eq(10);
    }
    d = arg.d;
    if (arg.s < 0 || !d || !d[0] || arg.eq(1)) {
      return new Ctor(d && !d[0] ? -1 / 0 : arg.s != 1 ? NaN : d ? 0 : 1 / 0);
    }
    if (isBase10) {
      if (d.length > 1) {
        inf = true;
      } else {
        for (k = d[0]; k % 10 === 0; ) k /= 10;
        inf = k !== 1;
      }
    }
    external = false;
    sd = pr + guard;
    num = naturalLogarithm(arg, sd);
    denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
    r = divide(num, denominator, sd, 1);
    if (checkRoundingDigits(r.d, k = pr, rm)) {
      do {
        sd += 10;
        num = naturalLogarithm(arg, sd);
        denominator = isBase10 ? getLn10(Ctor, sd + 10) : naturalLogarithm(base, sd);
        r = divide(num, denominator, sd, 1);
        if (!inf) {
          if (+digitsToString(r.d).slice(k + 1, k + 15) + 1 == 1e14) {
            r = finalise(r, pr + 1, 0);
          }
          break;
        }
      } while (checkRoundingDigits(r.d, k += 10, rm));
    }
    external = true;
    return finalise(r, pr, rm);
  };
  P.minus = P.sub = function(y) {
    var d, e, i, j, k, len, pr, rm, xd, xe, xLTy, yd, x = this, Ctor = x.constructor;
    y = new Ctor(y);
    if (!x.d || !y.d) {
      if (!x.s || !y.s) y = new Ctor(NaN);
      else if (x.d) y.s = -y.s;
      else y = new Ctor(y.d || x.s !== y.s ? x : NaN);
      return y;
    }
    if (x.s != y.s) {
      y.s = -y.s;
      return x.plus(y);
    }
    xd = x.d;
    yd = y.d;
    pr = Ctor.precision;
    rm = Ctor.rounding;
    if (!xd[0] || !yd[0]) {
      if (yd[0]) y.s = -y.s;
      else if (xd[0]) y = new Ctor(x);
      else return new Ctor(rm === 3 ? -0 : 0);
      return external ? finalise(y, pr, rm) : y;
    }
    e = mathfloor(y.e / LOG_BASE);
    xe = mathfloor(x.e / LOG_BASE);
    xd = xd.slice();
    k = xe - e;
    if (k) {
      xLTy = k < 0;
      if (xLTy) {
        d = xd;
        k = -k;
        len = yd.length;
      } else {
        d = yd;
        e = xe;
        len = xd.length;
      }
      i = Math.max(Math.ceil(pr / LOG_BASE), len) + 2;
      if (k > i) {
        k = i;
        d.length = 1;
      }
      d.reverse();
      for (i = k; i--; ) d.push(0);
      d.reverse();
    } else {
      i = xd.length;
      len = yd.length;
      xLTy = i < len;
      if (xLTy) len = i;
      for (i = 0; i < len; i++) {
        if (xd[i] != yd[i]) {
          xLTy = xd[i] < yd[i];
          break;
        }
      }
      k = 0;
    }
    if (xLTy) {
      d = xd;
      xd = yd;
      yd = d;
      y.s = -y.s;
    }
    len = xd.length;
    for (i = yd.length - len; i > 0; --i) xd[len++] = 0;
    for (i = yd.length; i > k; ) {
      if (xd[--i] < yd[i]) {
        for (j = i; j && xd[--j] === 0; ) xd[j] = BASE - 1;
        --xd[j];
        xd[i] += BASE;
      }
      xd[i] -= yd[i];
    }
    for (; xd[--len] === 0; ) xd.pop();
    for (; xd[0] === 0; xd.shift()) --e;
    if (!xd[0]) return new Ctor(rm === 3 ? -0 : 0);
    y.d = xd;
    y.e = getBase10Exponent(xd, e);
    return external ? finalise(y, pr, rm) : y;
  };
  P.modulo = P.mod = function(y) {
    var q, x = this, Ctor = x.constructor;
    y = new Ctor(y);
    if (!x.d || !y.s || y.d && !y.d[0]) return new Ctor(NaN);
    if (!y.d || x.d && !x.d[0]) {
      return finalise(new Ctor(x), Ctor.precision, Ctor.rounding);
    }
    external = false;
    if (Ctor.modulo == 9) {
      q = divide(x, y.abs(), 0, 3, 1);
      q.s *= y.s;
    } else {
      q = divide(x, y, 0, Ctor.modulo, 1);
    }
    q = q.times(y);
    external = true;
    return x.minus(q);
  };
  P.naturalExponential = P.exp = function() {
    return naturalExponential(this);
  };
  P.naturalLogarithm = P.ln = function() {
    return naturalLogarithm(this);
  };
  P.negated = P.neg = function() {
    var x = new this.constructor(this);
    x.s = -x.s;
    return finalise(x);
  };
  P.plus = P.add = function(y) {
    var carry, d, e, i, k, len, pr, rm, xd, yd, x = this, Ctor = x.constructor;
    y = new Ctor(y);
    if (!x.d || !y.d) {
      if (!x.s || !y.s) y = new Ctor(NaN);
      else if (!x.d) y = new Ctor(y.d || x.s === y.s ? x : NaN);
      return y;
    }
    if (x.s != y.s) {
      y.s = -y.s;
      return x.minus(y);
    }
    xd = x.d;
    yd = y.d;
    pr = Ctor.precision;
    rm = Ctor.rounding;
    if (!xd[0] || !yd[0]) {
      if (!yd[0]) y = new Ctor(x);
      return external ? finalise(y, pr, rm) : y;
    }
    k = mathfloor(x.e / LOG_BASE);
    e = mathfloor(y.e / LOG_BASE);
    xd = xd.slice();
    i = k - e;
    if (i) {
      if (i < 0) {
        d = xd;
        i = -i;
        len = yd.length;
      } else {
        d = yd;
        e = k;
        len = xd.length;
      }
      k = Math.ceil(pr / LOG_BASE);
      len = k > len ? k + 1 : len + 1;
      if (i > len) {
        i = len;
        d.length = 1;
      }
      d.reverse();
      for (; i--; ) d.push(0);
      d.reverse();
    }
    len = xd.length;
    i = yd.length;
    if (len - i < 0) {
      i = len;
      d = yd;
      yd = xd;
      xd = d;
    }
    for (carry = 0; i; ) {
      carry = (xd[--i] = xd[i] + yd[i] + carry) / BASE | 0;
      xd[i] %= BASE;
    }
    if (carry) {
      xd.unshift(carry);
      ++e;
    }
    for (len = xd.length; xd[--len] == 0; ) xd.pop();
    y.d = xd;
    y.e = getBase10Exponent(xd, e);
    return external ? finalise(y, pr, rm) : y;
  };
  P.precision = P.sd = function(z) {
    var k, x = this;
    if (z !== void 0 && z !== !!z && z !== 1 && z !== 0) throw Error(invalidArgument + z);
    if (x.d) {
      k = getPrecision(x.d);
      if (z && x.e + 1 > k) k = x.e + 1;
    } else {
      k = NaN;
    }
    return k;
  };
  P.round = function() {
    var x = this, Ctor = x.constructor;
    return finalise(new Ctor(x), x.e + 1, Ctor.rounding);
  };
  P.sine = P.sin = function() {
    var pr, rm, x = this, Ctor = x.constructor;
    if (!x.isFinite()) return new Ctor(NaN);
    if (x.isZero()) return new Ctor(x);
    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + Math.max(x.e, x.sd()) + LOG_BASE;
    Ctor.rounding = 1;
    x = sine(Ctor, toLessThanHalfPi(Ctor, x));
    Ctor.precision = pr;
    Ctor.rounding = rm;
    return finalise(quadrant > 2 ? x.neg() : x, pr, rm, true);
  };
  P.squareRoot = P.sqrt = function() {
    var m, n, sd, r, rep, t, x = this, d = x.d, e = x.e, s = x.s, Ctor = x.constructor;
    if (s !== 1 || !d || !d[0]) {
      return new Ctor(!s || s < 0 && (!d || d[0]) ? NaN : d ? x : 1 / 0);
    }
    external = false;
    s = Math.sqrt(+x);
    if (s == 0 || s == 1 / 0) {
      n = digitsToString(d);
      if ((n.length + e) % 2 == 0) n += "0";
      s = Math.sqrt(n);
      e = mathfloor((e + 1) / 2) - (e < 0 || e % 2);
      if (s == 1 / 0) {
        n = "5e" + e;
      } else {
        n = s.toExponential();
        n = n.slice(0, n.indexOf("e") + 1) + e;
      }
      r = new Ctor(n);
    } else {
      r = new Ctor(s.toString());
    }
    sd = (e = Ctor.precision) + 3;
    for (; ; ) {
      t = r;
      r = t.plus(divide(x, t, sd + 2, 1)).times(0.5);
      if (digitsToString(t.d).slice(0, sd) === (n = digitsToString(r.d)).slice(0, sd)) {
        n = n.slice(sd - 3, sd + 1);
        if (n == "9999" || !rep && n == "4999") {
          if (!rep) {
            finalise(t, e + 1, 0);
            if (t.times(t).eq(x)) {
              r = t;
              break;
            }
          }
          sd += 4;
          rep = 1;
        } else {
          if (!+n || !+n.slice(1) && n.charAt(0) == "5") {
            finalise(r, e + 1, 1);
            m = !r.times(r).eq(x);
          }
          break;
        }
      }
    }
    external = true;
    return finalise(r, e, Ctor.rounding, m);
  };
  P.tangent = P.tan = function() {
    var pr, rm, x = this, Ctor = x.constructor;
    if (!x.isFinite()) return new Ctor(NaN);
    if (x.isZero()) return new Ctor(x);
    pr = Ctor.precision;
    rm = Ctor.rounding;
    Ctor.precision = pr + 10;
    Ctor.rounding = 1;
    x = x.sin();
    x.s = 1;
    x = divide(x, new Ctor(1).minus(x.times(x)).sqrt(), pr + 10, 0);
    Ctor.precision = pr;
    Ctor.rounding = rm;
    return finalise(quadrant == 2 || quadrant == 4 ? x.neg() : x, pr, rm, true);
  };
  P.times = P.mul = function(y) {
    var carry, e, i, k, r, rL, t, xdL, ydL, x = this, Ctor = x.constructor, xd = x.d, yd = (y = new Ctor(y)).d;
    y.s *= x.s;
    if (!xd || !xd[0] || !yd || !yd[0]) {
      return new Ctor(!y.s || xd && !xd[0] && !yd || yd && !yd[0] && !xd ? NaN : !xd || !yd ? y.s / 0 : y.s * 0);
    }
    e = mathfloor(x.e / LOG_BASE) + mathfloor(y.e / LOG_BASE);
    xdL = xd.length;
    ydL = yd.length;
    if (xdL < ydL) {
      r = xd;
      xd = yd;
      yd = r;
      rL = xdL;
      xdL = ydL;
      ydL = rL;
    }
    r = [];
    rL = xdL + ydL;
    for (i = rL; i--; ) r.push(0);
    for (i = ydL; --i >= 0; ) {
      carry = 0;
      for (k = xdL + i; k > i; ) {
        t = r[k] + yd[i] * xd[k - i - 1] + carry;
        r[k--] = t % BASE | 0;
        carry = t / BASE | 0;
      }
      r[k] = (r[k] + carry) % BASE | 0;
    }
    for (; !r[--rL]; ) r.pop();
    if (carry) ++e;
    else r.shift();
    y.d = r;
    y.e = getBase10Exponent(r, e);
    return external ? finalise(y, Ctor.precision, Ctor.rounding) : y;
  };
  P.toBinary = function(sd, rm) {
    return toStringBinary(this, 2, sd, rm);
  };
  P.toDecimalPlaces = P.toDP = function(dp, rm) {
    var x = this, Ctor = x.constructor;
    x = new Ctor(x);
    if (dp === void 0) return x;
    checkInt32(dp, 0, MAX_DIGITS);
    if (rm === void 0) rm = Ctor.rounding;
    else checkInt32(rm, 0, 8);
    return finalise(x, dp + x.e + 1, rm);
  };
  P.toExponential = function(dp, rm) {
    var str, x = this, Ctor = x.constructor;
    if (dp === void 0) {
      str = finiteToString(x, true);
    } else {
      checkInt32(dp, 0, MAX_DIGITS);
      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
      x = finalise(new Ctor(x), dp + 1, rm);
      str = finiteToString(x, true, dp + 1);
    }
    return x.isNeg() && !x.isZero() ? "-" + str : str;
  };
  P.toFixed = function(dp, rm) {
    var str, y, x = this, Ctor = x.constructor;
    if (dp === void 0) {
      str = finiteToString(x);
    } else {
      checkInt32(dp, 0, MAX_DIGITS);
      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
      y = finalise(new Ctor(x), dp + x.e + 1, rm);
      str = finiteToString(y, false, dp + y.e + 1);
    }
    return x.isNeg() && !x.isZero() ? "-" + str : str;
  };
  P.toFraction = function(maxD) {
    var d, d0, d1, d2, e, k, n, n0, n1, pr, q, r, x = this, xd = x.d, Ctor = x.constructor;
    if (!xd) return new Ctor(x);
    n1 = d0 = new Ctor(1);
    d1 = n0 = new Ctor(0);
    d = new Ctor(d1);
    e = d.e = getPrecision(xd) - x.e - 1;
    k = e % LOG_BASE;
    d.d[0] = mathpow(10, k < 0 ? LOG_BASE + k : k);
    if (maxD == null) {
      maxD = e > 0 ? d : n1;
    } else {
      n = new Ctor(maxD);
      if (!n.isInt() || n.lt(n1)) throw Error(invalidArgument + n);
      maxD = n.gt(d) ? e > 0 ? d : n1 : n;
    }
    external = false;
    n = new Ctor(digitsToString(xd));
    pr = Ctor.precision;
    Ctor.precision = e = xd.length * LOG_BASE * 2;
    for (; ; ) {
      q = divide(n, d, 0, 1, 1);
      d2 = d0.plus(q.times(d1));
      if (d2.cmp(maxD) == 1) break;
      d0 = d1;
      d1 = d2;
      d2 = n1;
      n1 = n0.plus(q.times(d2));
      n0 = d2;
      d2 = d;
      d = n.minus(q.times(d2));
      n = d2;
    }
    d2 = divide(maxD.minus(d0), d1, 0, 1, 1);
    n0 = n0.plus(d2.times(n1));
    d0 = d0.plus(d2.times(d1));
    n0.s = n1.s = x.s;
    r = divide(n1, d1, e, 1).minus(x).abs().cmp(divide(n0, d0, e, 1).minus(x).abs()) < 1 ? [n1, d1] : [n0, d0];
    Ctor.precision = pr;
    external = true;
    return r;
  };
  P.toHexadecimal = P.toHex = function(sd, rm) {
    return toStringBinary(this, 16, sd, rm);
  };
  P.toNearest = function(y, rm) {
    var x = this, Ctor = x.constructor;
    x = new Ctor(x);
    if (y == null) {
      if (!x.d) return x;
      y = new Ctor(1);
      rm = Ctor.rounding;
    } else {
      y = new Ctor(y);
      if (rm === void 0) {
        rm = Ctor.rounding;
      } else {
        checkInt32(rm, 0, 8);
      }
      if (!x.d) return y.s ? x : y;
      if (!y.d) {
        if (y.s) y.s = x.s;
        return y;
      }
    }
    if (y.d[0]) {
      external = false;
      x = divide(x, y, 0, rm, 1).times(y);
      external = true;
      finalise(x);
    } else {
      y.s = x.s;
      x = y;
    }
    return x;
  };
  P.toNumber = function() {
    return +this;
  };
  P.toOctal = function(sd, rm) {
    return toStringBinary(this, 8, sd, rm);
  };
  P.toPower = P.pow = function(y) {
    var e, k, pr, r, rm, s, x = this, Ctor = x.constructor, yn = +(y = new Ctor(y));
    if (!x.d || !y.d || !x.d[0] || !y.d[0]) return new Ctor(mathpow(+x, yn));
    x = new Ctor(x);
    if (x.eq(1)) return x;
    pr = Ctor.precision;
    rm = Ctor.rounding;
    if (y.eq(1)) return finalise(x, pr, rm);
    e = mathfloor(y.e / LOG_BASE);
    if (e >= y.d.length - 1 && (k = yn < 0 ? -yn : yn) <= MAX_SAFE_INTEGER) {
      r = intPow(Ctor, x, k, pr);
      return y.s < 0 ? new Ctor(1).div(r) : finalise(r, pr, rm);
    }
    s = x.s;
    if (s < 0) {
      if (e < y.d.length - 1) return new Ctor(NaN);
      if ((y.d[e] & 1) == 0) s = 1;
      if (x.e == 0 && x.d[0] == 1 && x.d.length == 1) {
        x.s = s;
        return x;
      }
    }
    k = mathpow(+x, yn);
    e = k == 0 || !isFinite(k) ? mathfloor(yn * (Math.log("0." + digitsToString(x.d)) / Math.LN10 + x.e + 1)) : new Ctor(k + "").e;
    if (e > Ctor.maxE + 1 || e < Ctor.minE - 1) return new Ctor(e > 0 ? s / 0 : 0);
    external = false;
    Ctor.rounding = x.s = 1;
    k = Math.min(12, (e + "").length);
    r = naturalExponential(y.times(naturalLogarithm(x, pr + k)), pr);
    if (r.d) {
      r = finalise(r, pr + 5, 1);
      if (checkRoundingDigits(r.d, pr, rm)) {
        e = pr + 10;
        r = finalise(naturalExponential(y.times(naturalLogarithm(x, e + k)), e), e + 5, 1);
        if (+digitsToString(r.d).slice(pr + 1, pr + 15) + 1 == 1e14) {
          r = finalise(r, pr + 1, 0);
        }
      }
    }
    r.s = s;
    external = true;
    Ctor.rounding = rm;
    return finalise(r, pr, rm);
  };
  P.toPrecision = function(sd, rm) {
    var str, x = this, Ctor = x.constructor;
    if (sd === void 0) {
      str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
    } else {
      checkInt32(sd, 1, MAX_DIGITS);
      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
      x = finalise(new Ctor(x), sd, rm);
      str = finiteToString(x, sd <= x.e || x.e <= Ctor.toExpNeg, sd);
    }
    return x.isNeg() && !x.isZero() ? "-" + str : str;
  };
  P.toSignificantDigits = P.toSD = function(sd, rm) {
    var x = this, Ctor = x.constructor;
    if (sd === void 0) {
      sd = Ctor.precision;
      rm = Ctor.rounding;
    } else {
      checkInt32(sd, 1, MAX_DIGITS);
      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
    }
    return finalise(new Ctor(x), sd, rm);
  };
  P.toString = function() {
    var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
    return x.isNeg() && !x.isZero() ? "-" + str : str;
  };
  P.truncated = P.trunc = function() {
    return finalise(new this.constructor(this), this.e + 1, 1);
  };
  P.valueOf = P.toJSON = function() {
    var x = this, Ctor = x.constructor, str = finiteToString(x, x.e <= Ctor.toExpNeg || x.e >= Ctor.toExpPos);
    return x.isNeg() ? "-" + str : str;
  };
  function digitsToString(d) {
    var i, k, ws, indexOfLastWord = d.length - 1, str = "", w = d[0];
    if (indexOfLastWord > 0) {
      str += w;
      for (i = 1; i < indexOfLastWord; i++) {
        ws = d[i] + "";
        k = LOG_BASE - ws.length;
        if (k) str += getZeroString(k);
        str += ws;
      }
      w = d[i];
      ws = w + "";
      k = LOG_BASE - ws.length;
      if (k) str += getZeroString(k);
    } else if (w === 0) {
      return "0";
    }
    for (; w % 10 === 0; ) w /= 10;
    return str + w;
  }
  function checkInt32(i, min2, max2) {
    if (i !== ~~i || i < min2 || i > max2) {
      throw Error(invalidArgument + i);
    }
  }
  function checkRoundingDigits(d, i, rm, repeating) {
    var di, k, r, rd;
    for (k = d[0]; k >= 10; k /= 10) --i;
    if (--i < 0) {
      i += LOG_BASE;
      di = 0;
    } else {
      di = Math.ceil((i + 1) / LOG_BASE);
      i %= LOG_BASE;
    }
    k = mathpow(10, LOG_BASE - i);
    rd = d[di] % k | 0;
    if (repeating == null) {
      if (i < 3) {
        if (i == 0) rd = rd / 100 | 0;
        else if (i == 1) rd = rd / 10 | 0;
        r = rm < 4 && rd == 99999 || rm > 3 && rd == 49999 || rd == 5e4 || rd == 0;
      } else {
        r = (rm < 4 && rd + 1 == k || rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 100 | 0) == mathpow(10, i - 2) - 1 || (rd == k / 2 || rd == 0) && (d[di + 1] / k / 100 | 0) == 0;
      }
    } else {
      if (i < 4) {
        if (i == 0) rd = rd / 1e3 | 0;
        else if (i == 1) rd = rd / 100 | 0;
        else if (i == 2) rd = rd / 10 | 0;
        r = (repeating || rm < 4) && rd == 9999 || !repeating && rm > 3 && rd == 4999;
      } else {
        r = ((repeating || rm < 4) && rd + 1 == k || !repeating && rm > 3 && rd + 1 == k / 2) && (d[di + 1] / k / 1e3 | 0) == mathpow(10, i - 3) - 1;
      }
    }
    return r;
  }
  function convertBase(str, baseIn, baseOut) {
    var j, arr = [0], arrL, i = 0, strL = str.length;
    for (; i < strL; ) {
      for (arrL = arr.length; arrL--; ) arr[arrL] *= baseIn;
      arr[0] += NUMERALS.indexOf(str.charAt(i++));
      for (j = 0; j < arr.length; j++) {
        if (arr[j] > baseOut - 1) {
          if (arr[j + 1] === void 0) arr[j + 1] = 0;
          arr[j + 1] += arr[j] / baseOut | 0;
          arr[j] %= baseOut;
        }
      }
    }
    return arr.reverse();
  }
  function cosine(Ctor, x) {
    var k, len, y;
    if (x.isZero()) return x;
    len = x.d.length;
    if (len < 32) {
      k = Math.ceil(len / 3);
      y = (1 / tinyPow(4, k)).toString();
    } else {
      k = 16;
      y = "2.3283064365386962890625e-10";
    }
    Ctor.precision += k;
    x = taylorSeries(Ctor, 1, x.times(y), new Ctor(1));
    for (var i = k; i--; ) {
      var cos2x = x.times(x);
      x = cos2x.times(cos2x).minus(cos2x).times(8).plus(1);
    }
    Ctor.precision -= k;
    return x;
  }
  var divide = /* @__PURE__ */ (function() {
    function multiplyInteger(x, k, base) {
      var temp, carry = 0, i = x.length;
      for (x = x.slice(); i--; ) {
        temp = x[i] * k + carry;
        x[i] = temp % base | 0;
        carry = temp / base | 0;
      }
      if (carry) x.unshift(carry);
      return x;
    }
    function compare(a, b, aL, bL) {
      var i, r;
      if (aL != bL) {
        r = aL > bL ? 1 : -1;
      } else {
        for (i = r = 0; i < aL; i++) {
          if (a[i] != b[i]) {
            r = a[i] > b[i] ? 1 : -1;
            break;
          }
        }
      }
      return r;
    }
    function subtract(a, b, aL, base) {
      var i = 0;
      for (; aL--; ) {
        a[aL] -= i;
        i = a[aL] < b[aL] ? 1 : 0;
        a[aL] = i * base + a[aL] - b[aL];
      }
      for (; !a[0] && a.length > 1; ) a.shift();
    }
    return function(x, y, pr, rm, dp, base) {
      var cmp, e, i, k, logBase, more, prod, prodL, q, qd, rem, remL, rem0, sd, t, xi, xL, yd0, yL, yz, Ctor = x.constructor, sign2 = x.s == y.s ? 1 : -1, xd = x.d, yd = y.d;
      if (!xd || !xd[0] || !yd || !yd[0]) {
        return new Ctor(
          // Return NaN if either NaN, or both Infinity or 0.
          !x.s || !y.s || (xd ? yd && xd[0] == yd[0] : !yd) ? NaN : (
            // Return ±0 if x is 0 or y is ±Infinity, or return ±Infinity as y is 0.
            xd && xd[0] == 0 || !yd ? sign2 * 0 : sign2 / 0
          )
        );
      }
      if (base) {
        logBase = 1;
        e = x.e - y.e;
      } else {
        base = BASE;
        logBase = LOG_BASE;
        e = mathfloor(x.e / logBase) - mathfloor(y.e / logBase);
      }
      yL = yd.length;
      xL = xd.length;
      q = new Ctor(sign2);
      qd = q.d = [];
      for (i = 0; yd[i] == (xd[i] || 0); i++) ;
      if (yd[i] > (xd[i] || 0)) e--;
      if (pr == null) {
        sd = pr = Ctor.precision;
        rm = Ctor.rounding;
      } else if (dp) {
        sd = pr + (x.e - y.e) + 1;
      } else {
        sd = pr;
      }
      if (sd < 0) {
        qd.push(1);
        more = true;
      } else {
        sd = sd / logBase + 2 | 0;
        i = 0;
        if (yL == 1) {
          k = 0;
          yd = yd[0];
          sd++;
          for (; (i < xL || k) && sd--; i++) {
            t = k * base + (xd[i] || 0);
            qd[i] = t / yd | 0;
            k = t % yd | 0;
          }
          more = k || i < xL;
        } else {
          k = base / (yd[0] + 1) | 0;
          if (k > 1) {
            yd = multiplyInteger(yd, k, base);
            xd = multiplyInteger(xd, k, base);
            yL = yd.length;
            xL = xd.length;
          }
          xi = yL;
          rem = xd.slice(0, yL);
          remL = rem.length;
          for (; remL < yL; ) rem[remL++] = 0;
          yz = yd.slice();
          yz.unshift(0);
          yd0 = yd[0];
          if (yd[1] >= base / 2) ++yd0;
          do {
            k = 0;
            cmp = compare(yd, rem, yL, remL);
            if (cmp < 0) {
              rem0 = rem[0];
              if (yL != remL) rem0 = rem0 * base + (rem[1] || 0);
              k = rem0 / yd0 | 0;
              if (k > 1) {
                if (k >= base) k = base - 1;
                prod = multiplyInteger(yd, k, base);
                prodL = prod.length;
                remL = rem.length;
                cmp = compare(prod, rem, prodL, remL);
                if (cmp == 1) {
                  k--;
                  subtract(prod, yL < prodL ? yz : yd, prodL, base);
                }
              } else {
                if (k == 0) cmp = k = 1;
                prod = yd.slice();
              }
              prodL = prod.length;
              if (prodL < remL) prod.unshift(0);
              subtract(rem, prod, remL, base);
              if (cmp == -1) {
                remL = rem.length;
                cmp = compare(yd, rem, yL, remL);
                if (cmp < 1) {
                  k++;
                  subtract(rem, yL < remL ? yz : yd, remL, base);
                }
              }
              remL = rem.length;
            } else if (cmp === 0) {
              k++;
              rem = [0];
            }
            qd[i++] = k;
            if (cmp && rem[0]) {
              rem[remL++] = xd[xi] || 0;
            } else {
              rem = [xd[xi]];
              remL = 1;
            }
          } while ((xi++ < xL || rem[0] !== void 0) && sd--);
          more = rem[0] !== void 0;
        }
        if (!qd[0]) qd.shift();
      }
      if (logBase == 1) {
        q.e = e;
        inexact = more;
      } else {
        for (i = 1, k = qd[0]; k >= 10; k /= 10) i++;
        q.e = i + e * logBase - 1;
        finalise(q, dp ? pr + q.e + 1 : pr, rm, more);
      }
      return q;
    };
  })();
  function finalise(x, sd, rm, isTruncated) {
    var digits, i, j, k, rd, roundUp, w, xd, xdi, Ctor = x.constructor;
    out: if (sd != null) {
      xd = x.d;
      if (!xd) return x;
      for (digits = 1, k = xd[0]; k >= 10; k /= 10) digits++;
      i = sd - digits;
      if (i < 0) {
        i += LOG_BASE;
        j = sd;
        w = xd[xdi = 0];
        rd = w / mathpow(10, digits - j - 1) % 10 | 0;
      } else {
        xdi = Math.ceil((i + 1) / LOG_BASE);
        k = xd.length;
        if (xdi >= k) {
          if (isTruncated) {
            for (; k++ <= xdi; ) xd.push(0);
            w = rd = 0;
            digits = 1;
            i %= LOG_BASE;
            j = i - LOG_BASE + 1;
          } else {
            break out;
          }
        } else {
          w = k = xd[xdi];
          for (digits = 1; k >= 10; k /= 10) digits++;
          i %= LOG_BASE;
          j = i - LOG_BASE + digits;
          rd = j < 0 ? 0 : w / mathpow(10, digits - j - 1) % 10 | 0;
        }
      }
      isTruncated = isTruncated || sd < 0 || xd[xdi + 1] !== void 0 || (j < 0 ? w : w % mathpow(10, digits - j - 1));
      roundUp = rm < 4 ? (rd || isTruncated) && (rm == 0 || rm == (x.s < 0 ? 3 : 2)) : rd > 5 || rd == 5 && (rm == 4 || isTruncated || rm == 6 && // Check whether the digit to the left of the rounding digit is odd.
      (i > 0 ? j > 0 ? w / mathpow(10, digits - j) : 0 : xd[xdi - 1]) % 10 & 1 || rm == (x.s < 0 ? 8 : 7));
      if (sd < 1 || !xd[0]) {
        xd.length = 0;
        if (roundUp) {
          sd -= x.e + 1;
          xd[0] = mathpow(10, (LOG_BASE - sd % LOG_BASE) % LOG_BASE);
          x.e = -sd || 0;
        } else {
          xd[0] = x.e = 0;
        }
        return x;
      }
      if (i == 0) {
        xd.length = xdi;
        k = 1;
        xdi--;
      } else {
        xd.length = xdi + 1;
        k = mathpow(10, LOG_BASE - i);
        xd[xdi] = j > 0 ? (w / mathpow(10, digits - j) % mathpow(10, j) | 0) * k : 0;
      }
      if (roundUp) {
        for (; ; ) {
          if (xdi == 0) {
            for (i = 1, j = xd[0]; j >= 10; j /= 10) i++;
            j = xd[0] += k;
            for (k = 1; j >= 10; j /= 10) k++;
            if (i != k) {
              x.e++;
              if (xd[0] == BASE) xd[0] = 1;
            }
            break;
          } else {
            xd[xdi] += k;
            if (xd[xdi] != BASE) break;
            xd[xdi--] = 0;
            k = 1;
          }
        }
      }
      for (i = xd.length; xd[--i] === 0; ) xd.pop();
    }
    if (external) {
      if (x.e > Ctor.maxE) {
        x.d = null;
        x.e = NaN;
      } else if (x.e < Ctor.minE) {
        x.e = 0;
        x.d = [0];
      }
    }
    return x;
  }
  function finiteToString(x, isExp, sd) {
    if (!x.isFinite()) return nonFiniteToString(x);
    var k, e = x.e, str = digitsToString(x.d), len = str.length;
    if (isExp) {
      if (sd && (k = sd - len) > 0) {
        str = str.charAt(0) + "." + str.slice(1) + getZeroString(k);
      } else if (len > 1) {
        str = str.charAt(0) + "." + str.slice(1);
      }
      str = str + (x.e < 0 ? "e" : "e+") + x.e;
    } else if (e < 0) {
      str = "0." + getZeroString(-e - 1) + str;
      if (sd && (k = sd - len) > 0) str += getZeroString(k);
    } else if (e >= len) {
      str += getZeroString(e + 1 - len);
      if (sd && (k = sd - e - 1) > 0) str = str + "." + getZeroString(k);
    } else {
      if ((k = e + 1) < len) str = str.slice(0, k) + "." + str.slice(k);
      if (sd && (k = sd - len) > 0) {
        if (e + 1 === len) str += ".";
        str += getZeroString(k);
      }
    }
    return str;
  }
  function getBase10Exponent(digits, e) {
    var w = digits[0];
    for (e *= LOG_BASE; w >= 10; w /= 10) e++;
    return e;
  }
  function getLn10(Ctor, sd, pr) {
    if (sd > LN10_PRECISION) {
      external = true;
      if (pr) Ctor.precision = pr;
      throw Error(precisionLimitExceeded);
    }
    return finalise(new Ctor(LN10), sd, 1, true);
  }
  function getPi(Ctor, sd, rm) {
    if (sd > PI_PRECISION) throw Error(precisionLimitExceeded);
    return finalise(new Ctor(PI), sd, rm, true);
  }
  function getPrecision(digits) {
    var w = digits.length - 1, len = w * LOG_BASE + 1;
    w = digits[w];
    if (w) {
      for (; w % 10 == 0; w /= 10) len--;
      for (w = digits[0]; w >= 10; w /= 10) len++;
    }
    return len;
  }
  function getZeroString(k) {
    var zs = "";
    for (; k--; ) zs += "0";
    return zs;
  }
  function intPow(Ctor, x, n, pr) {
    var isTruncated, r = new Ctor(1), k = Math.ceil(pr / LOG_BASE + 4);
    external = false;
    for (; ; ) {
      if (n % 2) {
        r = r.times(x);
        if (truncate(r.d, k)) isTruncated = true;
      }
      n = mathfloor(n / 2);
      if (n === 0) {
        n = r.d.length - 1;
        if (isTruncated && r.d[n] === 0) ++r.d[n];
        break;
      }
      x = x.times(x);
      truncate(x.d, k);
    }
    external = true;
    return r;
  }
  function isOdd(n) {
    return n.d[n.d.length - 1] & 1;
  }
  function maxOrMin(Ctor, args, n) {
    var k, y, x = new Ctor(args[0]), i = 0;
    for (; ++i < args.length; ) {
      y = new Ctor(args[i]);
      if (!y.s) {
        x = y;
        break;
      }
      k = x.cmp(y);
      if (k === n || k === 0 && x.s === n) {
        x = y;
      }
    }
    return x;
  }
  function naturalExponential(x, sd) {
    var denominator, guard, j, pow2, sum2, t, wpr, rep = 0, i = 0, k = 0, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
    if (!x.d || !x.d[0] || x.e > 17) {
      return new Ctor(x.d ? !x.d[0] ? 1 : x.s < 0 ? 0 : 1 / 0 : x.s ? x.s < 0 ? 0 : x : 0 / 0);
    }
    if (sd == null) {
      external = false;
      wpr = pr;
    } else {
      wpr = sd;
    }
    t = new Ctor(0.03125);
    while (x.e > -2) {
      x = x.times(t);
      k += 5;
    }
    guard = Math.log(mathpow(2, k)) / Math.LN10 * 2 + 5 | 0;
    wpr += guard;
    denominator = pow2 = sum2 = new Ctor(1);
    Ctor.precision = wpr;
    for (; ; ) {
      pow2 = finalise(pow2.times(x), wpr, 1);
      denominator = denominator.times(++i);
      t = sum2.plus(divide(pow2, denominator, wpr, 1));
      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum2.d).slice(0, wpr)) {
        j = k;
        while (j--) sum2 = finalise(sum2.times(sum2), wpr, 1);
        if (sd == null) {
          if (rep < 3 && checkRoundingDigits(sum2.d, wpr - guard, rm, rep)) {
            Ctor.precision = wpr += 10;
            denominator = pow2 = t = new Ctor(1);
            i = 0;
            rep++;
          } else {
            return finalise(sum2, Ctor.precision = pr, rm, external = true);
          }
        } else {
          Ctor.precision = pr;
          return sum2;
        }
      }
      sum2 = t;
    }
  }
  function naturalLogarithm(y, sd) {
    var c, c0, denominator, e, numerator, rep, sum2, t, wpr, x1, x2, n = 1, guard = 10, x = y, xd = x.d, Ctor = x.constructor, rm = Ctor.rounding, pr = Ctor.precision;
    if (x.s < 0 || !xd || !xd[0] || !x.e && xd[0] == 1 && xd.length == 1) {
      return new Ctor(xd && !xd[0] ? -1 / 0 : x.s != 1 ? NaN : xd ? 0 : x);
    }
    if (sd == null) {
      external = false;
      wpr = pr;
    } else {
      wpr = sd;
    }
    Ctor.precision = wpr += guard;
    c = digitsToString(xd);
    c0 = c.charAt(0);
    if (Math.abs(e = x.e) < 15e14) {
      while (c0 < 7 && c0 != 1 || c0 == 1 && c.charAt(1) > 3) {
        x = x.times(y);
        c = digitsToString(x.d);
        c0 = c.charAt(0);
        n++;
      }
      e = x.e;
      if (c0 > 1) {
        x = new Ctor("0." + c);
        e++;
      } else {
        x = new Ctor(c0 + "." + c.slice(1));
      }
    } else {
      t = getLn10(Ctor, wpr + 2, pr).times(e + "");
      x = naturalLogarithm(new Ctor(c0 + "." + c.slice(1)), wpr - guard).plus(t);
      Ctor.precision = pr;
      return sd == null ? finalise(x, pr, rm, external = true) : x;
    }
    x1 = x;
    sum2 = numerator = x = divide(x.minus(1), x.plus(1), wpr, 1);
    x2 = finalise(x.times(x), wpr, 1);
    denominator = 3;
    for (; ; ) {
      numerator = finalise(numerator.times(x2), wpr, 1);
      t = sum2.plus(divide(numerator, new Ctor(denominator), wpr, 1));
      if (digitsToString(t.d).slice(0, wpr) === digitsToString(sum2.d).slice(0, wpr)) {
        sum2 = sum2.times(2);
        if (e !== 0) sum2 = sum2.plus(getLn10(Ctor, wpr + 2, pr).times(e + ""));
        sum2 = divide(sum2, new Ctor(n), wpr, 1);
        if (sd == null) {
          if (checkRoundingDigits(sum2.d, wpr - guard, rm, rep)) {
            Ctor.precision = wpr += guard;
            t = numerator = x = divide(x1.minus(1), x1.plus(1), wpr, 1);
            x2 = finalise(x.times(x), wpr, 1);
            denominator = rep = 1;
          } else {
            return finalise(sum2, Ctor.precision = pr, rm, external = true);
          }
        } else {
          Ctor.precision = pr;
          return sum2;
        }
      }
      sum2 = t;
      denominator += 2;
    }
  }
  function nonFiniteToString(x) {
    return String(x.s * x.s / 0);
  }
  function parseDecimal(x, str) {
    var e, i, len;
    if ((e = str.indexOf(".")) > -1) str = str.replace(".", "");
    if ((i = str.search(/e/i)) > 0) {
      if (e < 0) e = i;
      e += +str.slice(i + 1);
      str = str.substring(0, i);
    } else if (e < 0) {
      e = str.length;
    }
    for (i = 0; str.charCodeAt(i) === 48; i++) ;
    for (len = str.length; str.charCodeAt(len - 1) === 48; --len) ;
    str = str.slice(i, len);
    if (str) {
      len -= i;
      x.e = e = e - i - 1;
      x.d = [];
      i = (e + 1) % LOG_BASE;
      if (e < 0) i += LOG_BASE;
      if (i < len) {
        if (i) x.d.push(+str.slice(0, i));
        for (len -= LOG_BASE; i < len; ) x.d.push(+str.slice(i, i += LOG_BASE));
        str = str.slice(i);
        i = LOG_BASE - str.length;
      } else {
        i -= len;
      }
      for (; i--; ) str += "0";
      x.d.push(+str);
      if (external) {
        if (x.e > x.constructor.maxE) {
          x.d = null;
          x.e = NaN;
        } else if (x.e < x.constructor.minE) {
          x.e = 0;
          x.d = [0];
        }
      }
    } else {
      x.e = 0;
      x.d = [0];
    }
    return x;
  }
  function parseOther(x, str) {
    var base, Ctor, divisor, i, isFloat, len, p, xd, xe;
    if (str.indexOf("_") > -1) {
      str = str.replace(/(\d)_(?=\d)/g, "$1");
      if (isDecimal.test(str)) return parseDecimal(x, str);
    } else if (str === "Infinity" || str === "NaN") {
      if (!+str) x.s = NaN;
      x.e = NaN;
      x.d = null;
      return x;
    }
    if (isHex.test(str)) {
      base = 16;
      str = str.toLowerCase();
    } else if (isBinary.test(str)) {
      base = 2;
    } else if (isOctal.test(str)) {
      base = 8;
    } else {
      throw Error(invalidArgument + str);
    }
    i = str.search(/p/i);
    if (i > 0) {
      p = +str.slice(i + 1);
      str = str.substring(2, i);
    } else {
      str = str.slice(2);
    }
    i = str.indexOf(".");
    isFloat = i >= 0;
    Ctor = x.constructor;
    if (isFloat) {
      str = str.replace(".", "");
      len = str.length;
      i = len - i;
      divisor = intPow(Ctor, new Ctor(base), i, i * 2);
    }
    xd = convertBase(str, base, BASE);
    xe = xd.length - 1;
    for (i = xe; xd[i] === 0; --i) xd.pop();
    if (i < 0) return new Ctor(x.s * 0);
    x.e = getBase10Exponent(xd, xe);
    x.d = xd;
    external = false;
    if (isFloat) x = divide(x, divisor, len * 4);
    if (p) x = x.times(Math.abs(p) < 54 ? mathpow(2, p) : Decimal.pow(2, p));
    external = true;
    return x;
  }
  function sine(Ctor, x) {
    var k, len = x.d.length;
    if (len < 3) {
      return x.isZero() ? x : taylorSeries(Ctor, 2, x, x);
    }
    k = 1.4 * Math.sqrt(len);
    k = k > 16 ? 16 : k | 0;
    x = x.times(1 / tinyPow(5, k));
    x = taylorSeries(Ctor, 2, x, x);
    var sin2_x, d5 = new Ctor(5), d16 = new Ctor(16), d20 = new Ctor(20);
    for (; k--; ) {
      sin2_x = x.times(x);
      x = x.times(d5.plus(sin2_x.times(d16.times(sin2_x).minus(d20))));
    }
    return x;
  }
  function taylorSeries(Ctor, n, x, y, isHyperbolic) {
    var j, t, u, x2, i = 1, pr = Ctor.precision, k = Math.ceil(pr / LOG_BASE);
    external = false;
    x2 = x.times(x);
    u = new Ctor(y);
    for (; ; ) {
      t = divide(u.times(x2), new Ctor(n++ * n++), pr, 1);
      u = isHyperbolic ? y.plus(t) : y.minus(t);
      y = divide(t.times(x2), new Ctor(n++ * n++), pr, 1);
      t = u.plus(y);
      if (t.d[k] !== void 0) {
        for (j = k; t.d[j] === u.d[j] && j--; ) ;
        if (j == -1) break;
      }
      j = u;
      u = y;
      y = t;
      t = j;
      i++;
    }
    external = true;
    t.d.length = k + 1;
    return t;
  }
  function tinyPow(b, e) {
    var n = b;
    while (--e) n *= b;
    return n;
  }
  function toLessThanHalfPi(Ctor, x) {
    var t, isNeg = x.s < 0, pi = getPi(Ctor, Ctor.precision, 1), halfPi = pi.times(0.5);
    x = x.abs();
    if (x.lte(halfPi)) {
      quadrant = isNeg ? 4 : 1;
      return x;
    }
    t = x.divToInt(pi);
    if (t.isZero()) {
      quadrant = isNeg ? 3 : 2;
    } else {
      x = x.minus(t.times(pi));
      if (x.lte(halfPi)) {
        quadrant = isOdd(t) ? isNeg ? 2 : 3 : isNeg ? 4 : 1;
        return x;
      }
      quadrant = isOdd(t) ? isNeg ? 1 : 4 : isNeg ? 3 : 2;
    }
    return x.minus(pi).abs();
  }
  function toStringBinary(x, baseOut, sd, rm) {
    var base, e, i, k, len, roundUp, str, xd, y, Ctor = x.constructor, isExp = sd !== void 0;
    if (isExp) {
      checkInt32(sd, 1, MAX_DIGITS);
      if (rm === void 0) rm = Ctor.rounding;
      else checkInt32(rm, 0, 8);
    } else {
      sd = Ctor.precision;
      rm = Ctor.rounding;
    }
    if (!x.isFinite()) {
      str = nonFiniteToString(x);
    } else {
      str = finiteToString(x);
      i = str.indexOf(".");
      if (isExp) {
        base = 2;
        if (baseOut == 16) {
          sd = sd * 4 - 3;
        } else if (baseOut == 8) {
          sd = sd * 3 - 2;
        }
      } else {
        base = baseOut;
      }
      if (i >= 0) {
        str = str.replace(".", "");
        y = new Ctor(1);
        y.e = str.length - i;
        y.d = convertBase(finiteToString(y), 10, base);
        y.e = y.d.length;
      }
      xd = convertBase(str, 10, base);
      e = len = xd.length;
      for (; xd[--len] == 0; ) xd.pop();
      if (!xd[0]) {
        str = isExp ? "0p+0" : "0";
      } else {
        if (i < 0) {
          e--;
        } else {
          x = new Ctor(x);
          x.d = xd;
          x.e = e;
          x = divide(x, y, sd, rm, 0, base);
          xd = x.d;
          e = x.e;
          roundUp = inexact;
        }
        i = xd[sd];
        k = base / 2;
        roundUp = roundUp || xd[sd + 1] !== void 0;
        roundUp = rm < 4 ? (i !== void 0 || roundUp) && (rm === 0 || rm === (x.s < 0 ? 3 : 2)) : i > k || i === k && (rm === 4 || roundUp || rm === 6 && xd[sd - 1] & 1 || rm === (x.s < 0 ? 8 : 7));
        xd.length = sd;
        if (roundUp) {
          for (; ++xd[--sd] > base - 1; ) {
            xd[sd] = 0;
            if (!sd) {
              ++e;
              xd.unshift(1);
            }
          }
        }
        for (len = xd.length; !xd[len - 1]; --len) ;
        for (i = 0, str = ""; i < len; i++) str += NUMERALS.charAt(xd[i]);
        if (isExp) {
          if (len > 1) {
            if (baseOut == 16 || baseOut == 8) {
              i = baseOut == 16 ? 4 : 3;
              for (--len; len % i; len++) str += "0";
              xd = convertBase(str, base, baseOut);
              for (len = xd.length; !xd[len - 1]; --len) ;
              for (i = 1, str = "1."; i < len; i++) str += NUMERALS.charAt(xd[i]);
            } else {
              str = str.charAt(0) + "." + str.slice(1);
            }
          }
          str = str + (e < 0 ? "p" : "p+") + e;
        } else if (e < 0) {
          for (; ++e; ) str = "0" + str;
          str = "0." + str;
        } else {
          if (++e > len) for (e -= len; e--; ) str += "0";
          else if (e < len) str = str.slice(0, e) + "." + str.slice(e);
        }
      }
      str = (baseOut == 16 ? "0x" : baseOut == 2 ? "0b" : baseOut == 8 ? "0o" : "") + str;
    }
    return x.s < 0 ? "-" + str : str;
  }
  function truncate(arr, len) {
    if (arr.length > len) {
      arr.length = len;
      return true;
    }
  }
  function abs(x) {
    return new this(x).abs();
  }
  function acos(x) {
    return new this(x).acos();
  }
  function acosh(x) {
    return new this(x).acosh();
  }
  function add(x, y) {
    return new this(x).plus(y);
  }
  function asin(x) {
    return new this(x).asin();
  }
  function asinh(x) {
    return new this(x).asinh();
  }
  function atan(x) {
    return new this(x).atan();
  }
  function atanh(x) {
    return new this(x).atanh();
  }
  function atan2(y, x) {
    y = new this(y);
    x = new this(x);
    var r, pr = this.precision, rm = this.rounding, wpr = pr + 4;
    if (!y.s || !x.s) {
      r = new this(NaN);
    } else if (!y.d && !x.d) {
      r = getPi(this, wpr, 1).times(x.s > 0 ? 0.25 : 0.75);
      r.s = y.s;
    } else if (!x.d || y.isZero()) {
      r = x.s < 0 ? getPi(this, pr, rm) : new this(0);
      r.s = y.s;
    } else if (!y.d || x.isZero()) {
      r = getPi(this, wpr, 1).times(0.5);
      r.s = y.s;
    } else if (x.s < 0) {
      this.precision = wpr;
      this.rounding = 1;
      r = this.atan(divide(y, x, wpr, 1));
      x = getPi(this, wpr, 1);
      this.precision = pr;
      this.rounding = rm;
      r = y.s < 0 ? r.minus(x) : r.plus(x);
    } else {
      r = this.atan(divide(y, x, wpr, 1));
    }
    return r;
  }
  function cbrt(x) {
    return new this(x).cbrt();
  }
  function ceil(x) {
    return finalise(x = new this(x), x.e + 1, 2);
  }
  function clamp(x, min2, max2) {
    return new this(x).clamp(min2, max2);
  }
  function config(obj) {
    if (!obj || typeof obj !== "object") throw Error(decimalError + "Object expected");
    var i, p, v, useDefaults = obj.defaults === true, ps = [
      "precision",
      1,
      MAX_DIGITS,
      "rounding",
      0,
      8,
      "toExpNeg",
      -EXP_LIMIT,
      0,
      "toExpPos",
      0,
      EXP_LIMIT,
      "maxE",
      0,
      EXP_LIMIT,
      "minE",
      -EXP_LIMIT,
      0,
      "modulo",
      0,
      9
    ];
    for (i = 0; i < ps.length; i += 3) {
      if (p = ps[i], useDefaults) this[p] = DEFAULTS2[p];
      if ((v = obj[p]) !== void 0) {
        if (mathfloor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
        else throw Error(invalidArgument + p + ": " + v);
      }
    }
    if (p = "crypto", useDefaults) this[p] = DEFAULTS2[p];
    if ((v = obj[p]) !== void 0) {
      if (v === true || v === false || v === 0 || v === 1) {
        if (v) {
          if (typeof crypto != "undefined" && crypto && (crypto.getRandomValues || crypto.randomBytes)) {
            this[p] = true;
          } else {
            throw Error(cryptoUnavailable);
          }
        } else {
          this[p] = false;
        }
      } else {
        throw Error(invalidArgument + p + ": " + v);
      }
    }
    return this;
  }
  function cos(x) {
    return new this(x).cos();
  }
  function cosh(x) {
    return new this(x).cosh();
  }
  function clone(obj) {
    var i, p, ps;
    function Decimal2(v) {
      var e, i2, t, x = this;
      if (!(x instanceof Decimal2)) return new Decimal2(v);
      x.constructor = Decimal2;
      if (isDecimalInstance(v)) {
        x.s = v.s;
        if (external) {
          if (!v.d || v.e > Decimal2.maxE) {
            x.e = NaN;
            x.d = null;
          } else if (v.e < Decimal2.minE) {
            x.e = 0;
            x.d = [0];
          } else {
            x.e = v.e;
            x.d = v.d.slice();
          }
        } else {
          x.e = v.e;
          x.d = v.d ? v.d.slice() : v.d;
        }
        return;
      }
      t = typeof v;
      if (t === "number") {
        if (v === 0) {
          x.s = 1 / v < 0 ? -1 : 1;
          x.e = 0;
          x.d = [0];
          return;
        }
        if (v < 0) {
          v = -v;
          x.s = -1;
        } else {
          x.s = 1;
        }
        if (v === ~~v && v < 1e7) {
          for (e = 0, i2 = v; i2 >= 10; i2 /= 10) e++;
          if (external) {
            if (e > Decimal2.maxE) {
              x.e = NaN;
              x.d = null;
            } else if (e < Decimal2.minE) {
              x.e = 0;
              x.d = [0];
            } else {
              x.e = e;
              x.d = [v];
            }
          } else {
            x.e = e;
            x.d = [v];
          }
          return;
        }
        if (v * 0 !== 0) {
          if (!v) x.s = NaN;
          x.e = NaN;
          x.d = null;
          return;
        }
        return parseDecimal(x, v.toString());
      }
      if (t === "string") {
        if ((i2 = v.charCodeAt(0)) === 45) {
          v = v.slice(1);
          x.s = -1;
        } else {
          if (i2 === 43) v = v.slice(1);
          x.s = 1;
        }
        return isDecimal.test(v) ? parseDecimal(x, v) : parseOther(x, v);
      }
      if (t === "bigint") {
        if (v < 0) {
          v = -v;
          x.s = -1;
        } else {
          x.s = 1;
        }
        return parseDecimal(x, v.toString());
      }
      throw Error(invalidArgument + v);
    }
    Decimal2.prototype = P;
    Decimal2.ROUND_UP = 0;
    Decimal2.ROUND_DOWN = 1;
    Decimal2.ROUND_CEIL = 2;
    Decimal2.ROUND_FLOOR = 3;
    Decimal2.ROUND_HALF_UP = 4;
    Decimal2.ROUND_HALF_DOWN = 5;
    Decimal2.ROUND_HALF_EVEN = 6;
    Decimal2.ROUND_HALF_CEIL = 7;
    Decimal2.ROUND_HALF_FLOOR = 8;
    Decimal2.EUCLID = 9;
    Decimal2.config = Decimal2.set = config;
    Decimal2.clone = clone;
    Decimal2.isDecimal = isDecimalInstance;
    Decimal2.abs = abs;
    Decimal2.acos = acos;
    Decimal2.acosh = acosh;
    Decimal2.add = add;
    Decimal2.asin = asin;
    Decimal2.asinh = asinh;
    Decimal2.atan = atan;
    Decimal2.atanh = atanh;
    Decimal2.atan2 = atan2;
    Decimal2.cbrt = cbrt;
    Decimal2.ceil = ceil;
    Decimal2.clamp = clamp;
    Decimal2.cos = cos;
    Decimal2.cosh = cosh;
    Decimal2.div = div;
    Decimal2.exp = exp;
    Decimal2.floor = floor;
    Decimal2.hypot = hypot;
    Decimal2.ln = ln;
    Decimal2.log = log;
    Decimal2.log10 = log10;
    Decimal2.log2 = log2;
    Decimal2.max = max;
    Decimal2.min = min;
    Decimal2.mod = mod;
    Decimal2.mul = mul;
    Decimal2.pow = pow;
    Decimal2.random = random;
    Decimal2.round = round;
    Decimal2.sign = sign;
    Decimal2.sin = sin;
    Decimal2.sinh = sinh;
    Decimal2.sqrt = sqrt;
    Decimal2.sub = sub;
    Decimal2.sum = sum;
    Decimal2.tan = tan;
    Decimal2.tanh = tanh;
    Decimal2.trunc = trunc;
    if (obj === void 0) obj = {};
    if (obj) {
      if (obj.defaults !== true) {
        ps = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"];
        for (i = 0; i < ps.length; ) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
      }
    }
    Decimal2.config(obj);
    return Decimal2;
  }
  function div(x, y) {
    return new this(x).div(y);
  }
  function exp(x) {
    return new this(x).exp();
  }
  function floor(x) {
    return finalise(x = new this(x), x.e + 1, 3);
  }
  function hypot() {
    var i, n, t = new this(0);
    external = false;
    for (i = 0; i < arguments.length; ) {
      n = new this(arguments[i++]);
      if (!n.d) {
        if (n.s) {
          external = true;
          return new this(1 / 0);
        }
        t = n;
      } else if (t.d) {
        t = t.plus(n.times(n));
      }
    }
    external = true;
    return t.sqrt();
  }
  function isDecimalInstance(obj) {
    return obj instanceof Decimal || obj && obj.toStringTag === tag || false;
  }
  function ln(x) {
    return new this(x).ln();
  }
  function log(x, y) {
    return new this(x).log(y);
  }
  function log2(x) {
    return new this(x).log(2);
  }
  function log10(x) {
    return new this(x).log(10);
  }
  function max() {
    return maxOrMin(this, arguments, -1);
  }
  function min() {
    return maxOrMin(this, arguments, 1);
  }
  function mod(x, y) {
    return new this(x).mod(y);
  }
  function mul(x, y) {
    return new this(x).mul(y);
  }
  function pow(x, y) {
    return new this(x).pow(y);
  }
  function random(sd) {
    var d, e, k, n, i = 0, r = new this(1), rd = [];
    if (sd === void 0) sd = this.precision;
    else checkInt32(sd, 1, MAX_DIGITS);
    k = Math.ceil(sd / LOG_BASE);
    if (!this.crypto) {
      for (; i < k; ) rd[i++] = Math.random() * 1e7 | 0;
    } else if (crypto.getRandomValues) {
      d = crypto.getRandomValues(new Uint32Array(k));
      for (; i < k; ) {
        n = d[i];
        if (n >= 429e7) {
          d[i] = crypto.getRandomValues(new Uint32Array(1))[0];
        } else {
          rd[i++] = n % 1e7;
        }
      }
    } else if (crypto.randomBytes) {
      d = crypto.randomBytes(k *= 4);
      for (; i < k; ) {
        n = d[i] + (d[i + 1] << 8) + (d[i + 2] << 16) + ((d[i + 3] & 127) << 24);
        if (n >= 214e7) {
          crypto.randomBytes(4).copy(d, i);
        } else {
          rd.push(n % 1e7);
          i += 4;
        }
      }
      i = k / 4;
    } else {
      throw Error(cryptoUnavailable);
    }
    k = rd[--i];
    sd %= LOG_BASE;
    if (k && sd) {
      n = mathpow(10, LOG_BASE - sd);
      rd[i] = (k / n | 0) * n;
    }
    for (; rd[i] === 0; i--) rd.pop();
    if (i < 0) {
      e = 0;
      rd = [0];
    } else {
      e = -1;
      for (; rd[0] === 0; e -= LOG_BASE) rd.shift();
      for (k = 1, n = rd[0]; n >= 10; n /= 10) k++;
      if (k < LOG_BASE) e -= LOG_BASE - k;
    }
    r.e = e;
    r.d = rd;
    return r;
  }
  function round(x) {
    return finalise(x = new this(x), x.e + 1, this.rounding);
  }
  function sign(x) {
    x = new this(x);
    return x.d ? x.d[0] ? x.s : 0 * x.s : x.s || NaN;
  }
  function sin(x) {
    return new this(x).sin();
  }
  function sinh(x) {
    return new this(x).sinh();
  }
  function sqrt(x) {
    return new this(x).sqrt();
  }
  function sub(x, y) {
    return new this(x).sub(y);
  }
  function sum() {
    var i = 0, args = arguments, x = new this(args[i]);
    external = false;
    for (; x.s && ++i < args.length; ) x = x.plus(args[i]);
    external = true;
    return finalise(x, this.precision, this.rounding);
  }
  function tan(x) {
    return new this(x).tan();
  }
  function tanh(x) {
    return new this(x).tanh();
  }
  function trunc(x) {
    return finalise(x = new this(x), x.e + 1, 1);
  }
  P[Symbol.for("nodejs.util.inspect.custom")] = P.toString;
  P[Symbol.toStringTag] = "Decimal";
  var Decimal = P.constructor = clone(DEFAULTS2);
  LN10 = new Decimal(LN10);
  PI = new Decimal(PI);
  var decimal_default = Decimal;

  // src/core/parser/cst-helpers.ts
  function isCstNode(cst) {
    return "children" in cst;
  }
  function isCstToken(cst) {
    return "image" in cst;
  }
  function getFirstCstNode(children) {
    if (!children) return void 0;
    const node = children.find(isCstNode);
    return node;
  }
  function getCstNodes(children) {
    if (!children) return [];
    return children.filter(isCstNode);
  }
  function getFirstToken(children) {
    if (!children) return void 0;
    const token = children.find(isCstToken);
    return token;
  }
  function getTokens(children) {
    if (!children) return [];
    return children.filter(isCstToken);
  }

  // src/shared/data/bg/kana.ts
  var BGITEM_KANA_A_96 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_I_97 = [
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_U_98 = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_E_99 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_O_100 = [
    [0, 0, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_KA_101 = [
    [0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_KI_102 = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_KU_103 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_KE_104 = [
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_KO_105 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_SA_106 = [
    [0, 1, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_SHI_107 = [
    [1, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_SU_108 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_SE_109 = [
    [0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_SO_110 = [
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_TA_111 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_CHI_112 = [
    [0, 0, 0, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_TSU_113 = [
    [1, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_TE_114 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_TO_115 = [
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_NA_116 = [
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_NI_117 = [
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_NU_118 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_NE_119 = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_NO_120 = [
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_HA_121 = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_HI_122 = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_FU_123 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_HE_124 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_HO_125 = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_MA_126 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 1, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_MI_127 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_MU_128 = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_ME_129 = [
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_MO_130 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_YA_131 = [
    [0, 0, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_YU_132 = [
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_YO_133 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_RA_134 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_RI_135 = [
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_RU_136 = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 1, 0],
    [1, 1, 0, 1, 0, 1, 1, 0],
    [1, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_RE_137 = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 1, 1, 0, 0],
    [1, 0, 0, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_RO_138 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_WA_139 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_N_140 = [
    [1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_WO_141 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_LITTLEA_142 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_LITTLEI_143 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_LITTLEU_144 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_LITTLEE_145 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_LITTLEO_146 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_LITTLEYA_147 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_LITTLEYU_148 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_LITTLEYO_149 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_LITTLETSU_150 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_GA_151 = [
    [0, 1, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_GI_152 = [
    [0, 0, 0, 1, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_GU_153 = [
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_GE_154 = [
    [0, 1, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_GO_155 = [
    [0, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_ZA_156 = [
    [0, 0, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_JI_157 = [
    [1, 1, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_ZU_158 = [
    [0, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_ZE_159 = [
    [0, 1, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_ZO_160 = [
    [0, 0, 0, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_DA_161 = [
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_DJI_162 = [
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_DU_163 = [
    [0, 0, 0, 0, 1, 0, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_DE_164 = [
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_DO_165 = [
    [0, 1, 0, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_BA_166 = [
    [0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_BI_167 = [
    [1, 0, 0, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_BU_168 = [
    [0, 0, 0, 0, 1, 0, 1, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_BE_169 = [
    [0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_BO_170 = [
    [0, 0, 0, 0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_PA_171 = [
    [0, 0, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 1, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_PI_172 = [
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_PU_173 = [
    [0, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_PE_174 = [
    [0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 1, 1, 0, 1, 1, 0],
    [1, 1, 0, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_PO_175 = [
    [0, 0, 0, 1, 0, 1, 1, 0],
    [0, 0, 0, 1, 1, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_KANA_FA_183 = [
    [1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 1, 1],
    [0, 0, 0, 1, 1, 0, 0, 1],
    [0, 0, 1, 1, 0, 0, 1, 0],
    [0, 1, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var KANA_BG_ITEMS = [
    { code: 96, char: "\u30A2", altChars: ["\u3042"], tile: BGITEM_KANA_A_96 },
    { code: 97, char: "\u30A4", altChars: ["\u3044"], tile: BGITEM_KANA_I_97 },
    { code: 98, char: "\u30A6", altChars: ["\u3046"], tile: BGITEM_KANA_U_98 },
    { code: 99, char: "\u30A8", altChars: ["\u3048"], tile: BGITEM_KANA_E_99 },
    { code: 100, char: "\u30AA", altChars: ["\u304A"], tile: BGITEM_KANA_O_100 },
    { code: 101, char: "\u30AB", altChars: ["\u304B"], tile: BGITEM_KANA_KA_101 },
    { code: 102, char: "\u30AD", altChars: ["\u304D"], tile: BGITEM_KANA_KI_102 },
    { code: 103, char: "\u30AF", altChars: ["\u304F"], tile: BGITEM_KANA_KU_103 },
    { code: 104, char: "\u30B1", altChars: ["\u3051"], tile: BGITEM_KANA_KE_104 },
    { code: 105, char: "\u30B3", altChars: ["\u3053"], tile: BGITEM_KANA_KO_105 },
    { code: 106, char: "\u30B5", altChars: ["\u3055"], tile: BGITEM_KANA_SA_106 },
    { code: 107, char: "\u30B7", altChars: ["\u3057"], tile: BGITEM_KANA_SHI_107 },
    { code: 108, char: "\u30B9", altChars: ["\u3059"], tile: BGITEM_KANA_SU_108 },
    { code: 109, char: "\u30BB", altChars: ["\u305B"], tile: BGITEM_KANA_SE_109 },
    { code: 110, char: "\u30BD", altChars: ["\u305D"], tile: BGITEM_KANA_SO_110 },
    { code: 111, char: "\u30BF", altChars: ["\u305F"], tile: BGITEM_KANA_TA_111 },
    { code: 112, char: "\u30C1", altChars: ["\u3061"], tile: BGITEM_KANA_CHI_112 },
    { code: 113, char: "\u30C4", altChars: ["\u3064"], tile: BGITEM_KANA_TSU_113 },
    { code: 114, char: "\u30C6", altChars: ["\u3066"], tile: BGITEM_KANA_TE_114 },
    { code: 115, char: "\u30C8", altChars: ["\u3068"], tile: BGITEM_KANA_TO_115 },
    { code: 116, char: "\u30CA", altChars: ["\u306A"], tile: BGITEM_KANA_NA_116 },
    { code: 117, char: "\u30CB", altChars: ["\u306B"], tile: BGITEM_KANA_NI_117 },
    { code: 118, char: "\u30CC", altChars: ["\u306C"], tile: BGITEM_KANA_NU_118 },
    { code: 119, char: "\u30CD", altChars: ["\u306D"], tile: BGITEM_KANA_NE_119 },
    { code: 120, char: "\u30CE", altChars: ["\u306E"], tile: BGITEM_KANA_NO_120 },
    { code: 121, char: "\u30CF", altChars: ["\u306F"], tile: BGITEM_KANA_HA_121 },
    { code: 122, char: "\u30D2", altChars: ["\u3072"], tile: BGITEM_KANA_HI_122 },
    { code: 123, char: "\u30D5", altChars: ["\u3075"], tile: BGITEM_KANA_FU_123 },
    { code: 124, char: "\u30D8", altChars: ["\u3078"], tile: BGITEM_KANA_HE_124 },
    { code: 125, char: "\u30DB", altChars: ["\u307B"], tile: BGITEM_KANA_HO_125 },
    { code: 126, char: "\u30DE", altChars: ["\u307E"], tile: BGITEM_KANA_MA_126 },
    { code: 127, char: "\u30DF", altChars: ["\u307F"], tile: BGITEM_KANA_MI_127 },
    { code: 128, char: "\u30E0", altChars: ["\u3080"], tile: BGITEM_KANA_MU_128 },
    { code: 129, char: "\u30E1", altChars: ["\u3081"], tile: BGITEM_KANA_ME_129 },
    { code: 130, char: "\u30E2", altChars: ["\u3082"], tile: BGITEM_KANA_MO_130 },
    { code: 131, char: "\u30E4", altChars: ["\u3084"], tile: BGITEM_KANA_YA_131 },
    { code: 132, char: "\u30E6", altChars: ["\u3086"], tile: BGITEM_KANA_YU_132 },
    { code: 133, char: "\u30E8", altChars: ["\u3088"], tile: BGITEM_KANA_YO_133 },
    { code: 134, char: "\u30E9", altChars: ["\u3089"], tile: BGITEM_KANA_RA_134 },
    { code: 135, char: "\u30EA", altChars: ["\u308A"], tile: BGITEM_KANA_RI_135 },
    { code: 136, char: "\u30EB", altChars: ["\u308B"], tile: BGITEM_KANA_RU_136 },
    { code: 137, char: "\u30EC", altChars: ["\u308C"], tile: BGITEM_KANA_RE_137 },
    { code: 138, char: "\u30ED", altChars: ["\u308D"], tile: BGITEM_KANA_RO_138 },
    { code: 139, char: "\u30EF", altChars: ["\u308F"], tile: BGITEM_KANA_WA_139 },
    { code: 140, char: "\u30F3", altChars: ["\u3093"], tile: BGITEM_KANA_N_140 },
    { code: 141, char: "\u30F2", altChars: ["\u3092"], tile: BGITEM_KANA_WO_141 },
    { code: 142, char: "\u30A1", altChars: ["\u3041"], tile: BGITEM_KANA_LITTLEA_142 },
    { code: 143, char: "\u30A3", altChars: ["\u3043"], tile: BGITEM_KANA_LITTLEI_143 },
    { code: 144, char: "\u30A5", altChars: ["\u3045"], tile: BGITEM_KANA_LITTLEU_144 },
    { code: 145, char: "\u30A7", altChars: ["\u3047"], tile: BGITEM_KANA_LITTLEE_145 },
    { code: 146, char: "\u30A9", altChars: ["\u3049"], tile: BGITEM_KANA_LITTLEO_146 },
    { code: 147, char: "\u30E3", altChars: ["\u3083"], tile: BGITEM_KANA_LITTLEYA_147 },
    { code: 148, char: "\u30E5", altChars: ["\u3085"], tile: BGITEM_KANA_LITTLEYU_148 },
    { code: 149, char: "\u30E7", altChars: ["\u3087"], tile: BGITEM_KANA_LITTLEYO_149 },
    { code: 150, char: "\u30C3", altChars: ["\u3063"], tile: BGITEM_KANA_LITTLETSU_150 },
    { code: 151, char: "\u30AC", altChars: ["\u304C"], tile: BGITEM_KANA_GA_151 },
    { code: 152, char: "\u30AE", altChars: ["\u304E"], tile: BGITEM_KANA_GI_152 },
    { code: 153, char: "\u30B0", altChars: ["\u3050"], tile: BGITEM_KANA_GU_153 },
    { code: 154, char: "\u30B2", altChars: ["\u3052"], tile: BGITEM_KANA_GE_154 },
    { code: 155, char: "\u30B4", altChars: ["\u3054"], tile: BGITEM_KANA_GO_155 },
    { code: 156, char: "\u30B6", altChars: ["\u3056"], tile: BGITEM_KANA_ZA_156 },
    { code: 157, char: "\u30B8", altChars: ["\u3058"], tile: BGITEM_KANA_JI_157 },
    { code: 158, char: "\u30BA", altChars: ["\u305A"], tile: BGITEM_KANA_ZU_158 },
    { code: 159, char: "\u30BC", altChars: ["\u305C"], tile: BGITEM_KANA_ZE_159 },
    { code: 160, char: "\u30BE", altChars: ["\u305E"], tile: BGITEM_KANA_ZO_160 },
    { code: 161, char: "\u30C0", altChars: ["\u3060"], tile: BGITEM_KANA_DA_161 },
    { code: 162, char: "\u30C2", altChars: ["\u3062"], tile: BGITEM_KANA_DJI_162 },
    { code: 163, char: "\u30C5", altChars: ["\u3065"], tile: BGITEM_KANA_DU_163 },
    { code: 164, char: "\u30C7", altChars: ["\u3067"], tile: BGITEM_KANA_DE_164 },
    { code: 165, char: "\u30C9", altChars: ["\u3069"], tile: BGITEM_KANA_DO_165 },
    { code: 166, char: "\u30D0", altChars: ["\u3070"], tile: BGITEM_KANA_BA_166 },
    { code: 167, char: "\u30D3", altChars: ["\u3073"], tile: BGITEM_KANA_BI_167 },
    { code: 168, char: "\u30D6", altChars: ["\u3076"], tile: BGITEM_KANA_BU_168 },
    { code: 169, char: "\u30D9", altChars: ["\u3079"], tile: BGITEM_KANA_BE_169 },
    { code: 170, char: "\u30DC", altChars: ["\u307C"], tile: BGITEM_KANA_BO_170 },
    { code: 171, char: "\u30D1", altChars: ["\u3071"], tile: BGITEM_KANA_PA_171 },
    { code: 172, char: "\u30D4", altChars: ["\u3074"], tile: BGITEM_KANA_PI_172 },
    { code: 173, char: "\u30D7", altChars: ["\u3077"], tile: BGITEM_KANA_PU_173 },
    { code: 174, char: "\u30DA", altChars: ["\u307A"], tile: BGITEM_KANA_PE_174 },
    { code: 175, char: "\u30DD", altChars: ["\u307D"], tile: BGITEM_KANA_PO_175 },
    { code: 183, char: "\u2B50", tile: BGITEM_KANA_FA_183 }
  ];

  // src/shared/data/bg/letter.ts
  var BGITEM_LETTER_A_65 = [
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_B_66 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_C_67 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_D_68 = [
    [1, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_E_69 = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_F_70 = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_G_71 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_H_72 = [
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_I_73 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_J_74 = [
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_K_75 = [
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [1, 0, 0, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_L_76 = [
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_M_77 = [
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [1, 1, 1, 0, 1, 1, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_N_78 = [
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 0, 0, 0, 1, 0],
    [1, 0, 1, 1, 0, 0, 1, 0],
    [1, 0, 0, 1, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_O_79 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_P_80 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_Q_81 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1, 1, 1, 0],
    [1, 1, 0, 0, 0, 1, 0, 0],
    [0, 1, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_R_82 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [1, 0, 0, 0, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_S_83 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_T_84 = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_U_85 = [
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_V_86 = [
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_W_87 = [
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 1, 1, 0, 1, 0],
    [1, 1, 1, 0, 1, 1, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_X_88 = [
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_Y_89 = [
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 1, 0, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_LETTER_Z_90 = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var LETTER_BG_ITEMS = [
    { code: 65, char: "A", altChars: ["a"], tile: BGITEM_LETTER_A_65 },
    { code: 66, char: "B", altChars: ["b"], tile: BGITEM_LETTER_B_66 },
    { code: 67, char: "C", altChars: ["c"], tile: BGITEM_LETTER_C_67 },
    { code: 68, char: "D", altChars: ["d"], tile: BGITEM_LETTER_D_68 },
    { code: 69, char: "E", altChars: ["e"], tile: BGITEM_LETTER_E_69 },
    { code: 70, char: "F", altChars: ["f"], tile: BGITEM_LETTER_F_70 },
    { code: 71, char: "G", altChars: ["g"], tile: BGITEM_LETTER_G_71 },
    { code: 72, char: "H", altChars: ["h"], tile: BGITEM_LETTER_H_72 },
    { code: 73, char: "I", altChars: ["i"], tile: BGITEM_LETTER_I_73 },
    { code: 74, char: "J", altChars: ["j"], tile: BGITEM_LETTER_J_74 },
    { code: 75, char: "K", altChars: ["k"], tile: BGITEM_LETTER_K_75 },
    { code: 76, char: "L", altChars: ["l"], tile: BGITEM_LETTER_L_76 },
    { code: 77, char: "M", altChars: ["m"], tile: BGITEM_LETTER_M_77 },
    { code: 78, char: "N", altChars: ["n"], tile: BGITEM_LETTER_N_78 },
    { code: 79, char: "O", altChars: ["o"], tile: BGITEM_LETTER_O_79 },
    { code: 80, char: "P", altChars: ["p"], tile: BGITEM_LETTER_P_80 },
    { code: 81, char: "Q", altChars: ["q"], tile: BGITEM_LETTER_Q_81 },
    { code: 82, char: "R", altChars: ["r"], tile: BGITEM_LETTER_R_82 },
    { code: 83, char: "S", altChars: ["s"], tile: BGITEM_LETTER_S_83 },
    { code: 84, char: "T", altChars: ["t"], tile: BGITEM_LETTER_T_84 },
    { code: 85, char: "U", altChars: ["u"], tile: BGITEM_LETTER_U_85 },
    { code: 86, char: "V", altChars: ["v"], tile: BGITEM_LETTER_V_86 },
    { code: 87, char: "W", altChars: ["w"], tile: BGITEM_LETTER_W_87 },
    { code: 88, char: "X", altChars: ["x"], tile: BGITEM_LETTER_X_88 },
    { code: 89, char: "Y", altChars: ["y"], tile: BGITEM_LETTER_Y_89 },
    { code: 90, char: "Z", altChars: ["z"], tile: BGITEM_LETTER_Z_90 }
  ];

  // src/shared/data/bg/number.ts
  var BGITEM_NUMBER_0_48 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [1, 0, 0, 0, 1, 0, 1, 0],
    [1, 0, 0, 1, 0, 0, 1, 0],
    [1, 0, 1, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_NUMBER_1_49 = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_NUMBER_2_50 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_NUMBER_3_51 = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_NUMBER_4_52 = [
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 0, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 0, 0],
    [1, 1, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_NUMBER_5_53 = [
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_NUMBER_6_54 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_NUMBER_7_55 = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_NUMBER_8_56 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_NUMBER_9_57 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 1, 0],
    [1, 1, 0, 0, 0, 0, 1, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 1, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var NUMBER_BG_ITEMS = [
    { code: 48, char: "0", tile: BGITEM_NUMBER_0_48 },
    { code: 49, char: "1", tile: BGITEM_NUMBER_1_49 },
    { code: 50, char: "2", tile: BGITEM_NUMBER_2_50 },
    { code: 51, char: "3", tile: BGITEM_NUMBER_3_51 },
    { code: 52, char: "4", tile: BGITEM_NUMBER_4_52 },
    { code: 53, char: "5", tile: BGITEM_NUMBER_5_53 },
    { code: 54, char: "6", tile: BGITEM_NUMBER_6_54 },
    { code: 55, char: "7", tile: BGITEM_NUMBER_7_55 },
    { code: 56, char: "8", tile: BGITEM_NUMBER_8_56 },
    { code: 57, char: "9", tile: BGITEM_NUMBER_9_57 }
  ];

  // src/shared/data/bg/picture.ts
  var BGITEM_PICTURE_0_0 = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 0, 2],
    [0, 0, 0, 0, 0, 0, 2, 2],
    [3, 3, 3, 3, 3, 0, 2, 2],
    [3, 3, 3, 3, 3, 0, 2, 2],
    [0, 0, 0, 0, 0, 0, 2, 2],
    [2, 2, 2, 2, 2, 2, 0, 2],
    [2, 2, 2, 2, 2, 2, 2, 0]
  ];
  var BGITEM_PICTURE_1_1 = [
    [0, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 3, 3, 3, 3, 3],
    [1, 1, 0, 3, 3, 3, 3, 3],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_2_2 = [
    [2, 2, 2, 2, 2, 2, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1]
  ];
  var BGITEM_PICTURE_3_3 = [
    [2, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 2, 0, 0, 0, 0, 0],
    [2, 1, 2, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [2, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 2, 0, 0, 0, 0, 0],
    [2, 1, 2, 2, 0, 0, 0, 0],
    [1, 1, 1, 2, 2, 0, 0, 0]
  ];
  var BGITEM_PICTURE_4_4 = [
    [2, 1, 1, 1, 2, 0, 2, 2],
    [1, 1, 2, 1, 1, 3, 2, 2],
    [2, 1, 2, 2, 2, 3, 1, 1],
    [1, 1, 2, 2, 2, 3, 2, 2],
    [2, 1, 2, 2, 2, 3, 2, 2],
    [1, 1, 2, 2, 2, 3, 2, 2],
    [2, 1, 2, 2, 2, 3, 2, 2],
    [1, 1, 2, 2, 2, 0, 2, 2]
  ];
  var BGITEM_PICTURE_5_5 = [
    [2, 1, 2, 2, 2, 0, 0, 0],
    [1, 1, 2, 2, 0, 0, 0, 0],
    [2, 1, 2, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [2, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 2, 0, 0, 0, 0, 0],
    [2, 1, 2, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_6_6 = [
    [0, 2, 2, 0, 2, 2, 0, 2],
    [3, 2, 2, 3, 2, 2, 3, 2],
    [3, 1, 1, 3, 1, 1, 3, 1],
    [3, 2, 2, 3, 2, 2, 3, 2],
    [3, 2, 2, 3, 2, 2, 3, 2],
    [3, 2, 2, 3, 2, 2, 3, 2],
    [3, 2, 2, 3, 2, 2, 3, 2],
    [0, 2, 2, 0, 2, 2, 0, 2]
  ];
  var BGITEM_PICTURE_7_7 = [
    [0, 0, 0, 1, 2, 2, 0, 1],
    [0, 0, 0, 1, 2, 2, 0, 1],
    [0, 0, 0, 1, 2, 2, 0, 1],
    [0, 0, 0, 1, 2, 2, 0, 1],
    [0, 0, 0, 1, 2, 2, 0, 1],
    [0, 0, 0, 1, 2, 2, 0, 1],
    [0, 0, 0, 1, 2, 2, 0, 1],
    [0, 0, 0, 1, 2, 2, 0, 1]
  ];
  var BGITEM_PICTURE_8_8 = [
    [2, 0, 2, 1, 2, 2, 0, 1],
    [2, 3, 2, 1, 2, 2, 0, 1],
    [1, 3, 1, 1, 2, 2, 0, 1],
    [2, 3, 2, 1, 2, 2, 0, 1],
    [2, 3, 2, 1, 2, 2, 0, 1],
    [2, 3, 2, 1, 2, 2, 0, 1],
    [2, 3, 2, 1, 2, 2, 0, 1],
    [2, 0, 2, 1, 2, 2, 0, 1]
  ];
  var BGITEM_PICTURE_9_9 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 2, 2],
    [0, 0, 0, 0, 1, 2, 2, 2],
    [0, 0, 0, 1, 1, 2, 2, 2]
  ];
  var BGITEM_PICTURE_10_10 = [
    [0, 0, 0, 1, 2, 2, 2, 2],
    [0, 0, 0, 1, 2, 2, 2, 2],
    [0, 0, 0, 1, 2, 2, 2, 2],
    [0, 0, 0, 1, 2, 2, 2, 2],
    [0, 0, 0, 1, 2, 2, 2, 2],
    [0, 0, 0, 1, 2, 2, 2, 2],
    [0, 0, 0, 1, 2, 2, 0, 0],
    [0, 0, 0, 1, 2, 2, 0, 1]
  ];
  var BGITEM_PICTURE_11_11 = [
    [0, 0, 0, 1, 2, 2, 0, 1],
    [0, 0, 0, 1, 2, 2, 0, 0],
    [0, 0, 0, 1, 2, 2, 2, 2],
    [0, 0, 0, 1, 2, 2, 2, 2],
    [0, 0, 0, 1, 2, 2, 2, 2],
    [0, 0, 0, 1, 2, 2, 2, 2],
    [0, 0, 0, 1, 2, 2, 2, 2],
    [0, 0, 0, 1, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_12_12 = [
    [2, 0, 0, 0, 1, 1, 2, 2],
    [2, 0, 0, 0, 0, 1, 2, 2],
    [2, 0, 0, 0, 0, 1, 1, 2],
    [2, 0, 0, 0, 0, 0, 1, 1],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_13_13 = [
    [2, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_14_14 = [
    [1, 2, 2, 2, 2, 2, 2, 2],
    [1, 2, 2, 2, 2, 2, 2, 2],
    [1, 2, 2, 2, 2, 2, 2, 2],
    [1, 2, 2, 2, 2, 2, 2, 2],
    [1, 2, 2, 2, 2, 2, 2, 2],
    [1, 2, 2, 2, 2, 2, 2, 2],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ];
  var BGITEM_PICTURE_15_15 = [
    [2, 1, 1, 1, 1, 1, 1, 1],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 2],
    [1, 2, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_16_16 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_17_17 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [2, 2, 1, 1, 0, 0, 0, 0],
    [2, 2, 2, 1, 0, 0, 0, 0],
    [2, 2, 2, 1, 1, 0, 0, 0]
  ];
  var BGITEM_PICTURE_18_18 = [
    [2, 2, 2, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 1, 0, 0, 0],
    [0, 0, 2, 2, 1, 0, 0, 0],
    [1, 0, 2, 2, 1, 0, 0, 0]
  ];
  var BGITEM_PICTURE_19_19 = [
    [1, 0, 2, 2, 1, 0, 0, 0],
    [1, 0, 2, 2, 1, 0, 0, 0],
    [1, 0, 2, 2, 1, 0, 0, 0],
    [1, 0, 2, 2, 1, 0, 0, 0],
    [1, 0, 2, 2, 1, 0, 0, 0],
    [1, 0, 2, 2, 1, 0, 0, 0],
    [1, 0, 2, 2, 1, 0, 0, 0],
    [1, 0, 2, 2, 1, 0, 0, 0]
  ];
  var BGITEM_PICTURE_20_20 = [
    [1, 0, 2, 2, 1, 2, 0, 2],
    [1, 0, 2, 2, 1, 2, 3, 2],
    [1, 0, 2, 2, 1, 1, 3, 1],
    [1, 0, 2, 2, 1, 2, 3, 2],
    [1, 0, 2, 2, 1, 2, 3, 2],
    [1, 0, 2, 2, 1, 2, 3, 2],
    [1, 0, 2, 2, 1, 2, 3, 2],
    [1, 0, 2, 2, 1, 2, 0, 2]
  ];
  var BGITEM_PICTURE_21_21 = [
    [1, 0, 2, 2, 1, 0, 0, 0],
    [0, 0, 2, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 1, 0, 0, 0],
    [2, 2, 2, 2, 1, 0, 0, 0]
  ];
  var BGITEM_PICTURE_22_22 = [
    [1, 0, 2, 2, 2, 2, 2, 2],
    [1, 0, 2, 2, 2, 2, 2, 2],
    [1, 0, 2, 2, 2, 2, 2, 2],
    [1, 0, 2, 2, 2, 2, 2, 2],
    [1, 0, 2, 2, 2, 2, 2, 2],
    [1, 0, 2, 2, 2, 2, 2, 2],
    [1, 0, 2, 2, 2, 2, 2, 2],
    [1, 0, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_23_23 = [
    [2, 0, 2, 2, 0, 2, 2, 0],
    [2, 3, 2, 2, 3, 2, 2, 3],
    [1, 3, 1, 1, 3, 1, 1, 3],
    [2, 3, 2, 2, 3, 2, 2, 3],
    [2, 3, 2, 2, 3, 2, 2, 3],
    [2, 3, 2, 2, 3, 2, 2, 3],
    [2, 3, 2, 2, 3, 2, 2, 3],
    [2, 0, 2, 2, 0, 2, 2, 0]
  ];
  var BGITEM_PICTURE_24_24 = [
    [2, 2, 2, 1, 1, 0, 0, 0],
    [2, 2, 2, 1, 0, 0, 0, 0],
    [2, 2, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_25_25 = [
    [0, 0, 0, 0, 0, 0, 1, 2],
    [0, 0, 0, 0, 0, 2, 1, 1],
    [0, 0, 0, 0, 0, 2, 1, 2],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 2],
    [0, 0, 0, 0, 0, 2, 1, 1],
    [0, 0, 0, 0, 2, 2, 1, 2],
    [0, 0, 0, 2, 2, 1, 1, 1]
  ];
  var BGITEM_PICTURE_26_26 = [
    [2, 2, 0, 2, 1, 1, 1, 2],
    [2, 2, 3, 1, 1, 2, 1, 1],
    [1, 1, 3, 2, 2, 2, 1, 2],
    [2, 2, 3, 2, 2, 2, 1, 1],
    [2, 2, 3, 2, 2, 2, 1, 2],
    [2, 2, 3, 2, 2, 2, 1, 1],
    [2, 2, 3, 2, 2, 2, 1, 2],
    [2, 2, 0, 2, 2, 2, 1, 1]
  ];
  var BGITEM_PICTURE_27_27 = [
    [0, 0, 0, 2, 2, 2, 1, 2],
    [0, 0, 0, 0, 2, 2, 1, 1],
    [0, 0, 0, 0, 0, 2, 1, 2],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 2],
    [0, 0, 0, 0, 0, 2, 1, 1],
    [0, 0, 0, 0, 0, 2, 1, 2],
    [0, 0, 0, 0, 0, 0, 1, 1]
  ];
  var BGITEM_PICTURE_28_28 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [2, 0, 0, 3, 3, 0, 0, 2],
    [2, 0, 3, 1, 3, 3, 0, 2],
    [2, 0, 3, 3, 3, 3, 0, 2],
    [2, 0, 0, 3, 3, 0, 0, 2],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_29_29 = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 2, 2, 2, 2, 2, 2],
    [1, 0, 2, 2, 2, 2, 2, 2],
    [1, 0, 2, 2, 2, 2, 2, 2],
    [1, 0, 2, 2, 2, 2, 2, 2],
    [1, 0, 2, 2, 2, 2, 2, 2],
    [1, 0, 2, 2, 2, 2, 2, 2],
    [1, 0, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_30_30 = [
    [0, 2, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_31_31 = [
    [0, 0, 0, 0, 0, 0, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1],
    [2, 2, 2, 2, 2, 2, 0, 1]
  ];
  var BGITEM_PICTURE_184_184 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2, 2, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_185_185 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [2, 2, 1, 1, 1, 1, 2, 2],
    [1, 2, 2, 1, 1, 2, 2, 1],
    [0, 1, 2, 1, 1, 2, 1, 0]
  ];
  var BGITEM_PICTURE_186_186 = [
    [0, 1, 2, 1, 1, 2, 1, 0],
    [0, 1, 2, 1, 1, 2, 1, 0],
    [0, 1, 2, 1, 1, 2, 1, 0],
    [0, 1, 2, 1, 1, 2, 1, 0],
    [0, 1, 2, 1, 1, 2, 1, 0],
    [0, 1, 2, 1, 1, 2, 1, 0],
    [0, 1, 2, 1, 1, 2, 1, 0],
    [0, 1, 2, 1, 1, 2, 1, 0]
  ];
  var BGITEM_PICTURE_187_187 = [
    [1, 2, 2, 1, 1, 2, 2, 1],
    [2, 2, 1, 1, 1, 1, 2, 2],
    [1, 1, 1, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_188_188 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [3, 3, 3, 3, 3, 3, 3, 3]
  ];
  var BGITEM_PICTURE_189_189 = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_190_190 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 0, 0, 0]
  ];
  var BGITEM_PICTURE_191_191 = [
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [3, 3, 3, 3, 3, 3, 3, 3]
  ];
  var BGITEM_PICTURE_192_192 = [
    [2, 2, 2, 2, 2, 2, 2, 0],
    [2, 1, 1, 1, 1, 1, 3, 0],
    [2, 2, 1, 1, 1, 3, 3, 0],
    [2, 2, 2, 1, 3, 3, 3, 0],
    [2, 2, 2, 0, 3, 3, 3, 0],
    [2, 2, 0, 0, 0, 3, 3, 0],
    [2, 0, 0, 0, 0, 0, 3, 0],
    [2, 2, 2, 2, 2, 2, 2, 0]
  ];
  var BGITEM_PICTURE_193_193 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 1, 1, 1, 1, 1, 1, 3],
    [3, 3, 1, 1, 1, 1, 3, 3],
    [3, 3, 2, 2, 2, 2, 3, 3],
    [3, 3, 2, 2, 2, 2, 3, 3],
    [3, 3, 0, 0, 0, 0, 3, 3],
    [3, 0, 0, 0, 0, 0, 0, 3],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_194_194 = [
    [1, 1, 1, 1, 2, 1, 1, 1],
    [1, 2, 1, 1, 1, 2, 1, 1],
    [1, 1, 1, 1, 1, 2, 1, 1],
    [1, 1, 1, 2, 1, 1, 2, 3],
    [3, 1, 2, 3, 1, 1, 2, 3],
    [3, 1, 2, 3, 3, 1, 2, 3],
    [3, 1, 3, 3, 3, 1, 3, 3],
    [3, 3, 3, 3, 3, 1, 3, 3]
  ];
  var BGITEM_PICTURE_195_195 = [
    [3, 3, 3, 3, 3, 0, 2, 2],
    [3, 3, 3, 3, 3, 0, 2, 3],
    [3, 3, 3, 3, 3, 0, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 2, 2, 3, 3, 3],
    [3, 3, 0, 2, 3, 3, 3, 3],
    [3, 3, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_196_196 = [
    [0, 0, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 1, 1, 1, 1],
    [2, 1, 1, 2, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 3, 3, 3, 3, 3, 3],
    [0, 2, 2, 3, 3, 3, 3, 3],
    [0, 0, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_197_197 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_198_198 = [
    [2, 2, 2, 2, 2, 2, 0, 0],
    [1, 1, 1, 1, 2, 2, 2, 0],
    [1, 1, 1, 1, 2, 1, 1, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 2],
    [3, 3, 3, 3, 3, 3, 2, 2],
    [3, 3, 3, 3, 3, 2, 2, 0],
    [2, 2, 2, 2, 2, 2, 0, 0]
  ];
  var BGITEM_PICTURE_199_199 = [
    [0, 3, 1, 1, 0, 0, 0, 0],
    [0, 3, 1, 1, 1, 1, 0, 0],
    [0, 3, 1, 1, 1, 1, 1, 0],
    [0, 3, 1, 1, 1, 1, 1, 1],
    [0, 3, 1, 1, 1, 1, 0, 0],
    [0, 3, 0, 0, 0, 0, 0, 0],
    [0, 3, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_200_200 = [
    [0, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 2, 3],
    [0, 0, 0, 2, 0, 2, 2, 3],
    [0, 0, 2, 2, 2, 2, 3, 0],
    [0, 0, 2, 3, 2, 3, 0, 3],
    [0, 2, 3, 0, 3, 2, 3, 3],
    [2, 3, 0, 3, 2, 3, 3, 3]
  ];
  var BGITEM_PICTURE_201_201 = [
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 2, 3, 3, 0, 0, 0, 0],
    [3, 0, 2, 3, 0, 0, 0, 0],
    [3, 3, 3, 0, 3, 3, 0, 0],
    [3, 3, 3, 3, 0, 3, 3, 0],
    [3, 3, 2, 3, 0, 3, 3, 3]
  ];
  var BGITEM_PICTURE_202_202 = [
    [3, 3, 0, 3, 3, 3, 0, 3],
    [3, 0, 3, 3, 3, 0, 0, 3],
    [3, 3, 3, 3, 0, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 2, 3],
    [3, 3, 2, 3, 3, 2, 0, 3],
    [2, 2, 0, 3, 3, 0, 0, 3],
    [2, 0, 3, 3, 0, 0, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3]
  ];
  var BGITEM_PICTURE_203_203 = [
    [3, 0, 3, 3, 3, 0, 0, 3],
    [3, 3, 0, 3, 3, 3, 0, 0],
    [3, 3, 3, 3, 2, 3, 3, 0],
    [3, 3, 3, 3, 0, 2, 3, 3],
    [3, 3, 3, 3, 0, 2, 2, 3],
    [3, 3, 3, 3, 3, 0, 2, 3],
    [3, 3, 2, 3, 3, 3, 3, 3],
    [3, 3, 3, 2, 3, 3, 3, 3]
  ];
  var BGITEM_PICTURE_204_204 = [
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 2, 2, 2, 3],
    [3, 2, 3, 3, 3, 0, 0, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 0, 0, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 2, 2, 2, 2],
    [3, 3, 3, 2, 2, 0, 0, 0],
    [3, 3, 3, 3, 3, 3, 3, 3]
  ];
  var BGITEM_PICTURE_205_205 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 3, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_206_206 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_207_207 = [
    [0, 0, 3, 3, 3, 3, 0, 0],
    [0, 3, 2, 2, 3, 3, 3, 0],
    [3, 2, 1, 2, 3, 3, 3, 3],
    [3, 2, 2, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [0, 3, 3, 3, 3, 3, 3, 0],
    [0, 0, 3, 3, 3, 3, 0, 0]
  ];
  var BGITEM_PICTURE_208_208 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [0, 0, 2, 2, 2, 0, 0, 0],
    [0, 2, 2, 0, 2, 2, 0, 0],
    [2, 2, 0, 0, 0, 2, 2, 0],
    [2, 0, 0, 0, 0, 0, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 3, 3, 3, 3, 3]
  ];
  var BGITEM_PICTURE_209_209 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [2, 0, 0, 0, 0, 0, 0, 2],
    [2, 0, 0, 0, 0, 0, 0, 2],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 3, 3, 3, 3, 3]
  ];
  var BGITEM_PICTURE_210_210 = [
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1]
  ];
  var BGITEM_PICTURE_211_211 = [
    [0, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 3, 0, 3, 0, 0, 0],
    [0, 0, 3, 0, 3, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 3, 0, 3, 0, 0, 0],
    [0, 0, 3, 0, 3, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_212_212 = [
    [0, 0, 0, 2, 3, 0, 0, 0],
    [0, 0, 0, 2, 3, 0, 0, 0],
    [0, 0, 0, 2, 3, 0, 0, 0],
    [0, 0, 0, 2, 3, 0, 0, 0],
    [0, 0, 1, 2, 3, 0, 0, 0],
    [0, 1, 1, 2, 3, 1, 0, 0],
    [0, 1, 1, 2, 3, 1, 1, 0],
    [1, 1, 0, 2, 3, 0, 1, 0]
  ];
  var BGITEM_PICTURE_213_213 = [
    [2, 3, 3, 3, 3, 3, 3, 3],
    [2, 3, 3, 2, 3, 3, 3, 3],
    [2, 3, 2, 0, 3, 3, 3, 3],
    [2, 3, 2, 0, 3, 3, 0, 3],
    [2, 3, 3, 2, 0, 3, 0, 3],
    [2, 3, 3, 3, 3, 3, 0, 3],
    [2, 3, 3, 3, 3, 0, 3, 3],
    [2, 3, 2, 3, 3, 3, 3, 3]
  ];
  var BGITEM_PICTURE_214_214 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 2, 2, 2, 3, 3],
    [3, 3, 2, 0, 0, 0, 2, 3],
    [3, 3, 0, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 0, 3],
    [3, 3, 3, 0, 0, 0, 3, 3],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_215_215 = [
    [0, 0, 0, 2, 0, 0, 0, 0],
    [0, 3, 3, 2, 3, 3, 0, 0],
    [3, 3, 3, 3, 3, 3, 3, 0],
    [3, 1, 1, 3, 3, 3, 3, 0],
    [3, 1, 3, 3, 3, 3, 3, 0],
    [3, 3, 3, 3, 3, 3, 3, 0],
    [0, 3, 3, 3, 3, 3, 0, 0],
    [0, 0, 3, 3, 3, 0, 0, 0]
  ];
  var BGITEM_PICTURE_216_216 = [
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 1, 1, 2, 1, 1, 1],
    [0, 1, 1, 1, 2, 1, 1, 1],
    [1, 1, 1, 2, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0, 0, 0, 1]
  ];
  var BGITEM_PICTURE_217_217 = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 2, 1, 1, 1, 2, 1],
    [1, 1, 1, 1, 2, 2, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 0, 1, 1, 1, 1],
    [1, 1, 0, 3, 0, 1, 1, 0],
    [1, 0, 3, 3, 3, 0, 0, 3]
  ];
  var BGITEM_PICTURE_218_218 = [
    [1, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 2, 2, 1, 1, 0, 0],
    [1, 1, 1, 1, 2, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 1, 1, 0, 1, 0, 0]
  ];
  var BGITEM_PICTURE_219_219 = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 0],
    [0, 1, 2, 1, 1, 2, 1, 0],
    [1, 2, 1, 1, 1, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [0, 1, 1, 0, 1, 1, 0, 1]
  ];
  var BGITEM_PICTURE_220_220 = [
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 0, 3, 3, 3, 3, 3, 3],
    [3, 3, 0, 3, 3, 0, 3, 3],
    [3, 3, 3, 0, 0, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3]
  ];
  var BGITEM_PICTURE_221_221 = [
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 2, 2],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0]
  ];
  var BGITEM_PICTURE_222_222 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 2, 2, 2, 2],
    [0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 2, 2],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0]
  ];
  var BGITEM_PICTURE_223_223 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0],
    [2, 2, 0, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0]
  ];
  var BGITEM_PICTURE_224_224 = [
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 0, 2, 2],
    [0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_225_225 = [
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [2, 2, 0, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 2, 0, 0, 0],
    [2, 2, 2, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_226_226 = [
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0]
  ];
  var BGITEM_PICTURE_227_227 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_228_228 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0]
  ];
  var BGITEM_PICTURE_229_229 = [
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 2, 0, 0, 2, 0, 0],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_230_230 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2],
    [0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_231_231 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0],
    [2, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_232_232 = [
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 3, 3, 3, 3, 0, 0],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [0, 0, 3, 3, 3, 3, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0]
  ];
  var BGITEM_PICTURE_233_233 = [
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 3, 3, 3, 3, 0, 0],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_234_234 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [0, 0, 3, 3, 3, 3, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0]
  ];
  var BGITEM_PICTURE_235_235 = [
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [0, 0, 3, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0]
  ];
  var BGITEM_PICTURE_236_236 = [
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 3, 0, 0],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0]
  ];
  var BGITEM_PICTURE_237_237 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_238_238 = [
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0]
  ];
  var BGITEM_PICTURE_239_239 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0]
  ];
  var BGITEM_PICTURE_240_240 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [0, 0, 3, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0]
  ];
  var BGITEM_PICTURE_241_241 = [
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 3, 0, 0],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_242_242 = [
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 0, 3, 3, 0, 0, 0],
    [0, 0, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_PICTURE_243_243 = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 2, 2, 2, 2, 2, 2],
    [1, 2, 1, 2, 2, 2, 2, 2],
    [1, 2, 2, 1, 2, 2, 2, 2],
    [1, 2, 2, 2, 1, 2, 2, 2],
    [1, 2, 2, 2, 2, 1, 2, 2],
    [1, 2, 2, 2, 2, 2, 1, 2],
    [1, 2, 2, 2, 2, 2, 2, 1]
  ];
  var BGITEM_PICTURE_244_244 = [
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1]
  ];
  var BGITEM_PICTURE_245_245 = [
    [1, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 1, 2],
    [1, 2, 2, 2, 2, 1, 2, 2],
    [1, 2, 2, 2, 1, 2, 2, 2],
    [1, 2, 2, 1, 2, 2, 2, 2],
    [1, 2, 1, 2, 2, 2, 2, 2],
    [1, 1, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ];
  var BGITEM_PICTURE_246_246 = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ];
  var BGITEM_PICTURE_247_247 = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 1, 1],
    [2, 2, 2, 2, 2, 1, 2, 1],
    [2, 2, 2, 2, 1, 2, 2, 1],
    [2, 2, 2, 1, 2, 2, 2, 1],
    [2, 2, 1, 2, 2, 2, 2, 1],
    [2, 1, 2, 2, 2, 2, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 1]
  ];
  var BGITEM_PICTURE_248_248 = [
    [1, 2, 2, 2, 2, 2, 2, 1],
    [2, 1, 2, 2, 2, 2, 2, 1],
    [2, 2, 1, 2, 2, 2, 2, 1],
    [2, 2, 2, 1, 2, 2, 2, 2],
    [2, 2, 2, 2, 1, 2, 2, 1],
    [2, 2, 2, 2, 2, 1, 2, 1],
    [2, 2, 2, 2, 2, 2, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ];
  var BGITEM_PICTURE_249_249 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 2, 2, 2, 2, 2, 2],
    [0, 2, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_250_250 = [
    [0, 2, 1, 1, 1, 1, 1, 1],
    [0, 2, 1, 3, 1, 3, 1, 1],
    [2, 2, 1, 3, 1, 3, 3, 1],
    [2, 2, 1, 3, 1, 3, 1, 3],
    [2, 2, 1, 3, 1, 3, 1, 1],
    [2, 2, 1, 3, 1, 3, 1, 1],
    [2, 2, 1, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_251_251 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [2, 2, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [2, 2, 2, 3, 3, 3, 0, 0],
    [2, 2, 2, 2, 3, 3, 3, 0]
  ];
  var BGITEM_PICTURE_252_252 = [
    [1, 1, 1, 1, 1, 1, 3, 0],
    [3, 1, 3, 1, 3, 1, 3, 0],
    [3, 1, 3, 1, 3, 1, 3, 3],
    [3, 1, 3, 3, 1, 1, 3, 3],
    [3, 1, 3, 1, 3, 1, 3, 3],
    [3, 1, 3, 1, 3, 1, 3, 3],
    [1, 1, 1, 1, 1, 1, 3, 3],
    [2, 2, 2, 2, 2, 3, 3, 3]
  ];
  var BGITEM_PICTURE_253_253 = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ];
  var BGITEM_PICTURE_254_254 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var BGITEM_PICTURE_255_255 = [
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3]
  ];
  var CHARS = "\u7684\u4E00\u662F\u5728\u4E0D\u4E86\u6709\u548C\u4EBA\u8FD9\u4E2D\u5927\u4E3A\u4E0A\u4E2A\u56FD\u6211\u4EE5\u8981\u4ED6\u65F6\u6765\u7528\u4EEC\u751F\u5230\u4F5C\u5730\u4E8E\u51FA\u5C31\u5206\u5BF9\u6210\u4F1A\u53EF\u4E3B\u53D1\u5E74\u52A8\u540C\u5DE5\u4E5F\u80FD\u4E0B\u8FC7\u5B50\u8BF4\u4EA7\u79CD\u9762\u800C\u65B9\u540E\u591A\u5B9A\u884C\u5B66\u6CD5\u6240\u6C11\u5F97\u7ECF\u5341\u4E09\u4E4B\u8FDB\u7740\u7B49\u90E8\u5EA6\u5BB6\u7535\u529B\u91CC\u5982\u6C34\u5316\u9AD8\u81EA\u4E8C\u7406\u8D77\u5C0F\u7269\u73B0\u5B9E\u52A0\u91CF\u90FD\u4E24\u4F53\u5236\u673A\u5F53\u4F7F\u70B9\u4ECE\u4E1A\u672C\u53BB\u628A\u6027\u597D\u5E94\u5F00\u5B83\u5408\u8FD8\u56E0\u7531\u5176\u4E9B\u7136\u524D\u5916\u5929\u653F\u56DB\u65E5\u90A3\u793E\u4E49\u4E8B\u5E73\u5F62\u76F8\u5168\u8868\u95F4\u6837\u4E0E\u5173\u5404\u91CD\u65B0\u7EBF\u5185\u6570\u6B63\u5FC3\u53CD\u4F60\u660E\u770B\u539F\u53C8\u4E48\u5229\u6BD4\u6216\u4F46\u8D28\u6C14\u7B2C\u5411\u9053\u547D\u6B64\u53D8\u6761\u53EA\u6CA1\u7ED3\u89E3\u95EE\u610F\u5EFA\u6708\u516C\u65E0\u7CFB\u519B\u5F88\u60C5\u8005\u6700\u7ACB\u4EE3\u60F3\u5DF2\u901A\u5E76\u63D0\u76F4\u9898\u515A\u7A0B\u5C55\u4E94\u679C\u6599\u8C61\u5458\u9769\u4F4D\u5165\u5E38\u6587\u603B\u6B21\u54C1\u5F0F\u6D3B\u8BBE\u53CA\u7BA1\u7279\u4EF6\u957F\u6C42\u8001\u5934\u57FA\u8D44\u8FB9\u6D41\u8DEF\u7EA7\u5C11\u56FE\u5C71\u7EDF\u63A5\u77E5\u8F83\u5C06\u7EC4\u89C1\u8BA1\u522B\u5979\u624B\u89D2\u671F\u6839\u8BBA\u8FD0\u519C\u6307\u51E0\u4E5D\u533A\u5F3A\u653E\u51B3\u897F\u88AB\u5E72\u505A\u5FC5\u6218\u5148\u56DE\u5219\u4EFB\u53D6\u636E\u5904\u961F\u5357\u7ED9\u8272\u5149\u95E8\u5373\u4FDD\u6CBB\u5317\u9020\u767E\u89C4\u70ED\u9886\u4E03\u6D77\u53E3\u4E1C\u5BFC\u5668\u538B\u5FD7\u4E16\u91D1\u589E\u4E89\u6D4E\u9636\u6CB9\u601D\u672F\u6781\u4EA4\u53D7\u8054\u4EC0\u8BA4\u516D\u5171\u6743\u6536\u8BC1\u6539\u6E05\u5DF1\u7F8E\u518D\u91C7\u8F6C\u66F4\u5355\u98CE\u5207\u6253\u767D\u6559\u901F\u82B1\u5E26\u5B89\u573A\u8EAB\u8F66\u4F8B\u771F\u52A1\u5177\u4E07\u6BCF\u76EE\u81F3\u8FBE\u8D70\u79EF\u793A\u8BAE\u58F0\u62A5\u6597\u5B8C\u7C7B\u516B\u79BB\u534E\u540D\u786E\u624D\u79D1\u5F20\u4FE1\u9A6C\u8282\u8BDD\u7C73\u6574\u7A7A\u5143\u51B5\u4ECA\u96C6\u6E29\u4F20\u571F\u8BB8\u6B65\u7FA4\u5E7F\u77F3\u8BB0\u9700\u6BB5\u7814\u754C\u62C9\u6797\u5F8B\u53EB\u4E14\u7A76\u89C2\u8D8A\u7EC7\u88C5\u5F71\u7B97\u4F4E\u6301\u97F3\u4F17\u4E66\u5E03\u590D\u5BB9\u513F\u987B\u9645\u5546\u975E\u9A8C\u8FDE\u65AD\u6DF1\u96BE\u8FD1\u77FF\u5343\u5468\u59D4\u7D20\u6280\u5907\u534A\u529E\u9752\u7701\u5217\u4E60\u54CD\u7EA6\u652F\u822C\u53F2\u611F\u52B3\u4FBF\u56E2\u5F80\u9178\u5386\u5E02\u514B\u4F55\u9664\u6D88\u6784\u5E9C\u79F0\u592A\u51C6\u7CBE\u503C\u53F7\u7387\u65CF\u7EF4\u5212\u9009\u6807\u5199\u5B58\u5019\u6BDB\u4EB2\u5FEB\u6548\u65AF\u9662\u67E5\u6C5F\u578B\u773C\u738B\u6309\u683C\u517B\u6613\u7F6E\u6D3E\u5C42\u7247\u59CB\u5374\u4E13\u72B6\u80B2\u5382\u4EAC\u8BC6\u9002\u5C5E\u5706\u5305\u706B\u4F4F\u8C03\u6EE1\u53BF\u5C40\u7167\u53C2\u7EA2\u7EC6\u5F15\u542C\u8BE5\u94C1\u4EF7\u4E25\u9F99\u98DE";
  var PICTURE_BG_ITEMS = [
    { code: 0, char: CHARS[0], tile: BGITEM_PICTURE_0_0 },
    { code: 1, char: CHARS[1], tile: BGITEM_PICTURE_1_1 },
    { code: 2, char: CHARS[2], tile: BGITEM_PICTURE_2_2 },
    { code: 3, char: CHARS[3], tile: BGITEM_PICTURE_3_3 },
    { code: 4, char: CHARS[4], tile: BGITEM_PICTURE_4_4 },
    { code: 5, char: CHARS[5], tile: BGITEM_PICTURE_5_5 },
    { code: 6, char: CHARS[6], tile: BGITEM_PICTURE_6_6 },
    { code: 7, char: CHARS[7], tile: BGITEM_PICTURE_7_7 },
    { code: 8, char: CHARS[8], tile: BGITEM_PICTURE_8_8 },
    { code: 9, char: CHARS[9], tile: BGITEM_PICTURE_9_9 },
    { code: 10, char: CHARS[10], tile: BGITEM_PICTURE_10_10 },
    { code: 11, char: CHARS[11], tile: BGITEM_PICTURE_11_11 },
    { code: 12, char: CHARS[12], tile: BGITEM_PICTURE_12_12 },
    { code: 13, char: CHARS[13], tile: BGITEM_PICTURE_13_13 },
    { code: 14, char: CHARS[14], tile: BGITEM_PICTURE_14_14 },
    { code: 15, char: CHARS[15], tile: BGITEM_PICTURE_15_15 },
    { code: 16, char: CHARS[16], tile: BGITEM_PICTURE_16_16 },
    { code: 17, char: CHARS[17], tile: BGITEM_PICTURE_17_17 },
    { code: 18, char: CHARS[18], tile: BGITEM_PICTURE_18_18 },
    { code: 19, char: CHARS[19], tile: BGITEM_PICTURE_19_19 },
    { code: 20, char: CHARS[20], tile: BGITEM_PICTURE_20_20 },
    { code: 21, char: CHARS[21], tile: BGITEM_PICTURE_21_21 },
    { code: 22, char: CHARS[22], tile: BGITEM_PICTURE_22_22 },
    { code: 23, char: CHARS[23], tile: BGITEM_PICTURE_23_23 },
    { code: 24, char: CHARS[24], tile: BGITEM_PICTURE_24_24 },
    { code: 25, char: CHARS[25], tile: BGITEM_PICTURE_25_25 },
    { code: 26, char: CHARS[26], tile: BGITEM_PICTURE_26_26 },
    { code: 27, char: CHARS[27], tile: BGITEM_PICTURE_27_27 },
    { code: 28, char: CHARS[28], tile: BGITEM_PICTURE_28_28 },
    { code: 29, char: CHARS[29], tile: BGITEM_PICTURE_29_29 },
    { code: 30, char: CHARS[30], tile: BGITEM_PICTURE_30_30 },
    { code: 31, char: CHARS[31], tile: BGITEM_PICTURE_31_31 },
    { code: 184, char: CHARS[184], tile: BGITEM_PICTURE_184_184 },
    { code: 185, char: CHARS[185], tile: BGITEM_PICTURE_185_185 },
    { code: 186, char: CHARS[186], tile: BGITEM_PICTURE_186_186 },
    { code: 187, char: CHARS[187], tile: BGITEM_PICTURE_187_187 },
    { code: 188, char: CHARS[188], tile: BGITEM_PICTURE_188_188 },
    { code: 189, char: CHARS[189], tile: BGITEM_PICTURE_189_189 },
    { code: 190, char: CHARS[190], tile: BGITEM_PICTURE_190_190 },
    { code: 191, char: CHARS[191], tile: BGITEM_PICTURE_191_191 },
    { code: 192, char: CHARS[192], tile: BGITEM_PICTURE_192_192 },
    { code: 193, char: CHARS[193], tile: BGITEM_PICTURE_193_193 },
    { code: 194, char: CHARS[194], tile: BGITEM_PICTURE_194_194 },
    { code: 195, char: CHARS[195], tile: BGITEM_PICTURE_195_195 },
    { code: 196, char: CHARS[196], tile: BGITEM_PICTURE_196_196 },
    { code: 197, char: CHARS[197], tile: BGITEM_PICTURE_197_197 },
    { code: 198, char: CHARS[198], tile: BGITEM_PICTURE_198_198 },
    { code: 199, char: CHARS[199], tile: BGITEM_PICTURE_199_199 },
    { code: 200, char: CHARS[200], tile: BGITEM_PICTURE_200_200 },
    { code: 201, char: CHARS[201], tile: BGITEM_PICTURE_201_201 },
    { code: 202, char: CHARS[202], tile: BGITEM_PICTURE_202_202 },
    { code: 203, char: CHARS[203], tile: BGITEM_PICTURE_203_203 },
    { code: 204, char: CHARS[204], tile: BGITEM_PICTURE_204_204 },
    { code: 205, char: CHARS[205], tile: BGITEM_PICTURE_205_205 },
    { code: 206, char: CHARS[206], tile: BGITEM_PICTURE_206_206 },
    { code: 207, char: CHARS[207], tile: BGITEM_PICTURE_207_207 },
    { code: 208, char: CHARS[208], tile: BGITEM_PICTURE_208_208 },
    { code: 209, char: CHARS[209], tile: BGITEM_PICTURE_209_209 },
    { code: 210, char: CHARS[210], tile: BGITEM_PICTURE_210_210 },
    { code: 211, char: CHARS[211], tile: BGITEM_PICTURE_211_211 },
    { code: 212, char: CHARS[212], tile: BGITEM_PICTURE_212_212 },
    { code: 213, char: CHARS[213], tile: BGITEM_PICTURE_213_213 },
    { code: 214, char: CHARS[214], tile: BGITEM_PICTURE_214_214 },
    { code: 215, char: CHARS[215], tile: BGITEM_PICTURE_215_215 },
    { code: 216, char: CHARS[216], tile: BGITEM_PICTURE_216_216 },
    { code: 217, char: CHARS[217], tile: BGITEM_PICTURE_217_217 },
    { code: 218, char: CHARS[218], tile: BGITEM_PICTURE_218_218 },
    { code: 219, char: CHARS[219], tile: BGITEM_PICTURE_219_219 },
    { code: 220, char: CHARS[220], tile: BGITEM_PICTURE_220_220 },
    { code: 221, char: CHARS[221], tile: BGITEM_PICTURE_221_221 },
    { code: 222, char: CHARS[222], tile: BGITEM_PICTURE_222_222 },
    { code: 223, char: CHARS[223], tile: BGITEM_PICTURE_223_223 },
    { code: 224, char: CHARS[224], tile: BGITEM_PICTURE_224_224 },
    { code: 225, char: CHARS[225], tile: BGITEM_PICTURE_225_225 },
    { code: 226, char: CHARS[226], tile: BGITEM_PICTURE_226_226 },
    { code: 227, char: CHARS[227], tile: BGITEM_PICTURE_227_227 },
    { code: 228, char: CHARS[228], tile: BGITEM_PICTURE_228_228 },
    { code: 229, char: CHARS[229], tile: BGITEM_PICTURE_229_229 },
    { code: 230, char: CHARS[230], tile: BGITEM_PICTURE_230_230 },
    { code: 231, char: CHARS[231], tile: BGITEM_PICTURE_231_231 },
    { code: 232, char: CHARS[232], tile: BGITEM_PICTURE_232_232 },
    { code: 233, char: CHARS[233], tile: BGITEM_PICTURE_233_233 },
    { code: 234, char: CHARS[234], tile: BGITEM_PICTURE_234_234 },
    { code: 235, char: CHARS[235], tile: BGITEM_PICTURE_235_235 },
    { code: 236, char: CHARS[236], tile: BGITEM_PICTURE_236_236 },
    { code: 237, char: CHARS[237], tile: BGITEM_PICTURE_237_237 },
    { code: 238, char: CHARS[238], tile: BGITEM_PICTURE_238_238 },
    { code: 239, char: CHARS[239], tile: BGITEM_PICTURE_239_239 },
    { code: 240, char: CHARS[240], tile: BGITEM_PICTURE_240_240 },
    { code: 241, char: CHARS[241], tile: BGITEM_PICTURE_241_241 },
    { code: 242, char: CHARS[242], tile: BGITEM_PICTURE_242_242 },
    { code: 243, char: CHARS[243], tile: BGITEM_PICTURE_243_243 },
    { code: 244, char: CHARS[244], tile: BGITEM_PICTURE_244_244 },
    { code: 245, char: CHARS[245], tile: BGITEM_PICTURE_245_245 },
    { code: 246, char: CHARS[246], tile: BGITEM_PICTURE_246_246 },
    { code: 247, char: CHARS[247], tile: BGITEM_PICTURE_247_247 },
    { code: 248, char: CHARS[248], tile: BGITEM_PICTURE_248_248 },
    { code: 249, char: CHARS[249], tile: BGITEM_PICTURE_249_249 },
    { code: 250, char: CHARS[250], tile: BGITEM_PICTURE_250_250 },
    { code: 251, char: CHARS[251], tile: BGITEM_PICTURE_251_251 },
    { code: 252, char: CHARS[252], tile: BGITEM_PICTURE_252_252 },
    { code: 253, char: CHARS[253], tile: BGITEM_PICTURE_253_253 },
    { code: 254, char: CHARS[254], tile: BGITEM_PICTURE_254_254 },
    { code: 255, char: CHARS[255], tile: BGITEM_PICTURE_255_255 }
  ];

  // src/shared/data/bg/symbol.ts
  var BGITEM_SYMBOL_EMPTY_32 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_EXCLAMATION_33 = [
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_DOUBLEQUOTE_34 = [
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_HASHTAG_35 = [
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_DOLLAR_36 = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_PERCENT_37 = [
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 0],
    [1, 0, 1, 0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_AMPERSAND_38 = [
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_APOSTROPHE_39 = [
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_LEFTPAREN_40 = [
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_RIGHTPAREN_41 = [
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_ASTERISK_42 = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_PLUS_43 = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_COMMA_44 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_MINUS_45 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_PERIOD_46 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_SLASH_47 = [
    [0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_COLON_58 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_SEMICOLON_59 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_LESS_60 = [
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_EQUALS_61 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_GREATER_62 = [
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_QUESTION_63 = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 1, 0, 0, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_AT_64 = [
    [0, 1, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 1, 1, 0, 1, 0],
    [1, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 1, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_LEFTCORNERBRACKET_91 = [
    [0, 0, 0, 1, 1, 1, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_YEN_92 = [
    [0, 1, 1, 0, 1, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_RIGHTCORNERBRACKET_93 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_CAP_94 = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_UNDERSCORE_95 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_BOX_176 = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ];
  var BGITEM_SYMBOL_FULLPERIOD_177 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_LEFTSQUAREBRACKET_178 = [
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_RIGHTSQUAREBRACKET_179 = [
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_COPYRIGHT_180 = [
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 1, 1, 0, 0, 1],
    [0, 1, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 1, 1, 1, 0, 0]
  ];
  var BGITEM_SYMBOL_MULTIPLY_181 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var BGITEM_SYMBOL_DIVIDE_182 = [
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SYMBOL_BG_ITEMS = [
    { code: 32, char: " ", tile: BGITEM_SYMBOL_EMPTY_32 },
    { code: 33, char: "!", tile: BGITEM_SYMBOL_EXCLAMATION_33 },
    { code: 34, char: '"', tile: BGITEM_SYMBOL_DOUBLEQUOTE_34 },
    { code: 35, char: "#", tile: BGITEM_SYMBOL_HASHTAG_35 },
    { code: 36, char: "$", tile: BGITEM_SYMBOL_DOLLAR_36 },
    { code: 37, char: "%", tile: BGITEM_SYMBOL_PERCENT_37 },
    { code: 38, char: "&", tile: BGITEM_SYMBOL_AMPERSAND_38 },
    { code: 39, char: "'", tile: BGITEM_SYMBOL_APOSTROPHE_39 },
    { code: 40, char: "(", tile: BGITEM_SYMBOL_LEFTPAREN_40 },
    { code: 41, char: ")", tile: BGITEM_SYMBOL_RIGHTPAREN_41 },
    { code: 42, char: "*", tile: BGITEM_SYMBOL_ASTERISK_42 },
    { code: 43, char: "+", tile: BGITEM_SYMBOL_PLUS_43 },
    { code: 44, char: ",", tile: BGITEM_SYMBOL_COMMA_44 },
    { code: 45, char: "-", tile: BGITEM_SYMBOL_MINUS_45 },
    { code: 46, char: ".", tile: BGITEM_SYMBOL_PERIOD_46 },
    { code: 47, char: "/", tile: BGITEM_SYMBOL_SLASH_47 },
    { code: 58, char: ":", tile: BGITEM_SYMBOL_COLON_58 },
    { code: 59, char: ";", tile: BGITEM_SYMBOL_SEMICOLON_59 },
    { code: 60, char: "<", tile: BGITEM_SYMBOL_LESS_60 },
    { code: 61, char: "=", tile: BGITEM_SYMBOL_EQUALS_61 },
    { code: 62, char: ">", tile: BGITEM_SYMBOL_GREATER_62 },
    { code: 63, char: "?", tile: BGITEM_SYMBOL_QUESTION_63 },
    { code: 64, char: "@", tile: BGITEM_SYMBOL_AT_64 },
    { code: 91, char: "\u300C", tile: BGITEM_SYMBOL_LEFTCORNERBRACKET_91 },
    { code: 92, char: "\xA5", tile: BGITEM_SYMBOL_YEN_92 },
    { code: 93, char: "\u300D", tile: BGITEM_SYMBOL_RIGHTCORNERBRACKET_93 },
    { code: 94, char: "^", tile: BGITEM_SYMBOL_CAP_94 },
    { code: 95, char: "_", tile: BGITEM_SYMBOL_UNDERSCORE_95 },
    { code: 176, char: "\u25A1", tile: BGITEM_SYMBOL_BOX_176 },
    { code: 177, char: "\u3002", tile: BGITEM_SYMBOL_FULLPERIOD_177 },
    { code: 178, char: "\u3010", tile: BGITEM_SYMBOL_LEFTSQUAREBRACKET_178 },
    { code: 179, char: "\u3011", tile: BGITEM_SYMBOL_RIGHTSQUAREBRACKET_179 },
    { code: 180, char: "\xA9", tile: BGITEM_SYMBOL_COPYRIGHT_180 },
    { code: 181, char: "\xD7", tile: BGITEM_SYMBOL_MULTIPLY_181 },
    { code: 182, char: "\xF7", tile: BGITEM_SYMBOL_DIVIDE_182 }
  ];

  // src/shared/utils/backgroundLookup.ts
  var ALL_BG_ITEMS = [
    ...LETTER_BG_ITEMS,
    ...NUMBER_BG_ITEMS,
    ...SYMBOL_BG_ITEMS,
    ...KANA_BG_ITEMS,
    ...PICTURE_BG_ITEMS
  ];
  var BY_CODE = /* @__PURE__ */ new Map();
  var BY_CHAR = /* @__PURE__ */ new Map();
  ALL_BG_ITEMS.forEach((item) => {
    BY_CODE.set(item.code, item);
    if (item.char) {
      BY_CHAR.set(item.char, item);
    }
    item.altChars?.forEach((alt) => {
      BY_CHAR.set(alt, item);
    });
  });
  function getBackgroundItemByCode(code) {
    return BY_CODE.get(code) ?? null;
  }
  function getCharacterByCode(code) {
    const bgItem = getBackgroundItemByCode(code);
    return bgItem?.char ?? null;
  }

  // src/core/evaluation/FunctionEvaluator.ts
  function toNumber(value) {
    if (typeof value === "number") {
      return Math.trunc(value);
    }
    if (typeof value === "boolean") return value ? 1 : 0;
    if (typeof value === "string") {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : Math.trunc(parsed);
    }
    return 0;
  }
  var FunctionEvaluator = class {
    constructor(context, evaluateExpression) {
      this.context = context;
      this.evaluateExpression = evaluateExpression;
    }
    /**
     * Evaluate function call: String functions, arithmetic functions, and controller input functions
     * Family BASIC arithmetic functions: ABS, SGN, RND, VAL
     * String functions: LEN, LEFT$, RIGHT$, MID$, STR$, HEX$, CHR$, ASC
     * Controller input functions: STICK, STRIG
     */
    evaluateFunctionCall(cst) {
      const lenToken = getFirstToken(cst.children.Len);
      const leftToken = getFirstToken(cst.children.Left);
      const rightToken = getFirstToken(cst.children.Right);
      const midToken = getFirstToken(cst.children.Mid);
      const strToken = getFirstToken(cst.children.Str);
      const hexToken = getFirstToken(cst.children.Hex);
      const chrToken = getFirstToken(cst.children.Chr);
      const ascToken = getFirstToken(cst.children.Asc);
      const absToken = getFirstToken(cst.children.Abs);
      const sgnToken = getFirstToken(cst.children.Sgn);
      const rndToken = getFirstToken(cst.children.Rnd);
      const valToken = getFirstToken(cst.children.Val);
      const stickToken = getFirstToken(cst.children.Stick);
      const strigToken = getFirstToken(cst.children.Strig);
      const expressionListCst = getFirstCstNode(cst.children.expressionList);
      const args = [];
      if (expressionListCst) {
        const expressions = getCstNodes(expressionListCst.children.expression);
        for (const exprCst of expressions) {
          args.push(this.evaluateExpression(exprCst));
        }
      }
      if (lenToken) {
        return this.evaluateLen(args);
      }
      if (leftToken) {
        return this.evaluateLeft(args);
      }
      if (rightToken) {
        return this.evaluateRight(args);
      }
      if (midToken) {
        return this.evaluateMid(args);
      }
      if (strToken) {
        return this.evaluateStr(args);
      }
      if (hexToken) {
        return this.evaluateHex(args);
      }
      if (chrToken) {
        return this.evaluateChr(args);
      }
      if (ascToken) {
        return this.evaluateAsc(args);
      }
      if (absToken) {
        return this.evaluateAbs(args);
      }
      if (sgnToken) {
        return this.evaluateSgn(args);
      }
      if (rndToken) {
        return this.evaluateRnd(args);
      }
      if (valToken) {
        return this.evaluateVal(args);
      }
      if (stickToken) {
        return this.evaluateStick(args);
      }
      if (strigToken) {
        return this.evaluateStrig(args);
      }
      throw new Error("Unknown function call");
    }
    // ============================================================================
    // String Functions
    // ============================================================================
    /**
     * LEN(string) - returns the length of a string
     */
    evaluateLen(args) {
      if (args.length !== 1) {
        throw new Error("LEN function requires exactly 1 argument");
      }
      const str = String(args[0] ?? "");
      return str.length;
    }
    /**
     * LEFT$(string, n) - returns leftmost n characters
     */
    evaluateLeft(args) {
      if (args.length !== 2) {
        throw new Error("LEFT$ function requires exactly 2 arguments");
      }
      const str = String(args[0] ?? "");
      const n = Math.floor(toNumber(args[1]));
      if (n < 0) {
        return "";
      }
      return str.substring(0, n);
    }
    /**
     * RIGHT$(string, n) - returns rightmost n characters
     */
    evaluateRight(args) {
      if (args.length !== 2) {
        throw new Error("RIGHT$ function requires exactly 2 arguments");
      }
      const str = String(args[0] ?? "");
      const n = Math.floor(toNumber(args[1]));
      if (n < 0) {
        return "";
      }
      const start = Math.max(0, str.length - n);
      return str.substring(start);
    }
    /**
     * MID$(string, start, length) - returns substring starting at position start with length characters
     */
    evaluateMid(args) {
      if (args.length !== 3) {
        throw new Error("MID$ function requires exactly 3 arguments");
      }
      const str = String(args[0] ?? "");
      const start = Math.floor(toNumber(args[1]));
      const length = Math.floor(toNumber(args[2]));
      if (start <= 0 || length <= 0) {
        return "";
      }
      const startIndex = start - 1;
      if (startIndex >= str.length) {
        return "";
      }
      return str.substring(startIndex, startIndex + length);
    }
    /**
     * STR$(x) - converts numerical value to string
     * For positive numbers, inserts a single character space at the beginning
     */
    evaluateStr(args) {
      if (args.length !== 1) {
        throw new Error("STR$ function requires exactly 1 argument");
      }
      const num = toNumber(args[0] ?? 0);
      if (num >= 0) {
        return ` ${String(num)}`;
      }
      return String(num);
    }
    /**
     * HEX$(x) - converts numerical value to hexadecimal string
     * Input range: -32768 to +32767
     * Returns hexadecimal digits without &H prefix (uppercase)
     */
    evaluateHex(args) {
      if (args.length !== 1) {
        throw new Error("HEX$ function requires exactly 1 argument");
      }
      const num = toNumber(args[0] ?? 0);
      let value;
      if (num < 0) {
        value = num + 65536;
      } else {
        value = num;
      }
      if (value < 0) value = 0;
      if (value > 65535) value = 65535;
      return value.toString(16).toUpperCase();
    }
    /**
     * CHR$(x) - converts character code to character
     * Input range: 0 to 255
     * Returns single character string
     * Per manual page 83: "Yields a character as a character code from a numerical value"
     * Maps codes to characters using background items data, with fallback to String.fromCharCode
     */
    evaluateChr(args) {
      if (args.length !== 1) {
        throw new Error("CHR$ function requires exactly 1 argument");
      }
      const num = toNumber(args[0] ?? 0);
      let charCode = Math.trunc(num);
      if (charCode < 0) charCode = 0;
      if (charCode > 255) charCode = 255;
      const mappedChar = getCharacterByCode(charCode);
      if (mappedChar !== null) {
        return mappedChar;
      }
      return String.fromCharCode(charCode);
    }
    /**
     * ASC(string) - converts first character of string to character code
     * Returns integer from 0 to 255
     * Per manual page 83: "The character code of the first character of the character string becomes the value of this function"
     * "Also, when the character string is a null string, 0 becomes the value of this function"
     */
    evaluateAsc(args) {
      if (args.length !== 1) {
        throw new Error("ASC function requires exactly 1 argument");
      }
      const str = String(args[0] ?? "");
      if (str.length === 0) {
        return 0;
      }
      const charCode = str.charCodeAt(0);
      if (charCode < 0) return 0;
      if (charCode > 255) return 255;
      return charCode;
    }
    // ============================================================================
    // Arithmetic Functions
    // ============================================================================
    /**
     * ABS(x) - absolute value
     */
    evaluateAbs(args) {
      if (args.length !== 1) {
        throw new Error("ABS function requires exactly 1 argument");
      }
      const x = toNumber(args[0] ?? 0);
      return Math.abs(Math.trunc(x));
    }
    /**
     * SGN(x) - sign function: -1 if x < 0, 0 if x = 0, 1 if x > 0
     */
    evaluateSgn(args) {
      if (args.length !== 1) {
        throw new Error("SGN function requires exactly 1 argument");
      }
      const x = toNumber(args[0] ?? 0);
      if (x < 0) return -1;
      if (x > 0) return 1;
      return 0;
    }
    /**
     * RND(x) - random number
     * According to Family BASIC spec:
     * - x must be 1 to 32767
     * - Returns random integer from 0 to (x-1)
     * - RND(1) always returns 0
     */
    evaluateRnd(args) {
      if (args.length !== 1) {
        throw new Error("RND function requires exactly 1 argument");
      }
      const x = toNumber(args[0] ?? 0);
      if (x < 1 || x > 32767) {
        throw new Error(`RND argument must be between 1 and 32767, got ${x}`);
      }
      if (x === 1) {
        return 0;
      }
      return Math.trunc(Math.random() * x);
    }
    /**
     * VAL(string) - converts string to numerical value
     * Supports decimal numbers (-32768 to +32767) and hexadecimal (&H0 to &H7FFF)
     * If first character is not +, -, &, or a number, returns 0
     * If non-numeric characters appear (except hex A-F), everything after is ignored
     */
    evaluateVal(args) {
      if (args.length !== 1) {
        throw new Error("VAL function requires exactly 1 argument");
      }
      const str = String(args[0] ?? "").trim();
      if (str.length === 0) {
        return 0;
      }
      const firstChar = str[0];
      if (!firstChar || firstChar !== "+" && firstChar !== "-" && firstChar !== "&" && !/[0-9]/.test(firstChar)) {
        return 0;
      }
      if (str.length >= 2 && str[0] === "&" && (str[1] === "H" || str[1] === "h")) {
        const hexPart = str.substring(2);
        let hexDigits = "";
        for (let i = 0; i < hexPart.length; i++) {
          const char = hexPart[i];
          if (!char) break;
          if (/[0-9A-Fa-f]/.test(char)) {
            hexDigits += char;
          } else {
            break;
          }
        }
        if (hexDigits.length === 0) {
          return 0;
        }
        const hexValue = parseInt(hexDigits, 16);
        if (hexValue > 32767) {
          return 32767;
        }
        return hexValue;
      }
      let numStr = "";
      let foundDigit = false;
      for (let i = 0; i < str.length; i++) {
        const char = str[i];
        if (!char) break;
        if (/[0-9]/.test(char)) {
          numStr += char;
          foundDigit = true;
        } else if ((char === "+" || char === "-") && numStr.length === 0) {
          numStr += char;
        } else {
          break;
        }
      }
      if (!foundDigit || numStr.length === 0) {
        return 0;
      }
      const numValue = parseInt(numStr, 10);
      if (numValue > 32767) {
        return 32767;
      }
      if (numValue < -32768) {
        return -32768;
      }
      return numValue;
    }
    // ============================================================================
    // Controller Input Functions
    // ============================================================================
    /**
     * STICK(joystickId) - returns D-pad input value
     * joystickId: 0 = controller I, 1 = controller II
     * Returns: 0 (nothing), 1 (RIGHT), 2 (LEFT), 4 (DOWN), 8 (UP)
     */
    evaluateStick(args) {
      if (args.length !== 1) {
        throw new Error("STICK function requires exactly 1 argument");
      }
      const joystickId = Math.floor(toNumber(args[0] ?? 0));
      if (joystickId < 0 || joystickId > 1) {
        throw new Error("STICK joystickId must be 0 or 1");
      }
      return this.context.getStickState(joystickId);
    }
    /**
     * STRIG(joystickId) - returns trigger button input value
     * joystickId: 0 = controller I, 1 = controller II
     * Controller I: START (1), SELECT (2), B (4), A (8)
     * Controller II: B (4), A (8)
     * Returns: 0 when nothing is pressed, or the button value when pressed
     */
    evaluateStrig(args) {
      if (args.length !== 1) {
        throw new Error("STRIG function requires exactly 1 argument");
      }
      const joystickId = Math.floor(toNumber(args[0] ?? 0));
      if (joystickId < 0 || joystickId > 1) {
        throw new Error("STRIG joystickId must be 0 or 1");
      }
      return this.context.consumeStrigState(joystickId);
    }
  };

  // src/core/evaluation/ExpressionEvaluator.ts
  var ExpressionEvaluator = class {
    constructor(context) {
      this.context = context;
      __publicField(this, "functionEvaluator");
      this.functionEvaluator = new FunctionEvaluator(
        context,
        (exprCst) => this.evaluateExpression(exprCst)
      );
    }
    /**
     * Evaluate a BASIC expression from CST
     */
    evaluateExpression(exprCst) {
      const additiveCst = getFirstCstNode(exprCst.children.additive);
      if (additiveCst) {
        return this.evaluateAdditive(additiveCst);
      }
      throw new Error("Invalid expression CST");
    }
    /**
     * Evaluate a logical expression from CST
     * Returns -1 for true, 0 for false (per Family BASIC spec)
     * Supports: NOT, AND, OR, XOR
     * Precedence: NOT > AND > OR > XOR
     * Structure: LogicalOrExpression (XOR LogicalOrExpression)*
     */
    evaluateLogicalExpression(logicalCst) {
      const logicalOrExprs = getCstNodes(logicalCst.children.logicalOrExpression);
      if (logicalOrExprs.length === 0) {
        throw new Error("Invalid logical expression: missing logical OR expression");
      }
      let result = this.evaluateLogicalOrExpression(logicalOrExprs[0]);
      const xorTokens = getTokens(logicalCst.children.Xor);
      for (let i = 0; i < xorTokens.length && i + 1 < logicalOrExprs.length; i++) {
        const operand = this.evaluateLogicalOrExpression(logicalOrExprs[i + 1]);
        const leftIsTrue = result !== 0;
        const rightIsTrue = operand !== 0;
        result = leftIsTrue !== rightIsTrue ? -1 : 0;
      }
      return result;
    }
    /**
     * Evaluate a logical OR expression from CST
     * Structure: LogicalAndExpression (OR LogicalAndExpression)*
     * OR combines LogicalAndExpressions
     */
    evaluateLogicalOrExpression(cst) {
      const logicalAndExprs = getCstNodes(cst.children.logicalAndExpression);
      if (logicalAndExprs.length === 0) {
        throw new Error("Invalid logical OR expression: missing logical AND expression");
      }
      let result = this.evaluateLogicalAndExpression(logicalAndExprs[0]);
      const orTokens = getTokens(cst.children.Or);
      for (let i = 0; i < orTokens.length && i + 1 < logicalAndExprs.length; i++) {
        const operand = this.evaluateLogicalAndExpression(logicalAndExprs[i + 1]);
        result = result !== 0 || operand !== 0 ? -1 : 0;
      }
      return result;
    }
    /**
     * Evaluate a logical AND expression from CST
     * Structure: LogicalNotExpression (AND LogicalNotExpression)*
     * AND has middle precedence (combines LogicalNotExpressions)
     */
    evaluateLogicalAndExpression(cst) {
      const logicalNotExprs = getCstNodes(cst.children.logicalNotExpression);
      if (logicalNotExprs.length === 0) {
        throw new Error("Invalid logical AND expression: missing logical NOT expression");
      }
      let result = this.evaluateLogicalNotExpression(logicalNotExprs[0]);
      const andTokens = getTokens(cst.children.And);
      for (let i = 0; i < andTokens.length && i + 1 < logicalNotExprs.length; i++) {
        const operand = this.evaluateLogicalNotExpression(logicalNotExprs[i + 1]);
        result = result !== 0 && operand !== 0 ? -1 : 0;
      }
      return result;
    }
    /**
     * Evaluate a logical NOT expression from CST
     * Structure: (NOT)? ComparisonExpression
     * NOT has highest precedence (applies to ComparisonExpression)
     */
    evaluateLogicalNotExpression(cst) {
      const comparisonExprCst = getFirstCstNode(cst.children.comparisonExpression);
      if (!comparisonExprCst) {
        throw new Error("Invalid logical NOT expression: missing comparison expression");
      }
      let result = this.evaluateComparisonExpression(comparisonExprCst);
      const notTokens = getTokens(cst.children.Not);
      if (notTokens.length > 0) {
        result = result !== 0 ? 0 : -1;
      }
      return result;
    }
    /**
     * Evaluate a comparison expression from CST
     * Returns -1 for true, 0 for false (per Family BASIC spec)
     * Supports: =, <>, <, >, <=, >=
     * Also supports single expression (non-zero = true, zero = false)
     */
    evaluateComparisonExpression(comparisonCst) {
      const expressions = getCstNodes(comparisonCst.children.expression);
      if (expressions.length === 0) {
        throw new Error("Invalid comparison expression: missing expression");
      }
      const leftValue = this.evaluateExpression(expressions[0]);
      if (expressions.length === 1) {
        if (typeof leftValue === "string") {
          return leftValue.length > 0 ? -1 : 0;
        }
        return leftValue !== 0 ? -1 : 0;
      }
      const rightValue = this.evaluateExpression(expressions[1]);
      const equalToken = getFirstToken(comparisonCst.children.Equal);
      const notEqualToken = getFirstToken(comparisonCst.children.NotEqual);
      const lessThanToken = getFirstToken(comparisonCst.children.LessThan);
      const greaterThanToken = getFirstToken(comparisonCst.children.GreaterThan);
      const lessThanOrEqualToken = getFirstToken(comparisonCst.children.LessThanOrEqual);
      const greaterThanOrEqualToken = getFirstToken(comparisonCst.children.GreaterThanOrEqual);
      let operator = null;
      if (equalToken) operator = "=";
      else if (notEqualToken) operator = "<>";
      else if (lessThanToken) operator = "<";
      else if (greaterThanToken) operator = ">";
      else if (lessThanOrEqualToken) operator = "<=";
      else if (greaterThanOrEqualToken) operator = ">=";
      if (!operator) {
        throw new Error("Invalid comparison expression: missing operator");
      }
      if (typeof leftValue === "string" || typeof rightValue === "string") {
        const leftStr = String(leftValue);
        const rightStr = String(rightValue);
        switch (operator) {
          case "=":
            return leftStr === rightStr ? -1 : 0;
          case "<>":
            return leftStr !== rightStr ? -1 : 0;
          case "<":
            return leftStr < rightStr ? -1 : 0;
          case ">":
            return leftStr > rightStr ? -1 : 0;
          case "<=":
            return leftStr <= rightStr ? -1 : 0;
          case ">=":
            return leftStr >= rightStr ? -1 : 0;
        }
      } else {
        const leftNum = Number(leftValue);
        const rightNum = Number(rightValue);
        switch (operator) {
          case "=":
            return leftNum === rightNum ? -1 : 0;
          case "<>":
            return leftNum !== rightNum ? -1 : 0;
          case "<":
            return leftNum < rightNum ? -1 : 0;
          case ">":
            return leftNum > rightNum ? -1 : 0;
          case "<=":
            return leftNum <= rightNum ? -1 : 0;
          case ">=":
            return leftNum >= rightNum ? -1 : 0;
        }
      }
      return 0;
    }
    /**
     * Evaluate additive expression: ModExpression ((Plus | Minus) ModExpression)*
     */
    evaluateAdditive(cst) {
      const modExpressionNodes = getCstNodes(cst.children.modExpression);
      if (modExpressionNodes.length === 0) {
        throw new Error("Invalid additive expression");
      }
      let result = this.evaluateModExpression(modExpressionNodes[0]);
      const plusTokens = getTokens(cst.children.Plus);
      const minusTokens = getTokens(cst.children.Minus);
      const operators = [];
      let tokenIndex = 0;
      for (let i = 1; i < modExpressionNodes.length; i++) {
        const op = tokenIndex < plusTokens.length ? "+" : "-";
        operators.push({ op, operand: modExpressionNodes[i] });
        tokenIndex++;
        if (tokenIndex >= plusTokens.length + minusTokens.length) break;
      }
      for (const { op, operand } of operators) {
        const operandValue = this.evaluateModExpression(operand);
        if (op === "+") {
          if (typeof result === "string" || typeof operandValue === "string") {
            result = String(result) + String(operandValue);
          } else {
            const resultDecimal = this.toDecimal(result);
            const operandDecimal = this.toDecimal(operandValue);
            result = resultDecimal.plus(operandDecimal).truncated().toNumber();
          }
        } else {
          const resultDecimal = this.toDecimal(result);
          const operandDecimal = this.toDecimal(operandValue);
          result = resultDecimal.minus(operandDecimal).truncated().toNumber();
        }
      }
      return result;
    }
    /**
     * Evaluate MOD expression: Multiplicative ((MOD) Multiplicative)*
     * MOD has priority 2 (after *, / but before +, -)
     */
    evaluateModExpression(cst) {
      const multiplicativeNodes = getCstNodes(cst.children.multiplicative);
      if (multiplicativeNodes.length === 0) {
        throw new Error("Invalid MOD expression");
      }
      let result = this.evaluateMultiplicative(multiplicativeNodes[0]);
      const modTokens = getTokens(cst.children.Mod);
      for (let i = 0; i < modTokens.length && i + 1 < multiplicativeNodes.length; i++) {
        const operandValue = this.evaluateMultiplicative(multiplicativeNodes[i + 1]);
        if (typeof result === "string" || typeof operandValue === "string") {
          throw new Error("MOD operator requires numeric operands");
        }
        const resultDecimal = this.toDecimal(result);
        const operandDecimal = this.toDecimal(operandValue);
        if (operandDecimal.isZero()) {
          this.context.addError({
            line: this.context.getCurrentLineNumber(),
            message: "Division by zero",
            type: ERROR_TYPES.RUNTIME
          });
          result = 0;
        } else {
          result = resultDecimal.mod(operandDecimal).truncated().toNumber();
        }
      }
      return result;
    }
    /**
     * Evaluate multiplicative expression: Unary ((Multiply | Divide) Unary)*
     */
    evaluateMultiplicative(cst) {
      const unaryNodes = getCstNodes(cst.children.unary);
      if (unaryNodes.length === 0) {
        throw new Error("Invalid multiplicative expression");
      }
      let result = this.evaluateUnary(unaryNodes[0]);
      const multiplyTokens = getTokens(cst.children.Multiply);
      const divideTokens = getTokens(cst.children.Divide);
      let tokenIndex = 0;
      for (let i = 1; i < unaryNodes.length; i++) {
        const op = tokenIndex < multiplyTokens.length ? "*" : "/";
        const operandValue = this.evaluateUnary(unaryNodes[i]);
        if (op === "*") {
          const resultDecimal = this.toDecimal(result);
          const operandDecimal = this.toDecimal(operandValue);
          result = resultDecimal.times(operandDecimal).truncated().toNumber();
        } else {
          const divisorDecimal = this.toDecimal(operandValue);
          if (divisorDecimal.isZero()) {
            this.context.addError({
              line: this.context.getCurrentLineNumber(),
              message: "Division by zero",
              type: ERROR_TYPES.RUNTIME
            });
            result = 0;
          } else {
            const dividendDecimal = this.toDecimal(result);
            result = dividendDecimal.dividedBy(divisorDecimal).truncated().toNumber();
          }
        }
        tokenIndex++;
        if (tokenIndex >= multiplyTokens.length + divideTokens.length) break;
      }
      return typeof result === "string" ? result : this.toNumber(result);
    }
    /**
     * Evaluate unary expression: (Plus | Minus)? Primary
     */
    evaluateUnary(cst) {
      const primaryCst = getFirstCstNode(cst.children.primary);
      if (!primaryCst) {
        throw new Error("Invalid unary expression: missing primary");
      }
      const primaryValue = this.evaluatePrimary(primaryCst);
      const minusTokens = getTokens(cst.children.Minus);
      if (minusTokens.length > 0) {
        const valueDecimal = this.toDecimal(primaryValue);
        return valueDecimal.negated().truncated().toNumber();
      }
      return primaryValue;
    }
    /**
     * Evaluate primary expression: NumberLiteral | StringLiteral | ArrayAccess | FunctionCall | Identifier | (LParen Expression RParen)
     */
    evaluatePrimary(cst) {
      const arrayAccessCst = getFirstCstNode(cst.children.arrayAccess);
      if (arrayAccessCst) {
        return this.evaluateArrayAccess(arrayAccessCst);
      }
      const functionCallCst = getFirstCstNode(cst.children.functionCall);
      if (functionCallCst) {
        return this.evaluateFunctionCall(functionCallCst);
      }
      if (cst.children.LParen && !functionCallCst && !arrayAccessCst) {
        const exprCst = getFirstCstNode(cst.children.expression);
        if (exprCst) {
          return this.evaluateExpression(exprCst);
        }
        throw new Error("Invalid parenthesized expression");
      }
      const numberToken = getFirstToken(cst.children.NumberLiteral);
      if (numberToken) {
        return parseInt(numberToken.image, 10);
      }
      const stringToken = getFirstToken(cst.children.StringLiteral);
      if (stringToken) {
        return stringToken.image.slice(1, -1);
      }
      const identifierToken = getFirstToken(cst.children.Identifier);
      if (identifierToken) {
        const varName = identifierToken.image.toUpperCase();
        const variable = this.context.variables.get(varName);
        if (variable) {
          return variable.value;
        }
        return varName.endsWith("$") ? "" : 0;
      }
      throw new Error("Invalid primary expression");
    }
    /**
     * Evaluate array access: Identifier LParen ExpressionList RParen
     * Examples: A(I), A$(I, J)
     */
    evaluateArrayAccess(cst) {
      const identifierToken = getFirstToken(cst.children.Identifier);
      if (!identifierToken) {
        throw new Error("Invalid array access: missing array name");
      }
      const arrayName = identifierToken.image.toUpperCase();
      const expressionListCst = getFirstCstNode(cst.children.expressionList);
      if (!expressionListCst) {
        throw new Error("Invalid array access: missing indices");
      }
      const expressions = getCstNodes(expressionListCst.children.expression);
      const indices = [];
      for (const exprCst of expressions) {
        const indexValue = this.evaluateExpression(exprCst);
        if (typeof indexValue !== "number") {
          throw new Error(`Invalid array index: expected number, got ${typeof indexValue}`);
        }
        indices.push(Math.floor(indexValue));
      }
      const array = this.context.arrays.get(arrayName);
      if (!array) {
        return arrayName.endsWith("$") ? "" : 0;
      }
      let value = array;
      for (let i = 0; i < indices.length; i++) {
        const index = indices[i];
        if (index === void 0) {
          throw new Error(`Invalid array index at dimension ${i}`);
        }
        if (typeof value !== "object" || !Array.isArray(value)) {
          throw new Error(`Array access error: dimension ${i} is not an array`);
        }
        if (index < 0 || index >= value.length) {
          return arrayName.endsWith("$") ? "" : 0;
        }
        value = value[index];
      }
      return typeof value === "object" && Array.isArray(value) ? arrayName.endsWith("$") ? "" : 0 : value;
    }
    /**
     * Evaluate function call: Delegates to FunctionEvaluator
     */
    evaluateFunctionCall(cst) {
      return this.functionEvaluator.evaluateFunctionCall(cst);
    }
    /**
     * Convert a value to a Decimal for precise arithmetic
     */
    toDecimal(value) {
      if (typeof value === "number") {
        return new decimal_default(value);
      }
      if (typeof value === "boolean") {
        return new decimal_default(value ? 1 : 0);
      }
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? new decimal_default(0) : new decimal_default(parsed);
      }
      return new decimal_default(0);
    }
    /**
     * Convert a value to an integer
     * Family Basic only supports integer numerical values
     */
    toNumber(value) {
      if (typeof value === "number") {
        return Math.trunc(value);
      }
      if (typeof value === "boolean") return value ? 1 : 0;
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : Math.trunc(parsed);
      }
      return 0;
    }
  };

  // src/core/services/DataService.ts
  var DataService = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Add data values from a DATA statement (CST version)
     * DATA statements only contain constants:
     * - NumberLiteral: numeric constants
     * - StringLiteral: quoted strings (may contain commas/colons)
     * - Identifier: unquoted strings (treated as string constants, not variables)
     */
    addDataValuesCst(constantCsts) {
      for (const constantCst of constantCsts) {
        const value = this.evaluateDataConstant(constantCst);
        this.context.dataValues.push(value);
      }
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`DATA: Added ${constantCsts.length} values`);
      }
    }
    /**
     * Evaluate a DATA constant (NumberLiteral, StringLiteral, or Identifier)
     * Identifiers in DATA are treated as string constants, not variable references
     */
    evaluateDataConstant(constantCst) {
      const numberToken = getFirstToken(constantCst.children.NumberLiteral);
      if (numberToken) {
        return parseInt(numberToken.image, 10);
      }
      const stringToken = getFirstToken(constantCst.children.StringLiteral);
      if (stringToken) {
        return stringToken.image.slice(1, -1);
      }
      const identifierToken = getFirstToken(constantCst.children.Identifier);
      if (identifierToken) {
        return identifierToken.image;
      }
      throw new Error("Invalid DATA constant: must be NumberLiteral, StringLiteral, or Identifier");
    }
    /**
     * Add data values from a DATA statement (AST version - deprecated)
     */
    addDataValues(_expressions) {
      console.warn("addDataValues called with AST - use addDataValuesCst instead");
    }
    /**
     * Read the next data value
     */
    readNextDataValue() {
      if (this.context.dataIndex >= this.context.dataValues.length) {
        this.context.addError({
          line: 0,
          message: "OD ERROR",
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
      let dataIndex = 0;
      for (const statement of this.context.statements) {
        const commandCst = statement.command;
        const singleCommandCst = getFirstCstNode(commandCst.children.singleCommand);
        if (singleCommandCst?.children.dataStatement) {
          if (statement.lineNumber >= lineNumber) {
            return dataIndex;
          }
          const dataStmtCst = getFirstCstNode(singleCommandCst.children.dataStatement);
          if (dataStmtCst) {
            const dataConstantListCst = getFirstCstNode(dataStmtCst.children.dataConstantList);
            if (dataConstantListCst) {
              const constants = getCstNodes(dataConstantListCst.children.dataConstant);
              dataIndex += constants.length;
            }
          }
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
        const commandCst = statement.command;
        const singleCommandCst = getFirstCstNode(commandCst.children.singleCommand);
        if (singleCommandCst?.children.dataStatement) {
          const dataStmtCst = getFirstCstNode(singleCommandCst.children.dataStatement);
          if (dataStmtCst) {
            const dataConstantListCst = getFirstCstNode(dataStmtCst.children.dataConstantList);
            if (dataConstantListCst) {
              const constants = getCstNodes(dataConstantListCst.children.dataConstant);
              this.addDataValuesCst(constants);
            }
          }
        }
      }
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`Preprocessed ${this.context.dataValues.length} data values`);
      }
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
     * Set a variable from a CST expression node
     */
    setVariableFromExpressionCst(name, expressionCst) {
      const value = this.evaluator.evaluateExpression(expressionCst);
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
        current[index] ?? (current[index] = []);
        current = current[index];
      }
      if (Array.isArray(current)) {
        const finalIndex = Math.floor(indices[indices.length - 1] ?? 0);
        current[finalIndex] = value;
      }
    }
    /**
     * Set an array element from CST expression nodes
     */
    setArrayElementFromExpressionsCst(name, indexExpressionsCst, valueExpressionCst) {
      const indices = indexExpressionsCst.map((exprCst) => this.toNumber(this.evaluator.evaluateExpression(exprCst)));
      const value = this.evaluator.evaluateExpression(valueExpressionCst);
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
     * Create an array with specified dimensions
     * According to Family BASIC spec:
     * - Numerical arrays are initialized to 0
     * - String arrays (name ends with $) are initialized to empty strings
     */
    createArray(name, dimensions) {
      const isStringArray = name.endsWith("$");
      const defaultValue = isStringArray ? "" : 0;
      const array = this.createArrayRecursive(dimensions, 0, defaultValue);
      this.context.arrays.set(name, array);
    }
    /**
     * Recursively create array structure
     * @param dimensions Array of dimension sizes (highest index + 1)
     * @param currentDim Current dimension index
     * @param defaultValue Default value for leaf elements (0 for numeric, '' for string)
     */
    createArrayRecursive(dimensions, currentDim, defaultValue) {
      if (currentDim >= dimensions.length) {
        return [];
      }
      const highestIndex = Math.floor(dimensions[currentDim] ?? 0);
      const size = highestIndex + 1;
      const array = [];
      for (let i = 0; i < size; i++) {
        if (currentDim === dimensions.length - 1) {
          array[i] = defaultValue;
        } else {
          array[i] = this.createArrayRecursive(dimensions, currentDim + 1, defaultValue);
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
     * Convert a value to an integer
     * Family Basic only supports integer numerical values
     * Uses Decimal.js for precise conversion
     */
    toNumber(value) {
      if (typeof value === "number") {
        return new decimal_default(value).truncated().toNumber();
      }
      if (typeof value === "boolean") return value ? 1 : 0;
      if (typeof value === "string") {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : new decimal_default(parsed).truncated().toNumber();
      }
      return 0;
    }
  };

  // src/core/execution/executors/CgenExecutor.ts
  var CgenExecutor = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Execute a CGEN statement from CST
     * Sets character generator mode (0-3)
     * Syntax: CGEN n
     * 
     * Mode meanings:
     * - 0: Character table A on background screen, A on sprite screen
     * - 1: Character table A on background screen, B on sprite screen
     * - 2: Character table B on background screen, A on sprite screen (default)
     * - 3: Character table B on background screen, B on sprite screen
     */
    execute(cgenStmtCst, lineNumber) {
      const expressionCst = getFirstCstNode(cgenStmtCst.children.expression);
      if (!expressionCst) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: "CGEN: Missing mode parameter",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      let mode;
      try {
        const modeValue = this.evaluator.evaluateExpression(expressionCst);
        mode = typeof modeValue === "number" ? Math.floor(modeValue) : Math.floor(parseFloat(String(modeValue)) || 0);
      } catch (error) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `CGEN: Error evaluating mode: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (mode < 0 || mode > 3) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `CGEN: Mode out of range (0-3), got ${mode}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (this.context.deviceAdapter) {
        this.context.deviceAdapter.setCharacterGeneratorMode(mode);
      }
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`CGEN: Character generator mode set to ${mode}`);
      }
    }
  };

  // src/core/execution/executors/CgsetExecutor.ts
  var CgsetExecutor = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Execute a CGSET statement from CST
     * Sets color palette for background and/or sprites
     * m: Background palette code (0 to 1), optional (default: 1)
     * n: Sprite palette code (0 to 2), optional (default: 1)
     * Syntax: CGSET [m][,n]
     */
    execute(cgsetStmtCst, lineNumber) {
      const expressions = getCstNodes(cgsetStmtCst.children.expression);
      let bgPalette = void 0;
      let spritePalette = void 0;
      if (expressions.length >= 1) {
        const mExprCst = expressions[0];
        if (mExprCst) {
          try {
            const mValue = this.evaluator.evaluateExpression(mExprCst);
            bgPalette = typeof mValue === "number" ? Math.floor(mValue) : Math.floor(parseFloat(String(mValue)) || 0);
          } catch (error) {
            this.context.addError({
              line: lineNumber ?? 0,
              message: `CGSET: Error evaluating background palette code: ${error instanceof Error ? error.message : String(error)}`,
              type: ERROR_TYPES.RUNTIME
            });
            return;
          }
        }
      }
      if (expressions.length >= 2) {
        const nExprCst = expressions[1];
        if (nExprCst) {
          try {
            const nValue = this.evaluator.evaluateExpression(nExprCst);
            spritePalette = typeof nValue === "number" ? Math.floor(nValue) : Math.floor(parseFloat(String(nValue)) || 0);
          } catch (error) {
            this.context.addError({
              line: lineNumber ?? 0,
              message: `CGSET: Error evaluating sprite palette code: ${error instanceof Error ? error.message : String(error)}`,
              type: ERROR_TYPES.RUNTIME
            });
            return;
          }
        }
      }
      const finalBgPalette = bgPalette ?? 1;
      const finalSpritePalette = spritePalette ?? 1;
      if (bgPalette !== void 0 && (bgPalette < 0 || bgPalette > 1)) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `CGSET: Background palette code out of range (0-1), got ${bgPalette}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (spritePalette !== void 0 && (spritePalette < 0 || spritePalette > 2)) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `CGSET: Sprite palette code out of range (0-2), got ${spritePalette}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (this.context.deviceAdapter) {
        this.context.deviceAdapter.setColorPalette(finalBgPalette, finalSpritePalette);
      }
      if (this.context.config.enableDebugMode) {
        const bgStr = bgPalette !== void 0 ? String(bgPalette) : "default(1)";
        const spriteStr = spritePalette !== void 0 ? String(spritePalette) : "default(1)";
        this.context.addDebugOutput(`CGSET: Background palette=${bgStr}, Sprite palette=${spriteStr}`);
      }
    }
  };

  // src/core/execution/executors/ClsExecutor.ts
  var ClsExecutor = class {
    constructor(context) {
      this.context = context;
    }
    /**
     * Execute a CLS statement from CST
     * Clears the background screen
     */
    execute(_clsStmtCst) {
      if (this.context.deviceAdapter) {
        this.context.deviceAdapter.clearScreen();
      }
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput("CLS: Screen cleared");
      }
    }
  };

  // src/core/execution/executors/ColorExecutor.ts
  var ColorExecutor = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Execute a COLOR statement from CST
     * Sets color pattern for a 2×2 character area containing position (X, Y)
     * X: Horizontal column (0 to 27)
     * Y: Vertical line (0 to 23)
     * n: Color pattern number (0 to 3)
     */
    execute(colorStmtCst, lineNumber) {
      const expressions = getCstNodes(colorStmtCst.children.expression);
      if (expressions.length < 3) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: "COLOR: Expected three arguments (X, Y, n)",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const xExprCst = expressions[0];
      const yExprCst = expressions[1];
      const patternExprCst = expressions[2];
      if (!xExprCst || !yExprCst || !patternExprCst) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: "COLOR: Invalid arguments",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      let x;
      let y;
      let pattern;
      try {
        const xValue = this.evaluator.evaluateExpression(xExprCst);
        const yValue = this.evaluator.evaluateExpression(yExprCst);
        const patternValue = this.evaluator.evaluateExpression(patternExprCst);
        x = typeof xValue === "number" ? Math.floor(xValue) : Math.floor(parseFloat(String(xValue)) || 0);
        y = typeof yValue === "number" ? Math.floor(yValue) : Math.floor(parseFloat(String(yValue)) || 0);
        pattern = typeof patternValue === "number" ? Math.floor(patternValue) : Math.floor(parseFloat(String(patternValue)) || 0);
      } catch (error) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `COLOR: Error evaluating arguments: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (x < 0 || x > SCREEN_DIMENSIONS.BACKGROUND.MAX_X) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `COLOR: X coordinate out of range (0-${SCREEN_DIMENSIONS.BACKGROUND.MAX_X}), got ${x}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (y < 0 || y > SCREEN_DIMENSIONS.BACKGROUND.MAX_Y) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `COLOR: Y coordinate out of range (0-${SCREEN_DIMENSIONS.BACKGROUND.MAX_Y}), got ${y}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (pattern < COLOR_PATTERNS.MIN || pattern > COLOR_PATTERNS.MAX) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `COLOR: Color pattern number out of range (${COLOR_PATTERNS.MIN}-${COLOR_PATTERNS.MAX}), got ${pattern}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (this.context.deviceAdapter) {
        this.context.deviceAdapter.setColorPattern(x, y, pattern);
      }
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`COLOR: Color pattern ${pattern} set for area containing (${x}, ${y})`);
      }
    }
  };

  // src/core/execution/executors/DataExecutor.ts
  var DataExecutor = class {
    constructor(dataService) {
      this.dataService = dataService;
    }
    /**
     * Execute DATA statement (preprocessing phase)
     * DATA DataConstantList
     */
    execute(cst) {
      const dataConstantListCst = getFirstCstNode(cst.children.dataConstantList);
      if (!dataConstantListCst) {
        return;
      }
      const constants = getCstNodes(dataConstantListCst.children.dataConstant);
      this.dataService.addDataValuesCst(constants);
    }
  };

  // src/core/execution/executors/DefMoveExecutor.ts
  var DefMoveExecutor = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Execute a DEF MOVE statement from CST
     * DEF MOVE(n) = SPRITE(A, B, C, D, E, F)
     * n: action number (0-7)
     * A: character type (0-15)
     * B: direction (0-8)
     * C: speed (1-255, 60/C dots per second)
     * D: distance (1-255, total = 2×D dots)
     * E: priority (0=front, 1=behind background)
     * F: color combination (0-3)
     */
    execute(defMoveStmtCst, lineNumber) {
      try {
        const actionNumberExpr = getCstNodes(defMoveStmtCst.children.actionNumber)?.[0];
        const characterTypeExpr = getCstNodes(defMoveStmtCst.children.characterType)?.[0];
        const directionExpr = getCstNodes(defMoveStmtCst.children.direction)?.[0];
        const speedExpr = getCstNodes(defMoveStmtCst.children.speed)?.[0];
        const distanceExpr = getCstNodes(defMoveStmtCst.children.distance)?.[0];
        const priorityExpr = getCstNodes(defMoveStmtCst.children.priority)?.[0];
        const colorCombinationExpr = getCstNodes(defMoveStmtCst.children.colorCombination)?.[0];
        if (!actionNumberExpr || !characterTypeExpr || !directionExpr || !speedExpr || !distanceExpr || !priorityExpr || !colorCombinationExpr) {
          this.context.addError({
            line: lineNumber ?? 0,
            message: "DEF MOVE: Missing required parameters",
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        const actionNumber = this.evaluateNumber(actionNumberExpr, "action number", lineNumber);
        const characterType = this.evaluateNumber(characterTypeExpr, "character type", lineNumber);
        const direction = this.evaluateNumber(directionExpr, "direction", lineNumber);
        const speed = this.evaluateNumber(speedExpr, "speed", lineNumber);
        const distance = this.evaluateNumber(distanceExpr, "distance", lineNumber);
        const priority = this.evaluateNumber(priorityExpr, "priority", lineNumber);
        const colorCombination = this.evaluateNumber(colorCombinationExpr, "color combination", lineNumber);
        if (actionNumber === null || characterType === null || direction === null || speed === null || distance === null || priority === null || colorCombination === null) {
          return;
        }
        if (!this.validateRange(actionNumber, 0, 7, "action number", lineNumber)) return;
        if (!this.validateRange(characterType, 0, 15, "character type", lineNumber)) return;
        if (!this.validateRange(direction, 0, 8, "direction", lineNumber)) return;
        if (!this.validateRange(speed, 1, 255, "speed", lineNumber)) return;
        if (!this.validateRange(distance, 1, 255, "distance", lineNumber)) return;
        if (!this.validateRange(priority, 0, 1, "priority", lineNumber)) return;
        if (!this.validateRange(colorCombination, 0, 3, "color combination", lineNumber)) return;
        const definition = {
          actionNumber,
          characterType,
          direction,
          speed,
          distance,
          priority,
          colorCombination
        };
        if (this.context.animationManager) {
          try {
            this.context.animationManager.defineMovement(definition);
          } catch (error) {
            this.context.addError({
              line: lineNumber ?? 0,
              message: `DEF MOVE: ${error instanceof Error ? error.message : String(error)}`,
              type: ERROR_TYPES.RUNTIME
            });
            return;
          }
        }
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(
            `DEF MOVE: Defined action ${actionNumber} (character=${characterType}, direction=${direction}, speed=${speed}, distance=${distance})`
          );
        }
      } catch (error) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `DEF MOVE: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
      }
    }
    evaluateNumber(expr, paramName, lineNumber) {
      try {
        const value = this.evaluator.evaluateExpression(expr);
        const num = typeof value === "number" ? Math.floor(value) : Math.floor(parseFloat(String(value)) || 0);
        return num;
      } catch (error) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `DEF MOVE: Error evaluating ${paramName}: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
        return null;
      }
    }
    validateRange(num, min2, max2, paramName, lineNumber) {
      if (num < min2 || num > max2) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `DEF MOVE: ${paramName} out of range (${min2}-${max2}), got ${num}`,
          type: ERROR_TYPES.RUNTIME
        });
        return false;
      }
      return true;
    }
  };

  // src/shared/data/types.ts
  function isEightTileSprite(spriteDef) {
    return Array.isArray(spriteDef.charCodes) && spriteDef.charCodes.length === 8;
  }
  function isSixTileSprite(spriteDef) {
    return Array.isArray(spriteDef.charCodes) && spriteDef.charCodes.length === 6;
  }
  function isFourTileSprite(spriteDef) {
    return Array.isArray(spriteDef.charCodes) && spriteDef.charCodes.length === 4;
  }
  function isOneTileSprite(spriteDef) {
    return typeof spriteDef.charCodes === "number";
  }

  // src/shared/data/characters/achilles.ts
  var SPRITE_ACHILLES_LEFT1_64 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 3, 1, 3, 3],
    [0, 0, 0, 3, 1, 1, 1, 3],
    [0, 0, 0, 3, 1, 1, 1, 3],
    [0, 0, 3, 3, 2, 1, 1, 3],
    [1, 2, 3, 3, 2, 1, 1, 3]
  ];
  var SPRITE_ACHILLES_LEFT1_65 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 1, 1],
    [3, 3, 1, 1, 3, 3, 3, 0],
    [3, 3, 1, 1, 1, 1, 0, 0],
    [3, 1, 1, 3, 3, 3, 0, 0],
    [3, 1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 3, 3, 0, 0, 0],
    [1, 1, 3, 3, 3, 0, 0, 0]
  ];
  var SPRITE_ACHILLES_LEFT1_66 = [
    [2, 2, 3, 3, 3, 1, 3, 3],
    [0, 0, 3, 3, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_ACHILLES_LEFT1_67 = [
    [3, 3, 3, 2, 2, 0, 0, 0],
    [3, 3, 2, 1, 1, 0, 0, 0],
    [3, 3, 2, 1, 1, 1, 2, 2],
    [3, 3, 3, 2, 1, 1, 2, 3],
    [3, 3, 3, 0, 0, 0, 3, 2],
    [3, 3, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_ACHILLES_LEFT2_68 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 3, 1, 3, 3],
    [0, 0, 0, 3, 1, 1, 1, 3],
    [0, 0, 0, 3, 1, 1, 1, 3],
    [0, 0, 3, 3, 2, 1, 1, 3],
    [1, 2, 3, 3, 2, 1, 1, 3],
    [2, 2, 3, 3, 3, 1, 3, 3]
  ];
  var SPRITE_ACHILLES_LEFT2_69 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [1, 1, 3, 3, 3, 0, 0, 0],
    [1, 1, 3, 3, 2, 0, 2, 2]
  ];
  var SPRITE_ACHILLES_LEFT2_70 = [
    [0, 0, 3, 3, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_ACHILLES_LEFT2_71 = [
    [1, 1, 1, 2, 1, 1, 2, 3],
    [1, 1, 1, 2, 1, 1, 3, 2],
    [1, 1, 1, 1, 0, 0, 2, 2],
    [3, 1, 1, 1, 1, 0, 0, 2],
    [3, 1, 1, 3, 3, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_ACHILLES_LEFTUP1_72 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 2, 0, 1, 1, 1],
    [0, 0, 2, 2, 3, 2, 1, 1],
    [0, 0, 0, 3, 3, 3, 2, 1],
    [0, 0, 0, 2, 3, 3, 3, 1],
    [0, 0, 1, 1, 2, 3, 3, 3],
    [0, 0, 1, 1, 1, 1, 3, 3]
  ];
  var SPRITE_ACHILLES_LEFTUP1_73 = [
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 1, 1, 1, 1, 1, 0],
    [3, 3, 1, 1, 1, 1, 1, 1],
    [1, 3, 3, 1, 0, 0, 0, 0],
    [1, 3, 3, 3, 0, 0, 0, 0],
    [1, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0]
  ];
  var SPRITE_ACHILLES_LEFTUP1_74 = [
    [0, 0, 3, 1, 1, 1, 3, 3],
    [0, 0, 3, 3, 3, 3, 3, 3],
    [0, 0, 1, 3, 3, 3, 3, 3],
    [1, 1, 1, 1, 3, 3, 3, 3],
    [1, 1, 1, 1, 3, 3, 3, 3],
    [1, 1, 1, 0, 0, 3, 3, 3],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0]
  ];
  var SPRITE_ACHILLES_LEFTUP1_75 = [
    [3, 3, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 3, 1, 2, 2],
    [3, 3, 3, 3, 1, 2, 2, 3],
    [3, 3, 3, 3, 0, 2, 3, 0],
    [3, 3, 3, 1, 0, 0, 0, 0],
    [3, 3, 1, 2, 2, 0, 0, 0],
    [0, 0, 2, 2, 3, 0, 0, 0],
    [0, 0, 2, 3, 0, 0, 0, 0]
  ];
  var SPRITE_ACHILLES_LEFTUP2_76 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 2, 0, 1, 1, 1],
    [0, 0, 2, 2, 3, 2, 1, 1],
    [0, 0, 0, 3, 3, 3, 2, 1],
    [0, 0, 0, 2, 3, 3, 3, 1],
    [0, 0, 1, 1, 2, 3, 3, 3],
    [0, 0, 1, 1, 1, 1, 3, 3],
    [0, 0, 3, 1, 1, 1, 3, 3]
  ];
  var SPRITE_ACHILLES_LEFTUP2_77 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [1, 3, 3, 1, 1, 0, 0, 0],
    [1, 3, 3, 3, 1, 1, 0, 0],
    [1, 3, 3, 3, 1, 1, 1, 0],
    [3, 3, 3, 3, 3, 0, 1, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0]
  ];
  var SPRITE_ACHILLES_LEFTUP2_78 = [
    [0, 0, 3, 3, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 1, 3, 3, 3, 3],
    [0, 0, 0, 1, 1, 3, 3, 3],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 0]
  ];
  var SPRITE_ACHILLES_LEFTUP2_79 = [
    [3, 3, 3, 3, 3, 1, 2, 2],
    [3, 3, 3, 3, 1, 1, 2, 3],
    [3, 3, 3, 3, 1, 2, 3, 0],
    [3, 3, 3, 0, 0, 2, 3, 0],
    [3, 3, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 2, 0, 0, 0, 0],
    [0, 2, 2, 3, 0, 0, 0, 0],
    [0, 2, 3, 0, 0, 0, 0, 0]
  ];
  var SPRITE_ACHILLES_TOP1_80 = [
    [0, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 2],
    [1, 1, 0, 0, 0, 0, 1, 3],
    [1, 1, 1, 0, 0, 1, 2, 3],
    [0, 1, 1, 0, 3, 1, 2, 3],
    [0, 0, 1, 1, 3, 1, 1, 3],
    [0, 0, 1, 1, 3, 1, 3, 3],
    [0, 0, 0, 1, 3, 3, 3, 3]
  ];
  var SPRITE_ACHILLES_TOP1_81 = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [3, 1, 0, 0, 0, 0, 1, 1],
    [3, 2, 1, 0, 0, 1, 1, 1],
    [3, 2, 1, 3, 0, 1, 1, 0],
    [3, 1, 1, 3, 1, 1, 0, 0],
    [3, 3, 1, 3, 1, 1, 0, 0],
    [3, 3, 3, 3, 1, 0, 0, 0]
  ];
  var SPRITE_ACHILLES_TOP1_82 = [
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 1, 3, 3, 3],
    [0, 0, 0, 0, 0, 1, 3, 3],
    [0, 0, 0, 0, 2, 2, 2, 0],
    [0, 0, 0, 0, 2, 3, 3, 0]
  ];
  var SPRITE_ACHILLES_TOP1_83 = [
    [3, 3, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 1, 0, 0, 0, 0],
    [3, 3, 1, 0, 0, 0, 0, 0],
    [0, 2, 2, 2, 0, 0, 0, 0],
    [0, 3, 3, 2, 0, 0, 0, 0]
  ];
  var SPRITE_ACHILLES_TOP2_84 = [
    [0, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 0, 1, 3],
    [0, 0, 0, 0, 0, 1, 2, 3],
    [0, 0, 0, 0, 3, 1, 2, 3],
    [0, 0, 0, 0, 3, 1, 1, 3],
    [0, 0, 0, 3, 3, 1, 3, 3],
    [0, 0, 1, 3, 3, 3, 3, 3]
  ];
  var SPRITE_ACHILLES_TOP2_85 = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [3, 1, 0, 0, 0, 0, 0, 0],
    [3, 2, 1, 0, 0, 0, 0, 0],
    [3, 2, 1, 3, 0, 0, 0, 0],
    [3, 1, 1, 3, 0, 0, 0, 0],
    [3, 3, 1, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 3, 1, 0, 0]
  ];
  var SPRITE_ACHILLES_TOP2_86 = [
    [0, 1, 1, 3, 3, 3, 3, 3],
    [1, 1, 1, 3, 3, 3, 3, 3],
    [1, 3, 1, 0, 3, 3, 3, 3],
    [1, 3, 0, 0, 3, 3, 3, 3],
    [1, 3, 0, 0, 1, 3, 3, 3],
    [1, 0, 0, 2, 2, 1, 3, 3],
    [0, 0, 3, 3, 2, 2, 0, 0],
    [0, 0, 0, 3, 3, 3, 0, 0]
  ];
  var SPRITE_ACHILLES_TOP2_87 = [
    [3, 3, 3, 3, 3, 1, 1, 0],
    [3, 3, 3, 3, 3, 1, 1, 1],
    [3, 3, 3, 3, 0, 1, 3, 1],
    [3, 3, 3, 3, 0, 0, 3, 1],
    [3, 3, 3, 1, 0, 0, 3, 1],
    [3, 3, 1, 2, 2, 0, 0, 1],
    [0, 0, 2, 2, 3, 3, 0, 0],
    [0, 0, 3, 3, 3, 0, 0, 0]
  ];
  var ACHILLES_SPRITES = [
    {
      name: "Achilles (LEFT1)",
      moveCharacterCode: 3 /* ACHILLES */,
      defaultPaletteCode: 2,
      defaultColorCombination: 1,
      charCodes: [64, 65, 66, 67],
      tiles: [SPRITE_ACHILLES_LEFT1_64, SPRITE_ACHILLES_LEFT1_65, SPRITE_ACHILLES_LEFT1_66, SPRITE_ACHILLES_LEFT1_67]
    },
    {
      name: "Achilles (LEFT2)",
      moveCharacterCode: 3 /* ACHILLES */,
      defaultPaletteCode: 2,
      defaultColorCombination: 1,
      charCodes: [68, 69, 70, 71],
      tiles: [SPRITE_ACHILLES_LEFT2_68, SPRITE_ACHILLES_LEFT2_69, SPRITE_ACHILLES_LEFT2_70, SPRITE_ACHILLES_LEFT2_71]
    },
    {
      name: "Achilles (LEFTUP1)",
      moveCharacterCode: 3 /* ACHILLES */,
      defaultPaletteCode: 2,
      defaultColorCombination: 1,
      charCodes: [72, 73, 74, 75],
      tiles: [SPRITE_ACHILLES_LEFTUP1_72, SPRITE_ACHILLES_LEFTUP1_73, SPRITE_ACHILLES_LEFTUP1_74, SPRITE_ACHILLES_LEFTUP1_75]
    },
    {
      name: "Achilles (LEFTUP2)",
      moveCharacterCode: 3 /* ACHILLES */,
      defaultPaletteCode: 2,
      defaultColorCombination: 1,
      charCodes: [76, 77, 78, 79],
      tiles: [SPRITE_ACHILLES_LEFTUP2_76, SPRITE_ACHILLES_LEFTUP2_77, SPRITE_ACHILLES_LEFTUP2_78, SPRITE_ACHILLES_LEFTUP2_79]
    },
    {
      name: "Achilles (TOP1)",
      moveCharacterCode: 3 /* ACHILLES */,
      defaultPaletteCode: 2,
      defaultColorCombination: 1,
      charCodes: [80, 81, 82, 83],
      tiles: [SPRITE_ACHILLES_TOP1_80, SPRITE_ACHILLES_TOP1_81, SPRITE_ACHILLES_TOP1_82, SPRITE_ACHILLES_TOP1_83]
    },
    {
      name: "Achilles (TOP2)",
      moveCharacterCode: 3 /* ACHILLES */,
      defaultPaletteCode: 2,
      defaultColorCombination: 1,
      charCodes: [84, 85, 86, 87],
      tiles: [SPRITE_ACHILLES_TOP2_84, SPRITE_ACHILLES_TOP2_85, SPRITE_ACHILLES_TOP2_86, SPRITE_ACHILLES_TOP2_87]
    }
  ];

  // src/shared/data/characters/car.ts
  var SPRITE_CAR_LEFT1_120 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 3, 3, 0, 0, 0],
    [0, 0, 1, 3, 3, 0, 0, 0],
    [0, 0, 1, 3, 3, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 2, 2],
    [0, 0, 2, 2, 2, 2, 1, 1],
    [0, 2, 3, 2, 2, 1, 1, 3]
  ];
  var SPRITE_CAR_LEFT1_121 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 3, 3, 3, 3, 0, 0, 0],
    [1, 3, 3, 3, 3, 0, 0, 0],
    [1, 3, 3, 3, 1, 1, 1, 0],
    [0, 0, 1, 0, 1, 1, 1, 0],
    [2, 2, 2, 2, 1, 1, 1, 0],
    [2, 1, 2, 1, 1, 1, 1, 0],
    [2, 3, 3, 3, 1, 1, 1, 0]
  ];
  var SPRITE_CAR_LEFT1_122 = [
    [0, 2, 3, 2, 2, 1, 1, 3],
    [0, 2, 3, 2, 2, 1, 1, 3],
    [0, 0, 2, 2, 2, 2, 1, 1],
    [0, 0, 0, 1, 0, 0, 2, 2],
    [0, 0, 1, 3, 3, 0, 0, 0],
    [0, 0, 1, 3, 3, 0, 0, 0],
    [0, 0, 1, 3, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_CAR_LEFT1_123 = [
    [2, 3, 3, 3, 1, 1, 1, 0],
    [2, 3, 3, 3, 1, 1, 1, 0],
    [2, 1, 2, 1, 1, 1, 1, 0],
    [2, 2, 2, 2, 1, 1, 1, 0],
    [0, 0, 1, 0, 1, 1, 1, 0],
    [1, 3, 3, 3, 1, 1, 1, 0],
    [1, 3, 3, 3, 3, 0, 0, 0],
    [1, 3, 3, 3, 3, 0, 0, 0]
  ];
  var SPRITE_CAR_LEFT2_124 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 3, 3, 1, 0, 0, 0],
    [0, 0, 3, 3, 1, 0, 0, 0],
    [0, 0, 3, 3, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 2, 2],
    [0, 0, 2, 2, 2, 2, 1, 1],
    [0, 2, 3, 2, 2, 1, 1, 3]
  ];
  var SPRITE_CAR_LEFT2_125 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 1, 1, 3, 3, 0, 0, 0],
    [3, 1, 1, 3, 3, 0, 0, 0],
    [3, 1, 1, 3, 1, 1, 1, 0],
    [0, 0, 1, 0, 1, 1, 1, 0],
    [2, 2, 2, 2, 1, 1, 1, 0],
    [2, 1, 2, 1, 1, 1, 1, 0],
    [2, 3, 3, 3, 1, 1, 1, 0]
  ];
  var SPRITE_CAR_LEFT2_126 = [
    [0, 2, 3, 2, 2, 1, 1, 3],
    [0, 2, 3, 2, 2, 1, 1, 3],
    [0, 0, 2, 2, 2, 2, 1, 1],
    [0, 0, 0, 1, 0, 0, 2, 2],
    [0, 0, 3, 3, 1, 0, 0, 0],
    [0, 0, 3, 3, 1, 0, 0, 0],
    [0, 0, 3, 3, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_CAR_LEFT2_127 = [
    [2, 3, 3, 3, 1, 1, 1, 0],
    [2, 3, 3, 3, 1, 1, 1, 0],
    [2, 1, 2, 1, 1, 1, 1, 0],
    [2, 2, 2, 2, 1, 1, 1, 0],
    [0, 0, 1, 0, 1, 1, 1, 0],
    [3, 1, 1, 3, 1, 1, 1, 0],
    [3, 1, 1, 3, 3, 0, 0, 0],
    [3, 1, 1, 3, 3, 0, 0, 0]
  ];
  var SPRITE_CAR_LEFTUP1_128 = [
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 1, 3],
    [0, 0, 0, 2, 2, 2, 0, 3],
    [0, 0, 2, 2, 3, 2, 2, 0],
    [0, 0, 2, 3, 2, 2, 2, 2],
    [0, 0, 2, 2, 2, 1, 1, 1],
    [0, 1, 0, 2, 2, 1, 1, 3],
    [1, 3, 3, 0, 2, 1, 3, 3]
  ];
  var SPRITE_CAR_LEFTUP1_129 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 1, 1, 0, 0],
    [0, 0, 0, 1, 1, 3, 3, 0],
    [2, 2, 0, 1, 3, 3, 3, 3],
    [1, 2, 2, 0, 3, 3, 3, 3],
    [2, 2, 2, 2, 0, 1, 3, 0]
  ];
  var SPRITE_CAR_LEFTUP1_130 = [
    [0, 3, 3, 3, 0, 2, 1, 2],
    [0, 0, 3, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 1, 1, 0, 2],
    [0, 0, 0, 1, 1, 3, 3, 0],
    [0, 0, 0, 1, 3, 3, 3, 1],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 0]
  ];
  var SPRITE_CAR_LEFTUP1_131 = [
    [2, 3, 1, 2, 1, 1, 1, 0],
    [3, 3, 3, 1, 1, 1, 1, 1],
    [1, 3, 1, 1, 1, 1, 1, 0],
    [2, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_CAR_LEFTUP2_132 = [
    [0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 2, 2, 2, 0, 3],
    [0, 0, 2, 2, 3, 2, 2, 0],
    [0, 0, 2, 3, 2, 2, 2, 2],
    [0, 0, 2, 2, 2, 1, 1, 1],
    [0, 3, 0, 2, 2, 1, 1, 3],
    [3, 3, 3, 0, 2, 1, 3, 3]
  ];
  var SPRITE_CAR_LEFTUP2_133 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 3, 3, 0, 0],
    [0, 0, 0, 3, 3, 1, 1, 0],
    [2, 2, 0, 3, 1, 1, 3, 3],
    [1, 2, 2, 0, 1, 3, 3, 3],
    [2, 2, 2, 2, 0, 1, 3, 0]
  ];
  var SPRITE_CAR_LEFTUP2_134 = [
    [0, 3, 3, 1, 0, 2, 1, 2],
    [0, 0, 1, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 3, 3, 0, 2],
    [0, 0, 0, 3, 3, 1, 1, 0],
    [0, 0, 0, 3, 1, 1, 3, 1],
    [0, 0, 0, 0, 1, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 0]
  ];
  var SPRITE_CAR_LEFTUP2_135 = [
    [2, 3, 1, 2, 1, 1, 1, 0],
    [3, 3, 3, 1, 1, 1, 1, 1],
    [1, 3, 1, 1, 1, 1, 1, 0],
    [2, 1, 1, 1, 1, 1, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_CAR_UP1_136 = [
    [0, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 0, 1, 1, 0, 2, 2],
    [0, 0, 0, 3, 3, 1, 2, 3],
    [0, 0, 0, 3, 3, 1, 2, 2],
    [0, 0, 0, 3, 3, 0, 2, 2],
    [0, 0, 0, 0, 0, 0, 2, 1],
    [0, 0, 0, 0, 0, 2, 1, 1],
    [0, 0, 0, 0, 0, 2, 1, 3]
  ];
  var SPRITE_CAR_UP1_137 = [
    [2, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 1, 1, 0, 0, 0],
    [3, 2, 1, 3, 3, 0, 0, 0],
    [2, 2, 1, 3, 3, 0, 0, 0],
    [2, 2, 0, 3, 3, 0, 0, 0],
    [1, 2, 0, 0, 0, 0, 0, 0],
    [1, 1, 2, 0, 0, 0, 0, 0],
    [3, 1, 2, 0, 0, 0, 0, 0]
  ];
  var SPRITE_CAR_UP1_138 = [
    [0, 1, 1, 1, 0, 2, 1, 3],
    [0, 3, 3, 3, 0, 2, 2, 2],
    [0, 3, 3, 3, 1, 2, 1, 3],
    [0, 3, 3, 3, 1, 2, 2, 3],
    [0, 3, 3, 3, 0, 2, 1, 3],
    [0, 3, 3, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1]
  ];
  var SPRITE_CAR_UP1_139 = [
    [3, 1, 2, 0, 1, 1, 1, 0],
    [2, 2, 2, 0, 3, 3, 3, 0],
    [3, 1, 2, 1, 3, 3, 3, 0],
    [3, 2, 2, 1, 3, 3, 3, 0],
    [3, 1, 2, 0, 3, 3, 3, 0],
    [1, 1, 1, 1, 1, 3, 3, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0]
  ];
  var SPRITE_CAR_UP2_140 = [
    [0, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 0, 3, 3, 0, 2, 2],
    [0, 0, 0, 3, 3, 1, 2, 3],
    [0, 0, 0, 3, 3, 1, 2, 2],
    [0, 0, 0, 1, 1, 0, 2, 2],
    [0, 0, 0, 0, 0, 0, 2, 1],
    [0, 0, 0, 0, 0, 2, 1, 1],
    [0, 0, 0, 0, 0, 2, 1, 3]
  ];
  var SPRITE_CAR_UP2_141 = [
    [2, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 3, 3, 0, 0, 0],
    [3, 2, 1, 3, 3, 0, 0, 0],
    [2, 2, 1, 3, 3, 0, 0, 0],
    [2, 2, 0, 1, 1, 0, 0, 0],
    [1, 2, 0, 0, 0, 0, 0, 0],
    [1, 1, 2, 0, 0, 0, 0, 0],
    [3, 1, 2, 0, 0, 0, 0, 0]
  ];
  var SPRITE_CAR_UP2_142 = [
    [0, 3, 3, 3, 0, 2, 1, 3],
    [0, 1, 1, 1, 0, 2, 2, 2],
    [0, 1, 1, 1, 1, 2, 1, 3],
    [0, 3, 3, 3, 1, 2, 2, 3],
    [0, 3, 3, 3, 0, 2, 1, 3],
    [0, 3, 3, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1]
  ];
  var SPRITE_CAR_UP2_143 = [
    [3, 1, 2, 0, 3, 3, 3, 0],
    [2, 2, 2, 0, 1, 1, 1, 0],
    [3, 1, 2, 1, 1, 1, 1, 0],
    [3, 2, 2, 1, 3, 3, 3, 0],
    [3, 1, 2, 0, 3, 3, 3, 0],
    [1, 1, 1, 1, 1, 3, 3, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0]
  ];
  var CAR_SPRITES = [
    {
      name: "Car (LEFT1)",
      moveCharacterCode: 6 /* CAR */,
      defaultPaletteCode: 1,
      defaultColorCombination: 0,
      charCodes: [120, 121, 122, 123],
      tiles: [SPRITE_CAR_LEFT1_120, SPRITE_CAR_LEFT1_121, SPRITE_CAR_LEFT1_122, SPRITE_CAR_LEFT1_123]
    },
    {
      name: "Car (LEFT2)",
      moveCharacterCode: 6 /* CAR */,
      defaultPaletteCode: 1,
      defaultColorCombination: 0,
      charCodes: [124, 125, 126, 127],
      tiles: [SPRITE_CAR_LEFT2_124, SPRITE_CAR_LEFT2_125, SPRITE_CAR_LEFT2_126, SPRITE_CAR_LEFT2_127]
    },
    {
      name: "Car (LEFTUP1)",
      moveCharacterCode: 6 /* CAR */,
      defaultPaletteCode: 1,
      defaultColorCombination: 0,
      charCodes: [128, 129, 130, 131],
      tiles: [SPRITE_CAR_LEFTUP1_128, SPRITE_CAR_LEFTUP1_129, SPRITE_CAR_LEFTUP1_130, SPRITE_CAR_LEFTUP1_131]
    },
    {
      name: "Car (LEFTUP2)",
      moveCharacterCode: 6 /* CAR */,
      defaultPaletteCode: 1,
      defaultColorCombination: 0,
      charCodes: [132, 133, 134, 135],
      tiles: [SPRITE_CAR_LEFTUP2_132, SPRITE_CAR_LEFTUP2_133, SPRITE_CAR_LEFTUP2_134, SPRITE_CAR_LEFTUP2_135]
    },
    {
      name: "Car (UP1)",
      moveCharacterCode: 6 /* CAR */,
      defaultPaletteCode: 1,
      defaultColorCombination: 2,
      charCodes: [136, 137, 138, 139],
      tiles: [SPRITE_CAR_UP1_136, SPRITE_CAR_UP1_137, SPRITE_CAR_UP1_138, SPRITE_CAR_UP1_139]
    },
    {
      name: "Car (UP2)",
      moveCharacterCode: 6 /* CAR */,
      defaultPaletteCode: 1,
      defaultColorCombination: 2,
      charCodes: [140, 141, 142, 143],
      tiles: [SPRITE_CAR_UP2_140, SPRITE_CAR_UP2_141, SPRITE_CAR_UP2_142, SPRITE_CAR_UP2_143]
    }
  ];

  // src/shared/data/characters/com-opr.ts
  var SPRITE_COMPUTER_1_244 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 3, 3, 3, 3, 2, 3],
    [2, 2, 3, 3, 2, 2, 2, 3],
    [2, 2, 3, 3, 2, 2, 2, 3],
    [2, 2, 3, 3, 2, 2, 2, 3],
    [2, 2, 3, 3, 3, 3, 2, 3],
    [2, 2, 3, 3, 3, 3, 2, 3],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var SPRITE_COMPUTER_2_245 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 3, 2, 3, 2, 2],
    [3, 2, 3, 3, 2, 3, 3, 2],
    [3, 2, 3, 3, 2, 3, 3, 3],
    [3, 2, 3, 3, 2, 3, 3, 2],
    [3, 3, 3, 3, 2, 3, 3, 2],
    [3, 3, 3, 3, 2, 3, 3, 2],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var SPRITE_COMPUTER_3_246 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 3, 2, 3, 3, 3, 3, 2],
    [3, 3, 2, 3, 3, 2, 3, 3],
    [3, 3, 2, 3, 3, 3, 3, 3],
    [3, 3, 2, 3, 3, 3, 3, 2],
    [3, 3, 2, 3, 3, 2, 2, 2],
    [3, 3, 2, 3, 3, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var SPRITE_COMPUTER_4_247 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 3, 3, 2, 3, 3, 2, 3],
    [2, 3, 3, 2, 3, 3, 2, 2],
    [2, 3, 3, 2, 3, 3, 2, 2],
    [2, 3, 3, 2, 3, 3, 2, 2],
    [2, 3, 3, 3, 3, 3, 2, 2],
    [2, 3, 3, 3, 3, 3, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var SPRITE_COMPUTER_5_248 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 2, 3, 3, 3, 3],
    [3, 3, 2, 2, 3, 3, 2, 2],
    [3, 3, 2, 2, 3, 3, 3, 3],
    [3, 3, 2, 2, 3, 3, 2, 2],
    [3, 3, 2, 2, 3, 3, 3, 3],
    [3, 3, 2, 2, 3, 3, 3, 3],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var SPRITE_COMPUTER_6_249 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 3, 3, 3, 3, 2, 2, 2],
    [2, 3, 3, 2, 3, 3, 2, 2],
    [2, 3, 3, 3, 3, 3, 2, 2],
    [2, 3, 3, 3, 3, 2, 2, 2],
    [2, 3, 3, 2, 3, 3, 2, 2],
    [2, 3, 3, 2, 2, 3, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var SPRITE_OPERATOR_1_250 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 3, 3, 3, 3, 3, 2],
    [2, 2, 3, 3, 2, 3, 3, 2],
    [2, 2, 3, 3, 2, 3, 3, 2],
    [2, 2, 3, 3, 2, 3, 3, 2],
    [2, 2, 3, 3, 3, 3, 3, 2],
    [2, 2, 3, 3, 3, 3, 3, 2],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var SPRITE_OPERATOR_2_251 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 3, 2, 2, 3, 3],
    [3, 3, 2, 3, 3, 2, 3, 3],
    [3, 3, 3, 3, 3, 2, 3, 3],
    [3, 3, 3, 3, 2, 2, 3, 3],
    [3, 3, 2, 2, 2, 2, 3, 3],
    [3, 3, 2, 2, 2, 2, 3, 3],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var SPRITE_OPERATOR_3_252 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 2, 3, 3, 3, 3, 2],
    [2, 2, 2, 3, 3, 2, 3, 3],
    [3, 3, 2, 3, 3, 3, 3, 3],
    [2, 2, 2, 3, 3, 3, 3, 2],
    [3, 3, 2, 3, 3, 2, 3, 3],
    [3, 3, 2, 3, 3, 2, 2, 3],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var SPRITE_OPERATOR_4_253 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 3, 3, 3, 2, 2, 3],
    [2, 3, 3, 2, 3, 3, 2, 2],
    [2, 3, 3, 2, 3, 3, 2, 2],
    [2, 3, 3, 3, 3, 3, 2, 2],
    [2, 3, 3, 3, 3, 3, 2, 2],
    [2, 3, 3, 2, 3, 3, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var SPRITE_OPERATOR_5_254 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 2, 3, 3, 3, 3],
    [3, 3, 2, 2, 3, 3, 2, 3],
    [3, 3, 2, 2, 3, 3, 2, 3],
    [3, 3, 2, 2, 3, 3, 2, 3],
    [3, 3, 2, 2, 3, 3, 3, 3],
    [3, 3, 2, 2, 3, 3, 3, 3],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var SPRITE_OPERATOR_6_255 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [3, 2, 3, 3, 3, 3, 2, 2],
    [3, 2, 3, 3, 2, 3, 3, 2],
    [3, 2, 3, 3, 3, 3, 3, 2],
    [3, 2, 3, 3, 3, 3, 2, 2],
    [3, 2, 3, 3, 2, 3, 3, 2],
    [3, 2, 3, 3, 2, 2, 3, 2],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var COMPUTEROPERATOR_SPRITES = [
    {
      name: "Computer",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: [244, 245, 246, 247, 248, 249],
      tiles: [SPRITE_COMPUTER_1_244, SPRITE_COMPUTER_2_245, SPRITE_COMPUTER_3_246, SPRITE_COMPUTER_4_247, SPRITE_COMPUTER_5_248, SPRITE_COMPUTER_6_249]
    },
    {
      name: "Operator",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: [250, 251, 252, 253, 254, 255],
      tiles: [SPRITE_OPERATOR_1_250, SPRITE_OPERATOR_2_251, SPRITE_OPERATOR_3_252, SPRITE_OPERATOR_4_253, SPRITE_OPERATOR_5_254, SPRITE_OPERATOR_6_255]
    }
  ];

  // src/shared/data/characters/explosion.ts
  var SPRITE_EXPLOSION_1_176 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 2, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 2, 2, 1],
    [0, 0, 0, 0, 2, 2, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1]
  ];
  var SPRITE_EXPLOSION_1_177 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0],
    [1, 2, 2, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0]
  ];
  var SPRITE_EXPLOSION_1_178 = [
    [0, 0, 0, 0, 2, 2, 1, 1],
    [0, 0, 0, 0, 0, 2, 2, 1],
    [0, 0, 0, 2, 0, 0, 0, 1],
    [0, 0, 0, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_EXPLOSION_1_179 = [
    [1, 2, 2, 0, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_EXPLOSION_2_180 = [
    [0, 0, 0, 3, 3, 0, 0, 0],
    [3, 0, 3, 3, 0, 0, 1, 0],
    [0, 0, 3, 0, 0, 0, 1, 2],
    [0, 0, 0, 2, 0, 2, 1, 2],
    [0, 1, 0, 0, 2, 2, 1, 1],
    [0, 0, 1, 1, 2, 2, 1, 1],
    [0, 3, 0, 1, 1, 1, 1, 1],
    [3, 0, 2, 2, 1, 1, 1, 1]
  ];
  var SPRITE_EXPLOSION_2_181 = [
    [0, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 1, 0, 0],
    [0, 0, 0, 3, 1, 0, 0, 0],
    [2, 0, 2, 1, 1, 0, 0, 0],
    [2, 2, 1, 1, 2, 0, 3, 0],
    [2, 1, 1, 2, 0, 0, 3, 3],
    [1, 1, 1, 2, 2, 0, 0, 3],
    [1, 1, 1, 1, 2, 0, 3, 0]
  ];
  var SPRITE_EXPLOSION_2_182 = [
    [3, 0, 2, 1, 1, 1, 1, 1],
    [3, 2, 2, 1, 1, 1, 1, 1],
    [0, 3, 2, 1, 1, 2, 1, 1],
    [0, 3, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 2, 1, 2, 1],
    [0, 1, 1, 2, 0, 2, 2, 1],
    [1, 0, 0, 0, 3, 0, 0, 3],
    [0, 0, 3, 0, 0, 3, 3, 0]
  ];
  var SPRITE_EXPLOSION_2_183 = [
    [1, 2, 1, 1, 1, 0, 0, 3],
    [1, 1, 1, 2, 2, 0, 3, 0],
    [1, 1, 1, 1, 2, 2, 0, 0],
    [1, 1, 2, 1, 1, 2, 1, 0],
    [1, 2, 1, 2, 0, 0, 0, 0],
    [1, 0, 2, 0, 0, 3, 0, 0],
    [1, 0, 0, 3, 0, 3, 3, 0],
    [1, 0, 0, 0, 3, 3, 0, 0]
  ];
  var EXPLOSION_SPRITES = [
    {
      name: "Explosion (1)",
      defaultPaletteCode: 1,
      defaultColorCombination: 3,
      charCodes: [176, 177, 178, 179],
      tiles: [SPRITE_EXPLOSION_1_176, SPRITE_EXPLOSION_1_177, SPRITE_EXPLOSION_1_178, SPRITE_EXPLOSION_1_179]
    },
    {
      name: "Explosion (2)",
      defaultPaletteCode: 1,
      defaultColorCombination: 3,
      charCodes: [180, 181, 182, 183],
      tiles: [SPRITE_EXPLOSION_2_180, SPRITE_EXPLOSION_2_181, SPRITE_EXPLOSION_2_182, SPRITE_EXPLOSION_2_183]
    }
  ];

  // src/shared/data/characters/fighter-fly.ts
  var SPRITE_FIGHTERFLY_1_56 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 2, 2, 0, 0, 0],
    [0, 1, 1, 1, 0, 2, 0, 2],
    [0, 1, 1, 1, 1, 0, 3, 3],
    [0, 0, 1, 1, 1, 3, 1, 3],
    [0, 0, 1, 1, 1, 3, 3, 3],
    [0, 0, 0, 0, 1, 3, 3, 2]
  ];
  var SPRITE_FIGHTERFLY_1_57 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 2, 2, 1, 0],
    [2, 2, 0, 2, 0, 1, 1, 1],
    [2, 3, 3, 0, 1, 1, 1, 1],
    [2, 3, 1, 3, 1, 1, 1, 1],
    [2, 3, 3, 3, 1, 1, 1, 0],
    [2, 2, 3, 3, 1, 0, 0, 0]
  ];
  var SPRITE_FIGHTERFLY_1_58 = [
    [0, 0, 0, 0, 0, 2, 2, 1],
    [0, 0, 0, 0, 2, 1, 3, 1],
    [0, 0, 0, 3, 2, 1, 3, 1],
    [0, 0, 3, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 1, 1, 3, 3],
    [0, 0, 2, 2, 1, 0, 3, 3],
    [0, 2, 2, 2, 2, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_FIGHTERFLY_1_59 = [
    [3, 1, 2, 2, 0, 0, 0, 0],
    [3, 1, 3, 1, 2, 0, 0, 0],
    [3, 1, 3, 1, 2, 3, 0, 0],
    [2, 2, 2, 2, 0, 0, 3, 0],
    [3, 3, 3, 1, 0, 0, 0, 0],
    [3, 3, 3, 0, 1, 0, 0, 0],
    [3, 3, 0, 1, 2, 2, 0, 0],
    [0, 0, 0, 2, 2, 2, 2, 0]
  ];
  var SPRITE_FIGHTERFLY_2_60 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 2],
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 0, 3, 1, 3],
    [0, 0, 0, 1, 1, 3, 3, 3],
    [0, 0, 1, 1, 1, 3, 3, 2]
  ];
  var SPRITE_FIGHTERFLY_2_61 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 2, 2, 0, 0],
    [2, 2, 0, 2, 0, 0, 0, 0],
    [2, 3, 3, 0, 0, 0, 0, 0],
    [2, 3, 1, 3, 0, 0, 0, 0],
    [2, 3, 3, 3, 1, 1, 0, 0],
    [2, 2, 3, 3, 1, 1, 1, 0]
  ];
  var SPRITE_FIGHTERFLY_2_62 = [
    [0, 1, 1, 1, 1, 2, 2, 1],
    [0, 1, 1, 1, 2, 1, 3, 1],
    [0, 0, 1, 3, 2, 1, 3, 1],
    [0, 0, 3, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 1, 3, 3],
    [0, 0, 0, 0, 1, 0, 3, 3],
    [0, 0, 0, 2, 2, 1, 0, 3],
    [0, 0, 2, 2, 2, 2, 0, 0]
  ];
  var SPRITE_FIGHTERFLY_2_63 = [
    [3, 1, 2, 2, 1, 1, 1, 1],
    [3, 1, 3, 1, 2, 1, 1, 1],
    [3, 1, 3, 1, 2, 3, 1, 0],
    [2, 2, 2, 2, 0, 0, 3, 0],
    [3, 3, 3, 1, 1, 0, 0, 0],
    [3, 3, 3, 0, 1, 2, 2, 0],
    [3, 3, 0, 0, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var FIGHTERFLY_SPRITES = [
    {
      name: "Fighter Fly (1)",
      moveCharacterCode: 2 /* FIGHTER_FLY */,
      defaultPaletteCode: 2,
      defaultColorCombination: 1,
      charCodes: [56, 57, 58, 59],
      tiles: [SPRITE_FIGHTERFLY_1_56, SPRITE_FIGHTERFLY_1_57, SPRITE_FIGHTERFLY_1_58, SPRITE_FIGHTERFLY_1_59]
    },
    {
      name: "Fighter Fly (2)",
      moveCharacterCode: 2 /* FIGHTER_FLY */,
      defaultPaletteCode: 2,
      defaultColorCombination: 1,
      charCodes: [60, 61, 62, 63],
      tiles: [SPRITE_FIGHTERFLY_2_60, SPRITE_FIGHTERFLY_2_61, SPRITE_FIGHTERFLY_2_62, SPRITE_FIGHTERFLY_2_63]
    }
  ];

  // src/shared/data/characters/fireball.ts
  var SPRITE_FIREBALL_1_112 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 3, 3, 3, 0],
    [0, 0, 3, 3, 2, 2, 3, 3],
    [0, 3, 3, 2, 2, 2, 2, 2],
    [0, 3, 2, 2, 0, 1, 0, 1],
    [0, 3, 2, 2, 0, 1, 0, 1],
    [0, 3, 2, 2, 1, 1, 1, 1]
  ];
  var SPRITE_FIREBALL_1_113 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [2, 3, 0, 0, 3, 0, 0, 3],
    [2, 3, 0, 0, 3, 0, 0, 0],
    [2, 3, 0, 0, 3, 3, 0, 0]
  ];
  var SPRITE_FIREBALL_1_114 = [
    [0, 0, 3, 2, 1, 1, 1, 2],
    [0, 0, 3, 2, 2, 1, 2, 2],
    [0, 3, 3, 2, 2, 2, 2, 2],
    [0, 3, 3, 2, 2, 2, 2, 2],
    [0, 3, 3, 3, 2, 2, 2, 2],
    [0, 0, 3, 3, 3, 3, 2, 2],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3]
  ];
  var SPRITE_FIREBALL_1_115 = [
    [3, 3, 0, 3, 3, 3, 0, 0],
    [3, 0, 3, 3, 2, 3, 0, 0],
    [2, 3, 3, 2, 3, 3, 0, 0],
    [2, 2, 2, 2, 3, 0, 0, 0],
    [2, 2, 2, 3, 3, 0, 0, 0],
    [2, 2, 3, 3, 3, 0, 0, 0],
    [2, 2, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0]
  ];
  var SPRITE_FIREBALL_2_116 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 3, 3, 2, 2, 2, 3],
    [0, 3, 3, 2, 2, 2, 2, 2],
    [0, 3, 2, 1, 0, 1, 0, 1],
    [0, 3, 2, 1, 0, 1, 0, 1],
    [0, 0, 3, 2, 1, 1, 1, 1]
  ];
  var SPRITE_FIREBALL_2_117 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [2, 3, 0, 0, 0, 0, 0, 0],
    [2, 3, 0, 0, 0, 0, 3, 0]
  ];
  var SPRITE_FIREBALL_2_118 = [
    [0, 3, 3, 2, 1, 1, 1, 1],
    [0, 3, 2, 2, 1, 1, 1, 1],
    [3, 3, 2, 2, 2, 1, 1, 2],
    [3, 3, 2, 2, 2, 2, 2, 2],
    [3, 3, 2, 2, 2, 2, 2, 2],
    [3, 3, 3, 2, 2, 2, 2, 2],
    [0, 3, 3, 3, 2, 2, 2, 2],
    [0, 0, 0, 3, 3, 3, 3, 3]
  ];
  var SPRITE_FIREBALL_2_119 = [
    [2, 3, 0, 0, 0, 3, 3, 0],
    [2, 3, 0, 3, 3, 3, 3, 0],
    [2, 3, 3, 3, 3, 3, 0, 0],
    [2, 3, 3, 2, 2, 3, 0, 0],
    [2, 2, 2, 2, 3, 0, 0, 0],
    [2, 2, 2, 3, 3, 0, 0, 0],
    [2, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0]
  ];
  var FIREBALL_SPRITES = [
    {
      name: "Fireball (1)",
      moveCharacterCode: 5 /* FIREBALL */,
      defaultPaletteCode: 0,
      defaultColorCombination: 3,
      charCodes: [112, 113, 114, 115],
      tiles: [SPRITE_FIREBALL_1_112, SPRITE_FIREBALL_1_113, SPRITE_FIREBALL_1_114, SPRITE_FIREBALL_1_115]
    },
    {
      name: "Fireball (2)",
      moveCharacterCode: 5 /* FIREBALL */,
      defaultPaletteCode: 0,
      defaultColorCombination: 3,
      charCodes: [116, 117, 118, 119],
      tiles: [SPRITE_FIREBALL_2_116, SPRITE_FIREBALL_2_117, SPRITE_FIREBALL_2_118, SPRITE_FIREBALL_2_119]
    }
  ];

  // src/shared/data/characters/lady.ts
  var SPRITE_LADY_WALK1_28 = [
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 3, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 1, 1, 0, 2, 2]
  ];
  var SPRITE_LADY_WALK1_29 = [
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 3, 0, 0, 0],
    [1, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [2, 3, 3, 3, 0, 0, 0, 0],
    [2, 2, 3, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_WALK1_30 = [
    [0, 0, 0, 1, 1, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 3, 2, 2, 2, 2, 2],
    [0, 0, 0, 3, 2, 2, 2, 2],
    [0, 0, 0, 3, 3, 2, 2, 2],
    [0, 0, 0, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_WALK1_31 = [
    [2, 0, 0, 0, 0, 0, 0, 0],
    [3, 1, 0, 0, 0, 0, 0, 0],
    [2, 1, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [0, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_WALK2_32 = [
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 3, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 2, 2]
  ];
  var SPRITE_LADY_WALK2_33 = [
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 3, 0, 0, 0],
    [1, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [2, 3, 3, 3, 0, 0, 0, 0],
    [2, 2, 3, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_WALK2_34 = [
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 1, 3, 3],
    [0, 0, 0, 0, 0, 0, 2, 1],
    [0, 0, 0, 0, 0, 0, 2, 1],
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 2, 2, 2, 2],
    [0, 0, 0, 0, 3, 3, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 3]
  ];
  var SPRITE_LADY_WALK2_35 = [
    [3, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [1, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_WALK3_36 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 1, 1, 1, 3],
    [0, 0, 0, 1, 1, 3, 1, 3],
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 3],
    [0, 0, 0, 0, 0, 0, 1, 2]
  ];
  var SPRITE_LADY_WALK3_37 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 3, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_WALK3_38 = [
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 2, 2, 2, 2],
    [0, 0, 1, 1, 2, 0, 3, 3],
    [0, 0, 0, 1, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 3, 3, 3, 0]
  ];
  var SPRITE_LADY_WALK3_39 = [
    [2, 3, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0],
    [1, 2, 0, 2, 0, 0, 0, 0],
    [1, 1, 2, 0, 0, 0, 0, 0],
    [2, 2, 2, 3, 0, 0, 0, 0],
    [2, 2, 3, 3, 0, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_JUMP_40 = [
    [0, 0, 0, 1, 1, 0, 0, 3],
    [0, 0, 0, 1, 1, 3, 3, 3],
    [0, 0, 0, 1, 1, 0, 1, 1],
    [0, 0, 0, 2, 2, 1, 1, 3],
    [0, 0, 0, 0, 2, 2, 1, 1],
    [0, 0, 0, 0, 2, 2, 0, 1],
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 2, 2]
  ];
  var SPRITE_LADY_JUMP_41 = [
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [1, 3, 3, 0, 0, 0, 0, 0],
    [1, 3, 3, 0, 0, 3, 0, 0],
    [1, 1, 3, 3, 3, 0, 0, 0],
    [1, 3, 3, 3, 3, 3, 0, 0],
    [1, 2, 2, 3, 3, 0, 0, 0],
    [2, 2, 2, 2, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_JUMP_42 = [
    [0, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 3, 0, 0, 0, 0, 3],
    [0, 0, 3, 3, 2, 2, 2, 2],
    [0, 0, 0, 3, 2, 2, 2, 2],
    [0, 0, 0, 3, 3, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_JUMP_43 = [
    [2, 2, 0, 2, 1, 0, 0, 0],
    [3, 3, 0, 1, 1, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 2, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [2, 2, 3, 3, 0, 0, 0, 0],
    [1, 1, 1, 3, 3, 0, 0, 0],
    [0, 1, 0, 0, 3, 0, 0, 0]
  ];
  var SPRITE_LADY_SLIP_44 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 3],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 1, 0, 0]
  ];
  var SPRITE_LADY_SLIP_45 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [1, 3, 3, 0, 0, 0, 0, 0],
    [1, 3, 3, 0, 0, 3, 0, 0],
    [1, 1, 3, 3, 3, 0, 0, 0],
    [1, 3, 3, 3, 3, 3, 0, 0],
    [1, 2, 2, 3, 3, 0, 0, 0]
  ];
  var SPRITE_LADY_SLIP_46 = [
    [0, 0, 0, 0, 0, 1, 1, 2],
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 3, 0, 3, 2, 2],
    [0, 0, 0, 3, 2, 3, 3, 2],
    [0, 0, 0, 0, 3, 2, 3, 2],
    [0, 0, 0, 0, 3, 0, 3, 0]
  ];
  var SPRITE_LADY_SLIP_47 = [
    [2, 2, 2, 2, 0, 0, 0, 0],
    [2, 2, 0, 2, 1, 0, 0, 0],
    [3, 3, 0, 1, 1, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [2, 2, 2, 2, 0, 0, 1, 0],
    [2, 2, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_LADDER_48 = [
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 1, 1, 3, 3, 2],
    [0, 0, 0, 2, 1, 2, 2, 2]
  ];
  var SPRITE_LADY_LADDER_49 = [
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 1, 0, 0, 0, 0],
    [3, 3, 1, 1, 0, 0, 0, 0],
    [3, 3, 0, 2, 0, 0, 0, 0],
    [3, 0, 2, 2, 0, 0, 0, 0],
    [3, 2, 2, 0, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_LADDER_50 = [
    [0, 0, 0, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 2, 0, 3, 3],
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 2, 2, 2, 2],
    [0, 0, 0, 0, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 3, 3, 0],
    [0, 0, 0, 0, 3, 3, 0, 0]
  ];
  var SPRITE_LADY_LADDER_51 = [
    [2, 0, 0, 0, 0, 0, 0, 0],
    [3, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [2, 2, 3, 3, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_DOWN_52 = [
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 1, 3],
    [0, 0, 3, 0, 3, 1, 1, 3],
    [0, 0, 0, 3, 3, 3, 1, 1],
    [0, 0, 2, 2, 2, 3, 1, 0],
    [0, 1, 2, 2, 2, 2, 1, 0],
    [1, 1, 1, 0, 2, 2, 2, 1]
  ];
  var SPRITE_LADY_DOWN_53 = [
    [3, 3, 0, 3, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 1, 0, 0],
    [1, 1, 3, 0, 0, 1, 1, 0],
    [1, 3, 1, 0, 2, 1, 1, 1],
    [1, 1, 3, 2, 2, 2, 0, 0],
    [0, 1, 2, 2, 2, 0, 0, 0],
    [0, 1, 2, 2, 0, 0, 0, 0],
    [1, 2, 2, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_DOWN_54 = [
    [0, 0, 1, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 2, 2, 2, 2],
    [0, 0, 0, 2, 2, 2, 2, 2],
    [0, 3, 3, 3, 2, 2, 2, 2],
    [0, 0, 0, 3, 3, 0, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LADY_DOWN_55 = [
    [2, 2, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [2, 2, 2, 2, 0, 0, 0, 0],
    [2, 2, 2, 2, 0, 0, 0, 0],
    [2, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 3, 3, 3, 3, 0, 0],
    [0, 0, 3, 3, 0, 0, 0, 0]
  ];
  var LADY_SPRITES = [
    {
      name: "Lady (WALK1)",
      moveCharacterCode: 1 /* LADY */,
      defaultPaletteCode: 0,
      defaultColorCombination: 2,
      charCodes: [28, 29, 30, 31],
      tiles: [SPRITE_LADY_WALK1_28, SPRITE_LADY_WALK1_29, SPRITE_LADY_WALK1_30, SPRITE_LADY_WALK1_31]
    },
    {
      name: "Lady (WALK2)",
      moveCharacterCode: 1 /* LADY */,
      defaultPaletteCode: 0,
      defaultColorCombination: 2,
      charCodes: [32, 33, 34, 35],
      tiles: [SPRITE_LADY_WALK2_32, SPRITE_LADY_WALK2_33, SPRITE_LADY_WALK2_34, SPRITE_LADY_WALK2_35]
    },
    {
      name: "Lady (WALK3)",
      moveCharacterCode: 1 /* LADY */,
      defaultPaletteCode: 0,
      defaultColorCombination: 2,
      charCodes: [36, 37, 38, 39],
      tiles: [SPRITE_LADY_WALK3_36, SPRITE_LADY_WALK3_37, SPRITE_LADY_WALK3_38, SPRITE_LADY_WALK3_39]
    },
    {
      name: "Lady (JUMP)",
      moveCharacterCode: 1 /* LADY */,
      defaultPaletteCode: 0,
      defaultColorCombination: 2,
      charCodes: [40, 41, 42, 43],
      tiles: [SPRITE_LADY_JUMP_40, SPRITE_LADY_JUMP_41, SPRITE_LADY_JUMP_42, SPRITE_LADY_JUMP_43]
    },
    {
      name: "Lady (SLIP)",
      moveCharacterCode: 1 /* LADY */,
      defaultPaletteCode: 0,
      defaultColorCombination: 2,
      charCodes: [44, 45, 46, 47],
      tiles: [SPRITE_LADY_SLIP_44, SPRITE_LADY_SLIP_45, SPRITE_LADY_SLIP_46, SPRITE_LADY_SLIP_47]
    },
    {
      name: "Lady (LADDER)",
      moveCharacterCode: 1 /* LADY */,
      defaultPaletteCode: 0,
      defaultColorCombination: 2,
      charCodes: [48, 49, 50, 51],
      tiles: [SPRITE_LADY_LADDER_48, SPRITE_LADY_LADDER_49, SPRITE_LADY_LADDER_50, SPRITE_LADY_LADDER_51]
    },
    {
      name: "Lady (DOWN)",
      moveCharacterCode: 1 /* LADY */,
      defaultPaletteCode: 0,
      defaultColorCombination: 2,
      charCodes: [52, 53, 54, 55],
      tiles: [SPRITE_LADY_DOWN_52, SPRITE_LADY_DOWN_53, SPRITE_LADY_DOWN_54, SPRITE_LADY_DOWN_55]
    }
  ];

  // src/shared/data/characters/laser.ts
  var SPRITE_LASER_HORIZONTAL1_208 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0, 0, 2, 1, 1, 2, 0, 0],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LASER_HORIZONTAL2_209 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 3, 3, 3, 3, 0, 0],
    [0, 3, 2, 2, 2, 2, 3, 0],
    [3, 2, 1, 1, 1, 1, 2, 3],
    [0, 3, 2, 2, 2, 2, 3, 0],
    [0, 0, 3, 3, 3, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LASER_DIAGONAL1_210 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 2, 2, 0, 0, 0, 0],
    [0, 0, 2, 1, 2, 0, 0, 0],
    [0, 0, 0, 2, 1, 2, 0, 0],
    [0, 0, 0, 0, 2, 2, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LASER_DIAGONAL2_211 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 3, 3, 3, 0, 0, 0],
    [0, 3, 1, 2, 2, 3, 0, 0],
    [0, 3, 2, 1, 1, 2, 3, 0],
    [0, 3, 2, 1, 1, 2, 3, 0],
    [0, 0, 3, 2, 2, 1, 3, 0],
    [0, 0, 0, 3, 3, 3, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LASER_VERTICAL1_212 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 2, 1, 2, 0, 0, 0],
    [0, 0, 2, 1, 2, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LASER_VERTICAL2_213 = [
    [0, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 3, 2, 3, 0, 0, 0],
    [0, 3, 2, 1, 2, 3, 0, 0],
    [0, 3, 2, 1, 2, 3, 0, 0],
    [0, 3, 2, 1, 2, 3, 0, 0],
    [0, 3, 2, 1, 2, 3, 0, 0],
    [0, 0, 3, 2, 3, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0]
  ];
  var LASER_SPRITES = [
    {
      name: "Laser (HORIZONTAL1)",
      moveCharacterCode: 12 /* LASER */,
      defaultPaletteCode: 1,
      defaultColorCombination: 0,
      charCodes: 208,
      tiles: SPRITE_LASER_HORIZONTAL1_208
    },
    {
      name: "Laser (HORIZONTAL2)",
      moveCharacterCode: 12 /* LASER */,
      defaultPaletteCode: 1,
      defaultColorCombination: 0,
      charCodes: 209,
      tiles: SPRITE_LASER_HORIZONTAL2_209
    },
    {
      name: "Laser (DIAGONAL1)",
      moveCharacterCode: 12 /* LASER */,
      defaultPaletteCode: 1,
      defaultColorCombination: 0,
      charCodes: 210,
      tiles: SPRITE_LASER_DIAGONAL1_210
    },
    {
      name: "Laser (DIAGONAL2)",
      moveCharacterCode: 12 /* LASER */,
      defaultPaletteCode: 1,
      defaultColorCombination: 0,
      charCodes: 211,
      tiles: SPRITE_LASER_DIAGONAL2_211
    },
    {
      name: "Laser (VERTICAL1)",
      moveCharacterCode: 12 /* LASER */,
      defaultPaletteCode: 1,
      defaultColorCombination: 0,
      charCodes: 212,
      tiles: SPRITE_LASER_VERTICAL1_212
    },
    {
      name: "Laser (VERTICAL2)",
      moveCharacterCode: 12 /* LASER */,
      defaultPaletteCode: 1,
      defaultColorCombination: 0,
      charCodes: 213,
      tiles: SPRITE_LASER_VERTICAL2_213
    }
  ];

  // src/shared/data/characters/mario.ts
  var SPRITE_MARIO_WALK1_0 = [
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 3, 1],
    [0, 0, 1, 1, 1, 3, 1, 1],
    [0, 0, 0, 3, 3, 3, 3, 1],
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 1, 1, 0, 0, 2, 2]
  ];
  var SPRITE_MARIO_WALK1_1 = [
    [2, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [1, 3, 1, 3, 0, 0, 0, 0],
    [3, 3, 1, 3, 0, 0, 0, 0],
    [1, 1, 3, 3, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [2, 3, 2, 0, 0, 0, 0, 0]
  ];
  var SPRITE_MARIO_WALK1_2 = [
    [0, 0, 1, 1, 2, 2, 2, 2],
    [0, 0, 0, 2, 2, 2, 2, 2],
    [0, 0, 2, 0, 0, 3, 2, 2],
    [0, 0, 2, 2, 3, 3, 3, 3],
    [0, 0, 2, 2, 3, 3, 3, 3],
    [0, 0, 2, 2, 3, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_MARIO_WALK1_3 = [
    [2, 3, 2, 2, 1, 0, 0, 0],
    [2, 3, 2, 1, 1, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 2, 2, 0, 0, 0],
    [0, 0, 2, 2, 0, 0, 0, 0],
    [0, 2, 2, 0, 0, 0, 0, 0]
  ];
  var SPRITE_MARIO_WALK2_4 = [
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 2, 2, 2, 2],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 3, 1],
    [0, 0, 1, 1, 1, 3, 1, 1],
    [0, 0, 0, 3, 3, 3, 3, 1],
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 2, 2]
  ];
  var SPRITE_MARIO_WALK2_5 = [
    [2, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [1, 3, 1, 3, 0, 0, 0, 0],
    [3, 3, 1, 3, 0, 0, 0, 0],
    [1, 1, 3, 3, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [3, 2, 2, 0, 0, 0, 0, 0]
  ];
  var SPRITE_MARIO_WALK2_6 = [
    [0, 0, 0, 0, 0, 2, 2, 3],
    [0, 0, 0, 1, 2, 2, 2, 3],
    [0, 0, 0, 1, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 1],
    [0, 0, 0, 0, 0, 3, 3, 1],
    [0, 0, 0, 0, 0, 2, 2, 3],
    [0, 0, 0, 0, 2, 2, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 2]
  ];
  var SPRITE_MARIO_WALK2_7 = [
    [2, 2, 2, 0, 0, 0, 0, 0],
    [3, 2, 2, 0, 0, 0, 0, 0],
    [1, 2, 2, 0, 0, 0, 0, 0],
    [1, 2, 3, 0, 0, 0, 0, 0],
    [1, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_MARIO_WALK3_8 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 1, 1, 1, 3],
    [0, 0, 1, 1, 1, 3, 1, 1],
    [0, 1, 1, 1, 3, 1, 1, 3],
    [0, 0, 3, 3, 3, 3, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1]
  ];
  var SPRITE_MARIO_WALK3_9 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 1, 3, 0, 0, 0, 0, 0],
    [3, 1, 3, 0, 0, 0, 0, 0],
    [1, 3, 3, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_MARIO_WALK3_10 = [
    [0, 0, 0, 0, 0, 2, 2, 3],
    [0, 0, 0, 0, 2, 2, 3, 2],
    [0, 1, 1, 2, 2, 3, 3, 2],
    [0, 1, 1, 2, 3, 3, 1, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 2, 2, 2]
  ];
  var SPRITE_MARIO_WALK3_11 = [
    [2, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [2, 2, 1, 1, 0, 0, 0, 0],
    [3, 3, 1, 1, 0, 0, 0, 0],
    [3, 3, 3, 2, 0, 0, 0, 0],
    [0, 3, 3, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 2, 0, 0, 0]
  ];
  var SPRITE_MARIO_JUMP_12 = [
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 2, 2],
    [0, 0, 1, 1, 0, 0, 0, 1],
    [0, 0, 2, 2, 0, 1, 1, 1],
    [0, 0, 2, 2, 1, 1, 1, 3],
    [0, 0, 2, 2, 2, 3, 3, 3],
    [0, 0, 0, 2, 2, 2, 1, 1],
    [0, 0, 0, 0, 2, 2, 3, 2]
  ];
  var SPRITE_MARIO_JUMP_13 = [
    [2, 2, 2, 2, 0, 0, 0, 0],
    [2, 2, 2, 2, 2, 0, 0, 0],
    [1, 1, 3, 3, 3, 0, 0, 0],
    [3, 1, 1, 3, 1, 3, 0, 0],
    [1, 1, 3, 3, 1, 3, 0, 0],
    [3, 1, 1, 1, 3, 3, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [2, 3, 2, 2, 2, 0, 0, 0]
  ];
  var SPRITE_MARIO_JUMP_14 = [
    [0, 0, 0, 0, 0, 3, 2, 2],
    [0, 0, 2, 0, 0, 3, 2, 2],
    [0, 0, 2, 2, 3, 3, 3, 3],
    [0, 0, 2, 2, 3, 3, 3, 1],
    [0, 0, 2, 2, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_MARIO_JUMP_15 = [
    [3, 2, 2, 2, 2, 2, 0, 0],
    [3, 2, 2, 2, 2, 1, 1, 0],
    [3, 2, 3, 0, 0, 1, 1, 0],
    [3, 3, 3, 2, 2, 0, 0, 0],
    [3, 3, 3, 3, 2, 2, 0, 0],
    [3, 3, 3, 3, 2, 2, 0, 0],
    [3, 3, 3, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_MARIO_SLIP_16 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 2],
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 3],
    [0, 0, 0, 1, 1, 1, 3, 1],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 1, 1, 1]
  ];
  var SPRITE_MARIO_SLIP_17 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 2, 0, 0, 0, 0],
    [2, 2, 2, 2, 2, 0, 0, 0],
    [1, 1, 3, 3, 3, 0, 0, 0],
    [3, 1, 1, 3, 1, 3, 0, 0],
    [1, 1, 3, 3, 1, 3, 0, 0],
    [3, 1, 1, 1, 3, 3, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0]
  ];
  var SPRITE_MARIO_SLIP_18 = [
    [0, 0, 0, 1, 1, 0, 3, 2],
    [0, 0, 0, 1, 1, 3, 2, 2],
    [0, 0, 0, 1, 2, 3, 2, 3],
    [0, 0, 0, 2, 3, 3, 3, 1],
    [0, 0, 2, 0, 2, 3, 3, 3],
    [0, 0, 2, 3, 2, 2, 3, 3],
    [0, 0, 2, 2, 3, 2, 2, 3],
    [0, 0, 0, 2, 2, 0, 2, 0]
  ];
  var SPRITE_MARIO_SLIP_19 = [
    [2, 2, 3, 2, 2, 0, 0, 0],
    [2, 3, 2, 2, 2, 2, 0, 0],
    [3, 3, 2, 2, 2, 2, 2, 0],
    [1, 3, 3, 3, 0, 2, 1, 0],
    [3, 3, 3, 3, 0, 1, 1, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1, 0, 0, 0]
  ];
  var SPRITE_MARIO_LADDER_20 = [
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 1, 3, 2, 2],
    [0, 0, 0, 0, 1, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 1, 0, 1, 1, 1],
    [0, 0, 1, 2, 2, 3, 2, 2]
  ];
  var SPRITE_MARIO_LADDER_21 = [
    [2, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 1, 0, 0, 0],
    [2, 2, 2, 0, 1, 1, 0, 0],
    [2, 2, 3, 1, 2, 2, 0, 0],
    [3, 3, 3, 1, 2, 2, 0, 0],
    [3, 3, 3, 3, 2, 2, 0, 0],
    [1, 1, 1, 2, 2, 0, 0, 0],
    [2, 2, 3, 2, 2, 0, 0, 0]
  ];
  var SPRITE_MARIO_LADDER_22 = [
    [0, 0, 2, 2, 2, 3, 2, 2],
    [0, 0, 2, 2, 2, 3, 3, 2],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 2, 2, 2, 0]
  ];
  var SPRITE_MARIO_LADDER_23 = [
    [2, 2, 3, 2, 0, 0, 0, 0],
    [2, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 2, 2, 0, 0, 0],
    [0, 0, 2, 2, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_MARIO_DOWN_24 = [
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 3, 1, 3],
    [0, 0, 0, 0, 1, 1, 1, 3],
    [0, 0, 0, 0, 1, 3, 1, 1],
    [0, 0, 0, 0, 3, 1, 3, 3],
    [0, 1, 2, 2, 2, 1, 1, 0],
    [1, 1, 2, 2, 2, 1, 0, 0]
  ];
  var SPRITE_MARIO_DOWN_25 = [
    [2, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [1, 1, 3, 0, 0, 0, 0, 0],
    [1, 3, 1, 1, 0, 1, 0, 0],
    [1, 1, 3, 1, 0, 1, 1, 0],
    [3, 3, 1, 3, 2, 1, 1, 1],
    [0, 1, 1, 2, 2, 2, 1, 0],
    [0, 0, 1, 2, 2, 0, 0, 0]
  ];
  var SPRITE_MARIO_DOWN_26 = [
    [1, 0, 1, 0, 2, 2, 1, 1],
    [0, 0, 0, 0, 0, 2, 3, 2],
    [0, 0, 2, 2, 0, 3, 1, 3],
    [0, 0, 1, 2, 3, 3, 3, 3],
    [0, 0, 1, 2, 2, 3, 3, 3],
    [0, 0, 0, 1, 2, 3, 3, 3],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_MARIO_DOWN_27 = [
    [1, 1, 2, 2, 0, 0, 0, 0],
    [2, 3, 2, 0, 0, 0, 0, 0],
    [3, 1, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 2, 2, 0, 0],
    [0, 3, 3, 2, 2, 1, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0]
  ];
  var MARIO_SPRITES = [
    {
      name: "Mario (WALK1)",
      moveCharacterCode: 0 /* MARIO */,
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: [0, 1, 2, 3],
      tiles: [SPRITE_MARIO_WALK1_0, SPRITE_MARIO_WALK1_1, SPRITE_MARIO_WALK1_2, SPRITE_MARIO_WALK1_3]
    },
    {
      name: "Mario (WALK2)",
      moveCharacterCode: 0 /* MARIO */,
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: [4, 5, 6, 7],
      tiles: [SPRITE_MARIO_WALK2_4, SPRITE_MARIO_WALK2_5, SPRITE_MARIO_WALK2_6, SPRITE_MARIO_WALK2_7]
    },
    {
      name: "Mario (WALK3)",
      moveCharacterCode: 0 /* MARIO */,
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: [8, 9, 10, 11],
      tiles: [SPRITE_MARIO_WALK3_8, SPRITE_MARIO_WALK3_9, SPRITE_MARIO_WALK3_10, SPRITE_MARIO_WALK3_11]
    },
    {
      name: "Mario (JUMP)",
      moveCharacterCode: 0 /* MARIO */,
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: [12, 13, 14, 15],
      tiles: [SPRITE_MARIO_JUMP_12, SPRITE_MARIO_JUMP_13, SPRITE_MARIO_JUMP_14, SPRITE_MARIO_JUMP_15]
    },
    {
      name: "Mario (SLIP)",
      moveCharacterCode: 0 /* MARIO */,
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: [16, 17, 18, 19],
      tiles: [SPRITE_MARIO_SLIP_16, SPRITE_MARIO_SLIP_17, SPRITE_MARIO_SLIP_18, SPRITE_MARIO_SLIP_19]
    },
    {
      name: "Mario (LADDER)",
      moveCharacterCode: 0 /* MARIO */,
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: [20, 21, 22, 23],
      tiles: [SPRITE_MARIO_LADDER_20, SPRITE_MARIO_LADDER_21, SPRITE_MARIO_LADDER_22, SPRITE_MARIO_LADDER_23]
    },
    {
      name: "Mario (DOWN)",
      moveCharacterCode: 0 /* MARIO */,
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: [24, 25, 26, 27],
      tiles: [SPRITE_MARIO_DOWN_24, SPRITE_MARIO_DOWN_25, SPRITE_MARIO_DOWN_26, SPRITE_MARIO_DOWN_27]
    }
  ];
  var LUIGI_SPRITES = MARIO_SPRITES.map((sprite) => ({
    ...sprite,
    name: sprite.name.replace("Mario", "Luigi"),
    defaultColorCombination: 1
  }));

  // src/shared/data/characters/misc.ts
  var SPRITE_PAINTCOLOR_1_214 = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1]
  ];
  var SPRITE_PAINTCOLOR_2_215 = [
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2],
    [2, 2, 2, 2, 2, 2, 2, 2]
  ];
  var SPRITE_PAINTCOLOR_3_216 = [
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3]
  ];
  var SPRITE_MUSICBOARDCURSOR_1_217 = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 1, 1, 1]
  ];
  var SPRITE_MUSICBOARDCURSOR_2_218 = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1]
  ];
  var SPRITE_MUSICBOARDCURSOR_3_219 = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_FIRSTCURSOR_220 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_SECONDCURSOR_221 = [
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LAMP_1_222 = [
    [0, 0, 3, 3, 3, 3, 0, 0],
    [0, 0, 3, 2, 2, 3, 0, 0],
    [0, 0, 3, 2, 2, 3, 0, 0],
    [0, 0, 3, 2, 2, 3, 0, 0],
    [0, 0, 3, 2, 2, 3, 0, 0],
    [0, 0, 3, 3, 3, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_LAMP_2_223 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0, 0, 2, 1, 2, 2, 0, 0],
    [0, 0, 2, 2, 2, 2, 0, 0],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var MISC_SPRITES = [
    {
      name: "Paint Color (1)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 214,
      tiles: SPRITE_PAINTCOLOR_1_214
    },
    {
      name: "Paint Color (2)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 215,
      tiles: SPRITE_PAINTCOLOR_2_215
    },
    {
      name: "Paint Color (3)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 216,
      tiles: SPRITE_PAINTCOLOR_3_216
    },
    {
      name: "Music Board Cursor (1)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 217,
      tiles: SPRITE_MUSICBOARDCURSOR_1_217
    },
    {
      name: "Music Board Cursor (2)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 218,
      tiles: SPRITE_MUSICBOARDCURSOR_2_218
    },
    {
      name: "Music Board Cursor (3)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 219,
      tiles: SPRITE_MUSICBOARDCURSOR_3_219
    },
    {
      name: "1st Cursor",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 220,
      tiles: SPRITE_FIRSTCURSOR_220
    },
    {
      name: "2nd Cursor",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 221,
      tiles: SPRITE_SECONDCURSOR_221
    },
    {
      name: "Lamp (1)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 222,
      tiles: SPRITE_LAMP_1_222
    },
    {
      name: "Lamp (2)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 223,
      tiles: SPRITE_LAMP_2_223
    }
  ];

  // src/shared/data/characters/nitpicker.ts
  var SPRITE_NITPICKER_1_200 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 3, 3, 1, 0],
    [0, 0, 0, 2, 2, 3, 1, 0],
    [0, 0, 2, 2, 0, 2, 1, 0],
    [0, 2, 2, 2, 2, 2, 3, 1]
  ];
  var SPRITE_NITPICKER_1_201 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 3, 3, 0, 0, 0, 0],
    [1, 1, 3, 3, 3, 3, 0, 3],
    [1, 1, 3, 3, 3, 3, 3, 3],
    [1, 3, 3, 3, 3, 3, 3, 3]
  ];
  var SPRITE_NITPICKER_1_202 = [
    [2, 2, 2, 2, 2, 2, 3, 3],
    [0, 0, 0, 0, 2, 2, 3, 3],
    [0, 2, 2, 2, 2, 2, 3, 1],
    [0, 0, 0, 2, 2, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_NITPICKER_1_203 = [
    [3, 3, 1, 1, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 1, 1, 3, 3, 0],
    [1, 3, 3, 3, 3, 3, 2, 2],
    [3, 1, 3, 3, 1, 1, 1, 0],
    [0, 0, 3, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_NITPICKER_2_204 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [2, 2, 2, 2, 3, 3, 1, 0],
    [0, 2, 2, 2, 2, 3, 1, 0],
    [0, 0, 2, 2, 0, 2, 1, 0]
  ];
  var SPRITE_NITPICKER_2_205 = [
    [0, 0, 0, 3, 3, 3, 3, 0],
    [0, 0, 3, 3, 3, 3, 3, 3],
    [0, 3, 3, 3, 3, 1, 1, 1],
    [1, 3, 3, 3, 3, 3, 3, 0],
    [1, 1, 3, 3, 1, 1, 0, 0],
    [1, 1, 3, 3, 3, 3, 0, 3],
    [1, 1, 3, 3, 3, 3, 0, 3],
    [1, 1, 3, 3, 3, 3, 3, 3]
  ];
  var SPRITE_NITPICKER_2_206 = [
    [0, 0, 0, 2, 2, 2, 3, 1],
    [0, 0, 0, 0, 2, 2, 3, 3],
    [0, 0, 0, 2, 2, 2, 3, 3],
    [0, 0, 2, 2, 2, 3, 3, 3],
    [0, 2, 2, 2, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_NITPICKER_2_207 = [
    [1, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 3, 3, 0],
    [3, 3, 3, 3, 2, 2, 2, 2],
    [3, 3, 3, 3, 3, 0, 2, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var NITPICKER_SPRITES = [
    {
      name: "Nit Picker (1)",
      moveCharacterCode: 15 /* NITPICKER */,
      defaultPaletteCode: 2,
      defaultColorCombination: 0,
      charCodes: [200, 201, 202, 203],
      tiles: [SPRITE_NITPICKER_1_200, SPRITE_NITPICKER_1_201, SPRITE_NITPICKER_1_202, SPRITE_NITPICKER_1_203]
    },
    {
      name: "Nit Picker (2)",
      moveCharacterCode: 15 /* NITPICKER */,
      defaultPaletteCode: 2,
      defaultColorCombination: 0,
      charCodes: [204, 205, 206, 207],
      tiles: [SPRITE_NITPICKER_2_204, SPRITE_NITPICKER_2_205, SPRITE_NITPICKER_2_206, SPRITE_NITPICKER_2_207]
    }
  ];

  // src/shared/data/characters/number.ts
  var SPRITE_NUMBER_1_240 = [
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_NUMBER_2_241 = [
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 1, 1, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_NUMBER_3_242 = [
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 0, 0, 0],
    [0, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_NUMBER_4_243 = [
    [1, 0, 1, 1, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 0, 0, 0],
    [1, 0, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var NUMBER_SPRITES = [
    {
      name: "Number (1)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 240,
      tiles: SPRITE_NUMBER_1_240
    },
    {
      name: "Number (2)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 241,
      tiles: SPRITE_NUMBER_2_241
    },
    {
      name: "Number (3)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 242,
      tiles: SPRITE_NUMBER_3_242
    },
    {
      name: "Number (4)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: 243,
      tiles: SPRITE_NUMBER_4_243
    }
  ];

  // src/shared/data/characters/penguin.ts
  var SPRITE_PENGUIN_LEFTSTEP1_96 = [
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 3, 1, 1, 3, 3],
    [0, 0, 0, 1, 1, 1, 1, 3],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 0, 1, 1, 1, 1],
    [0, 0, 1, 0, 1, 1, 1, 3],
    [0, 2, 2, 2, 2, 2, 3, 3],
    [2, 2, 2, 2, 2, 2, 2, 3]
  ];
  var SPRITE_PENGUIN_LEFTSTEP1_97 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0]
  ];
  var SPRITE_PENGUIN_LEFTSTEP1_98 = [
    [0, 0, 1, 2, 2, 2, 1, 3],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 2, 2, 2],
    [0, 0, 0, 1, 1, 1, 2, 2],
    [0, 0, 0, 2, 2, 1, 1, 1],
    [0, 2, 2, 2, 2, 2, 2, 0]
  ];
  var SPRITE_PENGUIN_LEFTSTEP1_99 = [
    [3, 3, 3, 3, 3, 3, 3, 0],
    [3, 3, 3, 3, 3, 3, 0, 0],
    [1, 3, 3, 3, 3, 0, 0, 0],
    [1, 3, 3, 3, 0, 0, 0, 0],
    [1, 3, 3, 3, 0, 0, 0, 0],
    [2, 3, 3, 3, 3, 0, 0, 0],
    [2, 2, 3, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_PENGUIN_LEFTSTEP2_100 = [
    [0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 0, 1],
    [0, 0, 0, 0, 1, 0, 1, 1],
    [0, 0, 2, 2, 2, 2, 1, 1],
    [0, 0, 0, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 2, 2, 2, 2]
  ];
  var SPRITE_PENGUIN_LEFTSTEP2_101 = [
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [1, 3, 3, 3, 0, 0, 0, 0],
    [1, 1, 3, 3, 0, 0, 0, 0],
    [1, 1, 3, 3, 0, 0, 0, 0],
    [1, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0]
  ];
  var SPRITE_PENGUIN_LEFTSTEP2_102 = [
    [0, 0, 0, 1, 1, 1, 2, 3],
    [0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 1, 1],
    [0, 0, 0, 1, 1, 1, 1, 1],
    [0, 2, 2, 2, 1, 1, 1, 1],
    [0, 0, 2, 2, 2, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 2]
  ];
  var SPRITE_PENGUIN_LEFTSTEP2_103 = [
    [3, 3, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 3, 3, 0, 0],
    [1, 3, 3, 3, 3, 3, 3, 0],
    [1, 3, 3, 3, 3, 3, 3, 0],
    [1, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [2, 2, 2, 3, 0, 0, 0, 0]
  ];
  var SPRITE_PENGUIN_FRONT_104 = [
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 1, 1, 3],
    [0, 0, 0, 3, 3, 1, 1, 1],
    [0, 0, 0, 3, 1, 1, 0, 1],
    [0, 0, 0, 3, 1, 1, 0, 1],
    [0, 0, 0, 3, 1, 1, 2, 2],
    [0, 0, 3, 3, 2, 2, 2, 2]
  ];
  var SPRITE_PENGUIN_FRONT_105 = [
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [1, 1, 3, 0, 0, 0, 0, 0],
    [1, 1, 1, 3, 0, 0, 0, 0],
    [0, 1, 1, 3, 0, 0, 0, 0],
    [0, 1, 1, 3, 0, 0, 0, 0],
    [2, 1, 3, 3, 3, 3, 0, 0],
    [2, 2, 2, 3, 3, 3, 3, 0]
  ];
  var SPRITE_PENGUIN_FRONT_106 = [
    [0, 0, 3, 3, 3, 2, 2, 2],
    [0, 3, 3, 3, 3, 1, 1, 1],
    [0, 3, 3, 3, 3, 1, 1, 1],
    [3, 3, 3, 0, 3, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 2, 2, 2, 2, 1],
    [0, 0, 2, 2, 2, 2, 2, 2]
  ];
  var SPRITE_PENGUIN_FRONT_107 = [
    [2, 2, 3, 3, 3, 3, 3, 3],
    [1, 1, 1, 3, 3, 0, 0, 0],
    [1, 1, 1, 1, 3, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 2, 0],
    [1, 1, 1, 2, 2, 2, 0, 0],
    [1, 2, 2, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_PENGUIN_BACK_108 = [
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 3, 3, 3, 3, 3, 3]
  ];
  var SPRITE_PENGUIN_BACK_109 = [
    [3, 3, 0, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 3, 0, 0],
    [3, 3, 3, 3, 3, 3, 3, 0]
  ];
  var SPRITE_PENGUIN_BACK_110 = [
    [0, 0, 3, 3, 3, 3, 3, 3],
    [0, 3, 3, 3, 3, 3, 3, 3],
    [0, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 2, 2, 3, 3, 3],
    [0, 0, 2, 2, 2, 2, 2, 0]
  ];
  var SPRITE_PENGUIN_BACK_111 = [
    [3, 3, 3, 3, 3, 3, 3, 3],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 3, 2, 2, 0],
    [3, 3, 3, 3, 2, 2, 0, 0],
    [3, 3, 2, 2, 2, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0]
  ];
  var PENGUIN_SPRITES = [
    {
      name: "Penguin (LEFTSTEP1)",
      moveCharacterCode: 4 /* PENGUIN */,
      defaultPaletteCode: 2,
      defaultColorCombination: 0,
      charCodes: [96, 97, 98, 99],
      tiles: [SPRITE_PENGUIN_LEFTSTEP1_96, SPRITE_PENGUIN_LEFTSTEP1_97, SPRITE_PENGUIN_LEFTSTEP1_98, SPRITE_PENGUIN_LEFTSTEP1_99]
    },
    {
      name: "Penguin (LEFTSTEP2)",
      moveCharacterCode: 4 /* PENGUIN */,
      defaultPaletteCode: 2,
      defaultColorCombination: 0,
      charCodes: [100, 101, 102, 103],
      tiles: [SPRITE_PENGUIN_LEFTSTEP2_100, SPRITE_PENGUIN_LEFTSTEP2_101, SPRITE_PENGUIN_LEFTSTEP2_102, SPRITE_PENGUIN_LEFTSTEP2_103]
    },
    {
      name: "Penguin (FRONT)",
      moveCharacterCode: 4 /* PENGUIN */,
      defaultPaletteCode: 2,
      defaultColorCombination: 0,
      charCodes: [104, 105, 106, 107],
      tiles: [SPRITE_PENGUIN_FRONT_104, SPRITE_PENGUIN_FRONT_105, SPRITE_PENGUIN_FRONT_106, SPRITE_PENGUIN_FRONT_107]
    },
    {
      name: "Penguin (BACK)",
      moveCharacterCode: 4 /* PENGUIN */,
      defaultPaletteCode: 2,
      defaultColorCombination: 0,
      charCodes: [108, 109, 110, 111],
      tiles: [SPRITE_PENGUIN_BACK_108, SPRITE_PENGUIN_BACK_109, SPRITE_PENGUIN_BACK_110, SPRITE_PENGUIN_BACK_111]
    }
  ];

  // src/shared/data/characters/quill.ts
  var SPRITE_QUILL1_1_224 = [
    [2, 2, 0, 0, 0, 0, 0, 0],
    [0, 2, 2, 0, 0, 0, 0, 0],
    [0, 0, 2, 2, 0, 0, 0, 0],
    [0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 0, 2, 2, 0, 0, 0],
    [0, 0, 0, 0, 2, 2, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0],
    [0, 0, 0, 0, 0, 2, 2, 0]
  ];
  var SPRITE_QUILL1_2_225 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_QUILL1_3_226 = [
    [0, 0, 0, 0, 0, 1, 2, 1],
    [0, 0, 0, 0, 0, 1, 2, 2],
    [0, 0, 0, 0, 1, 1, 1, 2],
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1]
  ];
  var SPRITE_QUILL1_4_227 = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [2, 1, 1, 1, 0, 0, 0, 0],
    [2, 1, 1, 1, 1, 0, 0, 0],
    [1, 2, 3, 1, 1, 0, 0, 0],
    [1, 2, 1, 3, 3, 1, 0, 0],
    [3, 1, 2, 1, 1, 3, 0, 0]
  ];
  var SPRITE_QUILL1_5_228 = [
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 3],
    [0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_QUILL1_6_229 = [
    [3, 1, 2, 1, 1, 1, 0, 0],
    [3, 1, 1, 2, 3, 1, 1, 0],
    [1, 1, 1, 2, 1, 3, 1, 0],
    [1, 1, 3, 1, 2, 1, 3, 0],
    [1, 1, 3, 1, 2, 1, 1, 1],
    [1, 1, 3, 1, 2, 3, 1, 1],
    [0, 3, 1, 1, 3, 2, 3, 1],
    [0, 3, 1, 1, 3, 2, 3, 1]
  ];
  var SPRITE_QUILL1_7_230 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_QUILL1_8_231 = [
    [0, 0, 1, 1, 3, 2, 3, 3],
    [0, 0, 0, 3, 3, 2, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 0],
    [0, 0, 0, 0, 0, 0, 3, 0]
  ];
  var SPRITE_QUILL2_1_232 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 1, 3]
  ];
  var SPRITE_QUILL2_2_233 = [
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 0],
    [0, 0, 3, 3, 3, 3, 3, 0],
    [0, 1, 3, 3, 2, 3, 3, 0],
    [1, 1, 3, 2, 3, 3, 3, 0],
    [1, 1, 2, 3, 3, 3, 0, 0],
    [1, 1, 2, 1, 1, 1, 0, 0]
  ];
  var SPRITE_QUILL2_3_234 = [
    [0, 0, 0, 0, 0, 1, 1, 3],
    [0, 0, 0, 0, 0, 1, 1, 3],
    [0, 0, 0, 0, 3, 1, 1, 1],
    [0, 0, 0, 0, 3, 1, 1, 1],
    [0, 0, 0, 1, 1, 3, 1, 2],
    [0, 0, 0, 1, 1, 3, 1, 2],
    [0, 0, 0, 1, 1, 1, 2, 2],
    [0, 0, 1, 1, 1, 1, 2, 1]
  ];
  var SPRITE_QUILL2_4_235 = [
    [1, 2, 1, 1, 1, 1, 0, 0],
    [1, 2, 1, 1, 1, 0, 0, 0],
    [2, 3, 3, 3, 3, 0, 0, 0],
    [2, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0]
  ];
  var SPRITE_QUILL2_5_236 = [
    [0, 0, 1, 1, 1, 2, 2, 1],
    [0, 0, 1, 1, 1, 2, 1, 1],
    [0, 0, 1, 1, 2, 2, 1, 1],
    [0, 0, 1, 1, 2, 1, 1, 1],
    [0, 0, 1, 2, 2, 1, 1, 1],
    [0, 0, 0, 2, 1, 1, 1, 0],
    [0, 0, 0, 2, 0, 0, 0, 0],
    [0, 0, 2, 2, 0, 0, 0, 0]
  ];
  var SPRITE_QUILL2_6_237 = [
    [1, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_QUILL2_7_238 = [
    [0, 0, 2, 0, 0, 0, 0, 0],
    [0, 0, 2, 0, 0, 0, 0, 0],
    [0, 2, 2, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 0, 0],
    [0, 2, 0, 0, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0],
    [2, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_QUILL2_8_239 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var QUILL_SPRITES = [
    {
      name: "Quill (1)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: [224, 225, 226, 227, 228, 229, 230, 231],
      tiles: [
        SPRITE_QUILL1_1_224,
        SPRITE_QUILL1_2_225,
        SPRITE_QUILL1_3_226,
        SPRITE_QUILL1_4_227,
        SPRITE_QUILL1_5_228,
        SPRITE_QUILL1_6_229,
        SPRITE_QUILL1_7_230,
        SPRITE_QUILL1_8_231
      ]
    },
    {
      name: "Quill (2)",
      defaultPaletteCode: 0,
      defaultColorCombination: 0,
      charCodes: [232, 233, 234, 235, 236, 237, 238, 239],
      tiles: [
        SPRITE_QUILL2_1_232,
        SPRITE_QUILL2_2_233,
        SPRITE_QUILL2_3_234,
        SPRITE_QUILL2_4_235,
        SPRITE_QUILL2_5_236,
        SPRITE_QUILL2_6_237,
        SPRITE_QUILL2_7_238,
        SPRITE_QUILL2_8_239
      ]
    }
  ];

  // src/shared/data/characters/shell-creeper.ts
  var SPRITE_SHELLCREEPER_1_184 = [
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 2, 1, 1, 1, 0, 0],
    [0, 2, 2, 0, 1, 1, 2, 0],
    [0, 2, 2, 0, 1, 1, 2, 0],
    [2, 0, 2, 1, 1, 2, 2, 0],
    [2, 2, 2, 2, 2, 2, 2, 0],
    [2, 2, 2, 2, 2, 2, 0, 0]
  ];
  var SPRITE_SHELLCREEPER_1_185 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 3, 3, 3, 1, 0, 0, 0],
    [3, 0, 3, 3, 0, 1, 0, 0],
    [3, 3, 0, 0, 3, 3, 1, 0]
  ];
  var SPRITE_SHELLCREEPER_1_186 = [
    [2, 2, 0, 0, 2, 2, 0, 3],
    [0, 0, 0, 0, 2, 2, 1, 3],
    [0, 0, 0, 2, 2, 2, 1, 0],
    [0, 0, 2, 2, 2, 2, 1, 3],
    [0, 0, 0, 0, 2, 2, 1, 1],
    [0, 0, 0, 0, 0, 0, 2, 1],
    [0, 0, 0, 0, 2, 2, 2, 2],
    [0, 0, 0, 2, 2, 2, 2, 0]
  ];
  var SPRITE_SHELLCREEPER_1_187 = [
    [3, 0, 3, 3, 0, 3, 1, 0],
    [0, 3, 3, 3, 3, 0, 3, 0],
    [3, 0, 3, 3, 0, 3, 0, 2],
    [3, 3, 0, 0, 3, 3, 3, 0],
    [3, 0, 3, 3, 0, 3, 1, 1],
    [1, 3, 3, 3, 3, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 2, 0],
    [0, 0, 0, 0, 0, 2, 2, 2]
  ];
  var SPRITE_SHELLCREEPER_2_188 = [
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 2, 1, 1, 1, 0, 0],
    [0, 2, 2, 0, 1, 1, 2, 0],
    [0, 2, 2, 0, 1, 1, 2, 0],
    [2, 0, 2, 1, 1, 2, 2, 0],
    [2, 2, 2, 2, 2, 2, 2, 0],
    [2, 2, 2, 0, 2, 2, 0, 3]
  ];
  var SPRITE_SHELLCREEPER_2_189 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 3, 3, 3, 1, 0, 0, 0],
    [3, 0, 3, 3, 0, 1, 0, 0],
    [3, 3, 0, 0, 3, 3, 1, 0],
    [3, 0, 3, 3, 0, 3, 1, 0]
  ];
  var SPRITE_SHELLCREEPER_2_190 = [
    [2, 2, 0, 2, 2, 2, 1, 3],
    [0, 0, 2, 2, 2, 2, 1, 0],
    [0, 0, 0, 2, 2, 2, 1, 3],
    [0, 0, 0, 0, 2, 2, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 2]
  ];
  var SPRITE_SHELLCREEPER_2_191 = [
    [0, 3, 3, 3, 3, 0, 3, 0],
    [3, 0, 3, 3, 0, 3, 0, 2],
    [3, 3, 0, 0, 3, 3, 3, 0],
    [3, 0, 3, 3, 0, 3, 1, 1],
    [1, 3, 3, 3, 3, 1, 1, 0],
    [1, 1, 1, 1, 1, 1, 2, 0],
    [2, 0, 0, 0, 2, 2, 0, 0],
    [2, 2, 0, 2, 2, 2, 0, 0]
  ];
  var SHELLCREEPER_SPRITES = [
    {
      name: "Shell Creeper (1)",
      moveCharacterCode: 13 /* SHELL_CREEPER */,
      defaultPaletteCode: 2,
      defaultColorCombination: 3,
      charCodes: [184, 185, 186, 187],
      tiles: [SPRITE_SHELLCREEPER_1_184, SPRITE_SHELLCREEPER_1_185, SPRITE_SHELLCREEPER_1_186, SPRITE_SHELLCREEPER_1_187]
    },
    {
      name: "Shell Creeper (2)",
      moveCharacterCode: 13 /* SHELL_CREEPER */,
      defaultPaletteCode: 0,
      defaultColorCombination: 3,
      charCodes: [188, 189, 190, 191],
      tiles: [SPRITE_SHELLCREEPER_2_188, SPRITE_SHELLCREEPER_2_189, SPRITE_SHELLCREEPER_2_190, SPRITE_SHELLCREEPER_2_191]
    }
  ];

  // src/shared/data/characters/side-stepper.ts
  var SPRITE_SIDESTEPPER_1_192 = [
    [0, 0, 3, 3, 0, 0, 0, 0],
    [0, 3, 3, 0, 0, 1, 1, 0],
    [3, 3, 0, 3, 0, 1, 1, 0],
    [3, 3, 0, 3, 0, 1, 2, 0],
    [3, 3, 3, 3, 0, 1, 2, 0],
    [3, 3, 3, 0, 0, 1, 1, 0],
    [3, 3, 0, 0, 0, 0, 3, 0],
    [0, 3, 0, 0, 0, 3, 3, 3]
  ];
  var SPRITE_SIDESTEPPER_1_193 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 1, 1, 0, 0],
    [2, 1, 0, 0, 3, 3, 1, 0],
    [2, 1, 0, 3, 0, 3, 3, 1],
    [1, 1, 0, 3, 3, 0, 3, 1],
    [3, 0, 0, 3, 3, 3, 3, 3],
    [3, 3, 0, 0, 3, 3, 3, 3]
  ];
  var SPRITE_SIDESTEPPER_1_194 = [
    [0, 3, 3, 0, 0, 3, 2, 3],
    [0, 0, 3, 3, 2, 3, 3, 3],
    [0, 0, 0, 0, 2, 3, 3, 3],
    [0, 2, 3, 3, 2, 3, 3, 3],
    [0, 3, 0, 0, 2, 2, 3, 3],
    [0, 3, 0, 3, 0, 2, 2, 2],
    [0, 3, 0, 3, 0, 3, 0, 0],
    [0, 3, 0, 3, 0, 3, 0, 0]
  ];
  var SPRITE_SIDESTEPPER_1_195 = [
    [2, 1, 0, 0, 0, 0, 3, 3],
    [3, 3, 1, 3, 3, 3, 3, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 2, 0, 0],
    [3, 3, 2, 0, 0, 0, 3, 0],
    [2, 2, 0, 3, 3, 0, 3, 0],
    [0, 0, 3, 0, 3, 0, 0, 0],
    [0, 0, 3, 0, 0, 0, 0, 0]
  ];
  var SPRITE_SIDESTEPPER_2_196 = [
    [0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 0, 0, 0, 1, 1, 0],
    [0, 0, 3, 3, 0, 1, 2, 0],
    [0, 3, 3, 0, 0, 1, 2, 0],
    [3, 3, 0, 3, 0, 1, 1, 0],
    [3, 3, 0, 3, 0, 0, 3, 0],
    [3, 3, 3, 3, 0, 3, 3, 3],
    [3, 3, 3, 0, 0, 3, 2, 3]
  ];
  var SPRITE_SIDESTEPPER_2_197 = [
    [1, 1, 0, 1, 1, 1, 0, 0],
    [1, 1, 0, 0, 3, 3, 1, 0],
    [2, 1, 0, 3, 0, 3, 1, 0],
    [2, 1, 0, 3, 3, 0, 3, 1],
    [1, 1, 0, 3, 3, 3, 3, 1],
    [3, 0, 0, 0, 3, 3, 3, 3],
    [3, 3, 0, 0, 0, 0, 3, 3],
    [2, 1, 0, 0, 0, 3, 3, 0]
  ];
  var SPRITE_SIDESTEPPER_2_198 = [
    [3, 3, 0, 3, 2, 3, 3, 3],
    [0, 3, 3, 0, 2, 3, 3, 3],
    [0, 0, 2, 3, 2, 3, 3, 3],
    [0, 3, 0, 0, 2, 2, 3, 3],
    [3, 3, 0, 3, 0, 2, 2, 2],
    [3, 0, 3, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 3, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_SIDESTEPPER_2_199 = [
    [3, 3, 1, 3, 3, 3, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [3, 3, 2, 0, 3, 2, 0, 0],
    [2, 2, 0, 3, 0, 3, 0, 0],
    [0, 3, 0, 3, 0, 3, 0, 0],
    [0, 3, 0, 3, 0, 3, 0, 0],
    [3, 0, 0, 3, 0, 3, 0, 0]
  ];
  var SIDESTEPPER_SPRITES = [
    {
      name: "Side Stepper (1)",
      moveCharacterCode: 14 /* SIDE_STEPPER */,
      defaultPaletteCode: 2,
      defaultColorCombination: 2,
      charCodes: [192, 193, 194, 195],
      tiles: [SPRITE_SIDESTEPPER_1_192, SPRITE_SIDESTEPPER_1_193, SPRITE_SIDESTEPPER_1_194, SPRITE_SIDESTEPPER_1_195]
    },
    {
      name: "Side Stepper (2)",
      moveCharacterCode: 14 /* SIDE_STEPPER */,
      defaultPaletteCode: 2,
      defaultColorCombination: 2,
      charCodes: [188, 189, 190, 191],
      tiles: [SPRITE_SIDESTEPPER_2_196, SPRITE_SIDESTEPPER_2_197, SPRITE_SIDESTEPPER_2_198, SPRITE_SIDESTEPPER_2_199]
    }
  ];

  // src/shared/data/characters/smiley.ts
  var SPRITE_SMILEY_1_88 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 3],
    [0, 0, 0, 0, 3, 1, 1, 3],
    [0, 0, 0, 3, 3, 1, 1, 3],
    [0, 0, 3, 1, 3, 1, 2, 3],
    [0, 0, 1, 1, 3, 1, 2, 3],
    [0, 3, 1, 3, 3, 1, 1, 3],
    [1, 3, 3, 3, 3, 3, 3, 3]
  ];
  var SPRITE_SMILEY_1_89 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 1, 1, 0, 0, 0, 0, 0],
    [3, 1, 1, 3, 0, 0, 0, 0],
    [3, 1, 1, 3, 3, 0, 0, 0],
    [3, 2, 1, 3, 3, 3, 0, 0],
    [3, 2, 1, 3, 3, 3, 0, 0],
    [3, 1, 1, 3, 3, 3, 3, 0],
    [3, 3, 3, 3, 3, 3, 3, 1]
  ];
  var SPRITE_SMILEY_1_90 = [
    [1, 3, 3, 3, 3, 1, 0, 1],
    [2, 3, 3, 0, 1, 1, 0, 1],
    [2, 3, 1, 0, 1, 1, 0, 1],
    [2, 2, 3, 0, 1, 1, 0, 1],
    [0, 0, 3, 3, 1, 1, 0, 1],
    [0, 0, 0, 3, 3, 1, 0, 1],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3]
  ];
  var SPRITE_SMILEY_1_91 = [
    [1, 0, 1, 3, 3, 3, 3, 1],
    [1, 0, 1, 1, 0, 3, 3, 2],
    [1, 0, 1, 1, 0, 1, 3, 2],
    [1, 0, 1, 1, 0, 3, 2, 2],
    [1, 0, 1, 1, 3, 3, 0, 0],
    [1, 0, 1, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0]
  ];
  var SPRITE_SMILEY_2_92 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 3],
    [0, 0, 0, 0, 3, 1, 2, 3],
    [0, 0, 0, 3, 3, 1, 2, 3],
    [0, 0, 3, 1, 3, 1, 1, 3],
    [0, 0, 1, 1, 3, 1, 1, 3],
    [0, 3, 1, 3, 3, 1, 1, 3],
    [1, 3, 3, 3, 3, 3, 3, 3]
  ];
  var SPRITE_SMILEY_2_93 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [3, 1, 1, 0, 0, 0, 0, 0],
    [3, 2, 1, 3, 0, 0, 0, 0],
    [3, 2, 1, 3, 3, 0, 0, 0],
    [3, 1, 1, 3, 3, 3, 0, 0],
    [3, 1, 1, 3, 3, 3, 0, 0],
    [3, 1, 1, 3, 3, 3, 3, 0],
    [3, 3, 3, 3, 3, 3, 3, 1]
  ];
  var SPRITE_SMILEY_2_94 = [
    [1, 3, 3, 3, 3, 1, 0, 1],
    [2, 3, 3, 0, 1, 1, 0, 1],
    [2, 3, 1, 0, 1, 3, 3, 3],
    [2, 2, 1, 3, 3, 3, 3, 3],
    [0, 0, 3, 3, 3, 3, 3, 3],
    [0, 0, 0, 3, 3, 3, 3, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 3, 3, 3]
  ];
  var SPRITE_SMILEY_2_95 = [
    [1, 0, 1, 3, 3, 3, 3, 1],
    [1, 0, 1, 1, 0, 3, 3, 2],
    [3, 3, 3, 1, 0, 1, 3, 2],
    [3, 3, 3, 3, 3, 1, 2, 2],
    [3, 3, 3, 3, 3, 3, 0, 0],
    [3, 3, 3, 3, 3, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0]
  ];
  var SMILEY_SPRITES = [
    {
      name: "Smiley (1)",
      moveCharacterCode: 11 /* SMILEY */,
      defaultPaletteCode: 2,
      defaultColorCombination: 1,
      charCodes: [88, 89, 90, 91],
      tiles: [SPRITE_SMILEY_1_88, SPRITE_SMILEY_1_89, SPRITE_SMILEY_1_90, SPRITE_SMILEY_1_91]
    },
    {
      name: "Smiley (2)",
      moveCharacterCode: 11 /* SMILEY */,
      defaultPaletteCode: 2,
      defaultColorCombination: 2,
      charCodes: [92, 93, 94, 95],
      tiles: [SPRITE_SMILEY_2_92, SPRITE_SMILEY_2_93, SPRITE_SMILEY_2_94, SPRITE_SMILEY_2_95]
    }
  ];

  // src/shared/data/characters/spinner.ts
  var SPRITE_SPINNER_1_144 = [
    [0, 0, 0, 0, 0, 3, 3, 3],
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 0, 3],
    [3, 1, 0, 0, 0, 2, 2, 2],
    [3, 1, 1, 0, 0, 2, 2, 1],
    [3, 1, 1, 3, 3, 2, 1, 3]
  ];
  var SPRITE_SPINNER_1_145 = [
    [3, 3, 3, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [2, 2, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 1, 3],
    [1, 2, 2, 0, 0, 1, 1, 3],
    [3, 1, 2, 3, 3, 1, 1, 3]
  ];
  var SPRITE_SPINNER_1_146 = [
    [3, 1, 2, 3, 3, 2, 1, 3],
    [3, 2, 2, 0, 0, 2, 2, 1],
    [3, 2, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 3, 3, 3]
  ];
  var SPRITE_SPINNER_1_147 = [
    [3, 1, 2, 3, 3, 2, 1, 3],
    [1, 2, 2, 0, 0, 2, 2, 3],
    [2, 2, 2, 0, 0, 0, 2, 3],
    [3, 0, 0, 0, 0, 0, 0, 0],
    [3, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0]
  ];
  var SPRITE_SPINNER_2_148 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 3, 1, 1, 0, 0, 0],
    [0, 3, 1, 1, 1, 0, 0, 0],
    [3, 2, 1, 1, 3, 0, 0, 2],
    [0, 2, 2, 3, 3, 3, 2, 2],
    [0, 0, 0, 0, 3, 2, 2, 1],
    [0, 0, 0, 0, 2, 2, 1, 3]
  ];
  var SPRITE_SPINNER_2_149 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0],
    [0, 0, 1, 1, 3, 0, 0, 0],
    [0, 0, 1, 1, 1, 3, 0, 0],
    [0, 0, 3, 1, 1, 2, 3, 0],
    [2, 3, 3, 3, 2, 2, 0, 0],
    [2, 2, 3, 0, 0, 0, 0, 0],
    [1, 2, 2, 0, 0, 0, 0, 0]
  ];
  var SPRITE_SPINNER_2_150 = [
    [0, 0, 0, 2, 2, 1, 3, 3],
    [0, 0, 0, 0, 2, 2, 1, 3],
    [0, 0, 0, 0, 3, 2, 2, 1],
    [0, 1, 1, 3, 3, 3, 2, 2],
    [3, 1, 1, 1, 3, 0, 0, 2],
    [0, 3, 1, 2, 2, 0, 0, 0],
    [0, 0, 3, 2, 2, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0]
  ];
  var SPRITE_SPINNER_2_151 = [
    [3, 1, 2, 2, 0, 0, 0, 0],
    [1, 2, 2, 0, 0, 0, 0, 0],
    [2, 2, 3, 0, 0, 0, 0, 0],
    [2, 3, 3, 3, 1, 1, 0, 0],
    [0, 0, 3, 1, 1, 1, 3, 0],
    [0, 0, 2, 2, 1, 3, 0, 0],
    [0, 0, 2, 2, 3, 0, 0, 0],
    [0, 0, 0, 3, 0, 0, 0, 0]
  ];
  var SPINNER_SPRITES = [
    {
      name: "Spinner (1)",
      moveCharacterCode: 7 /* SPINNER */,
      defaultPaletteCode: 1,
      defaultColorCombination: 1,
      charCodes: [144, 145, 146, 147],
      tiles: [SPRITE_SPINNER_1_144, SPRITE_SPINNER_1_145, SPRITE_SPINNER_1_146, SPRITE_SPINNER_1_147]
    },
    {
      name: "Spinner (2)",
      moveCharacterCode: 7 /* SPINNER */,
      defaultPaletteCode: 1,
      defaultColorCombination: 1,
      charCodes: [148, 149, 150, 151],
      tiles: [SPRITE_SPINNER_2_148, SPRITE_SPINNER_2_149, SPRITE_SPINNER_2_150, SPRITE_SPINNER_2_151]
    }
  ];

  // src/shared/data/characters/star-killer.ts
  var SPRITE_STARKILLER_LEFT_152 = [
    [0, 0, 0, 0, 0, 0, 1, 3],
    [0, 0, 0, 0, 0, 1, 1, 3],
    [0, 0, 0, 0, 0, 1, 1, 3],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 3, 3, 3, 1],
    [0, 1, 1, 3, 1, 3, 1, 1],
    [0, 1, 1, 3, 3, 3, 1, 1]
  ];
  var SPRITE_STARKILLER_LEFT_153 = [
    [1, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [3, 3, 3, 3, 3, 3, 0, 0],
    [1, 1, 1, 1, 1, 1, 1, 0],
    [1, 2, 2, 2, 2, 2, 2, 0],
    [1, 3, 3, 3, 3, 3, 3, 0],
    [1, 3, 2, 3, 2, 3, 2, 0]
  ];
  var SPRITE_STARKILLER_LEFT_154 = [
    [0, 1, 1, 3, 3, 3, 1, 1],
    [0, 2, 1, 3, 3, 3, 2, 1],
    [0, 0, 2, 1, 3, 3, 3, 2],
    [0, 0, 0, 2, 2, 2, 2, 2],
    [0, 0, 0, 0, 3, 3, 3, 3],
    [0, 0, 0, 0, 0, 1, 1, 3],
    [0, 0, 0, 0, 0, 2, 2, 3],
    [0, 0, 0, 0, 0, 0, 2, 3]
  ];
  var SPRITE_STARKILLER_LEFT_155 = [
    [1, 3, 2, 3, 2, 3, 2, 0],
    [1, 3, 3, 3, 3, 3, 3, 0],
    [2, 1, 1, 1, 1, 1, 1, 0],
    [2, 2, 2, 2, 2, 2, 2, 0],
    [3, 3, 3, 3, 3, 3, 0, 0],
    [1, 1, 1, 1, 1, 1, 0, 0],
    [2, 2, 2, 2, 2, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0]
  ];
  var SPRITE_STARKILLER_LEFTUP_156 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 3],
    [0, 0, 0, 1, 1, 1, 1, 1],
    [0, 0, 1, 1, 1, 1, 3, 3],
    [0, 0, 2, 1, 1, 3, 1, 3],
    [0, 0, 2, 1, 3, 3, 3, 1],
    [0, 0, 2, 2, 3, 3, 1, 1],
    [0, 0, 3, 2, 2, 3, 1, 1]
  ];
  var SPRITE_STARKILLER_LEFTUP_157 = [
    [1, 1, 1, 1, 0, 0, 0, 0],
    [3, 1, 1, 1, 3, 0, 0, 0],
    [1, 3, 1, 3, 1, 1, 0, 0],
    [1, 1, 3, 1, 1, 1, 0, 0],
    [3, 1, 1, 3, 1, 1, 1, 0],
    [1, 1, 1, 1, 3, 1, 1, 0],
    [1, 1, 2, 1, 1, 3, 1, 0],
    [1, 2, 3, 2, 1, 1, 3, 0]
  ];
  var SPRITE_STARKILLER_LEFTUP_158 = [
    [0, 2, 1, 3, 2, 2, 2, 1],
    [0, 2, 1, 3, 2, 2, 2, 2],
    [0, 2, 2, 1, 3, 2, 2, 1],
    [0, 2, 2, 3, 1, 3, 2, 2],
    [0, 0, 3, 2, 2, 1, 3, 2],
    [0, 0, 0, 2, 2, 2, 1, 3],
    [0, 0, 0, 0, 2, 2, 2, 1],
    [0, 0, 0, 0, 0, 0, 2, 2]
  ];
  var SPRITE_STARKILLER_LEFTUP_159 = [
    [2, 3, 3, 3, 2, 1, 1, 0],
    [3, 3, 3, 2, 3, 2, 1, 0],
    [3, 3, 2, 3, 2, 3, 2, 0],
    [1, 3, 3, 2, 3, 3, 2, 0],
    [2, 1, 3, 3, 3, 2, 0, 0],
    [2, 2, 1, 3, 2, 0, 0, 0],
    [3, 2, 2, 1, 0, 0, 0, 0],
    [1, 3, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_STARKILLER_UP_160 = [
    [0, 0, 0, 0, 0, 0, 2, 1],
    [0, 0, 0, 0, 0, 2, 1, 1],
    [0, 0, 0, 0, 0, 2, 1, 1],
    [0, 0, 0, 0, 2, 1, 3, 3],
    [0, 0, 1, 3, 2, 3, 3, 3],
    [0, 2, 1, 3, 2, 3, 3, 3],
    [0, 2, 1, 3, 2, 3, 2, 1],
    [0, 3, 3, 3, 2, 2, 1, 1]
  ];
  var SPRITE_STARKILLER_UP_161 = [
    [1, 1, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [3, 3, 1, 1, 0, 0, 0, 0],
    [3, 1, 3, 1, 3, 1, 0, 0],
    [3, 3, 3, 1, 3, 1, 1, 0],
    [1, 1, 3, 1, 3, 1, 1, 0],
    [1, 1, 1, 1, 3, 3, 3, 0]
  ];
  var SPRITE_STARKILLER_UP_162 = [
    [0, 2, 1, 3, 2, 2, 1, 1],
    [0, 2, 1, 3, 2, 1, 3, 3],
    [0, 2, 1, 3, 2, 1, 3, 3],
    [0, 2, 1, 3, 2, 1, 3, 2],
    [0, 0, 1, 3, 2, 1, 3, 3],
    [0, 0, 1, 3, 2, 1, 3, 2],
    [0, 0, 0, 3, 2, 1, 3, 3],
    [0, 0, 0, 0, 0, 1, 3, 2]
  ];
  var SPRITE_STARKILLER_UP_163 = [
    [1, 1, 1, 1, 3, 1, 1, 0],
    [3, 3, 2, 1, 3, 1, 1, 0],
    [3, 3, 2, 1, 3, 1, 1, 0],
    [2, 3, 2, 1, 3, 1, 1, 0],
    [3, 3, 2, 1, 3, 1, 0, 0],
    [2, 3, 2, 1, 3, 1, 0, 0],
    [3, 3, 2, 1, 3, 0, 0, 0],
    [2, 3, 2, 0, 0, 0, 0, 0]
  ];
  var STARKILLER_SPRITES = [
    {
      name: "Star Killer (LEFT)",
      moveCharacterCode: 8 /* STAR_KILLER */,
      defaultPaletteCode: 1,
      defaultColorCombination: 1,
      charCodes: [152, 153, 154, 155],
      tiles: [SPRITE_STARKILLER_LEFT_152, SPRITE_STARKILLER_LEFT_153, SPRITE_STARKILLER_LEFT_154, SPRITE_STARKILLER_LEFT_155]
    },
    {
      name: "Star Killer (LEFTUP)",
      moveCharacterCode: 8 /* STAR_KILLER */,
      defaultPaletteCode: 1,
      defaultColorCombination: 1,
      charCodes: [156, 157, 158, 159],
      tiles: [SPRITE_STARKILLER_LEFTUP_156, SPRITE_STARKILLER_LEFTUP_157, SPRITE_STARKILLER_LEFTUP_158, SPRITE_STARKILLER_LEFTUP_159]
    },
    {
      name: "Star Killer (UP)",
      moveCharacterCode: 8 /* STAR_KILLER */,
      defaultPaletteCode: 1,
      defaultColorCombination: 2,
      charCodes: [160, 161, 162, 163],
      tiles: [SPRITE_STARKILLER_UP_160, SPRITE_STARKILLER_UP_161, SPRITE_STARKILLER_UP_162, SPRITE_STARKILLER_UP_163]
    }
  ];

  // src/shared/data/characters/starship.ts
  var SPRITE_STARSHIP_LEFT_164 = [
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 2, 1, 1, 1],
    [0, 0, 1, 1, 1, 3, 3, 1],
    [0, 1, 1, 3, 3, 3, 1, 1]
  ];
  var SPRITE_STARSHIP_LEFT_165 = [
    [2, 1, 1, 0, 0, 0, 0, 0],
    [2, 1, 1, 1, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [1, 1, 1, 3, 3, 2, 3, 0],
    [1, 1, 1, 1, 3, 2, 3, 0],
    [1, 2, 2, 2, 2, 2, 3, 0]
  ];
  var SPRITE_STARSHIP_LEFT_166 = [
    [0, 1, 1, 3, 3, 3, 1, 1],
    [0, 0, 1, 1, 1, 3, 3, 1],
    [0, 0, 0, 0, 2, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 3, 3],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 3],
    [0, 0, 0, 0, 0, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 1]
  ];
  var SPRITE_STARSHIP_LEFT_167 = [
    [1, 2, 2, 2, 2, 2, 3, 0],
    [1, 1, 1, 1, 3, 2, 3, 0],
    [1, 1, 1, 3, 3, 2, 3, 0],
    [3, 3, 3, 3, 0, 0, 0, 0],
    [1, 1, 1, 0, 0, 0, 0, 0],
    [3, 3, 0, 0, 0, 0, 0, 0],
    [2, 1, 1, 1, 0, 0, 0, 0],
    [2, 1, 1, 0, 0, 0, 0, 0]
  ];
  var SPRITE_STARSHIP_LEFTUP_168 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 1, 1, 1, 1, 2, 0],
    [0, 0, 1, 1, 3, 3, 1, 1],
    [0, 0, 0, 1, 3, 3, 3, 3],
    [0, 0, 0, 1, 3, 3, 1, 1],
    [0, 0, 0, 2, 1, 3, 1, 1]
  ];
  var SPRITE_STARSHIP_LEFTUP_169 = [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0],
    [0, 0, 3, 1, 2, 2, 0, 0],
    [3, 1, 1, 3, 2, 1, 1, 0],
    [1, 3, 1, 1, 3, 1, 1, 0],
    [1, 1, 3, 1, 0, 0, 1, 0],
    [2, 1, 1, 3, 0, 0, 0, 0]
  ];
  var SPRITE_STARSHIP_UP_170 = [
    [0, 0, 0, 0, 1, 3, 1, 2],
    [0, 0, 0, 0, 3, 1, 1, 2],
    [0, 1, 0, 0, 1, 3, 1, 1],
    [0, 1, 1, 3, 1, 1, 3, 1],
    [0, 1, 1, 1, 3, 1, 1, 3],
    [0, 0, 1, 2, 2, 3, 1, 1],
    [0, 0, 0, 2, 1, 1, 0, 0],
    [0, 0, 0, 0, 1, 1, 1, 0]
  ];
  var SPRITE_STARSHIP_UP_171 = [
    [2, 2, 1, 3, 3, 0, 0, 0],
    [2, 2, 2, 3, 2, 0, 0, 0],
    [2, 2, 2, 2, 2, 2, 0, 0],
    [1, 2, 2, 2, 2, 3, 0, 0],
    [3, 3, 2, 2, 3, 0, 0, 0],
    [3, 2, 2, 3, 0, 0, 0, 0],
    [0, 0, 3, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ];
  var SPRITE_STARSHIP_UP_172 = [
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 1, 1],
    [0, 0, 0, 0, 0, 0, 1, 3],
    [0, 0, 0, 0, 0, 2, 1, 3],
    [0, 1, 0, 0, 0, 1, 3, 3],
    [1, 1, 0, 0, 3, 1, 3, 3],
    [1, 1, 3, 1, 3, 1, 3, 1]
  ];
  var SPRITE_STARSHIP_UP_173 = [
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [3, 1, 0, 0, 0, 0, 0, 0],
    [3, 1, 2, 0, 0, 0, 0, 0],
    [3, 3, 1, 0, 0, 0, 1, 0],
    [3, 3, 1, 3, 0, 0, 1, 1],
    [1, 3, 1, 3, 1, 3, 1, 1]
  ];
  var SPRITE_STARSHIP_UP_174 = [
    [1, 1, 3, 1, 3, 1, 1, 1],
    [2, 2, 3, 1, 3, 1, 1, 2],
    [1, 1, 3, 1, 3, 1, 1, 2],
    [1, 1, 0, 1, 3, 1, 1, 2],
    [0, 1, 0, 0, 3, 3, 1, 2],
    [0, 0, 0, 0, 0, 3, 3, 2],
    [0, 0, 0, 0, 0, 2, 2, 2],
    [0, 0, 0, 0, 0, 3, 3, 3]
  ];
  var SPRITE_STARSHIP_UP_175 = [
    [1, 1, 1, 3, 1, 3, 1, 1],
    [2, 1, 1, 3, 1, 3, 2, 2],
    [2, 1, 1, 3, 1, 3, 1, 1],
    [2, 1, 1, 3, 1, 0, 1, 1],
    [2, 1, 3, 3, 0, 0, 1, 0],
    [2, 3, 3, 0, 0, 0, 0, 0],
    [2, 2, 2, 0, 0, 0, 0, 0],
    [3, 3, 3, 0, 0, 0, 0, 0]
  ];
  var STARSHIP_SPRITES = [
    {
      name: "Starship (LEFT)",
      moveCharacterCode: 9 /* STARSHIP */,
      defaultPaletteCode: 1,
      defaultColorCombination: 0,
      charCodes: [164, 165, 166, 167],
      tiles: [SPRITE_STARSHIP_LEFT_164, SPRITE_STARSHIP_LEFT_165, SPRITE_STARSHIP_LEFT_166, SPRITE_STARSHIP_LEFT_167]
    },
    {
      name: "Starship (LEFTUP)",
      moveCharacterCode: 9 /* STARSHIP */,
      defaultPaletteCode: 1,
      defaultColorCombination: 0,
      charCodes: [168, 169, 170, 171],
      tiles: [SPRITE_STARSHIP_LEFTUP_168, SPRITE_STARSHIP_LEFTUP_169, SPRITE_STARSHIP_UP_170, SPRITE_STARSHIP_UP_171]
    },
    {
      name: "Starship (UP)",
      moveCharacterCode: 9 /* STARSHIP */,
      defaultPaletteCode: 1,
      defaultColorCombination: 0,
      charCodes: [172, 173, 174, 175],
      tiles: [SPRITE_STARSHIP_UP_172, SPRITE_STARSHIP_UP_173, SPRITE_STARSHIP_UP_174, SPRITE_STARSHIP_UP_175]
    }
  ];

  // src/shared/data/sprites.ts
  var CHARACTER_SPRITES = [
    ...MARIO_SPRITES,
    ...LUIGI_SPRITES,
    ...LADY_SPRITES,
    ...FIGHTERFLY_SPRITES,
    ...ACHILLES_SPRITES,
    ...SMILEY_SPRITES,
    ...PENGUIN_SPRITES,
    ...FIREBALL_SPRITES,
    ...CAR_SPRITES,
    ...SPINNER_SPRITES,
    ...STARKILLER_SPRITES,
    ...STARSHIP_SPRITES,
    ...EXPLOSION_SPRITES,
    ...SHELLCREEPER_SPRITES,
    ...SIDESTEPPER_SPRITES,
    ...NITPICKER_SPRITES,
    ...LASER_SPRITES,
    ...MISC_SPRITES,
    ...QUILL_SPRITES,
    ...NUMBER_SPRITES,
    ...COMPUTEROPERATOR_SPRITES
  ];
  var TILE_LIST = CHARACTER_SPRITES.flatMap((sprite) => sprite.tiles);

  // src/shared/utils/spriteLookup.ts
  function getSpriteTileByCode(code, tileIndex = 0) {
    for (const sprite of CHARACTER_SPRITES) {
      if (isOneTileSprite(sprite)) {
        if (sprite.charCodes === code && tileIndex === 0) {
          return sprite.tiles;
        }
      } else if (isFourTileSprite(sprite)) {
        const index = sprite.charCodes.indexOf(code);
        if (index >= 0 && index === tileIndex) {
          return sprite.tiles[index] ?? null;
        }
      } else if (isSixTileSprite(sprite)) {
        const index = sprite.charCodes.indexOf(code);
        if (index >= 0 && index === tileIndex) {
          return sprite.tiles[index] ?? null;
        }
      } else if (isEightTileSprite(sprite)) {
        const index = sprite.charCodes.indexOf(code);
        if (index >= 0 && index === tileIndex) {
          return sprite.tiles[index] ?? null;
        }
      }
    }
    return null;
  }
  function getSpriteTilesByCodes(codes) {
    if (codes.length === 1) {
      const code = codes[0];
      if (code === void 0) {
        throw new Error("Undefined character code at index 0");
      }
      const tile = getSpriteTileByCode(code, 0);
      if (!tile) {
        throw new Error(`No sprite tile found for character code ${code} in Table A`);
      }
      return [tile];
    }
    for (const sprite of CHARACTER_SPRITES) {
      if (isFourTileSprite(sprite)) {
        const code0 = codes[0];
        const code1 = codes[1];
        const code2 = codes[2];
        const code3 = codes[3];
        if (code0 !== void 0 && code1 !== void 0 && code2 !== void 0 && code3 !== void 0 && sprite.charCodes[0] === code0 && sprite.charCodes[1] === code1 && sprite.charCodes[2] === code2 && sprite.charCodes[3] === code3) {
          return [...sprite.tiles];
        }
      } else if (isSixTileSprite(sprite) && codes.length === 6) {
        if (sprite.charCodes.every((code, i) => {
          const codeValue = codes[i];
          return codeValue !== void 0 && code === codeValue;
        })) {
          return [...sprite.tiles];
        }
      } else if (isEightTileSprite(sprite) && codes.length === 8) {
        if (sprite.charCodes.every((code, i) => {
          const codeValue = codes[i];
          return codeValue !== void 0 && code === codeValue;
        })) {
          return [...sprite.tiles];
        }
      }
    }
    const tiles = [];
    for (let i = 0; i < codes.length; i++) {
      const code = codes[i];
      if (code === void 0) {
        throw new Error(`Undefined character code at index ${i}`);
      }
      const tile = getSpriteTileByCode(code, i);
      if (!tile) {
        throw new Error(`No sprite tile found for character code ${code} at index ${i} in Table A`);
      }
      tiles.push(tile);
    }
    return tiles;
  }

  // src/core/sprite/characterSetConverter.ts
  function convertCharacterSetToTiles(characterSet, size) {
    const expectedCount = size === 1 ? 4 : 1;
    let charCodes;
    if (typeof characterSet === "string") {
      charCodes = Array.from(characterSet).map((char) => char.charCodeAt(0));
    } else {
      charCodes = characterSet;
    }
    if (charCodes.length !== expectedCount) {
      throw new Error(
        `Invalid character set length: expected ${expectedCount} for ${size === 0 ? "8\xD78" : "16\xD716"} sprite, got ${charCodes.length}`
      );
    }
    try {
      return getSpriteTilesByCodes(charCodes);
    } catch (error) {
      throw new Error(
        `DEF SPRITE: Failed to find sprite tiles in Table A: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
  function stringToCharCodes(str) {
    const cleanStr = str.startsWith('"') && str.endsWith('"') ? str.slice(1, -1) : str;
    return Array.from(cleanStr).map((char) => char.charCodeAt(0));
  }

  // src/core/execution/executors/DefSpriteExecutor.ts
  var DefSpriteExecutor = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Execute a DEF SPRITE statement from CST
     * DEF SPRITE n, (A, B, C, D, E) = character set
     * n: sprite number (0-7)
     * A: color combination (0-3)
     * B: size (0=8×8, 1=16×16)
     * C: priority (0=front, 1=behind background)
     * D: horizontal inversion (0=normal, 1=inverted)
     * E: vertical inversion (0=normal, 1=inverted)
     * character set: string literal or CHR$ expression
     */
    execute(defSpriteStmtCst, lineNumber) {
      try {
        const spriteNumberExpr = getCstNodes(defSpriteStmtCst.children.spriteNumber)?.[0];
        const colorCombinationExpr = getCstNodes(defSpriteStmtCst.children.colorCombination)?.[0];
        const sizeExpr = getCstNodes(defSpriteStmtCst.children.size)?.[0];
        const priorityExpr = getCstNodes(defSpriteStmtCst.children.priority)?.[0];
        const invertXExpr = getCstNodes(defSpriteStmtCst.children.invertX)?.[0];
        const invertYExpr = getCstNodes(defSpriteStmtCst.children.invertY)?.[0];
        const characterSetExpr = getCstNodes(defSpriteStmtCst.children.characterSet)?.[0];
        if (!spriteNumberExpr || !colorCombinationExpr || !sizeExpr || !priorityExpr || !invertXExpr || !invertYExpr || !characterSetExpr) {
          this.context.addError({
            line: lineNumber ?? 0,
            message: "DEF SPRITE: Missing required parameters",
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        const spriteNumber = this.evaluateNumber(spriteNumberExpr, "sprite number", lineNumber);
        const colorCombination = this.evaluateNumber(colorCombinationExpr, "color combination", lineNumber);
        const size = this.evaluateNumber(sizeExpr, "size", lineNumber);
        const priority = this.evaluateNumber(priorityExpr, "priority", lineNumber);
        const invertX = this.evaluateNumber(invertXExpr, "invertX", lineNumber);
        const invertY = this.evaluateNumber(invertYExpr, "invertY", lineNumber);
        if (spriteNumber === null || colorCombination === null || size === null || priority === null || invertX === null || invertY === null) {
          return;
        }
        if (!this.validateSpriteNumber(spriteNumber, lineNumber)) return;
        if (!this.validateRange(colorCombination, 0, 3, "color combination", lineNumber)) return;
        if (!this.validateRange(size, 0, 1, "size", lineNumber)) return;
        if (!this.validateRange(priority, 0, 1, "priority", lineNumber)) return;
        if (!this.validateRange(invertX, 0, 1, "invertX", lineNumber)) return;
        if (!this.validateRange(invertY, 0, 1, "invertY", lineNumber)) return;
        let characterSet;
        const chrCodes = this.extractChrCodesFromExpression(characterSetExpr);
        if (chrCodes.length > 0) {
          characterSet = chrCodes;
        } else {
          const characterSetValue = this.evaluator.evaluateExpression(characterSetExpr);
          if (typeof characterSetValue === "string") {
            characterSet = stringToCharCodes(characterSetValue);
          } else if (typeof characterSetValue === "number") {
            characterSet = [characterSetValue];
          } else {
            this.context.addError({
              line: lineNumber ?? 0,
              message: "DEF SPRITE: Character set must be a string, number, or CHR$ expression",
              type: ERROR_TYPES.RUNTIME
            });
            return;
          }
        }
        let tiles;
        try {
          tiles = convertCharacterSetToTiles(characterSet, size);
        } catch (error) {
          this.context.addError({
            line: lineNumber ?? 0,
            message: `DEF SPRITE: ${error instanceof Error ? error.message : String(error)}`,
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        const definition = {
          spriteNumber,
          colorCombination,
          size,
          priority,
          invertX,
          invertY,
          characterSet,
          tiles
        };
        if (this.context.spriteStateManager) {
          this.context.spriteStateManager.defineSprite(definition);
        }
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(
            `DEF SPRITE: Defined sprite ${spriteNumber} (${size === 0 ? "8\xD78" : "16\xD716"}, priority=${priority}, color=${colorCombination})`
          );
        }
      } catch (error) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `DEF SPRITE: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
      }
    }
    evaluateNumber(expr, paramName, lineNumber) {
      try {
        const value = this.evaluator.evaluateExpression(expr);
        const num = typeof value === "number" ? Math.floor(value) : Math.floor(parseFloat(String(value)) || 0);
        return num;
      } catch (error) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `DEF SPRITE: Error evaluating ${paramName}: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
        return null;
      }
    }
    validateSpriteNumber(num, lineNumber) {
      if (num < 0 || num > 7) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `DEF SPRITE: Sprite number out of range (0-7), got ${num}`,
          type: ERROR_TYPES.RUNTIME
        });
        return false;
      }
      return true;
    }
    validateRange(num, min2, max2, paramName, lineNumber) {
      if (num < min2 || num > max2) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `DEF SPRITE: ${paramName} out of range (${min2}-${max2}), got ${num}`,
          type: ERROR_TYPES.RUNTIME
        });
        return false;
      }
      return true;
    }
    /**
     * Extract CHR$ codes from expression
     * Handles expressions like: CHR$(0), CHR$(0)+CHR$(1), etc.
     * Returns array of character codes, or empty array if no CHR$ found
     */
    extractChrCodesFromExpression(exprCst) {
      const codes = [];
      const additiveCst = getFirstCstNode(exprCst.children.additive);
      if (additiveCst) {
        const modExprs = getCstNodes(additiveCst.children.modExpression);
        for (const modExpr of modExprs) {
          const codesFromMod = this.extractChrCodesFromModExpression(modExpr);
          codes.push(...codesFromMod);
        }
        return codes;
      }
      const modExprCst = getFirstCstNode(exprCst.children.modExpression);
      if (modExprCst) {
        return this.extractChrCodesFromModExpression(modExprCst);
      }
      const multExprCst = getFirstCstNode(exprCst.children.multiplicative);
      if (multExprCst) {
        return this.extractChrCodesFromMultiplicative(multExprCst);
      }
      const primaryCst = getFirstCstNode(exprCst.children.primary);
      if (primaryCst) {
        return this.extractChrCodesFromPrimary(primaryCst);
      }
      return codes;
    }
    extractChrCodesFromModExpression(modExprCst) {
      const codes = [];
      const multExprs = getCstNodes(modExprCst.children.multiplicative);
      for (const multExpr of multExprs) {
        const codesFromMult = this.extractChrCodesFromMultiplicative(multExpr);
        codes.push(...codesFromMult);
      }
      return codes;
    }
    extractChrCodesFromMultiplicative(multExprCst) {
      const codes = [];
      const unaryExprs = getCstNodes(multExprCst.children.unary);
      for (const unaryExpr of unaryExprs) {
        const codesFromUnary = this.extractChrCodesFromUnary(unaryExpr);
        codes.push(...codesFromUnary);
      }
      return codes;
    }
    extractChrCodesFromUnary(unaryExprCst) {
      const primaryCst = getFirstCstNode(unaryExprCst.children.primary);
      if (primaryCst) {
        return this.extractChrCodesFromPrimary(primaryCst);
      }
      return [];
    }
    extractChrCodesFromPrimary(primaryCst) {
      const functionCallCst = getFirstCstNode(primaryCst.children.functionCall);
      if (functionCallCst) {
        const chrToken = getFirstToken(functionCallCst.children.Chr);
        if (chrToken) {
          const exprListCst = getFirstCstNode(functionCallCst.children.expressionList);
          if (exprListCst) {
            const expressions = getCstNodes(exprListCst.children.expression);
            if (expressions.length > 0) {
              const codeValue = this.evaluator.evaluateExpression(expressions[0]);
              const code = typeof codeValue === "number" ? Math.floor(codeValue) : Math.floor(parseFloat(String(codeValue)) || 0);
              if (code >= 0 && code <= 255) {
                return [code];
              }
            }
          }
        }
      }
      return [];
    }
  };

  // src/core/execution/executors/DimExecutor.ts
  var DimExecutor = class {
    constructor(context, evaluator, variableService) {
      this.context = context;
      this.evaluator = evaluator;
      this.variableService = variableService;
    }
    /**
     * Execute DIM statement
     * DIM ArrayDeclaration (Comma ArrayDeclaration)*
     */
    execute(cst, lineNumber) {
      const arrayDeclarations = getCstNodes(cst.children.arrayDeclaration);
      for (const arrayDeclCst of arrayDeclarations) {
        const identifierToken = getFirstToken(arrayDeclCst.children.Identifier);
        if (!identifierToken) {
          this.context.addError({
            line: lineNumber,
            message: "DIM: Missing array name",
            type: ERROR_TYPES.RUNTIME
          });
          continue;
        }
        const arrayName = identifierToken.image;
        const dimensionListCst = getFirstCstNode(arrayDeclCst.children.dimensionList);
        if (!dimensionListCst) {
          this.context.addError({
            line: lineNumber,
            message: `DIM: Missing dimensions for array ${arrayName}`,
            type: ERROR_TYPES.RUNTIME
          });
          continue;
        }
        const dimensionExpressions = getCstNodes(dimensionListCst.children.expression);
        const dimensions = [];
        for (const exprCst of dimensionExpressions) {
          const value = this.evaluator.evaluateExpression(exprCst);
          const numValue = this.toNumber(value);
          if (numValue < 0) {
            this.context.addError({
              line: lineNumber,
              message: `DIM: Array dimension must be >= 0 for ${arrayName}`,
              type: ERROR_TYPES.RUNTIME
            });
            return;
          }
          dimensions.push(numValue);
        }
        if (dimensions.length < 1 || dimensions.length > 2) {
          this.context.addError({
            line: lineNumber,
            message: `DIM: Arrays can have 1 or 2 dimensions only for ${arrayName}`,
            type: ERROR_TYPES.RUNTIME
          });
          continue;
        }
        this.variableService.createArray(arrayName, dimensions);
        if (this.context.config.enableDebugMode) {
          const dimStr = dimensions.join(",");
          this.context.addDebugOutput(`DIM: Created array ${arrayName}(${dimStr})`);
        }
      }
    }
    /**
     * Convert a value to an integer
     */
    toNumber(value) {
      if (typeof value === "number") {
        return Math.floor(value);
      }
      if (typeof value === "boolean") return value ? 1 : 0;
      if (typeof value === "string") {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 0 : parsed;
      }
      return 0;
    }
  };

  // src/core/execution/executors/EndExecutor.ts
  var EndExecutor = class {
    constructor(context) {
      this.context = context;
    }
    /**
     * Execute an END statement from CST
     * Stops program execution immediately
     */
    execute(_endStmtCst) {
      this.context.shouldStop = true;
      this.context.isRunning = false;
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput("END: Program terminated");
      }
    }
  };

  // src/core/execution/executors/ForExecutor.ts
  var ForExecutor = class {
    constructor(context, evaluator, variableService) {
      this.context = context;
      this.evaluator = evaluator;
      this.variableService = variableService;
    }
    /**
     * Execute a FOR statement from CST
     * Initializes the loop variable and pushes loop state onto the stack
     * If loop is already active (jumped back from NEXT), skip re-initialization
     */
    execute(forStmtCst, statementIndex, lineNumber) {
      const identifierToken = getFirstToken(forStmtCst.children.Identifier);
      const expressions = getCstNodes(forStmtCst.children.expression);
      const startExprCst = expressions[0];
      const endExprCst = expressions[1];
      if (!identifierToken || !startExprCst || !endExprCst) {
        this.context.addError({
          line: lineNumber,
          message: "Invalid FOR statement: missing variable or expressions",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const varName = identifierToken.image.toUpperCase();
      const existingLoop = this.context.loopStack.find(
        (loop) => loop.variableName === varName && loop.statementIndex === statementIndex
      );
      if (existingLoop) {
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(
            `FOR: ${varName} loop already active, skipping re-initialization`
          );
        }
        return;
      }
      const startValue = this.evaluator.evaluateExpression(startExprCst);
      const endValue = this.evaluator.evaluateExpression(endExprCst);
      if (typeof startValue !== "number" || typeof endValue !== "number") {
        this.context.addError({
          line: lineNumber,
          message: "FOR loop requires numeric values",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      let stepValue = DEFAULTS.FOR_LOOP_STEP;
      const stepExprCst = expressions[2];
      if (stepExprCst) {
        const stepValueResult = this.evaluator.evaluateExpression(stepExprCst);
        if (typeof stepValueResult !== "number") {
          this.context.addError({
            line: lineNumber,
            message: "FOR STEP requires numeric value",
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        stepValue = stepValueResult;
      }
      this.variableService.setVariable(varName, startValue);
      const loopState = {
        variableName: varName,
        startValue,
        endValue,
        stepValue,
        currentValue: startValue,
        statementIndex,
        // Jump back to the same statement index
        shouldExecute: this.shouldExecuteLoop(startValue, endValue, stepValue)
      };
      this.context.loopStack.push(loopState);
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(
          `FOR: ${varName} = ${startValue} TO ${endValue} STEP ${stepValue} (shouldExecute: ${loopState.shouldExecute})`
        );
      }
    }
    /**
     * Determine if loop should execute based on start, end, and step values
     */
    shouldExecuteLoop(start, end, step) {
      if (step > 0) {
        return start <= end;
      } else if (step < 0) {
        return start >= end;
      } else {
        return false;
      }
    }
  };

  // src/core/execution/executors/GosubExecutor.ts
  var GosubExecutor = class {
    constructor(context) {
      this.context = context;
    }
    /**
     * Execute a GOSUB statement from CST
     * Jumps to the specified line number and pushes return address to stack
     */
    execute(gosubStmtCst, lineNumber) {
      const lineNumberToken = getFirstToken(gosubStmtCst.children.NumberLiteral);
      if (!lineNumberToken) {
        this.context.addError({
          line: lineNumber,
          message: "GOSUB: missing line number",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const targetLineNumber = parseInt(lineNumberToken.image, 10);
      if (isNaN(targetLineNumber)) {
        this.context.addError({
          line: lineNumber,
          message: `GOSUB: invalid line number: ${lineNumberToken.image}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const targetStatementIndex = this.context.findStatementIndexByLine(targetLineNumber);
      if (targetStatementIndex === -1) {
        this.context.addError({
          line: lineNumber,
          message: `GOSUB: line number ${targetLineNumber} not found`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const returnStatementIndex = this.context.currentStatementIndex + 1;
      this.context.gosubStack.push(returnStatementIndex);
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`GOSUB: jumping to line ${targetLineNumber} (statement index ${targetStatementIndex}), return address: ${returnStatementIndex}`);
      }
      this.context.jumpToStatement(targetStatementIndex);
    }
  };

  // src/core/execution/executors/GotoExecutor.ts
  var GotoExecutor = class {
    constructor(context) {
      this.context = context;
    }
    /**
     * Execute a GOTO statement from CST
     * Jumps to the specified line number
     */
    execute(gotoStmtCst, lineNumber) {
      const lineNumberToken = getFirstToken(gotoStmtCst.children.NumberLiteral);
      if (!lineNumberToken) {
        this.context.addError({
          line: lineNumber,
          message: "GOTO: missing line number",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const targetLineNumber = parseInt(lineNumberToken.image, 10);
      if (isNaN(targetLineNumber)) {
        this.context.addError({
          line: lineNumber,
          message: `GOTO: invalid line number: ${lineNumberToken.image}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const targetStatementIndex = this.context.findStatementIndexByLine(targetLineNumber);
      if (targetStatementIndex === -1) {
        this.context.addError({
          line: lineNumber,
          message: `GOTO: line number ${targetLineNumber} not found`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`GOTO: jumping to line ${targetLineNumber} (statement index ${targetStatementIndex})`);
      }
      this.context.jumpToStatement(targetStatementIndex);
    }
  };

  // src/core/execution/executors/IfThenExecutor.ts
  var IfThenExecutor = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Evaluate the condition of an IF-THEN statement
     * Returns true if condition is true (non-zero), false otherwise
     */
    evaluateCondition(ifThenStmtCst, lineNumber) {
      const logicalExprCst = getFirstCstNode(ifThenStmtCst.children.logicalExpression);
      if (!logicalExprCst) {
        this.context.addError({
          line: lineNumber,
          message: "Invalid IF-THEN statement: missing condition",
          type: ERROR_TYPES.RUNTIME
        });
        return false;
      }
      let conditionResult;
      try {
        conditionResult = this.evaluator.evaluateLogicalExpression(logicalExprCst);
      } catch (error) {
        this.context.addError({
          line: lineNumber,
          message: `Error evaluating IF condition: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
        return false;
      }
      const conditionIsTrue = conditionResult !== 0;
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`IF-THEN: condition = ${conditionResult} (${conditionIsTrue ? "true" : "false"})`);
      }
      return conditionIsTrue;
    }
    /**
     * Get the THEN clause commandList CST node from an IF-THEN statement
     * Returns undefined if THEN clause is a line number (not statements)
     */
    getThenClause(ifThenStmtCst) {
      return getFirstCstNode(ifThenStmtCst.children.commandList);
    }
    /**
     * Check if IF-THEN has a line number (either THEN number or GOTO number)
     * Returns the line number if present, undefined otherwise
     * 
     * Parser structure:
     * - IF ... THEN NumberLiteral -> children.NumberLiteral exists
     * - IF ... THEN CommandList -> children.commandList exists
     * - IF ... GOTO NumberLiteral -> children.Goto token exists, children.NumberLiteral exists
     */
    getLineNumber(ifThenStmtCst) {
      const lineNumberToken = getFirstToken(ifThenStmtCst.children.NumberLiteral);
      if (lineNumberToken) {
        const lineNumber = parseInt(lineNumberToken.image, 10);
        return isNaN(lineNumber) ? void 0 : lineNumber;
      }
      return void 0;
    }
    /**
     * Check if IF-THEN uses line number jump (either THEN number or GOTO number)
     * Returns true if a line number jump should be performed
     */
    hasLineNumberJump(ifThenStmtCst) {
      const hasNumberLiteral = !!getFirstToken(ifThenStmtCst.children.NumberLiteral);
      const hasCommandList = !!getFirstCstNode(ifThenStmtCst.children.commandList);
      return hasNumberLiteral && !hasCommandList;
    }
  };

  // src/core/execution/executors/LetExecutor.ts
  var LetExecutor = class {
    constructor(variableService) {
      this.variableService = variableService;
    }
    /**
     * Execute a LET statement from CST
     * Supports: LET X = 5, LET A(0) = 10, LET A$(I, J) = "Hello"
     */
    execute(letStmtCst) {
      const arrayAccessCst = getFirstCstNode(letStmtCst.children.arrayAccess);
      if (arrayAccessCst) {
        const identifierToken = getFirstToken(arrayAccessCst.children.Identifier);
        const expressionListCst = getFirstCstNode(arrayAccessCst.children.expressionList);
        if (!identifierToken || !expressionListCst) {
          this.variableService.context.addError({
            line: 0,
            message: "Invalid LET statement: invalid array access",
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        const expressionCst = getFirstCstNode(letStmtCst.children.expression);
        if (!expressionCst) {
          this.variableService.context.addError({
            line: 0,
            message: "Invalid LET statement: missing expression",
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        const arrayName = identifierToken.image.toUpperCase();
        const indexExpressions = getCstNodes(expressionListCst.children.expression);
        const indices = [];
        for (const exprCst of indexExpressions) {
          const indexValue = this.variableService.evaluator.evaluateExpression(exprCst);
          if (typeof indexValue !== "number") {
            this.variableService.context.addError({
              line: 0,
              message: `Invalid array index: expected number, got ${typeof indexValue}`,
              type: ERROR_TYPES.RUNTIME
            });
            return;
          }
          indices.push(Math.floor(indexValue));
        }
        const value = this.variableService.evaluator.evaluateExpression(expressionCst);
        const basicValue = typeof value === "string" ? value : Math.floor(value);
        this.variableService.setArrayElement(arrayName, indices, basicValue);
        if (this.variableService.context.config.enableDebugMode) {
          this.variableService.context.addDebugOutput(`LET: ${arrayName}(${indices.join(", ")}) = ${basicValue}`);
        }
      } else {
        const identifierToken = getFirstToken(letStmtCst.children.Identifier);
        const expressionCst = getFirstCstNode(letStmtCst.children.expression);
        if (!identifierToken && !expressionCst) {
          this.variableService.context.addError({
            line: 0,
            message: "Invalid LET statement: missing identifier or expression",
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        if (!identifierToken) {
          this.variableService.context.addError({
            line: 0,
            message: "Invalid LET statement: missing identifier",
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        if (!expressionCst) {
          this.variableService.context.addError({
            line: 0,
            message: "Invalid LET statement: missing expression",
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        const varName = identifierToken.image.toUpperCase();
        const value = this.variableService.evaluator.evaluateExpression(expressionCst);
        const basicValue = typeof value === "boolean" ? value ? 1 : 0 : value;
        this.variableService.setVariable(varName, basicValue);
        if (this.variableService.context.config.enableDebugMode && !this.variableService.context.shouldStop) {
          this.variableService.context.addDebugOutput(`LET: ${varName} = ${value}`);
        }
      }
    }
  };

  // src/core/execution/executors/LocateExecutor.ts
  var LocateExecutor = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Execute a LOCATE statement from CST
     * Sets cursor position to (X, Y)
     * X: Horizontal column (0 to 27)
     * Y: Vertical line (0 to 23)
     */
    execute(locateStmtCst, lineNumber) {
      const expressions = getCstNodes(locateStmtCst.children.expression);
      if (expressions.length < 2) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: "LOCATE: Expected two arguments (X, Y)",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const xExprCst = expressions[0];
      const yExprCst = expressions[1];
      if (!xExprCst || !yExprCst) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: "LOCATE: Invalid arguments",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      let x;
      let y;
      try {
        const xValue = this.evaluator.evaluateExpression(xExprCst);
        const yValue = this.evaluator.evaluateExpression(yExprCst);
        x = typeof xValue === "number" ? Math.floor(xValue) : Math.floor(parseFloat(String(xValue)) || 0);
        y = typeof yValue === "number" ? Math.floor(yValue) : Math.floor(parseFloat(String(yValue)) || 0);
      } catch (error) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `LOCATE: Error evaluating coordinates: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (x < 0 || x > SCREEN_DIMENSIONS.BACKGROUND.MAX_X) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `LOCATE: X coordinate out of range (0-${SCREEN_DIMENSIONS.BACKGROUND.MAX_X}), got ${x}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (y < 0 || y > SCREEN_DIMENSIONS.BACKGROUND.MAX_Y) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `LOCATE: Y coordinate out of range (0-${SCREEN_DIMENSIONS.BACKGROUND.MAX_Y}), got ${y}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (this.context.deviceAdapter) {
        this.context.deviceAdapter.setCursorPosition(x, y);
      }
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`LOCATE: Cursor set to (${x}, ${y})`);
      }
    }
  };

  // src/core/execution/executors/MoveExecutor.ts
  var MoveExecutor = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Execute a MOVE statement from CST
     * MOVE n
     * n: action number (0-7)
     */
    execute(moveStmtCst, lineNumber) {
      try {
        const actionNumberExpr = getCstNodes(moveStmtCst.children.actionNumber)?.[0];
        if (!actionNumberExpr) {
          this.context.addError({
            line: lineNumber ?? 0,
            message: "MOVE: Missing action number",
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        const actionNumber = this.evaluateNumber(actionNumberExpr, "action number", lineNumber);
        if (actionNumber === null) {
          return;
        }
        if (!this.validateRange(actionNumber, 0, 7, "action number", lineNumber)) return;
        if (this.context.animationManager) {
          try {
            this.context.animationManager.startMovement(actionNumber);
          } catch (error) {
            this.context.addError({
              line: lineNumber ?? 0,
              message: `MOVE: ${error instanceof Error ? error.message : String(error)}`,
              type: ERROR_TYPES.RUNTIME
            });
            return;
          }
        }
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`MOVE: Started movement for action ${actionNumber}`);
        }
      } catch (error) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `MOVE: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
      }
    }
    evaluateNumber(expr, paramName, lineNumber) {
      try {
        const value = this.evaluator.evaluateExpression(expr);
        const num = typeof value === "number" ? Math.floor(value) : Math.floor(parseFloat(String(value)) || 0);
        return num;
      } catch (error) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `MOVE: Error evaluating ${paramName}: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
        return null;
      }
    }
    validateRange(num, min2, max2, paramName, lineNumber) {
      if (num < min2 || num > max2) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `MOVE: ${paramName} out of range (${min2}-${max2}), got ${num}`,
          type: ERROR_TYPES.RUNTIME
        });
        return false;
      }
      return true;
    }
  };

  // src/core/execution/executors/NextExecutor.ts
  var NextExecutor = class {
    constructor(context, variableService) {
      this.context = context;
      this.variableService = variableService;
    }
    /**
     * Execute a NEXT statement from CST
     * Increments the loop variable and checks if loop should continue
     * Returns true if loop should continue, false if loop should exit
     * 
     * Note: Family BASIC spec states that NEXT cannot have a variable name
     */
    execute(nextStmtCst, lineNumber) {
      if (this.context.loopStack.length === 0) {
        this.context.addError({
          line: lineNumber,
          message: "NEXT without FOR",
          type: ERROR_TYPES.RUNTIME
        });
        return false;
      }
      const loopState = this.context.loopStack[this.context.loopStack.length - 1];
      loopState.currentValue += loopState.stepValue;
      this.variableService.setVariable(loopState.variableName, loopState.currentValue);
      const shouldContinue = this.shouldContinueLoop(
        loopState.currentValue,
        loopState.endValue,
        loopState.stepValue
      );
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(
          `NEXT: ${loopState.variableName} = ${loopState.currentValue} (shouldContinue: ${shouldContinue})`
        );
      }
      if (shouldContinue) {
        this.context.jumpToStatement(loopState.statementIndex);
      } else {
        this.context.loopStack.pop();
      }
      return shouldContinue;
    }
    /**
     * Determine if loop should continue based on current value, end value, and step
     */
    shouldContinueLoop(current, end, step) {
      if (step > 0) {
        return current <= end;
      } else if (step < 0) {
        return current >= end;
      } else {
        return false;
      }
    }
  };

  // src/core/execution/executors/OnExecutor.ts
  var OnExecutor = class {
    constructor(context, evaluator, dataService) {
      this.context = context;
      this.evaluator = evaluator;
      this.dataService = dataService;
    }
    /**
     * Execute an ON statement from CST
     * ON expression {GOTO | GOSUB} line number(, line number, ...)
     * 
     * If expression value is 1, jumps to first line number
     * If expression value is 2, jumps to second line number
     * If expression value is 0 or exceeds the number of line numbers, proceeds to next line
     */
    execute(onStmtCst, lineNumber) {
      const expressionCst = getFirstCstNode(onStmtCst.children.expression);
      if (!expressionCst) {
        this.context.addError({
          line: lineNumber,
          message: "ON: missing expression",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      let expressionValue;
      try {
        expressionValue = this.evaluator.evaluateExpression(expressionCst);
      } catch (error) {
        this.context.addError({
          line: lineNumber,
          message: `ON: failed to evaluate expression: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const numericValue = typeof expressionValue === "string" ? parseFloat(expressionValue) : Number(expressionValue);
      const index = Math.floor(numericValue);
      if (index < 1) {
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`ON: expression value ${index} is less than 1, proceeding to next line`);
        }
        return;
      }
      const lineNumberListCst = getFirstCstNode(onStmtCst.children.lineNumberList);
      if (!lineNumberListCst) {
        this.context.addError({
          line: lineNumber,
          message: "ON: missing line number list",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const lineNumberTokens = getTokens(lineNumberListCst.children.NumberLiteral);
      if (!lineNumberTokens || lineNumberTokens.length === 0) {
        this.context.addError({
          line: lineNumber,
          message: "ON: no line numbers specified",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (index > lineNumberTokens.length) {
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`ON: expression value ${index} exceeds number of line numbers (${lineNumberTokens.length}), proceeding to next line`);
        }
        return;
      }
      const targetLineNumberToken = lineNumberTokens[index - 1];
      if (!targetLineNumberToken) {
        this.context.addError({
          line: lineNumber,
          message: `ON: invalid line number at index ${index}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const targetLineNumber = parseInt(targetLineNumberToken.image, 10);
      if (isNaN(targetLineNumber)) {
        this.context.addError({
          line: lineNumber,
          message: `ON: invalid line number: ${targetLineNumberToken.image}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const targetStatementIndex = this.context.findStatementIndexByLine(targetLineNumber);
      if (targetStatementIndex === -1) {
        this.context.addError({
          line: lineNumber,
          message: `ON: line number ${targetLineNumber} not found`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const gotoToken = getFirstToken(onStmtCst.children.Goto);
      const gosubToken = getFirstToken(onStmtCst.children.Gosub);
      const returnToken = getFirstToken(onStmtCst.children.Return);
      const restoreToken = getFirstToken(onStmtCst.children.Restore);
      if (gosubToken) {
        const returnStatementIndex = this.context.currentStatementIndex + 1;
        this.context.gosubStack.push(returnStatementIndex);
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`ON-GOSUB: jumping to line ${targetLineNumber} (statement index ${targetStatementIndex}), return address: ${returnStatementIndex}`);
        }
        this.context.jumpToStatement(targetStatementIndex);
      } else if (gotoToken) {
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`ON-GOTO: jumping to line ${targetLineNumber} (statement index ${targetStatementIndex})`);
        }
        this.context.jumpToStatement(targetStatementIndex);
      } else if (returnToken) {
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`ON-RETURN: returning to line ${targetLineNumber} (statement index ${targetStatementIndex})`);
        }
        this.context.jumpToStatement(targetStatementIndex);
      } else if (restoreToken) {
        if (!this.dataService) {
          this.context.addError({
            line: lineNumber,
            message: "ON-RESTORE: DataService not available",
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`ON-RESTORE: restoring data pointer to line ${targetLineNumber}`);
        }
        this.dataService.restoreData(targetLineNumber);
      } else {
        this.context.addError({
          line: lineNumber,
          message: "ON: missing GOTO, GOSUB, RETURN, or RESTORE keyword",
          type: ERROR_TYPES.RUNTIME
        });
      }
    }
  };

  // src/core/execution/executors/PaletExecutor.ts
  var PaletExecutor = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Execute a PALET statement from CST
     * Sets color codes for color combination n (0-3)
     * Syntax: PALET {B|S} n, C1, C2, C3, C4
     * or: PALETB n, C1, C2, C3, C4 (background, no space)
     * or: PALETS n, C1, C2, C3, C4 (sprites, no space)
     * 
     * When target is B and n=0, C1 is the backdrop color.
     * C1, C2, C3, C4 are color codes (0-60).
     */
    execute(paletStmtCst, lineNumber) {
      let target = "B";
      const paletbToken = paletStmtCst.children.Paletb?.[0];
      const paletsToken = paletStmtCst.children.Palets?.[0];
      const paletToken = paletStmtCst.children.Palet?.[0];
      if (paletbToken) {
        target = "B";
      } else if (paletsToken) {
        target = "S";
      } else if (paletToken) {
        const targetToken = getFirstToken(paletStmtCst.children.target);
        if (targetToken) {
          const targetStr = targetToken.image.toUpperCase();
          if (targetStr === "B") {
            target = "B";
          } else if (targetStr === "S") {
            target = "S";
          } else {
            this.context.addError({
              line: lineNumber ?? 0,
              message: `PALET: Invalid target, expected B or S, got ${targetStr}`,
              type: ERROR_TYPES.RUNTIME
            });
            return;
          }
        } else {
          this.context.addError({
            line: lineNumber ?? 0,
            message: "PALET: Missing target (B or S)",
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
      } else {
        this.context.addError({
          line: lineNumber ?? 0,
          message: "PALET: Invalid statement format",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const paletParameterListCst = getFirstCstNode(paletStmtCst.children.paletParameterList);
      if (!paletParameterListCst) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: "PALET: Missing parameter list",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const expressions = getCstNodes(paletParameterListCst.children.expression);
      if (expressions.length < 5) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: "PALET: Expected 5 arguments (n, C1, C2, C3, C4)",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const nExprCst = expressions[0];
      const c1ExprCst = expressions[1];
      const c2ExprCst = expressions[2];
      const c3ExprCst = expressions[3];
      const c4ExprCst = expressions[4];
      if (!nExprCst || !c1ExprCst || !c2ExprCst || !c3ExprCst || !c4ExprCst) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: "PALET: Invalid arguments",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      let n;
      let c1;
      let c2;
      let c3;
      let c4;
      try {
        const nValue = this.evaluator.evaluateExpression(nExprCst);
        const c1Value = this.evaluator.evaluateExpression(c1ExprCst);
        const c2Value = this.evaluator.evaluateExpression(c2ExprCst);
        const c3Value = this.evaluator.evaluateExpression(c3ExprCst);
        const c4Value = this.evaluator.evaluateExpression(c4ExprCst);
        n = typeof nValue === "number" ? Math.floor(nValue) : Math.floor(parseFloat(String(nValue)) || 0);
        c1 = typeof c1Value === "number" ? Math.floor(c1Value) : Math.floor(parseFloat(String(c1Value)) || 0);
        c2 = typeof c2Value === "number" ? Math.floor(c2Value) : Math.floor(parseFloat(String(c2Value)) || 0);
        c3 = typeof c3Value === "number" ? Math.floor(c3Value) : Math.floor(parseFloat(String(c3Value)) || 0);
        c4 = typeof c4Value === "number" ? Math.floor(c4Value) : Math.floor(parseFloat(String(c4Value)) || 0);
      } catch (error) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `PALET: Error evaluating arguments: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (n < COLOR_PATTERNS.MIN || n > COLOR_PATTERNS.MAX) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `PALET: Color combination number out of range (${COLOR_PATTERNS.MIN}-${COLOR_PATTERNS.MAX}), got ${n}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (c1 < COLOR_CODES.MIN || c1 > COLOR_CODES.MAX || c2 < COLOR_CODES.MIN || c2 > COLOR_CODES.MAX || c3 < COLOR_CODES.MIN || c3 > COLOR_CODES.MAX || c4 < COLOR_CODES.MIN || c4 > COLOR_CODES.MAX) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `PALET: Color code out of range (${COLOR_CODES.MIN}-${COLOR_CODES.MAX}), got C1=${c1}, C2=${c2}, C3=${c3}, C4=${c4}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (target === "B" && n === 0) {
        if (this.context.deviceAdapter) {
          this.context.deviceAdapter.setBackdropColor(c1);
        }
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`PALET B: Set backdrop color to ${c1} (color combination 0)`);
        }
      } else {
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(
            `PALET ${target}: Set color combination ${n} to C1=${c1}, C2=${c2}, C3=${c3}, C4=${c4} (not yet fully implemented)`
          );
        }
      }
    }
  };

  // src/core/execution/executors/PauseExecutor.ts
  var PauseExecutor = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Execute a PAUSE statement from CST
     * Pauses execution for the specified number of frames
     * In Family BASIC, PAUSE uses frames (1 frame = ~1/30 second = ~33.33ms)
     */
    async execute(pauseStmtCst) {
      const expressionCst = getFirstCstNode(pauseStmtCst.children.expression);
      if (!expressionCst) {
        this.context.addError({
          line: 0,
          message: "Invalid PAUSE statement: missing expression",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const durationValue = this.evaluator.evaluateExpression(expressionCst);
      const frames = typeof durationValue === "number" ? Math.max(0, Math.floor(durationValue)) : Math.max(0, Math.floor(parseFloat(String(durationValue)) || 0));
      const durationMs = frames * TIMING.FRAME_DURATION_MS;
      if (durationMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, durationMs));
      }
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`PAUSE: ${frames} frames (${Math.round(durationMs)}ms)`);
      }
    }
  };

  // src/core/execution/executors/PrintExecutor.ts
  var PrintExecutor = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Execute a PRINT statement from CST
     */
    execute(printStmtCst) {
      const printListCst = getFirstCstNode(printStmtCst.children.printList);
      if (!printListCst) {
        this.printOutput("\n");
        return;
      }
      const printItems = getCstNodes(printListCst.children.printItem);
      const commaTokens = getTokens(printListCst.children.Comma);
      const semicolonTokens = getTokens(printListCst.children.Semicolon);
      const elements = [];
      printItems.forEach((item, index) => {
        const strToken = getFirstToken(item.children.StringLiteral);
        const exprCst = getFirstCstNode(item.children.expression);
        let startOffset = 0;
        if (strToken) {
          startOffset = strToken.startOffset;
        } else if (exprCst) {
          const firstToken = this.getFirstTokenFromNode(exprCst);
          if (firstToken) {
            startOffset = firstToken.startOffset;
          }
        }
        elements.push({
          type: "item",
          itemIndex: index,
          startOffset
        });
      });
      commaTokens.forEach((token) => {
        elements.push({
          type: "separator",
          separator: ",",
          startOffset: token.startOffset
        });
      });
      semicolonTokens.forEach((token) => {
        elements.push({
          type: "separator",
          separator: ";",
          startOffset: token.startOffset
        });
      });
      elements.sort((a, b) => a.startOffset - b.startOffset);
      const items = [];
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        if (!element) continue;
        if (element.type === "item" && element.itemIndex !== void 0) {
          const item = printItems[element.itemIndex];
          if (!item) continue;
          let value;
          const strToken = getFirstToken(item.children.StringLiteral);
          if (strToken) {
            value = strToken.image.slice(1, -1);
          } else {
            const exprCst = getFirstCstNode(item.children.expression);
            if (exprCst) {
              value = this.evaluator.evaluateExpression(exprCst);
            }
          }
          if (value !== void 0) {
            let separator = null;
            const nextElement = elements[i + 1];
            if (nextElement && nextElement.type === "separator") {
              separator = nextElement.separator ?? null;
            }
            items.push({ value, separator });
          }
        }
      }
      let output = this.buildOutputString(items);
      const lastElement = elements[elements.length - 1];
      const endsWithSemicolon = lastElement?.type === "separator" && lastElement.separator === ";";
      const endsWithComma = lastElement?.type === "separator" && lastElement.separator === ",";
      const endsWithSeparator = endsWithSemicolon || endsWithComma;
      if (!endsWithSeparator && output.length > 0) {
        output += "\n";
      }
      this.printOutput(output);
    }
    /**
     * Build output string from PRINT items, handling all PRINT semantics.
     * 
     * This method separates two concerns:
     * 1. Building the string representation of each item (via toString method)
     * 2. Processing separators between items
     */
    buildOutputString(items) {
      if (items.length === 0) {
        return "";
      }
      let output = "";
      let currentColumn = 0;
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item?.value === void 0) continue;
        const itemString = this.toString(item.value);
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`PRINT: value = ${item.value}, separator = ${item.separator}`);
        }
        if (i === 0) {
          output += itemString;
          currentColumn += itemString.length;
        } else {
          const prevSeparator = items[i - 1]?.separator;
          if (prevSeparator === ",") {
            output += "	";
            const nextTabStop = this.getNextTabStop(currentColumn);
            currentColumn = nextTabStop;
            output += itemString;
            currentColumn += itemString.length;
          } else if (prevSeparator === ";") {
            output += itemString;
            currentColumn += itemString.length;
          } else {
            this.context.addError({
              line: this.context.getCurrentLineNumber(),
              message: `PRINT: Invalid separator: ${prevSeparator}`,
              type: ERROR_TYPES.RUNTIME
            });
            return "";
          }
        }
      }
      return output;
    }
    /**
     * Get the next tab stop (8-character block boundary)
     * Uses PRINT_TAB_STOPS constants for block boundaries
     */
    getNextTabStop(currentColumn) {
      if (currentColumn < PRINT_TAB_STOPS.BLOCK_1_END) return PRINT_TAB_STOPS.BLOCK_1_END;
      if (currentColumn < PRINT_TAB_STOPS.BLOCK_2_END) return PRINT_TAB_STOPS.BLOCK_2_END;
      if (currentColumn < PRINT_TAB_STOPS.BLOCK_3_END) return PRINT_TAB_STOPS.BLOCK_3_END;
      return PRINT_TAB_STOPS.BLOCK_4_END;
    }
    /**
     * Convert a printable value to its string representation.
     * This acts as the "toString" method for printable items.
     * 
     * For numbers: always outputs a sign char (space for 0 and positive, dash for negative)
     * followed by the absolute value of the number.
     * For strings: outputs the string itself.
     */
    toString(value) {
      if (typeof value === "string") {
        return value;
      } else if (typeof value === "boolean") {
        return this.toString(value ? 1 : 0);
      } else if (typeof value === "number") {
        const sign2 = value >= 0 ? " " : "-";
        const absValue = Math.abs(value);
        const absValueStr = Number.isInteger(absValue) ? absValue.toString() : absValue.toString();
        return sign2 + absValueStr;
      }
      this.context.addError({
        line: this.context.getCurrentLineNumber(),
        message: `PRINT: Invalid value type: ${typeof value} for value: ${value}`,
        type: ERROR_TYPES.RUNTIME
      });
      return " 0";
    }
    /**
     * Recursively get the first token from a CST node
     */
    getFirstTokenFromNode(node) {
      const children = Object.values(node.children).flat();
      for (const child of children) {
        if (isCstToken(child)) {
          return child;
        }
        if (isCstNode(child)) {
          const token = this.getFirstTokenFromNode(child);
          if (token) return token;
        }
      }
      return void 0;
    }
    /**
     * Output text, handling appending to previous output for test device adapter
     */
    printOutput(text, shouldAppend = false) {
      if (shouldAppend && this.context.deviceAdapter && "printOutputs" in this.context.deviceAdapter) {
        const adapter = this.context.deviceAdapter;
        if (adapter.printOutputs && adapter.printOutputs.length > 0) {
          adapter.printOutputs[adapter.printOutputs.length - 1] += text;
          return;
        }
      }
      this.context.addOutput(text);
    }
  };

  // src/core/execution/executors/ReadExecutor.ts
  var ReadExecutor = class {
    constructor(dataService, variableService, evaluator) {
      this.dataService = dataService;
      this.variableService = variableService;
      this.evaluator = evaluator;
    }
    /**
     * Execute READ statement
     * READ (Identifier | ArrayAccess) (Comma (Identifier | ArrayAccess))*
     */
    execute(cst, _lineNumber) {
      const identifierTokens = getTokens(cst.children.Identifier);
      for (const identifierToken of identifierTokens) {
        const variableName = identifierToken.image;
        const dataValue = this.dataService.readNextDataValue();
        this.variableService.setVariable(variableName, dataValue);
      }
      const arrayAccessNodes = getCstNodes(cst.children.arrayAccess);
      for (const arrayAccessCst of arrayAccessNodes) {
        const identifierToken = getFirstToken(arrayAccessCst.children.Identifier);
        if (!identifierToken) {
          continue;
        }
        const arrayName = identifierToken.image.toUpperCase();
        const expressionListCst = getFirstCstNode(arrayAccessCst.children.expressionList);
        if (!expressionListCst) {
          continue;
        }
        const expressions = getCstNodes(expressionListCst.children.expression);
        const indices = [];
        for (const exprCst of expressions) {
          const indexValue = this.evaluator.evaluateExpression(exprCst);
          if (typeof indexValue !== "number") {
            continue;
          }
          indices.push(Math.floor(indexValue));
        }
        const dataValue = this.dataService.readNextDataValue();
        this.variableService.setArrayElement(arrayName, indices, dataValue);
      }
    }
  };

  // src/core/execution/executors/RestoreExecutor.ts
  var RestoreExecutor = class {
    constructor(dataService) {
      this.dataService = dataService;
    }
    /**
     * Execute RESTORE statement
     * RESTORE (NumberLiteral)?
     */
    execute(cst) {
      const numberLiteralToken = getFirstToken(cst.children.NumberLiteral);
      if (numberLiteralToken) {
        const lineNumber = parseInt(numberLiteralToken.image, 10);
        this.dataService.restoreData(lineNumber);
      } else {
        this.dataService.restoreData();
      }
    }
  };

  // src/core/execution/executors/ReturnExecutor.ts
  var ReturnExecutor = class {
    constructor(context) {
      this.context = context;
    }
    /**
     * Execute a RETURN statement from CST
     * Returns from subroutine by jumping to the return address on stack
     * If line number is specified, returns to that line instead
     */
    execute(returnStmtCst, lineNumber) {
      const lineNumberToken = getFirstToken(returnStmtCst.children.NumberLiteral);
      if (lineNumberToken) {
        const targetLineNumber = parseInt(lineNumberToken.image, 10);
        if (isNaN(targetLineNumber)) {
          this.context.addError({
            line: lineNumber,
            message: `RETURN: invalid line number: ${lineNumberToken.image}`,
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        const targetStatementIndex = this.context.findStatementIndexByLine(targetLineNumber);
        if (targetStatementIndex === -1) {
          this.context.addError({
            line: lineNumber,
            message: `RETURN: line number ${targetLineNumber} not found`,
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`RETURN: returning to line ${targetLineNumber} (statement index ${targetStatementIndex})`);
        }
        this.context.jumpToStatement(targetStatementIndex);
        return;
      }
      if (this.context.gosubStack.length === 0) {
        this.context.addError({
          line: lineNumber,
          message: "RETURN: no GOSUB to return from",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      const returnStatementIndex = this.context.gosubStack.pop();
      if (returnStatementIndex < 0 || returnStatementIndex >= this.context.statements.length) {
        this.context.addError({
          line: lineNumber,
          message: `RETURN: invalid return address: ${returnStatementIndex}`,
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`RETURN: returning to statement index ${returnStatementIndex}`);
      }
      this.context.jumpToStatement(returnStatementIndex);
    }
  };

  // src/core/execution/executors/SpriteExecutor.ts
  var SPRITE_SCREEN = {
    MAX_X: 255,
    MAX_Y: 239
  };
  var SpriteExecutor = class {
    constructor(context, evaluator) {
      this.context = context;
      this.evaluator = evaluator;
    }
    /**
     * Execute a SPRITE statement from CST
     * SPRITE n, X, Y
     * n: sprite number (0-7)
     * X: pixel X coordinate (0-255)
     * Y: pixel Y coordinate (0-239)
     */
    execute(spriteStmtCst, lineNumber) {
      try {
        const spriteNumberExpr = getCstNodes(spriteStmtCst.children.spriteNumber)?.[0];
        const xExpr = getCstNodes(spriteStmtCst.children.x)?.[0];
        const yExpr = getCstNodes(spriteStmtCst.children.y)?.[0];
        if (!spriteNumberExpr || !xExpr || !yExpr) {
          this.context.addError({
            line: lineNumber ?? 0,
            message: "SPRITE: Missing required parameters (n, X, Y)",
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        const spriteNumber = this.evaluateNumber(spriteNumberExpr, "sprite number", lineNumber);
        const x = this.evaluateNumber(xExpr, "X coordinate", lineNumber);
        const y = this.evaluateNumber(yExpr, "Y coordinate", lineNumber);
        if (spriteNumber === null || x === null || y === null) {
          return;
        }
        if (!this.validateSpriteNumber(spriteNumber, lineNumber)) return;
        if (!this.validateCoordinate(x, SPRITE_SCREEN.MAX_X, "X", lineNumber)) return;
        if (!this.validateCoordinate(y, SPRITE_SCREEN.MAX_Y, "Y", lineNumber)) return;
        if (this.context.spriteStateManager) {
          try {
            this.context.spriteStateManager.displaySprite(spriteNumber, x, y);
          } catch (error) {
            this.context.addError({
              line: lineNumber ?? 0,
              message: `SPRITE: ${error instanceof Error ? error.message : String(error)}`,
              type: ERROR_TYPES.RUNTIME
            });
            return;
          }
        }
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`SPRITE: Displayed sprite ${spriteNumber} at (${x}, ${y})`);
        }
      } catch (error) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `SPRITE: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
      }
    }
    evaluateNumber(expr, paramName, lineNumber) {
      try {
        const value = this.evaluator.evaluateExpression(expr);
        const num = typeof value === "number" ? Math.floor(value) : Math.floor(parseFloat(String(value)) || 0);
        return num;
      } catch (error) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `SPRITE: Error evaluating ${paramName}: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
        return null;
      }
    }
    validateSpriteNumber(num, lineNumber) {
      if (num < 0 || num > 7) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `SPRITE: Sprite number out of range (0-7), got ${num}`,
          type: ERROR_TYPES.RUNTIME
        });
        return false;
      }
      return true;
    }
    validateCoordinate(coord, max2, axis, lineNumber) {
      if (coord < 0 || coord > max2) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `SPRITE: ${axis} coordinate out of range (0-${max2}), got ${coord}`,
          type: ERROR_TYPES.RUNTIME
        });
        return false;
      }
      return true;
    }
  };

  // src/core/execution/executors/SpriteOnOffExecutor.ts
  var SpriteOnOffExecutor = class {
    constructor(context) {
      this.context = context;
    }
    /**
     * Execute a SPRITE ON/OFF statement from CST
     * SPRITE ON - Enable sprite display
     * SPRITE OFF - Disable sprite display
     */
    execute(spriteOnOffStmtCst, lineNumber) {
      try {
        const onOffToken = getFirstToken(spriteOnOffStmtCst.children.onOff);
        if (!onOffToken) {
          this.context.addError({
            line: lineNumber ?? 0,
            message: "SPRITE: Expected ON or OFF",
            type: ERROR_TYPES.RUNTIME
          });
          return;
        }
        const isOn = onOffToken.image.toUpperCase() === "ON";
        if (this.context.spriteStateManager) {
          this.context.spriteStateManager.setSpriteEnabled(isOn);
        }
        if (this.context.config.enableDebugMode) {
          this.context.addDebugOutput(`SPRITE: Display ${isOn ? "enabled" : "disabled"}`);
        }
      } catch (error) {
        this.context.addError({
          line: lineNumber ?? 0,
          message: `SPRITE ON/OFF: ${error instanceof Error ? error.message : String(error)}`,
          type: ERROR_TYPES.RUNTIME
        });
      }
    }
  };

  // src/core/execution/StatementRouter.ts
  var StatementRouter = class {
    constructor(context, evaluator, variableService, dataService) {
      this.context = context;
      this.evaluator = evaluator;
      this.variableService = variableService;
      this.dataService = dataService;
      __publicField(this, "printExecutor");
      __publicField(this, "letExecutor");
      __publicField(this, "forExecutor");
      __publicField(this, "nextExecutor");
      __publicField(this, "endExecutor");
      __publicField(this, "pauseExecutor");
      __publicField(this, "ifThenExecutor");
      __publicField(this, "gotoExecutor");
      __publicField(this, "gosubExecutor");
      __publicField(this, "returnExecutor");
      __publicField(this, "onExecutor");
      __publicField(this, "dimExecutor");
      __publicField(this, "dataExecutor");
      __publicField(this, "readExecutor");
      __publicField(this, "restoreExecutor");
      __publicField(this, "clsExecutor");
      __publicField(this, "locateExecutor");
      __publicField(this, "colorExecutor");
      __publicField(this, "cgsetExecutor");
      __publicField(this, "cgenExecutor");
      __publicField(this, "paletExecutor");
      __publicField(this, "defSpriteExecutor");
      __publicField(this, "spriteExecutor");
      __publicField(this, "spriteOnOffExecutor");
      __publicField(this, "defMoveExecutor");
      __publicField(this, "moveExecutor");
      this.printExecutor = new PrintExecutor(context, evaluator);
      this.letExecutor = new LetExecutor(variableService);
      this.forExecutor = new ForExecutor(context, evaluator, variableService);
      this.nextExecutor = new NextExecutor(context, variableService);
      this.endExecutor = new EndExecutor(context);
      this.pauseExecutor = new PauseExecutor(context, evaluator);
      this.ifThenExecutor = new IfThenExecutor(context, evaluator);
      this.gotoExecutor = new GotoExecutor(context);
      this.gosubExecutor = new GosubExecutor(context);
      this.returnExecutor = new ReturnExecutor(context);
      this.onExecutor = new OnExecutor(context, evaluator, dataService);
      this.dimExecutor = new DimExecutor(context, evaluator, variableService);
      this.dataExecutor = new DataExecutor(dataService);
      this.readExecutor = new ReadExecutor(dataService, variableService, evaluator);
      this.restoreExecutor = new RestoreExecutor(dataService);
      this.clsExecutor = new ClsExecutor(context);
      this.locateExecutor = new LocateExecutor(context, evaluator);
      this.colorExecutor = new ColorExecutor(context, evaluator);
      this.cgsetExecutor = new CgsetExecutor(context, evaluator);
      this.cgenExecutor = new CgenExecutor(context, evaluator);
      this.paletExecutor = new PaletExecutor(context, evaluator);
      this.defSpriteExecutor = new DefSpriteExecutor(context, evaluator);
      this.spriteExecutor = new SpriteExecutor(context, evaluator);
      this.spriteOnOffExecutor = new SpriteOnOffExecutor(context);
      this.defMoveExecutor = new DefMoveExecutor(context, evaluator);
      this.moveExecutor = new MoveExecutor(context, evaluator);
    }
    /**
     * Route an expanded statement to its appropriate executor
     * Each expanded statement contains a single command (colon-separated commands are already expanded)
     */
    async executeStatement(expandedStatement) {
      const commandCst = expandedStatement.command;
      const singleCommandCst = getFirstCstNode(commandCst.children.singleCommand);
      if (!singleCommandCst) {
        this.context.addError({
          line: expandedStatement.lineNumber,
          message: "Invalid command: missing single command",
          type: ERROR_TYPES.RUNTIME
        });
        return;
      }
      if (singleCommandCst.children.ifThenStatement) {
        const ifThenStmtCst = getFirstCstNode(singleCommandCst.children.ifThenStatement);
        if (ifThenStmtCst) {
          const conditionIsTrue = this.ifThenExecutor.evaluateCondition(ifThenStmtCst, expandedStatement.lineNumber);
          if (conditionIsTrue) {
            if (this.ifThenExecutor.hasLineNumberJump(ifThenStmtCst)) {
              const targetLineNumber = this.ifThenExecutor.getLineNumber(ifThenStmtCst);
              if (targetLineNumber !== void 0) {
                const targetStatementIndex = this.context.findStatementIndexByLine(targetLineNumber);
                if (targetStatementIndex === -1) {
                  this.context.addError({
                    line: expandedStatement.lineNumber,
                    message: `IF-THEN: line number ${targetLineNumber} not found`,
                    type: ERROR_TYPES.RUNTIME
                  });
                } else {
                  if (this.context.config.enableDebugMode) {
                    this.context.addDebugOutput(`IF-THEN: jumping to line ${targetLineNumber} (statement index ${targetStatementIndex})`);
                  }
                  this.context.jumpToStatement(targetStatementIndex);
                  return;
                }
              }
            }
            const thenCommandListCst = this.ifThenExecutor.getThenClause(ifThenStmtCst);
            if (thenCommandListCst) {
              const thenCommands = getCstNodes(thenCommandListCst.children.command);
              let thenCommandIndex = 0;
              while (thenCommandIndex < thenCommands.length) {
                const commandCst2 = thenCommands[thenCommandIndex];
                if (!commandCst2) break;
                const thenStatement = {
                  statementIndex: expandedStatement.statementIndex,
                  // Keep same statement index
                  lineNumber: expandedStatement.lineNumber,
                  command: commandCst2
                };
                await this.executeStatement(thenStatement);
                const singleCommandCst2 = getFirstCstNode(commandCst2.children.singleCommand);
                if (singleCommandCst2?.children.nextStatement) {
                  const nextStmtCst = getFirstCstNode(singleCommandCst2.children.nextStatement);
                  if (nextStmtCst) {
                    const activeLoop = this.context.loopStack.find(
                      (loop) => loop.statementIndex === expandedStatement.statementIndex
                    );
                    if (activeLoop) {
                      const varName = activeLoop.variableName;
                      for (let i = 0; i < thenCommands.length; i++) {
                        const cmd = thenCommands[i];
                        const singleCmd = getFirstCstNode(cmd?.children.singleCommand);
                        const forStmt = getFirstCstNode(singleCmd?.children.forStatement);
                        if (forStmt) {
                          const forVarToken = getFirstToken(forStmt.children.Identifier);
                          if (forVarToken && forVarToken.image.toUpperCase() === varName) {
                            thenCommandIndex = i;
                            break;
                          }
                        }
                      }
                      continue;
                    }
                  }
                }
                thenCommandIndex++;
              }
            }
          }
        }
      } else if (singleCommandCst.children.onStatement) {
        const onStmtCst = getFirstCstNode(singleCommandCst.children.onStatement);
        if (onStmtCst) {
          this.onExecutor.execute(onStmtCst, expandedStatement.lineNumber);
          return;
        }
      } else if (singleCommandCst.children.gotoStatement) {
        const gotoStmtCst = getFirstCstNode(singleCommandCst.children.gotoStatement);
        if (gotoStmtCst) {
          this.gotoExecutor.execute(gotoStmtCst, expandedStatement.lineNumber);
          return;
        }
      } else if (singleCommandCst.children.gosubStatement) {
        const gosubStmtCst = getFirstCstNode(singleCommandCst.children.gosubStatement);
        if (gosubStmtCst) {
          this.gosubExecutor.execute(gosubStmtCst, expandedStatement.lineNumber);
          return;
        }
      } else if (singleCommandCst.children.returnStatement) {
        const returnStmtCst = getFirstCstNode(singleCommandCst.children.returnStatement);
        if (returnStmtCst) {
          this.returnExecutor.execute(returnStmtCst, expandedStatement.lineNumber);
          return;
        }
      } else if (singleCommandCst.children.printStatement) {
        const printStmtCst = getFirstCstNode(singleCommandCst.children.printStatement);
        if (printStmtCst) {
          this.printExecutor.execute(printStmtCst);
        }
      } else if (singleCommandCst.children.letStatement) {
        const letStmtCst = getFirstCstNode(singleCommandCst.children.letStatement);
        if (letStmtCst) {
          this.letExecutor.execute(letStmtCst);
        }
      } else if (singleCommandCst.children.forStatement) {
        const forStmtCst = getFirstCstNode(singleCommandCst.children.forStatement);
        if (forStmtCst) {
          const identifierToken = getFirstToken(forStmtCst.children.Identifier);
          if (identifierToken) {
            const varName = identifierToken.image.toUpperCase();
            const existingLoop = this.context.loopStack.find(
              (loop) => loop.variableName === varName && loop.statementIndex === expandedStatement.statementIndex
            );
            if (existingLoop) {
              return;
            }
          }
          this.forExecutor.execute(forStmtCst, expandedStatement.statementIndex, expandedStatement.lineNumber);
        }
      } else if (singleCommandCst.children.nextStatement) {
        const nextStmtCst = getFirstCstNode(singleCommandCst.children.nextStatement);
        if (nextStmtCst) {
          const shouldContinue = this.nextExecutor.execute(nextStmtCst, expandedStatement.lineNumber);
          if (shouldContinue) {
            return;
          }
        }
      } else if (singleCommandCst.children.endStatement) {
        const endStmtCst = getFirstCstNode(singleCommandCst.children.endStatement);
        if (endStmtCst) {
          this.endExecutor.execute(endStmtCst);
          return;
        }
      } else if (singleCommandCst.children.pauseStatement) {
        const pauseStmtCst = getFirstCstNode(singleCommandCst.children.pauseStatement);
        if (pauseStmtCst) {
          await this.pauseExecutor.execute(pauseStmtCst);
        }
        return;
      } else if (singleCommandCst.children.dimStatement) {
        const dimStmtCst = getFirstCstNode(singleCommandCst.children.dimStatement);
        if (dimStmtCst) {
          this.dimExecutor.execute(dimStmtCst, expandedStatement.lineNumber);
        }
      } else if (singleCommandCst.children.dataStatement) {
        const dataStmtCst = getFirstCstNode(singleCommandCst.children.dataStatement);
        if (dataStmtCst) {
          if (this.context.config.enableDebugMode) {
            this.context.addDebugOutput("DATA: Statement already processed during preprocessing");
          }
        }
      } else if (singleCommandCst.children.readStatement) {
        const readStmtCst = getFirstCstNode(singleCommandCst.children.readStatement);
        if (readStmtCst) {
          this.readExecutor.execute(readStmtCst, expandedStatement.lineNumber);
        }
      } else if (singleCommandCst.children.restoreStatement) {
        const restoreStmtCst = getFirstCstNode(singleCommandCst.children.restoreStatement);
        if (restoreStmtCst) {
          this.restoreExecutor.execute(restoreStmtCst);
        }
      } else if (singleCommandCst.children.clsStatement) {
        const clsStmtCst = getFirstCstNode(singleCommandCst.children.clsStatement);
        if (clsStmtCst) {
          this.clsExecutor.execute(clsStmtCst);
        }
      } else if (singleCommandCst.children.locateStatement) {
        const locateStmtCst = getFirstCstNode(singleCommandCst.children.locateStatement);
        if (locateStmtCst) {
          this.locateExecutor.execute(locateStmtCst, expandedStatement.lineNumber);
        }
      } else if (singleCommandCst.children.colorStatement) {
        const colorStmtCst = getFirstCstNode(singleCommandCst.children.colorStatement);
        if (colorStmtCst) {
          this.colorExecutor.execute(colorStmtCst, expandedStatement.lineNumber);
        }
      } else if (singleCommandCst.children.cgsetStatement) {
        const cgsetStmtCst = getFirstCstNode(singleCommandCst.children.cgsetStatement);
        if (cgsetStmtCst) {
          this.cgsetExecutor.execute(cgsetStmtCst, expandedStatement.lineNumber);
        }
      } else if (singleCommandCst.children.cgenStatement) {
        const cgenStmtCst = getFirstCstNode(singleCommandCst.children.cgenStatement);
        if (cgenStmtCst) {
          this.cgenExecutor.execute(cgenStmtCst, expandedStatement.lineNumber);
        }
      } else if (singleCommandCst.children.paletStatement) {
        const paletStmtCst = getFirstCstNode(singleCommandCst.children.paletStatement);
        if (paletStmtCst) {
          this.paletExecutor.execute(paletStmtCst, expandedStatement.lineNumber);
        }
      } else if (singleCommandCst.children.defSpriteStatement) {
        const defSpriteStmtCst = getFirstCstNode(singleCommandCst.children.defSpriteStatement);
        if (defSpriteStmtCst) {
          this.defSpriteExecutor.execute(defSpriteStmtCst, expandedStatement.lineNumber);
        }
      } else if (singleCommandCst.children.spriteStatement) {
        const spriteStmtCst = getFirstCstNode(singleCommandCst.children.spriteStatement);
        if (spriteStmtCst) {
          this.spriteExecutor.execute(spriteStmtCst, expandedStatement.lineNumber);
        }
      } else if (singleCommandCst.children.spriteOnOffStatement) {
        const spriteOnOffStmtCst = getFirstCstNode(singleCommandCst.children.spriteOnOffStatement);
        if (spriteOnOffStmtCst) {
          this.spriteOnOffExecutor.execute(spriteOnOffStmtCst, expandedStatement.lineNumber);
        }
      } else if (singleCommandCst.children.defMoveStatement) {
        const defMoveStmtCst = getFirstCstNode(singleCommandCst.children.defMoveStatement);
        if (defMoveStmtCst) {
          this.defMoveExecutor.execute(defMoveStmtCst, expandedStatement.lineNumber);
        }
      } else if (singleCommandCst.children.moveStatement) {
        const moveStmtCst = getFirstCstNode(singleCommandCst.children.moveStatement);
        if (moveStmtCst) {
          this.moveExecutor.execute(moveStmtCst, expandedStatement.lineNumber);
        }
      } else {
        this.context.addError({
          line: expandedStatement.lineNumber,
          message: "Unsupported statement type",
          type: ERROR_TYPES.RUNTIME
        });
      }
    }
  };

  // src/core/execution/ExecutionEngine.ts
  var ExecutionEngine = class {
    constructor(context, _deviceAdapter) {
      __publicField(this, "context");
      __publicField(this, "evaluator");
      __publicField(this, "variableService");
      __publicField(this, "dataService");
      __publicField(this, "statementRouter");
      this.context = context;
      this.evaluator = new ExpressionEvaluator(this.context);
      this.variableService = new VariableService(this.context, this.evaluator);
      this.dataService = new DataService(this.context, this.evaluator);
      this.statementRouter = new StatementRouter(
        this.context,
        this.evaluator,
        this.variableService,
        this.dataService
      );
    }
    /**
     * Preprocess statements (statements are already expanded)
     */
    preprocessStatements() {
      if (this.context.config.enableDebugMode) {
        this.context.addDebugOutput(`Preprocessed ${this.context.statements.length} expanded statements`);
        for (let i = 0; i < this.context.statements.length; i++) {
          const stmt = this.context.statements[i];
          if (stmt) {
            this.context.addDebugOutput(`Statement ${i}: Line ${stmt.lineNumber}`);
          }
        }
        this.context.addDebugOutput(`Label map: ${this.context.labelMap.size} line numbers`);
      }
    }
    /**
     * Execute the BASIC program
     */
    async execute() {
      const startTime = Date.now();
      try {
        this.dataService.preprocessDataStatements();
        this.preprocessStatements();
        this.context.isRunning = true;
        this.context.shouldStop = false;
        while (this.context.shouldContinue()) {
          const expandedStatement = this.context.getCurrentStatement();
          if (!expandedStatement) break;
          this.context.setCurrentLineNumber(expandedStatement.lineNumber);
          const statementIndexBefore = this.context.currentStatementIndex;
          if (this.context.config.enableDebugMode) {
            this.context.addDebugOutput(`Executing statement ${statementIndexBefore}: Line ${expandedStatement.lineNumber}`);
          }
          await this.statementRouter.executeStatement(expandedStatement);
          if (!this.context.isRunning) {
            break;
          }
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
          arrays: this.context.arrays,
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
          arrays: this.context.arrays,
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

  // src/core/state/ExecutionContext.ts
  var ExecutionContext = class {
    constructor(config2) {
      // Core state
      __publicField(this, "variables", /* @__PURE__ */ new Map());
      __publicField(this, "isRunning", false);
      __publicField(this, "shouldStop", false);
      __publicField(this, "currentStatementIndex", 0);
      __publicField(this, "statements", []);
      // Expanded statements (flat list)
      __publicField(this, "labelMap", /* @__PURE__ */ new Map());
      // Line number -> statement indices
      __publicField(this, "iterationCount", 0);
      __publicField(this, "currentLineNumber", 0);
      // Current line number being executed
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
      __publicField(this, "spriteStateManager");
      __publicField(this, "animationManager");
      __publicField(this, "errors", []);
      this.config = config2;
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
      this.labelMap.clear();
      this.iterationCount = 0;
      this.loopStack = [];
      this.gosubStack = [];
      this.dataValues = [];
      this.dataIndex = 0;
      this.arrays.clear();
      this.currentLineNumber = 0;
      this.errors = [];
      if (this.spriteStateManager) {
        this.spriteStateManager.clear();
      }
      if (this.animationManager) {
        this.animationManager.reset();
      }
    }
    /**
     * Add output to the context
     */
    addOutput(value) {
      this.deviceAdapter?.printOutput(value);
    }
    /**
     * Add error to the context
     * Runtime errors are fatal and halt execution immediately
     */
    addError(error) {
      this.deviceAdapter?.errorOutput(error.message);
      this.errors.push(error);
      if (error.type === ERROR_TYPES.RUNTIME) {
        this.shouldStop = true;
        this.isRunning = false;
      }
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
     * Find statement indices by line number
     */
    findStatementIndicesByLine(lineNumber) {
      return this.labelMap.get(lineNumber) ?? [];
    }
    /**
     * Find first statement index by line number (for GOTO/GOSUB)
     */
    findStatementIndexByLine(lineNumber) {
      const indices = this.labelMap.get(lineNumber);
      if (indices && indices.length > 0) {
        const firstIndex = indices[0];
        return firstIndex ?? -1;
      }
      return -1;
    }
    /**
     * Get the current line number being executed
     */
    getCurrentLineNumber() {
      return this.currentLineNumber;
    }
    /**
     * Set the current line number being executed
     */
    setCurrentLineNumber(lineNumber) {
      this.currentLineNumber = lineNumber;
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

  // src/core/execution/statement-expander.ts
  function expandStatements(statementsCst) {
    const expandedStatements = [];
    const labelMap = /* @__PURE__ */ new Map();
    for (const statementCst of statementsCst) {
      const lineNumberToken = getFirstToken(statementCst.children.NumberLiteral);
      if (!lineNumberToken) {
        continue;
      }
      const lineNumber = parseInt(lineNumberToken.image, 10);
      if (isNaN(lineNumber)) {
        continue;
      }
      const commandListCst = getFirstCstNode(statementCst.children.commandList);
      if (!commandListCst) {
        continue;
      }
      const commands = getCstNodes(commandListCst.children.command);
      const statementIndices = [];
      for (const commandCst of commands) {
        const statementIndex = expandedStatements.length;
        expandedStatements.push({
          command: commandCst,
          lineNumber,
          statementIndex
        });
        statementIndices.push(statementIndex);
      }
      labelMap.set(lineNumber, statementIndices);
    }
    return {
      statements: expandedStatements,
      labelMap
    };
  }

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_freeGlobal.js
  var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
  var freeGlobal_default = freeGlobal;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_root.js
  var freeSelf = typeof self == "object" && self && self.Object === Object && self;
  var root = freeGlobal_default || freeSelf || Function("return this")();
  var root_default = root;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_Symbol.js
  var Symbol2 = root_default.Symbol;
  var Symbol_default = Symbol2;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getRawTag.js
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var nativeObjectToString = objectProto.toString;
  var symToStringTag = Symbol_default ? Symbol_default.toStringTag : void 0;
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag), tag2 = value[symToStringTag];
    try {
      value[symToStringTag] = void 0;
      var unmasked = true;
    } catch (e) {
    }
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag2;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  var getRawTag_default = getRawTag;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_objectToString.js
  var objectProto2 = Object.prototype;
  var nativeObjectToString2 = objectProto2.toString;
  function objectToString(value) {
    return nativeObjectToString2.call(value);
  }
  var objectToString_default = objectToString;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseGetTag.js
  var nullTag = "[object Null]";
  var undefinedTag = "[object Undefined]";
  var symToStringTag2 = Symbol_default ? Symbol_default.toStringTag : void 0;
  function baseGetTag(value) {
    if (value == null) {
      return value === void 0 ? undefinedTag : nullTag;
    }
    return symToStringTag2 && symToStringTag2 in Object(value) ? getRawTag_default(value) : objectToString_default(value);
  }
  var baseGetTag_default = baseGetTag;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isObjectLike.js
  function isObjectLike(value) {
    return value != null && typeof value == "object";
  }
  var isObjectLike_default = isObjectLike;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isSymbol.js
  var symbolTag = "[object Symbol]";
  function isSymbol(value) {
    return typeof value == "symbol" || isObjectLike_default(value) && baseGetTag_default(value) == symbolTag;
  }
  var isSymbol_default = isSymbol;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_arrayMap.js
  function arrayMap(array, iteratee) {
    var index = -1, length = array == null ? 0 : array.length, result = Array(length);
    while (++index < length) {
      result[index] = iteratee(array[index], index, array);
    }
    return result;
  }
  var arrayMap_default = arrayMap;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isArray.js
  var isArray = Array.isArray;
  var isArray_default = isArray;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseToString.js
  var INFINITY = 1 / 0;
  var symbolProto = Symbol_default ? Symbol_default.prototype : void 0;
  var symbolToString = symbolProto ? symbolProto.toString : void 0;
  function baseToString(value) {
    if (typeof value == "string") {
      return value;
    }
    if (isArray_default(value)) {
      return arrayMap_default(value, baseToString) + "";
    }
    if (isSymbol_default(value)) {
      return symbolToString ? symbolToString.call(value) : "";
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY ? "-0" : result;
  }
  var baseToString_default = baseToString;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_trimmedEndIndex.js
  var reWhitespace = /\s/;
  function trimmedEndIndex(string) {
    var index = string.length;
    while (index-- && reWhitespace.test(string.charAt(index))) {
    }
    return index;
  }
  var trimmedEndIndex_default = trimmedEndIndex;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseTrim.js
  var reTrimStart = /^\s+/;
  function baseTrim(string) {
    return string ? string.slice(0, trimmedEndIndex_default(string) + 1).replace(reTrimStart, "") : string;
  }
  var baseTrim_default = baseTrim;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isObject.js
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == "object" || type == "function");
  }
  var isObject_default = isObject;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/toNumber.js
  var NAN = 0 / 0;
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
  var reIsBinary = /^0b[01]+$/i;
  var reIsOctal = /^0o[0-7]+$/i;
  var freeParseInt = parseInt;
  function toNumber2(value) {
    if (typeof value == "number") {
      return value;
    }
    if (isSymbol_default(value)) {
      return NAN;
    }
    if (isObject_default(value)) {
      var other = typeof value.valueOf == "function" ? value.valueOf() : value;
      value = isObject_default(other) ? other + "" : other;
    }
    if (typeof value != "string") {
      return value === 0 ? value : +value;
    }
    value = baseTrim_default(value);
    var isBinary2 = reIsBinary.test(value);
    return isBinary2 || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary2 ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
  }
  var toNumber_default = toNumber2;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/toFinite.js
  var INFINITY2 = 1 / 0;
  var MAX_INTEGER = 17976931348623157e292;
  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber_default(value);
    if (value === INFINITY2 || value === -INFINITY2) {
      var sign2 = value < 0 ? -1 : 1;
      return sign2 * MAX_INTEGER;
    }
    return value === value ? value : 0;
  }
  var toFinite_default = toFinite;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/toInteger.js
  function toInteger(value) {
    var result = toFinite_default(value), remainder = result % 1;
    return result === result ? remainder ? result - remainder : result : 0;
  }
  var toInteger_default = toInteger;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/identity.js
  function identity(value) {
    return value;
  }
  var identity_default = identity;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isFunction.js
  var asyncTag = "[object AsyncFunction]";
  var funcTag = "[object Function]";
  var genTag = "[object GeneratorFunction]";
  var proxyTag = "[object Proxy]";
  function isFunction(value) {
    if (!isObject_default(value)) {
      return false;
    }
    var tag2 = baseGetTag_default(value);
    return tag2 == funcTag || tag2 == genTag || tag2 == asyncTag || tag2 == proxyTag;
  }
  var isFunction_default = isFunction;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_coreJsData.js
  var coreJsData = root_default["__core-js_shared__"];
  var coreJsData_default = coreJsData;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_isMasked.js
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData_default && coreJsData_default.keys && coreJsData_default.keys.IE_PROTO || "");
    return uid ? "Symbol(src)_1." + uid : "";
  })();
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  var isMasked_default = isMasked;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_toSource.js
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {
      }
      try {
        return func + "";
      } catch (e) {
      }
    }
    return "";
  }
  var toSource_default = toSource;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseIsNative.js
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var funcProto2 = Function.prototype;
  var objectProto3 = Object.prototype;
  var funcToString2 = funcProto2.toString;
  var hasOwnProperty2 = objectProto3.hasOwnProperty;
  var reIsNative = RegExp(
    "^" + funcToString2.call(hasOwnProperty2).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
  );
  function baseIsNative(value) {
    if (!isObject_default(value) || isMasked_default(value)) {
      return false;
    }
    var pattern = isFunction_default(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource_default(value));
  }
  var baseIsNative_default = baseIsNative;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getValue.js
  function getValue(object, key) {
    return object == null ? void 0 : object[key];
  }
  var getValue_default = getValue;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getNative.js
  function getNative(object, key) {
    var value = getValue_default(object, key);
    return baseIsNative_default(value) ? value : void 0;
  }
  var getNative_default = getNative;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_WeakMap.js
  var WeakMap = getNative_default(root_default, "WeakMap");
  var WeakMap_default = WeakMap;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseCreate.js
  var objectCreate = Object.create;
  var baseCreate = /* @__PURE__ */ (function() {
    function object() {
    }
    return function(proto) {
      if (!isObject_default(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object();
      object.prototype = void 0;
      return result;
    };
  })();
  var baseCreate_default = baseCreate;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_apply.js
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0:
        return func.call(thisArg);
      case 1:
        return func.call(thisArg, args[0]);
      case 2:
        return func.call(thisArg, args[0], args[1]);
      case 3:
        return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }
  var apply_default = apply;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/noop.js
  function noop() {
  }
  var noop_default = noop;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_copyArray.js
  function copyArray(source, array) {
    var index = -1, length = source.length;
    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }
  var copyArray_default = copyArray;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_shortOut.js
  var HOT_COUNT = 800;
  var HOT_SPAN = 16;
  var nativeNow = Date.now;
  function shortOut(func) {
    var count = 0, lastCalled = 0;
    return function() {
      var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(void 0, arguments);
    };
  }
  var shortOut_default = shortOut;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/constant.js
  function constant(value) {
    return function() {
      return value;
    };
  }
  var constant_default = constant;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_defineProperty.js
  var defineProperty = (function() {
    try {
      var func = getNative_default(Object, "defineProperty");
      func({}, "", {});
      return func;
    } catch (e) {
    }
  })();
  var defineProperty_default = defineProperty;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseSetToString.js
  var baseSetToString = !defineProperty_default ? identity_default : function(func, string) {
    return defineProperty_default(func, "toString", {
      "configurable": true,
      "enumerable": false,
      "value": constant_default(string),
      "writable": true
    });
  };
  var baseSetToString_default = baseSetToString;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_setToString.js
  var setToString = shortOut_default(baseSetToString_default);
  var setToString_default = setToString;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_arrayEach.js
  function arrayEach(array, iteratee) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }
  var arrayEach_default = arrayEach;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseFindIndex.js
  function baseFindIndex(array, predicate, fromIndex, fromRight) {
    var length = array.length, index = fromIndex + (fromRight ? 1 : -1);
    while (fromRight ? index-- : ++index < length) {
      if (predicate(array[index], index, array)) {
        return index;
      }
    }
    return -1;
  }
  var baseFindIndex_default = baseFindIndex;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseIsNaN.js
  function baseIsNaN(value) {
    return value !== value;
  }
  var baseIsNaN_default = baseIsNaN;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_strictIndexOf.js
  function strictIndexOf(array, value, fromIndex) {
    var index = fromIndex - 1, length = array.length;
    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }
  var strictIndexOf_default = strictIndexOf;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseIndexOf.js
  function baseIndexOf(array, value, fromIndex) {
    return value === value ? strictIndexOf_default(array, value, fromIndex) : baseFindIndex_default(array, baseIsNaN_default, fromIndex);
  }
  var baseIndexOf_default = baseIndexOf;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_arrayIncludes.js
  function arrayIncludes(array, value) {
    var length = array == null ? 0 : array.length;
    return !!length && baseIndexOf_default(array, value, 0) > -1;
  }
  var arrayIncludes_default = arrayIncludes;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_isIndex.js
  var MAX_SAFE_INTEGER2 = 9007199254740991;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER2 : length;
    return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
  }
  var isIndex_default = isIndex;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseAssignValue.js
  function baseAssignValue(object, key, value) {
    if (key == "__proto__" && defineProperty_default) {
      defineProperty_default(object, key, {
        "configurable": true,
        "enumerable": true,
        "value": value,
        "writable": true
      });
    } else {
      object[key] = value;
    }
  }
  var baseAssignValue_default = baseAssignValue;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/eq.js
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }
  var eq_default = eq;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_assignValue.js
  var objectProto4 = Object.prototype;
  var hasOwnProperty3 = objectProto4.hasOwnProperty;
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty3.call(object, key) && eq_default(objValue, value)) || value === void 0 && !(key in object)) {
      baseAssignValue_default(object, key, value);
    }
  }
  var assignValue_default = assignValue;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_copyObject.js
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});
    var index = -1, length = props.length;
    while (++index < length) {
      var key = props[index];
      var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
      if (newValue === void 0) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue_default(object, key, newValue);
      } else {
        assignValue_default(object, key, newValue);
      }
    }
    return object;
  }
  var copyObject_default = copyObject;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_overRest.js
  var nativeMax = Math.max;
  function overRest(func, start, transform) {
    start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
    return function() {
      var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
      while (++index < length) {
        array[index] = args[start + index];
      }
      index = -1;
      var otherArgs = Array(start + 1);
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = transform(array);
      return apply_default(func, this, otherArgs);
    };
  }
  var overRest_default = overRest;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseRest.js
  function baseRest(func, start) {
    return setToString_default(overRest_default(func, start, identity_default), func + "");
  }
  var baseRest_default = baseRest;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isLength.js
  var MAX_SAFE_INTEGER3 = 9007199254740991;
  function isLength(value) {
    return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER3;
  }
  var isLength_default = isLength;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isArrayLike.js
  function isArrayLike(value) {
    return value != null && isLength_default(value.length) && !isFunction_default(value);
  }
  var isArrayLike_default = isArrayLike;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_isIterateeCall.js
  function isIterateeCall(value, index, object) {
    if (!isObject_default(object)) {
      return false;
    }
    var type = typeof index;
    if (type == "number" ? isArrayLike_default(object) && isIndex_default(index, object.length) : type == "string" && index in object) {
      return eq_default(object[index], value);
    }
    return false;
  }
  var isIterateeCall_default = isIterateeCall;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_createAssigner.js
  function createAssigner(assigner) {
    return baseRest_default(function(object, sources) {
      var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
      customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
      if (guard && isIterateeCall_default(sources[0], sources[1], guard)) {
        customizer = length < 3 ? void 0 : customizer;
        length = 1;
      }
      object = Object(object);
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, index, customizer);
        }
      }
      return object;
    });
  }
  var createAssigner_default = createAssigner;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_isPrototype.js
  var objectProto5 = Object.prototype;
  function isPrototype(value) {
    var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto5;
    return value === proto;
  }
  var isPrototype_default = isPrototype;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseTimes.js
  function baseTimes(n, iteratee) {
    var index = -1, result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }
  var baseTimes_default = baseTimes;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseIsArguments.js
  var argsTag = "[object Arguments]";
  function baseIsArguments(value) {
    return isObjectLike_default(value) && baseGetTag_default(value) == argsTag;
  }
  var baseIsArguments_default = baseIsArguments;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isArguments.js
  var objectProto6 = Object.prototype;
  var hasOwnProperty4 = objectProto6.hasOwnProperty;
  var propertyIsEnumerable = objectProto6.propertyIsEnumerable;
  var isArguments = baseIsArguments_default(/* @__PURE__ */ (function() {
    return arguments;
  })()) ? baseIsArguments_default : function(value) {
    return isObjectLike_default(value) && hasOwnProperty4.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
  };
  var isArguments_default = isArguments;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/stubFalse.js
  function stubFalse() {
    return false;
  }
  var stubFalse_default = stubFalse;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isBuffer.js
  var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports = freeModule && freeModule.exports === freeExports;
  var Buffer2 = moduleExports ? root_default.Buffer : void 0;
  var nativeIsBuffer = Buffer2 ? Buffer2.isBuffer : void 0;
  var isBuffer = nativeIsBuffer || stubFalse_default;
  var isBuffer_default = isBuffer;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseIsTypedArray.js
  var argsTag2 = "[object Arguments]";
  var arrayTag = "[object Array]";
  var boolTag = "[object Boolean]";
  var dateTag = "[object Date]";
  var errorTag = "[object Error]";
  var funcTag2 = "[object Function]";
  var mapTag = "[object Map]";
  var numberTag = "[object Number]";
  var objectTag = "[object Object]";
  var regexpTag = "[object RegExp]";
  var setTag = "[object Set]";
  var stringTag = "[object String]";
  var weakMapTag = "[object WeakMap]";
  var arrayBufferTag = "[object ArrayBuffer]";
  var dataViewTag = "[object DataView]";
  var float32Tag = "[object Float32Array]";
  var float64Tag = "[object Float64Array]";
  var int8Tag = "[object Int8Array]";
  var int16Tag = "[object Int16Array]";
  var int32Tag = "[object Int32Array]";
  var uint8Tag = "[object Uint8Array]";
  var uint8ClampedTag = "[object Uint8ClampedArray]";
  var uint16Tag = "[object Uint16Array]";
  var uint32Tag = "[object Uint32Array]";
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag2] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag2] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  function baseIsTypedArray(value) {
    return isObjectLike_default(value) && isLength_default(value.length) && !!typedArrayTags[baseGetTag_default(value)];
  }
  var baseIsTypedArray_default = baseIsTypedArray;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseUnary.js
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }
  var baseUnary_default = baseUnary;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_nodeUtil.js
  var freeExports2 = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule2 = freeExports2 && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports2 = freeModule2 && freeModule2.exports === freeExports2;
  var freeProcess = moduleExports2 && freeGlobal_default.process;
  var nodeUtil = (function() {
    try {
      var types = freeModule2 && freeModule2.require && freeModule2.require("util").types;
      if (types) {
        return types;
      }
      return freeProcess && freeProcess.binding && freeProcess.binding("util");
    } catch (e) {
    }
  })();
  var nodeUtil_default = nodeUtil;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isTypedArray.js
  var nodeIsTypedArray = nodeUtil_default && nodeUtil_default.isTypedArray;
  var isTypedArray = nodeIsTypedArray ? baseUnary_default(nodeIsTypedArray) : baseIsTypedArray_default;
  var isTypedArray_default = isTypedArray;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_arrayLikeKeys.js
  var objectProto7 = Object.prototype;
  var hasOwnProperty5 = objectProto7.hasOwnProperty;
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray_default(value), isArg = !isArr && isArguments_default(value), isBuff = !isArr && !isArg && isBuffer_default(value), isType = !isArr && !isArg && !isBuff && isTypedArray_default(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes_default(value.length, String) : [], length = result.length;
    for (var key in value) {
      if ((inherited || hasOwnProperty5.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
      (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
      isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
      isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
      isIndex_default(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }
  var arrayLikeKeys_default = arrayLikeKeys;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_overArg.js
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }
  var overArg_default = overArg;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_nativeKeys.js
  var nativeKeys = overArg_default(Object.keys, Object);
  var nativeKeys_default = nativeKeys;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseKeys.js
  var objectProto8 = Object.prototype;
  var hasOwnProperty6 = objectProto8.hasOwnProperty;
  function baseKeys(object) {
    if (!isPrototype_default(object)) {
      return nativeKeys_default(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty6.call(object, key) && key != "constructor") {
        result.push(key);
      }
    }
    return result;
  }
  var baseKeys_default = baseKeys;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/keys.js
  function keys(object) {
    return isArrayLike_default(object) ? arrayLikeKeys_default(object) : baseKeys_default(object);
  }
  var keys_default = keys;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/assign.js
  var objectProto9 = Object.prototype;
  var hasOwnProperty7 = objectProto9.hasOwnProperty;
  var assign = createAssigner_default(function(object, source) {
    if (isPrototype_default(source) || isArrayLike_default(source)) {
      copyObject_default(source, keys_default(source), object);
      return;
    }
    for (var key in source) {
      if (hasOwnProperty7.call(source, key)) {
        assignValue_default(object, key, source[key]);
      }
    }
  });
  var assign_default = assign;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_nativeKeysIn.js
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }
  var nativeKeysIn_default = nativeKeysIn;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseKeysIn.js
  var objectProto10 = Object.prototype;
  var hasOwnProperty8 = objectProto10.hasOwnProperty;
  function baseKeysIn(object) {
    if (!isObject_default(object)) {
      return nativeKeysIn_default(object);
    }
    var isProto = isPrototype_default(object), result = [];
    for (var key in object) {
      if (!(key == "constructor" && (isProto || !hasOwnProperty8.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }
  var baseKeysIn_default = baseKeysIn;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/keysIn.js
  function keysIn(object) {
    return isArrayLike_default(object) ? arrayLikeKeys_default(object, true) : baseKeysIn_default(object);
  }
  var keysIn_default = keysIn;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_isKey.js
  var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
  var reIsPlainProp = /^\w*$/;
  function isKey(value, object) {
    if (isArray_default(value)) {
      return false;
    }
    var type = typeof value;
    if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol_default(value)) {
      return true;
    }
    return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
  }
  var isKey_default = isKey;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_nativeCreate.js
  var nativeCreate = getNative_default(Object, "create");
  var nativeCreate_default = nativeCreate;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_hashClear.js
  function hashClear() {
    this.__data__ = nativeCreate_default ? nativeCreate_default(null) : {};
    this.size = 0;
  }
  var hashClear_default = hashClear;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_hashDelete.js
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }
  var hashDelete_default = hashDelete;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_hashGet.js
  var HASH_UNDEFINED = "__lodash_hash_undefined__";
  var objectProto11 = Object.prototype;
  var hasOwnProperty9 = objectProto11.hasOwnProperty;
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate_default) {
      var result = data[key];
      return result === HASH_UNDEFINED ? void 0 : result;
    }
    return hasOwnProperty9.call(data, key) ? data[key] : void 0;
  }
  var hashGet_default = hashGet;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_hashHas.js
  var objectProto12 = Object.prototype;
  var hasOwnProperty10 = objectProto12.hasOwnProperty;
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate_default ? data[key] !== void 0 : hasOwnProperty10.call(data, key);
  }
  var hashHas_default = hashHas;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_hashSet.js
  var HASH_UNDEFINED2 = "__lodash_hash_undefined__";
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate_default && value === void 0 ? HASH_UNDEFINED2 : value;
    return this;
  }
  var hashSet_default = hashSet;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_Hash.js
  function Hash(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  Hash.prototype.clear = hashClear_default;
  Hash.prototype["delete"] = hashDelete_default;
  Hash.prototype.get = hashGet_default;
  Hash.prototype.has = hashHas_default;
  Hash.prototype.set = hashSet_default;
  var Hash_default = Hash;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_listCacheClear.js
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }
  var listCacheClear_default = listCacheClear;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_assocIndexOf.js
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq_default(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  var assocIndexOf_default = assocIndexOf;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_listCacheDelete.js
  var arrayProto = Array.prototype;
  var splice = arrayProto.splice;
  function listCacheDelete(key) {
    var data = this.__data__, index = assocIndexOf_default(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }
  var listCacheDelete_default = listCacheDelete;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_listCacheGet.js
  function listCacheGet(key) {
    var data = this.__data__, index = assocIndexOf_default(data, key);
    return index < 0 ? void 0 : data[index][1];
  }
  var listCacheGet_default = listCacheGet;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_listCacheHas.js
  function listCacheHas(key) {
    return assocIndexOf_default(this.__data__, key) > -1;
  }
  var listCacheHas_default = listCacheHas;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_listCacheSet.js
  function listCacheSet(key, value) {
    var data = this.__data__, index = assocIndexOf_default(data, key);
    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  var listCacheSet_default = listCacheSet;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_ListCache.js
  function ListCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  ListCache.prototype.clear = listCacheClear_default;
  ListCache.prototype["delete"] = listCacheDelete_default;
  ListCache.prototype.get = listCacheGet_default;
  ListCache.prototype.has = listCacheHas_default;
  ListCache.prototype.set = listCacheSet_default;
  var ListCache_default = ListCache;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_Map.js
  var Map2 = getNative_default(root_default, "Map");
  var Map_default = Map2;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_mapCacheClear.js
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      "hash": new Hash_default(),
      "map": new (Map_default || ListCache_default)(),
      "string": new Hash_default()
    };
  }
  var mapCacheClear_default = mapCacheClear;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_isKeyable.js
  function isKeyable(value) {
    var type = typeof value;
    return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
  }
  var isKeyable_default = isKeyable;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getMapData.js
  function getMapData(map2, key) {
    var data = map2.__data__;
    return isKeyable_default(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
  }
  var getMapData_default = getMapData;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_mapCacheDelete.js
  function mapCacheDelete(key) {
    var result = getMapData_default(this, key)["delete"](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  var mapCacheDelete_default = mapCacheDelete;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_mapCacheGet.js
  function mapCacheGet(key) {
    return getMapData_default(this, key).get(key);
  }
  var mapCacheGet_default = mapCacheGet;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_mapCacheHas.js
  function mapCacheHas(key) {
    return getMapData_default(this, key).has(key);
  }
  var mapCacheHas_default = mapCacheHas;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_mapCacheSet.js
  function mapCacheSet(key, value) {
    var data = getMapData_default(this, key), size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }
  var mapCacheSet_default = mapCacheSet;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_MapCache.js
  function MapCache(entries) {
    var index = -1, length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  MapCache.prototype.clear = mapCacheClear_default;
  MapCache.prototype["delete"] = mapCacheDelete_default;
  MapCache.prototype.get = mapCacheGet_default;
  MapCache.prototype.has = mapCacheHas_default;
  MapCache.prototype.set = mapCacheSet_default;
  var MapCache_default = MapCache;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/memoize.js
  var FUNC_ERROR_TEXT = "Expected a function";
  function memoize(func, resolver) {
    if (typeof func != "function" || resolver != null && typeof resolver != "function") {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    var memoized = function() {
      var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
      if (cache.has(key)) {
        return cache.get(key);
      }
      var result = func.apply(this, args);
      memoized.cache = cache.set(key, result) || cache;
      return result;
    };
    memoized.cache = new (memoize.Cache || MapCache_default)();
    return memoized;
  }
  memoize.Cache = MapCache_default;
  var memoize_default = memoize;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_memoizeCapped.js
  var MAX_MEMOIZE_SIZE = 500;
  function memoizeCapped(func) {
    var result = memoize_default(func, function(key) {
      if (cache.size === MAX_MEMOIZE_SIZE) {
        cache.clear();
      }
      return key;
    });
    var cache = result.cache;
    return result;
  }
  var memoizeCapped_default = memoizeCapped;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_stringToPath.js
  var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
  var reEscapeChar = /\\(\\)?/g;
  var stringToPath = memoizeCapped_default(function(string) {
    var result = [];
    if (string.charCodeAt(0) === 46) {
      result.push("");
    }
    string.replace(rePropName, function(match, number, quote, subString) {
      result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match);
    });
    return result;
  });
  var stringToPath_default = stringToPath;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/toString.js
  function toString(value) {
    return value == null ? "" : baseToString_default(value);
  }
  var toString_default = toString;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_castPath.js
  function castPath(value, object) {
    if (isArray_default(value)) {
      return value;
    }
    return isKey_default(value, object) ? [value] : stringToPath_default(toString_default(value));
  }
  var castPath_default = castPath;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_toKey.js
  var INFINITY3 = 1 / 0;
  function toKey(value) {
    if (typeof value == "string" || isSymbol_default(value)) {
      return value;
    }
    var result = value + "";
    return result == "0" && 1 / value == -INFINITY3 ? "-0" : result;
  }
  var toKey_default = toKey;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseGet.js
  function baseGet(object, path) {
    path = castPath_default(path, object);
    var index = 0, length = path.length;
    while (object != null && index < length) {
      object = object[toKey_default(path[index++])];
    }
    return index && index == length ? object : void 0;
  }
  var baseGet_default = baseGet;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/get.js
  function get(object, path, defaultValue) {
    var result = object == null ? void 0 : baseGet_default(object, path);
    return result === void 0 ? defaultValue : result;
  }
  var get_default = get;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_arrayPush.js
  function arrayPush(array, values2) {
    var index = -1, length = values2.length, offset = array.length;
    while (++index < length) {
      array[offset + index] = values2[index];
    }
    return array;
  }
  var arrayPush_default = arrayPush;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_isFlattenable.js
  var spreadableSymbol = Symbol_default ? Symbol_default.isConcatSpreadable : void 0;
  function isFlattenable(value) {
    return isArray_default(value) || isArguments_default(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
  }
  var isFlattenable_default = isFlattenable;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseFlatten.js
  function baseFlatten(array, depth, predicate, isStrict, result) {
    var index = -1, length = array.length;
    predicate || (predicate = isFlattenable_default);
    result || (result = []);
    while (++index < length) {
      var value = array[index];
      if (depth > 0 && predicate(value)) {
        if (depth > 1) {
          baseFlatten(value, depth - 1, predicate, isStrict, result);
        } else {
          arrayPush_default(result, value);
        }
      } else if (!isStrict) {
        result[result.length] = value;
      }
    }
    return result;
  }
  var baseFlatten_default = baseFlatten;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/flatten.js
  function flatten(array) {
    var length = array == null ? 0 : array.length;
    return length ? baseFlatten_default(array, 1) : [];
  }
  var flatten_default = flatten;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getPrototype.js
  var getPrototype = overArg_default(Object.getPrototypeOf, Object);
  var getPrototype_default = getPrototype;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseSlice.js
  function baseSlice(array, start, end) {
    var index = -1, length = array.length;
    if (start < 0) {
      start = -start > length ? 0 : length + start;
    }
    end = end > length ? length : end;
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : end - start >>> 0;
    start >>>= 0;
    var result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  }
  var baseSlice_default = baseSlice;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_arrayReduce.js
  function arrayReduce(array, iteratee, accumulator, initAccum) {
    var index = -1, length = array == null ? 0 : array.length;
    if (initAccum && length) {
      accumulator = array[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
  }
  var arrayReduce_default = arrayReduce;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_stackClear.js
  function stackClear() {
    this.__data__ = new ListCache_default();
    this.size = 0;
  }
  var stackClear_default = stackClear;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_stackDelete.js
  function stackDelete(key) {
    var data = this.__data__, result = data["delete"](key);
    this.size = data.size;
    return result;
  }
  var stackDelete_default = stackDelete;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_stackGet.js
  function stackGet(key) {
    return this.__data__.get(key);
  }
  var stackGet_default = stackGet;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_stackHas.js
  function stackHas(key) {
    return this.__data__.has(key);
  }
  var stackHas_default = stackHas;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_stackSet.js
  var LARGE_ARRAY_SIZE = 200;
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache_default) {
      var pairs = data.__data__;
      if (!Map_default || pairs.length < LARGE_ARRAY_SIZE - 1) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache_default(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }
  var stackSet_default = stackSet;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_Stack.js
  function Stack(entries) {
    var data = this.__data__ = new ListCache_default(entries);
    this.size = data.size;
  }
  Stack.prototype.clear = stackClear_default;
  Stack.prototype["delete"] = stackDelete_default;
  Stack.prototype.get = stackGet_default;
  Stack.prototype.has = stackHas_default;
  Stack.prototype.set = stackSet_default;
  var Stack_default = Stack;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseAssign.js
  function baseAssign(object, source) {
    return object && copyObject_default(source, keys_default(source), object);
  }
  var baseAssign_default = baseAssign;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseAssignIn.js
  function baseAssignIn(object, source) {
    return object && copyObject_default(source, keysIn_default(source), object);
  }
  var baseAssignIn_default = baseAssignIn;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_cloneBuffer.js
  var freeExports3 = typeof exports == "object" && exports && !exports.nodeType && exports;
  var freeModule3 = freeExports3 && typeof module == "object" && module && !module.nodeType && module;
  var moduleExports3 = freeModule3 && freeModule3.exports === freeExports3;
  var Buffer3 = moduleExports3 ? root_default.Buffer : void 0;
  var allocUnsafe = Buffer3 ? Buffer3.allocUnsafe : void 0;
  function cloneBuffer(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice();
    }
    var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
    buffer.copy(result);
    return result;
  }
  var cloneBuffer_default = cloneBuffer;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_arrayFilter.js
  function arrayFilter(array, predicate) {
    var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }
  var arrayFilter_default = arrayFilter;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/stubArray.js
  function stubArray() {
    return [];
  }
  var stubArray_default = stubArray;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getSymbols.js
  var objectProto13 = Object.prototype;
  var propertyIsEnumerable2 = objectProto13.propertyIsEnumerable;
  var nativeGetSymbols = Object.getOwnPropertySymbols;
  var getSymbols = !nativeGetSymbols ? stubArray_default : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter_default(nativeGetSymbols(object), function(symbol) {
      return propertyIsEnumerable2.call(object, symbol);
    });
  };
  var getSymbols_default = getSymbols;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_copySymbols.js
  function copySymbols(source, object) {
    return copyObject_default(source, getSymbols_default(source), object);
  }
  var copySymbols_default = copySymbols;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getSymbolsIn.js
  var nativeGetSymbols2 = Object.getOwnPropertySymbols;
  var getSymbolsIn = !nativeGetSymbols2 ? stubArray_default : function(object) {
    var result = [];
    while (object) {
      arrayPush_default(result, getSymbols_default(object));
      object = getPrototype_default(object);
    }
    return result;
  };
  var getSymbolsIn_default = getSymbolsIn;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_copySymbolsIn.js
  function copySymbolsIn(source, object) {
    return copyObject_default(source, getSymbolsIn_default(source), object);
  }
  var copySymbolsIn_default = copySymbolsIn;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseGetAllKeys.js
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray_default(object) ? result : arrayPush_default(result, symbolsFunc(object));
  }
  var baseGetAllKeys_default = baseGetAllKeys;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getAllKeys.js
  function getAllKeys(object) {
    return baseGetAllKeys_default(object, keys_default, getSymbols_default);
  }
  var getAllKeys_default = getAllKeys;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getAllKeysIn.js
  function getAllKeysIn(object) {
    return baseGetAllKeys_default(object, keysIn_default, getSymbolsIn_default);
  }
  var getAllKeysIn_default = getAllKeysIn;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_DataView.js
  var DataView = getNative_default(root_default, "DataView");
  var DataView_default = DataView;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_Promise.js
  var Promise2 = getNative_default(root_default, "Promise");
  var Promise_default = Promise2;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_Set.js
  var Set = getNative_default(root_default, "Set");
  var Set_default = Set;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getTag.js
  var mapTag2 = "[object Map]";
  var objectTag2 = "[object Object]";
  var promiseTag = "[object Promise]";
  var setTag2 = "[object Set]";
  var weakMapTag2 = "[object WeakMap]";
  var dataViewTag2 = "[object DataView]";
  var dataViewCtorString = toSource_default(DataView_default);
  var mapCtorString = toSource_default(Map_default);
  var promiseCtorString = toSource_default(Promise_default);
  var setCtorString = toSource_default(Set_default);
  var weakMapCtorString = toSource_default(WeakMap_default);
  var getTag = baseGetTag_default;
  if (DataView_default && getTag(new DataView_default(new ArrayBuffer(1))) != dataViewTag2 || Map_default && getTag(new Map_default()) != mapTag2 || Promise_default && getTag(Promise_default.resolve()) != promiseTag || Set_default && getTag(new Set_default()) != setTag2 || WeakMap_default && getTag(new WeakMap_default()) != weakMapTag2) {
    getTag = function(value) {
      var result = baseGetTag_default(value), Ctor = result == objectTag2 ? value.constructor : void 0, ctorString = Ctor ? toSource_default(Ctor) : "";
      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag2;
          case mapCtorString:
            return mapTag2;
          case promiseCtorString:
            return promiseTag;
          case setCtorString:
            return setTag2;
          case weakMapCtorString:
            return weakMapTag2;
        }
      }
      return result;
    };
  }
  var getTag_default = getTag;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_initCloneArray.js
  var objectProto14 = Object.prototype;
  var hasOwnProperty11 = objectProto14.hasOwnProperty;
  function initCloneArray(array) {
    var length = array.length, result = new array.constructor(length);
    if (length && typeof array[0] == "string" && hasOwnProperty11.call(array, "index")) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }
  var initCloneArray_default = initCloneArray;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_Uint8Array.js
  var Uint8Array2 = root_default.Uint8Array;
  var Uint8Array_default = Uint8Array2;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_cloneArrayBuffer.js
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array_default(result).set(new Uint8Array_default(arrayBuffer));
    return result;
  }
  var cloneArrayBuffer_default = cloneArrayBuffer;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_cloneDataView.js
  function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer_default(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }
  var cloneDataView_default = cloneDataView;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_cloneRegExp.js
  var reFlags = /\w*$/;
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }
  var cloneRegExp_default = cloneRegExp;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_cloneSymbol.js
  var symbolProto2 = Symbol_default ? Symbol_default.prototype : void 0;
  var symbolValueOf = symbolProto2 ? symbolProto2.valueOf : void 0;
  function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }
  var cloneSymbol_default = cloneSymbol;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_cloneTypedArray.js
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer_default(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }
  var cloneTypedArray_default = cloneTypedArray;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_initCloneByTag.js
  var boolTag2 = "[object Boolean]";
  var dateTag2 = "[object Date]";
  var mapTag3 = "[object Map]";
  var numberTag2 = "[object Number]";
  var regexpTag2 = "[object RegExp]";
  var setTag3 = "[object Set]";
  var stringTag2 = "[object String]";
  var symbolTag2 = "[object Symbol]";
  var arrayBufferTag2 = "[object ArrayBuffer]";
  var dataViewTag3 = "[object DataView]";
  var float32Tag2 = "[object Float32Array]";
  var float64Tag2 = "[object Float64Array]";
  var int8Tag2 = "[object Int8Array]";
  var int16Tag2 = "[object Int16Array]";
  var int32Tag2 = "[object Int32Array]";
  var uint8Tag2 = "[object Uint8Array]";
  var uint8ClampedTag2 = "[object Uint8ClampedArray]";
  var uint16Tag2 = "[object Uint16Array]";
  var uint32Tag2 = "[object Uint32Array]";
  function initCloneByTag(object, tag2, isDeep) {
    var Ctor = object.constructor;
    switch (tag2) {
      case arrayBufferTag2:
        return cloneArrayBuffer_default(object);
      case boolTag2:
      case dateTag2:
        return new Ctor(+object);
      case dataViewTag3:
        return cloneDataView_default(object, isDeep);
      case float32Tag2:
      case float64Tag2:
      case int8Tag2:
      case int16Tag2:
      case int32Tag2:
      case uint8Tag2:
      case uint8ClampedTag2:
      case uint16Tag2:
      case uint32Tag2:
        return cloneTypedArray_default(object, isDeep);
      case mapTag3:
        return new Ctor();
      case numberTag2:
      case stringTag2:
        return new Ctor(object);
      case regexpTag2:
        return cloneRegExp_default(object);
      case setTag3:
        return new Ctor();
      case symbolTag2:
        return cloneSymbol_default(object);
    }
  }
  var initCloneByTag_default = initCloneByTag;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_initCloneObject.js
  function initCloneObject(object) {
    return typeof object.constructor == "function" && !isPrototype_default(object) ? baseCreate_default(getPrototype_default(object)) : {};
  }
  var initCloneObject_default = initCloneObject;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseIsMap.js
  var mapTag4 = "[object Map]";
  function baseIsMap(value) {
    return isObjectLike_default(value) && getTag_default(value) == mapTag4;
  }
  var baseIsMap_default = baseIsMap;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isMap.js
  var nodeIsMap = nodeUtil_default && nodeUtil_default.isMap;
  var isMap = nodeIsMap ? baseUnary_default(nodeIsMap) : baseIsMap_default;
  var isMap_default = isMap;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseIsSet.js
  var setTag4 = "[object Set]";
  function baseIsSet(value) {
    return isObjectLike_default(value) && getTag_default(value) == setTag4;
  }
  var baseIsSet_default = baseIsSet;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isSet.js
  var nodeIsSet = nodeUtil_default && nodeUtil_default.isSet;
  var isSet = nodeIsSet ? baseUnary_default(nodeIsSet) : baseIsSet_default;
  var isSet_default = isSet;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseClone.js
  var CLONE_DEEP_FLAG = 1;
  var CLONE_FLAT_FLAG = 2;
  var CLONE_SYMBOLS_FLAG = 4;
  var argsTag3 = "[object Arguments]";
  var arrayTag2 = "[object Array]";
  var boolTag3 = "[object Boolean]";
  var dateTag3 = "[object Date]";
  var errorTag2 = "[object Error]";
  var funcTag3 = "[object Function]";
  var genTag2 = "[object GeneratorFunction]";
  var mapTag5 = "[object Map]";
  var numberTag3 = "[object Number]";
  var objectTag3 = "[object Object]";
  var regexpTag3 = "[object RegExp]";
  var setTag5 = "[object Set]";
  var stringTag3 = "[object String]";
  var symbolTag3 = "[object Symbol]";
  var weakMapTag3 = "[object WeakMap]";
  var arrayBufferTag3 = "[object ArrayBuffer]";
  var dataViewTag4 = "[object DataView]";
  var float32Tag3 = "[object Float32Array]";
  var float64Tag3 = "[object Float64Array]";
  var int8Tag3 = "[object Int8Array]";
  var int16Tag3 = "[object Int16Array]";
  var int32Tag3 = "[object Int32Array]";
  var uint8Tag3 = "[object Uint8Array]";
  var uint8ClampedTag3 = "[object Uint8ClampedArray]";
  var uint16Tag3 = "[object Uint16Array]";
  var uint32Tag3 = "[object Uint32Array]";
  var cloneableTags = {};
  cloneableTags[argsTag3] = cloneableTags[arrayTag2] = cloneableTags[arrayBufferTag3] = cloneableTags[dataViewTag4] = cloneableTags[boolTag3] = cloneableTags[dateTag3] = cloneableTags[float32Tag3] = cloneableTags[float64Tag3] = cloneableTags[int8Tag3] = cloneableTags[int16Tag3] = cloneableTags[int32Tag3] = cloneableTags[mapTag5] = cloneableTags[numberTag3] = cloneableTags[objectTag3] = cloneableTags[regexpTag3] = cloneableTags[setTag5] = cloneableTags[stringTag3] = cloneableTags[symbolTag3] = cloneableTags[uint8Tag3] = cloneableTags[uint8ClampedTag3] = cloneableTags[uint16Tag3] = cloneableTags[uint32Tag3] = true;
  cloneableTags[errorTag2] = cloneableTags[funcTag3] = cloneableTags[weakMapTag3] = false;
  function baseClone(value, bitmask, customizer, key, object, stack) {
    var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== void 0) {
      return result;
    }
    if (!isObject_default(value)) {
      return value;
    }
    var isArr = isArray_default(value);
    if (isArr) {
      result = initCloneArray_default(value);
      if (!isDeep) {
        return copyArray_default(value, result);
      }
    } else {
      var tag2 = getTag_default(value), isFunc = tag2 == funcTag3 || tag2 == genTag2;
      if (isBuffer_default(value)) {
        return cloneBuffer_default(value, isDeep);
      }
      if (tag2 == objectTag3 || tag2 == argsTag3 || isFunc && !object) {
        result = isFlat || isFunc ? {} : initCloneObject_default(value);
        if (!isDeep) {
          return isFlat ? copySymbolsIn_default(value, baseAssignIn_default(result, value)) : copySymbols_default(value, baseAssign_default(result, value));
        }
      } else {
        if (!cloneableTags[tag2]) {
          return object ? value : {};
        }
        result = initCloneByTag_default(value, tag2, isDeep);
      }
    }
    stack || (stack = new Stack_default());
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);
    if (isSet_default(value)) {
      value.forEach(function(subValue) {
        result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
      });
    } else if (isMap_default(value)) {
      value.forEach(function(subValue, key2) {
        result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
      });
    }
    var keysFunc = isFull ? isFlat ? getAllKeysIn_default : getAllKeys_default : isFlat ? keysIn_default : keys_default;
    var props = isArr ? void 0 : keysFunc(value);
    arrayEach_default(props || value, function(subValue, key2) {
      if (props) {
        key2 = subValue;
        subValue = value[key2];
      }
      assignValue_default(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
    });
    return result;
  }
  var baseClone_default = baseClone;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/clone.js
  var CLONE_SYMBOLS_FLAG2 = 4;
  function clone2(value) {
    return baseClone_default(value, CLONE_SYMBOLS_FLAG2);
  }
  var clone_default = clone2;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/compact.js
  function compact(array) {
    var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
    while (++index < length) {
      var value = array[index];
      if (value) {
        result[resIndex++] = value;
      }
    }
    return result;
  }
  var compact_default = compact;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_setCacheAdd.js
  var HASH_UNDEFINED3 = "__lodash_hash_undefined__";
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED3);
    return this;
  }
  var setCacheAdd_default = setCacheAdd;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_setCacheHas.js
  function setCacheHas(value) {
    return this.__data__.has(value);
  }
  var setCacheHas_default = setCacheHas;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_SetCache.js
  function SetCache(values2) {
    var index = -1, length = values2 == null ? 0 : values2.length;
    this.__data__ = new MapCache_default();
    while (++index < length) {
      this.add(values2[index]);
    }
  }
  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd_default;
  SetCache.prototype.has = setCacheHas_default;
  var SetCache_default = SetCache;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_arraySome.js
  function arraySome(array, predicate) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }
  var arraySome_default = arraySome;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_cacheHas.js
  function cacheHas(cache, key) {
    return cache.has(key);
  }
  var cacheHas_default = cacheHas;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_equalArrays.js
  var COMPARE_PARTIAL_FLAG = 1;
  var COMPARE_UNORDERED_FLAG = 2;
  function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }
    var arrStacked = stack.get(array);
    var othStacked = stack.get(other);
    if (arrStacked && othStacked) {
      return arrStacked == other && othStacked == array;
    }
    var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache_default() : void 0;
    stack.set(array, other);
    stack.set(other, array);
    while (++index < arrLength) {
      var arrValue = array[index], othValue = other[index];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
      }
      if (compared !== void 0) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }
      if (seen) {
        if (!arraySome_default(other, function(othValue2, othIndex) {
          if (!cacheHas_default(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
            return seen.push(othIndex);
          }
        })) {
          result = false;
          break;
        }
      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
        result = false;
        break;
      }
    }
    stack["delete"](array);
    stack["delete"](other);
    return result;
  }
  var equalArrays_default = equalArrays;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_mapToArray.js
  function mapToArray(map2) {
    var index = -1, result = Array(map2.size);
    map2.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }
  var mapToArray_default = mapToArray;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_setToArray.js
  function setToArray(set) {
    var index = -1, result = Array(set.size);
    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }
  var setToArray_default = setToArray;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_equalByTag.js
  var COMPARE_PARTIAL_FLAG2 = 1;
  var COMPARE_UNORDERED_FLAG2 = 2;
  var boolTag4 = "[object Boolean]";
  var dateTag4 = "[object Date]";
  var errorTag3 = "[object Error]";
  var mapTag6 = "[object Map]";
  var numberTag4 = "[object Number]";
  var regexpTag4 = "[object RegExp]";
  var setTag6 = "[object Set]";
  var stringTag4 = "[object String]";
  var symbolTag4 = "[object Symbol]";
  var arrayBufferTag4 = "[object ArrayBuffer]";
  var dataViewTag5 = "[object DataView]";
  var symbolProto3 = Symbol_default ? Symbol_default.prototype : void 0;
  var symbolValueOf2 = symbolProto3 ? symbolProto3.valueOf : void 0;
  function equalByTag(object, other, tag2, bitmask, customizer, equalFunc, stack) {
    switch (tag2) {
      case dataViewTag5:
        if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
          return false;
        }
        object = object.buffer;
        other = other.buffer;
      case arrayBufferTag4:
        if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array_default(object), new Uint8Array_default(other))) {
          return false;
        }
        return true;
      case boolTag4:
      case dateTag4:
      case numberTag4:
        return eq_default(+object, +other);
      case errorTag3:
        return object.name == other.name && object.message == other.message;
      case regexpTag4:
      case stringTag4:
        return object == other + "";
      case mapTag6:
        var convert = mapToArray_default;
      case setTag6:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG2;
        convert || (convert = setToArray_default);
        if (object.size != other.size && !isPartial) {
          return false;
        }
        var stacked = stack.get(object);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= COMPARE_UNORDERED_FLAG2;
        stack.set(object, other);
        var result = equalArrays_default(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
        stack["delete"](object);
        return result;
      case symbolTag4:
        if (symbolValueOf2) {
          return symbolValueOf2.call(object) == symbolValueOf2.call(other);
        }
    }
    return false;
  }
  var equalByTag_default = equalByTag;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_equalObjects.js
  var COMPARE_PARTIAL_FLAG3 = 1;
  var objectProto15 = Object.prototype;
  var hasOwnProperty12 = objectProto15.hasOwnProperty;
  function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG3, objProps = getAllKeys_default(object), objLength = objProps.length, othProps = getAllKeys_default(other), othLength = othProps.length;
    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : hasOwnProperty12.call(other, key))) {
        return false;
      }
    }
    var objStacked = stack.get(object);
    var othStacked = stack.get(other);
    if (objStacked && othStacked) {
      return objStacked == other && othStacked == object;
    }
    var result = true;
    stack.set(object, other);
    stack.set(other, object);
    var skipCtor = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object[key], othValue = other[key];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
      }
      if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == "constructor");
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor, othCtor = other.constructor;
      if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack["delete"](object);
    stack["delete"](other);
    return result;
  }
  var equalObjects_default = equalObjects;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseIsEqualDeep.js
  var COMPARE_PARTIAL_FLAG4 = 1;
  var argsTag4 = "[object Arguments]";
  var arrayTag3 = "[object Array]";
  var objectTag4 = "[object Object]";
  var objectProto16 = Object.prototype;
  var hasOwnProperty13 = objectProto16.hasOwnProperty;
  function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray_default(object), othIsArr = isArray_default(other), objTag = objIsArr ? arrayTag3 : getTag_default(object), othTag = othIsArr ? arrayTag3 : getTag_default(other);
    objTag = objTag == argsTag4 ? objectTag4 : objTag;
    othTag = othTag == argsTag4 ? objectTag4 : othTag;
    var objIsObj = objTag == objectTag4, othIsObj = othTag == objectTag4, isSameTag = objTag == othTag;
    if (isSameTag && isBuffer_default(object)) {
      if (!isBuffer_default(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack_default());
      return objIsArr || isTypedArray_default(object) ? equalArrays_default(object, other, bitmask, customizer, equalFunc, stack) : equalByTag_default(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG4)) {
      var objIsWrapped = objIsObj && hasOwnProperty13.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty13.call(other, "__wrapped__");
      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new Stack_default());
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack_default());
    return equalObjects_default(object, other, bitmask, customizer, equalFunc, stack);
  }
  var baseIsEqualDeep_default = baseIsEqualDeep;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseIsEqual.js
  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || !isObjectLike_default(value) && !isObjectLike_default(other)) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep_default(value, other, bitmask, customizer, baseIsEqual, stack);
  }
  var baseIsEqual_default = baseIsEqual;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseIsMatch.js
  var COMPARE_PARTIAL_FLAG5 = 1;
  var COMPARE_UNORDERED_FLAG3 = 2;
  function baseIsMatch(object, source, matchData, customizer) {
    var index = matchData.length, length = index, noCustomizer = !customizer;
    if (object == null) {
      return !length;
    }
    object = Object(object);
    while (index--) {
      var data = matchData[index];
      if (noCustomizer && data[2] ? data[1] !== object[data[0]] : !(data[0] in object)) {
        return false;
      }
    }
    while (++index < length) {
      data = matchData[index];
      var key = data[0], objValue = object[key], srcValue = data[1];
      if (noCustomizer && data[2]) {
        if (objValue === void 0 && !(key in object)) {
          return false;
        }
      } else {
        var stack = new Stack_default();
        if (customizer) {
          var result = customizer(objValue, srcValue, key, object, source, stack);
        }
        if (!(result === void 0 ? baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG5 | COMPARE_UNORDERED_FLAG3, customizer, stack) : result)) {
          return false;
        }
      }
    }
    return true;
  }
  var baseIsMatch_default = baseIsMatch;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_isStrictComparable.js
  function isStrictComparable(value) {
    return value === value && !isObject_default(value);
  }
  var isStrictComparable_default = isStrictComparable;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_getMatchData.js
  function getMatchData(object) {
    var result = keys_default(object), length = result.length;
    while (length--) {
      var key = result[length], value = object[key];
      result[length] = [key, value, isStrictComparable_default(value)];
    }
    return result;
  }
  var getMatchData_default = getMatchData;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_matchesStrictComparable.js
  function matchesStrictComparable(key, srcValue) {
    return function(object) {
      if (object == null) {
        return false;
      }
      return object[key] === srcValue && (srcValue !== void 0 || key in Object(object));
    };
  }
  var matchesStrictComparable_default = matchesStrictComparable;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseMatches.js
  function baseMatches(source) {
    var matchData = getMatchData_default(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return matchesStrictComparable_default(matchData[0][0], matchData[0][1]);
    }
    return function(object) {
      return object === source || baseIsMatch_default(object, source, matchData);
    };
  }
  var baseMatches_default = baseMatches;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseHasIn.js
  function baseHasIn(object, key) {
    return object != null && key in Object(object);
  }
  var baseHasIn_default = baseHasIn;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_hasPath.js
  function hasPath(object, path, hasFunc) {
    path = castPath_default(path, object);
    var index = -1, length = path.length, result = false;
    while (++index < length) {
      var key = toKey_default(path[index]);
      if (!(result = object != null && hasFunc(object, key))) {
        break;
      }
      object = object[key];
    }
    if (result || ++index != length) {
      return result;
    }
    length = object == null ? 0 : object.length;
    return !!length && isLength_default(length) && isIndex_default(key, length) && (isArray_default(object) || isArguments_default(object));
  }
  var hasPath_default = hasPath;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/hasIn.js
  function hasIn(object, path) {
    return object != null && hasPath_default(object, path, baseHasIn_default);
  }
  var hasIn_default = hasIn;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseMatchesProperty.js
  var COMPARE_PARTIAL_FLAG6 = 1;
  var COMPARE_UNORDERED_FLAG4 = 2;
  function baseMatchesProperty(path, srcValue) {
    if (isKey_default(path) && isStrictComparable_default(srcValue)) {
      return matchesStrictComparable_default(toKey_default(path), srcValue);
    }
    return function(object) {
      var objValue = get_default(object, path);
      return objValue === void 0 && objValue === srcValue ? hasIn_default(object, path) : baseIsEqual_default(srcValue, objValue, COMPARE_PARTIAL_FLAG6 | COMPARE_UNORDERED_FLAG4);
    };
  }
  var baseMatchesProperty_default = baseMatchesProperty;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseProperty.js
  function baseProperty(key) {
    return function(object) {
      return object == null ? void 0 : object[key];
    };
  }
  var baseProperty_default = baseProperty;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_basePropertyDeep.js
  function basePropertyDeep(path) {
    return function(object) {
      return baseGet_default(object, path);
    };
  }
  var basePropertyDeep_default = basePropertyDeep;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/property.js
  function property(path) {
    return isKey_default(path) ? baseProperty_default(toKey_default(path)) : basePropertyDeep_default(path);
  }
  var property_default = property;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseIteratee.js
  function baseIteratee(value) {
    if (typeof value == "function") {
      return value;
    }
    if (value == null) {
      return identity_default;
    }
    if (typeof value == "object") {
      return isArray_default(value) ? baseMatchesProperty_default(value[0], value[1]) : baseMatches_default(value);
    }
    return property_default(value);
  }
  var baseIteratee_default = baseIteratee;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_arrayAggregator.js
  function arrayAggregator(array, setter, iteratee, accumulator) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
      var value = array[index];
      setter(accumulator, value, iteratee(value), array);
    }
    return accumulator;
  }
  var arrayAggregator_default = arrayAggregator;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_createBaseFor.js
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }
  var createBaseFor_default = createBaseFor;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseFor.js
  var baseFor = createBaseFor_default();
  var baseFor_default = baseFor;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseForOwn.js
  function baseForOwn(object, iteratee) {
    return object && baseFor_default(object, iteratee, keys_default);
  }
  var baseForOwn_default = baseForOwn;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_createBaseEach.js
  function createBaseEach(eachFunc, fromRight) {
    return function(collection, iteratee) {
      if (collection == null) {
        return collection;
      }
      if (!isArrayLike_default(collection)) {
        return eachFunc(collection, iteratee);
      }
      var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
      while (fromRight ? index-- : ++index < length) {
        if (iteratee(iterable[index], index, iterable) === false) {
          break;
        }
      }
      return collection;
    };
  }
  var createBaseEach_default = createBaseEach;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseEach.js
  var baseEach = createBaseEach_default(baseForOwn_default);
  var baseEach_default = baseEach;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseAggregator.js
  function baseAggregator(collection, setter, iteratee, accumulator) {
    baseEach_default(collection, function(value, key, collection2) {
      setter(accumulator, value, iteratee(value), collection2);
    });
    return accumulator;
  }
  var baseAggregator_default = baseAggregator;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_createAggregator.js
  function createAggregator(setter, initializer) {
    return function(collection, iteratee) {
      var func = isArray_default(collection) ? arrayAggregator_default : baseAggregator_default, accumulator = initializer ? initializer() : {};
      return func(collection, setter, baseIteratee_default(iteratee, 2), accumulator);
    };
  }
  var createAggregator_default = createAggregator;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/defaults.js
  var objectProto17 = Object.prototype;
  var hasOwnProperty14 = objectProto17.hasOwnProperty;
  var defaults = baseRest_default(function(object, sources) {
    object = Object(object);
    var index = -1;
    var length = sources.length;
    var guard = length > 2 ? sources[2] : void 0;
    if (guard && isIterateeCall_default(sources[0], sources[1], guard)) {
      length = 1;
    }
    while (++index < length) {
      var source = sources[index];
      var props = keysIn_default(source);
      var propsIndex = -1;
      var propsLength = props.length;
      while (++propsIndex < propsLength) {
        var key = props[propsIndex];
        var value = object[key];
        if (value === void 0 || eq_default(value, objectProto17[key]) && !hasOwnProperty14.call(object, key)) {
          object[key] = source[key];
        }
      }
    }
    return object;
  });
  var defaults_default = defaults;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isArrayLikeObject.js
  function isArrayLikeObject(value) {
    return isObjectLike_default(value) && isArrayLike_default(value);
  }
  var isArrayLikeObject_default = isArrayLikeObject;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_arrayIncludesWith.js
  function arrayIncludesWith(array, value, comparator) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
      if (comparator(value, array[index])) {
        return true;
      }
    }
    return false;
  }
  var arrayIncludesWith_default = arrayIncludesWith;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseDifference.js
  var LARGE_ARRAY_SIZE2 = 200;
  function baseDifference(array, values2, iteratee, comparator) {
    var index = -1, includes2 = arrayIncludes_default, isCommon = true, length = array.length, result = [], valuesLength = values2.length;
    if (!length) {
      return result;
    }
    if (iteratee) {
      values2 = arrayMap_default(values2, baseUnary_default(iteratee));
    }
    if (comparator) {
      includes2 = arrayIncludesWith_default;
      isCommon = false;
    } else if (values2.length >= LARGE_ARRAY_SIZE2) {
      includes2 = cacheHas_default;
      isCommon = false;
      values2 = new SetCache_default(values2);
    }
    outer:
      while (++index < length) {
        var value = array[index], computed = iteratee == null ? value : iteratee(value);
        value = comparator || value !== 0 ? value : 0;
        if (isCommon && computed === computed) {
          var valuesIndex = valuesLength;
          while (valuesIndex--) {
            if (values2[valuesIndex] === computed) {
              continue outer;
            }
          }
          result.push(value);
        } else if (!includes2(values2, computed, comparator)) {
          result.push(value);
        }
      }
    return result;
  }
  var baseDifference_default = baseDifference;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/difference.js
  var difference = baseRest_default(function(array, values2) {
    return isArrayLikeObject_default(array) ? baseDifference_default(array, baseFlatten_default(values2, 1, isArrayLikeObject_default, true)) : [];
  });
  var difference_default = difference;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/last.js
  function last(array) {
    var length = array == null ? 0 : array.length;
    return length ? array[length - 1] : void 0;
  }
  var last_default = last;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/drop.js
  function drop(array, n, guard) {
    var length = array == null ? 0 : array.length;
    if (!length) {
      return [];
    }
    n = guard || n === void 0 ? 1 : toInteger_default(n);
    return baseSlice_default(array, n < 0 ? 0 : n, length);
  }
  var drop_default = drop;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/dropRight.js
  function dropRight(array, n, guard) {
    var length = array == null ? 0 : array.length;
    if (!length) {
      return [];
    }
    n = guard || n === void 0 ? 1 : toInteger_default(n);
    n = length - n;
    return baseSlice_default(array, 0, n < 0 ? 0 : n);
  }
  var dropRight_default = dropRight;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_castFunction.js
  function castFunction(value) {
    return typeof value == "function" ? value : identity_default;
  }
  var castFunction_default = castFunction;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/forEach.js
  function forEach(collection, iteratee) {
    var func = isArray_default(collection) ? arrayEach_default : baseEach_default;
    return func(collection, castFunction_default(iteratee));
  }
  var forEach_default = forEach;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_arrayEvery.js
  function arrayEvery(array, predicate) {
    var index = -1, length = array == null ? 0 : array.length;
    while (++index < length) {
      if (!predicate(array[index], index, array)) {
        return false;
      }
    }
    return true;
  }
  var arrayEvery_default = arrayEvery;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseEvery.js
  function baseEvery(collection, predicate) {
    var result = true;
    baseEach_default(collection, function(value, index, collection2) {
      result = !!predicate(value, index, collection2);
      return result;
    });
    return result;
  }
  var baseEvery_default = baseEvery;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/every.js
  function every(collection, predicate, guard) {
    var func = isArray_default(collection) ? arrayEvery_default : baseEvery_default;
    if (guard && isIterateeCall_default(collection, predicate, guard)) {
      predicate = void 0;
    }
    return func(collection, baseIteratee_default(predicate, 3));
  }
  var every_default = every;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseFilter.js
  function baseFilter(collection, predicate) {
    var result = [];
    baseEach_default(collection, function(value, index, collection2) {
      if (predicate(value, index, collection2)) {
        result.push(value);
      }
    });
    return result;
  }
  var baseFilter_default = baseFilter;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/filter.js
  function filter(collection, predicate) {
    var func = isArray_default(collection) ? arrayFilter_default : baseFilter_default;
    return func(collection, baseIteratee_default(predicate, 3));
  }
  var filter_default = filter;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_createFind.js
  function createFind(findIndexFunc) {
    return function(collection, predicate, fromIndex) {
      var iterable = Object(collection);
      if (!isArrayLike_default(collection)) {
        var iteratee = baseIteratee_default(predicate, 3);
        collection = keys_default(collection);
        predicate = function(key) {
          return iteratee(iterable[key], key, iterable);
        };
      }
      var index = findIndexFunc(collection, predicate, fromIndex);
      return index > -1 ? iterable[iteratee ? collection[index] : index] : void 0;
    };
  }
  var createFind_default = createFind;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/findIndex.js
  var nativeMax2 = Math.max;
  function findIndex(array, predicate, fromIndex) {
    var length = array == null ? 0 : array.length;
    if (!length) {
      return -1;
    }
    var index = fromIndex == null ? 0 : toInteger_default(fromIndex);
    if (index < 0) {
      index = nativeMax2(length + index, 0);
    }
    return baseFindIndex_default(array, baseIteratee_default(predicate, 3), index);
  }
  var findIndex_default = findIndex;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/find.js
  var find = createFind_default(findIndex_default);
  var find_default = find;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/head.js
  function head(array) {
    return array && array.length ? array[0] : void 0;
  }
  var head_default = head;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseMap.js
  function baseMap(collection, iteratee) {
    var index = -1, result = isArrayLike_default(collection) ? Array(collection.length) : [];
    baseEach_default(collection, function(value, key, collection2) {
      result[++index] = iteratee(value, key, collection2);
    });
    return result;
  }
  var baseMap_default = baseMap;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/map.js
  function map(collection, iteratee) {
    var func = isArray_default(collection) ? arrayMap_default : baseMap_default;
    return func(collection, baseIteratee_default(iteratee, 3));
  }
  var map_default = map;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/flatMap.js
  function flatMap(collection, iteratee) {
    return baseFlatten_default(map_default(collection, iteratee), 1);
  }
  var flatMap_default = flatMap;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/groupBy.js
  var objectProto18 = Object.prototype;
  var hasOwnProperty15 = objectProto18.hasOwnProperty;
  var groupBy = createAggregator_default(function(result, value, key) {
    if (hasOwnProperty15.call(result, key)) {
      result[key].push(value);
    } else {
      baseAssignValue_default(result, key, [value]);
    }
  });
  var groupBy_default = groupBy;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseHas.js
  var objectProto19 = Object.prototype;
  var hasOwnProperty16 = objectProto19.hasOwnProperty;
  function baseHas(object, key) {
    return object != null && hasOwnProperty16.call(object, key);
  }
  var baseHas_default = baseHas;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/has.js
  function has(object, path) {
    return object != null && hasPath_default(object, path, baseHas_default);
  }
  var has_default = has;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isString.js
  var stringTag5 = "[object String]";
  function isString(value) {
    return typeof value == "string" || !isArray_default(value) && isObjectLike_default(value) && baseGetTag_default(value) == stringTag5;
  }
  var isString_default = isString;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseValues.js
  function baseValues(object, props) {
    return arrayMap_default(props, function(key) {
      return object[key];
    });
  }
  var baseValues_default = baseValues;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/values.js
  function values(object) {
    return object == null ? [] : baseValues_default(object, keys_default(object));
  }
  var values_default = values;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/includes.js
  var nativeMax3 = Math.max;
  function includes(collection, value, fromIndex, guard) {
    collection = isArrayLike_default(collection) ? collection : values_default(collection);
    fromIndex = fromIndex && !guard ? toInteger_default(fromIndex) : 0;
    var length = collection.length;
    if (fromIndex < 0) {
      fromIndex = nativeMax3(length + fromIndex, 0);
    }
    return isString_default(collection) ? fromIndex <= length && collection.indexOf(value, fromIndex) > -1 : !!length && baseIndexOf_default(collection, value, fromIndex) > -1;
  }
  var includes_default = includes;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/indexOf.js
  var nativeMax4 = Math.max;
  function indexOf(array, value, fromIndex) {
    var length = array == null ? 0 : array.length;
    if (!length) {
      return -1;
    }
    var index = fromIndex == null ? 0 : toInteger_default(fromIndex);
    if (index < 0) {
      index = nativeMax4(length + index, 0);
    }
    return baseIndexOf_default(array, value, index);
  }
  var indexOf_default = indexOf;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isEmpty.js
  var mapTag7 = "[object Map]";
  var setTag7 = "[object Set]";
  var objectProto20 = Object.prototype;
  var hasOwnProperty17 = objectProto20.hasOwnProperty;
  function isEmpty(value) {
    if (value == null) {
      return true;
    }
    if (isArrayLike_default(value) && (isArray_default(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer_default(value) || isTypedArray_default(value) || isArguments_default(value))) {
      return !value.length;
    }
    var tag2 = getTag_default(value);
    if (tag2 == mapTag7 || tag2 == setTag7) {
      return !value.size;
    }
    if (isPrototype_default(value)) {
      return !baseKeys_default(value).length;
    }
    for (var key in value) {
      if (hasOwnProperty17.call(value, key)) {
        return false;
      }
    }
    return true;
  }
  var isEmpty_default = isEmpty;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseIsRegExp.js
  var regexpTag5 = "[object RegExp]";
  function baseIsRegExp(value) {
    return isObjectLike_default(value) && baseGetTag_default(value) == regexpTag5;
  }
  var baseIsRegExp_default = baseIsRegExp;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isRegExp.js
  var nodeIsRegExp = nodeUtil_default && nodeUtil_default.isRegExp;
  var isRegExp = nodeIsRegExp ? baseUnary_default(nodeIsRegExp) : baseIsRegExp_default;
  var isRegExp_default = isRegExp;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/isUndefined.js
  function isUndefined(value) {
    return value === void 0;
  }
  var isUndefined_default = isUndefined;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/negate.js
  var FUNC_ERROR_TEXT2 = "Expected a function";
  function negate(predicate) {
    if (typeof predicate != "function") {
      throw new TypeError(FUNC_ERROR_TEXT2);
    }
    return function() {
      var args = arguments;
      switch (args.length) {
        case 0:
          return !predicate.call(this);
        case 1:
          return !predicate.call(this, args[0]);
        case 2:
          return !predicate.call(this, args[0], args[1]);
        case 3:
          return !predicate.call(this, args[0], args[1], args[2]);
      }
      return !predicate.apply(this, args);
    };
  }
  var negate_default = negate;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseSet.js
  function baseSet(object, path, value, customizer) {
    if (!isObject_default(object)) {
      return object;
    }
    path = castPath_default(path, object);
    var index = -1, length = path.length, lastIndex = length - 1, nested = object;
    while (nested != null && ++index < length) {
      var key = toKey_default(path[index]), newValue = value;
      if (key === "__proto__" || key === "constructor" || key === "prototype") {
        return object;
      }
      if (index != lastIndex) {
        var objValue = nested[key];
        newValue = customizer ? customizer(objValue, key, nested) : void 0;
        if (newValue === void 0) {
          newValue = isObject_default(objValue) ? objValue : isIndex_default(path[index + 1]) ? [] : {};
        }
      }
      assignValue_default(nested, key, newValue);
      nested = nested[key];
    }
    return object;
  }
  var baseSet_default = baseSet;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_basePickBy.js
  function basePickBy(object, paths, predicate) {
    var index = -1, length = paths.length, result = {};
    while (++index < length) {
      var path = paths[index], value = baseGet_default(object, path);
      if (predicate(value, path)) {
        baseSet_default(result, castPath_default(path, object), value);
      }
    }
    return result;
  }
  var basePickBy_default = basePickBy;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/pickBy.js
  function pickBy(object, predicate) {
    if (object == null) {
      return {};
    }
    var props = arrayMap_default(getAllKeysIn_default(object), function(prop) {
      return [prop];
    });
    predicate = baseIteratee_default(predicate);
    return basePickBy_default(object, props, function(value, path) {
      return predicate(value, path[0]);
    });
  }
  var pickBy_default = pickBy;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseReduce.js
  function baseReduce(collection, iteratee, accumulator, initAccum, eachFunc) {
    eachFunc(collection, function(value, index, collection2) {
      accumulator = initAccum ? (initAccum = false, value) : iteratee(accumulator, value, index, collection2);
    });
    return accumulator;
  }
  var baseReduce_default = baseReduce;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/reduce.js
  function reduce(collection, iteratee, accumulator) {
    var func = isArray_default(collection) ? arrayReduce_default : baseReduce_default, initAccum = arguments.length < 3;
    return func(collection, baseIteratee_default(iteratee, 4), accumulator, initAccum, baseEach_default);
  }
  var reduce_default = reduce;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/reject.js
  function reject(collection, predicate) {
    var func = isArray_default(collection) ? arrayFilter_default : baseFilter_default;
    return func(collection, negate_default(baseIteratee_default(predicate, 3)));
  }
  var reject_default = reject;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseSome.js
  function baseSome(collection, predicate) {
    var result;
    baseEach_default(collection, function(value, index, collection2) {
      result = predicate(value, index, collection2);
      return !result;
    });
    return !!result;
  }
  var baseSome_default = baseSome;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/some.js
  function some(collection, predicate, guard) {
    var func = isArray_default(collection) ? arraySome_default : baseSome_default;
    if (guard && isIterateeCall_default(collection, predicate, guard)) {
      predicate = void 0;
    }
    return func(collection, baseIteratee_default(predicate, 3));
  }
  var some_default = some;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_createSet.js
  var INFINITY4 = 1 / 0;
  var createSet = !(Set_default && 1 / setToArray_default(new Set_default([, -0]))[1] == INFINITY4) ? noop_default : function(values2) {
    return new Set_default(values2);
  };
  var createSet_default = createSet;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/_baseUniq.js
  var LARGE_ARRAY_SIZE3 = 200;
  function baseUniq(array, iteratee, comparator) {
    var index = -1, includes2 = arrayIncludes_default, length = array.length, isCommon = true, result = [], seen = result;
    if (comparator) {
      isCommon = false;
      includes2 = arrayIncludesWith_default;
    } else if (length >= LARGE_ARRAY_SIZE3) {
      var set = iteratee ? null : createSet_default(array);
      if (set) {
        return setToArray_default(set);
      }
      isCommon = false;
      includes2 = cacheHas_default;
      seen = new SetCache_default();
    } else {
      seen = iteratee ? [] : result;
    }
    outer:
      while (++index < length) {
        var value = array[index], computed = iteratee ? iteratee(value) : value;
        value = comparator || value !== 0 ? value : 0;
        if (isCommon && computed === computed) {
          var seenIndex = seen.length;
          while (seenIndex--) {
            if (seen[seenIndex] === computed) {
              continue outer;
            }
          }
          if (iteratee) {
            seen.push(computed);
          }
          result.push(value);
        } else if (!includes2(seen, computed, comparator)) {
          if (seen !== result) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
    return result;
  }
  var baseUniq_default = baseUniq;

  // node_modules/.pnpm/lodash-es@4.17.21/node_modules/lodash-es/uniq.js
  function uniq(array) {
    return array && array.length ? baseUniq_default(array) : [];
  }
  var uniq_default = uniq;

  // node_modules/.pnpm/@chevrotain+utils@11.0.3/node_modules/@chevrotain/utils/lib/src/print.js
  function PRINT_ERROR(msg) {
    if (console && console.error) {
      console.error(`Error: ${msg}`);
    }
  }
  function PRINT_WARNING(msg) {
    if (console && console.warn) {
      console.warn(`Warning: ${msg}`);
    }
  }

  // node_modules/.pnpm/@chevrotain+utils@11.0.3/node_modules/@chevrotain/utils/lib/src/timer.js
  function timer(func) {
    const start = (/* @__PURE__ */ new Date()).getTime();
    const val = func();
    const end = (/* @__PURE__ */ new Date()).getTime();
    const total = end - start;
    return { time: total, value: val };
  }

  // node_modules/.pnpm/@chevrotain+utils@11.0.3/node_modules/@chevrotain/utils/lib/src/to-fast-properties.js
  function toFastProperties(toBecomeFast) {
    function FakeConstructor() {
    }
    FakeConstructor.prototype = toBecomeFast;
    const fakeInstance = new FakeConstructor();
    function fakeAccess() {
      return typeof fakeInstance.bar;
    }
    fakeAccess();
    fakeAccess();
    if (1)
      return toBecomeFast;
    (0, eval)(toBecomeFast);
  }

  // node_modules/.pnpm/@chevrotain+gast@11.0.3/node_modules/@chevrotain/gast/lib/src/model.js
  function tokenLabel(tokType) {
    if (hasTokenLabel(tokType)) {
      return tokType.LABEL;
    } else {
      return tokType.name;
    }
  }
  function hasTokenLabel(obj) {
    return isString_default(obj.LABEL) && obj.LABEL !== "";
  }
  var AbstractProduction = class {
    get definition() {
      return this._definition;
    }
    set definition(value) {
      this._definition = value;
    }
    constructor(_definition) {
      this._definition = _definition;
    }
    accept(visitor) {
      visitor.visit(this);
      forEach_default(this.definition, (prod) => {
        prod.accept(visitor);
      });
    }
  };
  var NonTerminal = class extends AbstractProduction {
    constructor(options) {
      super([]);
      this.idx = 1;
      assign_default(this, pickBy_default(options, (v) => v !== void 0));
    }
    set definition(definition) {
    }
    get definition() {
      if (this.referencedRule !== void 0) {
        return this.referencedRule.definition;
      }
      return [];
    }
    accept(visitor) {
      visitor.visit(this);
    }
  };
  var Rule = class extends AbstractProduction {
    constructor(options) {
      super(options.definition);
      this.orgText = "";
      assign_default(this, pickBy_default(options, (v) => v !== void 0));
    }
  };
  var Alternative = class extends AbstractProduction {
    constructor(options) {
      super(options.definition);
      this.ignoreAmbiguities = false;
      assign_default(this, pickBy_default(options, (v) => v !== void 0));
    }
  };
  var Option = class extends AbstractProduction {
    constructor(options) {
      super(options.definition);
      this.idx = 1;
      assign_default(this, pickBy_default(options, (v) => v !== void 0));
    }
  };
  var RepetitionMandatory = class extends AbstractProduction {
    constructor(options) {
      super(options.definition);
      this.idx = 1;
      assign_default(this, pickBy_default(options, (v) => v !== void 0));
    }
  };
  var RepetitionMandatoryWithSeparator = class extends AbstractProduction {
    constructor(options) {
      super(options.definition);
      this.idx = 1;
      assign_default(this, pickBy_default(options, (v) => v !== void 0));
    }
  };
  var Repetition = class extends AbstractProduction {
    constructor(options) {
      super(options.definition);
      this.idx = 1;
      assign_default(this, pickBy_default(options, (v) => v !== void 0));
    }
  };
  var RepetitionWithSeparator = class extends AbstractProduction {
    constructor(options) {
      super(options.definition);
      this.idx = 1;
      assign_default(this, pickBy_default(options, (v) => v !== void 0));
    }
  };
  var Alternation = class extends AbstractProduction {
    get definition() {
      return this._definition;
    }
    set definition(value) {
      this._definition = value;
    }
    constructor(options) {
      super(options.definition);
      this.idx = 1;
      this.ignoreAmbiguities = false;
      this.hasPredicates = false;
      assign_default(this, pickBy_default(options, (v) => v !== void 0));
    }
  };
  var Terminal = class {
    constructor(options) {
      this.idx = 1;
      assign_default(this, pickBy_default(options, (v) => v !== void 0));
    }
    accept(visitor) {
      visitor.visit(this);
    }
  };
  function serializeGrammar(topRules) {
    return map_default(topRules, serializeProduction);
  }
  function serializeProduction(node) {
    function convertDefinition(definition) {
      return map_default(definition, serializeProduction);
    }
    if (node instanceof NonTerminal) {
      const serializedNonTerminal = {
        type: "NonTerminal",
        name: node.nonTerminalName,
        idx: node.idx
      };
      if (isString_default(node.label)) {
        serializedNonTerminal.label = node.label;
      }
      return serializedNonTerminal;
    } else if (node instanceof Alternative) {
      return {
        type: "Alternative",
        definition: convertDefinition(node.definition)
      };
    } else if (node instanceof Option) {
      return {
        type: "Option",
        idx: node.idx,
        definition: convertDefinition(node.definition)
      };
    } else if (node instanceof RepetitionMandatory) {
      return {
        type: "RepetitionMandatory",
        idx: node.idx,
        definition: convertDefinition(node.definition)
      };
    } else if (node instanceof RepetitionMandatoryWithSeparator) {
      return {
        type: "RepetitionMandatoryWithSeparator",
        idx: node.idx,
        separator: serializeProduction(new Terminal({ terminalType: node.separator })),
        definition: convertDefinition(node.definition)
      };
    } else if (node instanceof RepetitionWithSeparator) {
      return {
        type: "RepetitionWithSeparator",
        idx: node.idx,
        separator: serializeProduction(new Terminal({ terminalType: node.separator })),
        definition: convertDefinition(node.definition)
      };
    } else if (node instanceof Repetition) {
      return {
        type: "Repetition",
        idx: node.idx,
        definition: convertDefinition(node.definition)
      };
    } else if (node instanceof Alternation) {
      return {
        type: "Alternation",
        idx: node.idx,
        definition: convertDefinition(node.definition)
      };
    } else if (node instanceof Terminal) {
      const serializedTerminal = {
        type: "Terminal",
        name: node.terminalType.name,
        label: tokenLabel(node.terminalType),
        idx: node.idx
      };
      if (isString_default(node.label)) {
        serializedTerminal.terminalLabel = node.label;
      }
      const pattern = node.terminalType.PATTERN;
      if (node.terminalType.PATTERN) {
        serializedTerminal.pattern = isRegExp_default(pattern) ? pattern.source : pattern;
      }
      return serializedTerminal;
    } else if (node instanceof Rule) {
      return {
        type: "Rule",
        name: node.name,
        orgText: node.orgText,
        definition: convertDefinition(node.definition)
      };
    } else {
      throw Error("non exhaustive match");
    }
  }

  // node_modules/.pnpm/@chevrotain+gast@11.0.3/node_modules/@chevrotain/gast/lib/src/visitor.js
  var GAstVisitor = class {
    visit(node) {
      const nodeAny = node;
      switch (nodeAny.constructor) {
        case NonTerminal:
          return this.visitNonTerminal(nodeAny);
        case Alternative:
          return this.visitAlternative(nodeAny);
        case Option:
          return this.visitOption(nodeAny);
        case RepetitionMandatory:
          return this.visitRepetitionMandatory(nodeAny);
        case RepetitionMandatoryWithSeparator:
          return this.visitRepetitionMandatoryWithSeparator(nodeAny);
        case RepetitionWithSeparator:
          return this.visitRepetitionWithSeparator(nodeAny);
        case Repetition:
          return this.visitRepetition(nodeAny);
        case Alternation:
          return this.visitAlternation(nodeAny);
        case Terminal:
          return this.visitTerminal(nodeAny);
        case Rule:
          return this.visitRule(nodeAny);
        /* c8 ignore next 2 */
        default:
          throw Error("non exhaustive match");
      }
    }
    /* c8 ignore next */
    visitNonTerminal(node) {
    }
    /* c8 ignore next */
    visitAlternative(node) {
    }
    /* c8 ignore next */
    visitOption(node) {
    }
    /* c8 ignore next */
    visitRepetition(node) {
    }
    /* c8 ignore next */
    visitRepetitionMandatory(node) {
    }
    /* c8 ignore next 3 */
    visitRepetitionMandatoryWithSeparator(node) {
    }
    /* c8 ignore next */
    visitRepetitionWithSeparator(node) {
    }
    /* c8 ignore next */
    visitAlternation(node) {
    }
    /* c8 ignore next */
    visitTerminal(node) {
    }
    /* c8 ignore next */
    visitRule(node) {
    }
  };

  // node_modules/.pnpm/@chevrotain+gast@11.0.3/node_modules/@chevrotain/gast/lib/src/helpers.js
  function isSequenceProd(prod) {
    return prod instanceof Alternative || prod instanceof Option || prod instanceof Repetition || prod instanceof RepetitionMandatory || prod instanceof RepetitionMandatoryWithSeparator || prod instanceof RepetitionWithSeparator || prod instanceof Terminal || prod instanceof Rule;
  }
  function isOptionalProd(prod, alreadyVisited = []) {
    const isDirectlyOptional = prod instanceof Option || prod instanceof Repetition || prod instanceof RepetitionWithSeparator;
    if (isDirectlyOptional) {
      return true;
    }
    if (prod instanceof Alternation) {
      return some_default(prod.definition, (subProd) => {
        return isOptionalProd(subProd, alreadyVisited);
      });
    } else if (prod instanceof NonTerminal && includes_default(alreadyVisited, prod)) {
      return false;
    } else if (prod instanceof AbstractProduction) {
      if (prod instanceof NonTerminal) {
        alreadyVisited.push(prod);
      }
      return every_default(prod.definition, (subProd) => {
        return isOptionalProd(subProd, alreadyVisited);
      });
    } else {
      return false;
    }
  }
  function isBranchingProd(prod) {
    return prod instanceof Alternation;
  }
  function getProductionDslName(prod) {
    if (prod instanceof NonTerminal) {
      return "SUBRULE";
    } else if (prod instanceof Option) {
      return "OPTION";
    } else if (prod instanceof Alternation) {
      return "OR";
    } else if (prod instanceof RepetitionMandatory) {
      return "AT_LEAST_ONE";
    } else if (prod instanceof RepetitionMandatoryWithSeparator) {
      return "AT_LEAST_ONE_SEP";
    } else if (prod instanceof RepetitionWithSeparator) {
      return "MANY_SEP";
    } else if (prod instanceof Repetition) {
      return "MANY";
    } else if (prod instanceof Terminal) {
      return "CONSUME";
    } else {
      throw Error("non exhaustive match");
    }
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/grammar/rest.js
  var RestWalker = class {
    walk(prod, prevRest = []) {
      forEach_default(prod.definition, (subProd, index) => {
        const currRest = drop_default(prod.definition, index + 1);
        if (subProd instanceof NonTerminal) {
          this.walkProdRef(subProd, currRest, prevRest);
        } else if (subProd instanceof Terminal) {
          this.walkTerminal(subProd, currRest, prevRest);
        } else if (subProd instanceof Alternative) {
          this.walkFlat(subProd, currRest, prevRest);
        } else if (subProd instanceof Option) {
          this.walkOption(subProd, currRest, prevRest);
        } else if (subProd instanceof RepetitionMandatory) {
          this.walkAtLeastOne(subProd, currRest, prevRest);
        } else if (subProd instanceof RepetitionMandatoryWithSeparator) {
          this.walkAtLeastOneSep(subProd, currRest, prevRest);
        } else if (subProd instanceof RepetitionWithSeparator) {
          this.walkManySep(subProd, currRest, prevRest);
        } else if (subProd instanceof Repetition) {
          this.walkMany(subProd, currRest, prevRest);
        } else if (subProd instanceof Alternation) {
          this.walkOr(subProd, currRest, prevRest);
        } else {
          throw Error("non exhaustive match");
        }
      });
    }
    walkTerminal(terminal, currRest, prevRest) {
    }
    walkProdRef(refProd, currRest, prevRest) {
    }
    walkFlat(flatProd, currRest, prevRest) {
      const fullOrRest = currRest.concat(prevRest);
      this.walk(flatProd, fullOrRest);
    }
    walkOption(optionProd, currRest, prevRest) {
      const fullOrRest = currRest.concat(prevRest);
      this.walk(optionProd, fullOrRest);
    }
    walkAtLeastOne(atLeastOneProd, currRest, prevRest) {
      const fullAtLeastOneRest = [
        new Option({ definition: atLeastOneProd.definition })
      ].concat(currRest, prevRest);
      this.walk(atLeastOneProd, fullAtLeastOneRest);
    }
    walkAtLeastOneSep(atLeastOneSepProd, currRest, prevRest) {
      const fullAtLeastOneSepRest = restForRepetitionWithSeparator(atLeastOneSepProd, currRest, prevRest);
      this.walk(atLeastOneSepProd, fullAtLeastOneSepRest);
    }
    walkMany(manyProd, currRest, prevRest) {
      const fullManyRest = [
        new Option({ definition: manyProd.definition })
      ].concat(currRest, prevRest);
      this.walk(manyProd, fullManyRest);
    }
    walkManySep(manySepProd, currRest, prevRest) {
      const fullManySepRest = restForRepetitionWithSeparator(manySepProd, currRest, prevRest);
      this.walk(manySepProd, fullManySepRest);
    }
    walkOr(orProd, currRest, prevRest) {
      const fullOrRest = currRest.concat(prevRest);
      forEach_default(orProd.definition, (alt) => {
        const prodWrapper = new Alternative({ definition: [alt] });
        this.walk(prodWrapper, fullOrRest);
      });
    }
  };
  function restForRepetitionWithSeparator(repSepProd, currRest, prevRest) {
    const repSepRest = [
      new Option({
        definition: [
          new Terminal({ terminalType: repSepProd.separator })
        ].concat(repSepProd.definition)
      })
    ];
    const fullRepSepRest = repSepRest.concat(currRest, prevRest);
    return fullRepSepRest;
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/grammar/first.js
  function first(prod) {
    if (prod instanceof NonTerminal) {
      return first(prod.referencedRule);
    } else if (prod instanceof Terminal) {
      return firstForTerminal(prod);
    } else if (isSequenceProd(prod)) {
      return firstForSequence(prod);
    } else if (isBranchingProd(prod)) {
      return firstForBranching(prod);
    } else {
      throw Error("non exhaustive match");
    }
  }
  function firstForSequence(prod) {
    let firstSet = [];
    const seq = prod.definition;
    let nextSubProdIdx = 0;
    let hasInnerProdsRemaining = seq.length > nextSubProdIdx;
    let currSubProd;
    let isLastInnerProdOptional = true;
    while (hasInnerProdsRemaining && isLastInnerProdOptional) {
      currSubProd = seq[nextSubProdIdx];
      isLastInnerProdOptional = isOptionalProd(currSubProd);
      firstSet = firstSet.concat(first(currSubProd));
      nextSubProdIdx = nextSubProdIdx + 1;
      hasInnerProdsRemaining = seq.length > nextSubProdIdx;
    }
    return uniq_default(firstSet);
  }
  function firstForBranching(prod) {
    const allAlternativesFirsts = map_default(prod.definition, (innerProd) => {
      return first(innerProd);
    });
    return uniq_default(flatten_default(allAlternativesFirsts));
  }
  function firstForTerminal(terminal) {
    return [terminal.terminalType];
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/constants.js
  var IN = "_~IN~_";

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/grammar/follow.js
  var ResyncFollowsWalker = class extends RestWalker {
    constructor(topProd) {
      super();
      this.topProd = topProd;
      this.follows = {};
    }
    startWalking() {
      this.walk(this.topProd);
      return this.follows;
    }
    walkTerminal(terminal, currRest, prevRest) {
    }
    walkProdRef(refProd, currRest, prevRest) {
      const followName = buildBetweenProdsFollowPrefix(refProd.referencedRule, refProd.idx) + this.topProd.name;
      const fullRest = currRest.concat(prevRest);
      const restProd = new Alternative({ definition: fullRest });
      const t_in_topProd_follows = first(restProd);
      this.follows[followName] = t_in_topProd_follows;
    }
  };
  function computeAllProdsFollows(topProductions) {
    const reSyncFollows = {};
    forEach_default(topProductions, (topProd) => {
      const currRefsFollow = new ResyncFollowsWalker(topProd).startWalking();
      assign_default(reSyncFollows, currRefsFollow);
    });
    return reSyncFollows;
  }
  function buildBetweenProdsFollowPrefix(inner, occurenceInParent) {
    return inner.name + occurenceInParent + IN;
  }

  // node_modules/.pnpm/@chevrotain+regexp-to-ast@11.0.3/node_modules/@chevrotain/regexp-to-ast/lib/src/utils.js
  function cc(char) {
    return char.charCodeAt(0);
  }
  function insertToSet(item, set) {
    if (Array.isArray(item)) {
      item.forEach(function(subItem) {
        set.push(subItem);
      });
    } else {
      set.push(item);
    }
  }
  function addFlag(flagObj, flagKey) {
    if (flagObj[flagKey] === true) {
      throw "duplicate flag " + flagKey;
    }
    const x = flagObj[flagKey];
    flagObj[flagKey] = true;
  }
  function ASSERT_EXISTS(obj) {
    if (obj === void 0) {
      throw Error("Internal Error - Should never get here!");
    }
    return true;
  }
  function ASSERT_NEVER_REACH_HERE() {
    throw Error("Internal Error - Should never get here!");
  }
  function isCharacter(obj) {
    return obj["type"] === "Character";
  }

  // node_modules/.pnpm/@chevrotain+regexp-to-ast@11.0.3/node_modules/@chevrotain/regexp-to-ast/lib/src/character-classes.js
  var digitsCharCodes = [];
  for (let i = cc("0"); i <= cc("9"); i++) {
    digitsCharCodes.push(i);
  }
  var wordCharCodes = [cc("_")].concat(digitsCharCodes);
  for (let i = cc("a"); i <= cc("z"); i++) {
    wordCharCodes.push(i);
  }
  for (let i = cc("A"); i <= cc("Z"); i++) {
    wordCharCodes.push(i);
  }
  var whitespaceCodes = [
    cc(" "),
    cc("\f"),
    cc("\n"),
    cc("\r"),
    cc("	"),
    cc("\v"),
    cc("	"),
    cc("\xA0"),
    cc("\u1680"),
    cc("\u2000"),
    cc("\u2001"),
    cc("\u2002"),
    cc("\u2003"),
    cc("\u2004"),
    cc("\u2005"),
    cc("\u2006"),
    cc("\u2007"),
    cc("\u2008"),
    cc("\u2009"),
    cc("\u200A"),
    cc("\u2028"),
    cc("\u2029"),
    cc("\u202F"),
    cc("\u205F"),
    cc("\u3000"),
    cc("\uFEFF")
  ];

  // node_modules/.pnpm/@chevrotain+regexp-to-ast@11.0.3/node_modules/@chevrotain/regexp-to-ast/lib/src/regexp-parser.js
  var hexDigitPattern = /[0-9a-fA-F]/;
  var decimalPattern = /[0-9]/;
  var decimalPatternNoZero = /[1-9]/;
  var RegExpParser = class {
    constructor() {
      this.idx = 0;
      this.input = "";
      this.groupIdx = 0;
    }
    saveState() {
      return {
        idx: this.idx,
        input: this.input,
        groupIdx: this.groupIdx
      };
    }
    restoreState(newState) {
      this.idx = newState.idx;
      this.input = newState.input;
      this.groupIdx = newState.groupIdx;
    }
    pattern(input) {
      this.idx = 0;
      this.input = input;
      this.groupIdx = 0;
      this.consumeChar("/");
      const value = this.disjunction();
      this.consumeChar("/");
      const flags = {
        type: "Flags",
        loc: { begin: this.idx, end: input.length },
        global: false,
        ignoreCase: false,
        multiLine: false,
        unicode: false,
        sticky: false
      };
      while (this.isRegExpFlag()) {
        switch (this.popChar()) {
          case "g":
            addFlag(flags, "global");
            break;
          case "i":
            addFlag(flags, "ignoreCase");
            break;
          case "m":
            addFlag(flags, "multiLine");
            break;
          case "u":
            addFlag(flags, "unicode");
            break;
          case "y":
            addFlag(flags, "sticky");
            break;
        }
      }
      if (this.idx !== this.input.length) {
        throw Error("Redundant input: " + this.input.substring(this.idx));
      }
      return {
        type: "Pattern",
        flags,
        value,
        loc: this.loc(0)
      };
    }
    disjunction() {
      const alts = [];
      const begin = this.idx;
      alts.push(this.alternative());
      while (this.peekChar() === "|") {
        this.consumeChar("|");
        alts.push(this.alternative());
      }
      return { type: "Disjunction", value: alts, loc: this.loc(begin) };
    }
    alternative() {
      const terms = [];
      const begin = this.idx;
      while (this.isTerm()) {
        terms.push(this.term());
      }
      return { type: "Alternative", value: terms, loc: this.loc(begin) };
    }
    term() {
      if (this.isAssertion()) {
        return this.assertion();
      } else {
        return this.atom();
      }
    }
    assertion() {
      const begin = this.idx;
      switch (this.popChar()) {
        case "^":
          return {
            type: "StartAnchor",
            loc: this.loc(begin)
          };
        case "$":
          return { type: "EndAnchor", loc: this.loc(begin) };
        // '\b' or '\B'
        case "\\":
          switch (this.popChar()) {
            case "b":
              return {
                type: "WordBoundary",
                loc: this.loc(begin)
              };
            case "B":
              return {
                type: "NonWordBoundary",
                loc: this.loc(begin)
              };
          }
          throw Error("Invalid Assertion Escape");
        // '(?=' or '(?!'
        case "(":
          this.consumeChar("?");
          let type;
          switch (this.popChar()) {
            case "=":
              type = "Lookahead";
              break;
            case "!":
              type = "NegativeLookahead";
              break;
          }
          ASSERT_EXISTS(type);
          const disjunction = this.disjunction();
          this.consumeChar(")");
          return {
            type,
            value: disjunction,
            loc: this.loc(begin)
          };
      }
      return ASSERT_NEVER_REACH_HERE();
    }
    quantifier(isBacktracking = false) {
      let range = void 0;
      const begin = this.idx;
      switch (this.popChar()) {
        case "*":
          range = {
            atLeast: 0,
            atMost: Infinity
          };
          break;
        case "+":
          range = {
            atLeast: 1,
            atMost: Infinity
          };
          break;
        case "?":
          range = {
            atLeast: 0,
            atMost: 1
          };
          break;
        case "{":
          const atLeast = this.integerIncludingZero();
          switch (this.popChar()) {
            case "}":
              range = {
                atLeast,
                atMost: atLeast
              };
              break;
            case ",":
              let atMost;
              if (this.isDigit()) {
                atMost = this.integerIncludingZero();
                range = {
                  atLeast,
                  atMost
                };
              } else {
                range = {
                  atLeast,
                  atMost: Infinity
                };
              }
              this.consumeChar("}");
              break;
          }
          if (isBacktracking === true && range === void 0) {
            return void 0;
          }
          ASSERT_EXISTS(range);
          break;
      }
      if (isBacktracking === true && range === void 0) {
        return void 0;
      }
      if (ASSERT_EXISTS(range)) {
        if (this.peekChar(0) === "?") {
          this.consumeChar("?");
          range.greedy = false;
        } else {
          range.greedy = true;
        }
        range.type = "Quantifier";
        range.loc = this.loc(begin);
        return range;
      }
    }
    atom() {
      let atom;
      const begin = this.idx;
      switch (this.peekChar()) {
        case ".":
          atom = this.dotAll();
          break;
        case "\\":
          atom = this.atomEscape();
          break;
        case "[":
          atom = this.characterClass();
          break;
        case "(":
          atom = this.group();
          break;
      }
      if (atom === void 0 && this.isPatternCharacter()) {
        atom = this.patternCharacter();
      }
      if (ASSERT_EXISTS(atom)) {
        atom.loc = this.loc(begin);
        if (this.isQuantifier()) {
          atom.quantifier = this.quantifier();
        }
        return atom;
      }
      return ASSERT_NEVER_REACH_HERE();
    }
    dotAll() {
      this.consumeChar(".");
      return {
        type: "Set",
        complement: true,
        value: [cc("\n"), cc("\r"), cc("\u2028"), cc("\u2029")]
      };
    }
    atomEscape() {
      this.consumeChar("\\");
      switch (this.peekChar()) {
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          return this.decimalEscapeAtom();
        case "d":
        case "D":
        case "s":
        case "S":
        case "w":
        case "W":
          return this.characterClassEscape();
        case "f":
        case "n":
        case "r":
        case "t":
        case "v":
          return this.controlEscapeAtom();
        case "c":
          return this.controlLetterEscapeAtom();
        case "0":
          return this.nulCharacterAtom();
        case "x":
          return this.hexEscapeSequenceAtom();
        case "u":
          return this.regExpUnicodeEscapeSequenceAtom();
        default:
          return this.identityEscapeAtom();
      }
    }
    decimalEscapeAtom() {
      const value = this.positiveInteger();
      return { type: "GroupBackReference", value };
    }
    characterClassEscape() {
      let set;
      let complement = false;
      switch (this.popChar()) {
        case "d":
          set = digitsCharCodes;
          break;
        case "D":
          set = digitsCharCodes;
          complement = true;
          break;
        case "s":
          set = whitespaceCodes;
          break;
        case "S":
          set = whitespaceCodes;
          complement = true;
          break;
        case "w":
          set = wordCharCodes;
          break;
        case "W":
          set = wordCharCodes;
          complement = true;
          break;
      }
      if (ASSERT_EXISTS(set)) {
        return { type: "Set", value: set, complement };
      }
      return ASSERT_NEVER_REACH_HERE();
    }
    controlEscapeAtom() {
      let escapeCode;
      switch (this.popChar()) {
        case "f":
          escapeCode = cc("\f");
          break;
        case "n":
          escapeCode = cc("\n");
          break;
        case "r":
          escapeCode = cc("\r");
          break;
        case "t":
          escapeCode = cc("	");
          break;
        case "v":
          escapeCode = cc("\v");
          break;
      }
      if (ASSERT_EXISTS(escapeCode)) {
        return { type: "Character", value: escapeCode };
      }
      return ASSERT_NEVER_REACH_HERE();
    }
    controlLetterEscapeAtom() {
      this.consumeChar("c");
      const letter = this.popChar();
      if (/[a-zA-Z]/.test(letter) === false) {
        throw Error("Invalid ");
      }
      const letterCode = letter.toUpperCase().charCodeAt(0) - 64;
      return { type: "Character", value: letterCode };
    }
    nulCharacterAtom() {
      this.consumeChar("0");
      return { type: "Character", value: cc("\0") };
    }
    hexEscapeSequenceAtom() {
      this.consumeChar("x");
      return this.parseHexDigits(2);
    }
    regExpUnicodeEscapeSequenceAtom() {
      this.consumeChar("u");
      return this.parseHexDigits(4);
    }
    identityEscapeAtom() {
      const escapedChar = this.popChar();
      return { type: "Character", value: cc(escapedChar) };
    }
    classPatternCharacterAtom() {
      switch (this.peekChar()) {
        // istanbul ignore next
        case "\n":
        // istanbul ignore next
        case "\r":
        // istanbul ignore next
        case "\u2028":
        // istanbul ignore next
        case "\u2029":
        // istanbul ignore next
        case "\\":
        // istanbul ignore next
        case "]":
          throw Error("TBD");
        default:
          const nextChar = this.popChar();
          return { type: "Character", value: cc(nextChar) };
      }
    }
    characterClass() {
      const set = [];
      let complement = false;
      this.consumeChar("[");
      if (this.peekChar(0) === "^") {
        this.consumeChar("^");
        complement = true;
      }
      while (this.isClassAtom()) {
        const from = this.classAtom();
        const isFromSingleChar = from.type === "Character";
        if (isCharacter(from) && this.isRangeDash()) {
          this.consumeChar("-");
          const to = this.classAtom();
          const isToSingleChar = to.type === "Character";
          if (isCharacter(to)) {
            if (to.value < from.value) {
              throw Error("Range out of order in character class");
            }
            set.push({ from: from.value, to: to.value });
          } else {
            insertToSet(from.value, set);
            set.push(cc("-"));
            insertToSet(to.value, set);
          }
        } else {
          insertToSet(from.value, set);
        }
      }
      this.consumeChar("]");
      return { type: "Set", complement, value: set };
    }
    classAtom() {
      switch (this.peekChar()) {
        // istanbul ignore next
        case "]":
        // istanbul ignore next
        case "\n":
        // istanbul ignore next
        case "\r":
        // istanbul ignore next
        case "\u2028":
        // istanbul ignore next
        case "\u2029":
          throw Error("TBD");
        case "\\":
          return this.classEscape();
        default:
          return this.classPatternCharacterAtom();
      }
    }
    classEscape() {
      this.consumeChar("\\");
      switch (this.peekChar()) {
        // Matches a backspace.
        // (Not to be confused with \b word boundary outside characterClass)
        case "b":
          this.consumeChar("b");
          return { type: "Character", value: cc("\b") };
        case "d":
        case "D":
        case "s":
        case "S":
        case "w":
        case "W":
          return this.characterClassEscape();
        case "f":
        case "n":
        case "r":
        case "t":
        case "v":
          return this.controlEscapeAtom();
        case "c":
          return this.controlLetterEscapeAtom();
        case "0":
          return this.nulCharacterAtom();
        case "x":
          return this.hexEscapeSequenceAtom();
        case "u":
          return this.regExpUnicodeEscapeSequenceAtom();
        default:
          return this.identityEscapeAtom();
      }
    }
    group() {
      let capturing = true;
      this.consumeChar("(");
      switch (this.peekChar(0)) {
        case "?":
          this.consumeChar("?");
          this.consumeChar(":");
          capturing = false;
          break;
        default:
          this.groupIdx++;
          break;
      }
      const value = this.disjunction();
      this.consumeChar(")");
      const groupAst = {
        type: "Group",
        capturing,
        value
      };
      if (capturing) {
        groupAst["idx"] = this.groupIdx;
      }
      return groupAst;
    }
    positiveInteger() {
      let number = this.popChar();
      if (decimalPatternNoZero.test(number) === false) {
        throw Error("Expecting a positive integer");
      }
      while (decimalPattern.test(this.peekChar(0))) {
        number += this.popChar();
      }
      return parseInt(number, 10);
    }
    integerIncludingZero() {
      let number = this.popChar();
      if (decimalPattern.test(number) === false) {
        throw Error("Expecting an integer");
      }
      while (decimalPattern.test(this.peekChar(0))) {
        number += this.popChar();
      }
      return parseInt(number, 10);
    }
    patternCharacter() {
      const nextChar = this.popChar();
      switch (nextChar) {
        // istanbul ignore next
        case "\n":
        // istanbul ignore next
        case "\r":
        // istanbul ignore next
        case "\u2028":
        // istanbul ignore next
        case "\u2029":
        // istanbul ignore next
        case "^":
        // istanbul ignore next
        case "$":
        // istanbul ignore next
        case "\\":
        // istanbul ignore next
        case ".":
        // istanbul ignore next
        case "*":
        // istanbul ignore next
        case "+":
        // istanbul ignore next
        case "?":
        // istanbul ignore next
        case "(":
        // istanbul ignore next
        case ")":
        // istanbul ignore next
        case "[":
        // istanbul ignore next
        case "|":
          throw Error("TBD");
        default:
          return { type: "Character", value: cc(nextChar) };
      }
    }
    isRegExpFlag() {
      switch (this.peekChar(0)) {
        case "g":
        case "i":
        case "m":
        case "u":
        case "y":
          return true;
        default:
          return false;
      }
    }
    isRangeDash() {
      return this.peekChar() === "-" && this.isClassAtom(1);
    }
    isDigit() {
      return decimalPattern.test(this.peekChar(0));
    }
    isClassAtom(howMuch = 0) {
      switch (this.peekChar(howMuch)) {
        case "]":
        case "\n":
        case "\r":
        case "\u2028":
        case "\u2029":
          return false;
        default:
          return true;
      }
    }
    isTerm() {
      return this.isAtom() || this.isAssertion();
    }
    isAtom() {
      if (this.isPatternCharacter()) {
        return true;
      }
      switch (this.peekChar(0)) {
        case ".":
        case "\\":
        // atomEscape
        case "[":
        // characterClass
        // TODO: isAtom must be called before isAssertion - disambiguate
        case "(":
          return true;
        default:
          return false;
      }
    }
    isAssertion() {
      switch (this.peekChar(0)) {
        case "^":
        case "$":
          return true;
        // '\b' or '\B'
        case "\\":
          switch (this.peekChar(1)) {
            case "b":
            case "B":
              return true;
            default:
              return false;
          }
        // '(?=' or '(?!'
        case "(":
          return this.peekChar(1) === "?" && (this.peekChar(2) === "=" || this.peekChar(2) === "!");
        default:
          return false;
      }
    }
    isQuantifier() {
      const prevState = this.saveState();
      try {
        return this.quantifier(true) !== void 0;
      } catch (e) {
        return false;
      } finally {
        this.restoreState(prevState);
      }
    }
    isPatternCharacter() {
      switch (this.peekChar()) {
        case "^":
        case "$":
        case "\\":
        case ".":
        case "*":
        case "+":
        case "?":
        case "(":
        case ")":
        case "[":
        case "|":
        case "/":
        case "\n":
        case "\r":
        case "\u2028":
        case "\u2029":
          return false;
        default:
          return true;
      }
    }
    parseHexDigits(howMany) {
      let hexString = "";
      for (let i = 0; i < howMany; i++) {
        const hexChar = this.popChar();
        if (hexDigitPattern.test(hexChar) === false) {
          throw Error("Expecting a HexDecimal digits");
        }
        hexString += hexChar;
      }
      const charCode = parseInt(hexString, 16);
      return { type: "Character", value: charCode };
    }
    peekChar(howMuch = 0) {
      return this.input[this.idx + howMuch];
    }
    popChar() {
      const nextChar = this.peekChar(0);
      this.consumeChar(void 0);
      return nextChar;
    }
    consumeChar(char) {
      if (char !== void 0 && this.input[this.idx] !== char) {
        throw Error("Expected: '" + char + "' but found: '" + this.input[this.idx] + "' at offset: " + this.idx);
      }
      if (this.idx >= this.input.length) {
        throw Error("Unexpected end of input");
      }
      this.idx++;
    }
    loc(begin) {
      return { begin, end: this.idx };
    }
  };

  // node_modules/.pnpm/@chevrotain+regexp-to-ast@11.0.3/node_modules/@chevrotain/regexp-to-ast/lib/src/base-regexp-visitor.js
  var BaseRegExpVisitor = class {
    visitChildren(node) {
      for (const key in node) {
        const child = node[key];
        if (node.hasOwnProperty(key)) {
          if (child.type !== void 0) {
            this.visit(child);
          } else if (Array.isArray(child)) {
            child.forEach((subChild) => {
              this.visit(subChild);
            }, this);
          }
        }
      }
    }
    visit(node) {
      switch (node.type) {
        case "Pattern":
          this.visitPattern(node);
          break;
        case "Flags":
          this.visitFlags(node);
          break;
        case "Disjunction":
          this.visitDisjunction(node);
          break;
        case "Alternative":
          this.visitAlternative(node);
          break;
        case "StartAnchor":
          this.visitStartAnchor(node);
          break;
        case "EndAnchor":
          this.visitEndAnchor(node);
          break;
        case "WordBoundary":
          this.visitWordBoundary(node);
          break;
        case "NonWordBoundary":
          this.visitNonWordBoundary(node);
          break;
        case "Lookahead":
          this.visitLookahead(node);
          break;
        case "NegativeLookahead":
          this.visitNegativeLookahead(node);
          break;
        case "Character":
          this.visitCharacter(node);
          break;
        case "Set":
          this.visitSet(node);
          break;
        case "Group":
          this.visitGroup(node);
          break;
        case "GroupBackReference":
          this.visitGroupBackReference(node);
          break;
        case "Quantifier":
          this.visitQuantifier(node);
          break;
      }
      this.visitChildren(node);
    }
    visitPattern(node) {
    }
    visitFlags(node) {
    }
    visitDisjunction(node) {
    }
    visitAlternative(node) {
    }
    // Assertion
    visitStartAnchor(node) {
    }
    visitEndAnchor(node) {
    }
    visitWordBoundary(node) {
    }
    visitNonWordBoundary(node) {
    }
    visitLookahead(node) {
    }
    visitNegativeLookahead(node) {
    }
    // atoms
    visitCharacter(node) {
    }
    visitSet(node) {
    }
    visitGroup(node) {
    }
    visitGroupBackReference(node) {
    }
    visitQuantifier(node) {
    }
  };

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/scan/reg_exp_parser.js
  var regExpAstCache = {};
  var regExpParser = new RegExpParser();
  function getRegExpAst(regExp) {
    const regExpStr = regExp.toString();
    if (regExpAstCache.hasOwnProperty(regExpStr)) {
      return regExpAstCache[regExpStr];
    } else {
      const regExpAst = regExpParser.pattern(regExpStr);
      regExpAstCache[regExpStr] = regExpAst;
      return regExpAst;
    }
  }
  function clearRegExpParserCache() {
    regExpAstCache = {};
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/scan/reg_exp.js
  var complementErrorMessage = "Complement Sets are not supported for first char optimization";
  var failedOptimizationPrefixMsg = 'Unable to use "first char" lexer optimizations:\n';
  function getOptimizedStartCodesIndices(regExp, ensureOptimizations = false) {
    try {
      const ast = getRegExpAst(regExp);
      const firstChars = firstCharOptimizedIndices(ast.value, {}, ast.flags.ignoreCase);
      return firstChars;
    } catch (e) {
      if (e.message === complementErrorMessage) {
        if (ensureOptimizations) {
          PRINT_WARNING(`${failedOptimizationPrefixMsg}	Unable to optimize: < ${regExp.toString()} >
	Complement Sets cannot be automatically optimized.
	This will disable the lexer's first char optimizations.
	See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#COMPLEMENT for details.`);
        }
      } else {
        let msgSuffix = "";
        if (ensureOptimizations) {
          msgSuffix = "\n	This will disable the lexer's first char optimizations.\n	See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#REGEXP_PARSING for details.";
        }
        PRINT_ERROR(`${failedOptimizationPrefixMsg}
	Failed parsing: < ${regExp.toString()} >
	Using the @chevrotain/regexp-to-ast library
	Please open an issue at: https://github.com/chevrotain/chevrotain/issues` + msgSuffix);
      }
    }
    return [];
  }
  function firstCharOptimizedIndices(ast, result, ignoreCase) {
    switch (ast.type) {
      case "Disjunction":
        for (let i = 0; i < ast.value.length; i++) {
          firstCharOptimizedIndices(ast.value[i], result, ignoreCase);
        }
        break;
      case "Alternative":
        const terms = ast.value;
        for (let i = 0; i < terms.length; i++) {
          const term = terms[i];
          switch (term.type) {
            case "EndAnchor":
            // A group back reference cannot affect potential starting char.
            // because if a back reference is the first production than automatically
            // the group being referenced has had to come BEFORE so its codes have already been added
            case "GroupBackReference":
            // assertions do not affect potential starting codes
            case "Lookahead":
            case "NegativeLookahead":
            case "StartAnchor":
            case "WordBoundary":
            case "NonWordBoundary":
              continue;
          }
          const atom = term;
          switch (atom.type) {
            case "Character":
              addOptimizedIdxToResult(atom.value, result, ignoreCase);
              break;
            case "Set":
              if (atom.complement === true) {
                throw Error(complementErrorMessage);
              }
              forEach_default(atom.value, (code) => {
                if (typeof code === "number") {
                  addOptimizedIdxToResult(code, result, ignoreCase);
                } else {
                  const range = code;
                  if (ignoreCase === true) {
                    for (let rangeCode = range.from; rangeCode <= range.to; rangeCode++) {
                      addOptimizedIdxToResult(rangeCode, result, ignoreCase);
                    }
                  } else {
                    for (let rangeCode = range.from; rangeCode <= range.to && rangeCode < minOptimizationVal; rangeCode++) {
                      addOptimizedIdxToResult(rangeCode, result, ignoreCase);
                    }
                    if (range.to >= minOptimizationVal) {
                      const minUnOptVal = range.from >= minOptimizationVal ? range.from : minOptimizationVal;
                      const maxUnOptVal = range.to;
                      const minOptIdx = charCodeToOptimizedIndex(minUnOptVal);
                      const maxOptIdx = charCodeToOptimizedIndex(maxUnOptVal);
                      for (let currOptIdx = minOptIdx; currOptIdx <= maxOptIdx; currOptIdx++) {
                        result[currOptIdx] = currOptIdx;
                      }
                    }
                  }
                }
              });
              break;
            case "Group":
              firstCharOptimizedIndices(atom.value, result, ignoreCase);
              break;
            /* istanbul ignore next */
            default:
              throw Error("Non Exhaustive Match");
          }
          const isOptionalQuantifier = atom.quantifier !== void 0 && atom.quantifier.atLeast === 0;
          if (
            // A group may be optional due to empty contents /(?:)/
            // or if everything inside it is optional /((a)?)/
            atom.type === "Group" && isWholeOptional(atom) === false || // If this term is not a group it may only be optional if it has an optional quantifier
            atom.type !== "Group" && isOptionalQuantifier === false
          ) {
            break;
          }
        }
        break;
      /* istanbul ignore next */
      default:
        throw Error("non exhaustive match!");
    }
    return values_default(result);
  }
  function addOptimizedIdxToResult(code, result, ignoreCase) {
    const optimizedCharIdx = charCodeToOptimizedIndex(code);
    result[optimizedCharIdx] = optimizedCharIdx;
    if (ignoreCase === true) {
      handleIgnoreCase(code, result);
    }
  }
  function handleIgnoreCase(code, result) {
    const char = String.fromCharCode(code);
    const upperChar = char.toUpperCase();
    if (upperChar !== char) {
      const optimizedCharIdx = charCodeToOptimizedIndex(upperChar.charCodeAt(0));
      result[optimizedCharIdx] = optimizedCharIdx;
    } else {
      const lowerChar = char.toLowerCase();
      if (lowerChar !== char) {
        const optimizedCharIdx = charCodeToOptimizedIndex(lowerChar.charCodeAt(0));
        result[optimizedCharIdx] = optimizedCharIdx;
      }
    }
  }
  function findCode(setNode, targetCharCodes) {
    return find_default(setNode.value, (codeOrRange) => {
      if (typeof codeOrRange === "number") {
        return includes_default(targetCharCodes, codeOrRange);
      } else {
        const range = codeOrRange;
        return find_default(targetCharCodes, (targetCode) => range.from <= targetCode && targetCode <= range.to) !== void 0;
      }
    });
  }
  function isWholeOptional(ast) {
    const quantifier = ast.quantifier;
    if (quantifier && quantifier.atLeast === 0) {
      return true;
    }
    if (!ast.value) {
      return false;
    }
    return isArray_default(ast.value) ? every_default(ast.value, isWholeOptional) : isWholeOptional(ast.value);
  }
  var CharCodeFinder = class extends BaseRegExpVisitor {
    constructor(targetCharCodes) {
      super();
      this.targetCharCodes = targetCharCodes;
      this.found = false;
    }
    visitChildren(node) {
      if (this.found === true) {
        return;
      }
      switch (node.type) {
        case "Lookahead":
          this.visitLookahead(node);
          return;
        case "NegativeLookahead":
          this.visitNegativeLookahead(node);
          return;
      }
      super.visitChildren(node);
    }
    visitCharacter(node) {
      if (includes_default(this.targetCharCodes, node.value)) {
        this.found = true;
      }
    }
    visitSet(node) {
      if (node.complement) {
        if (findCode(node, this.targetCharCodes) === void 0) {
          this.found = true;
        }
      } else {
        if (findCode(node, this.targetCharCodes) !== void 0) {
          this.found = true;
        }
      }
    }
  };
  function canMatchCharCode(charCodes, pattern) {
    if (pattern instanceof RegExp) {
      const ast = getRegExpAst(pattern);
      const charCodeFinder = new CharCodeFinder(charCodes);
      charCodeFinder.visit(ast);
      return charCodeFinder.found;
    } else {
      return find_default(pattern, (char) => {
        return includes_default(charCodes, char.charCodeAt(0));
      }) !== void 0;
    }
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/scan/lexer.js
  var PATTERN = "PATTERN";
  var DEFAULT_MODE = "defaultMode";
  var MODES = "modes";
  var SUPPORT_STICKY = typeof new RegExp("(?:)").sticky === "boolean";
  function analyzeTokenTypes(tokenTypes, options) {
    options = defaults_default(options, {
      useSticky: SUPPORT_STICKY,
      debug: false,
      safeMode: false,
      positionTracking: "full",
      lineTerminatorCharacters: ["\r", "\n"],
      tracer: (msg, action) => action()
    });
    const tracer = options.tracer;
    tracer("initCharCodeToOptimizedIndexMap", () => {
      initCharCodeToOptimizedIndexMap();
    });
    let onlyRelevantTypes;
    tracer("Reject Lexer.NA", () => {
      onlyRelevantTypes = reject_default(tokenTypes, (currType) => {
        return currType[PATTERN] === Lexer.NA;
      });
    });
    let hasCustom = false;
    let allTransformedPatterns;
    tracer("Transform Patterns", () => {
      hasCustom = false;
      allTransformedPatterns = map_default(onlyRelevantTypes, (currType) => {
        const currPattern = currType[PATTERN];
        if (isRegExp_default(currPattern)) {
          const regExpSource = currPattern.source;
          if (regExpSource.length === 1 && // only these regExp meta characters which can appear in a length one regExp
          regExpSource !== "^" && regExpSource !== "$" && regExpSource !== "." && !currPattern.ignoreCase) {
            return regExpSource;
          } else if (regExpSource.length === 2 && regExpSource[0] === "\\" && // not a meta character
          !includes_default([
            "d",
            "D",
            "s",
            "S",
            "t",
            "r",
            "n",
            "t",
            "0",
            "c",
            "b",
            "B",
            "f",
            "v",
            "w",
            "W"
          ], regExpSource[1])) {
            return regExpSource[1];
          } else {
            return options.useSticky ? addStickyFlag(currPattern) : addStartOfInput(currPattern);
          }
        } else if (isFunction_default(currPattern)) {
          hasCustom = true;
          return { exec: currPattern };
        } else if (typeof currPattern === "object") {
          hasCustom = true;
          return currPattern;
        } else if (typeof currPattern === "string") {
          if (currPattern.length === 1) {
            return currPattern;
          } else {
            const escapedRegExpString = currPattern.replace(/[\\^$.*+?()[\]{}|]/g, "\\$&");
            const wrappedRegExp = new RegExp(escapedRegExpString);
            return options.useSticky ? addStickyFlag(wrappedRegExp) : addStartOfInput(wrappedRegExp);
          }
        } else {
          throw Error("non exhaustive match");
        }
      });
    });
    let patternIdxToType;
    let patternIdxToGroup;
    let patternIdxToLongerAltIdxArr;
    let patternIdxToPushMode;
    let patternIdxToPopMode;
    tracer("misc mapping", () => {
      patternIdxToType = map_default(onlyRelevantTypes, (currType) => currType.tokenTypeIdx);
      patternIdxToGroup = map_default(onlyRelevantTypes, (clazz) => {
        const groupName = clazz.GROUP;
        if (groupName === Lexer.SKIPPED) {
          return void 0;
        } else if (isString_default(groupName)) {
          return groupName;
        } else if (isUndefined_default(groupName)) {
          return false;
        } else {
          throw Error("non exhaustive match");
        }
      });
      patternIdxToLongerAltIdxArr = map_default(onlyRelevantTypes, (clazz) => {
        const longerAltType = clazz.LONGER_ALT;
        if (longerAltType) {
          const longerAltIdxArr = isArray_default(longerAltType) ? map_default(longerAltType, (type) => indexOf_default(onlyRelevantTypes, type)) : [indexOf_default(onlyRelevantTypes, longerAltType)];
          return longerAltIdxArr;
        }
      });
      patternIdxToPushMode = map_default(onlyRelevantTypes, (clazz) => clazz.PUSH_MODE);
      patternIdxToPopMode = map_default(onlyRelevantTypes, (clazz) => has_default(clazz, "POP_MODE"));
    });
    let patternIdxToCanLineTerminator;
    tracer("Line Terminator Handling", () => {
      const lineTerminatorCharCodes = getCharCodes(options.lineTerminatorCharacters);
      patternIdxToCanLineTerminator = map_default(onlyRelevantTypes, (tokType) => false);
      if (options.positionTracking !== "onlyOffset") {
        patternIdxToCanLineTerminator = map_default(onlyRelevantTypes, (tokType) => {
          if (has_default(tokType, "LINE_BREAKS")) {
            return !!tokType.LINE_BREAKS;
          } else {
            return checkLineBreaksIssues(tokType, lineTerminatorCharCodes) === false && canMatchCharCode(lineTerminatorCharCodes, tokType.PATTERN);
          }
        });
      }
    });
    let patternIdxToIsCustom;
    let patternIdxToShort;
    let emptyGroups;
    let patternIdxToConfig;
    tracer("Misc Mapping #2", () => {
      patternIdxToIsCustom = map_default(onlyRelevantTypes, isCustomPattern);
      patternIdxToShort = map_default(allTransformedPatterns, isShortPattern);
      emptyGroups = reduce_default(onlyRelevantTypes, (acc, clazz) => {
        const groupName = clazz.GROUP;
        if (isString_default(groupName) && !(groupName === Lexer.SKIPPED)) {
          acc[groupName] = [];
        }
        return acc;
      }, {});
      patternIdxToConfig = map_default(allTransformedPatterns, (x, idx) => {
        return {
          pattern: allTransformedPatterns[idx],
          longerAlt: patternIdxToLongerAltIdxArr[idx],
          canLineTerminator: patternIdxToCanLineTerminator[idx],
          isCustom: patternIdxToIsCustom[idx],
          short: patternIdxToShort[idx],
          group: patternIdxToGroup[idx],
          push: patternIdxToPushMode[idx],
          pop: patternIdxToPopMode[idx],
          tokenTypeIdx: patternIdxToType[idx],
          tokenType: onlyRelevantTypes[idx]
        };
      });
    });
    let canBeOptimized = true;
    let charCodeToPatternIdxToConfig = [];
    if (!options.safeMode) {
      tracer("First Char Optimization", () => {
        charCodeToPatternIdxToConfig = reduce_default(onlyRelevantTypes, (result, currTokType, idx) => {
          if (typeof currTokType.PATTERN === "string") {
            const charCode = currTokType.PATTERN.charCodeAt(0);
            const optimizedIdx = charCodeToOptimizedIndex(charCode);
            addToMapOfArrays(result, optimizedIdx, patternIdxToConfig[idx]);
          } else if (isArray_default(currTokType.START_CHARS_HINT)) {
            let lastOptimizedIdx;
            forEach_default(currTokType.START_CHARS_HINT, (charOrInt) => {
              const charCode = typeof charOrInt === "string" ? charOrInt.charCodeAt(0) : charOrInt;
              const currOptimizedIdx = charCodeToOptimizedIndex(charCode);
              if (lastOptimizedIdx !== currOptimizedIdx) {
                lastOptimizedIdx = currOptimizedIdx;
                addToMapOfArrays(result, currOptimizedIdx, patternIdxToConfig[idx]);
              }
            });
          } else if (isRegExp_default(currTokType.PATTERN)) {
            if (currTokType.PATTERN.unicode) {
              canBeOptimized = false;
              if (options.ensureOptimizations) {
                PRINT_ERROR(`${failedOptimizationPrefixMsg}	Unable to analyze < ${currTokType.PATTERN.toString()} > pattern.
	The regexp unicode flag is not currently supported by the regexp-to-ast library.
	This will disable the lexer's first char optimizations.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#UNICODE_OPTIMIZE`);
              }
            } else {
              const optimizedCodes = getOptimizedStartCodesIndices(currTokType.PATTERN, options.ensureOptimizations);
              if (isEmpty_default(optimizedCodes)) {
                canBeOptimized = false;
              }
              forEach_default(optimizedCodes, (code) => {
                addToMapOfArrays(result, code, patternIdxToConfig[idx]);
              });
            }
          } else {
            if (options.ensureOptimizations) {
              PRINT_ERROR(`${failedOptimizationPrefixMsg}	TokenType: <${currTokType.name}> is using a custom token pattern without providing <start_chars_hint> parameter.
	This will disable the lexer's first char optimizations.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#CUSTOM_OPTIMIZE`);
            }
            canBeOptimized = false;
          }
          return result;
        }, []);
      });
    }
    return {
      emptyGroups,
      patternIdxToConfig,
      charCodeToPatternIdxToConfig,
      hasCustom,
      canBeOptimized
    };
  }
  function validatePatterns(tokenTypes, validModesNames) {
    let errors = [];
    const missingResult = findMissingPatterns(tokenTypes);
    errors = errors.concat(missingResult.errors);
    const invalidResult = findInvalidPatterns(missingResult.valid);
    const validTokenTypes = invalidResult.valid;
    errors = errors.concat(invalidResult.errors);
    errors = errors.concat(validateRegExpPattern(validTokenTypes));
    errors = errors.concat(findInvalidGroupType(validTokenTypes));
    errors = errors.concat(findModesThatDoNotExist(validTokenTypes, validModesNames));
    errors = errors.concat(findUnreachablePatterns(validTokenTypes));
    return errors;
  }
  function validateRegExpPattern(tokenTypes) {
    let errors = [];
    const withRegExpPatterns = filter_default(tokenTypes, (currTokType) => isRegExp_default(currTokType[PATTERN]));
    errors = errors.concat(findEndOfInputAnchor(withRegExpPatterns));
    errors = errors.concat(findStartOfInputAnchor(withRegExpPatterns));
    errors = errors.concat(findUnsupportedFlags(withRegExpPatterns));
    errors = errors.concat(findDuplicatePatterns(withRegExpPatterns));
    errors = errors.concat(findEmptyMatchRegExps(withRegExpPatterns));
    return errors;
  }
  function findMissingPatterns(tokenTypes) {
    const tokenTypesWithMissingPattern = filter_default(tokenTypes, (currType) => {
      return !has_default(currType, PATTERN);
    });
    const errors = map_default(tokenTypesWithMissingPattern, (currType) => {
      return {
        message: "Token Type: ->" + currType.name + "<- missing static 'PATTERN' property",
        type: LexerDefinitionErrorType.MISSING_PATTERN,
        tokenTypes: [currType]
      };
    });
    const valid = difference_default(tokenTypes, tokenTypesWithMissingPattern);
    return { errors, valid };
  }
  function findInvalidPatterns(tokenTypes) {
    const tokenTypesWithInvalidPattern = filter_default(tokenTypes, (currType) => {
      const pattern = currType[PATTERN];
      return !isRegExp_default(pattern) && !isFunction_default(pattern) && !has_default(pattern, "exec") && !isString_default(pattern);
    });
    const errors = map_default(tokenTypesWithInvalidPattern, (currType) => {
      return {
        message: "Token Type: ->" + currType.name + "<- static 'PATTERN' can only be a RegExp, a Function matching the {CustomPatternMatcherFunc} type or an Object matching the {ICustomPattern} interface.",
        type: LexerDefinitionErrorType.INVALID_PATTERN,
        tokenTypes: [currType]
      };
    });
    const valid = difference_default(tokenTypes, tokenTypesWithInvalidPattern);
    return { errors, valid };
  }
  var end_of_input = /[^\\][$]/;
  function findEndOfInputAnchor(tokenTypes) {
    class EndAnchorFinder extends BaseRegExpVisitor {
      constructor() {
        super(...arguments);
        this.found = false;
      }
      visitEndAnchor(node) {
        this.found = true;
      }
    }
    const invalidRegex = filter_default(tokenTypes, (currType) => {
      const pattern = currType.PATTERN;
      try {
        const regexpAst = getRegExpAst(pattern);
        const endAnchorVisitor = new EndAnchorFinder();
        endAnchorVisitor.visit(regexpAst);
        return endAnchorVisitor.found;
      } catch (e) {
        return end_of_input.test(pattern.source);
      }
    });
    const errors = map_default(invalidRegex, (currType) => {
      return {
        message: "Unexpected RegExp Anchor Error:\n	Token Type: ->" + currType.name + "<- static 'PATTERN' cannot contain end of input anchor '$'\n	See chevrotain.io/docs/guide/resolving_lexer_errors.html#ANCHORS	for details.",
        type: LexerDefinitionErrorType.EOI_ANCHOR_FOUND,
        tokenTypes: [currType]
      };
    });
    return errors;
  }
  function findEmptyMatchRegExps(tokenTypes) {
    const matchesEmptyString = filter_default(tokenTypes, (currType) => {
      const pattern = currType.PATTERN;
      return pattern.test("");
    });
    const errors = map_default(matchesEmptyString, (currType) => {
      return {
        message: "Token Type: ->" + currType.name + "<- static 'PATTERN' must not match an empty string",
        type: LexerDefinitionErrorType.EMPTY_MATCH_PATTERN,
        tokenTypes: [currType]
      };
    });
    return errors;
  }
  var start_of_input = /[^\\[][\^]|^\^/;
  function findStartOfInputAnchor(tokenTypes) {
    class StartAnchorFinder extends BaseRegExpVisitor {
      constructor() {
        super(...arguments);
        this.found = false;
      }
      visitStartAnchor(node) {
        this.found = true;
      }
    }
    const invalidRegex = filter_default(tokenTypes, (currType) => {
      const pattern = currType.PATTERN;
      try {
        const regexpAst = getRegExpAst(pattern);
        const startAnchorVisitor = new StartAnchorFinder();
        startAnchorVisitor.visit(regexpAst);
        return startAnchorVisitor.found;
      } catch (e) {
        return start_of_input.test(pattern.source);
      }
    });
    const errors = map_default(invalidRegex, (currType) => {
      return {
        message: "Unexpected RegExp Anchor Error:\n	Token Type: ->" + currType.name + "<- static 'PATTERN' cannot contain start of input anchor '^'\n	See https://chevrotain.io/docs/guide/resolving_lexer_errors.html#ANCHORS	for details.",
        type: LexerDefinitionErrorType.SOI_ANCHOR_FOUND,
        tokenTypes: [currType]
      };
    });
    return errors;
  }
  function findUnsupportedFlags(tokenTypes) {
    const invalidFlags = filter_default(tokenTypes, (currType) => {
      const pattern = currType[PATTERN];
      return pattern instanceof RegExp && (pattern.multiline || pattern.global);
    });
    const errors = map_default(invalidFlags, (currType) => {
      return {
        message: "Token Type: ->" + currType.name + "<- static 'PATTERN' may NOT contain global('g') or multiline('m')",
        type: LexerDefinitionErrorType.UNSUPPORTED_FLAGS_FOUND,
        tokenTypes: [currType]
      };
    });
    return errors;
  }
  function findDuplicatePatterns(tokenTypes) {
    const found = [];
    let identicalPatterns = map_default(tokenTypes, (outerType) => {
      return reduce_default(tokenTypes, (result, innerType) => {
        if (outerType.PATTERN.source === innerType.PATTERN.source && !includes_default(found, innerType) && innerType.PATTERN !== Lexer.NA) {
          found.push(innerType);
          result.push(innerType);
          return result;
        }
        return result;
      }, []);
    });
    identicalPatterns = compact_default(identicalPatterns);
    const duplicatePatterns = filter_default(identicalPatterns, (currIdenticalSet) => {
      return currIdenticalSet.length > 1;
    });
    const errors = map_default(duplicatePatterns, (setOfIdentical) => {
      const tokenTypeNames = map_default(setOfIdentical, (currType) => {
        return currType.name;
      });
      const dupPatternSrc = head_default(setOfIdentical).PATTERN;
      return {
        message: `The same RegExp pattern ->${dupPatternSrc}<-has been used in all of the following Token Types: ${tokenTypeNames.join(", ")} <-`,
        type: LexerDefinitionErrorType.DUPLICATE_PATTERNS_FOUND,
        tokenTypes: setOfIdentical
      };
    });
    return errors;
  }
  function findInvalidGroupType(tokenTypes) {
    const invalidTypes = filter_default(tokenTypes, (clazz) => {
      if (!has_default(clazz, "GROUP")) {
        return false;
      }
      const group = clazz.GROUP;
      return group !== Lexer.SKIPPED && group !== Lexer.NA && !isString_default(group);
    });
    const errors = map_default(invalidTypes, (currType) => {
      return {
        message: "Token Type: ->" + currType.name + "<- static 'GROUP' can only be Lexer.SKIPPED/Lexer.NA/A String",
        type: LexerDefinitionErrorType.INVALID_GROUP_TYPE_FOUND,
        tokenTypes: [currType]
      };
    });
    return errors;
  }
  function findModesThatDoNotExist(tokenTypes, validModes) {
    const invalidModes = filter_default(tokenTypes, (clazz) => {
      return clazz.PUSH_MODE !== void 0 && !includes_default(validModes, clazz.PUSH_MODE);
    });
    const errors = map_default(invalidModes, (tokType) => {
      const msg = `Token Type: ->${tokType.name}<- static 'PUSH_MODE' value cannot refer to a Lexer Mode ->${tokType.PUSH_MODE}<-which does not exist`;
      return {
        message: msg,
        type: LexerDefinitionErrorType.PUSH_MODE_DOES_NOT_EXIST,
        tokenTypes: [tokType]
      };
    });
    return errors;
  }
  function findUnreachablePatterns(tokenTypes) {
    const errors = [];
    const canBeTested = reduce_default(tokenTypes, (result, tokType, idx) => {
      const pattern = tokType.PATTERN;
      if (pattern === Lexer.NA) {
        return result;
      }
      if (isString_default(pattern)) {
        result.push({ str: pattern, idx, tokenType: tokType });
      } else if (isRegExp_default(pattern) && noMetaChar(pattern)) {
        result.push({ str: pattern.source, idx, tokenType: tokType });
      }
      return result;
    }, []);
    forEach_default(tokenTypes, (tokType, testIdx) => {
      forEach_default(canBeTested, ({ str, idx, tokenType }) => {
        if (testIdx < idx && testTokenType(str, tokType.PATTERN)) {
          const msg = `Token: ->${tokenType.name}<- can never be matched.
Because it appears AFTER the Token Type ->${tokType.name}<-in the lexer's definition.
See https://chevrotain.io/docs/guide/resolving_lexer_errors.html#UNREACHABLE`;
          errors.push({
            message: msg,
            type: LexerDefinitionErrorType.UNREACHABLE_PATTERN,
            tokenTypes: [tokType, tokenType]
          });
        }
      });
    });
    return errors;
  }
  function testTokenType(str, pattern) {
    if (isRegExp_default(pattern)) {
      const regExpArray = pattern.exec(str);
      return regExpArray !== null && regExpArray.index === 0;
    } else if (isFunction_default(pattern)) {
      return pattern(str, 0, [], {});
    } else if (has_default(pattern, "exec")) {
      return pattern.exec(str, 0, [], {});
    } else if (typeof pattern === "string") {
      return pattern === str;
    } else {
      throw Error("non exhaustive match");
    }
  }
  function noMetaChar(regExp) {
    const metaChars = [
      ".",
      "\\",
      "[",
      "]",
      "|",
      "^",
      "$",
      "(",
      ")",
      "?",
      "*",
      "+",
      "{"
    ];
    return find_default(metaChars, (char) => regExp.source.indexOf(char) !== -1) === void 0;
  }
  function addStartOfInput(pattern) {
    const flags = pattern.ignoreCase ? "i" : "";
    return new RegExp(`^(?:${pattern.source})`, flags);
  }
  function addStickyFlag(pattern) {
    const flags = pattern.ignoreCase ? "iy" : "y";
    return new RegExp(`${pattern.source}`, flags);
  }
  function performRuntimeChecks(lexerDefinition, trackLines, lineTerminatorCharacters) {
    const errors = [];
    if (!has_default(lexerDefinition, DEFAULT_MODE)) {
      errors.push({
        message: "A MultiMode Lexer cannot be initialized without a <" + DEFAULT_MODE + "> property in its definition\n",
        type: LexerDefinitionErrorType.MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE
      });
    }
    if (!has_default(lexerDefinition, MODES)) {
      errors.push({
        message: "A MultiMode Lexer cannot be initialized without a <" + MODES + "> property in its definition\n",
        type: LexerDefinitionErrorType.MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY
      });
    }
    if (has_default(lexerDefinition, MODES) && has_default(lexerDefinition, DEFAULT_MODE) && !has_default(lexerDefinition.modes, lexerDefinition.defaultMode)) {
      errors.push({
        message: `A MultiMode Lexer cannot be initialized with a ${DEFAULT_MODE}: <${lexerDefinition.defaultMode}>which does not exist
`,
        type: LexerDefinitionErrorType.MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST
      });
    }
    if (has_default(lexerDefinition, MODES)) {
      forEach_default(lexerDefinition.modes, (currModeValue, currModeName) => {
        forEach_default(currModeValue, (currTokType, currIdx) => {
          if (isUndefined_default(currTokType)) {
            errors.push({
              message: `A Lexer cannot be initialized using an undefined Token Type. Mode:<${currModeName}> at index: <${currIdx}>
`,
              type: LexerDefinitionErrorType.LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED
            });
          } else if (has_default(currTokType, "LONGER_ALT")) {
            const longerAlt = isArray_default(currTokType.LONGER_ALT) ? currTokType.LONGER_ALT : [currTokType.LONGER_ALT];
            forEach_default(longerAlt, (currLongerAlt) => {
              if (!isUndefined_default(currLongerAlt) && !includes_default(currModeValue, currLongerAlt)) {
                errors.push({
                  message: `A MultiMode Lexer cannot be initialized with a longer_alt <${currLongerAlt.name}> on token <${currTokType.name}> outside of mode <${currModeName}>
`,
                  type: LexerDefinitionErrorType.MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE
                });
              }
            });
          }
        });
      });
    }
    return errors;
  }
  function performWarningRuntimeChecks(lexerDefinition, trackLines, lineTerminatorCharacters) {
    const warnings = [];
    let hasAnyLineBreak = false;
    const allTokenTypes = compact_default(flatten_default(values_default(lexerDefinition.modes)));
    const concreteTokenTypes = reject_default(allTokenTypes, (currType) => currType[PATTERN] === Lexer.NA);
    const terminatorCharCodes = getCharCodes(lineTerminatorCharacters);
    if (trackLines) {
      forEach_default(concreteTokenTypes, (tokType) => {
        const currIssue = checkLineBreaksIssues(tokType, terminatorCharCodes);
        if (currIssue !== false) {
          const message = buildLineBreakIssueMessage(tokType, currIssue);
          const warningDescriptor = {
            message,
            type: currIssue.issue,
            tokenType: tokType
          };
          warnings.push(warningDescriptor);
        } else {
          if (has_default(tokType, "LINE_BREAKS")) {
            if (tokType.LINE_BREAKS === true) {
              hasAnyLineBreak = true;
            }
          } else {
            if (canMatchCharCode(terminatorCharCodes, tokType.PATTERN)) {
              hasAnyLineBreak = true;
            }
          }
        }
      });
    }
    if (trackLines && !hasAnyLineBreak) {
      warnings.push({
        message: "Warning: No LINE_BREAKS Found.\n	This Lexer has been defined to track line and column information,\n	But none of the Token Types can be identified as matching a line terminator.\n	See https://chevrotain.io/docs/guide/resolving_lexer_errors.html#LINE_BREAKS \n	for details.",
        type: LexerDefinitionErrorType.NO_LINE_BREAKS_FLAGS
      });
    }
    return warnings;
  }
  function cloneEmptyGroups(emptyGroups) {
    const clonedResult = {};
    const groupKeys = keys_default(emptyGroups);
    forEach_default(groupKeys, (currKey) => {
      const currGroupValue = emptyGroups[currKey];
      if (isArray_default(currGroupValue)) {
        clonedResult[currKey] = [];
      } else {
        throw Error("non exhaustive match");
      }
    });
    return clonedResult;
  }
  function isCustomPattern(tokenType) {
    const pattern = tokenType.PATTERN;
    if (isRegExp_default(pattern)) {
      return false;
    } else if (isFunction_default(pattern)) {
      return true;
    } else if (has_default(pattern, "exec")) {
      return true;
    } else if (isString_default(pattern)) {
      return false;
    } else {
      throw Error("non exhaustive match");
    }
  }
  function isShortPattern(pattern) {
    if (isString_default(pattern) && pattern.length === 1) {
      return pattern.charCodeAt(0);
    } else {
      return false;
    }
  }
  var LineTerminatorOptimizedTester = {
    // implements /\n|\r\n?/g.test
    test: function(text) {
      const len = text.length;
      for (let i = this.lastIndex; i < len; i++) {
        const c = text.charCodeAt(i);
        if (c === 10) {
          this.lastIndex = i + 1;
          return true;
        } else if (c === 13) {
          if (text.charCodeAt(i + 1) === 10) {
            this.lastIndex = i + 2;
          } else {
            this.lastIndex = i + 1;
          }
          return true;
        }
      }
      return false;
    },
    lastIndex: 0
  };
  function checkLineBreaksIssues(tokType, lineTerminatorCharCodes) {
    if (has_default(tokType, "LINE_BREAKS")) {
      return false;
    } else {
      if (isRegExp_default(tokType.PATTERN)) {
        try {
          canMatchCharCode(lineTerminatorCharCodes, tokType.PATTERN);
        } catch (e) {
          return {
            issue: LexerDefinitionErrorType.IDENTIFY_TERMINATOR,
            errMsg: e.message
          };
        }
        return false;
      } else if (isString_default(tokType.PATTERN)) {
        return false;
      } else if (isCustomPattern(tokType)) {
        return { issue: LexerDefinitionErrorType.CUSTOM_LINE_BREAK };
      } else {
        throw Error("non exhaustive match");
      }
    }
  }
  function buildLineBreakIssueMessage(tokType, details) {
    if (details.issue === LexerDefinitionErrorType.IDENTIFY_TERMINATOR) {
      return `Warning: unable to identify line terminator usage in pattern.
	The problem is in the <${tokType.name}> Token Type
	 Root cause: ${details.errMsg}.
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#IDENTIFY_TERMINATOR`;
    } else if (details.issue === LexerDefinitionErrorType.CUSTOM_LINE_BREAK) {
      return `Warning: A Custom Token Pattern should specify the <line_breaks> option.
	The problem is in the <${tokType.name}> Token Type
	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#CUSTOM_LINE_BREAK`;
    } else {
      throw Error("non exhaustive match");
    }
  }
  function getCharCodes(charsOrCodes) {
    const charCodes = map_default(charsOrCodes, (numOrString) => {
      if (isString_default(numOrString)) {
        return numOrString.charCodeAt(0);
      } else {
        return numOrString;
      }
    });
    return charCodes;
  }
  function addToMapOfArrays(map2, key, value) {
    if (map2[key] === void 0) {
      map2[key] = [value];
    } else {
      map2[key].push(value);
    }
  }
  var minOptimizationVal = 256;
  var charCodeToOptimizedIdxMap = [];
  function charCodeToOptimizedIndex(charCode) {
    return charCode < minOptimizationVal ? charCode : charCodeToOptimizedIdxMap[charCode];
  }
  function initCharCodeToOptimizedIndexMap() {
    if (isEmpty_default(charCodeToOptimizedIdxMap)) {
      charCodeToOptimizedIdxMap = new Array(65536);
      for (let i = 0; i < 65536; i++) {
        charCodeToOptimizedIdxMap[i] = i > 255 ? 255 + ~~(i / 255) : i;
      }
    }
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/scan/tokens.js
  function tokenStructuredMatcher(tokInstance, tokConstructor) {
    const instanceType = tokInstance.tokenTypeIdx;
    if (instanceType === tokConstructor.tokenTypeIdx) {
      return true;
    } else {
      return tokConstructor.isParent === true && tokConstructor.categoryMatchesMap[instanceType] === true;
    }
  }
  function tokenStructuredMatcherNoCategories(token, tokType) {
    return token.tokenTypeIdx === tokType.tokenTypeIdx;
  }
  var tokenShortNameIdx = 1;
  var tokenIdxToClass = {};
  function augmentTokenTypes(tokenTypes) {
    const tokenTypesAndParents = expandCategories(tokenTypes);
    assignTokenDefaultProps(tokenTypesAndParents);
    assignCategoriesMapProp(tokenTypesAndParents);
    assignCategoriesTokensProp(tokenTypesAndParents);
    forEach_default(tokenTypesAndParents, (tokType) => {
      tokType.isParent = tokType.categoryMatches.length > 0;
    });
  }
  function expandCategories(tokenTypes) {
    let result = clone_default(tokenTypes);
    let categories = tokenTypes;
    let searching = true;
    while (searching) {
      categories = compact_default(flatten_default(map_default(categories, (currTokType) => currTokType.CATEGORIES)));
      const newCategories = difference_default(categories, result);
      result = result.concat(newCategories);
      if (isEmpty_default(newCategories)) {
        searching = false;
      } else {
        categories = newCategories;
      }
    }
    return result;
  }
  function assignTokenDefaultProps(tokenTypes) {
    forEach_default(tokenTypes, (currTokType) => {
      if (!hasShortKeyProperty(currTokType)) {
        tokenIdxToClass[tokenShortNameIdx] = currTokType;
        currTokType.tokenTypeIdx = tokenShortNameIdx++;
      }
      if (hasCategoriesProperty(currTokType) && !isArray_default(currTokType.CATEGORIES)) {
        currTokType.CATEGORIES = [currTokType.CATEGORIES];
      }
      if (!hasCategoriesProperty(currTokType)) {
        currTokType.CATEGORIES = [];
      }
      if (!hasExtendingTokensTypesProperty(currTokType)) {
        currTokType.categoryMatches = [];
      }
      if (!hasExtendingTokensTypesMapProperty(currTokType)) {
        currTokType.categoryMatchesMap = {};
      }
    });
  }
  function assignCategoriesTokensProp(tokenTypes) {
    forEach_default(tokenTypes, (currTokType) => {
      currTokType.categoryMatches = [];
      forEach_default(currTokType.categoryMatchesMap, (val, key) => {
        currTokType.categoryMatches.push(tokenIdxToClass[key].tokenTypeIdx);
      });
    });
  }
  function assignCategoriesMapProp(tokenTypes) {
    forEach_default(tokenTypes, (currTokType) => {
      singleAssignCategoriesToksMap([], currTokType);
    });
  }
  function singleAssignCategoriesToksMap(path, nextNode) {
    forEach_default(path, (pathNode) => {
      nextNode.categoryMatchesMap[pathNode.tokenTypeIdx] = true;
    });
    forEach_default(nextNode.CATEGORIES, (nextCategory) => {
      const newPath = path.concat(nextNode);
      if (!includes_default(newPath, nextCategory)) {
        singleAssignCategoriesToksMap(newPath, nextCategory);
      }
    });
  }
  function hasShortKeyProperty(tokType) {
    return has_default(tokType, "tokenTypeIdx");
  }
  function hasCategoriesProperty(tokType) {
    return has_default(tokType, "CATEGORIES");
  }
  function hasExtendingTokensTypesProperty(tokType) {
    return has_default(tokType, "categoryMatches");
  }
  function hasExtendingTokensTypesMapProperty(tokType) {
    return has_default(tokType, "categoryMatchesMap");
  }
  function isTokenType(tokType) {
    return has_default(tokType, "tokenTypeIdx");
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/scan/lexer_errors_public.js
  var defaultLexerErrorProvider = {
    buildUnableToPopLexerModeMessage(token) {
      return `Unable to pop Lexer Mode after encountering Token ->${token.image}<- The Mode Stack is empty`;
    },
    buildUnexpectedCharactersMessage(fullText, startOffset, length, line, column) {
      return `unexpected character: ->${fullText.charAt(startOffset)}<- at offset: ${startOffset}, skipped ${length} characters.`;
    }
  };

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/scan/lexer_public.js
  var LexerDefinitionErrorType;
  (function(LexerDefinitionErrorType2) {
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["MISSING_PATTERN"] = 0] = "MISSING_PATTERN";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["INVALID_PATTERN"] = 1] = "INVALID_PATTERN";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["EOI_ANCHOR_FOUND"] = 2] = "EOI_ANCHOR_FOUND";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["UNSUPPORTED_FLAGS_FOUND"] = 3] = "UNSUPPORTED_FLAGS_FOUND";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["DUPLICATE_PATTERNS_FOUND"] = 4] = "DUPLICATE_PATTERNS_FOUND";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["INVALID_GROUP_TYPE_FOUND"] = 5] = "INVALID_GROUP_TYPE_FOUND";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["PUSH_MODE_DOES_NOT_EXIST"] = 6] = "PUSH_MODE_DOES_NOT_EXIST";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE"] = 7] = "MULTI_MODE_LEXER_WITHOUT_DEFAULT_MODE";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY"] = 8] = "MULTI_MODE_LEXER_WITHOUT_MODES_PROPERTY";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST"] = 9] = "MULTI_MODE_LEXER_DEFAULT_MODE_VALUE_DOES_NOT_EXIST";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED"] = 10] = "LEXER_DEFINITION_CANNOT_CONTAIN_UNDEFINED";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["SOI_ANCHOR_FOUND"] = 11] = "SOI_ANCHOR_FOUND";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["EMPTY_MATCH_PATTERN"] = 12] = "EMPTY_MATCH_PATTERN";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["NO_LINE_BREAKS_FLAGS"] = 13] = "NO_LINE_BREAKS_FLAGS";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["UNREACHABLE_PATTERN"] = 14] = "UNREACHABLE_PATTERN";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["IDENTIFY_TERMINATOR"] = 15] = "IDENTIFY_TERMINATOR";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["CUSTOM_LINE_BREAK"] = 16] = "CUSTOM_LINE_BREAK";
    LexerDefinitionErrorType2[LexerDefinitionErrorType2["MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE"] = 17] = "MULTI_MODE_LEXER_LONGER_ALT_NOT_IN_CURRENT_MODE";
  })(LexerDefinitionErrorType || (LexerDefinitionErrorType = {}));
  var DEFAULT_LEXER_CONFIG = {
    deferDefinitionErrorsHandling: false,
    positionTracking: "full",
    lineTerminatorsPattern: /\n|\r\n?/g,
    lineTerminatorCharacters: ["\n", "\r"],
    ensureOptimizations: false,
    safeMode: false,
    errorMessageProvider: defaultLexerErrorProvider,
    traceInitPerf: false,
    skipValidations: false,
    recoveryEnabled: true
  };
  Object.freeze(DEFAULT_LEXER_CONFIG);
  var Lexer = class {
    constructor(lexerDefinition, config2 = DEFAULT_LEXER_CONFIG) {
      this.lexerDefinition = lexerDefinition;
      this.lexerDefinitionErrors = [];
      this.lexerDefinitionWarning = [];
      this.patternIdxToConfig = {};
      this.charCodeToPatternIdxToConfig = {};
      this.modes = [];
      this.emptyGroups = {};
      this.trackStartLines = true;
      this.trackEndLines = true;
      this.hasCustom = false;
      this.canModeBeOptimized = {};
      this.TRACE_INIT = (phaseDesc, phaseImpl) => {
        if (this.traceInitPerf === true) {
          this.traceInitIndent++;
          const indent = new Array(this.traceInitIndent + 1).join("	");
          if (this.traceInitIndent < this.traceInitMaxIdent) {
            console.log(`${indent}--> <${phaseDesc}>`);
          }
          const { time, value } = timer(phaseImpl);
          const traceMethod = time > 10 ? console.warn : console.log;
          if (this.traceInitIndent < this.traceInitMaxIdent) {
            traceMethod(`${indent}<-- <${phaseDesc}> time: ${time}ms`);
          }
          this.traceInitIndent--;
          return value;
        } else {
          return phaseImpl();
        }
      };
      if (typeof config2 === "boolean") {
        throw Error("The second argument to the Lexer constructor is now an ILexerConfig Object.\na boolean 2nd argument is no longer supported");
      }
      this.config = assign_default({}, DEFAULT_LEXER_CONFIG, config2);
      const traceInitVal = this.config.traceInitPerf;
      if (traceInitVal === true) {
        this.traceInitMaxIdent = Infinity;
        this.traceInitPerf = true;
      } else if (typeof traceInitVal === "number") {
        this.traceInitMaxIdent = traceInitVal;
        this.traceInitPerf = true;
      }
      this.traceInitIndent = -1;
      this.TRACE_INIT("Lexer Constructor", () => {
        let actualDefinition;
        let hasOnlySingleMode = true;
        this.TRACE_INIT("Lexer Config handling", () => {
          if (this.config.lineTerminatorsPattern === DEFAULT_LEXER_CONFIG.lineTerminatorsPattern) {
            this.config.lineTerminatorsPattern = LineTerminatorOptimizedTester;
          } else {
            if (this.config.lineTerminatorCharacters === DEFAULT_LEXER_CONFIG.lineTerminatorCharacters) {
              throw Error("Error: Missing <lineTerminatorCharacters> property on the Lexer config.\n	For details See: https://chevrotain.io/docs/guide/resolving_lexer_errors.html#MISSING_LINE_TERM_CHARS");
            }
          }
          if (config2.safeMode && config2.ensureOptimizations) {
            throw Error('"safeMode" and "ensureOptimizations" flags are mutually exclusive.');
          }
          this.trackStartLines = /full|onlyStart/i.test(this.config.positionTracking);
          this.trackEndLines = /full/i.test(this.config.positionTracking);
          if (isArray_default(lexerDefinition)) {
            actualDefinition = {
              modes: { defaultMode: clone_default(lexerDefinition) },
              defaultMode: DEFAULT_MODE
            };
          } else {
            hasOnlySingleMode = false;
            actualDefinition = clone_default(lexerDefinition);
          }
        });
        if (this.config.skipValidations === false) {
          this.TRACE_INIT("performRuntimeChecks", () => {
            this.lexerDefinitionErrors = this.lexerDefinitionErrors.concat(performRuntimeChecks(actualDefinition, this.trackStartLines, this.config.lineTerminatorCharacters));
          });
          this.TRACE_INIT("performWarningRuntimeChecks", () => {
            this.lexerDefinitionWarning = this.lexerDefinitionWarning.concat(performWarningRuntimeChecks(actualDefinition, this.trackStartLines, this.config.lineTerminatorCharacters));
          });
        }
        actualDefinition.modes = actualDefinition.modes ? actualDefinition.modes : {};
        forEach_default(actualDefinition.modes, (currModeValue, currModeName) => {
          actualDefinition.modes[currModeName] = reject_default(currModeValue, (currTokType) => isUndefined_default(currTokType));
        });
        const allModeNames = keys_default(actualDefinition.modes);
        forEach_default(actualDefinition.modes, (currModDef, currModName) => {
          this.TRACE_INIT(`Mode: <${currModName}> processing`, () => {
            this.modes.push(currModName);
            if (this.config.skipValidations === false) {
              this.TRACE_INIT(`validatePatterns`, () => {
                this.lexerDefinitionErrors = this.lexerDefinitionErrors.concat(validatePatterns(currModDef, allModeNames));
              });
            }
            if (isEmpty_default(this.lexerDefinitionErrors)) {
              augmentTokenTypes(currModDef);
              let currAnalyzeResult;
              this.TRACE_INIT(`analyzeTokenTypes`, () => {
                currAnalyzeResult = analyzeTokenTypes(currModDef, {
                  lineTerminatorCharacters: this.config.lineTerminatorCharacters,
                  positionTracking: config2.positionTracking,
                  ensureOptimizations: config2.ensureOptimizations,
                  safeMode: config2.safeMode,
                  tracer: this.TRACE_INIT
                });
              });
              this.patternIdxToConfig[currModName] = currAnalyzeResult.patternIdxToConfig;
              this.charCodeToPatternIdxToConfig[currModName] = currAnalyzeResult.charCodeToPatternIdxToConfig;
              this.emptyGroups = assign_default({}, this.emptyGroups, currAnalyzeResult.emptyGroups);
              this.hasCustom = currAnalyzeResult.hasCustom || this.hasCustom;
              this.canModeBeOptimized[currModName] = currAnalyzeResult.canBeOptimized;
            }
          });
        });
        this.defaultMode = actualDefinition.defaultMode;
        if (!isEmpty_default(this.lexerDefinitionErrors) && !this.config.deferDefinitionErrorsHandling) {
          const allErrMessages = map_default(this.lexerDefinitionErrors, (error) => {
            return error.message;
          });
          const allErrMessagesString = allErrMessages.join("-----------------------\n");
          throw new Error("Errors detected in definition of Lexer:\n" + allErrMessagesString);
        }
        forEach_default(this.lexerDefinitionWarning, (warningDescriptor) => {
          PRINT_WARNING(warningDescriptor.message);
        });
        this.TRACE_INIT("Choosing sub-methods implementations", () => {
          if (SUPPORT_STICKY) {
            this.chopInput = identity_default;
            this.match = this.matchWithTest;
          } else {
            this.updateLastIndex = noop_default;
            this.match = this.matchWithExec;
          }
          if (hasOnlySingleMode) {
            this.handleModes = noop_default;
          }
          if (this.trackStartLines === false) {
            this.computeNewColumn = identity_default;
          }
          if (this.trackEndLines === false) {
            this.updateTokenEndLineColumnLocation = noop_default;
          }
          if (/full/i.test(this.config.positionTracking)) {
            this.createTokenInstance = this.createFullToken;
          } else if (/onlyStart/i.test(this.config.positionTracking)) {
            this.createTokenInstance = this.createStartOnlyToken;
          } else if (/onlyOffset/i.test(this.config.positionTracking)) {
            this.createTokenInstance = this.createOffsetOnlyToken;
          } else {
            throw Error(`Invalid <positionTracking> config option: "${this.config.positionTracking}"`);
          }
          if (this.hasCustom) {
            this.addToken = this.addTokenUsingPush;
            this.handlePayload = this.handlePayloadWithCustom;
          } else {
            this.addToken = this.addTokenUsingMemberAccess;
            this.handlePayload = this.handlePayloadNoCustom;
          }
        });
        this.TRACE_INIT("Failed Optimization Warnings", () => {
          const unOptimizedModes = reduce_default(this.canModeBeOptimized, (cannotBeOptimized, canBeOptimized, modeName) => {
            if (canBeOptimized === false) {
              cannotBeOptimized.push(modeName);
            }
            return cannotBeOptimized;
          }, []);
          if (config2.ensureOptimizations && !isEmpty_default(unOptimizedModes)) {
            throw Error(`Lexer Modes: < ${unOptimizedModes.join(", ")} > cannot be optimized.
	 Disable the "ensureOptimizations" lexer config flag to silently ignore this and run the lexer in an un-optimized mode.
	 Or inspect the console log for details on how to resolve these issues.`);
          }
        });
        this.TRACE_INIT("clearRegExpParserCache", () => {
          clearRegExpParserCache();
        });
        this.TRACE_INIT("toFastProperties", () => {
          toFastProperties(this);
        });
      });
    }
    tokenize(text, initialMode = this.defaultMode) {
      if (!isEmpty_default(this.lexerDefinitionErrors)) {
        const allErrMessages = map_default(this.lexerDefinitionErrors, (error) => {
          return error.message;
        });
        const allErrMessagesString = allErrMessages.join("-----------------------\n");
        throw new Error("Unable to Tokenize because Errors detected in definition of Lexer:\n" + allErrMessagesString);
      }
      return this.tokenizeInternal(text, initialMode);
    }
    // There is quite a bit of duplication between this and "tokenizeInternalLazy"
    // This is intentional due to performance considerations.
    // this method also used quite a bit of `!` none null assertions because it is too optimized
    // for `tsc` to always understand it is "safe"
    tokenizeInternal(text, initialMode) {
      let i, j, k, matchAltImage, longerAlt, matchedImage, payload, altPayload, imageLength, group, tokType, newToken, errLength, droppedChar, msg, match;
      const orgText = text;
      const orgLength = orgText.length;
      let offset = 0;
      let matchedTokensIndex = 0;
      const guessedNumberOfTokens = this.hasCustom ? 0 : Math.floor(text.length / 10);
      const matchedTokens = new Array(guessedNumberOfTokens);
      const errors = [];
      let line = this.trackStartLines ? 1 : void 0;
      let column = this.trackStartLines ? 1 : void 0;
      const groups = cloneEmptyGroups(this.emptyGroups);
      const trackLines = this.trackStartLines;
      const lineTerminatorPattern = this.config.lineTerminatorsPattern;
      let currModePatternsLength = 0;
      let patternIdxToConfig = [];
      let currCharCodeToPatternIdxToConfig = [];
      const modeStack = [];
      const emptyArray = [];
      Object.freeze(emptyArray);
      let getPossiblePatterns;
      function getPossiblePatternsSlow() {
        return patternIdxToConfig;
      }
      function getPossiblePatternsOptimized(charCode) {
        const optimizedCharIdx = charCodeToOptimizedIndex(charCode);
        const possiblePatterns = currCharCodeToPatternIdxToConfig[optimizedCharIdx];
        if (possiblePatterns === void 0) {
          return emptyArray;
        } else {
          return possiblePatterns;
        }
      }
      const pop_mode = (popToken) => {
        if (modeStack.length === 1 && // if we have both a POP_MODE and a PUSH_MODE this is in-fact a "transition"
        // So no error should occur.
        popToken.tokenType.PUSH_MODE === void 0) {
          const msg2 = this.config.errorMessageProvider.buildUnableToPopLexerModeMessage(popToken);
          errors.push({
            offset: popToken.startOffset,
            line: popToken.startLine,
            column: popToken.startColumn,
            length: popToken.image.length,
            message: msg2
          });
        } else {
          modeStack.pop();
          const newMode = last_default(modeStack);
          patternIdxToConfig = this.patternIdxToConfig[newMode];
          currCharCodeToPatternIdxToConfig = this.charCodeToPatternIdxToConfig[newMode];
          currModePatternsLength = patternIdxToConfig.length;
          const modeCanBeOptimized = this.canModeBeOptimized[newMode] && this.config.safeMode === false;
          if (currCharCodeToPatternIdxToConfig && modeCanBeOptimized) {
            getPossiblePatterns = getPossiblePatternsOptimized;
          } else {
            getPossiblePatterns = getPossiblePatternsSlow;
          }
        }
      };
      function push_mode(newMode) {
        modeStack.push(newMode);
        currCharCodeToPatternIdxToConfig = this.charCodeToPatternIdxToConfig[newMode];
        patternIdxToConfig = this.patternIdxToConfig[newMode];
        currModePatternsLength = patternIdxToConfig.length;
        currModePatternsLength = patternIdxToConfig.length;
        const modeCanBeOptimized = this.canModeBeOptimized[newMode] && this.config.safeMode === false;
        if (currCharCodeToPatternIdxToConfig && modeCanBeOptimized) {
          getPossiblePatterns = getPossiblePatternsOptimized;
        } else {
          getPossiblePatterns = getPossiblePatternsSlow;
        }
      }
      push_mode.call(this, initialMode);
      let currConfig;
      const recoveryEnabled = this.config.recoveryEnabled;
      while (offset < orgLength) {
        matchedImage = null;
        const nextCharCode = orgText.charCodeAt(offset);
        const chosenPatternIdxToConfig = getPossiblePatterns(nextCharCode);
        const chosenPatternsLength = chosenPatternIdxToConfig.length;
        for (i = 0; i < chosenPatternsLength; i++) {
          currConfig = chosenPatternIdxToConfig[i];
          const currPattern = currConfig.pattern;
          payload = null;
          const singleCharCode = currConfig.short;
          if (singleCharCode !== false) {
            if (nextCharCode === singleCharCode) {
              matchedImage = currPattern;
            }
          } else if (currConfig.isCustom === true) {
            match = currPattern.exec(orgText, offset, matchedTokens, groups);
            if (match !== null) {
              matchedImage = match[0];
              if (match.payload !== void 0) {
                payload = match.payload;
              }
            } else {
              matchedImage = null;
            }
          } else {
            this.updateLastIndex(currPattern, offset);
            matchedImage = this.match(currPattern, text, offset);
          }
          if (matchedImage !== null) {
            longerAlt = currConfig.longerAlt;
            if (longerAlt !== void 0) {
              const longerAltLength = longerAlt.length;
              for (k = 0; k < longerAltLength; k++) {
                const longerAltConfig = patternIdxToConfig[longerAlt[k]];
                const longerAltPattern = longerAltConfig.pattern;
                altPayload = null;
                if (longerAltConfig.isCustom === true) {
                  match = longerAltPattern.exec(orgText, offset, matchedTokens, groups);
                  if (match !== null) {
                    matchAltImage = match[0];
                    if (match.payload !== void 0) {
                      altPayload = match.payload;
                    }
                  } else {
                    matchAltImage = null;
                  }
                } else {
                  this.updateLastIndex(longerAltPattern, offset);
                  matchAltImage = this.match(longerAltPattern, text, offset);
                }
                if (matchAltImage && matchAltImage.length > matchedImage.length) {
                  matchedImage = matchAltImage;
                  payload = altPayload;
                  currConfig = longerAltConfig;
                  break;
                }
              }
            }
            break;
          }
        }
        if (matchedImage !== null) {
          imageLength = matchedImage.length;
          group = currConfig.group;
          if (group !== void 0) {
            tokType = currConfig.tokenTypeIdx;
            newToken = this.createTokenInstance(matchedImage, offset, tokType, currConfig.tokenType, line, column, imageLength);
            this.handlePayload(newToken, payload);
            if (group === false) {
              matchedTokensIndex = this.addToken(matchedTokens, matchedTokensIndex, newToken);
            } else {
              groups[group].push(newToken);
            }
          }
          text = this.chopInput(text, imageLength);
          offset = offset + imageLength;
          column = this.computeNewColumn(column, imageLength);
          if (trackLines === true && currConfig.canLineTerminator === true) {
            let numOfLTsInMatch = 0;
            let foundTerminator;
            let lastLTEndOffset;
            lineTerminatorPattern.lastIndex = 0;
            do {
              foundTerminator = lineTerminatorPattern.test(matchedImage);
              if (foundTerminator === true) {
                lastLTEndOffset = lineTerminatorPattern.lastIndex - 1;
                numOfLTsInMatch++;
              }
            } while (foundTerminator === true);
            if (numOfLTsInMatch !== 0) {
              line = line + numOfLTsInMatch;
              column = imageLength - lastLTEndOffset;
              this.updateTokenEndLineColumnLocation(newToken, group, lastLTEndOffset, numOfLTsInMatch, line, column, imageLength);
            }
          }
          this.handleModes(currConfig, pop_mode, push_mode, newToken);
        } else {
          const errorStartOffset = offset;
          const errorLine = line;
          const errorColumn = column;
          let foundResyncPoint = recoveryEnabled === false;
          while (foundResyncPoint === false && offset < orgLength) {
            text = this.chopInput(text, 1);
            offset++;
            for (j = 0; j < currModePatternsLength; j++) {
              const currConfig2 = patternIdxToConfig[j];
              const currPattern = currConfig2.pattern;
              const singleCharCode = currConfig2.short;
              if (singleCharCode !== false) {
                if (orgText.charCodeAt(offset) === singleCharCode) {
                  foundResyncPoint = true;
                }
              } else if (currConfig2.isCustom === true) {
                foundResyncPoint = currPattern.exec(orgText, offset, matchedTokens, groups) !== null;
              } else {
                this.updateLastIndex(currPattern, offset);
                foundResyncPoint = currPattern.exec(text) !== null;
              }
              if (foundResyncPoint === true) {
                break;
              }
            }
          }
          errLength = offset - errorStartOffset;
          column = this.computeNewColumn(column, errLength);
          msg = this.config.errorMessageProvider.buildUnexpectedCharactersMessage(orgText, errorStartOffset, errLength, errorLine, errorColumn);
          errors.push({
            offset: errorStartOffset,
            line: errorLine,
            column: errorColumn,
            length: errLength,
            message: msg
          });
          if (recoveryEnabled === false) {
            break;
          }
        }
      }
      if (!this.hasCustom) {
        matchedTokens.length = matchedTokensIndex;
      }
      return {
        tokens: matchedTokens,
        groups,
        errors
      };
    }
    handleModes(config2, pop_mode, push_mode, newToken) {
      if (config2.pop === true) {
        const pushMode = config2.push;
        pop_mode(newToken);
        if (pushMode !== void 0) {
          push_mode.call(this, pushMode);
        }
      } else if (config2.push !== void 0) {
        push_mode.call(this, config2.push);
      }
    }
    chopInput(text, length) {
      return text.substring(length);
    }
    updateLastIndex(regExp, newLastIndex) {
      regExp.lastIndex = newLastIndex;
    }
    // TODO: decrease this under 600 characters? inspect stripping comments option in TSC compiler
    updateTokenEndLineColumnLocation(newToken, group, lastLTIdx, numOfLTsInMatch, line, column, imageLength) {
      let lastCharIsLT, fixForEndingInLT;
      if (group !== void 0) {
        lastCharIsLT = lastLTIdx === imageLength - 1;
        fixForEndingInLT = lastCharIsLT ? -1 : 0;
        if (!(numOfLTsInMatch === 1 && lastCharIsLT === true)) {
          newToken.endLine = line + fixForEndingInLT;
          newToken.endColumn = column - 1 + -fixForEndingInLT;
        }
      }
    }
    computeNewColumn(oldColumn, imageLength) {
      return oldColumn + imageLength;
    }
    createOffsetOnlyToken(image, startOffset, tokenTypeIdx, tokenType) {
      return {
        image,
        startOffset,
        tokenTypeIdx,
        tokenType
      };
    }
    createStartOnlyToken(image, startOffset, tokenTypeIdx, tokenType, startLine, startColumn) {
      return {
        image,
        startOffset,
        startLine,
        startColumn,
        tokenTypeIdx,
        tokenType
      };
    }
    createFullToken(image, startOffset, tokenTypeIdx, tokenType, startLine, startColumn, imageLength) {
      return {
        image,
        startOffset,
        endOffset: startOffset + imageLength - 1,
        startLine,
        endLine: startLine,
        startColumn,
        endColumn: startColumn + imageLength - 1,
        tokenTypeIdx,
        tokenType
      };
    }
    addTokenUsingPush(tokenVector, index, tokenToAdd) {
      tokenVector.push(tokenToAdd);
      return index;
    }
    addTokenUsingMemberAccess(tokenVector, index, tokenToAdd) {
      tokenVector[index] = tokenToAdd;
      index++;
      return index;
    }
    handlePayloadNoCustom(token, payload) {
    }
    handlePayloadWithCustom(token, payload) {
      if (payload !== null) {
        token.payload = payload;
      }
    }
    matchWithTest(pattern, text, offset) {
      const found = pattern.test(text);
      if (found === true) {
        return text.substring(offset, pattern.lastIndex);
      }
      return null;
    }
    matchWithExec(pattern, text) {
      const regExpArray = pattern.exec(text);
      return regExpArray !== null ? regExpArray[0] : null;
    }
  };
  Lexer.SKIPPED = "This marks a skipped Token pattern, this means each token identified by it willbe consumed and then thrown into oblivion, this can be used to for example to completely ignore whitespace.";
  Lexer.NA = /NOT_APPLICABLE/;

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/scan/tokens_public.js
  function tokenLabel2(tokType) {
    if (hasTokenLabel2(tokType)) {
      return tokType.LABEL;
    } else {
      return tokType.name;
    }
  }
  function hasTokenLabel2(obj) {
    return isString_default(obj.LABEL) && obj.LABEL !== "";
  }
  var PARENT = "parent";
  var CATEGORIES = "categories";
  var LABEL = "label";
  var GROUP = "group";
  var PUSH_MODE = "push_mode";
  var POP_MODE = "pop_mode";
  var LONGER_ALT = "longer_alt";
  var LINE_BREAKS = "line_breaks";
  var START_CHARS_HINT = "start_chars_hint";
  function createToken(config2) {
    return createTokenInternal(config2);
  }
  function createTokenInternal(config2) {
    const pattern = config2.pattern;
    const tokenType = {};
    tokenType.name = config2.name;
    if (!isUndefined_default(pattern)) {
      tokenType.PATTERN = pattern;
    }
    if (has_default(config2, PARENT)) {
      throw "The parent property is no longer supported.\nSee: https://github.com/chevrotain/chevrotain/issues/564#issuecomment-349062346 for details.";
    }
    if (has_default(config2, CATEGORIES)) {
      tokenType.CATEGORIES = config2[CATEGORIES];
    }
    augmentTokenTypes([tokenType]);
    if (has_default(config2, LABEL)) {
      tokenType.LABEL = config2[LABEL];
    }
    if (has_default(config2, GROUP)) {
      tokenType.GROUP = config2[GROUP];
    }
    if (has_default(config2, POP_MODE)) {
      tokenType.POP_MODE = config2[POP_MODE];
    }
    if (has_default(config2, PUSH_MODE)) {
      tokenType.PUSH_MODE = config2[PUSH_MODE];
    }
    if (has_default(config2, LONGER_ALT)) {
      tokenType.LONGER_ALT = config2[LONGER_ALT];
    }
    if (has_default(config2, LINE_BREAKS)) {
      tokenType.LINE_BREAKS = config2[LINE_BREAKS];
    }
    if (has_default(config2, START_CHARS_HINT)) {
      tokenType.START_CHARS_HINT = config2[START_CHARS_HINT];
    }
    return tokenType;
  }
  var EOF = createToken({ name: "EOF", pattern: Lexer.NA });
  augmentTokenTypes([EOF]);
  function createTokenInstance(tokType, image, startOffset, endOffset, startLine, endLine, startColumn, endColumn) {
    return {
      image,
      startOffset,
      endOffset,
      startLine,
      endLine,
      startColumn,
      endColumn,
      tokenTypeIdx: tokType.tokenTypeIdx,
      tokenType: tokType
    };
  }
  function tokenMatcher(token, tokType) {
    return tokenStructuredMatcher(token, tokType);
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/errors_public.js
  var defaultParserErrorProvider = {
    buildMismatchTokenMessage({ expected, actual, previous, ruleName }) {
      const hasLabel = hasTokenLabel2(expected);
      const expectedMsg = hasLabel ? `--> ${tokenLabel2(expected)} <--` : `token of type --> ${expected.name} <--`;
      const msg = `Expecting ${expectedMsg} but found --> '${actual.image}' <--`;
      return msg;
    },
    buildNotAllInputParsedMessage({ firstRedundant, ruleName }) {
      return "Redundant input, expecting EOF but found: " + firstRedundant.image;
    },
    buildNoViableAltMessage({ expectedPathsPerAlt, actual, previous, customUserDescription, ruleName }) {
      const errPrefix = "Expecting: ";
      const actualText = head_default(actual).image;
      const errSuffix = "\nbut found: '" + actualText + "'";
      if (customUserDescription) {
        return errPrefix + customUserDescription + errSuffix;
      } else {
        const allLookAheadPaths = reduce_default(expectedPathsPerAlt, (result, currAltPaths) => result.concat(currAltPaths), []);
        const nextValidTokenSequences = map_default(allLookAheadPaths, (currPath) => `[${map_default(currPath, (currTokenType) => tokenLabel2(currTokenType)).join(", ")}]`);
        const nextValidSequenceItems = map_default(nextValidTokenSequences, (itemMsg, idx) => `  ${idx + 1}. ${itemMsg}`);
        const calculatedDescription = `one of these possible Token sequences:
${nextValidSequenceItems.join("\n")}`;
        return errPrefix + calculatedDescription + errSuffix;
      }
    },
    buildEarlyExitMessage({ expectedIterationPaths, actual, customUserDescription, ruleName }) {
      const errPrefix = "Expecting: ";
      const actualText = head_default(actual).image;
      const errSuffix = "\nbut found: '" + actualText + "'";
      if (customUserDescription) {
        return errPrefix + customUserDescription + errSuffix;
      } else {
        const nextValidTokenSequences = map_default(expectedIterationPaths, (currPath) => `[${map_default(currPath, (currTokenType) => tokenLabel2(currTokenType)).join(",")}]`);
        const calculatedDescription = `expecting at least one iteration which starts with one of these possible Token sequences::
  <${nextValidTokenSequences.join(" ,")}>`;
        return errPrefix + calculatedDescription + errSuffix;
      }
    }
  };
  Object.freeze(defaultParserErrorProvider);
  var defaultGrammarResolverErrorProvider = {
    buildRuleNotFoundError(topLevelRule, undefinedRule) {
      const msg = "Invalid grammar, reference to a rule which is not defined: ->" + undefinedRule.nonTerminalName + "<-\ninside top level rule: ->" + topLevelRule.name + "<-";
      return msg;
    }
  };
  var defaultGrammarValidatorErrorProvider = {
    buildDuplicateFoundError(topLevelRule, duplicateProds) {
      function getExtraProductionArgument2(prod) {
        if (prod instanceof Terminal) {
          return prod.terminalType.name;
        } else if (prod instanceof NonTerminal) {
          return prod.nonTerminalName;
        } else {
          return "";
        }
      }
      const topLevelName = topLevelRule.name;
      const duplicateProd = head_default(duplicateProds);
      const index = duplicateProd.idx;
      const dslName = getProductionDslName(duplicateProd);
      const extraArgument = getExtraProductionArgument2(duplicateProd);
      const hasExplicitIndex = index > 0;
      let msg = `->${dslName}${hasExplicitIndex ? index : ""}<- ${extraArgument ? `with argument: ->${extraArgument}<-` : ""}
                  appears more than once (${duplicateProds.length} times) in the top level rule: ->${topLevelName}<-.                  
                  For further details see: https://chevrotain.io/docs/FAQ.html#NUMERICAL_SUFFIXES 
                  `;
      msg = msg.replace(/[ \t]+/g, " ");
      msg = msg.replace(/\s\s+/g, "\n");
      return msg;
    },
    buildNamespaceConflictError(rule) {
      const errMsg = `Namespace conflict found in grammar.
The grammar has both a Terminal(Token) and a Non-Terminal(Rule) named: <${rule.name}>.
To resolve this make sure each Terminal and Non-Terminal names are unique
This is easy to accomplish by using the convention that Terminal names start with an uppercase letter
and Non-Terminal names start with a lower case letter.`;
      return errMsg;
    },
    buildAlternationPrefixAmbiguityError(options) {
      const pathMsg = map_default(options.prefixPath, (currTok) => tokenLabel2(currTok)).join(", ");
      const occurrence = options.alternation.idx === 0 ? "" : options.alternation.idx;
      const errMsg = `Ambiguous alternatives: <${options.ambiguityIndices.join(" ,")}> due to common lookahead prefix
in <OR${occurrence}> inside <${options.topLevelRule.name}> Rule,
<${pathMsg}> may appears as a prefix path in all these alternatives.
See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#COMMON_PREFIX
For Further details.`;
      return errMsg;
    },
    buildAlternationAmbiguityError(options) {
      const pathMsg = map_default(options.prefixPath, (currtok) => tokenLabel2(currtok)).join(", ");
      const occurrence = options.alternation.idx === 0 ? "" : options.alternation.idx;
      let currMessage = `Ambiguous Alternatives Detected: <${options.ambiguityIndices.join(" ,")}> in <OR${occurrence}> inside <${options.topLevelRule.name}> Rule,
<${pathMsg}> may appears as a prefix path in all these alternatives.
`;
      currMessage = currMessage + `See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#AMBIGUOUS_ALTERNATIVES
For Further details.`;
      return currMessage;
    },
    buildEmptyRepetitionError(options) {
      let dslName = getProductionDslName(options.repetition);
      if (options.repetition.idx !== 0) {
        dslName += options.repetition.idx;
      }
      const errMsg = `The repetition <${dslName}> within Rule <${options.topLevelRule.name}> can never consume any tokens.
This could lead to an infinite loop.`;
      return errMsg;
    },
    // TODO: remove - `errors_public` from nyc.config.js exclude
    //       once this method is fully removed from this file
    buildTokenNameError(options) {
      return "deprecated";
    },
    buildEmptyAlternationError(options) {
      const errMsg = `Ambiguous empty alternative: <${options.emptyChoiceIdx + 1}> in <OR${options.alternation.idx}> inside <${options.topLevelRule.name}> Rule.
Only the last alternative may be an empty alternative.`;
      return errMsg;
    },
    buildTooManyAlternativesError(options) {
      const errMsg = `An Alternation cannot have more than 256 alternatives:
<OR${options.alternation.idx}> inside <${options.topLevelRule.name}> Rule.
 has ${options.alternation.definition.length + 1} alternatives.`;
      return errMsg;
    },
    buildLeftRecursionError(options) {
      const ruleName = options.topLevelRule.name;
      const pathNames = map_default(options.leftRecursionPath, (currRule) => currRule.name);
      const leftRecursivePath = `${ruleName} --> ${pathNames.concat([ruleName]).join(" --> ")}`;
      const errMsg = `Left Recursion found in grammar.
rule: <${ruleName}> can be invoked from itself (directly or indirectly)
without consuming any Tokens. The grammar path that causes this is: 
 ${leftRecursivePath}
 To fix this refactor your grammar to remove the left recursion.
see: https://en.wikipedia.org/wiki/LL_parser#Left_factoring.`;
      return errMsg;
    },
    // TODO: remove - `errors_public` from nyc.config.js exclude
    //       once this method is fully removed from this file
    buildInvalidRuleNameError(options) {
      return "deprecated";
    },
    buildDuplicateRuleNameError(options) {
      let ruleName;
      if (options.topLevelRule instanceof Rule) {
        ruleName = options.topLevelRule.name;
      } else {
        ruleName = options.topLevelRule;
      }
      const errMsg = `Duplicate definition, rule: ->${ruleName}<- is already defined in the grammar: ->${options.grammarName}<-`;
      return errMsg;
    }
  };

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/grammar/resolver.js
  function resolveGrammar(topLevels, errMsgProvider) {
    const refResolver = new GastRefResolverVisitor(topLevels, errMsgProvider);
    refResolver.resolveRefs();
    return refResolver.errors;
  }
  var GastRefResolverVisitor = class extends GAstVisitor {
    constructor(nameToTopRule, errMsgProvider) {
      super();
      this.nameToTopRule = nameToTopRule;
      this.errMsgProvider = errMsgProvider;
      this.errors = [];
    }
    resolveRefs() {
      forEach_default(values_default(this.nameToTopRule), (prod) => {
        this.currTopLevel = prod;
        prod.accept(this);
      });
    }
    visitNonTerminal(node) {
      const ref = this.nameToTopRule[node.nonTerminalName];
      if (!ref) {
        const msg = this.errMsgProvider.buildRuleNotFoundError(this.currTopLevel, node);
        this.errors.push({
          message: msg,
          type: ParserDefinitionErrorType.UNRESOLVED_SUBRULE_REF,
          ruleName: this.currTopLevel.name,
          unresolvedRefName: node.nonTerminalName
        });
      } else {
        node.referencedRule = ref;
      }
    }
  };

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/grammar/interpreter.js
  var AbstractNextPossibleTokensWalker = class extends RestWalker {
    constructor(topProd, path) {
      super();
      this.topProd = topProd;
      this.path = path;
      this.possibleTokTypes = [];
      this.nextProductionName = "";
      this.nextProductionOccurrence = 0;
      this.found = false;
      this.isAtEndOfPath = false;
    }
    startWalking() {
      this.found = false;
      if (this.path.ruleStack[0] !== this.topProd.name) {
        throw Error("The path does not start with the walker's top Rule!");
      }
      this.ruleStack = clone_default(this.path.ruleStack).reverse();
      this.occurrenceStack = clone_default(this.path.occurrenceStack).reverse();
      this.ruleStack.pop();
      this.occurrenceStack.pop();
      this.updateExpectedNext();
      this.walk(this.topProd);
      return this.possibleTokTypes;
    }
    walk(prod, prevRest = []) {
      if (!this.found) {
        super.walk(prod, prevRest);
      }
    }
    walkProdRef(refProd, currRest, prevRest) {
      if (refProd.referencedRule.name === this.nextProductionName && refProd.idx === this.nextProductionOccurrence) {
        const fullRest = currRest.concat(prevRest);
        this.updateExpectedNext();
        this.walk(refProd.referencedRule, fullRest);
      }
    }
    updateExpectedNext() {
      if (isEmpty_default(this.ruleStack)) {
        this.nextProductionName = "";
        this.nextProductionOccurrence = 0;
        this.isAtEndOfPath = true;
      } else {
        this.nextProductionName = this.ruleStack.pop();
        this.nextProductionOccurrence = this.occurrenceStack.pop();
      }
    }
  };
  var NextAfterTokenWalker = class extends AbstractNextPossibleTokensWalker {
    constructor(topProd, path) {
      super(topProd, path);
      this.path = path;
      this.nextTerminalName = "";
      this.nextTerminalOccurrence = 0;
      this.nextTerminalName = this.path.lastTok.name;
      this.nextTerminalOccurrence = this.path.lastTokOccurrence;
    }
    walkTerminal(terminal, currRest, prevRest) {
      if (this.isAtEndOfPath && terminal.terminalType.name === this.nextTerminalName && terminal.idx === this.nextTerminalOccurrence && !this.found) {
        const fullRest = currRest.concat(prevRest);
        const restProd = new Alternative({ definition: fullRest });
        this.possibleTokTypes = first(restProd);
        this.found = true;
      }
    }
  };
  var AbstractNextTerminalAfterProductionWalker = class extends RestWalker {
    constructor(topRule, occurrence) {
      super();
      this.topRule = topRule;
      this.occurrence = occurrence;
      this.result = {
        token: void 0,
        occurrence: void 0,
        isEndOfRule: void 0
      };
    }
    startWalking() {
      this.walk(this.topRule);
      return this.result;
    }
  };
  var NextTerminalAfterManyWalker = class extends AbstractNextTerminalAfterProductionWalker {
    walkMany(manyProd, currRest, prevRest) {
      if (manyProd.idx === this.occurrence) {
        const firstAfterMany = head_default(currRest.concat(prevRest));
        this.result.isEndOfRule = firstAfterMany === void 0;
        if (firstAfterMany instanceof Terminal) {
          this.result.token = firstAfterMany.terminalType;
          this.result.occurrence = firstAfterMany.idx;
        }
      } else {
        super.walkMany(manyProd, currRest, prevRest);
      }
    }
  };
  var NextTerminalAfterManySepWalker = class extends AbstractNextTerminalAfterProductionWalker {
    walkManySep(manySepProd, currRest, prevRest) {
      if (manySepProd.idx === this.occurrence) {
        const firstAfterManySep = head_default(currRest.concat(prevRest));
        this.result.isEndOfRule = firstAfterManySep === void 0;
        if (firstAfterManySep instanceof Terminal) {
          this.result.token = firstAfterManySep.terminalType;
          this.result.occurrence = firstAfterManySep.idx;
        }
      } else {
        super.walkManySep(manySepProd, currRest, prevRest);
      }
    }
  };
  var NextTerminalAfterAtLeastOneWalker = class extends AbstractNextTerminalAfterProductionWalker {
    walkAtLeastOne(atLeastOneProd, currRest, prevRest) {
      if (atLeastOneProd.idx === this.occurrence) {
        const firstAfterAtLeastOne = head_default(currRest.concat(prevRest));
        this.result.isEndOfRule = firstAfterAtLeastOne === void 0;
        if (firstAfterAtLeastOne instanceof Terminal) {
          this.result.token = firstAfterAtLeastOne.terminalType;
          this.result.occurrence = firstAfterAtLeastOne.idx;
        }
      } else {
        super.walkAtLeastOne(atLeastOneProd, currRest, prevRest);
      }
    }
  };
  var NextTerminalAfterAtLeastOneSepWalker = class extends AbstractNextTerminalAfterProductionWalker {
    walkAtLeastOneSep(atleastOneSepProd, currRest, prevRest) {
      if (atleastOneSepProd.idx === this.occurrence) {
        const firstAfterfirstAfterAtLeastOneSep = head_default(currRest.concat(prevRest));
        this.result.isEndOfRule = firstAfterfirstAfterAtLeastOneSep === void 0;
        if (firstAfterfirstAfterAtLeastOneSep instanceof Terminal) {
          this.result.token = firstAfterfirstAfterAtLeastOneSep.terminalType;
          this.result.occurrence = firstAfterfirstAfterAtLeastOneSep.idx;
        }
      } else {
        super.walkAtLeastOneSep(atleastOneSepProd, currRest, prevRest);
      }
    }
  };
  function possiblePathsFrom(targetDef, maxLength, currPath = []) {
    currPath = clone_default(currPath);
    let result = [];
    let i = 0;
    function remainingPathWith(nextDef) {
      return nextDef.concat(drop_default(targetDef, i + 1));
    }
    function getAlternativesForProd(definition) {
      const alternatives = possiblePathsFrom(remainingPathWith(definition), maxLength, currPath);
      return result.concat(alternatives);
    }
    while (currPath.length < maxLength && i < targetDef.length) {
      const prod = targetDef[i];
      if (prod instanceof Alternative) {
        return getAlternativesForProd(prod.definition);
      } else if (prod instanceof NonTerminal) {
        return getAlternativesForProd(prod.definition);
      } else if (prod instanceof Option) {
        result = getAlternativesForProd(prod.definition);
      } else if (prod instanceof RepetitionMandatory) {
        const newDef = prod.definition.concat([
          new Repetition({
            definition: prod.definition
          })
        ]);
        return getAlternativesForProd(newDef);
      } else if (prod instanceof RepetitionMandatoryWithSeparator) {
        const newDef = [
          new Alternative({ definition: prod.definition }),
          new Repetition({
            definition: [new Terminal({ terminalType: prod.separator })].concat(prod.definition)
          })
        ];
        return getAlternativesForProd(newDef);
      } else if (prod instanceof RepetitionWithSeparator) {
        const newDef = prod.definition.concat([
          new Repetition({
            definition: [new Terminal({ terminalType: prod.separator })].concat(prod.definition)
          })
        ]);
        result = getAlternativesForProd(newDef);
      } else if (prod instanceof Repetition) {
        const newDef = prod.definition.concat([
          new Repetition({
            definition: prod.definition
          })
        ]);
        result = getAlternativesForProd(newDef);
      } else if (prod instanceof Alternation) {
        forEach_default(prod.definition, (currAlt) => {
          if (isEmpty_default(currAlt.definition) === false) {
            result = getAlternativesForProd(currAlt.definition);
          }
        });
        return result;
      } else if (prod instanceof Terminal) {
        currPath.push(prod.terminalType);
      } else {
        throw Error("non exhaustive match");
      }
      i++;
    }
    result.push({
      partialPath: currPath,
      suffixDef: drop_default(targetDef, i)
    });
    return result;
  }
  function nextPossibleTokensAfter(initialDef, tokenVector, tokMatcher, maxLookAhead) {
    const EXIT_NON_TERMINAL = "EXIT_NONE_TERMINAL";
    const EXIT_NON_TERMINAL_ARR = [EXIT_NON_TERMINAL];
    const EXIT_ALTERNATIVE = "EXIT_ALTERNATIVE";
    let foundCompletePath = false;
    const tokenVectorLength = tokenVector.length;
    const minimalAlternativesIndex = tokenVectorLength - maxLookAhead - 1;
    const result = [];
    const possiblePaths = [];
    possiblePaths.push({
      idx: -1,
      def: initialDef,
      ruleStack: [],
      occurrenceStack: []
    });
    while (!isEmpty_default(possiblePaths)) {
      const currPath = possiblePaths.pop();
      if (currPath === EXIT_ALTERNATIVE) {
        if (foundCompletePath && last_default(possiblePaths).idx <= minimalAlternativesIndex) {
          possiblePaths.pop();
        }
        continue;
      }
      const currDef = currPath.def;
      const currIdx = currPath.idx;
      const currRuleStack = currPath.ruleStack;
      const currOccurrenceStack = currPath.occurrenceStack;
      if (isEmpty_default(currDef)) {
        continue;
      }
      const prod = currDef[0];
      if (prod === EXIT_NON_TERMINAL) {
        const nextPath = {
          idx: currIdx,
          def: drop_default(currDef),
          ruleStack: dropRight_default(currRuleStack),
          occurrenceStack: dropRight_default(currOccurrenceStack)
        };
        possiblePaths.push(nextPath);
      } else if (prod instanceof Terminal) {
        if (currIdx < tokenVectorLength - 1) {
          const nextIdx = currIdx + 1;
          const actualToken = tokenVector[nextIdx];
          if (tokMatcher(actualToken, prod.terminalType)) {
            const nextPath = {
              idx: nextIdx,
              def: drop_default(currDef),
              ruleStack: currRuleStack,
              occurrenceStack: currOccurrenceStack
            };
            possiblePaths.push(nextPath);
          }
        } else if (currIdx === tokenVectorLength - 1) {
          result.push({
            nextTokenType: prod.terminalType,
            nextTokenOccurrence: prod.idx,
            ruleStack: currRuleStack,
            occurrenceStack: currOccurrenceStack
          });
          foundCompletePath = true;
        } else {
          throw Error("non exhaustive match");
        }
      } else if (prod instanceof NonTerminal) {
        const newRuleStack = clone_default(currRuleStack);
        newRuleStack.push(prod.nonTerminalName);
        const newOccurrenceStack = clone_default(currOccurrenceStack);
        newOccurrenceStack.push(prod.idx);
        const nextPath = {
          idx: currIdx,
          def: prod.definition.concat(EXIT_NON_TERMINAL_ARR, drop_default(currDef)),
          ruleStack: newRuleStack,
          occurrenceStack: newOccurrenceStack
        };
        possiblePaths.push(nextPath);
      } else if (prod instanceof Option) {
        const nextPathWithout = {
          idx: currIdx,
          def: drop_default(currDef),
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack
        };
        possiblePaths.push(nextPathWithout);
        possiblePaths.push(EXIT_ALTERNATIVE);
        const nextPathWith = {
          idx: currIdx,
          def: prod.definition.concat(drop_default(currDef)),
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack
        };
        possiblePaths.push(nextPathWith);
      } else if (prod instanceof RepetitionMandatory) {
        const secondIteration = new Repetition({
          definition: prod.definition,
          idx: prod.idx
        });
        const nextDef = prod.definition.concat([secondIteration], drop_default(currDef));
        const nextPath = {
          idx: currIdx,
          def: nextDef,
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack
        };
        possiblePaths.push(nextPath);
      } else if (prod instanceof RepetitionMandatoryWithSeparator) {
        const separatorGast = new Terminal({
          terminalType: prod.separator
        });
        const secondIteration = new Repetition({
          definition: [separatorGast].concat(prod.definition),
          idx: prod.idx
        });
        const nextDef = prod.definition.concat([secondIteration], drop_default(currDef));
        const nextPath = {
          idx: currIdx,
          def: nextDef,
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack
        };
        possiblePaths.push(nextPath);
      } else if (prod instanceof RepetitionWithSeparator) {
        const nextPathWithout = {
          idx: currIdx,
          def: drop_default(currDef),
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack
        };
        possiblePaths.push(nextPathWithout);
        possiblePaths.push(EXIT_ALTERNATIVE);
        const separatorGast = new Terminal({
          terminalType: prod.separator
        });
        const nthRepetition = new Repetition({
          definition: [separatorGast].concat(prod.definition),
          idx: prod.idx
        });
        const nextDef = prod.definition.concat([nthRepetition], drop_default(currDef));
        const nextPathWith = {
          idx: currIdx,
          def: nextDef,
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack
        };
        possiblePaths.push(nextPathWith);
      } else if (prod instanceof Repetition) {
        const nextPathWithout = {
          idx: currIdx,
          def: drop_default(currDef),
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack
        };
        possiblePaths.push(nextPathWithout);
        possiblePaths.push(EXIT_ALTERNATIVE);
        const nthRepetition = new Repetition({
          definition: prod.definition,
          idx: prod.idx
        });
        const nextDef = prod.definition.concat([nthRepetition], drop_default(currDef));
        const nextPathWith = {
          idx: currIdx,
          def: nextDef,
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack
        };
        possiblePaths.push(nextPathWith);
      } else if (prod instanceof Alternation) {
        for (let i = prod.definition.length - 1; i >= 0; i--) {
          const currAlt = prod.definition[i];
          const currAltPath = {
            idx: currIdx,
            def: currAlt.definition.concat(drop_default(currDef)),
            ruleStack: currRuleStack,
            occurrenceStack: currOccurrenceStack
          };
          possiblePaths.push(currAltPath);
          possiblePaths.push(EXIT_ALTERNATIVE);
        }
      } else if (prod instanceof Alternative) {
        possiblePaths.push({
          idx: currIdx,
          def: prod.definition.concat(drop_default(currDef)),
          ruleStack: currRuleStack,
          occurrenceStack: currOccurrenceStack
        });
      } else if (prod instanceof Rule) {
        possiblePaths.push(expandTopLevelRule(prod, currIdx, currRuleStack, currOccurrenceStack));
      } else {
        throw Error("non exhaustive match");
      }
    }
    return result;
  }
  function expandTopLevelRule(topRule, currIdx, currRuleStack, currOccurrenceStack) {
    const newRuleStack = clone_default(currRuleStack);
    newRuleStack.push(topRule.name);
    const newCurrOccurrenceStack = clone_default(currOccurrenceStack);
    newCurrOccurrenceStack.push(1);
    return {
      idx: currIdx,
      def: topRule.definition,
      ruleStack: newRuleStack,
      occurrenceStack: newCurrOccurrenceStack
    };
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/grammar/lookahead.js
  var PROD_TYPE;
  (function(PROD_TYPE2) {
    PROD_TYPE2[PROD_TYPE2["OPTION"] = 0] = "OPTION";
    PROD_TYPE2[PROD_TYPE2["REPETITION"] = 1] = "REPETITION";
    PROD_TYPE2[PROD_TYPE2["REPETITION_MANDATORY"] = 2] = "REPETITION_MANDATORY";
    PROD_TYPE2[PROD_TYPE2["REPETITION_MANDATORY_WITH_SEPARATOR"] = 3] = "REPETITION_MANDATORY_WITH_SEPARATOR";
    PROD_TYPE2[PROD_TYPE2["REPETITION_WITH_SEPARATOR"] = 4] = "REPETITION_WITH_SEPARATOR";
    PROD_TYPE2[PROD_TYPE2["ALTERNATION"] = 5] = "ALTERNATION";
  })(PROD_TYPE || (PROD_TYPE = {}));
  function getProdType(prod) {
    if (prod instanceof Option || prod === "Option") {
      return PROD_TYPE.OPTION;
    } else if (prod instanceof Repetition || prod === "Repetition") {
      return PROD_TYPE.REPETITION;
    } else if (prod instanceof RepetitionMandatory || prod === "RepetitionMandatory") {
      return PROD_TYPE.REPETITION_MANDATORY;
    } else if (prod instanceof RepetitionMandatoryWithSeparator || prod === "RepetitionMandatoryWithSeparator") {
      return PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR;
    } else if (prod instanceof RepetitionWithSeparator || prod === "RepetitionWithSeparator") {
      return PROD_TYPE.REPETITION_WITH_SEPARATOR;
    } else if (prod instanceof Alternation || prod === "Alternation") {
      return PROD_TYPE.ALTERNATION;
    } else {
      throw Error("non exhaustive match");
    }
  }
  function buildLookaheadFuncForOr(occurrence, ruleGrammar, maxLookahead, hasPredicates, dynamicTokensEnabled, laFuncBuilder) {
    const lookAheadPaths = getLookaheadPathsForOr(occurrence, ruleGrammar, maxLookahead);
    const tokenMatcher2 = areTokenCategoriesNotUsed(lookAheadPaths) ? tokenStructuredMatcherNoCategories : tokenStructuredMatcher;
    return laFuncBuilder(lookAheadPaths, hasPredicates, tokenMatcher2, dynamicTokensEnabled);
  }
  function buildLookaheadFuncForOptionalProd(occurrence, ruleGrammar, k, dynamicTokensEnabled, prodType, lookaheadBuilder) {
    const lookAheadPaths = getLookaheadPathsForOptionalProd(occurrence, ruleGrammar, prodType, k);
    const tokenMatcher2 = areTokenCategoriesNotUsed(lookAheadPaths) ? tokenStructuredMatcherNoCategories : tokenStructuredMatcher;
    return lookaheadBuilder(lookAheadPaths[0], tokenMatcher2, dynamicTokensEnabled);
  }
  function buildAlternativesLookAheadFunc(alts, hasPredicates, tokenMatcher2, dynamicTokensEnabled) {
    const numOfAlts = alts.length;
    const areAllOneTokenLookahead = every_default(alts, (currAlt) => {
      return every_default(currAlt, (currPath) => {
        return currPath.length === 1;
      });
    });
    if (hasPredicates) {
      return function(orAlts) {
        const predicates = map_default(orAlts, (currAlt) => currAlt.GATE);
        for (let t = 0; t < numOfAlts; t++) {
          const currAlt = alts[t];
          const currNumOfPaths = currAlt.length;
          const currPredicate = predicates[t];
          if (currPredicate !== void 0 && currPredicate.call(this) === false) {
            continue;
          }
          nextPath: for (let j = 0; j < currNumOfPaths; j++) {
            const currPath = currAlt[j];
            const currPathLength = currPath.length;
            for (let i = 0; i < currPathLength; i++) {
              const nextToken = this.LA(i + 1);
              if (tokenMatcher2(nextToken, currPath[i]) === false) {
                continue nextPath;
              }
            }
            return t;
          }
        }
        return void 0;
      };
    } else if (areAllOneTokenLookahead && !dynamicTokensEnabled) {
      const singleTokenAlts = map_default(alts, (currAlt) => {
        return flatten_default(currAlt);
      });
      const choiceToAlt = reduce_default(singleTokenAlts, (result, currAlt, idx) => {
        forEach_default(currAlt, (currTokType) => {
          if (!has_default(result, currTokType.tokenTypeIdx)) {
            result[currTokType.tokenTypeIdx] = idx;
          }
          forEach_default(currTokType.categoryMatches, (currExtendingType) => {
            if (!has_default(result, currExtendingType)) {
              result[currExtendingType] = idx;
            }
          });
        });
        return result;
      }, {});
      return function() {
        const nextToken = this.LA(1);
        return choiceToAlt[nextToken.tokenTypeIdx];
      };
    } else {
      return function() {
        for (let t = 0; t < numOfAlts; t++) {
          const currAlt = alts[t];
          const currNumOfPaths = currAlt.length;
          nextPath: for (let j = 0; j < currNumOfPaths; j++) {
            const currPath = currAlt[j];
            const currPathLength = currPath.length;
            for (let i = 0; i < currPathLength; i++) {
              const nextToken = this.LA(i + 1);
              if (tokenMatcher2(nextToken, currPath[i]) === false) {
                continue nextPath;
              }
            }
            return t;
          }
        }
        return void 0;
      };
    }
  }
  function buildSingleAlternativeLookaheadFunction(alt, tokenMatcher2, dynamicTokensEnabled) {
    const areAllOneTokenLookahead = every_default(alt, (currPath) => {
      return currPath.length === 1;
    });
    const numOfPaths = alt.length;
    if (areAllOneTokenLookahead && !dynamicTokensEnabled) {
      const singleTokensTypes = flatten_default(alt);
      if (singleTokensTypes.length === 1 && isEmpty_default(singleTokensTypes[0].categoryMatches)) {
        const expectedTokenType = singleTokensTypes[0];
        const expectedTokenUniqueKey = expectedTokenType.tokenTypeIdx;
        return function() {
          return this.LA(1).tokenTypeIdx === expectedTokenUniqueKey;
        };
      } else {
        const choiceToAlt = reduce_default(singleTokensTypes, (result, currTokType, idx) => {
          result[currTokType.tokenTypeIdx] = true;
          forEach_default(currTokType.categoryMatches, (currExtendingType) => {
            result[currExtendingType] = true;
          });
          return result;
        }, []);
        return function() {
          const nextToken = this.LA(1);
          return choiceToAlt[nextToken.tokenTypeIdx] === true;
        };
      }
    } else {
      return function() {
        nextPath: for (let j = 0; j < numOfPaths; j++) {
          const currPath = alt[j];
          const currPathLength = currPath.length;
          for (let i = 0; i < currPathLength; i++) {
            const nextToken = this.LA(i + 1);
            if (tokenMatcher2(nextToken, currPath[i]) === false) {
              continue nextPath;
            }
          }
          return true;
        }
        return false;
      };
    }
  }
  var RestDefinitionFinderWalker = class extends RestWalker {
    constructor(topProd, targetOccurrence, targetProdType) {
      super();
      this.topProd = topProd;
      this.targetOccurrence = targetOccurrence;
      this.targetProdType = targetProdType;
    }
    startWalking() {
      this.walk(this.topProd);
      return this.restDef;
    }
    checkIsTarget(node, expectedProdType, currRest, prevRest) {
      if (node.idx === this.targetOccurrence && this.targetProdType === expectedProdType) {
        this.restDef = currRest.concat(prevRest);
        return true;
      }
      return false;
    }
    walkOption(optionProd, currRest, prevRest) {
      if (!this.checkIsTarget(optionProd, PROD_TYPE.OPTION, currRest, prevRest)) {
        super.walkOption(optionProd, currRest, prevRest);
      }
    }
    walkAtLeastOne(atLeastOneProd, currRest, prevRest) {
      if (!this.checkIsTarget(atLeastOneProd, PROD_TYPE.REPETITION_MANDATORY, currRest, prevRest)) {
        super.walkOption(atLeastOneProd, currRest, prevRest);
      }
    }
    walkAtLeastOneSep(atLeastOneSepProd, currRest, prevRest) {
      if (!this.checkIsTarget(atLeastOneSepProd, PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR, currRest, prevRest)) {
        super.walkOption(atLeastOneSepProd, currRest, prevRest);
      }
    }
    walkMany(manyProd, currRest, prevRest) {
      if (!this.checkIsTarget(manyProd, PROD_TYPE.REPETITION, currRest, prevRest)) {
        super.walkOption(manyProd, currRest, prevRest);
      }
    }
    walkManySep(manySepProd, currRest, prevRest) {
      if (!this.checkIsTarget(manySepProd, PROD_TYPE.REPETITION_WITH_SEPARATOR, currRest, prevRest)) {
        super.walkOption(manySepProd, currRest, prevRest);
      }
    }
  };
  var InsideDefinitionFinderVisitor = class extends GAstVisitor {
    constructor(targetOccurrence, targetProdType, targetRef) {
      super();
      this.targetOccurrence = targetOccurrence;
      this.targetProdType = targetProdType;
      this.targetRef = targetRef;
      this.result = [];
    }
    checkIsTarget(node, expectedProdName) {
      if (node.idx === this.targetOccurrence && this.targetProdType === expectedProdName && (this.targetRef === void 0 || node === this.targetRef)) {
        this.result = node.definition;
      }
    }
    visitOption(node) {
      this.checkIsTarget(node, PROD_TYPE.OPTION);
    }
    visitRepetition(node) {
      this.checkIsTarget(node, PROD_TYPE.REPETITION);
    }
    visitRepetitionMandatory(node) {
      this.checkIsTarget(node, PROD_TYPE.REPETITION_MANDATORY);
    }
    visitRepetitionMandatoryWithSeparator(node) {
      this.checkIsTarget(node, PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR);
    }
    visitRepetitionWithSeparator(node) {
      this.checkIsTarget(node, PROD_TYPE.REPETITION_WITH_SEPARATOR);
    }
    visitAlternation(node) {
      this.checkIsTarget(node, PROD_TYPE.ALTERNATION);
    }
  };
  function initializeArrayOfArrays(size) {
    const result = new Array(size);
    for (let i = 0; i < size; i++) {
      result[i] = [];
    }
    return result;
  }
  function pathToHashKeys(path) {
    let keys2 = [""];
    for (let i = 0; i < path.length; i++) {
      const tokType = path[i];
      const longerKeys = [];
      for (let j = 0; j < keys2.length; j++) {
        const currShorterKey = keys2[j];
        longerKeys.push(currShorterKey + "_" + tokType.tokenTypeIdx);
        for (let t = 0; t < tokType.categoryMatches.length; t++) {
          const categoriesKeySuffix = "_" + tokType.categoryMatches[t];
          longerKeys.push(currShorterKey + categoriesKeySuffix);
        }
      }
      keys2 = longerKeys;
    }
    return keys2;
  }
  function isUniquePrefixHash(altKnownPathsKeys, searchPathKeys, idx) {
    for (let currAltIdx = 0; currAltIdx < altKnownPathsKeys.length; currAltIdx++) {
      if (currAltIdx === idx) {
        continue;
      }
      const otherAltKnownPathsKeys = altKnownPathsKeys[currAltIdx];
      for (let searchIdx = 0; searchIdx < searchPathKeys.length; searchIdx++) {
        const searchKey = searchPathKeys[searchIdx];
        if (otherAltKnownPathsKeys[searchKey] === true) {
          return false;
        }
      }
    }
    return true;
  }
  function lookAheadSequenceFromAlternatives(altsDefs, k) {
    const partialAlts = map_default(altsDefs, (currAlt) => possiblePathsFrom([currAlt], 1));
    const finalResult = initializeArrayOfArrays(partialAlts.length);
    const altsHashes = map_default(partialAlts, (currAltPaths) => {
      const dict = {};
      forEach_default(currAltPaths, (item) => {
        const keys2 = pathToHashKeys(item.partialPath);
        forEach_default(keys2, (currKey) => {
          dict[currKey] = true;
        });
      });
      return dict;
    });
    let newData = partialAlts;
    for (let pathLength = 1; pathLength <= k; pathLength++) {
      const currDataset = newData;
      newData = initializeArrayOfArrays(currDataset.length);
      for (let altIdx = 0; altIdx < currDataset.length; altIdx++) {
        const currAltPathsAndSuffixes = currDataset[altIdx];
        for (let currPathIdx = 0; currPathIdx < currAltPathsAndSuffixes.length; currPathIdx++) {
          const currPathPrefix = currAltPathsAndSuffixes[currPathIdx].partialPath;
          const suffixDef = currAltPathsAndSuffixes[currPathIdx].suffixDef;
          const prefixKeys = pathToHashKeys(currPathPrefix);
          const isUnique = isUniquePrefixHash(altsHashes, prefixKeys, altIdx);
          if (isUnique || isEmpty_default(suffixDef) || currPathPrefix.length === k) {
            const currAltResult = finalResult[altIdx];
            if (containsPath(currAltResult, currPathPrefix) === false) {
              currAltResult.push(currPathPrefix);
              for (let j = 0; j < prefixKeys.length; j++) {
                const currKey = prefixKeys[j];
                altsHashes[altIdx][currKey] = true;
              }
            }
          } else {
            const newPartialPathsAndSuffixes = possiblePathsFrom(suffixDef, pathLength + 1, currPathPrefix);
            newData[altIdx] = newData[altIdx].concat(newPartialPathsAndSuffixes);
            forEach_default(newPartialPathsAndSuffixes, (item) => {
              const prefixKeys2 = pathToHashKeys(item.partialPath);
              forEach_default(prefixKeys2, (key) => {
                altsHashes[altIdx][key] = true;
              });
            });
          }
        }
      }
    }
    return finalResult;
  }
  function getLookaheadPathsForOr(occurrence, ruleGrammar, k, orProd) {
    const visitor = new InsideDefinitionFinderVisitor(occurrence, PROD_TYPE.ALTERNATION, orProd);
    ruleGrammar.accept(visitor);
    return lookAheadSequenceFromAlternatives(visitor.result, k);
  }
  function getLookaheadPathsForOptionalProd(occurrence, ruleGrammar, prodType, k) {
    const insideDefVisitor = new InsideDefinitionFinderVisitor(occurrence, prodType);
    ruleGrammar.accept(insideDefVisitor);
    const insideDef = insideDefVisitor.result;
    const afterDefWalker = new RestDefinitionFinderWalker(ruleGrammar, occurrence, prodType);
    const afterDef = afterDefWalker.startWalking();
    const insideFlat = new Alternative({ definition: insideDef });
    const afterFlat = new Alternative({ definition: afterDef });
    return lookAheadSequenceFromAlternatives([insideFlat, afterFlat], k);
  }
  function containsPath(alternative, searchPath) {
    compareOtherPath: for (let i = 0; i < alternative.length; i++) {
      const otherPath = alternative[i];
      if (otherPath.length !== searchPath.length) {
        continue;
      }
      for (let j = 0; j < otherPath.length; j++) {
        const searchTok = searchPath[j];
        const otherTok = otherPath[j];
        const matchingTokens = searchTok === otherTok || otherTok.categoryMatchesMap[searchTok.tokenTypeIdx] !== void 0;
        if (matchingTokens === false) {
          continue compareOtherPath;
        }
      }
      return true;
    }
    return false;
  }
  function isStrictPrefixOfPath(prefix, other) {
    return prefix.length < other.length && every_default(prefix, (tokType, idx) => {
      const otherTokType = other[idx];
      return tokType === otherTokType || otherTokType.categoryMatchesMap[tokType.tokenTypeIdx];
    });
  }
  function areTokenCategoriesNotUsed(lookAheadPaths) {
    return every_default(lookAheadPaths, (singleAltPaths) => every_default(singleAltPaths, (singlePath) => every_default(singlePath, (token) => isEmpty_default(token.categoryMatches))));
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/grammar/checks.js
  function validateLookahead(options) {
    const lookaheadValidationErrorMessages = options.lookaheadStrategy.validate({
      rules: options.rules,
      tokenTypes: options.tokenTypes,
      grammarName: options.grammarName
    });
    return map_default(lookaheadValidationErrorMessages, (errorMessage) => Object.assign({ type: ParserDefinitionErrorType.CUSTOM_LOOKAHEAD_VALIDATION }, errorMessage));
  }
  function validateGrammar(topLevels, tokenTypes, errMsgProvider, grammarName) {
    const duplicateErrors = flatMap_default(topLevels, (currTopLevel) => validateDuplicateProductions(currTopLevel, errMsgProvider));
    const termsNamespaceConflictErrors = checkTerminalAndNoneTerminalsNameSpace(topLevels, tokenTypes, errMsgProvider);
    const tooManyAltsErrors = flatMap_default(topLevels, (curRule) => validateTooManyAlts(curRule, errMsgProvider));
    const duplicateRulesError = flatMap_default(topLevels, (curRule) => validateRuleDoesNotAlreadyExist(curRule, topLevels, grammarName, errMsgProvider));
    return duplicateErrors.concat(termsNamespaceConflictErrors, tooManyAltsErrors, duplicateRulesError);
  }
  function validateDuplicateProductions(topLevelRule, errMsgProvider) {
    const collectorVisitor2 = new OccurrenceValidationCollector();
    topLevelRule.accept(collectorVisitor2);
    const allRuleProductions = collectorVisitor2.allProductions;
    const productionGroups = groupBy_default(allRuleProductions, identifyProductionForDuplicates);
    const duplicates = pickBy_default(productionGroups, (currGroup) => {
      return currGroup.length > 1;
    });
    const errors = map_default(values_default(duplicates), (currDuplicates) => {
      const firstProd = head_default(currDuplicates);
      const msg = errMsgProvider.buildDuplicateFoundError(topLevelRule, currDuplicates);
      const dslName = getProductionDslName(firstProd);
      const defError = {
        message: msg,
        type: ParserDefinitionErrorType.DUPLICATE_PRODUCTIONS,
        ruleName: topLevelRule.name,
        dslName,
        occurrence: firstProd.idx
      };
      const param = getExtraProductionArgument(firstProd);
      if (param) {
        defError.parameter = param;
      }
      return defError;
    });
    return errors;
  }
  function identifyProductionForDuplicates(prod) {
    return `${getProductionDslName(prod)}_#_${prod.idx}_#_${getExtraProductionArgument(prod)}`;
  }
  function getExtraProductionArgument(prod) {
    if (prod instanceof Terminal) {
      return prod.terminalType.name;
    } else if (prod instanceof NonTerminal) {
      return prod.nonTerminalName;
    } else {
      return "";
    }
  }
  var OccurrenceValidationCollector = class extends GAstVisitor {
    constructor() {
      super(...arguments);
      this.allProductions = [];
    }
    visitNonTerminal(subrule) {
      this.allProductions.push(subrule);
    }
    visitOption(option) {
      this.allProductions.push(option);
    }
    visitRepetitionWithSeparator(manySep) {
      this.allProductions.push(manySep);
    }
    visitRepetitionMandatory(atLeastOne) {
      this.allProductions.push(atLeastOne);
    }
    visitRepetitionMandatoryWithSeparator(atLeastOneSep) {
      this.allProductions.push(atLeastOneSep);
    }
    visitRepetition(many) {
      this.allProductions.push(many);
    }
    visitAlternation(or) {
      this.allProductions.push(or);
    }
    visitTerminal(terminal) {
      this.allProductions.push(terminal);
    }
  };
  function validateRuleDoesNotAlreadyExist(rule, allRules, className, errMsgProvider) {
    const errors = [];
    const occurrences = reduce_default(allRules, (result, curRule) => {
      if (curRule.name === rule.name) {
        return result + 1;
      }
      return result;
    }, 0);
    if (occurrences > 1) {
      const errMsg = errMsgProvider.buildDuplicateRuleNameError({
        topLevelRule: rule,
        grammarName: className
      });
      errors.push({
        message: errMsg,
        type: ParserDefinitionErrorType.DUPLICATE_RULE_NAME,
        ruleName: rule.name
      });
    }
    return errors;
  }
  function validateRuleIsOverridden(ruleName, definedRulesNames, className) {
    const errors = [];
    let errMsg;
    if (!includes_default(definedRulesNames, ruleName)) {
      errMsg = `Invalid rule override, rule: ->${ruleName}<- cannot be overridden in the grammar: ->${className}<-as it is not defined in any of the super grammars `;
      errors.push({
        message: errMsg,
        type: ParserDefinitionErrorType.INVALID_RULE_OVERRIDE,
        ruleName
      });
    }
    return errors;
  }
  function validateNoLeftRecursion(topRule, currRule, errMsgProvider, path = []) {
    const errors = [];
    const nextNonTerminals = getFirstNoneTerminal(currRule.definition);
    if (isEmpty_default(nextNonTerminals)) {
      return [];
    } else {
      const ruleName = topRule.name;
      const foundLeftRecursion = includes_default(nextNonTerminals, topRule);
      if (foundLeftRecursion) {
        errors.push({
          message: errMsgProvider.buildLeftRecursionError({
            topLevelRule: topRule,
            leftRecursionPath: path
          }),
          type: ParserDefinitionErrorType.LEFT_RECURSION,
          ruleName
        });
      }
      const validNextSteps = difference_default(nextNonTerminals, path.concat([topRule]));
      const errorsFromNextSteps = flatMap_default(validNextSteps, (currRefRule) => {
        const newPath = clone_default(path);
        newPath.push(currRefRule);
        return validateNoLeftRecursion(topRule, currRefRule, errMsgProvider, newPath);
      });
      return errors.concat(errorsFromNextSteps);
    }
  }
  function getFirstNoneTerminal(definition) {
    let result = [];
    if (isEmpty_default(definition)) {
      return result;
    }
    const firstProd = head_default(definition);
    if (firstProd instanceof NonTerminal) {
      result.push(firstProd.referencedRule);
    } else if (firstProd instanceof Alternative || firstProd instanceof Option || firstProd instanceof RepetitionMandatory || firstProd instanceof RepetitionMandatoryWithSeparator || firstProd instanceof RepetitionWithSeparator || firstProd instanceof Repetition) {
      result = result.concat(getFirstNoneTerminal(firstProd.definition));
    } else if (firstProd instanceof Alternation) {
      result = flatten_default(map_default(firstProd.definition, (currSubDef) => getFirstNoneTerminal(currSubDef.definition)));
    } else if (firstProd instanceof Terminal) {
    } else {
      throw Error("non exhaustive match");
    }
    const isFirstOptional = isOptionalProd(firstProd);
    const hasMore = definition.length > 1;
    if (isFirstOptional && hasMore) {
      const rest = drop_default(definition);
      return result.concat(getFirstNoneTerminal(rest));
    } else {
      return result;
    }
  }
  var OrCollector = class extends GAstVisitor {
    constructor() {
      super(...arguments);
      this.alternations = [];
    }
    visitAlternation(node) {
      this.alternations.push(node);
    }
  };
  function validateEmptyOrAlternative(topLevelRule, errMsgProvider) {
    const orCollector = new OrCollector();
    topLevelRule.accept(orCollector);
    const ors = orCollector.alternations;
    const errors = flatMap_default(ors, (currOr) => {
      const exceptLast = dropRight_default(currOr.definition);
      return flatMap_default(exceptLast, (currAlternative, currAltIdx) => {
        const possibleFirstInAlt = nextPossibleTokensAfter([currAlternative], [], tokenStructuredMatcher, 1);
        if (isEmpty_default(possibleFirstInAlt)) {
          return [
            {
              message: errMsgProvider.buildEmptyAlternationError({
                topLevelRule,
                alternation: currOr,
                emptyChoiceIdx: currAltIdx
              }),
              type: ParserDefinitionErrorType.NONE_LAST_EMPTY_ALT,
              ruleName: topLevelRule.name,
              occurrence: currOr.idx,
              alternative: currAltIdx + 1
            }
          ];
        } else {
          return [];
        }
      });
    });
    return errors;
  }
  function validateAmbiguousAlternationAlternatives(topLevelRule, globalMaxLookahead, errMsgProvider) {
    const orCollector = new OrCollector();
    topLevelRule.accept(orCollector);
    let ors = orCollector.alternations;
    ors = reject_default(ors, (currOr) => currOr.ignoreAmbiguities === true);
    const errors = flatMap_default(ors, (currOr) => {
      const currOccurrence = currOr.idx;
      const actualMaxLookahead = currOr.maxLookahead || globalMaxLookahead;
      const alternatives = getLookaheadPathsForOr(currOccurrence, topLevelRule, actualMaxLookahead, currOr);
      const altsAmbiguityErrors = checkAlternativesAmbiguities(alternatives, currOr, topLevelRule, errMsgProvider);
      const altsPrefixAmbiguityErrors = checkPrefixAlternativesAmbiguities(alternatives, currOr, topLevelRule, errMsgProvider);
      return altsAmbiguityErrors.concat(altsPrefixAmbiguityErrors);
    });
    return errors;
  }
  var RepetitionCollector = class extends GAstVisitor {
    constructor() {
      super(...arguments);
      this.allProductions = [];
    }
    visitRepetitionWithSeparator(manySep) {
      this.allProductions.push(manySep);
    }
    visitRepetitionMandatory(atLeastOne) {
      this.allProductions.push(atLeastOne);
    }
    visitRepetitionMandatoryWithSeparator(atLeastOneSep) {
      this.allProductions.push(atLeastOneSep);
    }
    visitRepetition(many) {
      this.allProductions.push(many);
    }
  };
  function validateTooManyAlts(topLevelRule, errMsgProvider) {
    const orCollector = new OrCollector();
    topLevelRule.accept(orCollector);
    const ors = orCollector.alternations;
    const errors = flatMap_default(ors, (currOr) => {
      if (currOr.definition.length > 255) {
        return [
          {
            message: errMsgProvider.buildTooManyAlternativesError({
              topLevelRule,
              alternation: currOr
            }),
            type: ParserDefinitionErrorType.TOO_MANY_ALTS,
            ruleName: topLevelRule.name,
            occurrence: currOr.idx
          }
        ];
      } else {
        return [];
      }
    });
    return errors;
  }
  function validateSomeNonEmptyLookaheadPath(topLevelRules, maxLookahead, errMsgProvider) {
    const errors = [];
    forEach_default(topLevelRules, (currTopRule) => {
      const collectorVisitor2 = new RepetitionCollector();
      currTopRule.accept(collectorVisitor2);
      const allRuleProductions = collectorVisitor2.allProductions;
      forEach_default(allRuleProductions, (currProd) => {
        const prodType = getProdType(currProd);
        const actualMaxLookahead = currProd.maxLookahead || maxLookahead;
        const currOccurrence = currProd.idx;
        const paths = getLookaheadPathsForOptionalProd(currOccurrence, currTopRule, prodType, actualMaxLookahead);
        const pathsInsideProduction = paths[0];
        if (isEmpty_default(flatten_default(pathsInsideProduction))) {
          const errMsg = errMsgProvider.buildEmptyRepetitionError({
            topLevelRule: currTopRule,
            repetition: currProd
          });
          errors.push({
            message: errMsg,
            type: ParserDefinitionErrorType.NO_NON_EMPTY_LOOKAHEAD,
            ruleName: currTopRule.name
          });
        }
      });
    });
    return errors;
  }
  function checkAlternativesAmbiguities(alternatives, alternation, rule, errMsgProvider) {
    const foundAmbiguousPaths = [];
    const identicalAmbiguities = reduce_default(alternatives, (result, currAlt, currAltIdx) => {
      if (alternation.definition[currAltIdx].ignoreAmbiguities === true) {
        return result;
      }
      forEach_default(currAlt, (currPath) => {
        const altsCurrPathAppearsIn = [currAltIdx];
        forEach_default(alternatives, (currOtherAlt, currOtherAltIdx) => {
          if (currAltIdx !== currOtherAltIdx && containsPath(currOtherAlt, currPath) && // ignore (skip) ambiguities with this "other" alternative
          alternation.definition[currOtherAltIdx].ignoreAmbiguities !== true) {
            altsCurrPathAppearsIn.push(currOtherAltIdx);
          }
        });
        if (altsCurrPathAppearsIn.length > 1 && !containsPath(foundAmbiguousPaths, currPath)) {
          foundAmbiguousPaths.push(currPath);
          result.push({
            alts: altsCurrPathAppearsIn,
            path: currPath
          });
        }
      });
      return result;
    }, []);
    const currErrors = map_default(identicalAmbiguities, (currAmbDescriptor) => {
      const ambgIndices = map_default(currAmbDescriptor.alts, (currAltIdx) => currAltIdx + 1);
      const currMessage = errMsgProvider.buildAlternationAmbiguityError({
        topLevelRule: rule,
        alternation,
        ambiguityIndices: ambgIndices,
        prefixPath: currAmbDescriptor.path
      });
      return {
        message: currMessage,
        type: ParserDefinitionErrorType.AMBIGUOUS_ALTS,
        ruleName: rule.name,
        occurrence: alternation.idx,
        alternatives: currAmbDescriptor.alts
      };
    });
    return currErrors;
  }
  function checkPrefixAlternativesAmbiguities(alternatives, alternation, rule, errMsgProvider) {
    const pathsAndIndices = reduce_default(alternatives, (result, currAlt, idx) => {
      const currPathsAndIdx = map_default(currAlt, (currPath) => {
        return { idx, path: currPath };
      });
      return result.concat(currPathsAndIdx);
    }, []);
    const errors = compact_default(flatMap_default(pathsAndIndices, (currPathAndIdx) => {
      const alternativeGast = alternation.definition[currPathAndIdx.idx];
      if (alternativeGast.ignoreAmbiguities === true) {
        return [];
      }
      const targetIdx = currPathAndIdx.idx;
      const targetPath = currPathAndIdx.path;
      const prefixAmbiguitiesPathsAndIndices = filter_default(pathsAndIndices, (searchPathAndIdx) => {
        return (
          // ignore (skip) ambiguities with this "other" alternative
          alternation.definition[searchPathAndIdx.idx].ignoreAmbiguities !== true && searchPathAndIdx.idx < targetIdx && // checking for strict prefix because identical lookaheads
          // will be be detected using a different validation.
          isStrictPrefixOfPath(searchPathAndIdx.path, targetPath)
        );
      });
      const currPathPrefixErrors = map_default(prefixAmbiguitiesPathsAndIndices, (currAmbPathAndIdx) => {
        const ambgIndices = [currAmbPathAndIdx.idx + 1, targetIdx + 1];
        const occurrence = alternation.idx === 0 ? "" : alternation.idx;
        const message = errMsgProvider.buildAlternationPrefixAmbiguityError({
          topLevelRule: rule,
          alternation,
          ambiguityIndices: ambgIndices,
          prefixPath: currAmbPathAndIdx.path
        });
        return {
          message,
          type: ParserDefinitionErrorType.AMBIGUOUS_PREFIX_ALTS,
          ruleName: rule.name,
          occurrence,
          alternatives: ambgIndices
        };
      });
      return currPathPrefixErrors;
    }));
    return errors;
  }
  function checkTerminalAndNoneTerminalsNameSpace(topLevels, tokenTypes, errMsgProvider) {
    const errors = [];
    const tokenNames = map_default(tokenTypes, (currToken) => currToken.name);
    forEach_default(topLevels, (currRule) => {
      const currRuleName = currRule.name;
      if (includes_default(tokenNames, currRuleName)) {
        const errMsg = errMsgProvider.buildNamespaceConflictError(currRule);
        errors.push({
          message: errMsg,
          type: ParserDefinitionErrorType.CONFLICT_TOKENS_RULES_NAMESPACE,
          ruleName: currRuleName
        });
      }
    });
    return errors;
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/grammar/gast/gast_resolver_public.js
  function resolveGrammar2(options) {
    const actualOptions = defaults_default(options, {
      errMsgProvider: defaultGrammarResolverErrorProvider
    });
    const topRulesTable = {};
    forEach_default(options.rules, (rule) => {
      topRulesTable[rule.name] = rule;
    });
    return resolveGrammar(topRulesTable, actualOptions.errMsgProvider);
  }
  function validateGrammar2(options) {
    options = defaults_default(options, {
      errMsgProvider: defaultGrammarValidatorErrorProvider
    });
    return validateGrammar(options.rules, options.tokenTypes, options.errMsgProvider, options.grammarName);
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/exceptions_public.js
  var MISMATCHED_TOKEN_EXCEPTION = "MismatchedTokenException";
  var NO_VIABLE_ALT_EXCEPTION = "NoViableAltException";
  var EARLY_EXIT_EXCEPTION = "EarlyExitException";
  var NOT_ALL_INPUT_PARSED_EXCEPTION = "NotAllInputParsedException";
  var RECOGNITION_EXCEPTION_NAMES = [
    MISMATCHED_TOKEN_EXCEPTION,
    NO_VIABLE_ALT_EXCEPTION,
    EARLY_EXIT_EXCEPTION,
    NOT_ALL_INPUT_PARSED_EXCEPTION
  ];
  Object.freeze(RECOGNITION_EXCEPTION_NAMES);
  function isRecognitionException(error) {
    return includes_default(RECOGNITION_EXCEPTION_NAMES, error.name);
  }
  var RecognitionException = class extends Error {
    constructor(message, token) {
      super(message);
      this.token = token;
      this.resyncedTokens = [];
      Object.setPrototypeOf(this, new.target.prototype);
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  };
  var MismatchedTokenException = class extends RecognitionException {
    constructor(message, token, previousToken) {
      super(message, token);
      this.previousToken = previousToken;
      this.name = MISMATCHED_TOKEN_EXCEPTION;
    }
  };
  var NoViableAltException = class extends RecognitionException {
    constructor(message, token, previousToken) {
      super(message, token);
      this.previousToken = previousToken;
      this.name = NO_VIABLE_ALT_EXCEPTION;
    }
  };
  var NotAllInputParsedException = class extends RecognitionException {
    constructor(message, token) {
      super(message, token);
      this.name = NOT_ALL_INPUT_PARSED_EXCEPTION;
    }
  };
  var EarlyExitException = class extends RecognitionException {
    constructor(message, token, previousToken) {
      super(message, token);
      this.previousToken = previousToken;
      this.name = EARLY_EXIT_EXCEPTION;
    }
  };

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/parser/traits/recoverable.js
  var EOF_FOLLOW_KEY = {};
  var IN_RULE_RECOVERY_EXCEPTION = "InRuleRecoveryException";
  var InRuleRecoveryException = class extends Error {
    constructor(message) {
      super(message);
      this.name = IN_RULE_RECOVERY_EXCEPTION;
    }
  };
  var Recoverable = class {
    initRecoverable(config2) {
      this.firstAfterRepMap = {};
      this.resyncFollows = {};
      this.recoveryEnabled = has_default(config2, "recoveryEnabled") ? config2.recoveryEnabled : DEFAULT_PARSER_CONFIG.recoveryEnabled;
      if (this.recoveryEnabled) {
        this.attemptInRepetitionRecovery = attemptInRepetitionRecovery;
      }
    }
    getTokenToInsert(tokType) {
      const tokToInsert = createTokenInstance(tokType, "", NaN, NaN, NaN, NaN, NaN, NaN);
      tokToInsert.isInsertedInRecovery = true;
      return tokToInsert;
    }
    canTokenTypeBeInsertedInRecovery(tokType) {
      return true;
    }
    canTokenTypeBeDeletedInRecovery(tokType) {
      return true;
    }
    tryInRepetitionRecovery(grammarRule, grammarRuleArgs, lookAheadFunc, expectedTokType) {
      const reSyncTokType = this.findReSyncTokenType();
      const savedLexerState = this.exportLexerState();
      const resyncedTokens = [];
      let passedResyncPoint = false;
      const nextTokenWithoutResync = this.LA(1);
      let currToken = this.LA(1);
      const generateErrorMessage = () => {
        const previousToken = this.LA(0);
        const msg = this.errorMessageProvider.buildMismatchTokenMessage({
          expected: expectedTokType,
          actual: nextTokenWithoutResync,
          previous: previousToken,
          ruleName: this.getCurrRuleFullName()
        });
        const error = new MismatchedTokenException(msg, nextTokenWithoutResync, this.LA(0));
        error.resyncedTokens = dropRight_default(resyncedTokens);
        this.SAVE_ERROR(error);
      };
      while (!passedResyncPoint) {
        if (this.tokenMatcher(currToken, expectedTokType)) {
          generateErrorMessage();
          return;
        } else if (lookAheadFunc.call(this)) {
          generateErrorMessage();
          grammarRule.apply(this, grammarRuleArgs);
          return;
        } else if (this.tokenMatcher(currToken, reSyncTokType)) {
          passedResyncPoint = true;
        } else {
          currToken = this.SKIP_TOKEN();
          this.addToResyncTokens(currToken, resyncedTokens);
        }
      }
      this.importLexerState(savedLexerState);
    }
    shouldInRepetitionRecoveryBeTried(expectTokAfterLastMatch, nextTokIdx, notStuck) {
      if (notStuck === false) {
        return false;
      }
      if (this.tokenMatcher(this.LA(1), expectTokAfterLastMatch)) {
        return false;
      }
      if (this.isBackTracking()) {
        return false;
      }
      if (this.canPerformInRuleRecovery(expectTokAfterLastMatch, this.getFollowsForInRuleRecovery(expectTokAfterLastMatch, nextTokIdx))) {
        return false;
      }
      return true;
    }
    // Error Recovery functionality
    getFollowsForInRuleRecovery(tokType, tokIdxInRule) {
      const grammarPath = this.getCurrentGrammarPath(tokType, tokIdxInRule);
      const follows = this.getNextPossibleTokenTypes(grammarPath);
      return follows;
    }
    tryInRuleRecovery(expectedTokType, follows) {
      if (this.canRecoverWithSingleTokenInsertion(expectedTokType, follows)) {
        const tokToInsert = this.getTokenToInsert(expectedTokType);
        return tokToInsert;
      }
      if (this.canRecoverWithSingleTokenDeletion(expectedTokType)) {
        const nextTok = this.SKIP_TOKEN();
        this.consumeToken();
        return nextTok;
      }
      throw new InRuleRecoveryException("sad sad panda");
    }
    canPerformInRuleRecovery(expectedToken, follows) {
      return this.canRecoverWithSingleTokenInsertion(expectedToken, follows) || this.canRecoverWithSingleTokenDeletion(expectedToken);
    }
    canRecoverWithSingleTokenInsertion(expectedTokType, follows) {
      if (!this.canTokenTypeBeInsertedInRecovery(expectedTokType)) {
        return false;
      }
      if (isEmpty_default(follows)) {
        return false;
      }
      const mismatchedTok = this.LA(1);
      const isMisMatchedTokInFollows = find_default(follows, (possibleFollowsTokType) => {
        return this.tokenMatcher(mismatchedTok, possibleFollowsTokType);
      }) !== void 0;
      return isMisMatchedTokInFollows;
    }
    canRecoverWithSingleTokenDeletion(expectedTokType) {
      if (!this.canTokenTypeBeDeletedInRecovery(expectedTokType)) {
        return false;
      }
      const isNextTokenWhatIsExpected = this.tokenMatcher(this.LA(2), expectedTokType);
      return isNextTokenWhatIsExpected;
    }
    isInCurrentRuleReSyncSet(tokenTypeIdx) {
      const followKey = this.getCurrFollowKey();
      const currentRuleReSyncSet = this.getFollowSetFromFollowKey(followKey);
      return includes_default(currentRuleReSyncSet, tokenTypeIdx);
    }
    findReSyncTokenType() {
      const allPossibleReSyncTokTypes = this.flattenFollowSet();
      let nextToken = this.LA(1);
      let k = 2;
      while (true) {
        const foundMatch = find_default(allPossibleReSyncTokTypes, (resyncTokType) => {
          const canMatch = tokenMatcher(nextToken, resyncTokType);
          return canMatch;
        });
        if (foundMatch !== void 0) {
          return foundMatch;
        }
        nextToken = this.LA(k);
        k++;
      }
    }
    getCurrFollowKey() {
      if (this.RULE_STACK.length === 1) {
        return EOF_FOLLOW_KEY;
      }
      const currRuleShortName = this.getLastExplicitRuleShortName();
      const currRuleIdx = this.getLastExplicitRuleOccurrenceIndex();
      const prevRuleShortName = this.getPreviousExplicitRuleShortName();
      return {
        ruleName: this.shortRuleNameToFullName(currRuleShortName),
        idxInCallingRule: currRuleIdx,
        inRule: this.shortRuleNameToFullName(prevRuleShortName)
      };
    }
    buildFullFollowKeyStack() {
      const explicitRuleStack = this.RULE_STACK;
      const explicitOccurrenceStack = this.RULE_OCCURRENCE_STACK;
      return map_default(explicitRuleStack, (ruleName, idx) => {
        if (idx === 0) {
          return EOF_FOLLOW_KEY;
        }
        return {
          ruleName: this.shortRuleNameToFullName(ruleName),
          idxInCallingRule: explicitOccurrenceStack[idx],
          inRule: this.shortRuleNameToFullName(explicitRuleStack[idx - 1])
        };
      });
    }
    flattenFollowSet() {
      const followStack = map_default(this.buildFullFollowKeyStack(), (currKey) => {
        return this.getFollowSetFromFollowKey(currKey);
      });
      return flatten_default(followStack);
    }
    getFollowSetFromFollowKey(followKey) {
      if (followKey === EOF_FOLLOW_KEY) {
        return [EOF];
      }
      const followName = followKey.ruleName + followKey.idxInCallingRule + IN + followKey.inRule;
      return this.resyncFollows[followName];
    }
    // It does not make any sense to include a virtual EOF token in the list of resynced tokens
    // as EOF does not really exist and thus does not contain any useful information (line/column numbers)
    addToResyncTokens(token, resyncTokens) {
      if (!this.tokenMatcher(token, EOF)) {
        resyncTokens.push(token);
      }
      return resyncTokens;
    }
    reSyncTo(tokType) {
      const resyncedTokens = [];
      let nextTok = this.LA(1);
      while (this.tokenMatcher(nextTok, tokType) === false) {
        nextTok = this.SKIP_TOKEN();
        this.addToResyncTokens(nextTok, resyncedTokens);
      }
      return dropRight_default(resyncedTokens);
    }
    attemptInRepetitionRecovery(prodFunc, args, lookaheadFunc, dslMethodIdx, prodOccurrence, nextToksWalker, notStuck) {
    }
    getCurrentGrammarPath(tokType, tokIdxInRule) {
      const pathRuleStack = this.getHumanReadableRuleStack();
      const pathOccurrenceStack = clone_default(this.RULE_OCCURRENCE_STACK);
      const grammarPath = {
        ruleStack: pathRuleStack,
        occurrenceStack: pathOccurrenceStack,
        lastTok: tokType,
        lastTokOccurrence: tokIdxInRule
      };
      return grammarPath;
    }
    getHumanReadableRuleStack() {
      return map_default(this.RULE_STACK, (currShortName) => this.shortRuleNameToFullName(currShortName));
    }
  };
  function attemptInRepetitionRecovery(prodFunc, args, lookaheadFunc, dslMethodIdx, prodOccurrence, nextToksWalker, notStuck) {
    const key = this.getKeyForAutomaticLookahead(dslMethodIdx, prodOccurrence);
    let firstAfterRepInfo = this.firstAfterRepMap[key];
    if (firstAfterRepInfo === void 0) {
      const currRuleName = this.getCurrRuleFullName();
      const ruleGrammar = this.getGAstProductions()[currRuleName];
      const walker = new nextToksWalker(ruleGrammar, prodOccurrence);
      firstAfterRepInfo = walker.startWalking();
      this.firstAfterRepMap[key] = firstAfterRepInfo;
    }
    let expectTokAfterLastMatch = firstAfterRepInfo.token;
    let nextTokIdx = firstAfterRepInfo.occurrence;
    const isEndOfRule = firstAfterRepInfo.isEndOfRule;
    if (this.RULE_STACK.length === 1 && isEndOfRule && expectTokAfterLastMatch === void 0) {
      expectTokAfterLastMatch = EOF;
      nextTokIdx = 1;
    }
    if (expectTokAfterLastMatch === void 0 || nextTokIdx === void 0) {
      return;
    }
    if (this.shouldInRepetitionRecoveryBeTried(expectTokAfterLastMatch, nextTokIdx, notStuck)) {
      this.tryInRepetitionRecovery(prodFunc, args, lookaheadFunc, expectTokAfterLastMatch);
    }
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/grammar/keys.js
  var BITS_FOR_METHOD_TYPE = 4;
  var BITS_FOR_OCCURRENCE_IDX = 8;
  var BITS_FOR_ALT_IDX = 8;
  var OR_IDX = 1 << BITS_FOR_OCCURRENCE_IDX;
  var OPTION_IDX = 2 << BITS_FOR_OCCURRENCE_IDX;
  var MANY_IDX = 3 << BITS_FOR_OCCURRENCE_IDX;
  var AT_LEAST_ONE_IDX = 4 << BITS_FOR_OCCURRENCE_IDX;
  var MANY_SEP_IDX = 5 << BITS_FOR_OCCURRENCE_IDX;
  var AT_LEAST_ONE_SEP_IDX = 6 << BITS_FOR_OCCURRENCE_IDX;
  function getKeyForAutomaticLookahead(ruleIdx, dslMethodIdx, occurrence) {
    return occurrence | dslMethodIdx | ruleIdx;
  }
  var BITS_START_FOR_ALT_IDX = 32 - BITS_FOR_ALT_IDX;

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/grammar/llk_lookahead.js
  var LLkLookaheadStrategy = class {
    constructor(options) {
      var _a;
      this.maxLookahead = (_a = options === null || options === void 0 ? void 0 : options.maxLookahead) !== null && _a !== void 0 ? _a : DEFAULT_PARSER_CONFIG.maxLookahead;
    }
    validate(options) {
      const leftRecursionErrors = this.validateNoLeftRecursion(options.rules);
      if (isEmpty_default(leftRecursionErrors)) {
        const emptyAltErrors = this.validateEmptyOrAlternatives(options.rules);
        const ambiguousAltsErrors = this.validateAmbiguousAlternationAlternatives(options.rules, this.maxLookahead);
        const emptyRepetitionErrors = this.validateSomeNonEmptyLookaheadPath(options.rules, this.maxLookahead);
        const allErrors = [
          ...leftRecursionErrors,
          ...emptyAltErrors,
          ...ambiguousAltsErrors,
          ...emptyRepetitionErrors
        ];
        return allErrors;
      }
      return leftRecursionErrors;
    }
    validateNoLeftRecursion(rules) {
      return flatMap_default(rules, (currTopRule) => validateNoLeftRecursion(currTopRule, currTopRule, defaultGrammarValidatorErrorProvider));
    }
    validateEmptyOrAlternatives(rules) {
      return flatMap_default(rules, (currTopRule) => validateEmptyOrAlternative(currTopRule, defaultGrammarValidatorErrorProvider));
    }
    validateAmbiguousAlternationAlternatives(rules, maxLookahead) {
      return flatMap_default(rules, (currTopRule) => validateAmbiguousAlternationAlternatives(currTopRule, maxLookahead, defaultGrammarValidatorErrorProvider));
    }
    validateSomeNonEmptyLookaheadPath(rules, maxLookahead) {
      return validateSomeNonEmptyLookaheadPath(rules, maxLookahead, defaultGrammarValidatorErrorProvider);
    }
    buildLookaheadForAlternation(options) {
      return buildLookaheadFuncForOr(options.prodOccurrence, options.rule, options.maxLookahead, options.hasPredicates, options.dynamicTokensEnabled, buildAlternativesLookAheadFunc);
    }
    buildLookaheadForOptional(options) {
      return buildLookaheadFuncForOptionalProd(options.prodOccurrence, options.rule, options.maxLookahead, options.dynamicTokensEnabled, getProdType(options.prodType), buildSingleAlternativeLookaheadFunction);
    }
  };

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/parser/traits/looksahead.js
  var LooksAhead = class {
    initLooksAhead(config2) {
      this.dynamicTokensEnabled = has_default(config2, "dynamicTokensEnabled") ? config2.dynamicTokensEnabled : DEFAULT_PARSER_CONFIG.dynamicTokensEnabled;
      this.maxLookahead = has_default(config2, "maxLookahead") ? config2.maxLookahead : DEFAULT_PARSER_CONFIG.maxLookahead;
      this.lookaheadStrategy = has_default(config2, "lookaheadStrategy") ? config2.lookaheadStrategy : new LLkLookaheadStrategy({ maxLookahead: this.maxLookahead });
      this.lookAheadFuncsCache = /* @__PURE__ */ new Map();
    }
    preComputeLookaheadFunctions(rules) {
      forEach_default(rules, (currRule) => {
        this.TRACE_INIT(`${currRule.name} Rule Lookahead`, () => {
          const { alternation, repetition, option, repetitionMandatory, repetitionMandatoryWithSeparator, repetitionWithSeparator } = collectMethods(currRule);
          forEach_default(alternation, (currProd) => {
            const prodIdx = currProd.idx === 0 ? "" : currProd.idx;
            this.TRACE_INIT(`${getProductionDslName(currProd)}${prodIdx}`, () => {
              const laFunc = this.lookaheadStrategy.buildLookaheadForAlternation({
                prodOccurrence: currProd.idx,
                rule: currRule,
                maxLookahead: currProd.maxLookahead || this.maxLookahead,
                hasPredicates: currProd.hasPredicates,
                dynamicTokensEnabled: this.dynamicTokensEnabled
              });
              const key = getKeyForAutomaticLookahead(this.fullRuleNameToShort[currRule.name], OR_IDX, currProd.idx);
              this.setLaFuncCache(key, laFunc);
            });
          });
          forEach_default(repetition, (currProd) => {
            this.computeLookaheadFunc(currRule, currProd.idx, MANY_IDX, "Repetition", currProd.maxLookahead, getProductionDslName(currProd));
          });
          forEach_default(option, (currProd) => {
            this.computeLookaheadFunc(currRule, currProd.idx, OPTION_IDX, "Option", currProd.maxLookahead, getProductionDslName(currProd));
          });
          forEach_default(repetitionMandatory, (currProd) => {
            this.computeLookaheadFunc(currRule, currProd.idx, AT_LEAST_ONE_IDX, "RepetitionMandatory", currProd.maxLookahead, getProductionDslName(currProd));
          });
          forEach_default(repetitionMandatoryWithSeparator, (currProd) => {
            this.computeLookaheadFunc(currRule, currProd.idx, AT_LEAST_ONE_SEP_IDX, "RepetitionMandatoryWithSeparator", currProd.maxLookahead, getProductionDslName(currProd));
          });
          forEach_default(repetitionWithSeparator, (currProd) => {
            this.computeLookaheadFunc(currRule, currProd.idx, MANY_SEP_IDX, "RepetitionWithSeparator", currProd.maxLookahead, getProductionDslName(currProd));
          });
        });
      });
    }
    computeLookaheadFunc(rule, prodOccurrence, prodKey, prodType, prodMaxLookahead, dslMethodName) {
      this.TRACE_INIT(`${dslMethodName}${prodOccurrence === 0 ? "" : prodOccurrence}`, () => {
        const laFunc = this.lookaheadStrategy.buildLookaheadForOptional({
          prodOccurrence,
          rule,
          maxLookahead: prodMaxLookahead || this.maxLookahead,
          dynamicTokensEnabled: this.dynamicTokensEnabled,
          prodType
        });
        const key = getKeyForAutomaticLookahead(this.fullRuleNameToShort[rule.name], prodKey, prodOccurrence);
        this.setLaFuncCache(key, laFunc);
      });
    }
    // this actually returns a number, but it is always used as a string (object prop key)
    getKeyForAutomaticLookahead(dslMethodIdx, occurrence) {
      const currRuleShortName = this.getLastExplicitRuleShortName();
      return getKeyForAutomaticLookahead(currRuleShortName, dslMethodIdx, occurrence);
    }
    getLaFuncFromCache(key) {
      return this.lookAheadFuncsCache.get(key);
    }
    /* istanbul ignore next */
    setLaFuncCache(key, value) {
      this.lookAheadFuncsCache.set(key, value);
    }
  };
  var DslMethodsCollectorVisitor = class extends GAstVisitor {
    constructor() {
      super(...arguments);
      this.dslMethods = {
        option: [],
        alternation: [],
        repetition: [],
        repetitionWithSeparator: [],
        repetitionMandatory: [],
        repetitionMandatoryWithSeparator: []
      };
    }
    reset() {
      this.dslMethods = {
        option: [],
        alternation: [],
        repetition: [],
        repetitionWithSeparator: [],
        repetitionMandatory: [],
        repetitionMandatoryWithSeparator: []
      };
    }
    visitOption(option) {
      this.dslMethods.option.push(option);
    }
    visitRepetitionWithSeparator(manySep) {
      this.dslMethods.repetitionWithSeparator.push(manySep);
    }
    visitRepetitionMandatory(atLeastOne) {
      this.dslMethods.repetitionMandatory.push(atLeastOne);
    }
    visitRepetitionMandatoryWithSeparator(atLeastOneSep) {
      this.dslMethods.repetitionMandatoryWithSeparator.push(atLeastOneSep);
    }
    visitRepetition(many) {
      this.dslMethods.repetition.push(many);
    }
    visitAlternation(or) {
      this.dslMethods.alternation.push(or);
    }
  };
  var collectorVisitor = new DslMethodsCollectorVisitor();
  function collectMethods(rule) {
    collectorVisitor.reset();
    rule.accept(collectorVisitor);
    const dslMethods = collectorVisitor.dslMethods;
    collectorVisitor.reset();
    return dslMethods;
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/cst/cst.js
  function setNodeLocationOnlyOffset(currNodeLocation, newLocationInfo) {
    if (isNaN(currNodeLocation.startOffset) === true) {
      currNodeLocation.startOffset = newLocationInfo.startOffset;
      currNodeLocation.endOffset = newLocationInfo.endOffset;
    } else if (currNodeLocation.endOffset < newLocationInfo.endOffset === true) {
      currNodeLocation.endOffset = newLocationInfo.endOffset;
    }
  }
  function setNodeLocationFull(currNodeLocation, newLocationInfo) {
    if (isNaN(currNodeLocation.startOffset) === true) {
      currNodeLocation.startOffset = newLocationInfo.startOffset;
      currNodeLocation.startColumn = newLocationInfo.startColumn;
      currNodeLocation.startLine = newLocationInfo.startLine;
      currNodeLocation.endOffset = newLocationInfo.endOffset;
      currNodeLocation.endColumn = newLocationInfo.endColumn;
      currNodeLocation.endLine = newLocationInfo.endLine;
    } else if (currNodeLocation.endOffset < newLocationInfo.endOffset === true) {
      currNodeLocation.endOffset = newLocationInfo.endOffset;
      currNodeLocation.endColumn = newLocationInfo.endColumn;
      currNodeLocation.endLine = newLocationInfo.endLine;
    }
  }
  function addTerminalToCst(node, token, tokenTypeName) {
    if (node.children[tokenTypeName] === void 0) {
      node.children[tokenTypeName] = [token];
    } else {
      node.children[tokenTypeName].push(token);
    }
  }
  function addNoneTerminalToCst(node, ruleName, ruleResult) {
    if (node.children[ruleName] === void 0) {
      node.children[ruleName] = [ruleResult];
    } else {
      node.children[ruleName].push(ruleResult);
    }
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/lang/lang_extensions.js
  var NAME = "name";
  function defineNameProp(obj, nameValue) {
    Object.defineProperty(obj, NAME, {
      enumerable: false,
      configurable: true,
      writable: false,
      value: nameValue
    });
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/cst/cst_visitor.js
  function defaultVisit(ctx, param) {
    const childrenNames = keys_default(ctx);
    const childrenNamesLength = childrenNames.length;
    for (let i = 0; i < childrenNamesLength; i++) {
      const currChildName = childrenNames[i];
      const currChildArray = ctx[currChildName];
      const currChildArrayLength = currChildArray.length;
      for (let j = 0; j < currChildArrayLength; j++) {
        const currChild = currChildArray[j];
        if (currChild.tokenTypeIdx === void 0) {
          this[currChild.name](currChild.children, param);
        }
      }
    }
  }
  function createBaseSemanticVisitorConstructor(grammarName, ruleNames) {
    const derivedConstructor = function() {
    };
    defineNameProp(derivedConstructor, grammarName + "BaseSemantics");
    const semanticProto = {
      visit: function(cstNode, param) {
        if (isArray_default(cstNode)) {
          cstNode = cstNode[0];
        }
        if (isUndefined_default(cstNode)) {
          return void 0;
        }
        return this[cstNode.name](cstNode.children, param);
      },
      validateVisitor: function() {
        const semanticDefinitionErrors = validateVisitor(this, ruleNames);
        if (!isEmpty_default(semanticDefinitionErrors)) {
          const errorMessages = map_default(semanticDefinitionErrors, (currDefError) => currDefError.msg);
          throw Error(`Errors Detected in CST Visitor <${this.constructor.name}>:
	${errorMessages.join("\n\n").replace(/\n/g, "\n	")}`);
        }
      }
    };
    derivedConstructor.prototype = semanticProto;
    derivedConstructor.prototype.constructor = derivedConstructor;
    derivedConstructor._RULE_NAMES = ruleNames;
    return derivedConstructor;
  }
  function createBaseVisitorConstructorWithDefaults(grammarName, ruleNames, baseConstructor) {
    const derivedConstructor = function() {
    };
    defineNameProp(derivedConstructor, grammarName + "BaseSemanticsWithDefaults");
    const withDefaultsProto = Object.create(baseConstructor.prototype);
    forEach_default(ruleNames, (ruleName) => {
      withDefaultsProto[ruleName] = defaultVisit;
    });
    derivedConstructor.prototype = withDefaultsProto;
    derivedConstructor.prototype.constructor = derivedConstructor;
    return derivedConstructor;
  }
  var CstVisitorDefinitionError;
  (function(CstVisitorDefinitionError2) {
    CstVisitorDefinitionError2[CstVisitorDefinitionError2["REDUNDANT_METHOD"] = 0] = "REDUNDANT_METHOD";
    CstVisitorDefinitionError2[CstVisitorDefinitionError2["MISSING_METHOD"] = 1] = "MISSING_METHOD";
  })(CstVisitorDefinitionError || (CstVisitorDefinitionError = {}));
  function validateVisitor(visitorInstance, ruleNames) {
    const missingErrors = validateMissingCstMethods(visitorInstance, ruleNames);
    return missingErrors;
  }
  function validateMissingCstMethods(visitorInstance, ruleNames) {
    const missingRuleNames = filter_default(ruleNames, (currRuleName) => {
      return isFunction_default(visitorInstance[currRuleName]) === false;
    });
    const errors = map_default(missingRuleNames, (currRuleName) => {
      return {
        msg: `Missing visitor method: <${currRuleName}> on ${visitorInstance.constructor.name} CST Visitor.`,
        type: CstVisitorDefinitionError.MISSING_METHOD,
        methodName: currRuleName
      };
    });
    return compact_default(errors);
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/parser/traits/tree_builder.js
  var TreeBuilder = class {
    initTreeBuilder(config2) {
      this.CST_STACK = [];
      this.outputCst = config2.outputCst;
      this.nodeLocationTracking = has_default(config2, "nodeLocationTracking") ? config2.nodeLocationTracking : DEFAULT_PARSER_CONFIG.nodeLocationTracking;
      if (!this.outputCst) {
        this.cstInvocationStateUpdate = noop_default;
        this.cstFinallyStateUpdate = noop_default;
        this.cstPostTerminal = noop_default;
        this.cstPostNonTerminal = noop_default;
        this.cstPostRule = noop_default;
      } else {
        if (/full/i.test(this.nodeLocationTracking)) {
          if (this.recoveryEnabled) {
            this.setNodeLocationFromToken = setNodeLocationFull;
            this.setNodeLocationFromNode = setNodeLocationFull;
            this.cstPostRule = noop_default;
            this.setInitialNodeLocation = this.setInitialNodeLocationFullRecovery;
          } else {
            this.setNodeLocationFromToken = noop_default;
            this.setNodeLocationFromNode = noop_default;
            this.cstPostRule = this.cstPostRuleFull;
            this.setInitialNodeLocation = this.setInitialNodeLocationFullRegular;
          }
        } else if (/onlyOffset/i.test(this.nodeLocationTracking)) {
          if (this.recoveryEnabled) {
            this.setNodeLocationFromToken = setNodeLocationOnlyOffset;
            this.setNodeLocationFromNode = setNodeLocationOnlyOffset;
            this.cstPostRule = noop_default;
            this.setInitialNodeLocation = this.setInitialNodeLocationOnlyOffsetRecovery;
          } else {
            this.setNodeLocationFromToken = noop_default;
            this.setNodeLocationFromNode = noop_default;
            this.cstPostRule = this.cstPostRuleOnlyOffset;
            this.setInitialNodeLocation = this.setInitialNodeLocationOnlyOffsetRegular;
          }
        } else if (/none/i.test(this.nodeLocationTracking)) {
          this.setNodeLocationFromToken = noop_default;
          this.setNodeLocationFromNode = noop_default;
          this.cstPostRule = noop_default;
          this.setInitialNodeLocation = noop_default;
        } else {
          throw Error(`Invalid <nodeLocationTracking> config option: "${config2.nodeLocationTracking}"`);
        }
      }
    }
    setInitialNodeLocationOnlyOffsetRecovery(cstNode) {
      cstNode.location = {
        startOffset: NaN,
        endOffset: NaN
      };
    }
    setInitialNodeLocationOnlyOffsetRegular(cstNode) {
      cstNode.location = {
        // without error recovery the starting Location of a new CstNode is guaranteed
        // To be the next Token's startOffset (for valid inputs).
        // For invalid inputs there won't be any CSTOutput so this potential
        // inaccuracy does not matter
        startOffset: this.LA(1).startOffset,
        endOffset: NaN
      };
    }
    setInitialNodeLocationFullRecovery(cstNode) {
      cstNode.location = {
        startOffset: NaN,
        startLine: NaN,
        startColumn: NaN,
        endOffset: NaN,
        endLine: NaN,
        endColumn: NaN
      };
    }
    /**
         *  @see setInitialNodeLocationOnlyOffsetRegular for explanation why this work
    
         * @param cstNode
         */
    setInitialNodeLocationFullRegular(cstNode) {
      const nextToken = this.LA(1);
      cstNode.location = {
        startOffset: nextToken.startOffset,
        startLine: nextToken.startLine,
        startColumn: nextToken.startColumn,
        endOffset: NaN,
        endLine: NaN,
        endColumn: NaN
      };
    }
    cstInvocationStateUpdate(fullRuleName) {
      const cstNode = {
        name: fullRuleName,
        children: /* @__PURE__ */ Object.create(null)
      };
      this.setInitialNodeLocation(cstNode);
      this.CST_STACK.push(cstNode);
    }
    cstFinallyStateUpdate() {
      this.CST_STACK.pop();
    }
    cstPostRuleFull(ruleCstNode) {
      const prevToken = this.LA(0);
      const loc = ruleCstNode.location;
      if (loc.startOffset <= prevToken.startOffset === true) {
        loc.endOffset = prevToken.endOffset;
        loc.endLine = prevToken.endLine;
        loc.endColumn = prevToken.endColumn;
      } else {
        loc.startOffset = NaN;
        loc.startLine = NaN;
        loc.startColumn = NaN;
      }
    }
    cstPostRuleOnlyOffset(ruleCstNode) {
      const prevToken = this.LA(0);
      const loc = ruleCstNode.location;
      if (loc.startOffset <= prevToken.startOffset === true) {
        loc.endOffset = prevToken.endOffset;
      } else {
        loc.startOffset = NaN;
      }
    }
    cstPostTerminal(key, consumedToken) {
      const rootCst = this.CST_STACK[this.CST_STACK.length - 1];
      addTerminalToCst(rootCst, consumedToken, key);
      this.setNodeLocationFromToken(rootCst.location, consumedToken);
    }
    cstPostNonTerminal(ruleCstResult, ruleName) {
      const preCstNode = this.CST_STACK[this.CST_STACK.length - 1];
      addNoneTerminalToCst(preCstNode, ruleName, ruleCstResult);
      this.setNodeLocationFromNode(preCstNode.location, ruleCstResult.location);
    }
    getBaseCstVisitorConstructor() {
      if (isUndefined_default(this.baseCstVisitorConstructor)) {
        const newBaseCstVisitorConstructor = createBaseSemanticVisitorConstructor(this.className, keys_default(this.gastProductionsCache));
        this.baseCstVisitorConstructor = newBaseCstVisitorConstructor;
        return newBaseCstVisitorConstructor;
      }
      return this.baseCstVisitorConstructor;
    }
    getBaseCstVisitorConstructorWithDefaults() {
      if (isUndefined_default(this.baseCstVisitorWithDefaultsConstructor)) {
        const newConstructor = createBaseVisitorConstructorWithDefaults(this.className, keys_default(this.gastProductionsCache), this.getBaseCstVisitorConstructor());
        this.baseCstVisitorWithDefaultsConstructor = newConstructor;
        return newConstructor;
      }
      return this.baseCstVisitorWithDefaultsConstructor;
    }
    getLastExplicitRuleShortName() {
      const ruleStack = this.RULE_STACK;
      return ruleStack[ruleStack.length - 1];
    }
    getPreviousExplicitRuleShortName() {
      const ruleStack = this.RULE_STACK;
      return ruleStack[ruleStack.length - 2];
    }
    getLastExplicitRuleOccurrenceIndex() {
      const occurrenceStack = this.RULE_OCCURRENCE_STACK;
      return occurrenceStack[occurrenceStack.length - 1];
    }
  };

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/parser/traits/lexer_adapter.js
  var LexerAdapter = class {
    initLexerAdapter() {
      this.tokVector = [];
      this.tokVectorLength = 0;
      this.currIdx = -1;
    }
    set input(newInput) {
      if (this.selfAnalysisDone !== true) {
        throw Error(`Missing <performSelfAnalysis> invocation at the end of the Parser's constructor.`);
      }
      this.reset();
      this.tokVector = newInput;
      this.tokVectorLength = newInput.length;
    }
    get input() {
      return this.tokVector;
    }
    // skips a token and returns the next token
    SKIP_TOKEN() {
      if (this.currIdx <= this.tokVector.length - 2) {
        this.consumeToken();
        return this.LA(1);
      } else {
        return END_OF_FILE;
      }
    }
    // Lexer (accessing Token vector) related methods which can be overridden to implement lazy lexers
    // or lexers dependent on parser context.
    LA(howMuch) {
      const soughtIdx = this.currIdx + howMuch;
      if (soughtIdx < 0 || this.tokVectorLength <= soughtIdx) {
        return END_OF_FILE;
      } else {
        return this.tokVector[soughtIdx];
      }
    }
    consumeToken() {
      this.currIdx++;
    }
    exportLexerState() {
      return this.currIdx;
    }
    importLexerState(newState) {
      this.currIdx = newState;
    }
    resetLexerState() {
      this.currIdx = -1;
    }
    moveToTerminatedState() {
      this.currIdx = this.tokVector.length - 1;
    }
    getLexerPosition() {
      return this.exportLexerState();
    }
  };

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/parser/traits/recognizer_api.js
  var RecognizerApi = class {
    ACTION(impl) {
      return impl.call(this);
    }
    consume(idx, tokType, options) {
      return this.consumeInternal(tokType, idx, options);
    }
    subrule(idx, ruleToCall, options) {
      return this.subruleInternal(ruleToCall, idx, options);
    }
    option(idx, actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, idx);
    }
    or(idx, altsOrOpts) {
      return this.orInternal(altsOrOpts, idx);
    }
    many(idx, actionORMethodDef) {
      return this.manyInternal(idx, actionORMethodDef);
    }
    atLeastOne(idx, actionORMethodDef) {
      return this.atLeastOneInternal(idx, actionORMethodDef);
    }
    CONSUME(tokType, options) {
      return this.consumeInternal(tokType, 0, options);
    }
    CONSUME1(tokType, options) {
      return this.consumeInternal(tokType, 1, options);
    }
    CONSUME2(tokType, options) {
      return this.consumeInternal(tokType, 2, options);
    }
    CONSUME3(tokType, options) {
      return this.consumeInternal(tokType, 3, options);
    }
    CONSUME4(tokType, options) {
      return this.consumeInternal(tokType, 4, options);
    }
    CONSUME5(tokType, options) {
      return this.consumeInternal(tokType, 5, options);
    }
    CONSUME6(tokType, options) {
      return this.consumeInternal(tokType, 6, options);
    }
    CONSUME7(tokType, options) {
      return this.consumeInternal(tokType, 7, options);
    }
    CONSUME8(tokType, options) {
      return this.consumeInternal(tokType, 8, options);
    }
    CONSUME9(tokType, options) {
      return this.consumeInternal(tokType, 9, options);
    }
    SUBRULE(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 0, options);
    }
    SUBRULE1(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 1, options);
    }
    SUBRULE2(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 2, options);
    }
    SUBRULE3(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 3, options);
    }
    SUBRULE4(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 4, options);
    }
    SUBRULE5(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 5, options);
    }
    SUBRULE6(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 6, options);
    }
    SUBRULE7(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 7, options);
    }
    SUBRULE8(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 8, options);
    }
    SUBRULE9(ruleToCall, options) {
      return this.subruleInternal(ruleToCall, 9, options);
    }
    OPTION(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 0);
    }
    OPTION1(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 1);
    }
    OPTION2(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 2);
    }
    OPTION3(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 3);
    }
    OPTION4(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 4);
    }
    OPTION5(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 5);
    }
    OPTION6(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 6);
    }
    OPTION7(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 7);
    }
    OPTION8(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 8);
    }
    OPTION9(actionORMethodDef) {
      return this.optionInternal(actionORMethodDef, 9);
    }
    OR(altsOrOpts) {
      return this.orInternal(altsOrOpts, 0);
    }
    OR1(altsOrOpts) {
      return this.orInternal(altsOrOpts, 1);
    }
    OR2(altsOrOpts) {
      return this.orInternal(altsOrOpts, 2);
    }
    OR3(altsOrOpts) {
      return this.orInternal(altsOrOpts, 3);
    }
    OR4(altsOrOpts) {
      return this.orInternal(altsOrOpts, 4);
    }
    OR5(altsOrOpts) {
      return this.orInternal(altsOrOpts, 5);
    }
    OR6(altsOrOpts) {
      return this.orInternal(altsOrOpts, 6);
    }
    OR7(altsOrOpts) {
      return this.orInternal(altsOrOpts, 7);
    }
    OR8(altsOrOpts) {
      return this.orInternal(altsOrOpts, 8);
    }
    OR9(altsOrOpts) {
      return this.orInternal(altsOrOpts, 9);
    }
    MANY(actionORMethodDef) {
      this.manyInternal(0, actionORMethodDef);
    }
    MANY1(actionORMethodDef) {
      this.manyInternal(1, actionORMethodDef);
    }
    MANY2(actionORMethodDef) {
      this.manyInternal(2, actionORMethodDef);
    }
    MANY3(actionORMethodDef) {
      this.manyInternal(3, actionORMethodDef);
    }
    MANY4(actionORMethodDef) {
      this.manyInternal(4, actionORMethodDef);
    }
    MANY5(actionORMethodDef) {
      this.manyInternal(5, actionORMethodDef);
    }
    MANY6(actionORMethodDef) {
      this.manyInternal(6, actionORMethodDef);
    }
    MANY7(actionORMethodDef) {
      this.manyInternal(7, actionORMethodDef);
    }
    MANY8(actionORMethodDef) {
      this.manyInternal(8, actionORMethodDef);
    }
    MANY9(actionORMethodDef) {
      this.manyInternal(9, actionORMethodDef);
    }
    MANY_SEP(options) {
      this.manySepFirstInternal(0, options);
    }
    MANY_SEP1(options) {
      this.manySepFirstInternal(1, options);
    }
    MANY_SEP2(options) {
      this.manySepFirstInternal(2, options);
    }
    MANY_SEP3(options) {
      this.manySepFirstInternal(3, options);
    }
    MANY_SEP4(options) {
      this.manySepFirstInternal(4, options);
    }
    MANY_SEP5(options) {
      this.manySepFirstInternal(5, options);
    }
    MANY_SEP6(options) {
      this.manySepFirstInternal(6, options);
    }
    MANY_SEP7(options) {
      this.manySepFirstInternal(7, options);
    }
    MANY_SEP8(options) {
      this.manySepFirstInternal(8, options);
    }
    MANY_SEP9(options) {
      this.manySepFirstInternal(9, options);
    }
    AT_LEAST_ONE(actionORMethodDef) {
      this.atLeastOneInternal(0, actionORMethodDef);
    }
    AT_LEAST_ONE1(actionORMethodDef) {
      return this.atLeastOneInternal(1, actionORMethodDef);
    }
    AT_LEAST_ONE2(actionORMethodDef) {
      this.atLeastOneInternal(2, actionORMethodDef);
    }
    AT_LEAST_ONE3(actionORMethodDef) {
      this.atLeastOneInternal(3, actionORMethodDef);
    }
    AT_LEAST_ONE4(actionORMethodDef) {
      this.atLeastOneInternal(4, actionORMethodDef);
    }
    AT_LEAST_ONE5(actionORMethodDef) {
      this.atLeastOneInternal(5, actionORMethodDef);
    }
    AT_LEAST_ONE6(actionORMethodDef) {
      this.atLeastOneInternal(6, actionORMethodDef);
    }
    AT_LEAST_ONE7(actionORMethodDef) {
      this.atLeastOneInternal(7, actionORMethodDef);
    }
    AT_LEAST_ONE8(actionORMethodDef) {
      this.atLeastOneInternal(8, actionORMethodDef);
    }
    AT_LEAST_ONE9(actionORMethodDef) {
      this.atLeastOneInternal(9, actionORMethodDef);
    }
    AT_LEAST_ONE_SEP(options) {
      this.atLeastOneSepFirstInternal(0, options);
    }
    AT_LEAST_ONE_SEP1(options) {
      this.atLeastOneSepFirstInternal(1, options);
    }
    AT_LEAST_ONE_SEP2(options) {
      this.atLeastOneSepFirstInternal(2, options);
    }
    AT_LEAST_ONE_SEP3(options) {
      this.atLeastOneSepFirstInternal(3, options);
    }
    AT_LEAST_ONE_SEP4(options) {
      this.atLeastOneSepFirstInternal(4, options);
    }
    AT_LEAST_ONE_SEP5(options) {
      this.atLeastOneSepFirstInternal(5, options);
    }
    AT_LEAST_ONE_SEP6(options) {
      this.atLeastOneSepFirstInternal(6, options);
    }
    AT_LEAST_ONE_SEP7(options) {
      this.atLeastOneSepFirstInternal(7, options);
    }
    AT_LEAST_ONE_SEP8(options) {
      this.atLeastOneSepFirstInternal(8, options);
    }
    AT_LEAST_ONE_SEP9(options) {
      this.atLeastOneSepFirstInternal(9, options);
    }
    RULE(name, implementation, config2 = DEFAULT_RULE_CONFIG) {
      if (includes_default(this.definedRulesNames, name)) {
        const errMsg = defaultGrammarValidatorErrorProvider.buildDuplicateRuleNameError({
          topLevelRule: name,
          grammarName: this.className
        });
        const error = {
          message: errMsg,
          type: ParserDefinitionErrorType.DUPLICATE_RULE_NAME,
          ruleName: name
        };
        this.definitionErrors.push(error);
      }
      this.definedRulesNames.push(name);
      const ruleImplementation = this.defineRule(name, implementation, config2);
      this[name] = ruleImplementation;
      return ruleImplementation;
    }
    OVERRIDE_RULE(name, impl, config2 = DEFAULT_RULE_CONFIG) {
      const ruleErrors = validateRuleIsOverridden(name, this.definedRulesNames, this.className);
      this.definitionErrors = this.definitionErrors.concat(ruleErrors);
      const ruleImplementation = this.defineRule(name, impl, config2);
      this[name] = ruleImplementation;
      return ruleImplementation;
    }
    BACKTRACK(grammarRule, args) {
      return function() {
        this.isBackTrackingStack.push(1);
        const orgState = this.saveRecogState();
        try {
          grammarRule.apply(this, args);
          return true;
        } catch (e) {
          if (isRecognitionException(e)) {
            return false;
          } else {
            throw e;
          }
        } finally {
          this.reloadRecogState(orgState);
          this.isBackTrackingStack.pop();
        }
      };
    }
    // GAST export APIs
    getGAstProductions() {
      return this.gastProductionsCache;
    }
    getSerializedGastProductions() {
      return serializeGrammar(values_default(this.gastProductionsCache));
    }
  };

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/parser/traits/recognizer_engine.js
  var RecognizerEngine = class {
    initRecognizerEngine(tokenVocabulary, config2) {
      this.className = this.constructor.name;
      this.shortRuleNameToFull = {};
      this.fullRuleNameToShort = {};
      this.ruleShortNameIdx = 256;
      this.tokenMatcher = tokenStructuredMatcherNoCategories;
      this.subruleIdx = 0;
      this.definedRulesNames = [];
      this.tokensMap = {};
      this.isBackTrackingStack = [];
      this.RULE_STACK = [];
      this.RULE_OCCURRENCE_STACK = [];
      this.gastProductionsCache = {};
      if (has_default(config2, "serializedGrammar")) {
        throw Error("The Parser's configuration can no longer contain a <serializedGrammar> property.\n	See: https://chevrotain.io/docs/changes/BREAKING_CHANGES.html#_6-0-0\n	For Further details.");
      }
      if (isArray_default(tokenVocabulary)) {
        if (isEmpty_default(tokenVocabulary)) {
          throw Error("A Token Vocabulary cannot be empty.\n	Note that the first argument for the parser constructor\n	is no longer a Token vector (since v4.0).");
        }
        if (typeof tokenVocabulary[0].startOffset === "number") {
          throw Error("The Parser constructor no longer accepts a token vector as the first argument.\n	See: https://chevrotain.io/docs/changes/BREAKING_CHANGES.html#_4-0-0\n	For Further details.");
        }
      }
      if (isArray_default(tokenVocabulary)) {
        this.tokensMap = reduce_default(tokenVocabulary, (acc, tokType) => {
          acc[tokType.name] = tokType;
          return acc;
        }, {});
      } else if (has_default(tokenVocabulary, "modes") && every_default(flatten_default(values_default(tokenVocabulary.modes)), isTokenType)) {
        const allTokenTypes2 = flatten_default(values_default(tokenVocabulary.modes));
        const uniqueTokens = uniq_default(allTokenTypes2);
        this.tokensMap = reduce_default(uniqueTokens, (acc, tokType) => {
          acc[tokType.name] = tokType;
          return acc;
        }, {});
      } else if (isObject_default(tokenVocabulary)) {
        this.tokensMap = clone_default(tokenVocabulary);
      } else {
        throw new Error("<tokensDictionary> argument must be An Array of Token constructors, A dictionary of Token constructors or an IMultiModeLexerDefinition");
      }
      this.tokensMap["EOF"] = EOF;
      const allTokenTypes = has_default(tokenVocabulary, "modes") ? flatten_default(values_default(tokenVocabulary.modes)) : values_default(tokenVocabulary);
      const noTokenCategoriesUsed = every_default(allTokenTypes, (tokenConstructor) => isEmpty_default(tokenConstructor.categoryMatches));
      this.tokenMatcher = noTokenCategoriesUsed ? tokenStructuredMatcherNoCategories : tokenStructuredMatcher;
      augmentTokenTypes(values_default(this.tokensMap));
    }
    defineRule(ruleName, impl, config2) {
      if (this.selfAnalysisDone) {
        throw Error(`Grammar rule <${ruleName}> may not be defined after the 'performSelfAnalysis' method has been called'
Make sure that all grammar rule definitions are done before 'performSelfAnalysis' is called.`);
      }
      const resyncEnabled = has_default(config2, "resyncEnabled") ? config2.resyncEnabled : DEFAULT_RULE_CONFIG.resyncEnabled;
      const recoveryValueFunc = has_default(config2, "recoveryValueFunc") ? config2.recoveryValueFunc : DEFAULT_RULE_CONFIG.recoveryValueFunc;
      const shortName = this.ruleShortNameIdx << BITS_FOR_METHOD_TYPE + BITS_FOR_OCCURRENCE_IDX;
      this.ruleShortNameIdx++;
      this.shortRuleNameToFull[shortName] = ruleName;
      this.fullRuleNameToShort[ruleName] = shortName;
      let invokeRuleWithTry;
      if (this.outputCst === true) {
        invokeRuleWithTry = function invokeRuleWithTry2(...args) {
          try {
            this.ruleInvocationStateUpdate(shortName, ruleName, this.subruleIdx);
            impl.apply(this, args);
            const cst = this.CST_STACK[this.CST_STACK.length - 1];
            this.cstPostRule(cst);
            return cst;
          } catch (e) {
            return this.invokeRuleCatch(e, resyncEnabled, recoveryValueFunc);
          } finally {
            this.ruleFinallyStateUpdate();
          }
        };
      } else {
        invokeRuleWithTry = function invokeRuleWithTryCst(...args) {
          try {
            this.ruleInvocationStateUpdate(shortName, ruleName, this.subruleIdx);
            return impl.apply(this, args);
          } catch (e) {
            return this.invokeRuleCatch(e, resyncEnabled, recoveryValueFunc);
          } finally {
            this.ruleFinallyStateUpdate();
          }
        };
      }
      const wrappedGrammarRule = Object.assign(invokeRuleWithTry, { ruleName, originalGrammarAction: impl });
      return wrappedGrammarRule;
    }
    invokeRuleCatch(e, resyncEnabledConfig, recoveryValueFunc) {
      const isFirstInvokedRule = this.RULE_STACK.length === 1;
      const reSyncEnabled = resyncEnabledConfig && !this.isBackTracking() && this.recoveryEnabled;
      if (isRecognitionException(e)) {
        const recogError = e;
        if (reSyncEnabled) {
          const reSyncTokType = this.findReSyncTokenType();
          if (this.isInCurrentRuleReSyncSet(reSyncTokType)) {
            recogError.resyncedTokens = this.reSyncTo(reSyncTokType);
            if (this.outputCst) {
              const partialCstResult = this.CST_STACK[this.CST_STACK.length - 1];
              partialCstResult.recoveredNode = true;
              return partialCstResult;
            } else {
              return recoveryValueFunc(e);
            }
          } else {
            if (this.outputCst) {
              const partialCstResult = this.CST_STACK[this.CST_STACK.length - 1];
              partialCstResult.recoveredNode = true;
              recogError.partialCstResult = partialCstResult;
            }
            throw recogError;
          }
        } else if (isFirstInvokedRule) {
          this.moveToTerminatedState();
          return recoveryValueFunc(e);
        } else {
          throw recogError;
        }
      } else {
        throw e;
      }
    }
    // Implementation of parsing DSL
    optionInternal(actionORMethodDef, occurrence) {
      const key = this.getKeyForAutomaticLookahead(OPTION_IDX, occurrence);
      return this.optionInternalLogic(actionORMethodDef, occurrence, key);
    }
    optionInternalLogic(actionORMethodDef, occurrence, key) {
      let lookAheadFunc = this.getLaFuncFromCache(key);
      let action;
      if (typeof actionORMethodDef !== "function") {
        action = actionORMethodDef.DEF;
        const predicate = actionORMethodDef.GATE;
        if (predicate !== void 0) {
          const orgLookaheadFunction = lookAheadFunc;
          lookAheadFunc = () => {
            return predicate.call(this) && orgLookaheadFunction.call(this);
          };
        }
      } else {
        action = actionORMethodDef;
      }
      if (lookAheadFunc.call(this) === true) {
        return action.call(this);
      }
      return void 0;
    }
    atLeastOneInternal(prodOccurrence, actionORMethodDef) {
      const laKey = this.getKeyForAutomaticLookahead(AT_LEAST_ONE_IDX, prodOccurrence);
      return this.atLeastOneInternalLogic(prodOccurrence, actionORMethodDef, laKey);
    }
    atLeastOneInternalLogic(prodOccurrence, actionORMethodDef, key) {
      let lookAheadFunc = this.getLaFuncFromCache(key);
      let action;
      if (typeof actionORMethodDef !== "function") {
        action = actionORMethodDef.DEF;
        const predicate = actionORMethodDef.GATE;
        if (predicate !== void 0) {
          const orgLookaheadFunction = lookAheadFunc;
          lookAheadFunc = () => {
            return predicate.call(this) && orgLookaheadFunction.call(this);
          };
        }
      } else {
        action = actionORMethodDef;
      }
      if (lookAheadFunc.call(this) === true) {
        let notStuck = this.doSingleRepetition(action);
        while (lookAheadFunc.call(this) === true && notStuck === true) {
          notStuck = this.doSingleRepetition(action);
        }
      } else {
        throw this.raiseEarlyExitException(prodOccurrence, PROD_TYPE.REPETITION_MANDATORY, actionORMethodDef.ERR_MSG);
      }
      this.attemptInRepetitionRecovery(this.atLeastOneInternal, [prodOccurrence, actionORMethodDef], lookAheadFunc, AT_LEAST_ONE_IDX, prodOccurrence, NextTerminalAfterAtLeastOneWalker);
    }
    atLeastOneSepFirstInternal(prodOccurrence, options) {
      const laKey = this.getKeyForAutomaticLookahead(AT_LEAST_ONE_SEP_IDX, prodOccurrence);
      this.atLeastOneSepFirstInternalLogic(prodOccurrence, options, laKey);
    }
    atLeastOneSepFirstInternalLogic(prodOccurrence, options, key) {
      const action = options.DEF;
      const separator = options.SEP;
      const firstIterationLookaheadFunc = this.getLaFuncFromCache(key);
      if (firstIterationLookaheadFunc.call(this) === true) {
        action.call(this);
        const separatorLookAheadFunc = () => {
          return this.tokenMatcher(this.LA(1), separator);
        };
        while (this.tokenMatcher(this.LA(1), separator) === true) {
          this.CONSUME(separator);
          action.call(this);
        }
        this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
          prodOccurrence,
          separator,
          separatorLookAheadFunc,
          action,
          NextTerminalAfterAtLeastOneSepWalker
        ], separatorLookAheadFunc, AT_LEAST_ONE_SEP_IDX, prodOccurrence, NextTerminalAfterAtLeastOneSepWalker);
      } else {
        throw this.raiseEarlyExitException(prodOccurrence, PROD_TYPE.REPETITION_MANDATORY_WITH_SEPARATOR, options.ERR_MSG);
      }
    }
    manyInternal(prodOccurrence, actionORMethodDef) {
      const laKey = this.getKeyForAutomaticLookahead(MANY_IDX, prodOccurrence);
      return this.manyInternalLogic(prodOccurrence, actionORMethodDef, laKey);
    }
    manyInternalLogic(prodOccurrence, actionORMethodDef, key) {
      let lookaheadFunction = this.getLaFuncFromCache(key);
      let action;
      if (typeof actionORMethodDef !== "function") {
        action = actionORMethodDef.DEF;
        const predicate = actionORMethodDef.GATE;
        if (predicate !== void 0) {
          const orgLookaheadFunction = lookaheadFunction;
          lookaheadFunction = () => {
            return predicate.call(this) && orgLookaheadFunction.call(this);
          };
        }
      } else {
        action = actionORMethodDef;
      }
      let notStuck = true;
      while (lookaheadFunction.call(this) === true && notStuck === true) {
        notStuck = this.doSingleRepetition(action);
      }
      this.attemptInRepetitionRecovery(
        this.manyInternal,
        [prodOccurrence, actionORMethodDef],
        lookaheadFunction,
        MANY_IDX,
        prodOccurrence,
        NextTerminalAfterManyWalker,
        // The notStuck parameter is only relevant when "attemptInRepetitionRecovery"
        // is invoked from manyInternal, in the MANY_SEP case and AT_LEAST_ONE[_SEP]
        // An infinite loop cannot occur as:
        // - Either the lookahead is guaranteed to consume something (Single Token Separator)
        // - AT_LEAST_ONE by definition is guaranteed to consume something (or error out).
        notStuck
      );
    }
    manySepFirstInternal(prodOccurrence, options) {
      const laKey = this.getKeyForAutomaticLookahead(MANY_SEP_IDX, prodOccurrence);
      this.manySepFirstInternalLogic(prodOccurrence, options, laKey);
    }
    manySepFirstInternalLogic(prodOccurrence, options, key) {
      const action = options.DEF;
      const separator = options.SEP;
      const firstIterationLaFunc = this.getLaFuncFromCache(key);
      if (firstIterationLaFunc.call(this) === true) {
        action.call(this);
        const separatorLookAheadFunc = () => {
          return this.tokenMatcher(this.LA(1), separator);
        };
        while (this.tokenMatcher(this.LA(1), separator) === true) {
          this.CONSUME(separator);
          action.call(this);
        }
        this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
          prodOccurrence,
          separator,
          separatorLookAheadFunc,
          action,
          NextTerminalAfterManySepWalker
        ], separatorLookAheadFunc, MANY_SEP_IDX, prodOccurrence, NextTerminalAfterManySepWalker);
      }
    }
    repetitionSepSecondInternal(prodOccurrence, separator, separatorLookAheadFunc, action, nextTerminalAfterWalker) {
      while (separatorLookAheadFunc()) {
        this.CONSUME(separator);
        action.call(this);
      }
      this.attemptInRepetitionRecovery(this.repetitionSepSecondInternal, [
        prodOccurrence,
        separator,
        separatorLookAheadFunc,
        action,
        nextTerminalAfterWalker
      ], separatorLookAheadFunc, AT_LEAST_ONE_SEP_IDX, prodOccurrence, nextTerminalAfterWalker);
    }
    doSingleRepetition(action) {
      const beforeIteration = this.getLexerPosition();
      action.call(this);
      const afterIteration = this.getLexerPosition();
      return afterIteration > beforeIteration;
    }
    orInternal(altsOrOpts, occurrence) {
      const laKey = this.getKeyForAutomaticLookahead(OR_IDX, occurrence);
      const alts = isArray_default(altsOrOpts) ? altsOrOpts : altsOrOpts.DEF;
      const laFunc = this.getLaFuncFromCache(laKey);
      const altIdxToTake = laFunc.call(this, alts);
      if (altIdxToTake !== void 0) {
        const chosenAlternative = alts[altIdxToTake];
        return chosenAlternative.ALT.call(this);
      }
      this.raiseNoAltException(occurrence, altsOrOpts.ERR_MSG);
    }
    ruleFinallyStateUpdate() {
      this.RULE_STACK.pop();
      this.RULE_OCCURRENCE_STACK.pop();
      this.cstFinallyStateUpdate();
      if (this.RULE_STACK.length === 0 && this.isAtEndOfInput() === false) {
        const firstRedundantTok = this.LA(1);
        const errMsg = this.errorMessageProvider.buildNotAllInputParsedMessage({
          firstRedundant: firstRedundantTok,
          ruleName: this.getCurrRuleFullName()
        });
        this.SAVE_ERROR(new NotAllInputParsedException(errMsg, firstRedundantTok));
      }
    }
    subruleInternal(ruleToCall, idx, options) {
      let ruleResult;
      try {
        const args = options !== void 0 ? options.ARGS : void 0;
        this.subruleIdx = idx;
        ruleResult = ruleToCall.apply(this, args);
        this.cstPostNonTerminal(ruleResult, options !== void 0 && options.LABEL !== void 0 ? options.LABEL : ruleToCall.ruleName);
        return ruleResult;
      } catch (e) {
        throw this.subruleInternalError(e, options, ruleToCall.ruleName);
      }
    }
    subruleInternalError(e, options, ruleName) {
      if (isRecognitionException(e) && e.partialCstResult !== void 0) {
        this.cstPostNonTerminal(e.partialCstResult, options !== void 0 && options.LABEL !== void 0 ? options.LABEL : ruleName);
        delete e.partialCstResult;
      }
      throw e;
    }
    consumeInternal(tokType, idx, options) {
      let consumedToken;
      try {
        const nextToken = this.LA(1);
        if (this.tokenMatcher(nextToken, tokType) === true) {
          this.consumeToken();
          consumedToken = nextToken;
        } else {
          this.consumeInternalError(tokType, nextToken, options);
        }
      } catch (eFromConsumption) {
        consumedToken = this.consumeInternalRecovery(tokType, idx, eFromConsumption);
      }
      this.cstPostTerminal(options !== void 0 && options.LABEL !== void 0 ? options.LABEL : tokType.name, consumedToken);
      return consumedToken;
    }
    consumeInternalError(tokType, nextToken, options) {
      let msg;
      const previousToken = this.LA(0);
      if (options !== void 0 && options.ERR_MSG) {
        msg = options.ERR_MSG;
      } else {
        msg = this.errorMessageProvider.buildMismatchTokenMessage({
          expected: tokType,
          actual: nextToken,
          previous: previousToken,
          ruleName: this.getCurrRuleFullName()
        });
      }
      throw this.SAVE_ERROR(new MismatchedTokenException(msg, nextToken, previousToken));
    }
    consumeInternalRecovery(tokType, idx, eFromConsumption) {
      if (this.recoveryEnabled && // TODO: more robust checking of the exception type. Perhaps Typescript extending expressions?
      eFromConsumption.name === "MismatchedTokenException" && !this.isBackTracking()) {
        const follows = this.getFollowsForInRuleRecovery(tokType, idx);
        try {
          return this.tryInRuleRecovery(tokType, follows);
        } catch (eFromInRuleRecovery) {
          if (eFromInRuleRecovery.name === IN_RULE_RECOVERY_EXCEPTION) {
            throw eFromConsumption;
          } else {
            throw eFromInRuleRecovery;
          }
        }
      } else {
        throw eFromConsumption;
      }
    }
    saveRecogState() {
      const savedErrors = this.errors;
      const savedRuleStack = clone_default(this.RULE_STACK);
      return {
        errors: savedErrors,
        lexerState: this.exportLexerState(),
        RULE_STACK: savedRuleStack,
        CST_STACK: this.CST_STACK
      };
    }
    reloadRecogState(newState) {
      this.errors = newState.errors;
      this.importLexerState(newState.lexerState);
      this.RULE_STACK = newState.RULE_STACK;
    }
    ruleInvocationStateUpdate(shortName, fullName, idxInCallingRule) {
      this.RULE_OCCURRENCE_STACK.push(idxInCallingRule);
      this.RULE_STACK.push(shortName);
      this.cstInvocationStateUpdate(fullName);
    }
    isBackTracking() {
      return this.isBackTrackingStack.length !== 0;
    }
    getCurrRuleFullName() {
      const shortName = this.getLastExplicitRuleShortName();
      return this.shortRuleNameToFull[shortName];
    }
    shortRuleNameToFullName(shortName) {
      return this.shortRuleNameToFull[shortName];
    }
    isAtEndOfInput() {
      return this.tokenMatcher(this.LA(1), EOF);
    }
    reset() {
      this.resetLexerState();
      this.subruleIdx = 0;
      this.isBackTrackingStack = [];
      this.errors = [];
      this.RULE_STACK = [];
      this.CST_STACK = [];
      this.RULE_OCCURRENCE_STACK = [];
    }
  };

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/parser/traits/error_handler.js
  var ErrorHandler = class {
    initErrorHandler(config2) {
      this._errors = [];
      this.errorMessageProvider = has_default(config2, "errorMessageProvider") ? config2.errorMessageProvider : DEFAULT_PARSER_CONFIG.errorMessageProvider;
    }
    SAVE_ERROR(error) {
      if (isRecognitionException(error)) {
        error.context = {
          ruleStack: this.getHumanReadableRuleStack(),
          ruleOccurrenceStack: clone_default(this.RULE_OCCURRENCE_STACK)
        };
        this._errors.push(error);
        return error;
      } else {
        throw Error("Trying to save an Error which is not a RecognitionException");
      }
    }
    get errors() {
      return clone_default(this._errors);
    }
    set errors(newErrors) {
      this._errors = newErrors;
    }
    // TODO: consider caching the error message computed information
    raiseEarlyExitException(occurrence, prodType, userDefinedErrMsg) {
      const ruleName = this.getCurrRuleFullName();
      const ruleGrammar = this.getGAstProductions()[ruleName];
      const lookAheadPathsPerAlternative = getLookaheadPathsForOptionalProd(occurrence, ruleGrammar, prodType, this.maxLookahead);
      const insideProdPaths = lookAheadPathsPerAlternative[0];
      const actualTokens = [];
      for (let i = 1; i <= this.maxLookahead; i++) {
        actualTokens.push(this.LA(i));
      }
      const msg = this.errorMessageProvider.buildEarlyExitMessage({
        expectedIterationPaths: insideProdPaths,
        actual: actualTokens,
        previous: this.LA(0),
        customUserDescription: userDefinedErrMsg,
        ruleName
      });
      throw this.SAVE_ERROR(new EarlyExitException(msg, this.LA(1), this.LA(0)));
    }
    // TODO: consider caching the error message computed information
    raiseNoAltException(occurrence, errMsgTypes) {
      const ruleName = this.getCurrRuleFullName();
      const ruleGrammar = this.getGAstProductions()[ruleName];
      const lookAheadPathsPerAlternative = getLookaheadPathsForOr(occurrence, ruleGrammar, this.maxLookahead);
      const actualTokens = [];
      for (let i = 1; i <= this.maxLookahead; i++) {
        actualTokens.push(this.LA(i));
      }
      const previousToken = this.LA(0);
      const errMsg = this.errorMessageProvider.buildNoViableAltMessage({
        expectedPathsPerAlt: lookAheadPathsPerAlternative,
        actual: actualTokens,
        previous: previousToken,
        customUserDescription: errMsgTypes,
        ruleName: this.getCurrRuleFullName()
      });
      throw this.SAVE_ERROR(new NoViableAltException(errMsg, this.LA(1), previousToken));
    }
  };

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/parser/traits/context_assist.js
  var ContentAssist = class {
    initContentAssist() {
    }
    computeContentAssist(startRuleName, precedingInput) {
      const startRuleGast = this.gastProductionsCache[startRuleName];
      if (isUndefined_default(startRuleGast)) {
        throw Error(`Rule ->${startRuleName}<- does not exist in this grammar.`);
      }
      return nextPossibleTokensAfter([startRuleGast], precedingInput, this.tokenMatcher, this.maxLookahead);
    }
    // TODO: should this be a member method or a utility? it does not have any state or usage of 'this'...
    // TODO: should this be more explicitly part of the public API?
    getNextPossibleTokenTypes(grammarPath) {
      const topRuleName = head_default(grammarPath.ruleStack);
      const gastProductions = this.getGAstProductions();
      const topProduction = gastProductions[topRuleName];
      const nextPossibleTokenTypes = new NextAfterTokenWalker(topProduction, grammarPath).startWalking();
      return nextPossibleTokenTypes;
    }
  };

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/parser/traits/gast_recorder.js
  var RECORDING_NULL_OBJECT = {
    description: "This Object indicates the Parser is during Recording Phase"
  };
  Object.freeze(RECORDING_NULL_OBJECT);
  var HANDLE_SEPARATOR = true;
  var MAX_METHOD_IDX = Math.pow(2, BITS_FOR_OCCURRENCE_IDX) - 1;
  var RFT = createToken({ name: "RECORDING_PHASE_TOKEN", pattern: Lexer.NA });
  augmentTokenTypes([RFT]);
  var RECORDING_PHASE_TOKEN = createTokenInstance(
    RFT,
    "This IToken indicates the Parser is in Recording Phase\n	See: https://chevrotain.io/docs/guide/internals.html#grammar-recording for details",
    // Using "-1" instead of NaN (as in EOF) because an actual number is less likely to
    // cause errors if the output of LA or CONSUME would be (incorrectly) used during the recording phase.
    -1,
    -1,
    -1,
    -1,
    -1,
    -1
  );
  Object.freeze(RECORDING_PHASE_TOKEN);
  var RECORDING_PHASE_CSTNODE = {
    name: "This CSTNode indicates the Parser is in Recording Phase\n	See: https://chevrotain.io/docs/guide/internals.html#grammar-recording for details",
    children: {}
  };
  var GastRecorder = class {
    initGastRecorder(config2) {
      this.recordingProdStack = [];
      this.RECORDING_PHASE = false;
    }
    enableRecording() {
      this.RECORDING_PHASE = true;
      this.TRACE_INIT("Enable Recording", () => {
        for (let i = 0; i < 10; i++) {
          const idx = i > 0 ? i : "";
          this[`CONSUME${idx}`] = function(arg1, arg2) {
            return this.consumeInternalRecord(arg1, i, arg2);
          };
          this[`SUBRULE${idx}`] = function(arg1, arg2) {
            return this.subruleInternalRecord(arg1, i, arg2);
          };
          this[`OPTION${idx}`] = function(arg1) {
            return this.optionInternalRecord(arg1, i);
          };
          this[`OR${idx}`] = function(arg1) {
            return this.orInternalRecord(arg1, i);
          };
          this[`MANY${idx}`] = function(arg1) {
            this.manyInternalRecord(i, arg1);
          };
          this[`MANY_SEP${idx}`] = function(arg1) {
            this.manySepFirstInternalRecord(i, arg1);
          };
          this[`AT_LEAST_ONE${idx}`] = function(arg1) {
            this.atLeastOneInternalRecord(i, arg1);
          };
          this[`AT_LEAST_ONE_SEP${idx}`] = function(arg1) {
            this.atLeastOneSepFirstInternalRecord(i, arg1);
          };
        }
        this[`consume`] = function(idx, arg1, arg2) {
          return this.consumeInternalRecord(arg1, idx, arg2);
        };
        this[`subrule`] = function(idx, arg1, arg2) {
          return this.subruleInternalRecord(arg1, idx, arg2);
        };
        this[`option`] = function(idx, arg1) {
          return this.optionInternalRecord(arg1, idx);
        };
        this[`or`] = function(idx, arg1) {
          return this.orInternalRecord(arg1, idx);
        };
        this[`many`] = function(idx, arg1) {
          this.manyInternalRecord(idx, arg1);
        };
        this[`atLeastOne`] = function(idx, arg1) {
          this.atLeastOneInternalRecord(idx, arg1);
        };
        this.ACTION = this.ACTION_RECORD;
        this.BACKTRACK = this.BACKTRACK_RECORD;
        this.LA = this.LA_RECORD;
      });
    }
    disableRecording() {
      this.RECORDING_PHASE = false;
      this.TRACE_INIT("Deleting Recording methods", () => {
        const that = this;
        for (let i = 0; i < 10; i++) {
          const idx = i > 0 ? i : "";
          delete that[`CONSUME${idx}`];
          delete that[`SUBRULE${idx}`];
          delete that[`OPTION${idx}`];
          delete that[`OR${idx}`];
          delete that[`MANY${idx}`];
          delete that[`MANY_SEP${idx}`];
          delete that[`AT_LEAST_ONE${idx}`];
          delete that[`AT_LEAST_ONE_SEP${idx}`];
        }
        delete that[`consume`];
        delete that[`subrule`];
        delete that[`option`];
        delete that[`or`];
        delete that[`many`];
        delete that[`atLeastOne`];
        delete that.ACTION;
        delete that.BACKTRACK;
        delete that.LA;
      });
    }
    //   Parser methods are called inside an ACTION?
    //   Maybe try/catch/finally on ACTIONS while disabling the recorders state changes?
    // @ts-expect-error -- noop place holder
    ACTION_RECORD(impl) {
    }
    // Executing backtracking logic will break our recording logic assumptions
    BACKTRACK_RECORD(grammarRule, args) {
      return () => true;
    }
    // LA is part of the official API and may be used for custom lookahead logic
    // by end users who may forget to wrap it in ACTION or inside a GATE
    LA_RECORD(howMuch) {
      return END_OF_FILE;
    }
    topLevelRuleRecord(name, def) {
      try {
        const newTopLevelRule = new Rule({ definition: [], name });
        newTopLevelRule.name = name;
        this.recordingProdStack.push(newTopLevelRule);
        def.call(this);
        this.recordingProdStack.pop();
        return newTopLevelRule;
      } catch (originalError) {
        if (originalError.KNOWN_RECORDER_ERROR !== true) {
          try {
            originalError.message = originalError.message + '\n	 This error was thrown during the "grammar recording phase" For more info see:\n	https://chevrotain.io/docs/guide/internals.html#grammar-recording';
          } catch (mutabilityError) {
            throw originalError;
          }
        }
        throw originalError;
      }
    }
    // Implementation of parsing DSL
    optionInternalRecord(actionORMethodDef, occurrence) {
      return recordProd.call(this, Option, actionORMethodDef, occurrence);
    }
    atLeastOneInternalRecord(occurrence, actionORMethodDef) {
      recordProd.call(this, RepetitionMandatory, actionORMethodDef, occurrence);
    }
    atLeastOneSepFirstInternalRecord(occurrence, options) {
      recordProd.call(this, RepetitionMandatoryWithSeparator, options, occurrence, HANDLE_SEPARATOR);
    }
    manyInternalRecord(occurrence, actionORMethodDef) {
      recordProd.call(this, Repetition, actionORMethodDef, occurrence);
    }
    manySepFirstInternalRecord(occurrence, options) {
      recordProd.call(this, RepetitionWithSeparator, options, occurrence, HANDLE_SEPARATOR);
    }
    orInternalRecord(altsOrOpts, occurrence) {
      return recordOrProd.call(this, altsOrOpts, occurrence);
    }
    subruleInternalRecord(ruleToCall, occurrence, options) {
      assertMethodIdxIsValid(occurrence);
      if (!ruleToCall || has_default(ruleToCall, "ruleName") === false) {
        const error = new Error(`<SUBRULE${getIdxSuffix(occurrence)}> argument is invalid expecting a Parser method reference but got: <${JSON.stringify(ruleToCall)}>
 inside top level rule: <${this.recordingProdStack[0].name}>`);
        error.KNOWN_RECORDER_ERROR = true;
        throw error;
      }
      const prevProd = last_default(this.recordingProdStack);
      const ruleName = ruleToCall.ruleName;
      const newNoneTerminal = new NonTerminal({
        idx: occurrence,
        nonTerminalName: ruleName,
        label: options === null || options === void 0 ? void 0 : options.LABEL,
        // The resolving of the `referencedRule` property will be done once all the Rule's GASTs have been created
        referencedRule: void 0
      });
      prevProd.definition.push(newNoneTerminal);
      return this.outputCst ? RECORDING_PHASE_CSTNODE : RECORDING_NULL_OBJECT;
    }
    consumeInternalRecord(tokType, occurrence, options) {
      assertMethodIdxIsValid(occurrence);
      if (!hasShortKeyProperty(tokType)) {
        const error = new Error(`<CONSUME${getIdxSuffix(occurrence)}> argument is invalid expecting a TokenType reference but got: <${JSON.stringify(tokType)}>
 inside top level rule: <${this.recordingProdStack[0].name}>`);
        error.KNOWN_RECORDER_ERROR = true;
        throw error;
      }
      const prevProd = last_default(this.recordingProdStack);
      const newNoneTerminal = new Terminal({
        idx: occurrence,
        terminalType: tokType,
        label: options === null || options === void 0 ? void 0 : options.LABEL
      });
      prevProd.definition.push(newNoneTerminal);
      return RECORDING_PHASE_TOKEN;
    }
  };
  function recordProd(prodConstructor, mainProdArg, occurrence, handleSep = false) {
    assertMethodIdxIsValid(occurrence);
    const prevProd = last_default(this.recordingProdStack);
    const grammarAction = isFunction_default(mainProdArg) ? mainProdArg : mainProdArg.DEF;
    const newProd = new prodConstructor({ definition: [], idx: occurrence });
    if (handleSep) {
      newProd.separator = mainProdArg.SEP;
    }
    if (has_default(mainProdArg, "MAX_LOOKAHEAD")) {
      newProd.maxLookahead = mainProdArg.MAX_LOOKAHEAD;
    }
    this.recordingProdStack.push(newProd);
    grammarAction.call(this);
    prevProd.definition.push(newProd);
    this.recordingProdStack.pop();
    return RECORDING_NULL_OBJECT;
  }
  function recordOrProd(mainProdArg, occurrence) {
    assertMethodIdxIsValid(occurrence);
    const prevProd = last_default(this.recordingProdStack);
    const hasOptions = isArray_default(mainProdArg) === false;
    const alts = hasOptions === false ? mainProdArg : mainProdArg.DEF;
    const newOrProd = new Alternation({
      definition: [],
      idx: occurrence,
      ignoreAmbiguities: hasOptions && mainProdArg.IGNORE_AMBIGUITIES === true
    });
    if (has_default(mainProdArg, "MAX_LOOKAHEAD")) {
      newOrProd.maxLookahead = mainProdArg.MAX_LOOKAHEAD;
    }
    const hasPredicates = some_default(alts, (currAlt) => isFunction_default(currAlt.GATE));
    newOrProd.hasPredicates = hasPredicates;
    prevProd.definition.push(newOrProd);
    forEach_default(alts, (currAlt) => {
      const currAltFlat = new Alternative({ definition: [] });
      newOrProd.definition.push(currAltFlat);
      if (has_default(currAlt, "IGNORE_AMBIGUITIES")) {
        currAltFlat.ignoreAmbiguities = currAlt.IGNORE_AMBIGUITIES;
      } else if (has_default(currAlt, "GATE")) {
        currAltFlat.ignoreAmbiguities = true;
      }
      this.recordingProdStack.push(currAltFlat);
      currAlt.ALT.call(this);
      this.recordingProdStack.pop();
    });
    return RECORDING_NULL_OBJECT;
  }
  function getIdxSuffix(idx) {
    return idx === 0 ? "" : `${idx}`;
  }
  function assertMethodIdxIsValid(idx) {
    if (idx < 0 || idx > MAX_METHOD_IDX) {
      const error = new Error(
        // The stack trace will contain all the needed details
        `Invalid DSL Method idx value: <${idx}>
	Idx value must be a none negative value smaller than ${MAX_METHOD_IDX + 1}`
      );
      error.KNOWN_RECORDER_ERROR = true;
      throw error;
    }
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/parser/traits/perf_tracer.js
  var PerformanceTracer = class {
    initPerformanceTracer(config2) {
      if (has_default(config2, "traceInitPerf")) {
        const userTraceInitPerf = config2.traceInitPerf;
        const traceIsNumber = typeof userTraceInitPerf === "number";
        this.traceInitMaxIdent = traceIsNumber ? userTraceInitPerf : Infinity;
        this.traceInitPerf = traceIsNumber ? userTraceInitPerf > 0 : userTraceInitPerf;
      } else {
        this.traceInitMaxIdent = 0;
        this.traceInitPerf = DEFAULT_PARSER_CONFIG.traceInitPerf;
      }
      this.traceInitIndent = -1;
    }
    TRACE_INIT(phaseDesc, phaseImpl) {
      if (this.traceInitPerf === true) {
        this.traceInitIndent++;
        const indent = new Array(this.traceInitIndent + 1).join("	");
        if (this.traceInitIndent < this.traceInitMaxIdent) {
          console.log(`${indent}--> <${phaseDesc}>`);
        }
        const { time, value } = timer(phaseImpl);
        const traceMethod = time > 10 ? console.warn : console.log;
        if (this.traceInitIndent < this.traceInitMaxIdent) {
          traceMethod(`${indent}<-- <${phaseDesc}> time: ${time}ms`);
        }
        this.traceInitIndent--;
        return value;
      } else {
        return phaseImpl();
      }
    }
  };

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/parser/utils/apply_mixins.js
  function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach((baseCtor) => {
      const baseProto = baseCtor.prototype;
      Object.getOwnPropertyNames(baseProto).forEach((propName) => {
        if (propName === "constructor") {
          return;
        }
        const basePropDescriptor = Object.getOwnPropertyDescriptor(baseProto, propName);
        if (basePropDescriptor && (basePropDescriptor.get || basePropDescriptor.set)) {
          Object.defineProperty(derivedCtor.prototype, propName, basePropDescriptor);
        } else {
          derivedCtor.prototype[propName] = baseCtor.prototype[propName];
        }
      });
    });
  }

  // node_modules/.pnpm/chevrotain@11.0.3/node_modules/chevrotain/lib/src/parse/parser/parser.js
  var END_OF_FILE = createTokenInstance(EOF, "", NaN, NaN, NaN, NaN, NaN, NaN);
  Object.freeze(END_OF_FILE);
  var DEFAULT_PARSER_CONFIG = Object.freeze({
    recoveryEnabled: false,
    maxLookahead: 3,
    dynamicTokensEnabled: false,
    outputCst: true,
    errorMessageProvider: defaultParserErrorProvider,
    nodeLocationTracking: "none",
    traceInitPerf: false,
    skipValidations: false
  });
  var DEFAULT_RULE_CONFIG = Object.freeze({
    recoveryValueFunc: () => void 0,
    resyncEnabled: true
  });
  var ParserDefinitionErrorType;
  (function(ParserDefinitionErrorType2) {
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["INVALID_RULE_NAME"] = 0] = "INVALID_RULE_NAME";
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["DUPLICATE_RULE_NAME"] = 1] = "DUPLICATE_RULE_NAME";
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["INVALID_RULE_OVERRIDE"] = 2] = "INVALID_RULE_OVERRIDE";
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["DUPLICATE_PRODUCTIONS"] = 3] = "DUPLICATE_PRODUCTIONS";
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["UNRESOLVED_SUBRULE_REF"] = 4] = "UNRESOLVED_SUBRULE_REF";
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["LEFT_RECURSION"] = 5] = "LEFT_RECURSION";
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["NONE_LAST_EMPTY_ALT"] = 6] = "NONE_LAST_EMPTY_ALT";
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["AMBIGUOUS_ALTS"] = 7] = "AMBIGUOUS_ALTS";
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["CONFLICT_TOKENS_RULES_NAMESPACE"] = 8] = "CONFLICT_TOKENS_RULES_NAMESPACE";
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["INVALID_TOKEN_NAME"] = 9] = "INVALID_TOKEN_NAME";
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["NO_NON_EMPTY_LOOKAHEAD"] = 10] = "NO_NON_EMPTY_LOOKAHEAD";
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["AMBIGUOUS_PREFIX_ALTS"] = 11] = "AMBIGUOUS_PREFIX_ALTS";
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["TOO_MANY_ALTS"] = 12] = "TOO_MANY_ALTS";
    ParserDefinitionErrorType2[ParserDefinitionErrorType2["CUSTOM_LOOKAHEAD_VALIDATION"] = 13] = "CUSTOM_LOOKAHEAD_VALIDATION";
  })(ParserDefinitionErrorType || (ParserDefinitionErrorType = {}));
  var Parser = class _Parser {
    /**
     *  @deprecated use the **instance** method with the same name instead
     */
    static performSelfAnalysis(parserInstance2) {
      throw Error("The **static** `performSelfAnalysis` method has been deprecated.	\nUse the **instance** method with the same name instead.");
    }
    performSelfAnalysis() {
      this.TRACE_INIT("performSelfAnalysis", () => {
        let defErrorsMsgs;
        this.selfAnalysisDone = true;
        const className = this.className;
        this.TRACE_INIT("toFastProps", () => {
          toFastProperties(this);
        });
        this.TRACE_INIT("Grammar Recording", () => {
          try {
            this.enableRecording();
            forEach_default(this.definedRulesNames, (currRuleName) => {
              const wrappedRule = this[currRuleName];
              const originalGrammarAction = wrappedRule["originalGrammarAction"];
              let recordedRuleGast;
              this.TRACE_INIT(`${currRuleName} Rule`, () => {
                recordedRuleGast = this.topLevelRuleRecord(currRuleName, originalGrammarAction);
              });
              this.gastProductionsCache[currRuleName] = recordedRuleGast;
            });
          } finally {
            this.disableRecording();
          }
        });
        let resolverErrors = [];
        this.TRACE_INIT("Grammar Resolving", () => {
          resolverErrors = resolveGrammar2({
            rules: values_default(this.gastProductionsCache)
          });
          this.definitionErrors = this.definitionErrors.concat(resolverErrors);
        });
        this.TRACE_INIT("Grammar Validations", () => {
          if (isEmpty_default(resolverErrors) && this.skipValidations === false) {
            const validationErrors = validateGrammar2({
              rules: values_default(this.gastProductionsCache),
              tokenTypes: values_default(this.tokensMap),
              errMsgProvider: defaultGrammarValidatorErrorProvider,
              grammarName: className
            });
            const lookaheadValidationErrors = validateLookahead({
              lookaheadStrategy: this.lookaheadStrategy,
              rules: values_default(this.gastProductionsCache),
              tokenTypes: values_default(this.tokensMap),
              grammarName: className
            });
            this.definitionErrors = this.definitionErrors.concat(validationErrors, lookaheadValidationErrors);
          }
        });
        if (isEmpty_default(this.definitionErrors)) {
          if (this.recoveryEnabled) {
            this.TRACE_INIT("computeAllProdsFollows", () => {
              const allFollows = computeAllProdsFollows(values_default(this.gastProductionsCache));
              this.resyncFollows = allFollows;
            });
          }
          this.TRACE_INIT("ComputeLookaheadFunctions", () => {
            var _a, _b;
            (_b = (_a = this.lookaheadStrategy).initialize) === null || _b === void 0 ? void 0 : _b.call(_a, {
              rules: values_default(this.gastProductionsCache)
            });
            this.preComputeLookaheadFunctions(values_default(this.gastProductionsCache));
          });
        }
        if (!_Parser.DEFER_DEFINITION_ERRORS_HANDLING && !isEmpty_default(this.definitionErrors)) {
          defErrorsMsgs = map_default(this.definitionErrors, (defError) => defError.message);
          throw new Error(`Parser Definition Errors detected:
 ${defErrorsMsgs.join("\n-------------------------------\n")}`);
        }
      });
    }
    constructor(tokenVocabulary, config2) {
      this.definitionErrors = [];
      this.selfAnalysisDone = false;
      const that = this;
      that.initErrorHandler(config2);
      that.initLexerAdapter();
      that.initLooksAhead(config2);
      that.initRecognizerEngine(tokenVocabulary, config2);
      that.initRecoverable(config2);
      that.initTreeBuilder(config2);
      that.initContentAssist();
      that.initGastRecorder(config2);
      that.initPerformanceTracer(config2);
      if (has_default(config2, "ignoredIssues")) {
        throw new Error("The <ignoredIssues> IParserConfig property has been deprecated.\n	Please use the <IGNORE_AMBIGUITIES> flag on the relevant DSL method instead.\n	See: https://chevrotain.io/docs/guide/resolving_grammar_errors.html#IGNORING_AMBIGUITIES\n	For further details.");
      }
      this.skipValidations = has_default(config2, "skipValidations") ? config2.skipValidations : DEFAULT_PARSER_CONFIG.skipValidations;
    }
  };
  Parser.DEFER_DEFINITION_ERRORS_HANDLING = false;
  applyMixins(Parser, [
    Recoverable,
    LooksAhead,
    TreeBuilder,
    LexerAdapter,
    RecognizerEngine,
    RecognizerApi,
    ErrorHandler,
    ContentAssist,
    GastRecorder,
    PerformanceTracer
  ]);
  var CstParser = class extends Parser {
    constructor(tokenVocabulary, config2 = DEFAULT_PARSER_CONFIG) {
      const configClone = clone_default(config2);
      configClone.outputCst = true;
      super(tokenVocabulary, configClone);
    }
  };

  // src/core/parser/parser-tokens.ts
  var Let = createToken({ name: "Let", pattern: /\bLET\b/i });
  var Print = createToken({ name: "Print", pattern: /\bPRINT\b/i });
  var For = createToken({ name: "For", pattern: /\bFOR\b/i });
  var To = createToken({ name: "To", pattern: /\bTO\b/i });
  var Step = createToken({ name: "Step", pattern: /\bSTEP\b/i });
  var Next = createToken({ name: "Next", pattern: /\bNEXT\b/i });
  var End = createToken({ name: "End", pattern: /\bEND\b/i });
  var Rem = createToken({ name: "Rem", pattern: /\bREM\b/i });
  var Pause = createToken({ name: "Pause", pattern: /\bPAUSE\b/i });
  var If = createToken({ name: "If", pattern: /\bIF\b/i });
  var Then = createToken({ name: "Then", pattern: /\bTHEN\b/i });
  var Goto = createToken({ name: "Goto", pattern: /\bGOTO\b/i });
  var Gosub = createToken({ name: "Gosub", pattern: /\bGOSUB\b/i });
  var Return = createToken({ name: "Return", pattern: /\bRETURN\b/i });
  var On = createToken({ name: "On", pattern: /\bON\b/i });
  var Off = createToken({ name: "Off", pattern: /\bOFF\b/i });
  var Dim = createToken({ name: "Dim", pattern: /\bDIM\b/i });
  var Data = createToken({ name: "Data", pattern: /\bDATA\b/i });
  var Read = createToken({ name: "Read", pattern: /\bREAD\b/i });
  var Restore = createToken({ name: "Restore", pattern: /\bRESTORE\b/i });
  var Cls = createToken({ name: "Cls", pattern: /\bCLS\b/i });
  var Locate = createToken({ name: "Locate", pattern: /\bLOCATE\b/i });
  var Color = createToken({ name: "Color", pattern: /\bCOLOR\b/i });
  var Cgset = createToken({ name: "Cgset", pattern: /\bCGSET\b/i });
  var Cgen = createToken({ name: "Cgen", pattern: /\bCGEN\b/i });
  var Paletb = createToken({ name: "Paletb", pattern: /\bPALETB\b/i });
  var Palets = createToken({ name: "Palets", pattern: /\bPALETS\b/i });
  var Palet = createToken({ name: "Palet", pattern: /\bPALET\b/i });
  var Def = createToken({ name: "Def", pattern: /\bDEF\b/i });
  var Sprite = createToken({ name: "Sprite", pattern: /\bSPRITE\b/i });
  var Move = createToken({ name: "Move", pattern: /\bMOVE\b/i });
  var Len = createToken({ name: "Len", pattern: /\bLEN\b/i });
  var Left = createToken({ name: "Left", pattern: /\bLEFT\$/i });
  var Right = createToken({ name: "Right", pattern: /\bRIGHT\$/i });
  var Mid = createToken({ name: "Mid", pattern: /\bMID\$/i });
  var Str = createToken({ name: "Str", pattern: /\bSTR\$/i });
  var Hex = createToken({ name: "Hex", pattern: /\bHEX\$/i });
  var Chr = createToken({ name: "Chr", pattern: /\bCHR\$/i });
  var Asc = createToken({ name: "Asc", pattern: /\bASC\b/i });
  var Abs = createToken({ name: "Abs", pattern: /\bABS\b/i });
  var Sgn = createToken({ name: "Sgn", pattern: /\bSGN\b/i });
  var Rnd = createToken({ name: "Rnd", pattern: /\bRND\b/i });
  var Val = createToken({ name: "Val", pattern: /\bVAL\b/i });
  var Stick = createToken({ name: "Stick", pattern: /\bSTICK\b/i });
  var Strig = createToken({ name: "Strig", pattern: /\bSTRIG\b/i });
  var And = createToken({ name: "And", pattern: /\bAND\b/i });
  var Or = createToken({ name: "Or", pattern: /\bOR\b/i });
  var Xor = createToken({ name: "Xor", pattern: /\bXOR\b/i });
  var Not = createToken({ name: "Not", pattern: /\bNOT\b/i });
  var GreaterThan = createToken({ name: "GreaterThan", pattern: />/ });
  var LessThan = createToken({ name: "LessThan", pattern: /</ });
  var NotEqual = createToken({ name: "NotEqual", pattern: /<>/ });
  var GreaterThanOrEqual = createToken({ name: "GreaterThanOrEqual", pattern: />=/ });
  var LessThanOrEqual = createToken({ name: "LessThanOrEqual", pattern: /<=/ });
  var Equal = createToken({ name: "Equal", pattern: /=/ });
  var Plus = createToken({ name: "Plus", pattern: /\+/ });
  var Minus = createToken({ name: "Minus", pattern: /-/ });
  var Multiply = createToken({ name: "Multiply", pattern: /\*/ });
  var Divide = createToken({ name: "Divide", pattern: /\// });
  var Mod = createToken({ name: "Mod", pattern: /\bMOD\b/i });
  var Comma = createToken({ name: "Comma", pattern: /,/ });
  var Semicolon = createToken({ name: "Semicolon", pattern: /;/ });
  var Colon = createToken({ name: "Colon", pattern: /:/ });
  var LParen = createToken({ name: "LParen", pattern: /\(/ });
  var RParen = createToken({ name: "RParen", pattern: /\)/ });
  var Period = createToken({ name: "Period", pattern: /\./ });
  var Hash2 = createToken({ name: "Hash", pattern: /#/ });
  var Dollar = createToken({ name: "Dollar", pattern: /\$/ });
  var LBracket = createToken({ name: "LBracket", pattern: /\[/ });
  var RBracket = createToken({ name: "RBracket", pattern: /\]/ });
  var Exclamation = createToken({ name: "Exclamation", pattern: /!/ });
  var Question = createToken({ name: "Question", pattern: /\?/ });
  var AtSign = createToken({ name: "AtSign", pattern: /@/ });
  var Percent = createToken({ name: "Percent", pattern: /%/ });
  var LBrace = createToken({ name: "LBrace", pattern: /\{/ });
  var RBrace = createToken({ name: "RBrace", pattern: /\}/ });
  var Pipe = createToken({ name: "Pipe", pattern: /\|/ });
  var Tilde = createToken({ name: "Tilde", pattern: /~/ });
  var Underscore = createToken({ name: "Underscore", pattern: /_/ });
  var Backslash = createToken({ name: "Backslash", pattern: /\\/ });
  var Apostrophe = createToken({ name: "Apostrophe", pattern: /'/ });
  var StringLiteral = createToken({
    name: "StringLiteral",
    pattern: /"[^"]*"/
  });
  var NumberLiteral = createToken({
    name: "NumberLiteral",
    pattern: /\d+/
  });
  var Identifier = createToken({
    name: "Identifier",
    pattern: /[A-Za-z][A-Za-z0-9$]*/
  });
  var Whitespace = createToken({
    name: "Whitespace",
    pattern: /\s+/,
    group: Lexer.SKIPPED
  });
  var allTokens = [
    Whitespace,
    // Keywords
    Let,
    Print,
    For,
    To,
    Step,
    Next,
    End,
    Rem,
    Pause,
    If,
    Then,
    Goto,
    Gosub,
    Return,
    On,
    Off,
    Dim,
    Data,
    Read,
    Restore,
    Cls,
    Locate,
    Color,
    Cgset,
    Cgen,
    Paletb,
    Palets,
    Palet,
    Def,
    Sprite,
    Move,
    // String functions (must come before Identifier)
    Len,
    Left,
    Right,
    Mid,
    Str,
    Hex,
    Chr,
    Asc,
    // Arithmetic functions (must come before Identifier)
    // Family BASIC only supports: ABS, SGN, RND, VAL
    Abs,
    Sgn,
    Rnd,
    Val,
    // Controller input function keywords (must come before Identifier)
    Stick,
    Strig,
    // Logical operators (must come before Identifier)
    And,
    Or,
    Xor,
    Not,
    // Comparison operators (must come before Equal to avoid ambiguity)
    GreaterThanOrEqual,
    LessThanOrEqual,
    NotEqual,
    GreaterThan,
    LessThan,
    // Operators
    Equal,
    Plus,
    Minus,
    Multiply,
    Divide,
    Mod,
    // Punctuation
    Comma,
    Semicolon,
    Colon,
    LParen,
    RParen,
    // Additional punctuation for REM statements (lower priority, after main punctuation)
    Period,
    Hash2,
    Dollar,
    LBracket,
    RBracket,
    Exclamation,
    Question,
    AtSign,
    Percent,
    LBrace,
    RBrace,
    Pipe,
    Tilde,
    Underscore,
    Backslash,
    Apostrophe,
    // Literals
    StringLiteral,
    NumberLiteral,
    Identifier
  ];
  var lexer = new Lexer(allTokens, {
    positionTracking: "full"
  });

  // src/core/parser/FBasicChevrotainParser.ts
  var FBasicChevrotainParser = class extends CstParser {
    constructor() {
      super(allTokens, {
        recoveryEnabled: true
      });
      this.expressionList = this.RULE("expressionList", () => {
        this.SUBRULE(this.expression);
        this.MANY(() => {
          this.CONSUME(Comma);
          this.SUBRULE2(this.expression);
        });
      });
      this.functionCall = this.RULE("functionCall", () => {
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
      this.arrayAccess = this.RULE("arrayAccess", () => {
        this.CONSUME(Identifier);
        this.CONSUME(LParen);
        this.SUBRULE(this.expressionList);
        this.CONSUME(RParen);
      });
      this.primary = this.RULE("primary", () => {
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
            GATE: () => this.LA(1).tokenType === Len || this.LA(1).tokenType === Left || this.LA(1).tokenType === Right || this.LA(1).tokenType === Mid || this.LA(1).tokenType === Str || this.LA(1).tokenType === Hex || this.LA(1).tokenType === Chr || this.LA(1).tokenType === Asc || this.LA(1).tokenType === Abs || this.LA(1).tokenType === Sgn || this.LA(1).tokenType === Rnd || this.LA(1).tokenType === Val || this.LA(1).tokenType === Stick || this.LA(1).tokenType === Strig,
            ALT: () => this.SUBRULE(this.functionCall)
          },
          {
            // Array access: Identifier LParen ExpressionList RParen
            // Must check before plain Identifier to avoid ambiguity
            GATE: () => this.LA(1).tokenType === Identifier && this.LA(2).tokenType === LParen,
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
      this.unary = this.RULE("unary", () => {
        this.OPTION(() => {
          this.OR([
            { ALT: () => this.CONSUME(Plus) },
            { ALT: () => this.CONSUME(Minus) }
          ]);
        });
        this.SUBRULE(this.primary);
      });
      this.multiplicative = this.RULE("multiplicative", () => {
        this.SUBRULE(this.unary);
        this.MANY(() => {
          this.OR([
            { ALT: () => this.CONSUME(Multiply) },
            { ALT: () => this.CONSUME(Divide) }
          ]);
          this.SUBRULE2(this.unary);
        });
      });
      this.modExpression = this.RULE("modExpression", () => {
        this.SUBRULE(this.multiplicative);
        this.MANY(() => {
          this.CONSUME(Mod);
          this.SUBRULE2(this.multiplicative);
        });
      });
      this.additive = this.RULE("additive", () => {
        this.SUBRULE(this.modExpression);
        this.MANY(() => {
          this.OR([
            { ALT: () => this.CONSUME(Plus) },
            { ALT: () => this.CONSUME(Minus) }
          ]);
          this.SUBRULE2(this.modExpression);
        });
      });
      this.expression = this.RULE("expression", () => {
        this.SUBRULE(this.additive);
      });
      this.comparisonExpression = this.RULE("comparisonExpression", () => {
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
      this.logicalNotExpression = this.RULE("logicalNotExpression", () => {
        this.OPTION(() => {
          this.CONSUME(Not);
        });
        this.SUBRULE(this.comparisonExpression);
      });
      this.logicalAndExpression = this.RULE("logicalAndExpression", () => {
        this.SUBRULE(this.logicalNotExpression);
        this.MANY(() => {
          this.CONSUME(And);
          this.SUBRULE2(this.logicalNotExpression);
        });
      });
      this.logicalOrExpression = this.RULE("logicalOrExpression", () => {
        this.SUBRULE(this.logicalAndExpression);
        this.MANY(() => {
          this.CONSUME(Or);
          this.SUBRULE2(this.logicalAndExpression);
        });
      });
      this.logicalExpression = this.RULE("logicalExpression", () => {
        this.SUBRULE(this.logicalOrExpression);
        this.MANY(() => {
          this.CONSUME(Xor);
          this.SUBRULE2(this.logicalOrExpression);
        });
      });
      this.printItem = this.RULE("printItem", () => {
        this.OR([
          {
            GATE: () => this.LA(1).tokenType === StringLiteral,
            ALT: () => this.CONSUME(StringLiteral)
          },
          { ALT: () => this.SUBRULE(this.expression) }
        ]);
      });
      this.printList = this.RULE("printList", () => {
        this.SUBRULE(this.printItem);
        this.MANY(() => {
          this.OR([
            { ALT: () => this.CONSUME(Comma) },
            { ALT: () => this.CONSUME(Semicolon) }
          ]);
          this.OPTION(() => {
            this.SUBRULE2(this.printItem);
          });
        });
      });
      this.printStatement = this.RULE("printStatement", () => {
        this.CONSUME(Print);
        this.OPTION(() => {
          this.SUBRULE(this.printList);
        });
      });
      this.letStatement = this.RULE("letStatement", () => {
        this.OPTION(() => {
          this.CONSUME(Let);
        });
        this.OR([
          {
            // Array access: Identifier LParen ExpressionList RParen
            GATE: () => this.LA(1).tokenType === Identifier && this.LA(2).tokenType === LParen,
            ALT: () => this.SUBRULE(this.arrayAccess)
          },
          { ALT: () => this.CONSUME(Identifier) }
        ]);
        this.CONSUME(Equal);
        this.SUBRULE(this.expression);
      });
      this.forStatement = this.RULE("forStatement", () => {
        this.CONSUME(For);
        this.CONSUME(Identifier);
        this.CONSUME(Equal);
        this.SUBRULE(this.expression);
        this.CONSUME(To);
        this.SUBRULE2(this.expression);
        this.OPTION(() => {
          this.CONSUME(Step);
          this.SUBRULE3(this.expression);
        });
      });
      this.nextStatement = this.RULE("nextStatement", () => {
        this.CONSUME(Next);
      });
      this.endStatement = this.RULE("endStatement", () => {
        this.CONSUME(End);
      });
      this.pauseStatement = this.RULE("pauseStatement", () => {
        this.CONSUME(Pause);
        this.SUBRULE(this.expression);
      });
      this.gotoStatement = this.RULE("gotoStatement", () => {
        this.CONSUME(Goto);
        this.CONSUME(NumberLiteral);
      });
      this.gosubStatement = this.RULE("gosubStatement", () => {
        this.CONSUME(Gosub);
        this.CONSUME(NumberLiteral);
      });
      this.returnStatement = this.RULE("returnStatement", () => {
        this.CONSUME(Return);
        this.OPTION(() => {
          this.CONSUME(NumberLiteral);
        });
      });
      this.lineNumberList = this.RULE("lineNumberList", () => {
        this.CONSUME(NumberLiteral);
        this.MANY(() => {
          this.CONSUME(Comma);
          this.CONSUME2(NumberLiteral);
        });
      });
      this.onStatement = this.RULE("onStatement", () => {
        this.CONSUME(On);
        this.SUBRULE(this.expression);
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
      this.dimensionList = this.RULE("dimensionList", () => {
        this.SUBRULE(this.expression);
        this.OPTION(() => {
          this.CONSUME(Comma);
          this.SUBRULE2(this.expression);
        });
      });
      this.arrayDeclaration = this.RULE("arrayDeclaration", () => {
        this.CONSUME(Identifier);
        this.CONSUME(LParen);
        this.SUBRULE(this.dimensionList);
        this.CONSUME(RParen);
      });
      this.dimStatement = this.RULE("dimStatement", () => {
        this.CONSUME(Dim);
        this.SUBRULE(this.arrayDeclaration);
        this.MANY(() => {
          this.CONSUME(Comma);
          this.SUBRULE2(this.arrayDeclaration);
        });
      });
      this.dataConstant = this.RULE("dataConstant", () => {
        this.OR([
          { ALT: () => this.CONSUME(NumberLiteral) },
          {
            GATE: () => this.LA(1).tokenType === StringLiteral,
            ALT: () => this.CONSUME(StringLiteral)
          },
          { ALT: () => this.CONSUME(Identifier) }
          // Unquoted string constant
        ]);
      });
      this.dataConstantList = this.RULE("dataConstantList", () => {
        this.OPTION(() => {
          this.SUBRULE(this.dataConstant);
          this.MANY(() => {
            this.CONSUME(Comma);
            this.SUBRULE2(this.dataConstant);
          });
        });
      });
      this.dataStatement = this.RULE("dataStatement", () => {
        this.CONSUME(Data);
        this.SUBRULE(this.dataConstantList);
      });
      this.readStatement = this.RULE("readStatement", () => {
        this.CONSUME(Read);
        this.OR([
          {
            // Array access: Identifier LParen ExpressionList RParen
            GATE: () => this.LA(1).tokenType === Identifier && this.LA(2).tokenType === LParen,
            ALT: () => this.SUBRULE(this.arrayAccess)
          },
          { ALT: () => this.CONSUME(Identifier) }
        ]);
        this.MANY(() => {
          this.CONSUME(Comma);
          this.OR2([
            {
              // Array access: Identifier LParen ExpressionList RParen
              GATE: () => this.LA(1).tokenType === Identifier && this.LA(2).tokenType === LParen,
              ALT: () => this.SUBRULE2(this.arrayAccess)
            },
            { ALT: () => this.CONSUME2(Identifier) }
          ]);
        });
      });
      this.restoreStatement = this.RULE("restoreStatement", () => {
        this.CONSUME(Restore);
        this.OPTION(() => {
          this.CONSUME(NumberLiteral);
        });
      });
      this.clsStatement = this.RULE("clsStatement", () => {
        this.CONSUME(Cls);
      });
      this.locateStatement = this.RULE("locateStatement", () => {
        this.CONSUME(Locate);
        this.SUBRULE(this.expression);
        this.CONSUME(Comma);
        this.SUBRULE2(this.expression);
      });
      this.colorStatement = this.RULE("colorStatement", () => {
        this.CONSUME(Color);
        this.SUBRULE(this.expression);
        this.CONSUME(Comma);
        this.SUBRULE2(this.expression);
        this.CONSUME2(Comma);
        this.SUBRULE3(this.expression);
      });
      this.cgsetStatement = this.RULE("cgsetStatement", () => {
        this.CONSUME(Cgset);
        this.OPTION(() => {
          this.SUBRULE(this.expression);
          this.OPTION2(() => {
            this.CONSUME(Comma);
            this.SUBRULE2(this.expression);
          });
        });
      });
      this.cgenStatement = this.RULE("cgenStatement", () => {
        this.CONSUME(Cgen);
        this.SUBRULE(this.expression);
      });
      this.paletParameterList = this.RULE("paletParameterList", () => {
        this.SUBRULE(this.expression);
        this.CONSUME(Comma);
        this.SUBRULE2(this.expression);
        this.CONSUME2(Comma);
        this.SUBRULE3(this.expression);
        this.CONSUME3(Comma);
        this.SUBRULE4(this.expression);
        this.CONSUME4(Comma);
        this.SUBRULE5(this.expression);
      });
      this.paletStatement = this.RULE("paletStatement", () => {
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
              this.CONSUME(Identifier, { LABEL: "target" });
              this.SUBRULE3(this.paletParameterList);
            }
          }
        ]);
      });
      this.defSpriteStatement = this.RULE("defSpriteStatement", () => {
        this.CONSUME(Def);
        this.CONSUME(Sprite);
        this.SUBRULE(this.expression, { LABEL: "spriteNumber" });
        this.CONSUME(Comma);
        this.CONSUME(LParen);
        this.SUBRULE2(this.expression, { LABEL: "colorCombination" });
        this.CONSUME2(Comma);
        this.SUBRULE3(this.expression, { LABEL: "size" });
        this.CONSUME3(Comma);
        this.SUBRULE4(this.expression, { LABEL: "priority" });
        this.CONSUME4(Comma);
        this.SUBRULE5(this.expression, { LABEL: "invertX" });
        this.CONSUME5(Comma);
        this.SUBRULE6(this.expression, { LABEL: "invertY" });
        this.CONSUME(RParen);
        this.CONSUME(Equal);
        this.SUBRULE7(this.expression, { LABEL: "characterSet" });
      });
      this.spriteStatement = this.RULE("spriteStatement", () => {
        this.CONSUME(Sprite);
        this.SUBRULE(this.expression, { LABEL: "spriteNumber" });
        this.CONSUME(Comma);
        this.SUBRULE2(this.expression, { LABEL: "x" });
        this.CONSUME2(Comma);
        this.SUBRULE3(this.expression, { LABEL: "y" });
      });
      this.spriteOnOffStatement = this.RULE("spriteOnOffStatement", () => {
        this.CONSUME(Sprite);
        this.OR([
          { ALT: () => this.CONSUME(On, { LABEL: "onOff" }) },
          { ALT: () => this.CONSUME(Off, { LABEL: "onOff" }) }
        ]);
      });
      this.defMoveStatement = this.RULE("defMoveStatement", () => {
        this.CONSUME(Def);
        this.CONSUME(Move);
        this.CONSUME(LParen);
        this.SUBRULE(this.expression, { LABEL: "actionNumber" });
        this.CONSUME(RParen);
        this.CONSUME(Equal);
        this.CONSUME(Sprite);
        this.CONSUME2(LParen);
        this.SUBRULE2(this.expression, { LABEL: "characterType" });
        this.CONSUME(Comma);
        this.SUBRULE3(this.expression, { LABEL: "direction" });
        this.CONSUME2(Comma);
        this.SUBRULE4(this.expression, { LABEL: "speed" });
        this.CONSUME3(Comma);
        this.SUBRULE5(this.expression, { LABEL: "distance" });
        this.CONSUME4(Comma);
        this.SUBRULE6(this.expression, { LABEL: "priority" });
        this.CONSUME5(Comma);
        this.SUBRULE7(this.expression, { LABEL: "colorCombination" });
        this.CONSUME2(RParen);
      });
      this.moveStatement = this.RULE("moveStatement", () => {
        this.CONSUME(Move);
        this.SUBRULE(this.expression, { LABEL: "actionNumber" });
      });
      this.ifThenStatement = this.RULE("ifThenStatement", () => {
        this.CONSUME(If);
        this.SUBRULE(this.logicalExpression);
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
              this.CONSUME2(Then);
              this.SUBRULE(this.commandList);
            }
          },
          {
            // IF ... GOTO NumberLiteral (GOTO without THEN)
            ALT: () => {
              this.CONSUME(Goto);
              this.CONSUME2(NumberLiteral);
            }
          }
        ]);
      });
      this.singleCommand = this.RULE("singleCommand", () => {
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
          {
            GATE: () => this.LA(1).tokenType === Def && this.LA(2).tokenType === Move,
            ALT: () => this.SUBRULE(this.defMoveStatement)
          },
          {
            GATE: () => this.LA(1).tokenType === Def,
            ALT: () => this.SUBRULE(this.defSpriteStatement)
          },
          {
            GATE: () => this.LA(1).tokenType === Move,
            ALT: () => this.SUBRULE(this.moveStatement)
          },
          {
            GATE: () => this.LA(1).tokenType === Sprite && (this.LA(2).tokenType === On || this.LA(2).tokenType === Off),
            ALT: () => this.SUBRULE(this.spriteOnOffStatement)
          },
          {
            GATE: () => this.LA(1).tokenType === Sprite,
            ALT: () => this.SUBRULE(this.spriteStatement)
          },
          { ALT: () => this.SUBRULE(this.letStatement) }
          // Must be last since it can start with Identifier
        ]);
      });
      this.command = this.RULE("command", () => {
        this.SUBRULE(this.singleCommand);
      });
      this.commandList = this.RULE("commandList", () => {
        this.SUBRULE(this.command);
        this.MANY(() => {
          this.CONSUME(Colon);
          this.SUBRULE2(this.command);
        });
      });
      this.statement = this.RULE("statement", () => {
        this.CONSUME(NumberLiteral);
        this.SUBRULE(this.commandList);
      });
      this.performSelfAnalysis();
    }
  };
  var parserInstance = new FBasicChevrotainParser();
  function parseWithChevrotain(source) {
    const lines = source.split(/\r?\n/);
    const allErrors = [];
    const statements = [];
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]?.trim();
      if (!line) {
        continue;
      }
      const remMatch = line.match(/^\s*(\d+)\s+REM\b/i);
      if (remMatch) {
        continue;
      }
      const lexResult = lexer.tokenize(line);
      if (lexResult.errors.length > 0) {
        allErrors.push(...lexResult.errors.map((err) => ({
          message: err.message || "Lexical error",
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
      parserInstance.input = lexResult.tokens;
      const cst = parserInstance.statement();
      const parseErrors = [...parserInstance.errors];
      parserInstance.errors = [];
      if (parseErrors.length > 0) {
        allErrors.push(...parseErrors.map((err) => {
          const token = err.token;
          return {
            message: err.message || "Syntax error",
            line: lineIndex + 1,
            column: token?.startColumn,
            length: token?.endOffset ? token.endOffset - token.startOffset : 1,
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
      if (cst) {
        statements.push(cst);
      }
    }
    if (allErrors.length > 0) {
      return {
        success: false,
        errors: allErrors
      };
    }
    const programCst = {
      name: "program",
      children: {
        statement: statements
      }
    };
    return {
      success: true,
      cst: programCst
    };
  }

  // src/core/parser/FBasicParser.ts
  var FBasicParser = class {
    constructor() {
    }
    /**
     * Parse F-Basic source code into a CST
     * 
     * @param source - The F-Basic source code to parse
     * @returns Parse result with CST or errors
     */
    async parse(source) {
      try {
        const parseResult = parseWithChevrotain(source);
        if (!parseResult.success) {
          const errorMessages = parseResult.errors?.map((e) => e.message).join("; ") ?? "Unknown parse error";
          return {
            success: false,
            errors: parseResult.errors?.map((err) => ({
              message: `${err.message} (line ${err.line}, col ${err.column})`,
              location: {
                start: {
                  offset: 0,
                  line: err.line ?? 1,
                  column: err.column ?? 1
                },
                end: {
                  offset: 0,
                  line: err.line ?? 1,
                  column: (err.column ?? 1) + (err.length ?? 1)
                }
              }
            })) ?? [{
              message: errorMessages,
              location: {
                start: { offset: 0, line: 1, column: 1 },
                end: { offset: 0, line: 1, column: 1 }
              }
            }]
          };
        }
        if (!parseResult.cst) {
          throw new Error("Parser succeeded but no CST returned");
        }
        return {
          success: true,
          cst: parseResult.cst
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
     * @returns Parsed statement CST or null
     */
    async parseStatement(statementText) {
      const result = await this.parse(statementText);
      if (result.success && result.cst?.children.statement) {
        const statements = result.cst.children.statement;
        if (Array.isArray(statements) && statements.length > 0) {
          const firstStmt = statements[0];
          if (firstStmt && "children" in firstStmt) {
            return firstStmt;
          }
        }
      }
      return null;
    }
    /**
     * Get parser version and capabilities
     */
    getParserInfo() {
      return {
        name: "F-Basic Parser (Chevrotain)",
        version: "2.0.0",
        capabilities: [
          "Complete F-Basic syntax support",
          "TypeScript-native parser (Chevrotain)",
          "No build step required",
          "Excellent error recovery",
          "Precise error locations",
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
        features: ["ast-parsing", "error-reporting", "multi-statement", "chevrotain", "no-build-step"],
        supportedStatements: ["PRINT", "LET", "IF", "FOR", "NEXT", "GOTO", "GOSUB", "RETURN", "END", "REM", "CLS", "DATA", "READ", "RESTORE", "DIM", "COLOR"],
        supportedFunctions: ["ABS", "SGN", "RND", "VAL", "LEN", "LEFT$", "RIGHT$", "MID$", "STR$", "HEX$"],
        supportedOperators: ["+", "-", "*", "/", "^", "MOD", "=", "<>", "<", ">", "<=", ">=", "AND", "OR", "NOT"]
      };
    }
  };

  // src/core/sprite/SpriteStateManager.ts
  var SpriteStateManager = class {
    constructor() {
      __publicField(this, "spriteStates", /* @__PURE__ */ new Map());
      __publicField(this, "spriteEnabled", false);
      for (let i = 0; i < 8; i++) {
        this.spriteStates.set(i, {
          spriteNumber: i,
          x: 0,
          y: 0,
          visible: false,
          priority: 0,
          definition: null
        });
      }
    }
    /**
     * Enable or disable sprite display globally
     * Controls whether sprites are rendered, but does not affect sprite state
     * Sprites can be defined and positioned even when display is disabled
     */
    setSpriteEnabled(enabled) {
      this.spriteEnabled = enabled;
    }
    /**
     * Check if sprite display is enabled
     */
    isSpriteEnabled() {
      return this.spriteEnabled;
    }
    /**
     * Define a sprite (DEF SPRITE command)
     * Stores the sprite definition but does not make it visible
     */
    defineSprite(definition) {
      const sprite = this.spriteStates.get(definition.spriteNumber);
      if (!sprite) {
        throw new Error(`Invalid sprite number: ${definition.spriteNumber}`);
      }
      sprite.definition = definition;
      sprite.priority = definition.priority;
    }
    /**
     * Display a sprite at specified position (SPRITE command)
     * Makes the sprite visible and sets its position
     */
    displaySprite(spriteNumber, x, y) {
      const sprite = this.spriteStates.get(spriteNumber);
      if (!sprite) {
        throw new Error(`Invalid sprite number: ${spriteNumber}`);
      }
      if (!sprite.definition) {
        throw new Error(`Sprite ${spriteNumber} has no definition (use DEF SPRITE first)`);
      }
      sprite.x = x;
      sprite.y = y;
      sprite.visible = true;
    }
    /**
     * Hide a sprite
     */
    hideSprite(spriteNumber) {
      const sprite = this.spriteStates.get(spriteNumber);
      if (sprite) {
        sprite.visible = false;
      }
    }
    /**
     * Get sprite state
     */
    getSpriteState(spriteNumber) {
      return this.spriteStates.get(spriteNumber);
    }
    /**
     * Get all sprite states
     */
    getAllSpriteStates() {
      return Array.from(this.spriteStates.values());
    }
    /**
     * Get all visible sprites
     */
    getVisibleSprites() {
      return Array.from(this.spriteStates.values()).filter((s) => s.visible);
    }
    /**
     * Clear all sprite definitions and states
     */
    clear() {
      this.spriteStates.clear();
      for (let i = 0; i < 8; i++) {
        this.spriteStates.set(i, {
          spriteNumber: i,
          x: 0,
          y: 0,
          visible: false,
          priority: 0,
          definition: null
        });
      }
    }
    /**
     * Reset a specific sprite
     */
    resetSprite(spriteNumber) {
      this.spriteStates.set(spriteNumber, {
        spriteNumber,
        x: 0,
        y: 0,
        visible: false,
        priority: 0,
        definition: null
      });
    }
  };

  // src/core/BasicInterpreter.ts
  var BasicInterpreter = class {
    constructor(config2) {
      __publicField(this, "config");
      __publicField(this, "parser");
      __publicField(this, "executionEngine");
      __publicField(this, "context");
      console.log("\u{1F527} [MAIN] BasicInterpreter constructor called with config:", {
        hasDeviceAdapter: !!config2?.deviceAdapter,
        maxIterations: config2?.maxIterations,
        maxOutputLines: config2?.maxOutputLines,
        enableDebugMode: config2?.enableDebugMode,
        strictMode: config2?.strictMode
      });
      this.config = {
        maxIterations: EXECUTION_LIMITS.MAX_ITERATIONS_TEST,
        maxOutputLines: EXECUTION_LIMITS.MAX_OUTPUT_LINES_TEST,
        enableDebugMode: false,
        strictMode: false,
        ...config2
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
              line: error.location?.start?.line ?? 0,
              message: error.message,
              type: ERROR_TYPES.SYNTAX
            })) ?? [],
            variables: /* @__PURE__ */ new Map(),
            executionTime: 0
          };
        }
        if (!this.context?.deviceAdapter) {
          this.context = new ExecutionContext(this.config);
          if (this.config.deviceAdapter) {
            this.context.deviceAdapter = this.config.deviceAdapter;
          }
          this.context.spriteStateManager = new SpriteStateManager();
          this.context.animationManager = new AnimationManager();
          if (this.config.deviceAdapter) {
            this.context.animationManager.setDeviceAdapter(this.config.deviceAdapter);
          }
          this.executionEngine = new ExecutionEngine(this.context, this.config.deviceAdapter);
        } else {
          this.executionEngine = new ExecutionEngine(this.context, this.config.deviceAdapter);
        }
        const preservedDeviceAdapter = this.context.deviceAdapter;
        this.context.reset();
        if (parseResult.cst?.children.statement) {
          const statementsCst = parseResult.cst.children.statement;
          const validStatements = Array.isArray(statementsCst) ? statementsCst.filter((s) => "children" in s) : [];
          const { statements, labelMap } = expandStatements(validStatements);
          this.context.statements = statements;
          this.context.labelMap = labelMap;
        } else {
          this.context.statements = [];
          this.context.labelMap = /* @__PURE__ */ new Map();
        }
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
          arrays: /* @__PURE__ */ new Map(),
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
      return this.context?.isRunning ?? false;
    }
    /**
     * Get current variables
     */
    getVariables() {
      return this.context?.variables ?? /* @__PURE__ */ new Map();
    }
    /**
     * Get all sprite states
     */
    getSpriteStates() {
      return this.context?.spriteStateManager?.getAllSpriteStates() ?? [];
    }
    /**
     * Check if sprite display is enabled
     */
    isSpriteEnabled() {
      return this.context?.spriteStateManager?.isSpriteEnabled() ?? false;
    }
    /**
     * Get all movement states
     */
    getMovementStates() {
      return this.context?.animationManager?.getAllMovementStates() ?? [];
    }
  };

  // src/core/devices/MessageHandler.ts
  var MessageHandler = class {
    constructor(pendingMessages) {
      this.pendingMessages = pendingMessages;
    }
    /**
     * Handle messages from the web worker
     */
    handleWorkerMessage(message, onOutput) {
      console.log("\u{1F50D} [MESSAGE_HANDLER] Processing worker message:", {
        type: message.type,
        id: message.id,
        timestamp: message.timestamp
      });
      if (message.type === "OUTPUT") {
        console.log("\u{1F4E4} [MESSAGE_HANDLER] Handling OUTPUT message:", {
          outputType: message.data.outputType,
          outputLength: message.data.output.length
        });
        if (onOutput) {
          onOutput(message);
        }
        return;
      }
      if (message.type === "SCREEN_UPDATE") {
        const screenMessage = message;
        console.log("\u{1F5A5}\uFE0F [MESSAGE_HANDLER] SCREEN_UPDATE message received (handled by composable):", {
          updateType: screenMessage.data.updateType
        });
        return;
      }
      const pending = this.pendingMessages.get(message.id);
      if (!pending) {
        console.log("\u26A0\uFE0F [MESSAGE_HANDLER] No pending message found for ID:", message.id);
        return;
      }
      console.log("\u2705 [MESSAGE_HANDLER] Found pending message for ID:", message.id);
      switch (message.type) {
        case "RESULT": {
          const resultMessage = message;
          console.log("\u{1F4CA} [MESSAGE_HANDLER] Received RESULT message:", {
            success: resultMessage.data.success,
            executionTime: resultMessage.data.executionTime
          });
          clearTimeout(pending.timeout);
          this.pendingMessages.delete(message.id);
          if (resultMessage.data.errors?.some((error) => error.message.includes("not yet fully implemented"))) {
            console.log("\u26A0\uFE0F [MESSAGE_HANDLER] Web worker indicates fallback needed, rejecting to trigger fallback");
            pending.reject(new Error("Web worker execution not implemented, falling back to main thread"));
          } else {
            console.log("\u2705 [MESSAGE_HANDLER] Web worker result is valid, resolving pending promise");
            pending.resolve(resultMessage.data);
          }
          break;
        }
        case "ERROR": {
          const errorMessage = message;
          console.log("\u274C [MESSAGE_HANDLER] Received ERROR message:", {
            message: errorMessage.data.message,
            errorType: errorMessage.data.errorType,
            recoverable: errorMessage.data.recoverable
          });
          clearTimeout(pending.timeout);
          this.pendingMessages.delete(message.id);
          console.log("\u274C [MESSAGE_HANDLER] Rejecting pending promise due to error");
          pending.reject(new Error(errorMessage.data.message));
          break;
        }
        case "PROGRESS": {
          const progressMessage = message;
          console.log("\u{1F4C8} [MESSAGE_HANDLER] Received PROGRESS message:", {
            progress: progressMessage.data.progress
          });
          break;
        }
        default:
          console.log("\u26A0\uFE0F [MESSAGE_HANDLER] Unexpected message type:", message.type);
          break;
      }
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

  // src/core/devices/ScreenStateManager.ts
  var ScreenStateManager = class {
    constructor() {
      __publicField(this, "screenBuffer", []);
      __publicField(this, "cursorX", 0);
      __publicField(this, "cursorY", 0);
      __publicField(this, "bgPalette", 1);
      // Default background palette (0-1)
      __publicField(this, "spritePalette", 1);
      // Default sprite palette (0-2)
      __publicField(this, "backdropColor", 0);
      // Default backdrop color code (0-60, 0 = black)
      __publicField(this, "cgenMode", 2);
      // Default character generator mode (0-3): B on BG, A on sprite
      __publicField(this, "currentExecutionId", null);
      this.initializeScreen();
    }
    /**
     * Initialize the screen buffer
     */
    initializeScreen() {
      this.screenBuffer = [];
      for (let y = 0; y < 24; y++) {
        const row = [];
        for (let x = 0; x < 28; x++) {
          row.push({ character: " ", colorPattern: 0, x, y });
        }
        this.screenBuffer.push(row);
      }
      this.cursorX = 0;
      this.cursorY = 0;
    }
    /**
     * Get the current screen buffer
     */
    getScreenBuffer() {
      return this.screenBuffer;
    }
    /**
     * Get cursor position
     */
    getCursorPosition() {
      return { x: this.cursorX, y: this.cursorY };
    }
    /**
     * Set cursor position
     */
    setCursorPosition(x, y) {
      if (x < 0 || x > 27 || y < 0 || y > 23) {
        console.warn(`\u{1F50C} [SCREEN] Invalid cursor position: (${x}, ${y}), clamping to valid range`);
        x = Math.max(0, Math.min(27, x));
        y = Math.max(0, Math.min(23, y));
      }
      this.cursorX = x;
      this.cursorY = y;
    }
    /**
     * Write a character to the screen at the current cursor position
     */
    writeCharacter(char) {
      var _a, _b;
      if (char === "\n") {
        this.cursorX = 0;
        this.cursorY++;
        if (this.cursorY >= 24) {
          this.cursorY = 0;
        }
        return;
      }
      if (this.cursorY < 24 && this.cursorX < 28) {
        (_a = this.screenBuffer)[_b = this.cursorY] ?? (_a[_b] = []);
        const row = this.screenBuffer[this.cursorY];
        let cell = row[this.cursorX];
        if (!cell) {
          cell = {
            character: " ",
            colorPattern: 0,
            x: this.cursorX,
            y: this.cursorY
          };
          row[this.cursorX] = cell;
        }
        cell.character = char;
        this.cursorX++;
        if (this.cursorX >= 28) {
          this.cursorX = 0;
          this.cursorY++;
          if (this.cursorY >= 24) {
            this.cursorY = 0;
          }
        }
      }
    }
    /**
     * Set color pattern for a 2×2 area containing the specified position
     */
    setColorPattern(x, y, pattern) {
      if (x < 0 || x > 27 || y < 0 || y > 23) {
        console.warn(`\u{1F50C} [SCREEN] Invalid color position: (${x}, ${y}), clamping to valid range`);
        x = Math.max(0, Math.min(27, x));
        y = Math.max(0, Math.min(23, y));
      }
      if (pattern < 0 || pattern > 3) {
        console.warn(`\u{1F50C} [SCREEN] Invalid color pattern: ${pattern}, clamping to valid range (0-3)`);
        pattern = Math.max(0, Math.min(3, pattern));
      }
      const areaX = Math.floor(x / 2) * 2;
      const areaY = y;
      const cellsToUpdate = [];
      const topY = areaY > 0 ? areaY - 1 : 0;
      if (areaX < 28 && topY < 24) {
        const cell = this.screenBuffer[topY]?.[areaX];
        if (cell) {
          cell.colorPattern = pattern;
          cellsToUpdate.push({ x: areaX, y: topY, pattern });
        }
      }
      if (areaX + 1 < 28 && topY < 24) {
        const row = this.screenBuffer[topY];
        const cell = row?.[areaX + 1];
        if (cell) {
          cell.colorPattern = pattern;
          cellsToUpdate.push({ x: areaX + 1, y: topY, pattern });
        }
      }
      if (areaX < 28 && areaY < 24) {
        const row = this.screenBuffer[areaY];
        const cell = row?.[areaX];
        if (cell) {
          cell.colorPattern = pattern;
          cellsToUpdate.push({ x: areaX, y: areaY, pattern });
        }
      }
      if (areaX + 1 < 28 && areaY < 24) {
        const row = this.screenBuffer[areaY];
        const cell = row?.[areaX + 1];
        if (cell) {
          cell.colorPattern = pattern;
          cellsToUpdate.push({ x: areaX + 1, y: areaY, pattern });
        }
      }
      return cellsToUpdate;
    }
    /**
     * Set color palette
     */
    setColorPalette(bgPalette, spritePalette) {
      if (bgPalette < 0 || bgPalette > 1) {
        console.warn(`\u{1F50C} [SCREEN] Invalid background palette: ${bgPalette}, clamping to valid range (0-1)`);
        bgPalette = Math.max(0, Math.min(1, bgPalette));
      }
      if (spritePalette < 0 || spritePalette > 2) {
        console.warn(`\u{1F50C} [SCREEN] Invalid sprite palette: ${spritePalette}, clamping to valid range (0-2)`);
        spritePalette = Math.max(0, Math.min(2, spritePalette));
      }
      this.bgPalette = bgPalette;
      this.spritePalette = spritePalette;
    }
    /**
     * Set backdrop color
     */
    setBackdropColor(colorCode) {
      if (colorCode < 0 || colorCode > 60) {
        console.warn(`\u{1F50C} [SCREEN] Invalid backdrop color code: ${colorCode}, clamping to valid range (0-60)`);
        colorCode = Math.max(0, Math.min(60, colorCode));
      }
      this.backdropColor = colorCode;
    }
    /**
     * Set character generator mode
     */
    setCharacterGeneratorMode(mode) {
      if (mode < 0 || mode > 3) {
        console.warn(`\u{1F50C} [SCREEN] Invalid CGEN mode: ${mode}, clamping to valid range (0-3)`);
        mode = Math.max(0, Math.min(3, mode));
      }
      this.cgenMode = mode;
    }
    /**
     * Get palette values
     */
    getPalette() {
      return { bgPalette: this.bgPalette, spritePalette: this.spritePalette };
    }
    /**
     * Get backdrop color
     */
    getBackdropColor() {
      return this.backdropColor;
    }
    /**
     * Get CGEN mode
     */
    getCgenMode() {
      return this.cgenMode;
    }
    /**
     * Set current execution ID
     */
    setCurrentExecutionId(executionId) {
      this.currentExecutionId = executionId;
    }
    /**
     * Get current execution ID
     */
    getCurrentExecutionId() {
      return this.currentExecutionId;
    }
    /**
     * Create a full screen update message
     */
    createFullScreenUpdateMessage() {
      return {
        type: "SCREEN_UPDATE",
        id: `screen-full-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: this.currentExecutionId ?? "unknown",
          updateType: "full",
          screenBuffer: this.screenBuffer,
          cursorX: this.cursorX,
          cursorY: this.cursorY,
          timestamp: Date.now()
        }
      };
    }
    /**
     * Create a cursor update message
     */
    createCursorUpdateMessage() {
      return {
        type: "SCREEN_UPDATE",
        id: `screen-cursor-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: this.currentExecutionId ?? "unknown",
          updateType: "cursor",
          cursorX: this.cursorX,
          cursorY: this.cursorY,
          timestamp: Date.now()
        }
      };
    }
    /**
     * Create a clear screen update message
     */
    createClearScreenUpdateMessage() {
      return {
        type: "SCREEN_UPDATE",
        id: `screen-clear-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: this.currentExecutionId ?? "unknown",
          updateType: "clear",
          timestamp: Date.now()
        }
      };
    }
    /**
     * Create a color pattern update message
     */
    createColorUpdateMessage(cellsToUpdate) {
      return {
        type: "SCREEN_UPDATE",
        id: `screen-color-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: this.currentExecutionId ?? "unknown",
          updateType: "color",
          colorUpdates: cellsToUpdate,
          timestamp: Date.now()
        }
      };
    }
    /**
     * Create a palette update message
     */
    createPaletteUpdateMessage() {
      return {
        type: "SCREEN_UPDATE",
        id: `screen-palette-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: this.currentExecutionId ?? "unknown",
          updateType: "palette",
          bgPalette: this.bgPalette,
          spritePalette: this.spritePalette,
          timestamp: Date.now()
        }
      };
    }
    /**
     * Create a backdrop color update message
     */
    createBackdropUpdateMessage() {
      return {
        type: "SCREEN_UPDATE",
        id: `screen-backdrop-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: this.currentExecutionId ?? "unknown",
          updateType: "backdrop",
          backdropColor: this.backdropColor,
          timestamp: Date.now()
        }
      };
    }
    /**
     * Create a CGEN mode update message
     */
    createCgenUpdateMessage() {
      return {
        type: "SCREEN_UPDATE",
        id: `screen-cgen-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: this.currentExecutionId ?? "unknown",
          updateType: "cgen",
          cgenMode: this.cgenMode,
          timestamp: Date.now()
        }
      };
    }
  };

  // src/core/devices/WebWorkerManager.ts
  var WebWorkerManager = class _WebWorkerManager {
    constructor() {
      __publicField(this, "worker", null);
      __publicField(this, "messageId", 0);
      __publicField(this, "pendingMessages", /* @__PURE__ */ new Map());
    }
    /**
     * Check if web workers are supported
     */
    static isSupported() {
      const supported = typeof Worker !== "undefined";
      console.log("\u{1F50D} [WEB_WORKER] isSupported check:", {
        hasWorker: typeof Worker !== "undefined",
        supported
      });
      return supported;
    }
    /**
     * Check if we're currently running in a web worker context
     */
    static isInWebWorker() {
      const inWebWorker = typeof window === "undefined" && typeof self !== "undefined";
      console.log("\u{1F50D} [WEB_WORKER] isInWebWorker check:", {
        hasWindow: typeof window !== "undefined",
        hasSelf: typeof self !== "undefined",
        inWebWorker
      });
      return inWebWorker;
    }
    /**
     * Initialize the web worker
     */
    async initialize(workerScript) {
      console.log("\u{1F527} [WEB_WORKER] WebWorkerManager.initialize called with script:", workerScript);
      if (!_WebWorkerManager.isSupported()) {
        console.error("\u274C [WEB_WORKER] Web workers are not supported in this environment");
        throw new Error("Web workers are not supported in this environment");
      }
      if (this.worker) {
        console.log("\u2705 [WEB_WORKER] Worker already initialized");
        return;
      }
      const script = workerScript ?? DEFAULTS.WEB_WORKER.WORKER_SCRIPT;
      console.log("\u{1F527} [WEB_WORKER] Creating worker with script:", script);
      try {
        this.worker = new Worker(script);
        console.log("\u2705 [WEB_WORKER] Worker created successfully");
      } catch (error) {
        console.error("\u274C [WEB_WORKER] Failed to create worker:", error);
        throw error;
      }
      this.worker.onerror = (error) => {
        console.error("\u274C [WEB_WORKER] Web worker error:", error);
        this.rejectAllPending(`Web worker error: ${error.message}`);
      };
      this.worker.onmessageerror = (error) => {
        console.error("\u274C [WEB_WORKER] Web worker message error:", error);
        this.rejectAllPending("Web worker message error");
      };
      console.log("\u2705 [WEB_WORKER] Worker initialization completed successfully");
    }
    /**
     * Execute BASIC code in the web worker
     */
    async executeInWorker(code, config2, options = {}, onMessage) {
      console.log(`executeInWorker called with code: ${code.substring(0, 50)}...`);
      if (!this.worker) {
        console.log("Worker not initialized, initializing...");
        await this.initialize(DEFAULTS.WEB_WORKER.WORKER_SCRIPT);
      }
      if (!this.worker) {
        throw new Error("Failed to initialize web worker");
      }
      const messageId = (++this.messageId).toString();
      const timeout = options.timeout ?? DEFAULTS.WEB_WORKER.MESSAGE_TIMEOUT;
      console.log("Sending message with ID:", messageId, "timeout:", timeout);
      return new Promise((resolve, reject2) => {
        const timeoutHandle = setTimeout(() => {
          console.log("Web worker timeout after", timeout, "ms for message ID:", messageId);
          this.pendingMessages.delete(messageId);
          reject2(new Error(`Web worker execution timeout after ${timeout}ms`));
        }, timeout);
        this.pendingMessages.set(messageId, {
          resolve,
          reject: reject2,
          timeout: timeoutHandle
        });
        const message = {
          type: "EXECUTE",
          id: messageId,
          timestamp: Date.now(),
          data: {
            code,
            config: config2,
            options: {
              timeout,
              enableProgress: options.onProgress !== void 0
            }
          }
        };
        if (onMessage && this.worker) {
          this.worker.onmessage = (event) => {
            const message2 = event.data;
            onMessage(message2);
          };
        }
        console.log("\u{1F504} [MAIN\u2192WORKER] Posting message to worker:", {
          type: message.type,
          id: message.id,
          timestamp: message.timestamp,
          dataSize: JSON.stringify(message.data).length,
          hasDeviceAdapter: !!config2.deviceAdapter
        });
        if (this.worker) {
          this.worker.postMessage(message);
        }
        console.log("\u2705 [MAIN\u2192WORKER] Message posted to worker successfully");
      });
    }
    /**
     * Stop execution in the web worker
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
     * Send a message to the web worker
     */
    sendMessage(message) {
      if (this.worker) {
        this.worker.postMessage(message);
      }
    }
    /**
     * Terminate the web worker
     */
    terminate() {
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
        this.rejectAllPending("Web worker terminated");
      }
    }
    /**
     * Get the worker instance (for setting up message listeners)
     */
    getWorker() {
      return this.worker;
    }
    /**
     * Get pending messages map (for use by MessageHandler)
     */
    getPendingMessages() {
      return this.pendingMessages;
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

  // src/core/devices/WebWorkerDeviceAdapter.ts
  var WebWorkerDeviceAdapter = class {
    constructor() {
      // === DEVICE STATE ===
      __publicField(this, "strigClickBuffer", /* @__PURE__ */ new Map());
      __publicField(this, "stickStates", /* @__PURE__ */ new Map());
      __publicField(this, "isEnabled", true);
      // === MANAGERS ===
      __publicField(this, "webWorkerManager");
      __publicField(this, "screenStateManager");
      __publicField(this, "messageHandler");
      console.log("\u{1F50C} [WEB_WORKER_DEVICE] WebWorkerDeviceAdapter created");
      this.webWorkerManager = new WebWorkerManager();
      this.screenStateManager = new ScreenStateManager();
      this.messageHandler = new MessageHandler(this.webWorkerManager.getPendingMessages());
      this.setupMessageListener();
    }
    // === WEB WORKER MANAGEMENT METHODS ===
    /**
     * Check if web workers are supported
     */
    static isSupported() {
      return WebWorkerManager.isSupported();
    }
    /**
     * Check if we're currently running in a web worker context
     */
    static isInWebWorker() {
      return WebWorkerManager.isInWebWorker();
    }
    /**
     * Initialize the web worker
     */
    async initialize(workerScript) {
      await this.webWorkerManager.initialize(workerScript);
      this.setupMessageListener();
    }
    /**
     * Execute BASIC code in the web worker
     */
    async executeInWorker(code, config2, options = {}) {
      return this.webWorkerManager.executeInWorker(code, config2, options, (message) => {
        this.handleWorkerMessage(message);
      });
    }
    /**
     * Stop execution in the web worker
     */
    stopExecution() {
      this.webWorkerManager.stopExecution();
    }
    /**
     * Send a STRIG event to the web worker
     */
    sendStrigEvent(joystickId, state) {
      const worker = this.webWorkerManager.getWorker();
      if (!worker) {
        console.log("\u{1F50C} [WEB_WORKER] No worker available for STRIG event");
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
      console.log("\u{1F50C} [WEB_WORKER] Sending STRIG event to web worker:", {
        joystickId,
        state,
        messageId: message.id
      });
      worker.postMessage(message);
    }
    /**
     * Send a message to the web worker
     */
    sendMessage(message) {
      this.webWorkerManager.sendMessage(message);
    }
    /**
     * Terminate the web worker
     */
    terminate() {
      this.webWorkerManager.terminate();
      this.messageHandler.rejectAllPending("Web worker terminated");
    }
    // === DEVICE ADAPTER METHODS ===
    /**
     * Enable or disable the device adapter
     */
    setEnabled(enabled) {
      this.isEnabled = enabled;
      console.log("\u{1F50C} [WEB_WORKER_DEVICE] Device adapter enabled:", enabled);
    }
    // === JOYSTICK INPUT METHODS ===
    getJoystickCount() {
      return 2;
    }
    getStickState(joystickId) {
      return this.stickStates.get(joystickId) ?? 0;
    }
    setStickState(joystickId, state) {
      this.stickStates.set(joystickId, state);
      console.log("\u{1F50C} [WEB_WORKER_DEVICE] Stick state set:", { joystickId, state });
    }
    pushStrigState(joystickId, state) {
      if (!this.isEnabled) return;
      console.log("\u{1F50C} [WEB_WORKER_DEVICE] pushStrigState called:", { joystickId, state });
      if (state > 0) {
        if (!this.strigClickBuffer.has(joystickId)) {
          this.strigClickBuffer.set(joystickId, []);
        }
        const buffer = this.strigClickBuffer.get(joystickId);
        buffer.push(state);
        console.log("\u{1F50C} [WEB_WORKER_DEVICE] STRIG pulse buffered:", {
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
      console.log(`\u{1F50C} [WEB_WORKER_DEVICE] consumeStrigState: consumed STRIG event for joystick ${joystickId}, value=${clickValue}, remaining=${buffer.length}`);
      return clickValue;
    }
    // === TEXT OUTPUT METHODS ===
    printOutput(output) {
      console.log("\u{1F50C} [WEB_WORKER_DEVICE] Print output:", output);
      self.postMessage({
        type: "OUTPUT",
        id: `output-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: this.screenStateManager.getCurrentExecutionId() ?? "unknown",
          output,
          outputType: "print",
          timestamp: Date.now()
        }
      });
      for (const char of output) {
        this.screenStateManager.writeCharacter(char);
      }
      const updateMessage = this.screenStateManager.createFullScreenUpdateMessage();
      self.postMessage(updateMessage);
    }
    debugOutput(output) {
      console.log("\u{1F50C} [WEB_WORKER_DEVICE] Debug output:", output);
      self.postMessage({
        type: "OUTPUT",
        id: `debug-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: this.screenStateManager.getCurrentExecutionId() ?? "unknown",
          output,
          outputType: "debug",
          timestamp: Date.now()
        }
      });
    }
    errorOutput(output) {
      console.error("\u{1F50C} [WEB_WORKER_DEVICE] Error output:", output);
      self.postMessage({
        type: "OUTPUT",
        id: `error-${Date.now()}`,
        timestamp: Date.now(),
        data: {
          executionId: this.screenStateManager.getCurrentExecutionId() ?? "unknown",
          output,
          outputType: "error",
          timestamp: Date.now()
        }
      });
    }
    clearScreen() {
      console.log("\u{1F50C} [WEB_WORKER_DEVICE] Clear screen");
      this.screenStateManager.initializeScreen();
      const updateMessage = this.screenStateManager.createClearScreenUpdateMessage();
      self.postMessage(updateMessage);
    }
    setCursorPosition(x, y) {
      console.log("\u{1F50C} [WEB_WORKER_DEVICE] Set cursor position:", { x, y });
      this.screenStateManager.setCursorPosition(x, y);
      const updateMessage = this.screenStateManager.createCursorUpdateMessage();
      self.postMessage(updateMessage);
    }
    setColorPattern(x, y, pattern) {
      console.log("\u{1F50C} [WEB_WORKER_DEVICE] Set color pattern:", { x, y, pattern });
      const cellsToUpdate = this.screenStateManager.setColorPattern(x, y, pattern);
      const updateMessage = this.screenStateManager.createColorUpdateMessage(cellsToUpdate);
      self.postMessage(updateMessage);
    }
    setColorPalette(bgPalette, spritePalette) {
      console.log("\u{1F50C} [WEB_WORKER_DEVICE] Set color palette:", { bgPalette, spritePalette });
      this.screenStateManager.setColorPalette(bgPalette, spritePalette);
      const updateMessage = this.screenStateManager.createPaletteUpdateMessage();
      self.postMessage(updateMessage);
    }
    setBackdropColor(colorCode) {
      console.log("\u{1F50C} [WEB_WORKER_DEVICE] Set backdrop color:", colorCode);
      this.screenStateManager.setBackdropColor(colorCode);
      const updateMessage = this.screenStateManager.createBackdropUpdateMessage();
      self.postMessage(updateMessage);
    }
    setCharacterGeneratorMode(mode) {
      console.log("\u{1F50C} [WEB_WORKER_DEVICE] Set character generator mode:", mode);
      this.screenStateManager.setCharacterGeneratorMode(mode);
      const updateMessage = this.screenStateManager.createCgenUpdateMessage();
      self.postMessage(updateMessage);
    }
    /**
     * Send animation command to main thread immediately
     * This allows movements to start as soon as MOVE is called
     */
    sendAnimationCommand(command) {
      console.log("\u{1F3AC} [WEB_WORKER_DEVICE] Sending animation command:", command.type, command);
      const message = {
        type: "ANIMATION_COMMAND",
        id: `anim-${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        data: command
      };
      self.postMessage(message);
    }
    /**
     * Set the current execution ID (called by WebWorkerInterpreter)
     */
    setCurrentExecutionId(executionId) {
      this.screenStateManager.setCurrentExecutionId(executionId);
      if (executionId) {
        this.screenStateManager.initializeScreen();
        const updateMessage = this.screenStateManager.createClearScreenUpdateMessage();
        self.postMessage(updateMessage);
      }
    }
    // === PRIVATE METHODS ===
    /**
     * Set up message listener for web worker responses
     */
    setupMessageListener() {
      if (typeof window === "undefined") return;
      const worker = this.webWorkerManager.getWorker();
      if (worker) {
        worker.onmessage = (event) => {
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
     * Handle messages from the web worker
     */
    handleWorkerMessage(message) {
      this.messageHandler.handleWorkerMessage(message, (outputMessage) => {
        this.handleOutputMessage(outputMessage);
      });
    }
    /**
     * Handle OUTPUT messages from the web worker
     */
    handleOutputMessage(message) {
      console.log("\u{1F4E4} [MAIN] Handling OUTPUT message:", {
        outputType: message.data.outputType,
        outputLength: message.data.output.length
      });
    }
  };

  // src/core/workers/WebWorkerInterpreter.ts
  var WebWorkerInterpreter = class {
    constructor() {
      __publicField(this, "interpreter", null);
      __publicField(this, "isRunning", false);
      __publicField(this, "currentExecutionId", null);
      __publicField(this, "webWorkerDeviceAdapter", null);
      this.interpreter = null;
      this.isRunning = false;
      this.currentExecutionId = null;
      this.webWorkerDeviceAdapter = new WebWorkerDeviceAdapter();
      this.setupMessageListener();
    }
    setupMessageListener() {
      if (typeof self === "undefined") return;
      self.addEventListener("message", (event) => {
        console.log("\u{1F4E8} [WORKER] Web worker received message from main thread:", {
          type: event.data.type,
          id: event.data.id,
          timestamp: event.data.timestamp,
          dataSize: JSON.stringify(event.data).length
        });
        void this.handleMessage(event.data);
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
          default:
            console.log("\u26A0\uFE0F [WORKER] Unexpected message type:", message.type);
            break;
        }
      } catch (error) {
        console.log("\u274C [WORKER] Error processing message:", error);
        this.sendError(message.id, error instanceof Error ? error : new Error(String(error)));
      }
    }
    async handleExecute(message) {
      try {
        const { code, config: config2 } = message.data;
        this.currentExecutionId = message.id;
        if (this.webWorkerDeviceAdapter) {
          this.webWorkerDeviceAdapter.setCurrentExecutionId(message.id);
        }
        console.log("\u25B6\uFE0F [WORKER] Starting execution:", {
          executionId: message.id,
          codeLength: code.length
        });
        console.log("\u{1F527} [WORKER] Creating interpreter with WebWorkerDeviceAdapter:", {
          hasOriginalDeviceAdapter: !!config2.deviceAdapter,
          maxIterations: config2.maxIterations,
          maxOutputLines: config2.maxOutputLines
        });
        this.interpreter = new BasicInterpreter({
          ...config2,
          deviceAdapter: this.webWorkerDeviceAdapter
          // Use WebWorkerDeviceAdapter (non-null assertion)
        });
        console.log("\u2705 [WORKER] Interpreter created with WebWorkerDeviceAdapter");
        console.log("\u{1F680} [WORKER] Executing BASIC code");
        this.isRunning = true;
        const result = await this.interpreter.execute(code);
        this.isRunning = false;
        console.log("\u2705 [WORKER] Execution completed:", {
          success: result.success,
          outputLines: this.webWorkerDeviceAdapter?.printOutput.length ?? 0,
          executionTime: result.executionTime
        });
        if (!this.interpreter) {
          throw new Error("Interpreter not initialized");
        }
        const spriteStates = this.interpreter.getSpriteStates();
        const spriteEnabled = this.interpreter.isSpriteEnabled();
        const movementStates = this.interpreter.getMovementStates();
        const enhancedResult = {
          ...result,
          executionId: message.id,
          workerId: "web-worker-1",
          spriteStates,
          spriteEnabled,
          movementStates
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
      if (this.webWorkerDeviceAdapter) {
        console.log("\u{1F3AE} [WORKER] Updating WebWorkerDeviceAdapter STRIG buffer");
        this.webWorkerDeviceAdapter.pushStrigState(joystickId, state);
      } else {
        console.log("\u{1F3AE} [WORKER] No WebWorkerDeviceAdapter available for STRIG event");
      }
    }
    handleStickEvent(message) {
      const { joystickId, state } = message.data;
      console.log("\u{1F3AE} [WORKER] Processing STICK event:", { joystickId, state });
      if (this.webWorkerDeviceAdapter) {
        console.log("\u{1F3AE} [WORKER] Updating WebWorkerDeviceAdapter STICK state");
        this.webWorkerDeviceAdapter.setStickState(joystickId, state);
      } else {
        console.log("\u{1F3AE} [WORKER] No WebWorkerDeviceAdapter available for STICK event");
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
  new WebWorkerInterpreter();
})();
/*! Bundled license information:

decimal.js/decimal.mjs:
  (*!
   *  decimal.js v10.6.0
   *  An arbitrary-precision Decimal type for JavaScript.
   *  https://github.com/MikeMcl/decimal.js
   *  Copyright (c) 2025 Michael Mclaughlin <M8ch88l@gmail.com>
   *  MIT Licence
   *)

lodash-es/lodash.js:
  (**
   * @license
   * Lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="es" -o ./`
   * Copyright OpenJS Foundation and other contributors <https://openjsf.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   *)
*/
