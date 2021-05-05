import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import evaluateXPathToBoolean from '../../../src/evaluateXPathToBoolean';
import evaluateXPathToNodes from '../../../src/evaluateXPathToNodes';

describe('predicates', () => {
	const document = new slimdom.Document();
	jsonMlMapper.parse(
		[
			'xml',
			{ id: 'yes' },
			['title', 'Tips'],
			['tips', ['tip', 'Make it work'], ['tip', 'Make it right'], ['tip', 'Make it fast']],
		],
		document
	);
	it('compiles path expressions with one predicate', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean('/xml/tips[parent::element()]', document, null, null, {
				backend: 'js-codegen',
			})
		);
		chai.assert.isFalse(
			evaluateXPathToBoolean('/xml/tips/tip/text()[parent::text()]', document, null, null, {
				backend: 'js-codegen',
			})
		);
		chai.assert.isTrue(
			evaluateXPathToBoolean(
				'/xml/tips/tip/text()[parent::element()]',
				document,
				null,
				null,
				{
					backend: 'js-codegen',
				}
			)
		);
	});
	it('compiles path expressions with multiple predicates', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean('/xml/tips[parent::element()][self::element()][child::element(tip)]', document, null, null, {
				backend: 'js-codegen',
			})
		);
		chai.assert.isFalse(
			evaluateXPathToBoolean('/xml/tips/tip/text()[parent::text()][self::element()]', document, null, null, {
				backend: 'js-codegen',
			})
		);
	});
	it('compiles predicates with a combination of "and" and "or" expressions', () => {
		const results = evaluateXPathToNodes(
			'/xml/element()[child::text() and self::element(title) or self::element(tips)]',
			document,
			null,
			null,
			{
				backend: 'js-codegen',
			}
		);
		chai.assert.equal(results.length, 2);
	});
});
