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
	describe('nameTests', function () {
		it('allows nodeNames containing namespaces', function () {
			var element = documentNode.createElement('someNamespace:someElement');
			chai.expect(evaluateXPath('self::someNamespace:someElement', element, blueprint)).to.deep.equal(element);
		});
	});
});
