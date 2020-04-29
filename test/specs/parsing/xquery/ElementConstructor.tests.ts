import * as chai from 'chai';
import * as slimdom from 'slimdom';

import {
	evaluateXPath,
	evaluateXPathToBoolean,
	evaluateXPathToFirstNode,
	evaluateXPathToString,
	evaluateXPathToArray,
} from 'fontoxpath';
import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

describe('ElementConstructor', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = new slimdom.Document();
	});

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

	it('correctly handles nested elements', () => {
		chai.assert.equal(
			evaluateXPathToFirstNode<slimdom.Element>(
				`<e>
					<!-- my comment -->
					<d attr="v-a-l-u-e">
						<c>
							<?PITarget PIContent?>
							<b>
								<a>hey text node!</a>
							</b>
						</c>
					</d>
				</e>`,
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			).outerHTML,
			`<e><!-- my comment --><d attr="v-a-l-u-e"><c><?PITarget PIContent?><b><a>hey text node!</a></b></c></d></e>`
		);
	});

	it('clones nodes when it is needed', () => {
		const a = documentNode.createElement('a');
		const b = documentNode.createElement('b');
		a.appendChild(b);
		documentNode.appendChild(a);

		chai.assert.isFalse(
			evaluateXPathToBoolean(
				`let $bb := a/b[1]
				return <c>{$bb}</c>/b[1] is a/b[1]`,
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			'clone node b.'
		);

		chai.assert.isTrue(
			evaluateXPathToBoolean(
				`let $bb := a/b[1]
				return $bb is a/b[1]`,
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			'does not clone node b.'
		);

		chai.assert.isTrue(
			evaluateXPathToBoolean(
				`. is ./parent::*/child::*[1]`,
				b,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			'The node b is the first child of its parent.'
		);

		chai.assert.isTrue(
			evaluateXPathToBoolean(
				`let $aa := a, $bb := a/b[1], $x := <x>{$aa}{$bb}</x>
				return $x/a/parent::* is $x/b/parent::*`,
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			'create all dom only once.'
		);

		chai.assert.equal(
			evaluateXPathToFirstNode<slimdom.Attr>(
				`<c attr="value"/>/attribute::*`,
				documentNode,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			).value,
			'value',
			'clone attribute.'
		);
	});

	it('generates a dom tree only once', () => {
		const a = documentNode.createElement('a');
		documentNode.appendChild(a);

		const nodes = evaluateXPathToArray(
			`
		let $clone := .,
		$c := <a>{$clone}</a>/* return [$c, $c/parent::*]
		`,
			a,
			null,
			null,
			{
				language: evaluateXPath.XQUERY_3_1_LANGUAGE,
			}
		);

		chai.assert.equal(nodes[0].parentNode, nodes[1]);
	});

	it('returns data of the node', () => {
		const title = documentNode.createElement('title');
		const textNode = documentNode.createTextNode('Hello World!');
		title.appendChild(textNode);
		documentNode.appendChild(title);

		chai.assert.equal(
			evaluateXPathToString(
				`string(.)`,
				title,
				undefined,
				{},
				{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			'Hello World!',
			'Returns "Hello World!"'
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
