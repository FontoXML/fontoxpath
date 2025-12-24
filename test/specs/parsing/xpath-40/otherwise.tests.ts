import { Language, evaluateXPath, evaluateXPathToString } from 'fontoxpath';
import * as chai from 'chai';
describe('otherwise expression', () => {
	it('is not available under XPath / XQuery 3.1', () => {
		chai.assert.throws(() => {
			evaluateXPathToString('1 otherwise 2');
		}, 'XPST0003');
	});

	it('is available under XPath / XQeruy 4', () => {
		chai.assert.equal(
			evaluateXPathToString('"a" otherwise "b"', null, null, null, {
				language: Language.XPATH_4_0_LANGUAGE,
			}),
			'a',
		);
	});

	it('Chooses the first operand if it has a value', () => {
		chai.assert.equal(
			evaluateXPathToString('string-join(("a", "b") otherwise "c", " ")', null, null, null, {
				language: Language.XPATH_4_0_LANGUAGE,
			}),
			'a b',
		);
	});

	it('Chooses the second operand if the first has no value', () => {
		chai.assert.equal(
			evaluateXPathToString('string-join(() otherwise ("c", "d"), " ")', null, null, null, {
				language: Language.XPATH_4_0_LANGUAGE,
			}),
			'c d',
		);
	});

	it('Chooses the first operand even if it is false()', () => {
		chai.assert.equal(
			evaluateXPathToString(
				'string-join((false()) otherwise ("c", "d"), " ")',
				null,
				null,
				null,
				{
					language: Language.XPATH_4_0_LANGUAGE,
				},
			),
			'false',
		);
	});
});
