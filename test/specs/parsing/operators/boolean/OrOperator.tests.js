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

	describe('or operator', function () {
		it('can parse an "or" selector', function () {
			var selector = parseSelector('false() or true()');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('can parse an "or" selector with different buckets', function () {
			var selector = parseSelector('self::someElement or self::processing-instruction()');
			jsonMLMapper.parse([
				'someParentElement',
				['someElement']
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint)).to.equal(true);
			chai.expect(selector.getBucket()).to.equal(null);
		});

		it('can parse a concatenation of ors', function () {
			var selector = parseSelector('false() or false() or false() or (: Note: the last true() will make te result true:) true()');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('allows not in combination with or', function () {
			var selector = parseSelector('someChildElement or not(someOtherChild)');
			jsonMLMapper.parse([
				'someOtherParentElement',
				['someOtherChildElement']
			], documentNode);
			chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.equal(true);
		});
	});
});
