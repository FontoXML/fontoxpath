import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToNumber } from 'fontoxml-selectors';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('unary operators', () => {
	it('accepts + when passed an integer', () => {
		chai.assert.equal(evaluateXPathToNumber('+1', documentNode, domFacade), 1);
	});

	it('negates a - when passed an integer', () => {
		chai.assert.equal(evaluateXPathToNumber('-1', documentNode, domFacade), -1);
	});

	it('accepts + when passed 0', () => {
		chai.assert.equal(evaluateXPathToNumber('+0', documentNode, domFacade), 0);
	});

	it('accepts - when passed 0', () => {
		chai.assert.equal(evaluateXPathToNumber('-0', documentNode, domFacade), 0);
	});

	it('accepts chaining +', () => {
		chai.assert.equal(evaluateXPathToNumber('++++1', documentNode, domFacade), 1);
	});

	it('accepts chaining -', () => {
		chai.assert.equal(evaluateXPathToNumber('----1', documentNode, domFacade), 1);
	});

	it('accepts chaining - and + intermittently', () => {
		chai.assert.equal(evaluateXPathToNumber('+-+-1', documentNode, domFacade), 1);
	});

	it('resolves to NaN passed a string', () => {
		chai.assert.isNaN(evaluateXPathToNumber('+"something"', documentNode, domFacade));
	});

	it('resolves to NaN passed a boolean', () => {
		chai.assert.isNaN(evaluateXPathToNumber('+true()', documentNode, domFacade));
	});

	it('resolves to NaN passed a node', () => {
		chai.assert.isNaN(evaluateXPathToNumber('+.', documentNode, domFacade));
	});
});
