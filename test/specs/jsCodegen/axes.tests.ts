import * as chai from 'chai';
import * as slimdom from 'slimdom';

import jsonMlMapper from 'test-helpers/jsonMlMapper';

import evaluateXPathToBoolean from '../../../src/evaluateXPathToBoolean';

describe('axes (js-codegen)', () => {
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
	it('compiles the self axis', () => {
		const xmlNode: slimdom.Node = document.firstChild;
		chai.assert.isTrue(
			evaluateXPathToBoolean('self::xml', xmlNode, null, null, {
				backend: 'js-codegen',
			})
		);
		chai.assert.isFalse(
			evaluateXPathToBoolean('self::p', xmlNode, null, null, {
				backend: 'js-codegen',
			})
		);
	});
	it('compiles the attribute axis', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean('/xml/@id', document, null, null, {
				backend: 'js-codegen',
			})
		);
	});
	it('compiles the parent axis', () => {
		chai.assert.isTrue(
			evaluateXPathToBoolean('/xml/tips/parent::element(xml)', document, null, null, {
				backend: 'js-codegen',
			})
		);
	});
});
