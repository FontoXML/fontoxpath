import * as slimdom from 'slimdom';

import {
	evaluateXPathToFirstNode
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('self', () => {
	it('parses self::', () => {
		const element = documentNode.createElement('someElement');
		chai.assert.deepEqual(evaluateXPathToFirstNode('self::someElement', element), element);
	});
	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToFirstNode('self::*', null), 'XPDY0002');
	});
});
