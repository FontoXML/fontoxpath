import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import slimdom from 'slimdom';

import evaluateXPath from 'fontoxml-selectors/evaluateXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('Filter (predicate)', () => {
	it('parses', () => {
		chai.assert.equal(evaluateXPath('(1,2,3)[. = 2]', documentNode, blueprint, {}), 2);
	});
});
