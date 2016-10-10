define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/evaluateXPath',
	'fontoxml-selectors/evaluateXPathToBoolean'
], function (
	blueprint,
	jsonMLMapper,
	slimdom,

	parseSelector,
	evaluateXPath,
	evaluateXPathToBoolean
) {
	'use strict';

	var documentNode;
	beforeEach(function () {
		documentNode = slimdom.createDocument();
	});
	describe('nameTests', function () {
		it('allows wildcards', function () {
			var element = documentNode.createElement('someElement');
			chai.expect(evaluateXPathToBoolean('self::*', element, blueprint)).to.equal(true);
		});

		it('allows nodeNames containing namespaces', function () {
			var element = documentNode.createElement('someNamespace:someElement');
			chai.expect(evaluateXPath('self::someNamespace:someElement', element, blueprint)).to.deep.equal(element);
		});
	});
});
