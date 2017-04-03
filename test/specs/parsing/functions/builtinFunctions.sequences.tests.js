import slimdom from 'slimdom';

import {
	evaluateXPathToBoolean,
	evaluateXPathToNumber,
	evaluateXPathToNumbers,
	evaluateXPathToString,
	evaluateXPathToStrings
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('Functions and operators on sequences', () => {
	describe('General functions and operators on sequences', () => {
		describe('fn:empty', () => {
			it('returns true for an empty sequence',
				() => chai.assert.isTrue(evaluateXPathToBoolean('empty(())', documentNode)));
			it('returns false for an non-empty sequence',
				() => chai.assert.isFalse(evaluateXPathToBoolean('empty((1, 2, 3))', documentNode)));
		});

		describe('fn:exists', () => {
			it('returns false for an empty sequence',
				() => chai.assert.isFalse(evaluateXPathToBoolean('exists(())', documentNode)));
			it('returns true for an non-empty sequence',
				() => chai.assert.isTrue(evaluateXPathToBoolean('exists((1, 2, 3))', documentNode)));
		});

		describe('fn:head', () => {
			it('returns an empty sequence when given an empty sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('head(())', documentNode), []));
			it('returns the first item of a given sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('head(("a", "b", "c"))', documentNode), ['a']));
		});

		describe('fn:tail', () => {
			it('returns an empty sequence when given an empty sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('tail(())', documentNode), []));
			it('returns the first item of a given sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('tail(("a", "b", "c"))', documentNode), ['c']));
		});

		describe('fn:insert-before', () => {
			it('returns the inserts sequence when given an empty targets sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('insert-before((), 1, ("1", "2", "3"))', documentNode), ['1', '2', '3']));
			it('returns the target sequence when given an empty inserts sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('insert-before(("1", "2", "3"), 1, ())', documentNode), ['1', '2', '3']));
			it('inserts the item on position 1 when position = 0',
				() => chai.assert.deepEqual(evaluateXPathToStrings('insert-before(("a", "b", "c"), 0, "z")', documentNode), ['z', 'a', 'b', 'c']));
			it('inserts the item on position 1 when position = 1',
				() => chai.assert.deepEqual(evaluateXPathToStrings('insert-before(("a", "b", "c"), 1, "z")', documentNode), ['z', 'a', 'b', 'c']));
			it('inserts the item on position 2 when position = 2',
				() => chai.assert.deepEqual(evaluateXPathToStrings('insert-before(("a", "b", "c"), 2, "x")', documentNode), ['a', 'x', 'b', 'c']));
			it('inserts the item on position 4 when position = 4',
				() => chai.assert.deepEqual(evaluateXPathToStrings('insert-before(("a", "b", "c"), 4, "x")', documentNode), ['a', 'b', 'c', 'x']));
			it('inserts the item on position 4 when position = 5 (greater than largest position)',
				() => chai.assert.deepEqual(evaluateXPathToStrings('insert-before(("a", "b", "c"), 5, "x")', documentNode), ['a', 'b', 'c', 'x']));
		});

		describe('fn:remove', () => {
			it('returns an empty sequence when given an empty sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('remove((), 1)', documentNode), []));
			it('returns the original sequence when the position is 0',
				() => chai.assert.deepEqual(evaluateXPathToStrings('remove(("a", "b", "c"), 0)', documentNode), ['a', 'b', 'c']));
			it('returns the original sequence when the position is out of bounds (greater than largest position)',
				() => chai.assert.deepEqual(evaluateXPathToStrings('remove(("a", "b", "c"), 5)', documentNode), ['a', 'b', 'c']));
			it('returns the sequence with the item at the given position removed',
				() => chai.assert.deepEqual(evaluateXPathToStrings('remove(("a", "b", "c"), 2)', documentNode), ['a', 'c']));
		});

		describe('fn:reverse', () => {
			it('returns an empty sequence when given an empty sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('reverse(())', documentNode), []));
			it('returns an reversed sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('reverse(("a", "b", "c"))', documentNode), ['c', 'b', 'a']));
		});

		describe('fn:subsequence', () => {
			it('returns an empty sequence when given an empty sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence((), 0, 1)', documentNode), []));
			it('returns a sequence starting at position until the end of the given sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence(("a", "b", "c"), 2)', documentNode), ['b', 'c']));
			it('returns a sequence starting at position with given length',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence(("a", "b", "c"), 2, 1)', documentNode), ['b']));
			it('returns an empty sequence when startingLoc = -INF and length = +INF',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence(("a", "b", "c"), xs:double("-INF"), xs:double("+INF"))', documentNode), []));
		});

		describe('fn:unordered', () => {
			it('returns any sequence given (no-op)', () => {
				chai.assert.deepEqual(evaluateXPathToNumbers('unordered(())', documentNode), []);
				chai.assert.deepEqual(evaluateXPathToNumbers('unordered((1, 2, 3))', documentNode), [1, 2, 3]);
			});
		});
	});

	describe('Aggregate functions', () => {
		describe('fn:count', () => {
			it('returns the length of the sequence',
				() => chai.assert(evaluateXPathToNumber('count((1 to 1000))', documentNode) === 1000));
			it('returns the length of the empty sequence',
				() => chai.assert(evaluateXPathToNumber('count(())', documentNode) === 0));
			it('returns the length of a singleton sequence',
				() => chai.assert(evaluateXPathToNumber('count((1))', documentNode) === 1));
		});

		describe('fn:avg', () => {
			it('returns the empty sequence if the empty sequence is passed',
				() => chai.assert.deepEqual(evaluateXPathToStrings('avg(())', documentNode), []));
			it('returns the avg of integers',
				() => chai.assert(evaluateXPathToNumber('avg((1, 2, 3))', documentNode) === 2));
			it('returns the avg of integers as a double value',
				() => chai.assert(evaluateXPathToBoolean('avg((1, 2)) instance of xs:double', documentNode)));
			it('returns the avg of integers as a double',
				() => chai.assert(evaluateXPathToBoolean('avg((1, 2)) = 1.5', documentNode), 'avg of 1 and 2 is 1.5'));
			it('returns the avg of decimals',
				() => chai.assert(evaluateXPathToBoolean('avg((1.5, 2.0, 2.5)) instance of xs:decimal', documentNode)));
			it('returns the avg of doubles as a double',
				() => chai.assert.equal(evaluateXPathToNumber('avg((1.5, 2.0, 2.5))', documentNode), 2));
			it('returns the avg of double',
				() => chai.assert.equal(evaluateXPathToNumber('avg((1e-1, 1e1))', documentNode), 5.05));
			it('returns the avg of doubles as a double',
				() => chai.assert(evaluateXPathToBoolean('avg((1e-1, 1e1)) instance of xs:double', documentNode)));
			it('returns the avg of floats as a float',
				() => chai.assert(evaluateXPathToBoolean('avg((xs:float("1e-1"), xs:float("1e1"))) instance of xs:float', documentNode)));
			it('returns the avg of mixed doubles and decimals as a double',
				() => chai.assert(evaluateXPathToBoolean('avg((1e-1, 1.0)) instance of xs:double', documentNode)));
			it('casts untypedAtomic to double');
				// TODO: when we have support for creating untypedAtomicValue items, when we have implemented the function conversion
			it('throws when not all items are numeric',
				() => chai.assert.throw(() => evaluateXPathToNumber('avg(("bla", "bliep"))', documentNode), 'FORG0006'));
		});

		describe('fn:max', () => {
			it('returns the max of integers',
				() => chai.assert(evaluateXPathToNumber('max((1,3,2))', documentNode) === 3));
			it('returns the max of integers as an integer',
				() => chai.assert(evaluateXPathToBoolean('max((1,3,2)) instance of xs:integer', documentNode)));
			it('returns the max of strings',
				() => chai.assert(evaluateXPathToString('max(("a", "b", "c"))', documentNode) === 'c'));
			it('returns the max of mixed decimals and integers',
				() => chai.assert(evaluateXPathToNumber('max((1, 1.5, 0.5))', documentNode) === 1.5));
			it('returns the max of mixed decimals and integers as a decimal',
				() => chai.assert(evaluateXPathToBoolean('max((1, 1.5, 0.5)) instance of xs:decimal', documentNode)));
			it('returns the max of mixed decimals, doubles and integers',
				() => chai.assert(evaluateXPathToNumber('max((1, 1.5, 0.5e1))', documentNode) === 5));
			it('throws a type error if the values are not of the same type',
				() => chai.assert.throws(() => evaluateXPathToNumber('max((1, "zero"))', documentNode), 'FORG0006'));
			it('returns NaN if one of the values is NaN',
				() => chai.assert.isNaN(evaluateXPathToNumber('max((1, number(xs:double("NaN"))))', documentNode)));
			it('returns the empty sequence when passed the empty sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('max(())', documentNode), []));
			it('casts untypedAtomic to double');
				// TODO: when we have support for creating untypedAtomicValue items, when we have implemented the function conversion
			it('does not support setting the collation',
				() => chai.assert.throws(() => evaluateXPathToNumber('max((), "")', documentNode)));
		});

		describe('fn:min', () => {
			it('returns the min of integers',
				() => chai.assert(evaluateXPathToNumber('min((1,3,2))', documentNode) === 1));
			it('returns the min of strings',
				() => chai.assert(evaluateXPathToString('min(("a", "b", "c"))', documentNode) === 'a'));
			it('returns the min of mixed decimals and integers',
				() => chai.assert(evaluateXPathToNumber('min((1, 1.5, 0.5))', documentNode) === 0.5));
			it('returns the min of mixed decimals, doubles and integers',
				() => chai.assert(evaluateXPathToNumber('min((1, 1.5, 0.5e-1))', documentNode) === 0.05));
			it('throws a type error if the values are not of the same type',
				() => chai.assert.throws(() => evaluateXPathToNumber('min((1, "zero"))', documentNode), 'FORG0006'));
			it('returns NaN if one of the values is NaN',
				() => chai.assert.isNaN(evaluateXPathToNumber('min((1, number(xs:double("NaN"))))', documentNode)));
			it('returns the empty sequence when passed the empty sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('min(())', documentNode), []));
			it('casts untypedAtomic to double');
				// TODO: when we have support for creating untypedAtomicValue items, when we have implemented the function conversion
			it('does not support setting the collation',
				() => chai.assert.throws(() => evaluateXPathToNumber('min((), "")', documentNode)));
		});

		describe('fn:sum', () => {
			it('returns zero if the empty sequence is passed',
				() => chai.assert(evaluateXPathToNumber('sum(())', documentNode) === 0));
			it('returns the $zero argument if the empty sequence is passed',
				() => chai.assert(evaluateXPathToString('sum((), "ZERO")', documentNode) === 'ZERO'));
			it('returns the sum of integers',
				() => chai.assert(evaluateXPathToNumber('sum((1, 2, 3))', documentNode) === 6));
			it('returns the sum of decimals',
				() => chai.assert(evaluateXPathToNumber('sum((1.5, 2.0, 2.5))', documentNode) === 6));
			it('returns the sum of doubles',
				() => chai.assert(evaluateXPathToNumber('sum((1e-1, 1e1))', documentNode) === 10.1));
			it('returns the sum of doubles as a double',
				() => chai.assert.isTrue(evaluateXPathToBoolean('sum((1e-1, 1e1)) instance of xs:double', documentNode)));
			it('returns the sum of integers as an integer',
				() => chai.assert.isTrue(evaluateXPathToBoolean('sum((1, 1)) instance of xs:integer', documentNode)));
			it('returns the sum of decimals as a decimal',
				() => chai.assert.isTrue(evaluateXPathToBoolean('sum((1.0, 1.0)) instance of xs:decimal', documentNode)));
			it('returns the sum of floats as a float',
				() => chai.assert.isTrue(evaluateXPathToBoolean('sum((xs:float(1.0), xs:float(1.0))) instance of xs:float', documentNode)));
			it('casts untypedAtomic to double');
				// TODO: when we have support for creating untypedAtomicValue items, when we have implemented the function conversion
			it('throws when not all items are numeric',
				() => chai.assert.throw(() => evaluateXPathToNumber('sum(("bla", "bliep"))', documentNode), 'FORG0006'));
		});
	});
});
