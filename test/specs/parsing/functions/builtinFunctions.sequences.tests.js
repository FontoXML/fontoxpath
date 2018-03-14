import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToBoolean,
	evaluateXPathToNumber,
	evaluateXPathToNumbers,
	evaluateXPathToString,
	evaluateXPathToStrings
} from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Functions and operators on sequences', () => {
	describe('General functions and operators on sequences', () => {
		describe('fn:empty', () => {
			it('returns true for an empty sequence',
				() => chai.assert.isTrue(evaluateXPathToBoolean('empty(())', documentNode)));
			it('returns false for an non-empty sequence',
				() => chai.assert.isFalse(evaluateXPathToBoolean('empty((1, 2, 3))', documentNode)));
			it('returns false for an non-empty sequence',
				() => chai.assert.isFalse(evaluateXPathToBoolean('empty(1)', documentNode)));
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
			it('returns the empty sequence when inputted a start higher than the length of the input',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence(("a", "b", "c"), 4)', documentNode), []));
			it('returns the last item if the start is length',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence(("a", "b", "c"), 3)', documentNode), ['c']));
			it('returns the last item if the start is input length and length = 1',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence(("a", "b", "c"), 3, 1)', documentNode), ['c']));
			it('returns a sequence starting at position with given length',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence(("a", "b", "c"), 2, 1)', documentNode), ['b']));
			it('returns the empty sequence is start is NaN',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence(("a", "b", "c"), xs:double("NaN"), 1)', documentNode), []));
			it('allows decimals',
				() => chai.assert.deepEqual(evaluateXPathToStrings('let $x := (1 to 10)[. mod 2 = 0] return subsequence((0,$x),3,count($x) div 2)', documentNode), ['4', '6', '8']));
			it('optimizes for length', () => {
				chai.assert.equal(evaluateXPathToNumber('count(subsequence(1 to 3000000000, -2147483649))'), 3000000000);
			});
			it('returns an empty sequence when startingLoc = -INF and length = +INF',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence(("a", "b", "c"), xs:double("-INF"), xs:double("+INF"))', documentNode), []));
			it('returns the full sequence when startingLoc = -INF',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence(("a", "b", "c"), xs:double("-INF"))', documentNode), ['a', 'b', 'c']));
			it('returns the full sequence when start = 1 and length = INF',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence(("a", "b", "c"), 0, xs:double("+INF"))', documentNode), ['a', 'b', 'c']));
			it('returns the first item when start = -10 and length = 12',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence(("a", "b", "c"), -10, 12)', documentNode), ['a']));
			it('returns the first item when start = -10 and length = 12',
				() => chai.assert.deepEqual(evaluateXPathToStrings('subsequence(("a", "b", "c"), -10, 12)', documentNode), ['a']));
			it('allows async parameters: sequence', async () => {
				chai.assert.equal(await evaluateXPathToAsyncSingleton('subsequence(("a", "b", "c") => fontoxpath:sleep(1), 2, 1)'), "b");
			});
			it('allows async parameters: async items in sequence', async () => {
				chai.assert.equal(await evaluateXPathToAsyncSingleton('subsequence(("a" => fontoxpath:sleep(1), "b" => fontoxpath:sleep(10), "c"), 2, 1)'), "b");
			});
			it('allows async parameters: from', async () => {
				chai.assert.equal(await evaluateXPathToAsyncSingleton('subsequence(("a", "b", "c"), 2 => fontoxpath:sleep(1), 1)'), "b");
			});
			it('allows async parameters: length', async () => {
				chai.assert.equal(await evaluateXPathToAsyncSingleton('subsequence(("a", "b", "c"), 2, 1 => fontoxpath:sleep(1))'), "b");
			});
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
			describe('sync parameters', () => {
				it('returns true if both sequences are empty', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((), ())', documentNode));
				});

				it('returns true if both sequences contain an equal string', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(("abc"), ("abc"))', documentNode));
				});

				it('returns false if both sequences are a function', () => {
					chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(true#0, true#0)', documentNode));
				});

				it('returns true if both sequences contain an equal number (1 vs 1)', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((1), (1))', documentNode));
				});

				it('returns true if both sequences contain an equal number (1 vs float 1)', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((1), (xs:float("1")))', documentNode));
				});

				it('returns true if both sequences contain an equal number (float NaN vs float NaN)', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:float("NaN")), (xs:float("NaN")))', documentNode));
				});

				it('returns true if both sequences contain an equal number (double 1 vs 1)', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:double("1")), (1))', documentNode));
				});

				it('returns true if both sequences contain an equal number (xs:int and xs:int)', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:int("-2147483648")),(xs:int("-2147483648")))', documentNode));
				});

				it('returns true if both sequences contain an equal number (double 1 vs float 1)', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:double("1")), (xs:float("1")))', documentNode));
				});

				it('returns true if both sequences contain an equal number (double 1 vs double 1)', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:double("1")), (xs:double("1")))', documentNode));
				});

				it('returns true if both sequences contain an equal number (double NaN vs double NaN)', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:double("NaN")), (xs:double("NaN")))', documentNode));
				});

				it('returns true if both sequences contain an equal boolean', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((xs:boolean("true")), xs:boolean("true"))', documentNode));
				});

				it('returns true if both sequences contain an equal set of values', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(("abc", 1, xs:boolean("false")), ("abc", 1, xs:boolean("false")))', documentNode));
				});


				it('returns false if both sequences have a different length', () => {
					chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(("xyz", "abc"), ("abc"))', documentNode));
				});

				it('returns false if both sequences contain different strings', () => {
					chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(("xyz"), ("abc"))', documentNode));
				});

				it('returns false if both sequences contain different numbers', () => {
					chai.assert.isFalse(evaluateXPathToBoolean('deep-equal((22), (42))', documentNode));
				});

				it('returns false if both sequences contain different booleans', () => {
					chai.assert.isFalse(evaluateXPathToBoolean('deep-equal((xs:boolean("true")), (xs:boolean("false")))', documentNode));
				});

				it('returns false if both sequences contain multiple different values', () => {
					chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(("abc", 12, xs:boolean("false"), xs:boolean("true")), ("abc", 12, xs:boolean("false"), xs:boolean("false")))', documentNode));
				});


				it('returns true if both sequences contain an equal map', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((map { "a": 123, "b": 456 }), (map { "a": 123, "b": 456 }))', documentNode));
				});

				it('returns true if both sequences contain an equal map with items on different positions', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal((map { "b": 456, "a": 123 }), (map { "a": 123, "b": 456 }))', documentNode));
				});

				it('returns true if both sequences contain an equal array', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(([1, 2, 5, 8]), ([1, 2, 5, 8]))', document));
				});


				it('returns false if both sequences contain maps with a different length', () => {
					chai.assert.isFalse(evaluateXPathToBoolean('deep-equal((map { "a": 123, "b": 456 }), (map { "a": 123, "b": 456, "c": 789 }))', documentNode));
				});

				it('returns false if both sequences contain maps with different keys', () => {
					chai.assert.isFalse(evaluateXPathToBoolean('deep-equal((map { "a": 123, "b": 456 }), (map { "y": 123, "z": 456 }))', documentNode));
				});


				it('returns false if both sequences contain arrays with a different length', () => {
					chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(([1, 2, 5, 8, 10]), ([1, 2, 5, 8]))', document));
				});


				// document
				it('returns true for two sequences containing two equal document nodes', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(., .)', documentNode));
				});
				it('returns true for two sequences containing two equal document nodes with equal child nodes', () => {
					jsonMlMapper.parse([
						'someElement',
						'Some string.'
					], documentNode);

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
				it('returns false two unequal elements (unequal on contents)', () => {
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
				it('returns true for equal elements with different prefixes for the same uri', () => {
					const dom = new DOMParser().parseFromString(`
<xml>
  <ns1:matrix xmlns:ns1="http://example.com/ns1" frame="all"><ns2:tgroup xmlns:ns2="http://example.com/ns2" cols="1"><ns2:colspec colname="column-0" colnum="1" colwidth="1*" colsep="1" rowsep="1"/><ns2:tbody><ns2:row><ns2:entry colname="column-0" rowsep="1" colsep="1"/></ns2:row></ns2:tbody></ns2:tgroup></ns1:matrix>
  <matrix xmlns="http://example.com/ns1" frame="all"><tgroup xmlns="http://example.com/ns2" cols="1"><colspec colname="column-0" colnum="1" colwidth="1*" colsep="1" rowsep="1"/><tbody><row><entry colname="column-0" colsep="1" rowsep="1"/></row></tbody></tgroup></matrix>
</xml>`, 'text/xml');

					chai.assert.isTrue(evaluateXPathToBoolean('deep-equal(/xml/*[1], /xml/*[2])', dom), 'both elements must be equal');
				});

				// Constructed elements
				it('returns true for two elements which are equal', () => {
					chai.assert.isTrue(evaluateXPathToBoolean('<a></a> => deep-equal((<a/>))', documentNode, undefined, {}, { language: 'XQuery3.1' }));
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
				it('returns false for two unequal elements (unequal on attributes)', () => {
					jsonMlMapper.parse([
						'someElement',
						[
							'someEqualElement',
							{ attr1: 'A' }
						],
						[
							'someEqualElement',
							{ attr1: 'B' }
						]
					], documentNode);
					chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(./someElement/someEqualElement[1], ./someElement/someEqualElement[2])', documentNode));
				});
				it('returns false for two unequal elements (A has more attributes)', () => {
					jsonMlMapper.parse([
						'someElement',
						[
							'someEqualElement',
							{ attr1: 'someAttributeValue', attr2: 'hah' }
						],
						[
							'someEqualElement',
							{ attr1: 'someAttributeValue' }
						]
					], documentNode);
					chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(./someElement/someEqualElement[1], ./someElement/someEqualElement[2])', documentNode));
				});
				it('returns false for two unequal elements (B has more attributes)', () => {
					jsonMlMapper.parse([
						'someElement',
						[
							'someEqualElement',
							{ attr1: 'someAttributeValue' }
						],
						[
							'someEqualElement',
							{ attr1: 'someAttributeValue', attr2: 'hah' }
						]
					], documentNode);
					chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(./someElement/someEqualElement[1], ./someElement/someEqualElement[2])', documentNode));
				});
				it('returns false for two unequal elements (other names)', () => {
					jsonMlMapper.parse([
						'someElement',
						[
							'someEqualElement',
							{ AAAA: 'someAttributeValue' }
						],
						[
							'someEqualElement',
							{ BBBB: 'someAttributeValue' }
						]
					], documentNode);
					chai.assert.isFalse(evaluateXPathToBoolean('deep-equal(./someElement/someEqualElement[1], ./someElement/someEqualElement[2])', documentNode));
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

				it('returns false for comments', () => {
					jsonMlMapper.parse([
						'someElement',
						['!', 'Some comment.'],
						['!', 'Some comment.']
					], documentNode);
					chai.assert.isTrue(evaluateXPathToBoolean('let $commentNode := ./someElement/comment() return deep-equal($commentNode[1], $commentNode[2])', documentNode));
				});
			});
		});

		describe('async params', () => {
			it('returns true if both sequences are empty', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal(() => fontoxpath:sleep(1), () => fontoxpath:sleep(1))', documentNode));
			});

			it('returns true if both sequences contain an equal string', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal(("abc") => fontoxpath:sleep(1), ("abc") => fontoxpath:sleep(1))', documentNode));
			});

			it('returns false if both sequences are a function', async () => {
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('deep-equal(true#0 => fontoxpath:sleep(1), true#0 => fontoxpath:sleep(1))', documentNode));
			});

			it('returns true if both sequences contain an equal number (1 vs 1)', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal((1) => fontoxpath:sleep(1), (1) => fontoxpath:sleep(1))', documentNode));
			});

			it('returns true if both sequences contain an equal number (1 vs float 1)', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal((1) => fontoxpath:sleep(1), (xs:float("1") => fontoxpath:sleep(1)))', documentNode));
			});

			it('returns true if both sequences contain an equal number (float NaN vs float NaN)', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal((xs:float("NaN") => fontoxpath:sleep(1)), (xs:float("NaN") => fontoxpath:sleep(1)))', documentNode));
			});

			it('returns true if both sequences contain an equal number (double 1 vs 1)', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal((xs:double("1") => fontoxpath:sleep(1)), (1) => fontoxpath:sleep(1))', documentNode));
			});

			it('returns true if both sequences contain an equal number (xs:int and xs:int)', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal((xs:int("-2147483648")) => fontoxpath:sleep(1), (xs:int("-2147483648") => fontoxpath:sleep(1)))', documentNode));
			});

			it('returns true if both sequences contain an equal number (double 1 vs float 1)', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal((xs:double("1") => fontoxpath:sleep(1)), (xs:float("1") => fontoxpath:sleep(1)))', documentNode));
			});

			it('returns true if both sequences contain an equal number (double 1 vs double 1)', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal((xs:double("1") => fontoxpath:sleep(1)), (xs:double("1") => fontoxpath:sleep(1)))', documentNode));
			});

			it('returns true if both sequences contain an equal number (double NaN vs double NaN)', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal((xs:double("NaN") => fontoxpath:sleep(1)), (xs:double("NaN") => fontoxpath:sleep(1)))', documentNode));
			});

			it('returns true if both sequences contain an equal boolean', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal((xs:boolean("true") => fontoxpath:sleep(1)), xs:boolean("true") => fontoxpath:sleep(1))', documentNode));
			});

			it('returns true if both sequences contain an equal set of values', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal(("abc" => fontoxpath:sleep(1), 1, xs:boolean("false")), ("abc", 1 => fontoxpath:sleep(1), xs:boolean("false")))', documentNode));
			});


			it('returns false if both sequences have a different length', async () => {
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('deep-equal(("xyz", "abc" => fontoxpath:sleep(1)), ("abc"))', documentNode));
			});

			it('returns false if both sequences contain different strings', async () => {
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('deep-equal(("xyz" => fontoxpath:sleep(1)), ("abc") => fontoxpath:sleep(1))', documentNode));
			});

			it('returns false if both sequences contain different numbers', async () => {
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('deep-equal((22 => fontoxpath:sleep(1)), (42 => fontoxpath:sleep(1)))', documentNode));
			});

			it('returns false if both sequences contain different booleans', async () => {
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('deep-equal((xs:boolean("true") => fontoxpath:sleep(1)), (xs:boolean("false") => fontoxpath:sleep(1)))', documentNode));
			});

			it('returns false if both sequences contain multiple different values', async () => {
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('deep-equal(("abc", 12 => fontoxpath:sleep(1), xs:boolean("false"), xs:boolean("true")), ("abc", 12, xs:boolean("false"), xs:boolean("false")))', documentNode));
			});


			it('returns true if both sequences contain an equal map', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal((map { "a": 123, "b": 456 => fontoxpath:sleep(1) }), (map { "a": 123, "b": 456 } => fontoxpath:sleep(1)))', documentNode));
			});

			it('returns true if both sequences contain an equal map with items on different positions', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal((map { "b" => fontoxpath:sleep(1): 456, "a": 123 }), (map { "a": 123, "b": 456 } => fontoxpath:sleep(1)))', documentNode));
			});

			it('returns true if both sequences contain an equal array', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal(([1, 2, 5, 8] => fontoxpath:sleep(1)), ([1, 2, 5, 8]))', document));
			});


			it('returns false if both sequences contain maps with a different length', async () => {
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('deep-equal((map { "a": 123, "b": 456 }), (map { "a": 123, "b": 456, "c": 789 => fontoxpath:sleep(10) }))', documentNode));
			});

			it('returns false if both sequences contain maps with different keys', async () => {
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('deep-equal((map { "a": 123, "b" => fontoxpath:sleep(1): 456 }), (map { "y": 123, "z": 456 }))', documentNode));
			});


			it('returns false if both sequences contain arrays with a different length', async () => {
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('deep-equal(([1, 2, 5, 8, 10] => fontoxpath:sleep(1)), ([1, 2, 5, 8] => fontoxpath:sleep(1)))', document));
			});


			// document
			it('returns true for two sequences containing two equal document nodes', async () => {
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal(., . => fontoxpath:sleep(1))', documentNode));
			});
			it('returns true for two sequences containing two equal document nodes with equal child nodes', async () => {
				jsonMlMapper.parse([
					'someElement',
					'Some string.'
				], documentNode);

				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal(. => fontoxpath:sleep(1), .)', documentNode));
			});

			// element
			it('returns true for the same element', async () => {
				jsonMlMapper.parse([
					'someElement',
					'Some text node.'
				], documentNode);
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal(./someElement, ./someElement => fontoxpath:sleep(1))', documentNode));
			});
			it('returns true two equal elements', async () => {
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
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('deep-equal((./someElement => fontoxpath:sleep(1))/someEqualElement[1], ./someElement/someEqualElement[2])', documentNode));
			});
			it('returns true two unequal elements (unequal on node name)', async () => {
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
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('deep-equal(./someElement/someEqualElement => fontoxpath:sleep(1), ./someElement/someUnequalElement)', documentNode));
			});
			it('returns true two unequal elements (unequal on contents)', async () => {
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
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('deep-equal(./someElement/someEqualElement[1], ./someElement/someEqualElement[2] => fontoxpath:sleep(1))', documentNode));
			});

			// attribute
			it('returns true for two sequences containing two equal attribute nodes', async () => {
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
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('let $attributeNode := ./someElement/someElement/@someAttribute return deep-equal($attributeNode[1] => fontoxpath:sleep(1), $attributeNode[2])', documentNode));
			});
			it('returns false for two sequences containing two unequal attribute nodes', async () => {
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
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('let $attributeNode := ./someElement/someElement/@someAttribute return deep-equal($attributeNode[1], $attributeNode[2] => fontoxpath:sleep(1))', documentNode));
			});

			// PI
			it('returns true for two sequences containing two equal PI\'s', async () => {
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
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('let $piNode := ./someElement/processing-instruction() return deep-equal($piNode[1], $piNode[2] => fontoxpath:sleep(1))', documentNode));
			});
			it('returns false for two sequences containing two unequal PI\'s', async () => {
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
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('let $piNode := ./someElement/processing-instruction() return deep-equal($piNode[1] => fontoxpath:sleep(1), $piNode[2])', documentNode));
			});

			// text
			it('returns true for two sequences containing two equal text nodes', async () => {
				jsonMlMapper.parse([
					'someElement',
					'Some text.',
					'Some text.'
				], documentNode);
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('let $textNode := ./someElement/text() => fontoxpath:sleep(1) return deep-equal($textNode[1], $textNode[2])', documentNode));
			});
			it('returns false for two sequences containing two equal text nodes', async () => {
				jsonMlMapper.parse([
					'someElement',
					'Some text',
					'Some text.'
				], documentNode);
				chai.assert.isFalse(await evaluateXPathToAsyncSingleton('let $textNode := ./someElement/text() => fontoxpath:sleep(1) return deep-equal($textNode[1], $textNode[2])', documentNode));
			});

			it('returns false for comments', async () => {
				jsonMlMapper.parse([
					'someElement',
					['!', 'Some comment.'],
					['!', 'Some comment.']
				], documentNode);
				chai.assert.isTrue(await evaluateXPathToAsyncSingleton('let $commentNode := ./someElement/comment() => fontoxpath:sleep(1) return deep-equal($commentNode[1], $commentNode[2])', documentNode));
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
