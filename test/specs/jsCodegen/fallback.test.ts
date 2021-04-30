import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateXPath, evaluateXPathToString } from 'fontoxpath';

describe('fallback', () => {
	const documentNode = new slimdom.Document();
	it('js-codegen backend falls back on the expression backend when "auto" is set as backend', () => {
		chai.assert.equal(
			evaluateXPathToString('text {"Hello"}', documentNode, null, null, {
				backend: 'auto',
				language: evaluateXPath.XQUERY_3_1_LANGUAGE,
			}),
			'Hello'
		);
	});
});
