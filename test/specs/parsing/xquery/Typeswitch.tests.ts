import * as chai from 'chai';

import { evaluateXPath, evaluateXPathToNumber, evaluateXPathToString } from 'fontoxpath';

describe('Typeswitch', () => {
	it('runs typeswitch and returns an integer', () =>
		chai.assert.equal(
			evaluateXPathToNumber(
				`typeswitch((1,2))
				case xs:integer return 1
				case xs:string+ return 42
				case xs:float | xs:string return 27
				case xs:integer* return 2828
				default return 2`,
				null,
				null,
				null,
				{ debug: true, language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			2828
		));

	it('runs typeswitch and returns a string', () =>
		chai.assert.equal(
			evaluateXPathToString(
				`typeswitch(("Hello", "Hi"))
				case xs:integer? return "Hey"
				case xs:string+ return "Good morning"
				case xs:float return "Good afternoon"
				case xs:integer* return "Good evening"
				default return "Bye"`,
				null,
				null,
				null,
				{ debug: true, language: evaluateXPath.XQUERY_3_1_LANGUAGE }
			),
			'Good morning'
		));
});
