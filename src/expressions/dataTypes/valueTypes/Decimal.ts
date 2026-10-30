import { errFORG0001 } from '../../../expressions/XPathErrors';
import { ValueType } from '../Value';

const ZERO = BigInt(0);
const ONE = BigInt(1);
const TWO = BigInt(2);
const TEN = BigInt(10);
const BILLION = BigInt(1000000000);

/**
 * The largest unscaled value (15 digits) that is exactly representable as a
 * JavaScript number, i.e. below 2^53.
 */
const MAX_EXACT_UNSCALED = BigInt('999999999999999');

/**
 * The minimum number of significant digits the quotient of a division between two
 * xs:decimal values must have, as required by the XQuery and XPath specifications.
 */
const MINIMUM_SIGNIFICANT_DIGITS_OF_DIVISION = 18;

const pow10Cache: bigint[] = [ONE];

function pow10(exponent: number): bigint {
	let cached = pow10Cache[exponent];
	if (cached === undefined) {
		cached = TEN ** BigInt(exponent);
		pow10Cache[exponent] = cached;
	}
	return cached;
}

const HUNDRED = BigInt(100);
const THOUSAND = BigInt(1000);
const TEN_THOUSAND = BigInt(10000);
const HUNDRED_THOUSAND = BigInt(100000);
const MILLION = BigInt(1000000);
const TEN_MILLION = BigInt(10000000);
const HUNDRED_MILLION = BigInt(100000000);

function digitCount(value: bigint): number {
	const absoluteValue = value < ZERO ? -value : value;
	if (absoluteValue < TEN) return 1;
	if (absoluteValue < HUNDRED) return 2;
	if (absoluteValue < THOUSAND) return 3;
	if (absoluteValue < TEN_THOUSAND) return 4;
	if (absoluteValue < HUNDRED_THOUSAND) return 5;
	if (absoluteValue < MILLION) return 6;
	if (absoluteValue < TEN_MILLION) return 7;
	if (absoluteValue < HUNDRED_MILLION) return 8;
	if (absoluteValue < BILLION) return 9;
	return absoluteValue.toString().length;
}

export class Decimal {
	public static ZERO = Decimal.fromBigInt(ZERO);

	/**
	 * The value of this decimal is `_unscaled * 10^-_scale`. The scale is always
	 * non-negative and the unscaled value never ends in a zero digit while the scale
	 * is positive.
	 */
	private readonly _unscaled: bigint;
	private readonly _scale: number;

	private constructor(unscaled: bigint, scale: number) {
		if (unscaled === ZERO) {
			this._unscaled = ZERO;
			this._scale = 0;
			return;
		}
		while (scale >= 9 && unscaled % BILLION === ZERO) {
			unscaled /= BILLION;
			scale -= 9;
		}
		while (scale > 0 && unscaled % TEN === ZERO) {
			unscaled /= TEN;
			scale--;
		}
		this._unscaled = unscaled;
		this._scale = scale;
	}

	public static fromFloat(float: number): Decimal {
		if (!Number.isFinite(float)) {
			throw new Error(`FOCA0002: Can not cast ${float} to xs:decimal`);
		}
		if (float === 0) {
			return new Decimal(ZERO, 0);
		}
		// Integer-valued numbers below 1e21 are exactly representable as a bigint and
		// have an exact, non-exponential string representation, so converting through
		// the string representation is unnecessary. Larger values keep the string
		// conversion to preserve the shortest round-trip decimal expansion.
		if (Number.isInteger(float) && Math.abs(float) < 1e21) {
			return new Decimal(BigInt(float), 0);
		}
		return Decimal.fromString(float.toString());
	}

	public static fromBigInt(value: bigint): Decimal {
		return new Decimal(value, 0);
	}

