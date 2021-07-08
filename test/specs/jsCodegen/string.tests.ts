import * as chai from 'chai';
import { ReturnType } from 'fontoxpath';
import { sanitizeString } from 'fontoxpath/jsCodegen/escapeJavaScriptString';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('string tests', () => {
	let documentNode: slimdom.Document;
	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(['xml', 'Hello'], documentNode);
	});

	it('test simple string expression true', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen('"hello"', documentNode, null, ReturnType.STRING, {}),
			'hello'
		);
	});

	it('test simple string expression false', () => {
		chai.assert.notEqual(
			evaluateXPathWithJsCodegen("'hello!'", documentNode, null, ReturnType.STRING, {}),
			'hello'
		);
	});

	it('test simple string expression with escaping', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen("'he''llo'", documentNode, null, ReturnType.STRING, {}),
			"he'llo"
		);
	});

	it('test sanitize string', () => {
		chai.assert.equal(sanitizeString('hello\\'), 'hello\\\\');
	});

	it('test sanitize string double quote', () => {
		chai.assert.equal(sanitizeString('\'\''), '\\\'\\\'');
	});

	it('test sanitize string triple quote', () => {
		chai.assert.equal(sanitizeString('\'\'\''), '\\\'\\\'\\\'');
	});

	it('test sanitize string double backslash', () => {
		chai.assert.equal(sanitizeString('\\\\'), '\\\\\\\\');
	});

	it('test sanitize string triple backslash', () => {
		chai.assert.equal(sanitizeString('\\\\\\'), '\\\\\\\\\\\\');
	});

	it('test string expression malicous code', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				"''' || console.log(3); //'",
				documentNode,
				null,
				ReturnType.STRING,
				{}
			),
			"' || console.log(3); //"
		);
	});

	it('test xpath string escaping', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				"'child::element()'",
				documentNode,
				null,
				ReturnType.STRING,
				{}
			),
			'child::element()'
		);
	});
});
