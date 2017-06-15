import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

describe('Deprecated features', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = slimdom.createDocument();
	});

	it('Does not accept functions as tests anymore',
		() => chai.assert.throws(() => evaluateXPathToBoolean('self::false()', documentNode), 'XPST0003'));
});
