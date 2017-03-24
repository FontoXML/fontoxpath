import slimdom from 'slimdom';

import { evaluateXPathToString, evaluateXPathToNumber } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('varRef', () => {
	it('can reference variables',
		() => chai.assert.equal(evaluateXPathToNumber('$x', documentNode, null, { x: 42 }), 42));
	it('can reference built-in variables',
		() => chai.assert.deepEqual(evaluateXPathToString('$theBest', documentNode), 'FontoXML is the best!'));
});
