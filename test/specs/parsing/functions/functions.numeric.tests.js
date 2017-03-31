import slimdom from 'slimdom';

import {
	evaluateXPathToBoolean,
	evaluateXPathToNumber,
	evaluateXPathToNumbers
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
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

	describe('fn:round()', () => {
		it('returns an empty sequence when given an empty sequence', () => {
			chai.assert.deepEqual(evaluateXPathToNumbers('round(())', documentNode), []);
		});

		it('returns NaN when given NaN', () => {
			chai.assert.isNaN(evaluateXPathToNumber('round(NaN)', documentNode));
		});

		it('returns -0 when given -0', () => {
			chai.assert.equal(evaluateXPathToNumber('round(-0)', documentNode), -0);
		});

		it('returns +0 when given +0', () => {
			chai.assert.equal(evaluateXPathToNumber('round(+0)', documentNode), +0);
		});

		it('returns -INF when given -INF', () => {
			chai.assert.equal(evaluateXPathToNumber('round(xs:double("-INF"))', documentNode), -Infinity);
		});

		it('returns +INF when given +INF', () => {
			chai.assert.equal(evaluateXPathToNumber('round(xs:double("+INF"))', documentNode), +Infinity);
		});

		it('returns 25 for 24.5', () => {
			chai.assert.equal(evaluateXPathToNumber('round(24.5)', documentNode), 25);
		});

		it('returns 1 for 1, precision 2', () => {
			chai.assert.equal(evaluateXPathToNumber('round(1, 2)', documentNode), 1);
		});

		// Fails due to javascript float imprecision
		it.skip('returns 35.43 for 35.425, precision 2', () => {
			chai.assert.equal(evaluateXPathToNumber('round(35.425, 2)', documentNode), 35.43);
		});

		it('returns -1.7976931348623157E308 for -1.7976931348623157E308', () => {
			chai.assert.equal(evaluateXPathToNumber('fn:round(xs:double("-1.7976931348623157E308"))', documentNode), -1.7976931348623157E308);
		});
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
