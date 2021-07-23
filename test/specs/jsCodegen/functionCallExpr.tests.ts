import * as chai from 'chai';
import { Language, ReturnType } from 'fontoxpath';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';
import escapeJavaScriptString from '../../../src/jsCodegen/escapeJavaScriptString';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('string tests', () => {
	let documentNode: slimdom.Document;

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
	});
	it('simple functionCall: not', () => {
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen('not("yes" or "no")', null, null, ReturnType.BOOLEAN)
		);
	});

	it('simple functionCall: boolean', () => {
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen(
				'boolean(/xml) and self::element(xml)',
				documentNode,
				null,
				ReturnType.BOOLEAN
			)
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
				documentNode,
				null,
				ReturnType.STRING
			),
			'http://www.example.com/~b%C3%A9b%C3%A9'
		);
	});

	it.only('simple functionCall: boolean', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'not(string(/works/@id) eq "abc")',
				documentNode,
				null,
				ReturnType.BOOLEAN
			),
			''
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

	//because some functions like this one cannot be converted from typescript to javascript with a simple tostring call
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
