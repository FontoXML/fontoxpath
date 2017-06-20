import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean,
	evaluateXPathToNumber,
	evaluateXPathToNumbers
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('numeric functions', () => {
	describe('number()', () => {
		it('accepts INF',
			() => chai.assert.equal(evaluateXPathToNumber('number("INF")', documentNode), Infinity));

		it('accepts the empty sequence',
			() => chai.assert.isNaN(evaluateXPathToNumber('number(())', documentNode)));

		it('accepts nodes', () => {
			documentNode.appendChild(documentNode.createElement('someElement'));
			chai.assert.isNaN(evaluateXPathToNumber('number(./text()[1])', documentNode));
		});
	});

	describe('xs:float()', () => {
		it('accepts INF',
			() => chai.assert.equal(evaluateXPathToNumber('xs:float("INF")', documentNode), Infinity));

		it('accepts the empty sequence',
			() => chai.assert.equal(evaluateXPathToNumber('xs:float(()) => count()', documentNode), 0));
	});

	describe('xs:double()', () => {
		it('accepts INF',
			() => chai.assert.equal(evaluateXPathToNumber('xs:double("INF")', documentNode), Infinity));

		it('accepts the empty sequence',
			() => chai.assert.equal(evaluateXPathToNumber('xs:double(()) => count()', documentNode), 0));
	});

	describe('xs:integer()', () => {
		it('accepts 42',
			() => chai.assert.equal(evaluateXPathToNumber('xs:integer("42")', documentNode), 42));

		it('accepts the empty sequence',
			() => chai.assert.equal(evaluateXPathToNumber('xs:integer(()) => count()', documentNode), 0));
	});

	describe('fn:abs()', () => {
		it('accepts 42',
			() => chai.assert.equal(evaluateXPathToNumber('abs(xs:integer("42"))', documentNode), 42));

		it('returns the absolute value',
			() => chai.assert.equal(evaluateXPathToNumber('abs(xs:int("-2147483648"))', documentNode), 2147483648));
	});

	describe('fn:round', () => {
		it('returns an empty sequence when given an empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToNumbers('round(())', documentNode), []));
		it('returns NaN when given NaN',
			() => chai.assert.isNaN(evaluateXPathToNumber('round(NaN)', documentNode)));
		it('returns -0 when given -0',
			() => chai.assert.equal(evaluateXPathToNumber('round(-0)', documentNode), -0));
		it('returns +0 when given +0',
			() => chai.assert.equal(evaluateXPathToNumber('round(+0)', documentNode), +0));
		it('returns -INF when given -INF',
			() => chai.assert.equal(evaluateXPathToNumber('round(xs:double("-INF"))', documentNode), -Infinity));
		it('returns +INF when given +INF',
			() => chai.assert.equal(evaluateXPathToNumber('round(xs:double("+INF"))', documentNode), +Infinity));

		it('returns 25 for 24.5',
			() => chai.assert.equal(evaluateXPathToNumber('round(24.5)', documentNode), 25));
		it('returns 1 for 1, precision 2',
			() => chai.assert.equal(evaluateXPathToNumber('round(1, 2)', documentNode), 1));
		// Fails due to javascript float inprecision
		it.skip('returns 35.43 for 35.425, precision 2',
			() => chai.assert.equal(evaluateXPathToNumber('round(35.425, 2)', documentNode), 35.43));
		it('returns -1.7976931348623157E308 for -1.7976931348623157E308',
			() => chai.assert.equal(evaluateXPathToNumber('fn:round(xs:double("-1.7976931348623157E308"))', documentNode), -1.7976931348623157E308));
	});

	describe('fn:round-half-to-even', () => {
		it('returns an empty sequence when given an empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToNumbers('round-half-to-even(())', documentNode), []));
		it('returns NaN when given NaN',
			() => chai.assert.isNaN(evaluateXPathToNumber('round-half-to-even(NaN)', documentNode)));
		it('returns -0 when given -0',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(-0)', documentNode), -0));
		it('returns +0 when given +0',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(+0)', documentNode), +0));
		it('returns -INF when given -INF',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(xs:double("-INF"))', documentNode), -Infinity));
		it('returns +INF when given +INF',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(xs:double("+INF"))', documentNode), +Infinity));

		it('returns 24 for 24.5',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(24.5)', documentNode), 24));
		it('returns 26 for 25.5',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(25.5)', documentNode), 26));
		it('returns 25 for 25.2',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(25.2)', documentNode), 25));
		it('returns 25 for 24.8',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(24.8)', documentNode), 25));
		it('returns 0 for 0.5',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(0.5)', documentNode), 0));
		it('returns 2 for 1.5',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(1.5)', documentNode), 2));
		it('returns 2 for 2.5',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(2.5)', documentNode), 2));
		it('returns 24.426 for 24.42566 (precision 3)',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(24.42566, 3)', documentNode), 24.426));

		it('returns 4561 for 4561.000005e0 (precision 0)',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(4561.000005e0, 0)', documentNode), 4561));
		it('returns 4561234600 for 4561234567 (precision -2)',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(4561234567, -2)', documentNode), 4561234600));
		it('returns 4561234567 for 4561234567 (precision 0)',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(4561234567, 0)', documentNode), 4561234567));
		it.skip('returns 0.1 for 0.05 (precision 1)',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(xs:float("0.05"), 1)', documentNode), 0.1));
		it.skip('returns -0.1 for -0.05 (precision 1)',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(xs:float("-0.05"), 1)', documentNode), -0.1));
		it('returns 3567.812 for 3.567812E+3 (precision 4294967296)',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(3.567812E+3, 4294967296)', documentNode), 3567.812));
		it('returns 3.567812 for 3.567812 (precision 4294967296)',
			() => chai.assert.equal(evaluateXPathToNumber('round-half-to-even(3.567812, 4294967296)', documentNode), 3.567812));
	});

	describe('fn:random-number-generator', () => {
		it('returns any random number',
			() => chai.assert.isOk(evaluateXPathToBoolean('random-number-generator()("number")', documentNode)));

		it('returns any random number via next function',
			() => chai.assert.isOk(evaluateXPathToBoolean('random-number-generator()("next")()("number")', documentNode)));

		it('returns any random item from a given sequence',
			() => chai.assert.isOk(evaluateXPathToBoolean('random-number-generator()("permute")((1, 2, 3, 4))', documentNode)));

		it('throws when given a seed',
			() => chai.assert.throws(() => evaluateXPathToBoolean('random-number-generator(123)')));
	});
});
