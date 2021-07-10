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

	it('test simple integer expression', () => {
		chai.assert.equal(
			evaluateXPathWithJsCodegen('3', documentNode, null, ReturnType.NUMBER, {}),
			3
		);
	});
});
