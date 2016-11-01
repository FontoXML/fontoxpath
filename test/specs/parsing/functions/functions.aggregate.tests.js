import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import evaluateXPathToNumber from 'fontoxml-selectors/evaluateXPathToNumber';
import evaluateXPathToBoolean from 'fontoxml-selectors/evaluateXPathToBoolean';
import evaluateXPathToString from 'fontoxml-selectors/evaluateXPathToString';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('aggregate functions', () => {
	describe('avg', () => {
		it('returns the empty sequence if the empty sequence is passed',
		   () => chai.assert.deepEqual(evaluateXPath('avg(())', documentNode, blueprint), []));
		it('returns the avg of integers',
		   () => chai.assert(evaluateXPathToNumber('avg((1, 2, 3))', documentNode, blueprint) === 2));
		it('returns the avg of integers as a double value',
		   () => chai.assert(evaluateXPathToBoolean('avg((1, 2)) instance of xs:double', documentNode, blueprint)));
		it('returns the avg of integers as a double',
		   () => chai.assert(evaluateXPathToBoolean('avg((1, 2)) = 1.5', documentNode, blueprint), 'avg of 1 and 2 is 1.5'));
		it('returns the avg of decimals',
		   () => chai.assert(evaluateXPathToBoolean('avg((1.5, 2.0, 2.5)) instance of xs:decimal', documentNode, blueprint)));
		it('returns the avg of doubles as a double',
		   () => chai.assert.equal(evaluateXPathToNumber('avg((1.5, 2.0, 2.5))', documentNode, blueprint), 2));
		it('returns the avg of double',
		   () => chai.assert.equal(evaluateXPathToNumber('avg((1e-1, 1e1))', documentNode, blueprint), 5.05));
		it('returns the avg of doubles as a double',
		   () => chai.assert(evaluateXPathToBoolean('avg((1e-1, 1e1)) instance of xs:double', documentNode, blueprint)));
		it('returns the avg of mixed doubles and decimals as a double',
		   () => chai.assert(evaluateXPathToBoolean('avg((1e-1, 1.0)) instance of xs:double', documentNode, blueprint)));

		it('casts untypedAtomic to double');
	});

	describe('count()', () => {
		it('returns the length of the sequence',
		   () => chai.assert(evaluateXPath('count((1 to 1000))', documentNode, blueprint) === 1000));
		it('returns the length of the empty sequence',
		   () => chai.assert(evaluateXPath('count(())', documentNode, blueprint) === 0));
		it('returns the length of a singleton sequence',
		   () => chai.assert(evaluateXPath('count((1))', documentNode, blueprint) === 1));
	});

	describe('max()', () => {
		it('returns the max of integers',
		   () => chai.assert(evaluateXPathToNumber('max((1,3,2))', documentNode, blueprint) === 3));
		it('returns the max of integers as an integer',
		   () => chai.assert(evaluateXPathToBoolean('max((1,3,2)) instance of xs:integer', documentNode, blueprint)));
		it('returns the max of strings',
		   () => chai.assert(evaluateXPathToString('max(("a", "b", "c"))', documentNode, blueprint) === 'c'));
		it('returns the max of mixed decimals and integers',
		   () => chai.assert(evaluateXPathToNumber('max((1, 1.5, 0.5))', documentNode, blueprint) === 1.5));
		it('returns the max of mixed decimals and integers as a decimal',
		   () => chai.assert(evaluateXPathToBoolean('max((1, 1.5, 0.5)) instance of xs:decimal', documentNode, blueprint)));
		it('returns the max of mixed decimals, doubles and integers',
		   () => chai.assert(evaluateXPathToNumber('max((1, 1.5, 0.5e1))', documentNode, blueprint) === 5));
		it('throws a type error if the values are not of the same type',
		   () => chai.assert.throws(() => evaluateXPath('max((1, "zero"))', documentNode, blueprint), 'FORG0006'));
		it('returns NaN if one of the values is NaN',
		   () => chai.assert.isNaN(evaluateXPathToNumber('max((1, number("zero")))', documentNode, blueprint)));
		it('returns the empty sequence when passed the empty sequence',
		   () => chai.assert.deepEqual(evaluateXPath('max(())', documentNode, blueprint), []));
		// TODO: when we have support for creating untypedAtomicValue items, when we have implemented the function conversion
		it('casts untypedAtomic to double');

		it('does not support setting the collation',
		   () => chai.assert.throws(() => evaluateXPath('max((), "")', documentNode, blueprint)));
	});

	describe('min()', () => {
		it('returns the min of integers',
		   () => chai.assert(evaluateXPathToNumber('min((1,3,2))', documentNode, blueprint) === 1));
		it('returns the min of strings',
		   () => chai.assert(evaluateXPathToString('min(("a", "b", "c"))', documentNode, blueprint) === 'a'));
		it('returns the min of mixed decimals and integers',
		   () => chai.assert(evaluateXPathToNumber('min((1, 1.5, 0.5))', documentNode, blueprint) === 0.5));
		it('returns the min of mixed decimals, doubles and integers',
		   () => chai.assert(evaluateXPathToNumber('min((1, 1.5, 0.5e-1))', documentNode, blueprint) === 0.05));
		it('throws a type error if the values are not of the same type',
		   () => chai.assert.throws(() => evaluateXPath('min((1, "zero"))', documentNode, blueprint), 'FORG0006'));
		it('returns NaN if one of the values is NaN',
		   () => chai.assert.isNaN(evaluateXPathToNumber('min((1, number("zero")))', documentNode, blueprint)));
		it('returns the empty sequence when passed the empty sequence',
		   () => chai.assert.deepEqual(evaluateXPath('min(())', documentNode, blueprint), []));
		// TODO: when we have support for creating untypedAtomicValue items, when we have implemented the function conversion
		it('casts untypedAtomic to double');

		it('does not support setting the collation',
		   () => chai.assert.throws(() => evaluateXPath('min((), "")', documentNode, blueprint)));
	});

	describe('sum', () => {
		it('returns zero if the empty sequence is passed',
		   () => chai.assert(evaluateXPathToNumber('sum(())', documentNode, blueprint) === 0));
		it('returns the $zero argument if the empty sequence is passed',
		   () => chai.assert(evaluateXPathToString('sum((), "ZERO")', documentNode, blueprint) === 'ZERO'));
		it('returns the sum of integers',
		   () => chai.assert(evaluateXPathToNumber('sum((1, 2, 3))', documentNode, blueprint) === 6));
		it('returns the sum of decimals',
		   () => chai.assert(evaluateXPathToNumber('sum((1.5, 2.0, 2.5))', documentNode, blueprint) === 6));
		it('returns the sum of doubles',
		   () => chai.assert(evaluateXPathToNumber('sum((1e-1, 1e1))', documentNode, blueprint) === 10.1));
		it('returns the sum of doubles as a double',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('sum((1e-1, 1e1)) instance of xs:double', documentNode, blueprint)));
		it('returns the sum of integers as an integer',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('sum((1, 1)) instance of xs:integer', documentNode, blueprint)));
		it('returns the sum of decimals as a decimal',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('sum((1.0, 1.0)) instance of xs:decimal', documentNode, blueprint)));
		it('returns the sum of floats as a float');

		it('casts untypedAtomic to double');
	});
});
