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

	describe('let', function () {
		it('creates a variable reference', function () {
			var selector = parseSelector('let $x := 1 return $x');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(1);
		});

		it('can be used in a function', function () {
			var selector = parseSelector('boolean(let $x := 1 return $x)');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(true);
		});

		it('can be chained', function () {
			var selector = parseSelector('let $x := 1, $y := 2 return $x * $y');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(2);
		});

		it('chains in the correct order', function () {
			var selector = parseSelector('let $x := 1, $y := 2, $x := 3 return $x (: If the order would be inverse, $x would still be 1 :)');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(3);
		});
	});
});
