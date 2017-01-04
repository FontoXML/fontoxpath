import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToString, evaluateXPathToNumber } from 'fontoxml-selectors';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('varRef', () => {
	it('can reference variables', () => {
		chai.expect(
			evaluateXPathToNumber('$x', documentNode, domFacade, {'x': 42})
		).to.deep.equal(42);
	});

	it('can reference built-in variables', () => {
		chai.expect(
			evaluateXPathToString('$theBest', documentNode, domFacade)
		).to.deep.equal('FontoXML is the best!');
	});
});
