import * as slimdom from 'slimdom';

import {
	evaluateXPathToString,
	evaluateXPathToStrings
} from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Simple map operator', () => {
	it('accepts two single inputs: . ! name(.)', () => {
		const element = documentNode.createElement('someElement');
		chai.assert.equal(evaluateXPathToString('. ! name(.)', element), 'someElement');
	});

	it('accepts a sequence as first expression: (1, 2, 3) ! string()',
		() => chai.assert.deepEqual(evaluateXPathToStrings('(1, 2, 3) ! string()', documentNode), ['1', '2', '3']));

	it('accepts a sequence as second expression: "abc" ! (concat("123", .), concat(., "123"))',
		() => chai.assert.deepEqual(evaluateXPathToStrings('"abc" ! (concat("123", .), concat(., "123"))', documentNode), ['123abc', 'abc123']));

	it('accepts a sequence as first and as second expression: ("a", "b", "c") ! (concat("a-", .), concat("b-", .), concat("c-", .))',
		() => chai.assert.deepEqual(evaluateXPathToStrings('("a", "b", "c") ! (concat("a-", .), concat("b-", .), concat("c-", .))', documentNode), ['a-a', 'b-a', 'c-a', 'a-b', 'b-b', 'c-b', 'a-c', 'b-c', 'c-c']));

	it('accepts being stacked: . ! (@first, @second, @last) ! string(.)', () => {
		const element = documentNode.createElement('someElement');
		element.setAttribute('first', 'a');
		element.setAttribute('second', 'b');
		element.setAttribute('last', 'z');
		chai.assert.deepEqual(evaluateXPathToStrings('. ! (@first, @second, @last) ! string(.)', element), ['a', 'b', 'z']);
	});

	it(
		'sets the context sequence',
		() => chai.assert.deepEqual(evaluateXPathToStrings('("a", "b", "c")!position()!string()', documentNode), ['1', '2', '3']));

	it(
		'can map to async functions',
		async () => chai.assert.equal(await evaluateXPathToAsyncSingleton('("a", "b", "c")!fontoxpath:sleep(., 1) => string-join()', documentNode), 'abc'));
	it(
		'can map an async filled sequence',
		async () => chai.assert.equal(await evaluateXPathToAsyncSingleton('("a" => fontoxpath:sleep(1), "b", "c" => fontoxpath:sleep(1))!string() => string-join()', documentNode), 'abc'));

});
