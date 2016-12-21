import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';

describe('Deprecated features', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = slimdom.createDocument();
	});

	it('Does not accept functions as tests anymore', () => {
		chai.assert.throws(() => evaluateXPath('self::false()', documentNode.documentElement, blueprint), 'XPST0003');
	});
});
