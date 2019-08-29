import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateXPath, evaluateXPathToString } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe.only('FLWOR', () => {
	it('runs basic flwor expression', () =>
		chai.assert.equal(
			evaluateXPathToString(
				`for $i in (0,1,2)
				let $e := 'Hello'
				return $e`,
				null,
				null,
				null,
				{ debug: true, language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			'Hello Hello Hello'
		));

	it('runs flwor with where', () =>
		chai.assert.equal(
			evaluateXPathToString(
				`for $i in (0,1,2)
			where $i = 1
			let $e := 'Hello'
			return $e`,
				null,
				null,
				null,
				{ debug: true, language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			'Hello'
		));
});
