import AttributeNode from 'fontoxpath/selectors/dataTypes/AttributeNode';
import StringValue from 'fontoxpath/selectors/dataTypes/StringValue';
import UntypedAtomicValue from 'fontoxpath/selectors/dataTypes/UntypedAtomicValue';
import slimdom from 'slimdom';

const documentNode = new slimdom.Document();
const element = documentNode.createElement('someElement');

describe('AttributeNode.parentNode', () => {
	it('returns the parent node', () => {
		const attributeNode = new AttributeNode(element, 'someAttribute', 'someAttributeValue');
		chai.assert.equal(attributeNode.parentNode, element);
	});
});

describe('AttributeNode.atomize()', () => {
	it('returns the atomized value', () => {
		const attributeNode = new AttributeNode(element, 'someAttribute', 'someAttributeValue');
		chai.assert.deepEqual(attributeNode.atomize(), new UntypedAtomicValue('someAttributeValue'));
	});
});

describe('AttributeNode.getStringValue()', () => {
	it('returns the string representation', () => {
		const attributeNode = new AttributeNode(element, 'someAttribute', 'someAttributeValue');
		chai.assert.deepEqual(attributeNode.getStringValue(), new StringValue('someAttributeValue'));
	});
});
