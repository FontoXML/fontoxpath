import * as chai from 'chai';

import { evaluateXPath, evaluateXPathToNumber } from 'fontoxpath';

describe('Switch', () => {
	it('works', () =>
		chai.assert.equal(
			evaluateXPathToNumber(
				`
switch (1)
case 1 return 1
default return 0`,

				null,
				null,
				null,
				{
					debug: true,
					language: evaluateXPath.XQUERY_3_1_LANGUAGE,
				},
			),
			1,
		));

	it('works hitting the default case', () =>
		chai.assert.equal(
			evaluateXPathToNumber(
				`
switch (0)
case 1 return 1
default return 0`,

				null,
				null,
				null,
				{
					debug: true,
					language: evaluateXPath.XQUERY_3_1_LANGUAGE,
				},
			),
			0,
		));

	it('works hitting the empty sequence case', () =>
		chai.assert.equal(
			evaluateXPathToNumber(
				`
switch (())
case () return 1
default return 0`,

				null,
				null,
				null,
				{
					debug: true,
					language: evaluateXPath.XQUERY_3_1_LANGUAGE,
				},
			),
			1,
		));

	it('works hitting the empty sequence case as a default', () =>
		chai.assert.equal(
			evaluateXPathToNumber(
				`
switch (())
case 1 return 1
default return 0`,

				null,
				null,
				null,
				{
					debug: true,
					language: evaluateXPath.XQUERY_3_1_LANGUAGE,
				},
			),
			0,
		));

	it('works hitting overload cases', () =>
		chai.assert.equal(
			evaluateXPathToNumber(
				`
switch (1)
case ()
case 1 return 1

default return 0`,

				null,
				null,
				null,
				{
					debug: true,
					language: evaluateXPath.XQUERY_3_1_LANGUAGE,
				},
			),
			1,
		));
});
