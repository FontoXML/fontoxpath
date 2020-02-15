import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateXPath, evaluateXPathToBoolean, evaluateXPathToFirstNode } from 'fontoxpath';
import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('ElementConstructor', () => {
	it('can create an element', () => {
		chai.assert.equal(
			evaluateXPathToFirstNode(
				'<element/>',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			).nodeType,
			1
		);
	});
	it('Sets the correct name', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'<element/> => name() = "element"',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});
	it('Sets attributes', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'(<element attr="value"/>)/@attr = "value"',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});
	it('May use inner expressions', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'(<element attr="{"value"}"/>)/@attr = "value"',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});
	it('Joins inner expressions using spaces', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'(<element attr="{(1,2,3)}"/>)/@attr = "1 2 3"',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});
	it('Allows creating namespaced elements', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'(<xxx:element xmlns:xxx="XXX"/>)',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});
	it('Allows creating elements with no namespace', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'(<element xmlns=""/>)/self::Q{}element',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});
	it('Allows creating namespaced elements with attributes', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'some $attr in <element xmlns="XXX" attr="0"/>/@* satisfies node-name($attr) => prefix-from-QName() => empty()',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});
	it('Allows creating namespaced elements without prefixes', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'<element xmlns="XXX"/> => node-name() => prefix-from-QName() => empty()',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});
	it('Allows mixing inner expressions and direct attributes', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'(<element attr="1 2 3 {(4,5,6)} 7 8 9"/>)/@attr = "1 2 3 4 5 6 7 8 9"',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});

	it('Trims boundary spaces', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'<a> {"A A A"} <a> B B B </a>  {"A A A"}  </a>/string() = "A A A B B B A A A"',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});

	it('Parses character references with decimal points', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'<a>&#32;</a>/string() = " "',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});
	it('Parses character references with hexadecimal points', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'<a>&#x20;</a>/string() = " "',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});

	it('correctly handles multiple textNodes', () => {
		chai.assert.equal(
			evaluateXPathToFirstNode<slimdom.Element>(
				'<e>{1}A{1}</e>',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			).outerHTML,
			'<e>1A1</e>'
		);
	});

	it('correctly handles arrays', () => {
		chai.assert.equal(
			evaluateXPathToFirstNode<slimdom.Element>(
				'<e>{[1,["a", 2], 3]}</e>',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			).outerHTML,
			'<e>1 a 2 3</e>'
		);
	});

	it('correctly handles arrays with elements', () => {
		chai.assert.equal(
			evaluateXPathToFirstNode<slimdom.Element>(
				'<e>{[<a/>, <b/>, <c/>]}</e>',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			).outerHTML,
			'<e><a/><b/><c/></e>'
		);
	});

	it('accepts CDataSections', () => {
		chai.assert.equal(
			evaluateXPathToFirstNode<slimdom.Element>(
				'<e><![CDATA[Some CDATA]]></e>',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			).outerHTML,
			'<e>Some CDATA</e>'
		);
	});

	it('accepts CDataSections with newlines', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'<e><![CDATA[\n]]></e> eq "&#xA;"',
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			)
		);
	});
	it('can create an element with asynchronous', async () => {
		const element = await evaluateXPathToAsyncSingleton(
			`
		declare namespace fontoxpath="http://fontoxml.com/fontoxpath";
		element {fontoxpath:sleep("elem", 100)} {fontoxpath:sleep("content", 100)}`,
			documentNode,
			undefined,
			{},
			{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
		);

		chai.assert.equal(element.nodeType, 1);
		chai.assert.equal(element.localName, 'elem');
		chai.assert.equal(element.firstChild.data, 'content');
	});
});
