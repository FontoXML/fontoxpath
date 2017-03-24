import slimdom from 'slimdom';

import {
	evaluateXPathToNumber
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('unary operators', () => {
	it('accepts + when passed an integer',
		() => chai.assert.equal(evaluateXPathToNumber('+1', documentNode), 1));

	it('negates a - when passed an integer',
		() => chai.assert.equal(evaluateXPathToNumber('-1', documentNode), -1));

	it('accepts + when passed 0',
		() => chai.assert.equal(evaluateXPathToNumber('+0', documentNode), 0));

	it('accepts - when passed 0',
		() => chai.assert.equal(evaluateXPathToNumber('-0', documentNode), 0));

	it('accepts chaining +',
		() => chai.assert.equal(evaluateXPathToNumber('++++1', documentNode), 1));

	it('accepts chaining -',
		() => chai.assert.equal(evaluateXPathToNumber('----1', documentNode), 1));

	it('accepts chaining - and + intermittently',
		() => chai.assert.equal(evaluateXPathToNumber('+-+-1', documentNode), 1));

	it('resolves to NaN passed a string',
		() => chai.assert.isNaN(evaluateXPathToNumber('+"something"', documentNode)));

	it('resolves to NaN passed a boolean',
		() => chai.assert.isNaN(evaluateXPathToNumber('+true()', documentNode)));

	it('resolves to NaN passed a node',
		() => chai.assert.isNaN(evaluateXPathToNumber('+.', documentNode)));
});
