import slimdom from 'slimdom';

import { evaluateXPathToString, evaluateXPathToNumber } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('varRef', () => {
	it('can reference variables: numerical',
		() => chai.assert.equal(evaluateXPathToNumber('$x', documentNode, null, { x: 42 }), 42));
	it('can reference variables: maps',
		() => chai.assert.equal(evaluateXPathToNumber('$x("a")', documentNode, null, { x: { a: 1 } }), 1));
	it('can reference variables: arrays',
		() => chai.assert.equal(evaluateXPathToString('$x(1)', documentNode, null, { x: ['a', 'b', 'c'] }), 'a'));
	it('can reference variables: mixed maps and arrays',
		() => chai.assert.equal(evaluateXPathToNumber('$x(1)("a")', documentNode, null, { x: [{ 'a': 123 }] }), 123));
	it('can reference built-in variables',
		() => chai.assert.deepEqual(evaluateXPathToString('$theBest', documentNode), 'FontoXML is the best!'));
});
