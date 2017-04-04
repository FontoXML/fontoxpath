import slimdom from 'slimdom';

import AttributeNode from 'fontoxpath/selectors/dataTypes/AttributeNode';
import NodeValue from 'fontoxpath/selectors/dataTypes/NodeValue';
import UntypedAtomicValue from 'fontoxpath/selectors/dataTypes/UntypedAtomicValue';
import { domFacade } from 'fontoxpath';
import DomFacade from 'fontoxpath/DomFacade';

let documentNode;

describe('NodeValue.instanceOfType()', () => {
	beforeEach(() => {
		documentNode = new slimdom.Document();
	});

	describe('instance reuse', () => {
		it('can reuse a nodeValue instance for the same node', () => {
			const element = documentNode.createElement('someElement');
			const nodeValue1 = new NodeValue(element);
			const nodeValue2 = new NodeValue(element);
			chai.assert.equal(nodeValue1, nodeValue2);
		});

		it('does not reuse a nodeValue instance for another node', () => {
			const nodeValue1 = new NodeValue(documentNode.createElement('someElement'));
			const nodeValue2 = new NodeValue(documentNode.createElement('someElement'));
			chai.assert.notEqual(nodeValue1, nodeValue2);
		});


		it('does not reuse a nodeValue instance for another domFacade', () => {
			const element = documentNode.createElement('someElement');
			const nodeValue1 = new NodeValue(new DomFacade(domFacade), element);
			const nodeValue2 = new NodeValue(new DomFacade(domFacade), element);
			chai.assert.notEqual(nodeValue1, nodeValue2);
		});
	});

	describe('element', () => {
		it('element is node()', () => {
			const nodeValue = new NodeValue(documentNode.createElement('someElement'));
			chai.assert.isTrue(nodeValue.instanceOfType('node()'));
		});

		it('element is item()', () => {
			const nodeValue = new NodeValue(documentNode.createElement('someElement'));
			chai.assert.isTrue(nodeValue.instanceOfType('item()'));
		});

		it('element is element()', () => {
			const nodeValue = new NodeValue(documentNode.createElement('someElement'));
			chai.assert.isTrue(nodeValue.instanceOfType('element()'));
		});

		it('element is not comment()', () => {
			const nodeValue = new NodeValue(documentNode.createElement('someElement'));
			chai.assert.isFalse(nodeValue.instanceOfType('comment()'));
		});
	});

	describe('comment', () => {
		it('comment is node()', () => {
			const nodeValue = new NodeValue(documentNode.createComment('A piece of comment'));
			chai.assert.isTrue(nodeValue.instanceOfType('node()'));
		});

		it('comment is item()', () => {
			const nodeValue = new NodeValue(documentNode.createComment('A piece of comment'));
			chai.assert.isTrue(nodeValue.instanceOfType('item()'));
		});

		it('comment is comment()', () => {
			const nodeValue = new NodeValue(documentNode.createComment('A piece of comment'));
			chai.assert.isTrue(nodeValue.instanceOfType('comment()'));
		});

		it('comment is not element()', () => {
			const nodeValue = new NodeValue(documentNode.createComment('A piece of comment'));
			chai.assert.isFalse(nodeValue.instanceOfType('element()'));
		});
	});

	describe('processing-instruction', () => {
		it('processing-instruction is node()', () => {
			const nodeValue = new NodeValue(documentNode.createProcessingInstruction('someTarget', 'A piece of processing-instruction'));
			chai.assert.isTrue(nodeValue.instanceOfType('node()'));
		});

		it('processing-instruction is item()', () => {
			const nodeValue = new NodeValue(documentNode.createProcessingInstruction('someTarget', 'A piece of processing-instruction'));
			chai.assert.isTrue(nodeValue.instanceOfType('item()'));
		});

		it('processing-instruction is processing-instruction()', () => {
			const nodeValue = new NodeValue(documentNode.createProcessingInstruction('someTarget', 'A piece of processing-instruction'));
			chai.assert.isTrue(nodeValue.instanceOfType('processing-instruction()'));
		});

		it('processing-instruction is not element()', () => {
			const nodeValue = new NodeValue(documentNode.createProcessingInstruction('someTarget', 'A piece of processing-instruction'));
			chai.assert.isFalse(nodeValue.instanceOfType('element()'));
		});
	});

	describe('document', () => {
		it('document is node()', () => {
			const nodeValue = new NodeValue(documentNode);
			chai.assert.isTrue(nodeValue.instanceOfType('node()'));
		});

		it('document is item()', () => {
			const nodeValue = new NodeValue(documentNode);
			chai.assert.isTrue(nodeValue.instanceOfType('item()'));
		});

		it('document is document()', () => {
			const nodeValue = new NodeValue(documentNode);
			chai.assert.isTrue(nodeValue.instanceOfType('document()'));
		});

		it('document is not element()', () => {
			const nodeValue = new NodeValue(documentNode);
			chai.assert.isFalse(nodeValue.instanceOfType('element()'));
		});
	});

	describe('attribute', () => {
		it('attribute is node()', () => {
			const nodeValue = new NodeValue(new AttributeNode(documentNode.createElement('someElement'), 'someAttributeName', 'someAttributeValue'));
			chai.assert.isTrue(nodeValue.instanceOfType('node()'));
		});

		it('attribute is item()', () => {
			const nodeValue = new NodeValue(new AttributeNode(documentNode.createElement('someElement'), 'someAttributeName', 'someAttributeValue'));
			chai.assert.isTrue(nodeValue.instanceOfType('item()'));
		});

		it('attribute is attribute()', () => {
			const nodeValue = new NodeValue(new AttributeNode(documentNode.createElement('someElement'), 'someAttributeName', 'someAttributeValue'));
			chai.assert.isTrue(nodeValue.instanceOfType('attribute()'));
		});

		it('attribute is not element()', () => {
			const nodeValue = new NodeValue(new AttributeNode(documentNode.createElement('someElement'), 'someAttributeName', 'someAttributeValue'));
			chai.assert.isFalse(nodeValue.instanceOfType('element()'));
		});
	});

	describe('text', () => {
		it('text is node()', () => {
			const nodeValue = new NodeValue(documentNode.createTextNode('A piece of text'));
			chai.assert.isTrue(nodeValue.instanceOfType('node()'));
		});

		it('text is item()', () => {
			const nodeValue = new NodeValue(documentNode.createTextNode('A piece of text'));
			chai.assert.isTrue(nodeValue.instanceOfType('item()'));
		});

		it('text is text()', () => {
			const nodeValue = new NodeValue(documentNode.createTextNode('A piece of text'));
			chai.assert.isTrue(nodeValue.instanceOfType('text()'));
		});

		it('text is not element()', () => {
			const nodeValue = new NodeValue(documentNode.createTextNode('A piece of text'));
			chai.assert.isFalse(nodeValue.instanceOfType('element()'));
		});
	});
});

let someNode,
	someTextNode;

describe('NodeValue.atomize()', () => {
	beforeEach(() => {
		documentNode = new slimdom.Document();
		someNode = documentNode.createElement('someElement');
		someTextNode = documentNode.createTextNode('A piece of text');
		someNode.appendChild(someTextNode);
	});

	it('returns an atomized value', () => {
		const nodeValue = new NodeValue(someNode);
		const atomizedValue = nodeValue.atomize({ domFacade: domFacade });
		chai.assert.deepEqual(atomizedValue, new UntypedAtomicValue('A piece of text'));
	});
});
