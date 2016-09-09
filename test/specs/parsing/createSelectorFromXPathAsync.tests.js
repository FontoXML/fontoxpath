define([
	'fontoxml-blueprints',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPathAsync',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprints,
	jsonMLMapper,
	slimdom,

	createSelectorFromXPathAsync,
	evaluateXPath
) {
	'use strict';

	var blueprint = new blueprints.ReadOnlyBlueprint();

	describe('createSelectorFromXPathAsync', function () {
		var documentNode;
		beforeEach(function () {
			documentNode = slimdom.createDocument();
		});

		it('can compile a selector asynchronously', function () {
			return createSelectorFromXPathAsync('1 + 1')
				.then(function (selector) {
					// Assume selector to be ok
					chai.expect(
						evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NUMBER_TYPE)
					).to.equal(2);
				});
		});

		it('throws when compilation fails', function () {
			return createSelectorFromXPathAsync(']] Not valid at all! [[')
				.then(function (selector) {
					chai.fail();
				}, function (error) {
					chai.expect(error).to.be.instanceOf(Error);
				});
		});
	});
});
