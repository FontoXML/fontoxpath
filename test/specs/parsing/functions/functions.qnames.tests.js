import jsonMlMapper from 'test-helpers/jsonMlMapper';
import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('functions over qnames', () => {
	describe('local-name-from-QName()', () => {
		it('Returns the local part of a qname with no prefix',
			() => chai.assert.isTrue(evaluateXPathToBoolean('local-name-from-QName(QName((), "someElement")) = "someElement"', documentNode)));
		it('Returns the local part of a qname with no prefix',
			() => chai.assert.isTrue(evaluateXPathToBoolean('local-name-from-QName(QName((), "someElement")) = "someElement"', documentNode)));
		it('Returns the local part of a qname resulting from an attribute', () => {
			documentNode.appendChild(documentNode.createElementNS('http://example.com/ns', 'someElement')).setAttributeNS('http://example.com/ns', 'ns:someAttribute', 'someValue');
			chai.assert.isTrue(evaluateXPathToBoolean('local-name-from-QName(node-name(//@*)) eq "someAttribute"', documentNode));
		});
		it('allows async parameters', async () => {
			documentNode.appendChild(documentNode.createElementNS('http://example.com/ns', 'someElement')).setAttributeNS('http://example.com/ns', 'ns:someAttribute', 'someValue');
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('local-name-from-QName(node-name(//@*) => fontoxpath:sleep(1)) eq "someAttribute"', documentNode));
		});
	});

	describe('prefix-from-QName()', () => {
		it('returns the empty sequence if inputted the empty sequence',
			() => chai.assert.isTrue(evaluateXPathToBoolean('prefix-from-QName(()) => count() = 0', documentNode)));
		it('Returns the prefix of a qname with no prefix',
			() => chai.assert.isTrue(evaluateXPathToBoolean('prefix-from-QName(QName((), "someElement")) => empty()', documentNode)));
		it('Returns the prefix of a qname with a prefix',
			() => chai.assert.isTrue(evaluateXPathToBoolean('prefix-from-QName(QName("http://example.com/ns", "ns:someElement")) = "ns"', documentNode)));
		it('Returns the prefix of a qname resulting from an attribute', () => {
			documentNode.appendChild(documentNode.createElementNS('http://example.com/ns', 'someElement')).setAttributeNS('http://example.com/ns', 'ns:someAttribute', 'someValue');
			chai.assert.isTrue(evaluateXPathToBoolean('prefix-from-QName(node-name(//@*)) = "ns"', documentNode));
		});
		it('allows async parameters', async () => {
			documentNode.appendChild(documentNode.createElementNS('http://example.com/ns', 'someElement')).setAttributeNS('http://example.com/ns', 'ns:someAttribute', 'someValue');
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('prefix-from-QName(node-name(//@*) => fontoxpath:sleep(1)) eq "ns"', documentNode));
		});
	});

	describe('namespace-uri-from-QName()', () => {
		it('Returns the namespace-uri of a qname with no prefix',
			() => chai.assert.isTrue(evaluateXPathToBoolean('namespace-uri-from-QName(QName((), "someElement")) = ""', documentNode)));
		it('Returns the namespace-uri of a qname with a prefix',
			() => chai.assert.isTrue(evaluateXPathToBoolean('namespace-uri-from-QName(QName("http://example.com/ns", "ns:someElement")) = "http://example.com/ns"', documentNode)));
		it('Returns the namespace uri of a qname resulting from an attribute', () => {
			documentNode.appendChild(documentNode.createElementNS('http://example.com/ns', 'ns:someElement')).setAttributeNS('http://example.com/ns', 'ns:someAttribute', 'someValue');
			chai.assert.isTrue(evaluateXPathToBoolean('namespace-uri-from-QName(node-name((//@*)[1])) = "http://example.com/ns"', documentNode));
		});
		it('allows async parameters', async () => {
			documentNode.appendChild(documentNode.createElementNS('http://example.com/ns', 'someElement')).setAttributeNS('http://example.com/ns', 'ns:someAttribute', 'someValue');
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('namespace-uri-from-QName(node-name(//@*) => fontoxpath:sleep(1)) eq "http://example.com/ns"', documentNode));
		});
	});
});
