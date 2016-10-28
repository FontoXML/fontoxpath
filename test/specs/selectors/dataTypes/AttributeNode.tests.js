import AttributeNode from 'fontoxml-selectors/selectors/dataTypes/AttributeNode';
import StringValue from 'fontoxml-selectors/selectors/dataTypes/StringValue';
import UntypedAtomicValue from 'fontoxml-selectors/selectors/dataTypes/UntypedAtomicValue';
import slimdom from 'slimdom';

let documentNode = new slimdom.Document(),
	element = documentNode.createElement('someElement');

describe('AttributeNode.getParentNode()', () => {
	it('returns the parent node', () => {
		const attributeNode = new AttributeNode(element, 'someAttribute', 'someAttributeValue');
		chai.expect(attributeNode.getParentNode()).to.deep.equal(element);
	});
});

describe('AttributeNode.atomize()', () => {
	it('returns the atomized value', () => {
		const attributeNode = new AttributeNode(element, 'someAttribute', 'someAttributeValue');
		chai.expect(attributeNode.atomize()).to.deep.equal(new UntypedAtomicValue('someAttributeValue'));
	});
});

describe('AttributeNode.getStringValue()', () => {
	it('returns the string representation', () => {
		const attributeNode = new AttributeNode(element, 'someAttribute', 'someAttributeValue');
		chai.expect(attributeNode.getStringValue()).to.deep.equal(new StringValue('someAttributeValue'));
	});
});
