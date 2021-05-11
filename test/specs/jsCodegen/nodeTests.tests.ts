import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { ReturnType } from 'fontoxpath';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

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

	it('compiles name test containing namespace URIs', () => {
		documentNode = new slimdom.Document();
		const element = documentNode.createElementNS('http://fontoxml.com/ns/', 'someElement');
		chai.assert.equal(
			evaluateXPathWithJsCodegen('self::Q{http://fontoxml.com/ns/}someElement', element, null, ReturnType.FIRST_NODE),
			element
		);
	});
});
