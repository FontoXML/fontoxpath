import { domFacade } from 'fontoxml-selectors';
import slimdom from 'slimdom';

import { evaluateXPathToNumber } from 'fontoxml-selectors';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('Filter (predicate)', () => {
	it('parses', () => {
		chai.assert.equal(evaluateXPathToNumber('(1,2,3)[. = 2]', documentNode, domFacade, {}), 2);
	});
});
