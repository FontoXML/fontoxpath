import * as chai from 'chai';
import * as slimdom from 'slimdom';

import {
	Attr,
	evaluateXPathToBoolean,
	evaluateXPathToString,
	evaluateXPathToStrings,
	getBucketForSelector,
	IDomFacade,
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('attribute', () => {
	it('parses attribute existence', () => {
		const element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute', 'someValue');
		chai.assert.equal(evaluateXPathToString('attribute::someAttribute', element), 'someValue');
	});

	it('returns no attributes for documents', () =>
		chai.assert.equal(evaluateXPathToString('attribute::someAttribute', documentNode), ''));

	it('returns no attributes for comments', () =>
		chai.assert.equal(
			evaluateXPathToString(
				'attribute::someAttribute',
				documentNode.createComment('some comment')
			),
			''
		));

	it('returns no attributes for processing instructions', () =>
		chai.assert.equal(
			evaluateXPathToString(
				'attribute::someAttribute',
				documentNode.createProcessingInstruction('someTarget', 'some data')
			),
			''
		));

	it('resolves to false if attribute is absent', () => {
		const element = documentNode.createElement('someElement');
		chai.assert.deepEqual(evaluateXPathToStrings('@someAttribute', element), []);
	});

	it('allows namespaces', () => {
		const element = documentNode.createElement('someElement');
		element.setAttributeNS(
			'http://fontoxml.com/ns/',
			'someNamespace:someAttribute',
			'someValue'
		);
		chai.assert.equal(
			evaluateXPathToString('attribute::someNamespace:someAttribute', element, null, null, {
				namespaceResolver: () => 'http://fontoxml.com/ns/',
			}),
			'someValue'
		);
	});

	it('allows namespaces using the EQName syntax', () => {
		const element = documentNode.createElement('someElement');
		element.setAttributeNS(
			'http://fontoxml.com/ns/',
			'someNamespace:someAttribute',
			'someValue'
		);
		chai.assert.equal(
			evaluateXPathToString(
				'attribute::Q{http://fontoxml.com/ns/}someAttribute',
				element,
				null,
				null,
				{ namespaceResolver: () => 'http://fontoxml.com/ns/' }
			),
			'someValue'
		);
	});

	it('parses the shorthand for existence', () => {
		const element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute', 'someValue');
		chai.assert.equal(evaluateXPathToString('@someAttribute', element), 'someValue');
	});

	it('parses the shorthand for value', () => {
		const element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute', 'someValue');
		chai.assert.equal(evaluateXPathToString("@someAttribute='someValue'", element), 'true');
	});

	it('allows namespaces in the shorthand', () => {
		const element = documentNode.createElement('someElement');
		element.setAttributeNS(
			'http://fontoxml.com/ns/',
			'someNamespace:someAttribute',
			'someValue'
		);
		chai.assert.equal(
			evaluateXPathToString('@someNamespace:someAttribute="someValue"', element, null, null, {
				namespaceResolver: () => 'http://fontoxml.com/ns/',
			}),
			'true'
		);
	});

	it('allows a wildcard as attribute name', () => {
		const element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute1', 'someValue1');
		element.setAttribute('someAttribute2', 'someValue2');
		element.setAttribute('someAttribute3', 'someValue3');
		chai.assert.equal(
			evaluateXPathToString('string-join(@*/name(), ",")', element),
			'someAttribute1,someAttribute2,someAttribute3'
		);
	});

	it('allows a kindTest as attribute test', () => {
		const element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute1', 'someValue1');
		element.setAttribute('someAttribute2', 'someValue2');
		element.setAttribute('someAttribute3', 'someValue3');
		chai.assert.equal(
			evaluateXPathToString('string-join(@node()/name(), ",")', element),
			'someAttribute1,someAttribute2,someAttribute3'
		);
	});

	it('sets the context sequence', () => {
		const element = documentNode.createElement('someElement');
		element.setAttribute('b', 'b');
		element.setAttribute('c', 'c');
		element.setAttribute('a', 'a');
		chai.assert.oneOf(evaluateXPathToString('@*[last()]/name()', element), ['a', 'b', 'c']);
	});

	it('does not contain namespace declarations', () => {
		const element = documentNode.createElement('someElement');
		element.setAttributeNS(
			'http://www.w3.org/2000/xmlns/',
			'xmlns:prefix',
			'https://www.example.org'
		);
		element.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns', 'https://www.example.org');
		element.setAttributeNS('https://www.example.org', 'prefix:someAttribute', 'someValue');
		chai.assert.isTrue(evaluateXPathToBoolean('@* => count() eq 1', element));
	});

	it('throws the correct error if context is absent', () => {
		chai.assert.throws(() => evaluateXPathToBoolean('@*', null), 'XPDY0002');
	});

	it('passes buckets', () => {
		const element = documentNode.createElement('someElement');
		const attr = element.setAttribute('xxx', 'yyy');
		const expectedBucket = getBucketForSelector('self::xxx');

		const testDomFacade: IDomFacade = {
			getAllAttributes: (node, bucket: string | null) => {
				chai.assert.equal(bucket, expectedBucket);
				return node.attributes;
			},
			getData: (attribute: Attr) => attribute.value,
		} as any;

		evaluateXPathToString('@xxx', element, testDomFacade);
	});

	it('passes the intersecting bucket', () => {
		const element = documentNode.createElement('someElement');
		const attr = element.setAttribute('xxx', 'yyy');
		const expectedBucket = getBucketForSelector('self::xxx');

		const testDomFacade: IDomFacade = {
			getAllAttributes: (node, bucket: string | null) => {
				chai.assert.equal(bucket, expectedBucket);
				return node.attributes;
			},
			getData: (attribute: Attr) => attribute.value,
		} as any;

		evaluateXPathToString('@*[self::xxx]', element, testDomFacade);
	});
});
