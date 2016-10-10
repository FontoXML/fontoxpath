define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprint,
	jsonMLMapper,
	slimdom,

	parseSelector,
	evaluateXPath
) {
	'use strict';

	var documentNode;
	beforeEach(function () {
		documentNode = slimdom.createDocument();
	});

	describe('sequence', function () {
		it('creates a sequence', function () {
			var selector = parseSelector('(1,2,3)');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([1,2,3]);
		});

		it('creates an empty sequence', function () {
			var selector = parseSelector('()');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([]);
		});

		it('normalizes sequences', function () {
			var selector = parseSelector('(1,2,(3,4))');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([1,2,3,4]);
		});
	});

	describe('range', function () {
		it('creates a sequence', function () {
			var selector = parseSelector('1 to 10');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([1,2,3,4,5,6,7,8,9,10]);
		});
	});
});
