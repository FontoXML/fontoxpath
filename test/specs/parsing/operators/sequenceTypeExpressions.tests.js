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
		someProcessingInstruction,
		someTextNode,
		someComment;
	beforeEach(function () {
		documentNode = slimdom.createDocument();
		someElement = documentNode.createElement('someElement');
		someProcessingInstruction = documentNode.createProcessingInstruction('someProcessingInstruction');
		someTextNode = documentNode.createTextNode('Text!');
		someComment = documentNode.createComment('comment content');
		documentNode.appendChild(someElement);
		documentNode.appendChild(someProcessingInstruction);
		documentNode.appendChild(someTextNode);
		documentNode.appendChild(someComment);
	});

	describe('instance of', function () {
		// node instance of element('someElement')

		it('returns true for a single boolean instance of xs:boolean', function () {
			var selector = parseSelector('true() instance of xs:boolean');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});
		it('returns true for a single boolean instance of xs:boolean*', function () {
			var selector = parseSelector('true() instance of xs:boolean*');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});
		it('returns true for a single boolean instance of xs:boolean+', function () {
			var selector = parseSelector('true() instance of xs:boolean+');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});
		it('returns true for a single boolean instance of xs:boolean?', function () {
			var selector = parseSelector('true() instance of xs:boolean?');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
		});

		it('returns false for a single boolean instance of xs:string', function () {
			var selector = parseSelector('true() instance of xs:string');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
		it('returns false for a single boolean instance of xs:string*', function () {
			var selector = parseSelector('true() instance of xs:string*');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
		it('returns false for a single boolean instance of xs:string+', function () {
			var selector = parseSelector('true() instance of xs:string+');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
		it('returns false for a single boolean instance of xs:string?', function () {
			var selector = parseSelector('true() instance of xs:string?');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});

		it('returns false for a sequence with multiple booleans instance of xs:boolean', function () {
			var selector = parseSelector('(true(), false()) instance of xs:string');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
		it('returns false for a sequence with multiple booleans instance of xs:boolean?', function () {
			var selector = parseSelector('(true(), false()) instance of xs:string?');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});
		it('returns false for an empty sequence instance of xs:boolean+', function () {
			var selector = parseSelector('() instance of xs:string+');
			chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
		});

		it('returns true for a node instance of node()', function () {
			var selector = parseSelector('. instance of node()');
			chai.expect(evaluateXPath(selector, someElement, blueprint)).to.equal(true);
		});
		it('returns true for an element instance of element()', function () {
			var selector = parseSelector('. instance of element()');
			chai.expect(evaluateXPath(selector, someElement, blueprint)).to.equal(true);
		});
		it('returns true for a processing instruction instance of processing-instruction()', function () {
			var selector = parseSelector('. instance of processing-instruction()');
			chai.expect(evaluateXPath(selector, someProcessingInstruction, blueprint)).to.equal(true);
		});
		it('returns true for a text node instance of text()', function () {
			var selector = parseSelector('. instance of text()');
			chai.expect(evaluateXPath(selector, someTextNode, blueprint)).to.equal(true);
		});
		it('returns true for a comment instance of comment()', function () {
			var selector = parseSelector('. instance of comment()');
			chai.expect(evaluateXPath(selector, someComment, blueprint)).to.equal(true);
		});

		it('returns true for an element instance of element(someElement)', function () {
			var selector = parseSelector('. instance of element(someElement)');
			chai.expect(evaluateXPath(selector, someElement, blueprint)).to.equal(true);
		});
		it('returns false for an element instance of element(notSomeElement)', function () {
			var selector = parseSelector('. instance of element(notSomeElement)');
			chai.expect(evaluateXPath(selector, someElement, blueprint)).to.equal(false);
		});

		it('returns true for a processing instruction instance of processing-instruction(someProcessingInstruction)', function () {
			var selector = parseSelector('. instance of processing-instruction(someProcessingInstruction)');
			chai.expect(evaluateXPath(selector, someProcessingInstruction, blueprint)).to.equal(true);
		});
		it('returns true for a processing instruction instance of processing-instruction(notSomeProcessingInstruction)', function () {
			var selector = parseSelector('. instance of processing-instruction(notSomeProcessingInstruction)');
			chai.expect(evaluateXPath(selector, someProcessingInstruction, blueprint)).to.equal(false);
		});
	});
});
