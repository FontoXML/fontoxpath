import slimdom from 'slimdom';

import {
	domFacade,
	evaluateXPathToArray,
	evaluateXPathToBoolean,
	evaluateXPathToString,
	evaluateXPathToStrings
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('array:size', () => {
	it(
		'returns the size of an array',
		() => chai.assert.isTrue(evaluateXPathToBoolean('array:size([1,2,3]) eq 3', documentNode, domFacade)));

	it(
		'returns 0 for an empty array',
		() => chai.assert.isTrue(evaluateXPathToBoolean('array:size([]) eq 0', documentNode, domFacade)));
});

describe('array:get', () => {
	it(
		'returns the first item',
		() => chai.assert.isTrue(evaluateXPathToBoolean('array:get([1,2,3], 1) eq 1', documentNode, domFacade)));

	it(
		'returns the second item',
		() => chai.assert.isTrue(evaluateXPathToBoolean('array:get([1,2,3], 2) eq 2', documentNode, domFacade)));

	it(
		'returns the last item',
		() => chai.assert.isTrue(evaluateXPathToBoolean('array:get([1,2,3], 3) eq 3', documentNode, domFacade)));

	it(
		'throws when passed 0',
		() => chai.assert.throws(() => evaluateXPathToBoolean('array:get([1,2,3], 0)', documentNode, domFacade), 'FOAY0001'));

	it(
		'throws when passed an index larger than the size of the array',
		() => chai.assert.throws(() => evaluateXPathToBoolean('array:get([1,2,3], 1337)', documentNode, domFacade), 'FOAY0001'));

	it(
		'is aliased to "calling the array"',
		() => chai.assert.isTrue(evaluateXPathToBoolean('[1,2,3](1) eq 1', documentNode, domFacade)));
});

describe('array:put', () => {
	it(
		'can add an item at the start',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:put([1,2,3], 1, "a")', documentNode, domFacade), [['a'],[2], [3]]));

	it(
		'can add an item in the middle',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:put([1,2,3], 2, "a")', documentNode, domFacade), [[1], ['a'], [3]]));

	it(
		'can add an item to the end',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:put([1,2,3], 3, "a")', documentNode, domFacade), [[1], [2], ['a']]));

	it(
		'throws an error when passed a position larger than the size of the array',
		() => chai.assert.throws(() => evaluateXPathToArray('array:put([1,2,3], 4, "a")', documentNode, domFacade), 'FOAY0001'));

	it(
		'throws an error when passed 0',
		() => chai.assert.throws(() => evaluateXPathToArray('array:put([1,2,3], 0, "a")', documentNode, domFacade), 'FOAY0001'));
});

describe('array:append', () => {
	it(
		'appends an item to an empty array',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:append([], 0)', documentNode, domFacade), [[0]]));

	it(
		'appends an item to an array',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:append([1,2,3], 4)', documentNode, domFacade), [[1], [2], [3], [4]]));
});

describe('array:subarray', () => {
	it(
		'returns a subarray',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:subarray([1,2,3], 1, 2)', documentNode, domFacade), [[1], [2]]));

	it(
		'returns the full array if the range is full',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:subarray([1,2,3], 1, 3)', documentNode, domFacade), [[1], [2], [3]]));

	it(
		'returns an empty array if the range is empty',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:subarray([1,2,3], 1, 0)', documentNode, domFacade), []));
	it(
		'throws an error when passed $length < 0',
		() => chai.assert.throws(() => evaluateXPathToArray('array:subarray([1,2,3], 1, -1)', documentNode, domFacade), 'FOAY0002'));

	it(
		'throws an error when passed $start <= 0',
		() => chai.assert.throws(() => evaluateXPathToArray('array:subarray([1,2,3], 0, 1)', documentNode, domFacade), 'FOAY0001'));

	it(
		'throws an error when passed $start + $length > size',
		() => chai.assert.throws(() => evaluateXPathToArray('array:subarray([1,2,3], 1, 9001)', documentNode, domFacade), 'FOAY0001'));
});


describe('array:remove', () => {
	it(
		'removes the first item from an array',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:remove([1,2,3], 1)', documentNode, domFacade), [[2], [3]]));

	it(
		'removes a middle item from the array',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:remove([1,2,3], 2)', documentNode, domFacade), [[1], [3]]));

	it(
		'removes the last item from the array',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:remove([1,2,3], 3)', documentNode, domFacade), [[1], [2]]));

	it(
		'removes multiple items',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:remove([1,2,3], (1,2))', documentNode, domFacade), [[3]]));

	it(
		'removes multiple items with positions out of order',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:remove([1,2,3], (2,1))', documentNode, domFacade), [[3]]));

	it(
		'throws when passed $position <= 0',
		() => chai.assert.throws(() => evaluateXPathToArray('array:remove([1,2,3], 0)', documentNode, domFacade), 'FOAY0001'));

	it(
		'throws when passed $position > size',
		() => chai.assert.throws(() => evaluateXPathToArray('array:remove([1,2,3], 9001)', documentNode, domFacade), 'FOAY0001'));
});

describe('array:insert-before', () => {
	it(
		'inserts before the first item',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:insert-before([1,2,3], 1, "a")', documentNode, domFacade), [['a'], [1], [2], [3]]));

	it(
		'inserts before the middle item',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:insert-before([1,2,3], 2, "a")', documentNode, domFacade), [[1], ['a'], [2], [3]]));

	it(
		'inserts before the last item',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:insert-before([1,2,3], 3, "a")', documentNode, domFacade), [[1], [2], ['a'], [3]]));

	it(
		'inserts after the last item',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:insert-before([1,2,3], 4, "a")', documentNode, domFacade), [[1], [2], [3], ['a']]));

	it(
		'throws when passed $position <= 0',
		() => chai.assert.throws(() => evaluateXPathToArray('array:insert-before([1,2,3], 0, "a")', documentNode, domFacade), 'FOAY0001'));

	it(
		'throws when passed $position > size + 1',
		() => chai.assert.throws(() => evaluateXPathToArray('array:insert-before([1,2,3], 5, "a")', documentNode, domFacade), 'FOAY0001'));

});

describe('array:head', () => {
	it(
		'throws when passed an empty array',
		() => chai.assert.throws(() => evaluateXPathToArray('array:head([])', documentNode, domFacade), 'FOAY0001'));

	it(
		'returns the first item',
		() => chai.assert.isTrue(evaluateXPathToBoolean('array:head([1]) eq 1', documentNode, domFacade)));
});

describe('array:tail', () => {
	it(
		'throws when passed an empty array',
		() => chai.assert.throws(() => evaluateXPathToArray('array:tail([])', documentNode, domFacade), 'FOAY0001'));

	it(
		'returns an empty array for a array with size 1',
		() => chai.assert.isTrue(evaluateXPathToBoolean('array:tail([1]) => array:size() eq 0', documentNode, domFacade)));

	it(
		'returns the tail of an array',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:tail([1,2,3])', documentNode, domFacade), [[2], [3]]));
});

describe('array:reverse', () => {
	it(
		'returns an empty array for an empty array',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:reverse([])', documentNode, domFacade), []));

	it(
		'reverses an array with size 1',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:reverse([1])', documentNode, domFacade), [[1]]));

	it(
		'reverses an array with size n',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:reverse([1,2,3,4])', documentNode, domFacade), [[4], [3], [2], [1]]));
});

describe('array:join', () => {
	it(
		'returns an empty array when passed an empty sequence',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:join(())', documentNode, domFacade), []));

	it(
		'returns an empty array when passed an empty array',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:join(([],[]))', documentNode, domFacade), []));

	it(
		'returns the first array, followed by the second array',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:join(([1,2,3],["a","b","c"]))', documentNode, domFacade), [[1], [2], [3], ['a'], ['b'], ['c']]));
});

describe('array:for-each', () => {
	it(
		'returns an empty array when passed an empty sequence',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:for-each([], tokenize#1)', documentNode, domFacade), []));

	it(
		'returns an empty array when passed an empty array',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:for-each([("the cat"),"sat",("on the mat")], tokenize#1)', documentNode, domFacade), [['the', 'cat'], ['sat'], ['on', 'the', 'mat']]));
});

describe('array:filter', () => {
	it(
		'returns an empty array when passed an empty sequence',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:filter([], boolean#1)', documentNode, domFacade), []));

	it(
		'returns the subset of the array matching the filter function',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:filter([1, 0, 1, 0, true()], boolean#1)', documentNode, domFacade), [[1], [1], [true]]));
});

describe('array:fold-left', () => {
	it(
		'folds the array, from the left',
		() => chai.assert.deepEqual(evaluateXPathToString('array:fold-left(["a","b","c","d","e","f"], "", concat#2)', documentNode, domFacade), 'abcdef'));

	it(
		'passes $zero in the inner call',
		() => chai.assert.deepEqual(evaluateXPathToString('array:fold-left(["a","b","c","d","e","f"], "zero", concat#2)', documentNode, domFacade), 'zeroabcdef'));

	it(
		'returns the $zero argument if $array is empty',
		() => chai.assert.deepEqual(evaluateXPathToString('array:fold-left([], "zero", concat#2)', documentNode, domFacade), 'zero'));
});

describe('array:fold-right', () => {
	it(
		'folds the array, from the right',
		() => chai.assert.deepEqual(evaluateXPathToString('array:fold-right(["a","b","c","d","e","f"], "", concat#2)', documentNode, domFacade), 'fedcba'));

	it(
		'passes $zero in the inner call',
		() => chai.assert.deepEqual(evaluateXPathToString('array:fold-right(["a","b","c","d","e","f"], "zero", concat#2)', documentNode, domFacade), 'zerofedcba'));

	it(
		'returns the $zero argument if $array is empty',
		() => chai.assert.deepEqual(evaluateXPathToString('array:fold-right([], "zero", concat#2)', documentNode, domFacade), 'zero'));
});

describe('array:for-each-pair', () => {
	it(
		'returns the result of function on a and b',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:for-each-pair(["a"], ["b"], concat#2)', documentNode, domFacade), [['ab']]));

	it(
		'returns an array of the smallest size of the two passed arrays',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:for-each-pair(["a", "b"], ["a", "b", "c"], concat#2)', documentNode, domFacade), [['aa'], ['bb']]));

	it(
		'returns an empty array if one of the two arrays is empty',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:for-each-pair(["a", "b"], [], concat#2)', documentNode, domFacade), []));
});

describe('array:sort', () => {
	it(
		'returns an empty array is the inputted array is empty',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:sort([])', documentNode, domFacade), []));

	it(
		'sorts the array',
		() => chai.assert.deepEqual(evaluateXPathToArray('array:sort([3,2,1])', documentNode, domFacade), [[1], [2], [3]]));
});

describe('array:flatten', () => {
	it(
		'returns an empty array is the inputted array is empty',
		() => chai.assert.isTrue(evaluateXPathToBoolean('array:flatten([]) => count() eq 0', documentNode, domFacade)));

	it(
		'flattens the array',
		() => chai.assert.deepEqual(evaluateXPathToStrings('array:flatten(["a", "b", "c"])', documentNode, domFacade), ['a', 'b', 'c']));

	it(
		'recursively flattens the array',
		() => chai.assert.deepEqual(evaluateXPathToStrings('array:flatten(["a", ["b", "c"], "d"])', documentNode, domFacade), ['a', 'b', 'c', 'd']));
});
