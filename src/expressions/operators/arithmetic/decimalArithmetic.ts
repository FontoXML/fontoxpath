/**
 * Exact arithmetic for xs:decimal operands.
 *
 * xs:decimal values are stored as JavaScript numbers. `String(value)` gives the shortest decimal
 * that converts back to the same number, which for any decimal of up to 15 significant digits is
 * that decimal itself. These operations read both operands as such decimals, compute on BigInt
 * coefficients so that nothing is lost along the way, and round only the result back to the nearest
 * number. That makes `1.1 + 2.2 eq 3.3` true, where adding the two numbers directly gives
 * 3.3000000000000003. Operands of more than 15 significant digits are left to number arithmetic.
 *
 * See https://www.w3.org/TR/xpath-functions-31/#op.numeric
 */

/**
 * A decimal as `coefficient * 10^exponent`.
 */
type ScaledDecimal = { coefficient: bigint; exponent: number };

type NumericOperation = (a: number, b: number) => number;

const ZERO = BigInt(0);
const ONE = BigInt(1);
const TEN = BigInt(10);

/**
 * A quotient that does not terminate is carried to this many significant digits before it is
 * rounded, a few more than the 17 a number can hold.
 */
const QUOTIENT_DIGITS = 20;

/**
 * A number gives back any decimal of up to this many significant digits through `String()`. A
 * longer string is how the number prints, such as 0.3333333333333333 for 1 div 3, not necessarily a
 * decimal anybody wrote, and computing exactly on it is no more accurate than number arithmetic.
 */
const MAX_SIGNIFICANT_DIGITS = 15;

const NUMBER_STRING_PATTERN = /^(-?)(\d+)(?:\.(\d+))?(?:e([+-]\d+))?$/;

function toScaledDecimal(value: number): ScaledDecimal | null {
	const match = NUMBER_STRING_PATTERN.exec(String(value));
	if (!match) {
		// NaN and the infinities have no decimal to work on
		return null;
	}
	const [, sign, integerDigits, fractionDigits = '', exponent = '0'] = match;
	const coefficient = BigInt(sign + integerDigits + fractionDigits);
	if (digitCount(coefficient) > MAX_SIGNIFICANT_DIGITS) {
		return null;
	}
	return {
		coefficient,
		exponent: parseInt(exponent, 10) - fractionDigits.length,
	};
}

function toNumber(coefficient: bigint, exponent: number): number {
	// Parsing the exact decimal rounds it to the nearest number in a single step
	return Number(`${coefficient}e${exponent}`);
}

function powerOfTen(exponent: number): bigint {
	return BigInt(`1${'0'.repeat(exponent)}`);
}

function digitCount(coefficient: bigint): number {
	return (coefficient < ZERO ? -coefficient : coefficient).toString().length;
}

/**
 * Write both decimals with the smaller of their two exponents, so their coefficients can be added,
 * subtracted or divided directly.
 */
function align(a: ScaledDecimal, b: ScaledDecimal): [bigint, bigint, number] {
	if (a.exponent > b.exponent) {
		return [a.coefficient * powerOfTen(a.exponent - b.exponent), b.coefficient, b.exponent];
	}
	return [a.coefficient, b.coefficient * powerOfTen(b.exponent - a.exponent), a.exponent];
}

function add(a: ScaledDecimal, b: ScaledDecimal): number {
	const [left, right, exponent] = align(a, b);
	return toNumber(left + right, exponent);
}

function subtract(a: ScaledDecimal, b: ScaledDecimal): number {
	const [left, right, exponent] = align(a, b);
	return toNumber(left - right, exponent);
}

function multiply(a: ScaledDecimal, b: ScaledDecimal): number {
	return toNumber(a.coefficient * b.coefficient, a.exponent + b.exponent);
}

function divide(a: ScaledDecimal, b: ScaledDecimal): number | null {
	if (b.coefficient === ZERO) {
		return null;
	}
	const shift =
		Math.max(0, digitCount(b.coefficient) - digitCount(a.coefficient)) + QUOTIENT_DIGITS;
	const dividend = a.coefficient * powerOfTen(shift);
	let quotient = dividend / b.coefficient;
	let exponent = a.exponent - b.exponent - shift;
	if (dividend % b.coefficient !== ZERO) {
		// The quotient was truncated. One more nonzero digit keeps it from looking like an exact tie
		// between two numbers, so that rounding it still goes the right way.
		const stickyDigit = a.coefficient < ZERO !== b.coefficient < ZERO ? -ONE : ONE;
		quotient = quotient * TEN + stickyDigit;
		exponent -= 1;
	}
	return toNumber(quotient, exponent);
}

function integerDivide(a: ScaledDecimal, b: ScaledDecimal): number | null {
	const [left, right] = align(a, b);
	if (right === ZERO) {
		return null;
	}
	// BigInt division truncates towards zero, as op:numeric-integer-divide does
	return Number(left / right);
}

function mod(a: ScaledDecimal, b: ScaledDecimal): number | null {
	const [left, right, exponent] = align(a, b);
	if (right === ZERO) {
		return null;
	}
	// The remainder takes the sign of the dividend, as op:numeric-mod requires
	return toNumber(left % right, exponent);
}

/**
 * Run `decimalOperation` on the decimals the operands stand for, or `numberOperation` on the
 * numbers themselves where that is already exact or the decimal operation has no answer.
 */
function exactly(
	numberOperation: NumericOperation,
	decimalOperation: (a: ScaledDecimal, b: ScaledDecimal) => number | null,
): NumericOperation {
	return (a, b) => {
		if (Number.isInteger(a) && Number.isInteger(b)) {
			// Whole numbers need no conversion: an operation on two of them already rounds the
			// exact result once, as the decimal operations below do
			return numberOperation(a, b);
		}
		const left = toScaledDecimal(a);
		const right = toScaledDecimal(b);
		const result = left && right ? decimalOperation(left, right) : null;
		// Division by zero, non-finite operands and operands of more significant digits than a
		// number holds keep the behaviour of the number operation
		return result === null ? numberOperation(a, b) : result;
	};
}

const decimalAdd = exactly((a, b) => a + b, add);
const decimalSubtract = exactly((a, b) => a - b, subtract);
const decimalMultiply = exactly((a, b) => a * b, multiply);
const decimalDivide = exactly((a, b) => a / b, divide);
const decimalIntegerDivide = exactly((a, b) => Math.trunc(a / b), integerDivide);
const decimalMod = exactly((a, b) => a % b, mod);

/**
 * The exact counterpart of a numeric operation in the operation map, for operands that are both
 * xs:decimal (or derived from it) and not both xs:integer.
 *
 * @param operator One of addOp, subtractOp, multiplyOp, divOp, idivOp, modOp
 * @returns The operation, or undefined for any other operator
 */
export function getDecimalOperation(operator: string): NumericOperation | undefined {
	switch (operator) {
		case 'addOp':
			return decimalAdd;
		case 'subtractOp':
			return decimalSubtract;
		case 'multiplyOp':
			return decimalMultiply;
		case 'divOp':
			return decimalDivide;
		case 'idivOp':
			return decimalIntegerDivide;
		case 'modOp':
			return decimalMod;
	}
	return undefined;
}
