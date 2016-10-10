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

	describe('NodeTypeSelector', function () {
		it('can select any element -> element()', function () {
			var selector = parseSelector('self::element()');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['someElement']
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
		});

		it('can select any text node -> text()', function () {
			var selector = parseSelector('self::text()');
			jsonMLMapper.parse([
				'someOtherParentElement',
				'Some text'
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
		});

		it('can select any PI -> processing-instruction()', function () {
			var selector = parseSelector('self::processing-instruction()');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['?someElement']
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
		});

		it('can select any comment -> comment()', function () {
			var selector = parseSelector('self::comment()');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['!',
					'some comment'
				]
			], documentNode);
			chai.expect(selector.matches(documentNode.documentElement.firstChild, blueprint)).to.equal(true);
		});
	});
});
