import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import createSelectorFromXPathAsync from 'fontoxml-selectors/parsing/createSelectorFromXPathAsync';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';

describe('createSelectorFromXPathAsync', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = slimdom.createDocument();
	});

	it('can compile a selector asynchronously', () => {
		return createSelectorFromXPathAsync('1 + 1')
			.then(
				function (selector) {
					// Assume selector to be ok
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NUMBER_TYPE)
					).to.equal(2);
				},
				() => {
					chai.expect.fail();
				});
	}).timeout(10000);

	it('throws when compilation fails', () => {
		return createSelectorFromXPathAsync(']] Not valid at all! [[')
			.then(function (selector) {
				chai.expect.fail();
			}, function (error) {
				chai.expect(error).to.be.instanceOf(Error);
			});
	}).timeout(10000);
});
