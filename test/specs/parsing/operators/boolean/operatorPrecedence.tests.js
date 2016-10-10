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

	describe('operators', function () {
		it('uses correct operator precedence', function () {
			var selector = parseSelector('(child::someElement and ancestor::someParentElement) or @someAttribute=\'someValue\'');
			jsonMLMapper.parse([
				'someParentElement',
				[
					'someMiddleElement',
					{ 'someAttribute': 'someValue' },
					['someOtherElement']
				]
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint)).to.equal(true);
			// The other way around
			selector = parseSelector('(child::someOtherElement and ancestor::someParentElement) or @someAttribute=\'someOtherValue\'');
			chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint)).to.equal(true);
			// Changes to testcase A: Operator order changed because of parentheses
			selector = parseSelector('child::someElement and (ancestor::someParentElement or @someAttribute="someValue")');
			chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint)).to.equal(false);
		});
	});
});
