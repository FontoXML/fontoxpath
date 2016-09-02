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

	var documentNode,
		someElement,
		someProcessingInstruction;
	beforeEach(function () {
		documentNode = slimdom.createDocument();
		someElement = documentNode.createElement('someElement');
		someProcessingInstruction = documentNode.createProcessingInstruction('someProcessingInstruction');
		documentNode.appendChild(someElement);
		documentNode.appendChild(someProcessingInstruction);
	});

	describe('instance of', function () {
		// node instance of element('someElement')

		it('returns true for a single boolean vs xs:boolean', function () {
			var selector = parseSelector('true() instance of xs:boolean');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});
		it('returns true for a single boolean vs xs:boolean*', function () {
			var selector = parseSelector('true() instance of xs:boolean*');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});
		it('returns true for a single boolean vs xs:boolean+', function () {
			var selector = parseSelector('true() instance of xs:boolean+');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});
		it('returns true for a single boolean vs xs:boolean?', function () {
			var selector = parseSelector('true() instance of xs:boolean?');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('returns false for a single boolean vs xs:string', function () {
			var selector = parseSelector('true() instance of xs:string');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
		it('returns false for a single boolean vs xs:string*', function () {
			var selector = parseSelector('true() instance of xs:string*');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
		it('returns false for a single boolean vs xs:string+', function () {
			var selector = parseSelector('true() instance of xs:string+');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
		it('returns false for a single boolean vs xs:string?', function () {
			var selector = parseSelector('true() instance of xs:string?');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});

		it('returns false for a sequence with multiple booleans vs xs:boolean', function () {
			var selector = parseSelector('(true(), false()) instance of xs:string');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
		it('returns false for a sequence with multiple booleans vs xs:boolean?', function () {
			var selector = parseSelector('(true(), false()) instance of xs:string?');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
		it('returns false for a empty sequence vs xs:boolean+', function () {
			var selector = parseSelector('() instance of xs:string+');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});

		it('returns true for a node vs node()', function () {
			var selector = parseSelector('. instance of node()');
			chai.expect(evaluateXPath(selector, someElement, blueprint)).to.equal(true);
		});
		// it('returns true for a node vs element()', function () {
		// 	var selector = parseSelector('. instance of element()');
		// 	chai.expect(evaluateXPath(selector, someElement, blueprint)).to.equal(true);
		// });
		// it('returns true for a node vs processing-instruction()', function () {
		// 	var selector = parseSelector('. instance of processing-instruction("")');
		// 	chai.expect(evaluateXPath(selector, someProcessingInstruction, blueprint)).to.equal(true);
		// });
	});
});
