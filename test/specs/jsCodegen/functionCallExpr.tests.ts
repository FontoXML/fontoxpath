import * as chai from 'chai';
import { Language, ReturnType } from 'fontoxpath';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';
import escapeJavaScriptString from '../../../src/jsCodegen/escapeJavaScriptString';
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

	//functions below are not supported yet

	//because the sanitizing of the string messes with this.
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

	// folowing functions still fail

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
});
