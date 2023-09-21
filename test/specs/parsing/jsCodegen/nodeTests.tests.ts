import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { ReturnType } from 'fontoxpath';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('node tests', () => {
	let documentNode: slimdom.Document;
	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(['xml', 'Hello', ['!', 'comment']], documentNode);
	});

	it('selects any nodes', () => {
		const textNode = documentNode.documentElement.firstChild;
		const comment = documentNode.documentElement.lastChild;
		chai.assert.sameOrderedMembers(
			evaluateXPathWithJsCodegen('/xml/node()', documentNode, null, ReturnType.NODES),
			[textNode, comment],
		);
	});

	it('selects text nodes', () => {
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen('/xml/text()', documentNode, null, ReturnType.BOOLEAN),
		);
		// text() should also match CDATA sections
		const cdata = documentNode.createCDATASection('hello');
		documentNode.documentElement.replaceChildren(cdata);
		chai.assert.equal(
			evaluateXPathWithJsCodegen('/xml/text()', documentNode, null, ReturnType.FIRST_NODE),
			cdata,
		);
	});

	it('does not select non-text nodes', () => {
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen('/text()', documentNode, null, ReturnType.BOOLEAN),
		);
	});

	it('compiles name test containing namespace URIs', () => {
		documentNode = new slimdom.Document();
		const element = documentNode.createElementNS('http://fontoxml.com/ns/', 'someElement');
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'self::Q{http://fontoxml.com/ns/}someElement',
				element,
				null,
				ReturnType.FIRST_NODE,
			),
			element,
		);
	});

	it('compiles name test containing namespace URIs for the null namespace for elements', () => {
		documentNode = new slimdom.Document();
		const element = documentNode.createElementNS('', 'someElement');
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'self::Q{}someElement',
				element,
				null,
				ReturnType.FIRST_NODE,
			),
			element,
		);
	});

	it('compiles name test containing namespace URIs for the null namespace for attributes', () => {
		documentNode = new slimdom.Document();
		const element = documentNode.createElement('someElement');
		element.setAttribute('attr', 'value');
		chai.assert.equal(
			evaluateXPathWithJsCodegen('@Q{}attr', element, null, ReturnType.FIRST_NODE),
			element.getAttributeNode('attr'),
		);
	});

	it('resolves prefixes to namespace URIs', () => {
		documentNode = new slimdom.Document();
		const namespace = 'http://fontoxml.com/ns/';
		const element = documentNode.createElementNS(namespace, 'someElement');
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'self::fonto:someElement',
				element,
				null,
				ReturnType.FIRST_NODE,
				{
					namespaceResolver: (prefix) => {
						if (prefix === 'fonto') {
							return namespace;
						}
						return '';
					},
				},
			),
			element,
		);
	});

	it('resolves prefixes to namespace URIs', () => {
		documentNode = new slimdom.Document();
		const namespace = 'http://fontoxml.com/ns/';
		const element = documentNode.createElementNS(namespace, 'someElement');
		chai.assert.equal(
			evaluateXPathWithJsCodegen('self::fonto:*', element, null, ReturnType.FIRST_NODE, {
				namespaceResolver: (prefix) => {
					if (prefix === 'fonto') {
						return namespace;
					}
					return '';
				},
			}),
			element,
		);
	});

	it('compiles the * prefix', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen('/*:xml', documentNode, null, ReturnType.FIRST_NODE),
			documentNode.firstChild,
		);
	});

	it('handles detached nodes without a parent', () => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(['row'], documentNode);
		const row = documentNode.firstChild;
		row.parentNode = null;
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen(
				'self::Q{}row[parent::Q{}thead]',
				row,
				null,
				ReturnType.BOOLEAN,
			),
		);
	});
});
