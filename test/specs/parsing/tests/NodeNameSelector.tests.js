import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('nameTests', () => {
	it('allows wildcards', () => {
		const element = documentNode.createElement('someElement');
		chai.assert.isTrue(evaluateXPathToBoolean('self::*', element));
	});

	it('allows nodeNames containing namespaces', () => {
		const element = documentNode.createElement('someNamespace:someElement');
		chai.assert.deepEqual(evaluateXPathToFirstNode('self::someNamespace:someElement', element), element);
	});
});
