import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import evaluateXPathToBoolean from '../../../src/evaluateXPathToBoolean';
import evaluateXPathToNodes from '../../../src/evaluateXPathToNodes';
import evaluateXPathToFirstNode from '../../../src/evaluateXPathToFirstNode';

describe('operators', () => {
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
	it('compiles "or" when used as a base expression', () => {
		const xmlNode: slimdom.Node = document.firstChild;
		chai.assert.isTrue(
			evaluateXPathToBoolean('self::p or self::xml', xmlNode, null, null, {
				backend: 'js-codegen',
			})
		);
	});
	it('compiles "and" when used as a base expression', () => {
		const xmlNode: slimdom.Node = document.firstChild;
		chai.assert.isTrue(
			evaluateXPathToBoolean('self::xml and child::element(tips)', xmlNode, null, null, {
				backend: 'js-codegen',
			})
		);
	});
});
