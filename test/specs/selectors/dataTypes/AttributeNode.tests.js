define([
	'slimdom',
	'fontoxml-selectors/selectors/dataTypes/AttributeNode',
	'fontoxml-selectors/selectors/dataTypes/StringValue',
	'fontoxml-selectors/selectors/dataTypes/UntypedAtomicValue'
], function (
	slimdom,
	AttributeNode,
	StringValue,
	UntypedAtomicValue
) {
	'use strict';

	var documentNode = new slimdom.Document(),
		element = documentNode.createElement('someElement');

	describe('AttributeNode.getParentNode()', function () {
		it('returns the parent node', function () {
			var attributeNode = new AttributeNode(element, 'someAttribute', 'someAttributeValue');
			chai.expect(attributeNode.getParentNode()).to.deep.equal(element);
		});
	});

	describe('AttributeNode.atomize()', function () {
		it('returns the atomized value', function () {
			var attributeNode = new AttributeNode(element, 'someAttribute', 'someAttributeValue');
			chai.expect(attributeNode.atomize()).to.deep.equal(new UntypedAtomicValue('someAttributeValue'));
		});
	});

	describe('AttributeNode.getStringValue()', function () {
		it('returns the string representation', function () {
			var attributeNode = new AttributeNode(element, 'someAttribute', 'someAttributeValue');
			chai.expect(attributeNode.getStringValue()).to.deep.equal(new StringValue('someAttributeValue'));
		});
	});
});
