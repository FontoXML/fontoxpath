import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import createSelectorFromXPathAsync from 'fontoxml-selectors/parsing/createSelectorFromXPathAsync';
import evaluateXPathToNumber from 'fontoxml-selectors/evaluateXPathToNumber';

describe('createSelectorFromXPathAsync', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = slimdom.createDocument();
	});

	it('can compile a selector asynchronously', () => {
		return createSelectorFromXPathAsync('1 + 1')
			.then(function (selector) {
				// Assume selector to be ok
				chai.expect(
					evaluateXPathToNumber(selector, documentNode, blueprint, {}, evaluateXPathToNumber.NUMBER_TYPE)
				).to.equal(2);
			});
	}).timeout(10000);

	it('can compile a new, unique selector asynchronously', () => {
		const now = Date.now();
		return createSelectorFromXPathAsync(`1 + ${now}`)
			.then(function (selector) {
				// Assume selector to be ok
				chai.assert.equal(evaluateXPathToNumber(selector, documentNode, blueprint), now + 1);
			});
	}).timeout(10000);

	it('can deduplicate async compilation', () => {
		const selectorString = `12345 + ${Date.now()}`;
		const promiseA = createSelectorFromXPathAsync(selectorString);
		const promiseB = createSelectorFromXPathAsync(selectorString);

		chai.assert.equal(promiseA, promiseB);
	});


	it('throws when compilation fails', () => {
		return createSelectorFromXPathAsync(']] Not valid at all! [[')
			.then(function (selector) {
				chai.expect.fail();
			}, function (error) {
				chai.expect(error).to.be.instanceOf(Error);
			});
	}).timeout(10000);
});
