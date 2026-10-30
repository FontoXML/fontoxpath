import * as chai from 'chai';
import { Decimal } from 'fontoxpath/expressions/dataTypes/valueTypes/Decimal';

describe('Data type: decimal', () => {
	describe('Decimal.fromString()', () => {
		it('parses integers', () => {
			chai.assert.strictEqual(Decimal.fromString('42').toString(), '42');
			chai.assert.strictEqual(Decimal.fromString('-42').toString(), '-42');
			chai.assert.strictEqual(Decimal.fromString('+42').toString(), '42');
		});

		it('parses fractions', () => {
			chai.assert.strictEqual(Decimal.fromString('0.5').toString(), '0.5');
			chai.assert.strictEqual(Decimal.fromString('-0.5').toString(), '-0.5');
			chai.assert.strictEqual(Decimal.fromString('.5').toString(), '0.5');
			chai.assert.strictEqual(Decimal.fromString('5.').toString(), '5');
		});

		it('normalizes trailing zeros and leading zeros', () => {
			chai.assert.strictEqual(Decimal.fromString('007.50').toString(), '7.5');
			chai.assert.strictEqual(Decimal.fromString('0.000').toString(), '0');
			chai.assert.strictEqual(Decimal.fromString('-0').toString(), '0');
		});

		it('parses exponent notation as produced by Number.prototype.toString', () => {
			chai.assert.strictEqual(
				Decimal.fromString('1e+21').toString(),
				'1000000000000000000000',
			);
			chai.assert.strictEqual(Decimal.fromString('1.5e-7').toString(), '0.00000015');
		});

		it('rejects invalid lexical representations', () => {
			chai.assert.throws(() => Decimal.fromString('abc'), 'FORG0001');
			chai.assert.throws(() => Decimal.fromString(''), 'FORG0001');
			chai.assert.throws(() => Decimal.fromString('.'), 'FORG0001');
			chai.assert.throws(() => Decimal.fromString('1.2.3'), 'FORG0001');
		});
	});

	describe('Decimal.fromFloat()', () => {
		it('converts floats using their shortest round-trip representation', () => {
			chai.assert.strictEqual(Decimal.fromFloat(0.1).toString(), '0.1');
			chai.assert.strictEqual(Decimal.fromFloat(1.5).toString(), '1.5');
			chai.assert.strictEqual(Decimal.fromFloat(-1.5).toString(), '-1.5');
			chai.assert.strictEqual(Decimal.fromFloat(1e21).toString(), '1000000000000000000000');
		});

		it('converts zero (including -0) to 0', () => {
			chai.assert.strictEqual(Decimal.fromFloat(0).toString(), '0');
			chai.assert.strictEqual(Decimal.fromFloat(-0).toString(), '0');
		});

		it('rejects NaN and Infinity', () => {
			chai.assert.throws(() => Decimal.fromFloat(NaN), 'FOCA0002');
			chai.assert.throws(() => Decimal.fromFloat(Infinity), 'FOCA0002');
			chai.assert.throws(() => Decimal.fromFloat(-Infinity), 'FOCA0002');
		});
	});

	describe('Decimal.toFloat()', () => {
		it('converts back to the nearest float', () => {
			chai.assert.strictEqual(Decimal.fromString('1.5').toFloat(), 1.5);
			chai.assert.strictEqual(Decimal.fromString('-0.25').toFloat(), -0.25);
			chai.assert.strictEqual(Decimal.fromString('0').toFloat(), 0);
		});
	});

	describe('add (op:numeric-add)', () => {
		it('adds decimals exactly', () => {
			chai.assert.strictEqual(
				Decimal.fromString('0.1').add(Decimal.fromString('0.2')).toString(),
				'0.3',
			);
			chai.assert.strictEqual(
				Decimal.fromString('1.5').add(Decimal.fromString('2.25')).toString(),
				'3.75',
			);
		});

		it('carries into the whole part', () => {
			chai.assert.strictEqual(
				Decimal.fromString('0.6').add(Decimal.fromString('0.6')).toString(),
				'1.2',
			);
		});

		it('handles negative operands', () => {
			chai.assert.strictEqual(
				Decimal.fromString('-1.5').add(Decimal.fromString('1')).toString(),
				'-0.5',
			);
			chai.assert.strictEqual(
				Decimal.fromString('-1.5').add(Decimal.fromString('-2.25')).toString(),
				'-3.75',
			);
		});

		it('accepts xs:integer and xs:float/xs:double operands (number and bigint)', () => {
			chai.assert.strictEqual(Decimal.fromFloat(1.5).add(2).toString(), '3.5');
			chai.assert.strictEqual(Decimal.fromFloat(1.5).add(BigInt(2)).toString(), '3.5');
			chai.assert.strictEqual(Decimal.fromFloat(1.5).add(0.5).toString(), '2');
		});

		it('does not lose precision beyond the float range', () => {
			chai.assert.strictEqual(
				Decimal.fromString('99999999999999999999').add(Decimal.fromString('1')).toString(),
				'100000000000000000000',
			);
		});
	});

	describe('subtract (op:numeric-subtract)', () => {
		it('subtracts decimals exactly', () => {
			chai.assert.strictEqual(
				Decimal.fromString('1').subtract(Decimal.fromString('0.3')).toString(),
				'0.7',
			);
			chai.assert.strictEqual(
				Decimal.fromString('1.2').subtract(Decimal.fromString('0.6')).toString(),
				'0.6',
			);
		});

		it('handles negative results', () => {
			chai.assert.strictEqual(
				Decimal.fromString('5.5').subtract(Decimal.fromString('2')).toString(),
				'3.5',
			);
			chai.assert.strictEqual(
				Decimal.fromString('-7').subtract(Decimal.fromString('3')).toString(),
				'-10',
			);
		});
	});

	describe('multiply (op:numeric-multiply)', () => {
		it('multiplies decimals exactly', () => {
			chai.assert.strictEqual(
				Decimal.fromString('0.1').multiply(Decimal.fromString('0.2')).toString(),
				'0.02',
			);
			chai.assert.strictEqual(
				Decimal.fromString('1.1').multiply(Decimal.fromString('1.1')).toString(),
				'1.21',
			);
		});

		it('handles signs and integers', () => {
			chai.assert.strictEqual(
				Decimal.fromString('-2.5').multiply(Decimal.fromString('4')).toString(),
				'-10',
			);
			chai.assert.strictEqual(Decimal.fromString('1.5').multiply(2).toString(), '3');
		});

		it('does not lose precision beyond the float range', () => {
			chai.assert.strictEqual(
				Decimal.fromString('99999999999999999999')
					.multiply(Decimal.fromString('99999999999999999999'))
					.toString(),
				'9999999999999999999800000000000000000001',
			);
		});
	});

	describe('div (op:numeric-divide)', () => {
		it('computes exact quotients exactly', () => {
			chai.assert.strictEqual(
				Decimal.fromString('1').div(Decimal.fromString('2')).toString(),
				'0.5',
			);
			chai.assert.strictEqual(
				Decimal.fromString('10').div(Decimal.fromString('4')).toString(),
				'2.5',
			);
			chai.assert.strictEqual(
				Decimal.fromString('1')
					.div(Decimal.fromString('1000000000000000000000000000000'))
					.toString(),
				'0.000000000000000000000000000001',
			);
		});

		it('computes quotients with at least 18 significant digits', () => {
			chai.assert.strictEqual(
				Decimal.fromString('1').div(Decimal.fromString('3')).toString(),
				'0.33333333333333333333',
			);
			chai.assert.strictEqual(
				Decimal.fromString('2').div(Decimal.fromString('3')).toString(),
				'0.66666666666666666667',
			);
			chai.assert.strictEqual(
				Decimal.fromString('-1').div(Decimal.fromString('3')).toString(),
				'-0.33333333333333333333',
			);
		});

		it('keeps enough significant digits for large quotients', () => {
			chai.assert.strictEqual(
				Decimal.fromString('1000000000000000000000000000000')
					.div(Decimal.fromString('3'))
					.toString(),
				'333333333333333333333333333333',
			);
		});

		it('returns 0 when dividing 0', () => {
			chai.assert.strictEqual(
				Decimal.fromString('0').div(Decimal.fromString('5')).toString(),
				'0',
			);
		});

		it('throws FOAR0001 when dividing by zero', () => {
			chai.assert.throws(
				() => Decimal.fromString('1').div(Decimal.fromString('0')),
				'FOAR0001',
			);
			chai.assert.throws(() => Decimal.fromString('1').div(0), 'FOAR0001');
		});
	});

	describe('idiv (op:numeric-integer-divide)', () => {
		it('truncates the quotient toward zero and returns an xs:integer', () => {
			chai.assert.strictEqual(
				Decimal.fromString('7').idiv(Decimal.fromString('2')),
				BigInt(3),
			);
			chai.assert.strictEqual(
				Decimal.fromString('-7').idiv(Decimal.fromString('2')),
				BigInt(-3),
			);
			chai.assert.strictEqual(
				Decimal.fromString('7').idiv(Decimal.fromString('-2')),
				BigInt(-3),
			);
			chai.assert.strictEqual(
				Decimal.fromString('-7').idiv(Decimal.fromString('-2')),
				BigInt(3),
			);
			chai.assert.strictEqual(
				Decimal.fromString('-1').idiv(Decimal.fromString('3')),
				BigInt(0),
			);
		});

		it('works with decimal operands', () => {
			chai.assert.strictEqual(
				Decimal.fromString('5.5').idiv(Decimal.fromString('2')),
				BigInt(2),
			);
			chai.assert.strictEqual(
				Decimal.fromString('1').idiv(Decimal.fromString('3')),
				BigInt(0),
			);
		});

		it('throws FOAR0001 when dividing by zero', () => {
			chai.assert.throws(
				() => Decimal.fromString('1').idiv(Decimal.fromString('0')),
				'FOAR0001',
			);
		});
	});

	describe('mod (op:numeric-mod)', () => {
		it('returns a remainder with the sign of the dividend', () => {
			chai.assert.strictEqual(
				Decimal.fromString('7').mod(Decimal.fromString('3')).toString(),
				'1',
			);
			chai.assert.strictEqual(
				Decimal.fromString('-7').mod(Decimal.fromString('3')).toString(),
				'-1',
			);
			chai.assert.strictEqual(
				Decimal.fromString('7').mod(Decimal.fromString('-3')).toString(),
				'1',
			);
			chai.assert.strictEqual(
				Decimal.fromString('-7').mod(Decimal.fromString('-3')).toString(),
				'-1',
			);
		});

		it('works with decimal operands', () => {
			chai.assert.strictEqual(
				Decimal.fromString('5.5').mod(Decimal.fromString('2')).toString(),
				'1.5',
			);
			chai.assert.strictEqual(
				Decimal.fromString('1').mod(Decimal.fromString('0.3')).toString(),
				'0.1',
			);
			chai.assert.strictEqual(
				Decimal.fromString('5').mod(Decimal.fromString('2.5')).toString(),
				'0',
			);
		});

		it('throws FOAR0001 when the divisor is zero', () => {
			chai.assert.throws(
				() => Decimal.fromString('1').mod(Decimal.fromString('0')),
				'FOAR0001',
			);
		});
	});

	describe('negate (op:numeric-unary-minus)', () => {
		it('negates the decimal', () => {
			chai.assert.strictEqual(Decimal.fromString('1.5').negate().toString(), '-1.5');
			chai.assert.strictEqual(Decimal.fromString('-1.5').negate().toString(), '1.5');
			chai.assert.strictEqual(Decimal.fromString('0').negate().toString(), '0');
		});
	});

	describe('equals and compareTo', () => {
		it('compares decimals by value, regardless of scale', () => {
			chai.assert.isTrue(Decimal.fromString('1.5').equals(Decimal.fromString('1.50')));
			chai.assert.isTrue(
				Decimal.fromString('0.1')
					.add(Decimal.fromString('0.2'))
					.equals(Decimal.fromString('0.3')),
			);
			chai.assert.isTrue(Decimal.fromString('1.5').equals(1.5));
			chai.assert.isFalse(Decimal.fromString('1.5').equals(Decimal.fromString('1.6')));
		});

		it('orders decimals by value', () => {
			chai.assert.strictEqual(
				Decimal.fromString('1.5').compareTo(Decimal.fromString('2')),
				-1,
			);
			chai.assert.strictEqual(
				Decimal.fromString('2').compareTo(Decimal.fromString('1.5')),
				1,
			);
			chai.assert.strictEqual(
				Decimal.fromString('1.5').compareTo(Decimal.fromString('1.5')),
				0,
			);
		});
	});

	describe('isZero', () => {
		it('detects zero values', () => {
			chai.assert.isTrue(Decimal.fromString('0').isZero());
			chai.assert.isTrue(Decimal.fromString('0.00').isZero());
			chai.assert.isFalse(Decimal.fromString('0.1').isZero());
		});
	});
});
