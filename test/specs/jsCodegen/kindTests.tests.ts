import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import evaluateXPathToBoolean from '../../../src/evaluateXPathToBoolean';

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

describe('kind tests', () => {
	it('does not select non-text nodes', () => {
		chai.assert.isFalse(
			evaluateXPathToBoolean('/text()', document, null, null, {
				backend: 'js-codegen',
			})
		);
	});
});
