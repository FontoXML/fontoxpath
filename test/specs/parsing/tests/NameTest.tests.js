import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('nameTests', () => {
	it('allows wildcards', () => {
		const element = documentNode.createElement('someElement');
		chai.assert.isTrue(evaluateXPathToBoolean('self::*', element));
	});

	it('allows wildcards (just * allows all namespaces))', () => {
		const element = documentNode.createElementNS('http://fontoxml.com/ns/', 'someElement');
		chai.assert.isTrue(evaluateXPathToBoolean('self::*', element));
	});


	it('allows wildcards for just the localName part', () => {
		const element = documentNode.createElementNS('http://fontoxml.com/ns/', 'ns:someElement');
		chai.assert.isTrue(evaluateXPathToBoolean('self::someNs:*', element, null, null, {
			namespaceResolver: () => 'http://fontoxml.com/ns/'
		}));
	});

	it('allows wildcards for just the namespace part', () => {
		const element = documentNode.createElementNS('http://fontoxml.com/ns/', 'ns:someElement');
		chai.assert.isTrue(evaluateXPathToBoolean('self::*:someElement', element, null, null, {
			namespaceResolver: () => 'http://fontoxml.com/ns/'
		}));
	});

	it('allows nodeNames containing namespaces', () => {
		const element = documentNode.createElementNS('http://fontoxml.com/ns/', 'someElement');
		chai.assert.equal(evaluateXPathToFirstNode('self::someNamespace:someElement', element, null, null, { namespaceResolver: () => 'http://fontoxml.com/ns/' }), element);
	});
});
