import * as chai from 'chai';
import * as slimdom from 'slimdom';

import {
	evaluateXPath,
	evaluateXPathToBoolean,
	evaluateXPathToNumber,
	evaluateXPathToNumbers,
	evaluateXPathToString,
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

/**
 * These tests exercise the numeric operators through the engine using exact
 * xs:decimal arithmetic (the Decimal value type). They assert the canonical
 * string representation of the results, e.g. 1.1 + 2.2 = 3.3 (and not
 * 3.3000000000000003).
 *
 * The exactness tests fail while the operators are evaluated with JavaScript
 * floats and pass once the operators are wired up to the Decimal
 * implementation in expressions/dataTypes/valueTypes/Decimal.ts.
 */
describe('numeric operators on xs:decimal', () => {
	describe('add (+)', () => {
		it('evaluates 1.1 + 2.2 to 3.3', () =>
			chai.assert.strictEqual(evaluateXPathToString('1.1 + 2.2', documentNode), '3.3'));

		it('evaluates 0.1 + 0.2 to 0.3', () =>
			chai.assert.strictEqual(evaluateXPathToString('0.1 + 0.2', documentNode), '0.3'));

		it('evaluates 0.1 + 0.2 + 0.3 to 0.6', () =>
			chai.assert.strictEqual(evaluateXPathToString('0.1 + 0.2 + 0.3', documentNode), '0.6'));

		it('evaluates 1.5 + 2.25 to 3.75', () =>
			chai.assert.strictEqual(evaluateXPathToString('1.5 + 2.25', documentNode), '3.75'));

		it('carries into the whole part: 0.6 + 0.6 to 1.2', () =>
			chai.assert.strictEqual(evaluateXPathToString('0.6 + 0.6', documentNode), '1.2'));

		it('handles negative operands: -1.5 + 1 to -0.5', () =>
			chai.assert.strictEqual(evaluateXPathToString('-1.5 + 1', documentNode), '-0.5'));

		it('adds an xs:integer to an xs:decimal: 1.5 + 2 to 3.5', () =>
			chai.assert.strictEqual(evaluateXPathToString('1.5 + 2', documentNode), '3.5'));
	});

	describe('subtract (-)', () => {
		it('evaluates 1 - 0.7 to 0.3', () =>
			chai.assert.strictEqual(evaluateXPathToString('1 - 0.7', documentNode), '0.3'));

		it('evaluates 3.3 - 1.1 to 2.2', () =>
			chai.assert.strictEqual(evaluateXPathToString('3.3 - 1.1', documentNode), '2.2'));

		it('borrows from the whole part: 1.2 - 0.6 to 0.6', () =>
			chai.assert.strictEqual(evaluateXPathToString('1.2 - 0.6', documentNode), '0.6'));

		it('evaluates -7 - 3 to -10', () =>
			chai.assert.strictEqual(evaluateXPathToString('-7 - 3', documentNode), '-10'));
	});

	describe('multiply (*)', () => {
		it('evaluates 0.1 * 0.2 to 0.02', () =>
			chai.assert.strictEqual(evaluateXPathToString('0.1 * 0.2', documentNode), '0.02'));

		it('evaluates 1.1 * 1.1 to 1.21', () =>
			chai.assert.strictEqual(evaluateXPathToString('1.1 * 1.1', documentNode), '1.21'));

		it('evaluates 1.1 * 1.1 * 1.1 to 1.331', () =>
			chai.assert.strictEqual(
				evaluateXPathToString('1.1 * 1.1 * 1.1', documentNode),
				'1.331',
			));

		it('handles signs: -2.5 * 4 to -10', () =>
			chai.assert.strictEqual(evaluateXPathToString('-2.5 * 4', documentNode), '-10'));

		it('multiplies an xs:decimal by an xs:integer: 1.5 * 2 to 3', () =>
			chai.assert.strictEqual(evaluateXPathToString('1.5 * 2', documentNode), '3'));
	});

	describe('div', () => {
		it('evaluates 1 div 2 to 0.5', () =>
			chai.assert.strictEqual(evaluateXPathToString('1 div 2', documentNode), '0.5'));

		it('evaluates 10 div 4 to 2.5', () =>
			chai.assert.strictEqual(evaluateXPathToString('10 div 4', documentNode), '2.5'));

		it('evaluates 1 div 3 to 0.33333333333333333333 (at least 18 significant digits)', () =>
			chai.assert.strictEqual(
				evaluateXPathToString('1 div 3', documentNode),
				'0.33333333333333333333',
			));

		it('evaluates 2 div 3 to 0.66666666666666666667', () =>
			chai.assert.strictEqual(
				evaluateXPathToString('2 div 3', documentNode),
				'0.66666666666666666667',
			));

		it('evaluates -1 div 3 to -0.33333333333333333333', () =>
			chai.assert.strictEqual(
				evaluateXPathToString('-1 div 3', documentNode),
				'-0.33333333333333333333',
			));

		it('evaluates 1 div 10^30 to 0.000000000000000000000000000001', () =>
			chai.assert.strictEqual(
				evaluateXPathToString('1 div 1000000000000000000000000000000', documentNode),
				'0.000000000000000000000000000001',
			));

		it('keeps enough significant digits for large quotients: 10^30 div 3', () =>
			chai.assert.strictEqual(
				evaluateXPathToString('1000000000000000000000000000000 div 3', documentNode),
				'333333333333333333333333333333',
			));

		it('throws FOAR0001 when dividing by zero', () =>
			chai.assert.throws(() => evaluateXPathToString('1 div 0', documentNode), 'FOAR0001'));
	});

	describe('idiv', () => {
		it('evaluates 7 idiv 2 to 3', () =>
			chai.assert.strictEqual(evaluateXPathToString('7 idiv 2', documentNode), '3'));

		it('truncates toward zero: -7 idiv 2 to -3', () =>
			chai.assert.strictEqual(evaluateXPathToString('-7 idiv 2', documentNode), '-3'));

		it('truncates toward zero: 7 idiv -2 to -3', () =>
			chai.assert.strictEqual(evaluateXPathToString('7 idiv -2', documentNode), '-3'));

		it('truncates toward zero: -7 idiv -2 to 3', () =>
			chai.assert.strictEqual(evaluateXPathToString('-7 idiv -2', documentNode), '3'));

		it('evaluates 5.5 idiv 2 to 2', () =>
			chai.assert.strictEqual(evaluateXPathToString('5.5 idiv 2', documentNode), '2'));

		it('evaluates 1 idiv 3 to 0', () =>
			chai.assert.strictEqual(evaluateXPathToString('1 idiv 3', documentNode), '0'));

		it('throws FOAR0001 when dividing by zero', () =>
			chai.assert.throws(() => evaluateXPathToString('1 idiv 0', documentNode), 'FOAR0001'));
	});

	describe('mod', () => {
		it('evaluates 7 mod 3 to 1', () =>
			chai.assert.strictEqual(evaluateXPathToString('7 mod 3', documentNode), '1'));

		it('keeps the sign of the dividend: -7 mod 3 to -1', () =>
			chai.assert.strictEqual(evaluateXPathToString('-7 mod 3', documentNode), '-1'));

		it('keeps the sign of the dividend: 7 mod -3 to 1', () =>
			chai.assert.strictEqual(evaluateXPathToString('7 mod -3', documentNode), '1'));

		it('keeps the sign of the dividend: -7 mod -3 to -1', () =>
			chai.assert.strictEqual(evaluateXPathToString('-7 mod -3', documentNode), '-1'));

		it('evaluates 5.5 mod 2 to 1.5', () =>
			chai.assert.strictEqual(evaluateXPathToString('5.5 mod 2', documentNode), '1.5'));

		it('evaluates 1 mod 0.3 to 0.1', () =>
			chai.assert.strictEqual(evaluateXPathToString('1 mod 0.3', documentNode), '0.1'));

		it('evaluates 0.3 mod 0.1 to 0', () =>
			chai.assert.strictEqual(evaluateXPathToString('0.3 mod 0.1', documentNode), '0'));

		it('evaluates 5 mod 2.5 to 0', () =>
			chai.assert.strictEqual(evaluateXPathToString('5 mod 2.5', documentNode), '0'));

		it('throws FOAR0001 when the divisor is zero', () =>
			chai.assert.throws(() => evaluateXPathToString('1 mod 0', documentNode), 'FOAR0001'));
	});

	describe('unary operators', () => {
		it('evaluates -1.5 to -1.5', () =>
			chai.assert.strictEqual(evaluateXPathToString('-1.5', documentNode), '-1.5'));

		it('evaluates +1.5 to 1.5', () =>
			chai.assert.strictEqual(evaluateXPathToString('+1.5', documentNode), '1.5'));
	});

	describe('numeric equality (also requires Decimal-aware comparisons)', () => {
		it('evaluates 1.1 + 2.2 = 3.3 to true', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('1.1 + 2.2 = 3.3', documentNode)));

		it('evaluates 0.1 + 0.2 = 0.3 to true', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('0.1 + 0.2 = 0.3', documentNode)));

		it('evaluates 1.5 + 2.25 = 3.75 to true', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('1.5 + 2.25 = 3.75', documentNode)));
	});

	describe('evaluateXPathToNumber, evaluateXPathToNumbers and ALL_RESULTS', () => {
		it('evaluateXPathToNumber returns the numeric value of a decimal result', () =>
			chai.assert.strictEqual(evaluateXPathToNumber('1.5', documentNode), 1.5));

		it('evaluateXPathToNumber works for integer results', () =>
			chai.assert.strictEqual(evaluateXPathToNumber('1 + 1', documentNode), 2));

		it('evaluateXPathToNumber works for div, idiv and mod results', () => {
			chai.assert.strictEqual(evaluateXPathToNumber('10 div 4', documentNode), 2.5);
			chai.assert.strictEqual(evaluateXPathToNumber('7 idiv 2', documentNode), 3);
			chai.assert.strictEqual(evaluateXPathToNumber('5.5 mod 2', documentNode), 1.5);
		});

		it('evaluateXPathToNumbers returns plain numbers', () =>
			chai.assert.deepEqual(evaluateXPathToNumbers('(1.5, 2)', documentNode), [1.5, 2]));

		it('ALL_RESULTS returns plain numbers for decimal results', () =>
			chai.assert.deepEqual(
				evaluateXPath(
					'(1.5, 10 div 4)',
					documentNode,
					null,
					null,
					evaluateXPath.ALL_RESULTS_TYPE,
				),
				[1.5, 2.5],
			));
	});
});
