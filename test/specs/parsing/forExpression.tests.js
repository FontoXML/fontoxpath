import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('for expressions', () => {
	it('works', () => {
		chai.assert(evaluateXPathToBoolean('(for $i in (1 to 10) return $i) => count() = 10', documentNode));
	});
});
