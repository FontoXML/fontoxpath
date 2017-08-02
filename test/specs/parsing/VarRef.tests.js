import * as slimdom from 'slimdom';

import {
	evaluateXPathToString,
	evaluateXPathToNumber,
	evaluateXPathToFirstNode
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('varRef', () => {
	it('can reference variables: numerical',
		() => chai.assert.equal(evaluateXPathToNumber('$x', documentNode, null, { x: 42 }), 42));
	it('can reference variables: maps',
		() => chai.assert.equal(evaluateXPathToNumber('$x("a")', documentNode, null, { x: { a: 1 } }), 1));
	it('can reference variables: nodes',
		() => chai.assert.equal(evaluateXPathToFirstNode('$x("a")/self::node()', documentNode, null, { x: { a: documentNode } }), documentNode));
	it('can reference "let" variables more than once',
		() => chai.assert.equal(
			evaluateXPathToNumber('let $x := (1,2,3,4,5,6) return count($x) + count(reverse($x)) (: If this resolves with 8, it signals a double iteration of the same sequence :)'),
			12
		));
	it('can reference "function parameters" variables more than once',
		() => chai.assert.equal(
			evaluateXPathToNumber('function ($x as item()*) {count($x) + count(reverse($x))}((1,2,3,4,5,6)) (: If this resolves with 8, it signals a double iteration of the same sequence :)'),
			12
		));

	it('can reference variables: arrays',
		() => chai.assert.equal(evaluateXPathToString('$x(1)', documentNode, null, { x: ['a', 'b', 'c'] }), 'a'));
	it('can reference variables: mixed maps and arrays',
		() => chai.assert.equal(evaluateXPathToNumber('$x(1)("a")', documentNode, null, { x: [{ 'a': 123 }] }), 123));
	it('can reference built-in variables',
		() => chai.assert.deepEqual(evaluateXPathToString('$theBest', documentNode), 'FontoXML is the best!'));
});
