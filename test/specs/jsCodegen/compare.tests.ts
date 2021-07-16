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
		jsonMlMapper.parse(['xml', 'Hello'], documentNode);
	});

	it('test simple valueCompare expression true', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'"hello" eq "hello"',
				documentNode,
				null,
				ReturnType.BOOLEAN,
				{}
			),
			true
		);
	});

	it('test simple valueCompare expression false', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				'"hello" eq "hallo"',
				documentNode,
				null,
				ReturnType.BOOLEAN,
				{}
			),
			false
		);
	});

	it('test simple valueCompare expression empty strings', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen('"" eq ""', documentNode, null, ReturnType.BOOLEAN, {}),
			true
		);
	});

	it('test simple valueCompare expression not eq', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				"'not' ne 'equal'",
				documentNode,
				null,
				ReturnType.BOOLEAN,
				{}
			),
			true
		);
	});

	it('qt3test: K-Literals-1', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen(
				"'fo''o' eq 'fo''o'",
				documentNode,
				null,
				ReturnType.BOOLEAN,
				{}
			),
			true
		);
	});

	it('use generalcompare with character refrence', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen('"&#45;" = "-"', documentNode, null, ReturnType.BOOLEAN, {
				language: Language.XQUERY_3_1_LANGUAGE,
			}),
			true
		);
	});
});
