import * as chai from 'chai';
import { evaluateXPathToString, ReturnType } from 'fontoxpath';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('string tests', () => {
	let documentNode: slimdom.Document;
	let worksDocument: slimdom.Document;
	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(
			[
				'xml',
				{ id: 'yes' },
				['title', 'Tips'],
				[
					'tips',
					['tip', 'Make it work'],
					['tip', 'Make it right'],
					['tip', 'Make it fast'],
				],
			],
			documentNode
		);

		worksDocument = new slimdom.Document();
		jsonMlMapper.parse(
			[
				'xml',
				['title', 'employee'],
				['props', ['empnum', 'E1'], ['pnum', 'P1'], ['hours', '40']],
			],
			worksDocument
		);
	});

	it('simple functionCall: boolean', () => {
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen('boolean(/xml)', documentNode, null, ReturnType.BOOLEAN)
		);
	});

	it('Axes048-2', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen('fn:count(/xml)', documentNode, null, ReturnType.ANY),
			1
		);
	});

	it('complex functionCall: not and boolean', () => {
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen('not(boolean("yes" or "no"))', null, null, ReturnType.ANY)
		);
	});

	it('simple functionCall: boolean', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'fn:iri-to-uri ("http://www.example.com/~bébé")',
				null,
				null,
				ReturnType.STRING
			),
			'http://www.example.com/~b%C3%A9b%C3%A9'
		);
	});

	it('simple functionCall: value-comp-eq-string-10', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen('not("abc" eq "three")', documentNode, null, ReturnType.ANY),
			true
		);
	});

	it('functx-fn-string-to-codepoints-1', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				"(string-to-codepoints('abc'))",
				documentNode,
				null,
				ReturnType.STRING
			),
			'97 98 99'
		);
	});

	it('K-ABSFunc-6', () => {
		chai.assert.throws(
			() => {
				evaluateXPathWithJsCodegen(
					"abs('a string')",
					documentNode,
					null,
					ReturnType.NUMBER
				);
			},
			'*' ? /.*/ : new RegExp('XPTY0004')
		);
	});

	it('value-comp-eq-string-12', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'not(works/@id eq "abc")',
				documentNode,
				null,
				ReturnType.BOOLEAN
			),
			true
		);
	});

	it('Axes048-2', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen('fn:count(/far-north)', documentNode, null, ReturnType.ANY),
			0
		);
	});

	it('value-comp-ne-string-12', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen('fn:exists("")', documentNode, null, ReturnType.BOOLEAN),
			true
		);
	});

	it('functx-fn-string-to-codepoints-1', () => {
		chai.assert.deepEqual(
			evaluateXPathWithJsCodegen('head(/works/bccemruu)', documentNode, null, ReturnType.ANY),
			[]
		);
	});

	it('K-StringToCodepointFunc-7', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'empty(string-to-codepoints(""))',
				documentNode,
				null,
				ReturnType.BOOLEAN
			),
			true
		);
	});

	it('pi test', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen('math:pi()', documentNode, null, ReturnType.ANY),
			Math.PI
		);
	});

	it('simple functionCall: time from string', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'fn:avg(fn:string-to-codepoints("A String"))',
				documentNode,
				null,
				ReturnType.ANY
			),
			91
		);
	});

	it('simple functionCall: time from string', () => {
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen(
				'fn:ends-with("hello", "o")',
				documentNode,
				null,
				ReturnType.BOOLEAN
			)
		);
	});

	it('surrogates04a', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'translate("abc&#x1D156;def", "&#x1D156;", "#")',
				documentNode,
				null,
				ReturnType.ANY
			),
			'abc#def'
		);
	});

	it('functx-fn-QName-3', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				"(QName('', 'product'))",
				documentNode,
				null,
				ReturnType.STRING
			),
			'product'
		);
	});

	it('fn-substring-after-3', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				"substring-after('query', 'r')",
				documentNode,
				null,
				ReturnType.ANY
			),
			'y'
		);
	});

	// functions below are not supported yet

	// because the sanitizing of the string messes with this.
	it.skip('simple functionCall: parseJSON', () => {
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen(
				'parse-json(\'{"x":"\\", "y":"\u0025"}\')',
				documentNode,
				null,
				ReturnType.BOOLEAN
			)
		);
	});

	// because some builtinFunctions take other parameters like executionparameters, we haven't supported those yet
	it.skip('simple functionCall: time from string', () => {
		chai.assert(
			evaluateXPathWithJsCodegen(
				'fn:seconds-from-time(xs:time("13:20:10.5"))',
				documentNode,
				null,
				ReturnType.ANY
			)
		);
	});

	it.skip('functx-fn-QName-3', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'map:remove(map:entry("a", "1"), "b")',
				documentNode,
				null,
				ReturnType.ANY
			),
			''
		);
	});

	it.only('functx-fn-QName-3', () => {
		chai.assert.throws(() =>
			evaluateXPathWithJsCodegen(
				'"a string is ok" and QName("", "local")',
				documentNode,
				null,
				ReturnType.ANY
			)
		);
	});
});
