import slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

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

		describe('fn:filter', () => {
			it('filters a sequence',
				() => chai.assert.isTrue(evaluateXPathToBoolean('filter((1, 2, 3), function ($a) {$a = 2}) eq 2', documentNode)));
			it('works in obscure cases',
				() => chai.assert.isTrue(evaluateXPathToBoolean('(1 to 20)[. = filter(1 to position(), function($x){$x idiv 2 * 2 = $x})] => deep-equal((2,4,6,8,10,12,14,16,18,20))', documentNode)));
		});

		describe('fn:head', () => {
			it('returns an empty sequence when given an empty sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('head(())', documentNode), []));
			it('returns the first item of a given sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('head(("a", "b", "c"))', documentNode), ['a']));
		});

		describe('fn:tail', () => {
			it('returns the empty sequence when given the empty sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('tail(())', documentNode), []));
			it('returns the empty sequence when given a singleton sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('tail(("a"))', documentNode), []));
			it('returns all but the first item of a given sequence',
				() => chai.assert.deepEqual(evaluateXPathToStrings('tail(("a", "b", "c"))', documentNode), ['b', 'c']));
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
			it('allows decimals',
				() => chai.assert.deepEqual(evaluateXPathToStrings('let $x := (1 to 10)[. mod 2 = 0] return subsequence((0,$x),3,count($x) div 2)', documentNode), ['4', '6', '8']));

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

	describe('Functions that compare values in sequences', () => {
		describe('fn:deep-equal', () => {
			it('returns true if both sequences are empty',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((), ())', documentNode)));
			it('returns true if both sequences contain an equal string',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(("abc"), ("abc"))', documentNode)));
			it('returns true if both sequences contain an equal number (1 vs 1)',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((1), (1))', documentNode)));
			it('returns true if both sequences contain an equal number (1 vs float 1)',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((1), (xs:float("1")))', documentNode)));
			it('returns true if both sequences contain an equal number (float NaN vs float NaN)',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:float("NaN")), (xs:float("NaN")))', documentNode)));
			it('returns true if both sequences contain an equal number (double 1 vs 1)',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:double("1")), (1))', documentNode)));
			it('returns true if both sequences contain an equal number (xs:int and xs:int)',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:int("-2147483648")),(xs:int("-2147483648")))', documentNode)));
			it('returns true if both sequences contain an equal number (double 1 vs float 1)',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:double("1")), (xs:float("1")))', documentNode)));
			it('returns true if both sequences contain an equal number (double 1 vs double 1)',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:double("1")), (xs:double("1")))', documentNode)));
			it('returns true if both sequences contain an equal number (double NaN vs double NaN)',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:double("NaN")), (xs:double("NaN")))', documentNode)));
			it('returns true if both sequences contain an equal boolean',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:boolean("true")), xs:boolean("true"))', documentNode)));
			it('returns true if both sequences contain an equal set of values',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(("abc", 1, xs:boolean("false")), ("abc", 1, xs:boolean("false")))', documentNode)));

			it('returns false if both sequences have a different length',
				() => chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(("xyz", "abc"), ("abc"))', documentNode)));
			it('returns false if both sequences contain different strings',
				() => chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(("xyz"), ("abc"))', documentNode)));
			it('returns false if both sequences contain different numbers',
				() => chai.assert.isFalse(evaluateXPathToBoolean('deep-equal((22), (42))', documentNode)));
			it('returns false if both sequences contain different booleans',
				() => chai.assert.isFalse(evaluateXPathToBoolean('deep-equal((xs:boolean("true")), (xs:boolean("false")))', documentNode)));
			it('returns false if both sequences contain multiple different values',
				() => chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(("abc", 12, xs:boolean("false"), xs:boolean("true")), ("abc", 12, xs:boolean("false"), xs:boolean("false")))', documentNode)));

			it('returns true if both sequences contain an equal map',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((map { "a": 123, "b": 456 }), (map { "a": 123, "b": 456 }))', documentNode)));
			it('returns true if both sequences contain an equal map with items on different positions',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((map { "b": 456, "a": 123 }), (map { "a": 123, "b": 456 }))', documentNode)));
			it('returns true if both sequences contain an equal array',
				() => chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(([1, 2, 5, 8]), ([1, 2, 5, 8]))', document)));

			it('returns false if both sequences contain maps with a different length',
				() => chai.assert.isFalse(evaluateXPathToBoolean('deep-equal((map { "a": 123, "b": 456 }), (map { "a": 123, "b": 456, "c": 789 }))', documentNode)));
			it('returns false if both sequences contain maps with different keys',
				() => chai.assert.isFalse(evaluateXPathToBoolean('deep-equal((map { "a": 123, "b": 456 }), (map { "y": 123, "z": 456 }))', documentNode)));

			it('returns false if both sequences contain arrays with a different length',
				() => chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(([1, 2, 5, 8, 10]), ([1, 2, 5, 8]))', document)));

			// document
			it('returns true for two sequences containing two equal document nodes', () => {
				chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(., .)', documentNode));
			});
			it('returns true for two sequences containing two equal document nodes with equal child nodes', () => {
				jsonMlMapper.parse(
					'Some string.'
				, documentNode);
				chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(., .)', documentNode));
			});

			// element
			it('returns true for the same element', () => {
				jsonMlMapper.parse([
					'someElement',
					'Some text node.'
				], documentNode);
				chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(./someElement, ./someElement)', documentNode));
			});
			it('returns true two equal elements', () => {
				jsonMlMapper.parse([
					'someElement',
					[
						'someEqualElement',
						'Some equal text.'
					],
					[
						'someEqualElement',
						'Some equal text.'
					]
				], documentNode);
				chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(./someElement/someEqualElement[1], ./someElement/someEqualElement[2])', documentNode));
			});
			it('returns true two unequal elements (unequal on node name)', () => {
				jsonMlMapper.parse([
					'someElement',
					[
						'someEqualElement',
						'Some equal text.'
					],
					[
						'someUnequalElement',
						'Some equal text.'
					]
				], documentNode);
				chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(./someElement/someEqualElement, ./someElement/someUnequalElement)', documentNode));
			});
			it('returns true two unequal elements (unequal on conetents)', () => {
				jsonMlMapper.parse([
					'someElement',
					[
						'someEqualElement',
						'Some equal text.'
					],
					[
						'someEqualElement',
						'Some unequal text.'
					]
				], documentNode);
				chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(./someElement/someEqualElement[1], ./someElement/someEqualElement[2])', documentNode));
			});

			// attribute
			it('returns true for two sequences containing two equal attribute nodes', () => {
				jsonMlMapper.parse([
					'someElement',
					[
						'someElement',
						{ someAttribute: 'value' }
					],
					[
						'someElement',
						{ someAttribute: 'value' }
					]
				], documentNode);
				chai.assert.isTrue(evaluateXPathToBoolean('let $attributeNode := ./someElement/someElement/@someAttribute return deep-equal($attributeNode[1], $attributeNode[2])', documentNode));
			});
			it('returns false for two sequences containing two unequal attribute nodes', () => {
				jsonMlMapper.parse([
					'someElement',
					[
						'someElement',
						{ someAttribute: 'value1' }
					],
					[
						'someElement',
						{ someAttribute: 'value2' }
					]
				], documentNode);
				chai.assert.isFalse(evaluateXPathToBoolean('let $attributeNode := ./someElement/someElement/@someAttribute return deep-equal($attributeNode[1], $attributeNode[2])', documentNode));
			});

			// PI
			it('returns true for two sequences containing two equal PI\'s', () => {
				jsonMlMapper.parse([
					'someElement',
					[
						'?somePi',
						'value'
					],
					[
						'?somePi',
						'value'
					]
				], documentNode);
				chai.assert.isTrue(evaluateXPathToBoolean('let $piNode := ./someElement/processing-instruction() return deep-equal($piNode[1], $piNode[2])', documentNode));
			});
			it('returns false for two sequences containing two unequal PI\'s', () => {
				jsonMlMapper.parse([
					'someElement',
					[
						'?somePi',
						'value1'
					],
					[
						'?somePi',
						'value2'
					]
				], documentNode);
				chai.assert.isFalse(evaluateXPathToBoolean('let $piNode := ./someElement/processing-instruction() return deep-equal($piNode[1], $piNode[2])', documentNode));
			});

			// text
			it('returns true for two sequences containing two equal text nodes', () => {
				jsonMlMapper.parse([
					'someElement',
					'Some text.',
					'Some text.'
				], documentNode);
				chai.assert.isTrue(evaluateXPathToBoolean('let $textNode := ./someElement/text() return deep-equal($textNode[1], $textNode[2])', documentNode));
			});
			it('returns false for two sequences containing two equal text nodes', () => {
				jsonMlMapper.parse([
					'someElement',
					'Some text',
					'Some text.'
				], documentNode);
				chai.assert.isFalse(evaluateXPathToBoolean('let $textNode := ./someElement/text() return deep-equal($textNode[1], $textNode[2])', documentNode));
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
