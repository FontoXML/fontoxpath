import * as slimdom from 'slimdom';

import {
	evaluateXPathToArray,
	evaluateXPathToAsyncIterator,
	evaluateXPathToBoolean,
	evaluateXPathToString,
	evaluateXPathToStrings
} from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('functions over arrays', () => {
	describe('array:size', () => {
		it(
			'returns the size of an array',
			() => chai.assert.isTrue(evaluateXPathToBoolean('array:size([1,2,3]) eq 3', documentNode)));
		it(
			'can be called with an array which resolves async',
			async () => chai.assert.isTrue(await evaluateXPathToAsyncSingleton('array:size([1,2,3] => fontoxpath:sleep(1)) eq 3', documentNode)));
		it(
			'returns 0 for an empty array',
			() => chai.assert.isTrue(evaluateXPathToBoolean('array:size([]) eq 0', documentNode)));
	});

	describe('array:get', () => {
		it(
			'returns the first item',
			() => chai.assert.isTrue(evaluateXPathToBoolean('array:get([1,2,3], 1) eq 1', documentNode)));

		it(
			'returns the second item',
			() => chai.assert.isTrue(evaluateXPathToBoolean('array:get([1,2,3], 2) eq 2', documentNode)));

		it(
			'returns the last item',
			() => chai.assert.isTrue(evaluateXPathToBoolean('array:get([1,2,3], 3) eq 3', documentNode)));

		it(
			'throws when passed 0',
			() => chai.assert.throws(() => evaluateXPathToBoolean('array:get([1,2,3], 0)', documentNode), 'FOAY0001'));

		it(
			'throws when passed an index larger than the size of the array',
			() => chai.assert.throws(() => evaluateXPathToBoolean('array:get([1,2,3], 1337)', documentNode), 'FOAY0001'));

		it(
			'is aliased to "calling the array"',
			() => chai.assert.isTrue(evaluateXPathToBoolean('[1,2,3](1) eq 1', documentNode)));

		it(
			'can be called with an array which resolves async',
			async () => chai.assert.isTrue(await evaluateXPathToAsyncSingleton('array:get([1,2,3] => fontoxpath:sleep(1), 3) eq 3', documentNode)));

	});

	describe('array:put', () => {
		it(
			'can add an item at the start',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:put([1,2,3], 1, "a")', documentNode), ['a', 2, 3]));

		it(
			'can add an item in the middle',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:put([1,2,3], 2, "a")', documentNode), [1, 'a', 3]));

		it(
			'can add an item to the end',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:put([1,2,3], 3, "a")', documentNode), [1, 2, 'a']));

		it(
			'throws an error when passed a position larger than the size of the array',
			() => chai.assert.throws(() => evaluateXPathToArray('array:put([1,2,3], 4, "a")', documentNode), 'FOAY0001'));

		it(
			'throws an error when passed 0',
			() => chai.assert.throws(() => evaluateXPathToArray('array:put([1,2,3], 0, "a")', documentNode), 'FOAY0001'));

		it(
			'can be called with an array which resolves async',
			async () => chai.assert.equal(await evaluateXPathToAsyncSingleton('array:put([1,2,3] => fontoxpath:sleep(1), 3, "a") => array:fold-left("", concat#2)', documentNode), '12a'));
		it(
			'can be called with a position which resolves async',
			async () => chai.assert.equal(await evaluateXPathToAsyncSingleton('array:put([1,2,3], 3 => fontoxpath:sleep(1), "a") => array:fold-left("", concat#2)', documentNode), '12a'));
		it(
			'can be called with an item which resolves async',
			async () => chai.assert.equal(await evaluateXPathToAsyncSingleton('array:put([1,2,3], 3, "a" => fontoxpath:sleep(1)) => array:fold-left("", concat#2)', documentNode), '12a'));
	});

	describe('array:append', () => {
		it(
			'appends an item to an empty array',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:append([], 0)', documentNode), [0]));

		it(
			'appends an item to an array',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:append([1,2,3], 4)', documentNode), [1, 2, 3, 4]));
		it(
			'can be called with an array which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:append([1,2,3] => fontoxpath:sleep(1), 4) => array:fold-left("", concat#2)',
					documentNode),
				'1234'));
		it(
			'can be called with an item which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:append([1,2,3], 4 => fontoxpath:sleep(1)) => array:fold-left("", concat#2)',
					documentNode),
				'1234'));
	});

	describe('array:subarray', () => {
		it(
			'returns a subarray',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:subarray([1,2,3,4], 2, 2)', documentNode), [2, 3]));

		it(
			'returns the full array if the range is full',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:subarray([1,2,3], 1, 3)', documentNode), [1, 2, 3]));

		it(
			'returns an empty array if the range is empty',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:subarray([1,2,3], 1, 0)', documentNode), []));

		it(
			'throws an error when passed $length < 0',
			() => chai.assert.throws(() => evaluateXPathToArray('array:subarray([1,2,3], 1, -1)', documentNode), 'FOAY0002'));

		it(
			'throws an error when passed $start <= 0',
			() => chai.assert.throws(() => evaluateXPathToArray('array:subarray([1,2,3], 0, 1)', documentNode), 'FOAY0001'));

		it(
			'throws an error when passed $start + $length > size',
			() => chai.assert.throws(() => evaluateXPathToArray('array:subarray([1,2,3], 1, 9001)', documentNode), 'FOAY0001'));

		it(
			'can be called with an array which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:subarray([1,2,3,4] => fontoxpath:sleep(1), 2, 2) => array:fold-left("", concat#2)',
					documentNode),
				'23'));
		it(
			'can be called with a start which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:subarray([1,2,3,4], 2 => fontoxpath:sleep(1), 2) => array:fold-left("", concat#2)',
					documentNode),
				'23'));
		it(
			'can be called with an end which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:subarray([1,2,3,4], 2, 2 => fontoxpath:sleep(1)) => array:fold-left("", concat#2)',
					documentNode),
				'23'));
	});


	describe('array:remove', () => {
		it(
			'removes the first item from an array',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:remove([1,2,3], 1)', documentNode), [2, 3]));

		it(
			'removes a middle item from the array',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:remove([1,2,3], 2)', documentNode), [1, 3]));

		it(
			'removes the last item from the array',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:remove([1,2,3], 3)', documentNode), [1, 2]));

		it(
			'removes multiple items',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:remove([1,2,3], (1,2))', documentNode), [3]));

		it(
			'removes multiple items with positions out of order',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:remove([1,2,3], (2,1))', documentNode), [3]));

		it(
			'throws when passed $position <= 0',
			() => chai.assert.throws(() => evaluateXPathToArray('array:remove([1,2,3], 0)', documentNode), 'FOAY0001'));

		it(
			'throws when passed $position > size',
			() => chai.assert.throws(() => evaluateXPathToArray('array:remove([1,2,3], 9001)', documentNode), 'FOAY0001'));
		it(
			'can be called with an array which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:remove([1,2,3] => fontoxpath:sleep(1), 1) => array:fold-left("", concat#2)',
					documentNode),
				'23'));
		it(
			'can be called with a removal sequence which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:remove([1,2,3], (1,2=>fontoxpath:sleep(1))) => array:fold-left("", concat#2)',
					documentNode),
				'3'));
	});

	describe('array:insert-before', () => {
		it(
			'inserts before the first item',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:insert-before([1,2,3], 1, "a")', documentNode), ['a', 1, 2, 3]));

		it(
			'inserts before the middle item',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:insert-before([1,2,3], 2, "a")', documentNode), [1, 'a', 2, 3]));

		it(
			'inserts before the last item',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:insert-before([1,2,3], 3, "a")', documentNode), [1, 2, 'a', 3]));

		it(
			'inserts after the last item',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:insert-before([1,2,3], 4, "a")', documentNode), [1, 2, 3, 'a']));

		it(
			'throws when passed $position <= 0',
			() => chai.assert.throws(() => evaluateXPathToArray('array:insert-before([1,2,3], 0, "a")', documentNode), 'FOAY0001'));

		it(
			'throws when passed $position > size + 1',
			() => chai.assert.throws(() => evaluateXPathToArray('array:insert-before([1,2,3], 5, "a")', documentNode), 'FOAY0001'));
		it(
			'can be called with an array which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:insert-before([1,2,3] => fontoxpath:sleep(1), 4, "a") => array:fold-left("", concat#2)',
					documentNode),
				'123a'));
		it(
			'can be called with a position which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:insert-before([1,2,3], 4 => fontoxpath:sleep(1), "a") => array:fold-left("", concat#2)',
					documentNode),
				'123a'));
		it(
			'can be called with an item which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:insert-before([1,2,3], 4, "a" => fontoxpath:sleep(1)) => array:fold-left("", concat#2)',
					documentNode),
				'123a'));

	});

	describe('array:head', () => {
		it(
			'throws when passed an empty array',
			() => chai.assert.throws(() => evaluateXPathToArray('array:head([])', documentNode), 'FOAY0001'));

		it(
			'returns the first item',
			() => chai.assert.isTrue(evaluateXPathToBoolean('array:head([1]) eq 1', documentNode)));
		it(
			'can be called with an array which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:head([1,2,3] => fontoxpath:sleep(1))',
					documentNode),
				1));

	});

	describe('array:tail', () => {
		it(
			'throws when passed an empty array',
			() => chai.assert.throws(() => evaluateXPathToArray('array:tail([])', documentNode), 'FOAY0001'));

		it(
			'returns an empty array for a array with size 1',
			() => chai.assert.isTrue(evaluateXPathToBoolean('array:tail([1]) => array:size() eq 0', documentNode)));

		it(
			'returns the tail of an array',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:tail([1,2,3])', documentNode), [2, 3]));

		it(
			'can be called with an array which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:tail([1,2,3] => fontoxpath:sleep(1)) => array:fold-left("", concat#2)',
					documentNode),
				'23'));
	});

	describe('array:reverse', () => {
		it(
			'returns an empty array for an empty array',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:reverse([])', documentNode), []));

		it(
			'reverses an array with size 1',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:reverse([1])', documentNode), [1]));

		it(
			'reverses an array with size n',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:reverse([1,2,3,4])', documentNode), [4, 3, 2, 1]));

		it(
			'can be called with an array which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:reverse([1,2,3] => fontoxpath:sleep(1)) => array:fold-left("", concat#2)',
					documentNode),
				'321'));
	});

	describe('array:join', () => {
		it(
			'returns an empty array when passed an empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:join(())', documentNode), []));

		it(
			'returns an empty array when passed an empty array',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:join(([],[]))', documentNode), []));

		it(
			'returns the first array, followed by the second array',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:join(([1,2,3],["a","b","c"]))', documentNode), [1, 2, 3, 'a', 'b', 'c']));

		it(
			'can be called with an array which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:join(([1,2,3] => fontoxpath:sleep(1), ["a", "b", "c"])) => array:fold-left("", concat#2)',
					documentNode),
				'123abc'));
	});

	describe('array:for-each', () => {
		it(
			'returns an empty array when passed an empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:for-each([], tokenize#1)', documentNode), []));

		it(
			'returns the result of calling the function for each item',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:for-each([("the cat"),"sat",("on the mat")], function ($x) { tokenize($x) => reverse() => string-join(" ")})', documentNode), ['cat the', 'sat', 'mat the on']));

		it(
			'allows inline functions',
			() => chai.assert.isTrue(evaluateXPathToBoolean('array:for-each([1,2,3], function ($i) {$i + 1}) => deep-equal([2,3,4])', documentNode)));

		it(
			'can be called with an array which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:for-each(["a", "b", "c"] => fontoxpath:sleep(1), upper-case#1) => array:fold-left("", concat#2)',
					documentNode),
				'ABC'));

		it(
			'can be called with a callback which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:for-each(["a", "b", "c"], upper-case#1 => fontoxpath:sleep(1)) => array:fold-left("", concat#2)',
					documentNode),
				'ABC'));

		it(
			'can be called with a callback which returns async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:for-each(["a", "b", "c"], fontoxpath:sleep(?, 1)) => array:fold-left("", concat#2)',
					documentNode),
				'abc'));
	});

	describe('array:filter', () => {
		it(
			'returns an empty array when passed an empty sequence',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:filter([], boolean#1)', documentNode), []));

		it(
			'returns the subset of the array matching the filter function',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:filter([1, 0, 1, 0, true()], boolean#1)', documentNode), [1, 1, true]));
		it(
			'can be called with an array which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:filter(["a", "b", "c"] => fontoxpath:sleep(1), boolean#1) => array:fold-left("", concat#2)',
					documentNode),
				'abc'));
		it(
			'can be called with a callback which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:filter(["a", "b", "c"], boolean#1 => fontoxpath:sleep(1)) => array:fold-left("", concat#2)',
					documentNode),
				'abc'));

		it(
			'can be called with a callback which returns async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:filter([1,0,1,0], fontoxpath:sleep(?, 1)) => array:fold-left("", concat#2)',
					documentNode),
				'11'));
	});

	describe('array:fold-left', () => {
		it(
			'folds the array, from the left',
			() => chai.assert.deepEqual(evaluateXPathToString('array:fold-left(["a","b","c","d","e","f"], "", concat#2)', documentNode), 'abcdef'));

		it(
			'passes $zero in the inner call',
			() => chai.assert.deepEqual(evaluateXPathToString('array:fold-left(["a","b","c","d","e","f"], "zero", concat#2)', documentNode), 'zeroabcdef'));

		it(
			'returns the $zero argument if $array is empty',
			() => chai.assert.deepEqual(evaluateXPathToString('array:fold-left([], "zero", concat#2)', documentNode), 'zero'));

		it(
			'can be called with an array which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:fold-left([1,2,3] => fontoxpath:sleep(1), "", concat#2)',
					documentNode),
				'123'));

		it(
			'can be called with a zero which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:fold-left([1,2,3], "" => fontoxpath:sleep(1), concat#2)',
					documentNode),
				'123'));

		it(
			'can be called with a callback which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:fold-left([1,2,3], "", concat#2 => fontoxpath:sleep(1))',
					documentNode),
				'123'));

		it(
			'can be called with a callback which returns async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:fold-left([1,2,3], 0, function ($accum, $item) {fontoxpath:sleep($accum + $item, 1)})',
					documentNode),
				'6'));

	});

	describe('array:fold-right', () => {
		it(
			'folds the array, from the right',
			() => chai.assert.deepEqual(evaluateXPathToString('array:fold-right(["a","b","c","d","e","f"], "", concat#2)', documentNode), 'fedcba'));

		it(
			'passes $zero in the inner call',
			() => chai.assert.deepEqual(evaluateXPathToString('array:fold-right(["a","b","c","d","e","f"], "zero", concat#2)', documentNode), 'zerofedcba'));

		it(
			'returns the $zero argument if $array is empty',
			() => chai.assert.deepEqual(evaluateXPathToString('array:fold-right([], "zero", concat#2)', documentNode), 'zero'));

		it(
			'can be called with a zero which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:fold-right([1,2,3], "" => fontoxpath:sleep(1), concat#2)',
					documentNode),
				'321'));

		it(
			'can be called with a callback which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:fold-right([1,2,3], "", concat#2 => fontoxpath:sleep(1))',
					documentNode),
				'321'));

		it(
			'can be called with a callback which returns async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:fold-right([1,2,3], 0, function ($accum, $item) {fontoxpath:sleep($accum + $item, 1)})',
					documentNode),
				'6'));
	});

	describe('array:for-each-pair', () => {
		it(
			'returns the result of function on a and b',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:for-each-pair(["a"], ["b"], concat#2)', documentNode), ['ab']));

		it(
			'returns an array of the smallest size of the two passed arrays',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:for-each-pair(["a", "b"], ["a", "b", "c"], concat#2)', documentNode), ['aa', 'bb']));

		it(
			'returns an empty array if one of the two arrays is empty',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:for-each-pair(["a", "b"], [], concat#2)', documentNode), []));

		it(
			'can be called with an arrayA which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:for-each-pair([1,2,3] => fontoxpath:sleep(1), ["a", "b", "c"], concat#2) => array:fold-left("", concat#2)',
					documentNode),
				'1a2b3c'));

		it(
			'can be called with an arrayB which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:for-each-pair([1,2,3], ["a", "b", "c"] => fontoxpath:sleep(1), concat#2) => array:fold-left("", concat#2)',
					documentNode),
				'1a2b3c'));

		it(
			'can be called with a callback which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:for-each-pair([1,2,3], ["a", "b", "c"], concat#2 => fontoxpath:sleep(1)) => array:fold-left("", concat#2)',
					documentNode),
				'1a2b3c'));

		it(
			'can be called with a callback which returns async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(`
array:for-each-pair(
	[1,2,3],
	["a", "b", "c"],
	function ($accum, $item) {fontoxpath:sleep($accum || $item, 1)}
) => array:fold-left("", concat#2)
`, documentNode),
				'1a2b3c'));
	});

	describe('array:sort', () => {
		it(
			'returns an empty array is the inputted array is empty',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:sort([])', documentNode), []));

		it(
			'sorts the array',
			() => chai.assert.deepEqual(evaluateXPathToArray('array:sort([3,2,1])', documentNode), [1, 2, 3]));

		it(
			'can be called with an array which resolves async',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:sort([2,1,3] => fontoxpath:sleep(1)) => array:fold-left("", concat#2)',
					documentNode),
				'123'));

		it(
			'can be called with an array with async entries',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:sort([2,1,3] => array:for-each(fontoxpath:sleep(?, 1))) => array:fold-left("", concat#2)',
					documentNode),
				'123'));
	});

	describe('array:flatten', () => {
		it(
			'returns an empty array is the inputted array is empty',
			() => chai.assert.isTrue(evaluateXPathToBoolean('array:flatten([]) => count() eq 0', documentNode)));

		it(
			'flattens the array',
			() => chai.assert.deepEqual(evaluateXPathToStrings('array:flatten(["a", "b", "c"])', documentNode), ['a', 'b', 'c']));

		it(
			'recursively flattens the array',
			() => chai.assert.deepEqual(evaluateXPathToStrings('array:flatten(["a", ["b", "c"], "d"])', documentNode), ['a', 'b', 'c', 'd']));

		it(
			'can be called with an array with async entries',
			async () => chai.assert.equal(
				await evaluateXPathToAsyncSingleton(
					'array:flatten([1,2,3,[4,5,[6]],7] => array:for-each(fontoxpath:sleep(?, 1)))!string() => string-join("")',
					documentNode),
				'1234567'));
	});

	describe('complex queries', () => {
		it('can build jsonml', async () => {
			const jsonMlFragment = [
				'someElement',
				{
					some: 'attributes'
				},
				'Some data',
				[ 'childElement', {'with': 'attributes'}, 'and text'],
				'And some more data'
			];
			jsonMlMapper.parse(jsonMlFragment, documentNode);
			const xpath = `
let $processDescendants := function ($recurse, $node) {
  if ($node/self::text()) then
    $node/string()
  else if ($node/self::element()) then
    array{name($node), map:merge($node/@*!map:entry(name(.), string(.))), $node/child::node()!$recurse($recurse, .)}
  else []
}
return $processDescendants($processDescendants, /*)
`;
			chai.assert.deepEqual(await evaluateXPathToAsyncSingleton(xpath, documentNode), jsonMlFragment);
		});
	});
});