	/**
	 * Parses the lexical representation of an xs:decimal. Also accepts the exponent
	 * notation produced by Number.prototype.toString (e.g. "1e+21").
	 */
	public static fromString(decimalString: string): Decimal {
		const match = /^([+-]?)(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(decimalString.trim());
		if (!match || (match[2] === '' && !match[3])) {
			throw errFORG0001(
				decimalString,
				ValueType.XSSTRING,
				'is not a valid lexical representation of xs:decimal',
			);
		}
		const sign = match[1] === '-' ? -ONE : ONE;
		const wholePart = match[2] || '';
		const fractionPart = match[3] || '';
		const exponent = match[4] ? parseInt(match[4], 10) : 0;
		const digits = BigInt(wholePart + fractionPart);
		const scale = fractionPart.length - exponent;
		return scale >= 0
			? new Decimal(sign * digits, scale)
			: new Decimal(sign * digits * pow10(-scale), 0);
	}

	public static coerce(value: Decimal | number | bigint): Decimal {
		if (value instanceof Decimal) {
			return value;
		}
		return typeof value === 'bigint' ? Decimal.fromBigInt(value) : Decimal.fromFloat(value);
	}

	/**
	 * op:numeric-add: returns the sum of this decimal and the given numeric value.
	 */
	public add(other: Decimal | number | bigint): Decimal {
		const otherDecimal = Decimal.coerce(other);
		const scale = Math.max(this._scale, otherDecimal._scale);
		const left =
			scale === this._scale ? this._unscaled : this._unscaled * pow10(scale - this._scale);
		const right =
			scale === otherDecimal._scale
				? otherDecimal._unscaled
				: otherDecimal._unscaled * pow10(scale - otherDecimal._scale);
		return new Decimal(left + right, scale);
	}

	/**
	 * op:numeric-subtract: returns the difference of this decimal and the given numeric value.
	 */
	public subtract(other: Decimal | number | bigint): Decimal {
		const otherDecimal = Decimal.coerce(other);
		const scale = Math.max(this._scale, otherDecimal._scale);
		const left =
			scale === this._scale ? this._unscaled : this._unscaled * pow10(scale - this._scale);
		const right =
			scale === otherDecimal._scale
				? otherDecimal._unscaled
				: otherDecimal._unscaled * pow10(scale - otherDecimal._scale);
		return new Decimal(left - right, scale);
	}

	/**
	 * op:numeric-multiply: returns the product of this decimal and the given numeric value.
	 */
	public multiply(other: Decimal | number | bigint): Decimal {
		const otherDecimal = Decimal.coerce(other);
		return new Decimal(
			this._unscaled * otherDecimal._unscaled,
			this._scale + otherDecimal._scale,
		);
	}

	/**
	 * op:numeric-divide: returns the quotient of this decimal and the given numeric value,
	 * computed with at least 18 significant digits of precision.
	 */
	public div(other: Decimal | number | bigint): Decimal {
		const otherDecimal = Decimal.coerce(other);
		if (otherDecimal._unscaled === ZERO) {
			throw new Error('FOAR0001: Division by zero');
		}
		const numerator =
			otherDecimal._scale === 0
				? this._unscaled
				: this._unscaled * pow10(otherDecimal._scale);
		const denominator =
			this._scale === 0
				? otherDecimal._unscaled
				: otherDecimal._unscaled * pow10(this._scale);
		const scale = Math.max(
			0,
			MINIMUM_SIGNIFICANT_DIGITS_OF_DIVISION +
				2 -
				digitCount(numerator) +
				digitCount(denominator),
		);
		const scaledNumerator = scale === 0 ? numerator : numerator * pow10(scale);
		let quotient = scaledNumerator / denominator;
		const remainder = scaledNumerator % denominator;
		if (remainder !== ZERO) {
			const absoluteRemainder = remainder < ZERO ? -remainder : remainder;
			const absoluteDenominator = denominator < ZERO ? -denominator : denominator;
			if (absoluteRemainder * TWO >= absoluteDenominator) {
				quotient += quotient < ZERO ? -ONE : ONE;
			}
		}
		return new Decimal(quotient, scale);
	}

	/**
	 * op:numeric-integer-divide: returns the quotient of this decimal and the given numeric
	 * value as an xs:integer (bigint), with the fractional part truncated toward zero.
	 */
	public idiv(other: Decimal | number | bigint): bigint {
		const otherDecimal = Decimal.coerce(other);
		if (otherDecimal._unscaled === ZERO) {
			throw new Error('FOAR0001: Division by zero');
		}
		const numerator =
			otherDecimal._scale === 0
				? this._unscaled
				: this._unscaled * pow10(otherDecimal._scale);
		const denominator =
			this._scale === 0
				? otherDecimal._unscaled
				: otherDecimal._unscaled * pow10(this._scale);
		return numerator / denominator;
	}

	/**
	 * op:numeric-mod: returns the remainder of the division of this decimal by the given
	 * numeric value. The result has the same sign as this decimal.
	 */
	public mod(other: Decimal | number | bigint): Decimal {
		const otherDecimal = Decimal.coerce(other);
		if (otherDecimal._unscaled === ZERO) {
			throw new Error('FOAR0001: Division by zero');
		}
		const numerator =
			otherDecimal._scale === 0
				? this._unscaled
				: this._unscaled * pow10(otherDecimal._scale);
		const denominator =
			this._scale === 0
				? otherDecimal._unscaled
				: otherDecimal._unscaled * pow10(this._scale);
		return new Decimal(numerator % denominator, this._scale + otherDecimal._scale);
	}

	/**
	 * op:numeric-unary-minus: returns the negation of this decimal.
	 */
	public negate(): Decimal {
		return new Decimal(-this._unscaled, this._scale);
	}

	public isZero(): boolean {
		return this._unscaled === ZERO;
	}

	public floor(): Decimal {
		if (this._scale === 0) {
			return this;
		}
		const pow = pow10(this._scale);
		const quotient = this._unscaled / pow;
		const remainder = this._unscaled % pow;
		return new Decimal(remainder < ZERO ? quotient - ONE : quotient, 0);
	}

	public ceiling(): Decimal {
		if (this._scale === 0) {
			return this;
		}
		const pow = pow10(this._scale);
		const quotient = this._unscaled / pow;
		const remainder = this._unscaled % pow;
		return new Decimal(remainder > ZERO ? quotient + ONE : quotient, 0);
	}

	public truncate(): Decimal {
		if (this._scale === 0) {
			return this;
		}
		return new Decimal(this._unscaled / pow10(this._scale), 0);
	}

	public equals(other: Decimal | number | bigint): boolean {
		return this.compareTo(other) === 0;
	}

	public compareTo(other: Decimal | number | bigint): number {
		const otherDecimal = Decimal.coerce(other);
		const scale = Math.max(this._scale, otherDecimal._scale);
		const left =
			scale === this._scale ? this._unscaled : this._unscaled * pow10(scale - this._scale);
		const right =
			scale === otherDecimal._scale
				? otherDecimal._unscaled
				: otherDecimal._unscaled * pow10(scale - otherDecimal._scale);
		return left < right ? -1 : left > right ? 1 : 0;
	}

	public toFloat(): number {
		// Integers convert directly, only fractions need more care to round correctly.
		if (this._scale === 0) {
			return Number(this._unscaled);
		}
		// For unscaled values below 2^53 the conversion to a number is exact, and
		// powers of ten up to 10^22 are exactly representable, so a single division
		// rounds correctly without going through the string representation.
		if (this._scale <= 22) {
			const absoluteUnscaled = this._unscaled < ZERO ? -this._unscaled : this._unscaled;
			if (absoluteUnscaled <= MAX_EXACT_UNSCALED) {
				return Number(this._unscaled) / 10 ** this._scale;
			}
		}
		return Number(this.toString());
	}

	public toString(): string {
		if (this._unscaled === ZERO) {
			return '0';
		}
		const negative = this._unscaled < ZERO;
		const digits = (negative ? -this._unscaled : this._unscaled).toString();
		let result: string;
		if (this._scale === 0) {
			result = digits;
		} else if (digits.length <= this._scale) {
			result = '0.' + '0'.repeat(this._scale - digits.length) + digits;
		} else {
			const splitIndex = digits.length - this._scale;
			result = digits.slice(0, splitIndex) + '.' + digits.slice(splitIndex);
		}
		return negative ? '-' + result : result;
	}
}
