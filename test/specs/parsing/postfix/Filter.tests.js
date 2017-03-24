import slimdom from 'slimdom';

import {
	evaluateXPathToNumber
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('Filter (predicate)', () => {
	it('parses',
		() => chai.assert.equal(evaluateXPathToNumber('(1,2,3)[. = 2]', documentNode), 2));
});
