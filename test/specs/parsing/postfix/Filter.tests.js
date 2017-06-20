import * as slimdom from 'slimdom';

import {
	evaluateXPathToNumber
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Filter (predicate)', () => {
	it('parses',
		() => chai.assert.equal(evaluateXPathToNumber('(1,2,3)[. = 2]', documentNode), 2));
});
