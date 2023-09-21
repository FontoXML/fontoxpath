import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { ReturnType } from 'fontoxpath';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('wildcard', () => {
	let documentNode: slimdom.Document;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(
			[
				'xml',
				['title', 'Tips'],
				[
					'tips',
					['tip', 'Make it work'],
					['tip', 'Make it right'],
					['tip', 'Make it fast'],
				],
			],
			documentNode,
		);
	});

	it('selects elements (non-specified namespace)', () => {
		const results = evaluateXPathWithJsCodegen('/xml/*', documentNode, null, ReturnType.NODES);

		chai.assert.equal(results.length, 2);
	});

	it('does not select text elements', () => {
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen('/xml/tips/tip/*', documentNode, null, ReturnType.BOOLEAN),
		);
	});
});
