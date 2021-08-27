import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { ReturnType } from 'fontoxpath';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('paths (js-codegen)', () => {
	let documentNode: slimdom.Document;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(['xml', ['title']], documentNode);
	});

	it('compiles (/)', () => {
		chai.assert.deepEqual(
			evaluateXPathWithJsCodegen('(/)', documentNode, null, ReturnType.NODES),
			[documentNode]
		);
	});

	it('evaluates absolute paths by going "up" to the document node', () => {
		const titleNode = documentNode.firstChild.firstChild;
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen('/xml/title', titleNode, null, ReturnType.BOOLEAN)
		);
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen('/does-not-exist', titleNode, null, ReturnType.BOOLEAN)
		);
	});
});
