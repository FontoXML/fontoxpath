define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPathAsync',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprint,
	slimdom,

	createSelectorFromXPathAsync,
	evaluateXPath
) {
	'use strict';

	describe('createSelectorFromXPathAsync', function () {
		var documentNode;
		beforeEach(function () {
			documentNode = slimdom.createDocument();
		});

		it('can compile a selector asynchronously', function () {
			// When running tests in a CI, setting up the indexedDB can take some time.
			this.timeout(10000);
			return createSelectorFromXPathAsync('1 + 1')
				.then(
					function (selector) {
						// Assume selector to be ok
						chai.expect(
							evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NUMBER_TYPE)
						).to.equal(2);
					},
					function () {
						chai.expect.fail();
					});
		});

		it('throws when compilation fails', function () {
			return createSelectorFromXPathAsync(']] Not valid at all! [[')
				.then(function (selector) {
					chai.expect.fail();
				}, function (error) {
					chai.expect(error).to.be.instanceOf(Error);
				});
		});
	});
});
