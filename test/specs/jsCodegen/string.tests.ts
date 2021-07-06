import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { ReturnType } from 'fontoxpath';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';
import { sanitizeString } from 'fontoxpath/jsCodegen/escapeJavaScriptString';

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

	it('test simple string expression true', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen("'he''llo'", documentNode, null, ReturnType.STRING, {}),
			"he'llo"
		);
	});

	it('test sanitize string', () => {
		chai.assert.equal(sanitizeString('hello\\'), 'hello\\\\');
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
});
