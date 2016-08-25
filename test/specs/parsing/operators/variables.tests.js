define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/addXPathCustomTest',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprint,
	jsonMLMapper,
	slimdom,

	parseSelector,
	addXPathCustomTest,
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
