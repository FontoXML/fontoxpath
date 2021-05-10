import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';
import { ReturnType } from 'fontoxpath';

describe('kind tests', () => {
	let documentNode: slimdom.Document;
	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(['xml', 'Hello'], documentNode);
	});

	it('selects text nodes', () => {
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen('/xml/text()', documentNode, null, ReturnType.BOOLEAN)
		);
	});
	it('does not select non-text nodes', () => {
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen('/text()', documentNode, null, ReturnType.BOOLEAN)
		);
	});
});
