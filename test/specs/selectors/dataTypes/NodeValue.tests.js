define([
	'fontoxml-selectors/selectors/dataTypes/NodeValue',
	'fontoxml-selectors/selectors/dataTypes/AttributeNode',
	'fontoxml-blueprints/readOnlyBlueprint',
	'slimdom'
], function (
	NodeValue,
	AttributeNode,
	readOnlyBlueprint,
	slimdom
) {
	'use strict';

	describe('NodeValue.instanceOfType()', function () {
		var documentNode;
		beforeEach(function () {
			documentNode = new slimdom.Document();
		});

		describe('element', function () {
			it('element is node()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createElement('someElement'));
				chai.expect(nodeValue.instanceOfType('node()')).to.equal(true);
			});

			it('element is item()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createElement('someElement'));
				chai.expect(nodeValue.instanceOfType('item()')).to.equal(true);
			});

			it('element is element()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createElement('someElement'));
				chai.expect(nodeValue.instanceOfType('element()')).to.equal(true);
			});

			it('element is not comment()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createElement('someElement'));
				chai.expect(nodeValue.instanceOfType('comment()')).to.equal(false);
			});
		});

		describe('comment', function () {
			it('comment is node()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createComment('A piece of comment'));
				chai.expect(nodeValue.instanceOfType('node()')).to.equal(true);
			});

			it('comment is item()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createComment('A piece of comment'));
				chai.expect(nodeValue.instanceOfType('item()')).to.equal(true);
			});

			it('comment is comment()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createComment('A piece of comment'));
				chai.expect(nodeValue.instanceOfType('comment()')).to.equal(true);
			});

			it('comment is not element()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createComment('A piece of comment'));
				chai.expect(nodeValue.instanceOfType('element()')).to.equal(false);
			});
		});

		describe('processing-instruction', function () {
			it('processing-instruction is node()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createProcessingInstruction('someTarget', 'A piece of processing-instruction'));
				chai.expect(nodeValue.instanceOfType('node()')).to.equal(true);
			});

			it('processing-instruction is item()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createProcessingInstruction('someTarget', 'A piece of processing-instruction'));
				chai.expect(nodeValue.instanceOfType('item()')).to.equal(true);
			});

			it('processing-instruction is processing-instruction()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createProcessingInstruction('someTarget', 'A piece of processing-instruction'));
				chai.expect(nodeValue.instanceOfType('processing-instruction()')).to.equal(true);
			});

			it('processing-instruction is not element()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createProcessingInstruction('someTarget', 'A piece of processing-instruction'));
				chai.expect(nodeValue.instanceOfType('element()')).to.equal(false);
			});
		});

		describe('document', function () {
			it('document is node()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode);
				chai.expect(nodeValue.instanceOfType('node()')).to.equal(true);
			});

			it('document is item()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode);
				chai.expect(nodeValue.instanceOfType('item()')).to.equal(true);
			});

			it('document is document()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode);
				chai.expect(nodeValue.instanceOfType('document()')).to.equal(true);
			});

			it('document is not element()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode);
				chai.expect(nodeValue.instanceOfType('element()')).to.equal(false);
			});
		});

		describe('attribute', function () {
			it('attribute is node()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, new AttributeNode(documentNode.createElement('someElement'), 'someAttributeName', 'someAttributeValue'));
				chai.expect(nodeValue.instanceOfType('node()')).to.equal(true);
			});

			it('attribute is item()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, new AttributeNode(documentNode.createElement('someElement'), 'someAttributeName', 'someAttributeValue'));
				chai.expect(nodeValue.instanceOfType('item()')).to.equal(true);
			});

			it('attribute is attribute()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, new AttributeNode(documentNode.createElement('someElement'), 'someAttributeName', 'someAttributeValue'));
				chai.expect(nodeValue.instanceOfType('attribute()')).to.equal(true);
			});

			it('attribute is not element()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, new AttributeNode(documentNode.createElement('someElement'), 'someAttributeName', 'someAttributeValue'));
				chai.expect(nodeValue.instanceOfType('element()')).to.equal(false);
			});
		});

		describe('text', function () {
			it('text is node()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createTextNode('A piece of text'));
				chai.expect(nodeValue.instanceOfType('node()')).to.equal(true);
			});

			it('text is item()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createTextNode('A piece of text'));
				chai.expect(nodeValue.instanceOfType('item()')).to.equal(true);
			});

			it('text is text()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createTextNode('A piece of text'));
				chai.expect(nodeValue.instanceOfType('text()')).to.equal(true);
			});

			it('text is not element()', function () {
				var nodeValue = new NodeValue(readOnlyBlueprint, documentNode.createTextNode('A piece of text'));
				chai.expect(nodeValue.instanceOfType('element()')).to.equal(false);
			});
		});
	});
});
