define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprint,
	slimdom,

	parseSelector,
	evaluateXPath
) {
	'use strict';

	var documentNode;
	beforeEach(function () {
		documentNode = slimdom.createDocument();
	});

	describe('varRef', function () {
		it('can reference variables', function () {
			var selector = parseSelector('$x');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {'x': 42})
			).to.deep.equal(42);
		});

		it('can reference built-in variables', function () {
			var selector = parseSelector('$theBest');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal('FontoXML is the best!');
		});
	});
});
