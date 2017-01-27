import slimdom from 'slimdom';

import AttributeNode from 'fontoxpath/selectors/dataTypes/AttributeNode';
import NodeValue from 'fontoxpath/selectors/dataTypes/NodeValue';
import StringValue from 'fontoxpath/selectors/dataTypes/StringValue';
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
			const nodeValue1 = new NodeValue(domFacade, element);
			const nodeValue2 = new NodeValue(domFacade, element);
			chai.assert.equal(nodeValue1, nodeValue2);
		});

		it('does not reuse a nodeValue instance for another node', () => {
			const nodeValue1 = new NodeValue(domFacade, documentNode.createElement('someElement'));
			const nodeValue2 = new NodeValue(domFacade, documentNode.createElement('someElement'));
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
			const nodeValue = new NodeValue(domFacade, documentNode.createElement('someElement'));
			chai.expect(nodeValue.instanceOfType('node()')).to.equal(true);
		});

		it('element is item()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createElement('someElement'));
			chai.expect(nodeValue.instanceOfType('item()')).to.equal(true);
		});

		it('element is element()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createElement('someElement'));
			chai.expect(nodeValue.instanceOfType('element()')).to.equal(true);
		});

		it('element is not comment()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createElement('someElement'));
			chai.expect(nodeValue.instanceOfType('comment()')).to.equal(false);
		});
	});

	describe('comment', () => {
		it('comment is node()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createComment('A piece of comment'));
			chai.expect(nodeValue.instanceOfType('node()')).to.equal(true);
		});

		it('comment is item()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createComment('A piece of comment'));
			chai.expect(nodeValue.instanceOfType('item()')).to.equal(true);
		});

		it('comment is comment()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createComment('A piece of comment'));
			chai.expect(nodeValue.instanceOfType('comment()')).to.equal(true);
		});

		it('comment is not element()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createComment('A piece of comment'));
			chai.expect(nodeValue.instanceOfType('element()')).to.equal(false);
		});
	});

	describe('processing-instruction', () => {
		it('processing-instruction is node()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createProcessingInstruction('someTarget', 'A piece of processing-instruction'));
			chai.expect(nodeValue.instanceOfType('node()')).to.equal(true);
		});

		it('processing-instruction is item()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createProcessingInstruction('someTarget', 'A piece of processing-instruction'));
			chai.expect(nodeValue.instanceOfType('item()')).to.equal(true);
		});

		it('processing-instruction is processing-instruction()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createProcessingInstruction('someTarget', 'A piece of processing-instruction'));
			chai.expect(nodeValue.instanceOfType('processing-instruction()')).to.equal(true);
		});

		it('processing-instruction is not element()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createProcessingInstruction('someTarget', 'A piece of processing-instruction'));
			chai.expect(nodeValue.instanceOfType('element()')).to.equal(false);
		});
	});

	describe('document', () => {
		it('document is node()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode);
			chai.expect(nodeValue.instanceOfType('node()')).to.equal(true);
		});

		it('document is item()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode);
			chai.expect(nodeValue.instanceOfType('item()')).to.equal(true);
		});

		it('document is document()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode);
			chai.expect(nodeValue.instanceOfType('document()')).to.equal(true);
		});

		it('document is not element()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode);
			chai.expect(nodeValue.instanceOfType('element()')).to.equal(false);
		});
	});

	describe('attribute', () => {
		it('attribute is node()', () => {
			const nodeValue = new NodeValue(domFacade, new AttributeNode(documentNode.createElement('someElement'), 'someAttributeName', 'someAttributeValue'));
			chai.expect(nodeValue.instanceOfType('node()')).to.equal(true);
		});

		it('attribute is item()', () => {
			const nodeValue = new NodeValue(domFacade, new AttributeNode(documentNode.createElement('someElement'), 'someAttributeName', 'someAttributeValue'));
			chai.expect(nodeValue.instanceOfType('item()')).to.equal(true);
		});

		it('attribute is attribute()', () => {
			const nodeValue = new NodeValue(domFacade, new AttributeNode(documentNode.createElement('someElement'), 'someAttributeName', 'someAttributeValue'));
			chai.expect(nodeValue.instanceOfType('attribute()')).to.equal(true);
		});

		it('attribute is not element()', () => {
			const nodeValue = new NodeValue(domFacade, new AttributeNode(documentNode.createElement('someElement'), 'someAttributeName', 'someAttributeValue'));
			chai.expect(nodeValue.instanceOfType('element()')).to.equal(false);
		});
	});

	describe('text', () => {
		it('text is node()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createTextNode('A piece of text'));
			chai.expect(nodeValue.instanceOfType('node()')).to.equal(true);
		});

		it('text is item()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createTextNode('A piece of text'));
			chai.expect(nodeValue.instanceOfType('item()')).to.equal(true);
		});

		it('text is text()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createTextNode('A piece of text'));
			chai.expect(nodeValue.instanceOfType('text()')).to.equal(true);
		});

		it('text is not element()', () => {
			const nodeValue = new NodeValue(domFacade, documentNode.createTextNode('A piece of text'));
			chai.expect(nodeValue.instanceOfType('element()')).to.equal(false);
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
		const nodeValue = new NodeValue(domFacade, someNode),
			atomizedValue = nodeValue.atomize();
		chai.expect(atomizedValue).to.deep.equal(new StringValue('A piece of text'));
	});
});
