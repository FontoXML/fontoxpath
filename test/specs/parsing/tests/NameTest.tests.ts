import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateXPathToBoolean, evaluateXPathToFirstNode, getBucketForSelector } from 'fontoxpath';

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
		chai.assert.isTrue(
			evaluateXPathToBoolean('self::someNs:*', element, null, null, {
				namespaceResolver: () => 'http://fontoxml.com/ns/',
			}),
		);
	});

	it('allows wildcards for just the namespace part', () => {
		const element = documentNode.createElementNS('http://fontoxml.com/ns/', 'ns:someElement');
		chai.assert.isTrue(
			evaluateXPathToBoolean('self::*:someElement', element, null, null, {
				namespaceResolver: () => 'http://fontoxml.com/ns/',
			}),
		);
	});

	it('allows nodeNames containing namespaces', () => {
		const element = documentNode.createElementNS('http://fontoxml.com/ns/', 'someElement');
		chai.assert.equal(
			evaluateXPathToFirstNode('self::someNamespace:someElement', element, null, null, {
				namespaceResolver: () => 'http://fontoxml.com/ns/',
			}),
			element,
		);
	});

	it('allows nodeNames containing namespace URIs', () => {
		const element = documentNode.createElementNS('http://fontoxml.com/ns/', 'someElement');
		chai.assert.equal(
			evaluateXPathToFirstNode('self::Q{http://fontoxml.com/ns/}someElement', element),
			element,
		);
	});

	it('allows wildcard tests with a namespace URI', () => {
		const element = documentNode.createElementNS('http://fontoxml.com/ns/', 'someElement');
		chai.assert.equal(
			evaluateXPathToFirstNode('self::Q{http://fontoxml.com/ns/}*', element),
			element,
		);
	});

	it('allows wildcard tests with an empty namespace URI', () => {
		const element = documentNode.createElementNS('', 'someElement');
		chai.assert.equal(evaluateXPathToFirstNode('self::Q{}*', element), element);
		const elementWithNamespace = documentNode.createElementNS(
			'http://fontoxml.com/ns/',
			'someElement',
		);
		chai.assert.equal(evaluateXPathToFirstNode('self::Q{}*', elementWithNamespace), null);
	});

	it('Q{} matches the empty namespace', () => {
		const element = documentNode.createElement('someElement');
		chai.assert.equal(evaluateXPathToFirstNode('self::Q{}someElement', element), element);

		const elementWithNamespace = documentNode.createElementNS(
			'http://fontoxml.com/ns/',
			'someElement',
		);
		chai.assert.equal(
			evaluateXPathToFirstNode('self::Q{}someElement', elementWithNamespace),
			null,
			'Empty namespace should not match non-absent namespace.',
		);
	});

	it('throws when seeing undeclared prefixes', () => {
		documentNode.appendChild(documentNode.createElement('someElement'));
		chai.assert.throws(
			() => evaluateXPathToBoolean('//someNonExistingNS:*', documentNode),
			'XPST0081',
		);
	});

	describe('bucketing', () => {
		it('returns type-1-or-type-2 if the selector is "self::*"', () => {
			chai.assert.equal(getBucketForSelector('self::*'), 'type-1-or-type-2');
		});
		it('returns type-1 if the selector is "self::*[@attr]"', () => {
			chai.assert.equal(getBucketForSelector('self::*[@attr]'), 'type-1');
		});
		it('returns type-1 if the selector is "self::element(*)"', () => {
			chai.assert.equal(getBucketForSelector('self::element(*)'), 'type-1');
		});
		it('returns name-xxx if the selector is "self::element(xxx)"', () => {
			chai.assert.equal(getBucketForSelector('self::element(xxx)'), 'name-xxx');
		});
		it('returns type-2 if the selector is "self::attribute(*)"', () => {
			chai.assert.equal(getBucketForSelector('self::attribute(*)'), 'type-2');
		});
		it('returns name-xxx if the selector is "self::attribute(xxx)"', () => {
			chai.assert.equal(getBucketForSelector('self::attribute(xxx)'), 'name-xxx');
		});
	});
});
