import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import { ReturnType } from 'fontoxpath';
import evaluateXPathWithJsCodegen from './evaluateXPathWithJsCodegen';

describe('predicates', () => {
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

	it('compiles path expressions with one predicate', () => {
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen(
				'/xml/tips[parent::element()]',
				documentNode,
				null,
				ReturnType.BOOLEAN,
			),
		);
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen(
				'/xml/tips/tip/text()[parent::text()]',
				documentNode,
				null,
				ReturnType.BOOLEAN,
			),
		);
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen(
				'/xml/tips/tip/text()[parent::element()]',
				documentNode,
				null,
				ReturnType.BOOLEAN,
			),
		);
	});

	it('compiles path expressions with multiple predicates', () => {
		chai.assert.isTrue(
			evaluateXPathWithJsCodegen(
				'/xml/tips[parent::element()][self::element()][child::element(tip)]',
				documentNode,
				null,
				ReturnType.BOOLEAN,
			),
		);
		chai.assert.isFalse(
			evaluateXPathWithJsCodegen(
				'/xml/tips/tip/text()[parent::text()][self::element()]',
				documentNode,
				null,
				ReturnType.BOOLEAN,
			),
		);
	});

	it('compiles predicates with a combination of "and" and "or" expressions', () => {
		const results = evaluateXPathWithJsCodegen(
			'/xml/element()[child::text() and self::element(title) or self::element(tips)]',
			documentNode,
			null,
			ReturnType.NODES,
		);
		chai.assert.equal(results.length, 2);
	});

	it('can apply predicates to a filterExpr', () => {
		const results = evaluateXPathWithJsCodegen('.[xml]', documentNode, null, ReturnType.NODES);
		chai.assert.equal(results.length, 1);

		const results2 = evaluateXPathWithJsCodegen('.[bla]', documentNode, null, ReturnType.NODES);
		chai.assert.equal(results2.length, 0);
	});
});
