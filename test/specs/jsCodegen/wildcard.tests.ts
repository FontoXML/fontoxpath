import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import evaluateXPathToBoolean from '../../../src/evaluateXPathToBoolean';
import evaluateXPathToNodes from '../../../src/evaluateXPathToNodes';

describe('wildcard', () => {
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
	it('selects elements (allows all namespaces)', () => {
		const results = evaluateXPathToNodes('/xml/*', document, null, null, {
			backend: 'js-codegen',
		});
		chai.assert.equal(results.length, 2);
	});
	it('does not select text elements', () => {
		chai.assert.isFalse(
			evaluateXPathToBoolean('/xml/tips/tip/*', document, null, null, {
				backend: 'js-codegen',
			})
		);
	});
});
