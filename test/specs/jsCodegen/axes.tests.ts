import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { ReturnType } from 'fontoxpath';
import evaluateXPathWithCodegen from './evaluateXPathWithJsCodegen';

describe('axes (js-codegen)', () => {
	let documentNode: slimdom.Document;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(
			[
				'xml',
				{ id: 'yes' },
				['title', 'Tips'],
				['tips', ['tip', 'Make it work'], ['tip', 'Make it right'], ['tip', 'Make it fast']],
			],
			documentNode
		);
	});

	it('compiles the self axis', () => {
		const xmlNode: slimdom.Node = documentNode.firstChild;
		chai.assert.equal(
			evaluateXPathWithCodegen('self::xml', xmlNode, null, ReturnType.FIRST_NODE),
			xmlNode
		);
		chai.assert.isFalse(evaluateXPathWithCodegen('self::p', xmlNode, null, ReturnType.BOOLEAN));
	});

	it('compiles the attribute axis', () => {
		chai.assert.isTrue(
			evaluateXPathWithCodegen('/xml/@id', documentNode, null, ReturnType.BOOLEAN)
		);
	});

	it('compiles the parent axis', () => {
		chai.assert.isTrue(
			evaluateXPathWithCodegen(
				'/xml/tips/parent::element(xml)',
				documentNode,
				null,
				ReturnType.BOOLEAN
			)
		);
	});
});
