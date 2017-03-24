import slimdom from 'slimdom';

import {
	evaluateXPathToFirstNode
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('self', () => {
	it('parses self::', () => {
		const element = documentNode.createElement('someElement');
		chai.assert.deepEqual(evaluateXPathToFirstNode('self::someElement', element), element);
	});
});
