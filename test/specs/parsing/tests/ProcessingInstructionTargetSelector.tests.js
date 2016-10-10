define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath'
], function (
	blueprint,
	jsonMLMapper,
	slimdom,

	parseSelector
) {
	'use strict';

	var documentNode;
	beforeEach(function () {
		documentNode = slimdom.createDocument();
	});

	describe('processing-instruction()', function () {
		it('allows processing instruction targets as literals', function () {
			var selector = parseSelector('self::processing-instruction("someTarget")');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['?someTarget', 'someData']
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
		});

		it('allows processing instruction targets as NCNames', function () {
			var selector = parseSelector('self::processing-instruction(someTarget)');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['?someTarget', 'someData']
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
		});
	});
});
