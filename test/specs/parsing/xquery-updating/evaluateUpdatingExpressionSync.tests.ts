import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateUpdatingExpressionSync, executePendingUpdateList } from 'fontoxpath';

let documentNode: slimdom.Document;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('evaluateUpdatingExpressionSync', () => {
	let insertBeforeCalled = false;
	let removeChildCalled = false;
	let removeAttributeNSCalled = false;
	let setAttributeNSCalled = false;
	let setDataCalled = false;

	let createAttributeNSCalled = false;
	let createCDATASectionCalled = false;
	let createCommentCalled = false;
	let createDocumentCalled = false;
	let createElementNSCalled = false;
	let createProcessingInstructionCalled = false;
	let createTextNodeCalled = false;

	const stubbedDocumentWriter = {
		insertBefore: (parent, node, referenceNode) => {
			insertBeforeCalled = true;
			return node;
		},
		removeAttributeNS: (element, namespaceURI, localName) => {
			removeAttributeNSCalled = true;
			return null;
		},
		removeChild: (parent, child) => {
			removeChildCalled = true;
			return child;
		},
		setAttributeNS: (element, namespaceURI, localName, value) => {
			setAttributeNSCalled = true;
			return null;
		},
		setData: (node, data) => {
			setDataCalled = true;
			return null;
		}
	};

	const stubbedNodesFactory = {
		createAttributeNS: (namespaceURI, localName) => {
			createAttributeNSCalled = true;
			return documentNode.createAttributeNS(namespaceURI, localName);
		},

		createCDATASection: contents => {
			createCDATASectionCalled = true;
			return documentNode.createCDATASection(contents);
		},

		createComment: contents => {
			createCommentCalled = true;
			return documentNode.createComment(contents);
		},
		createDocument: () => {
			createDocumentCalled = true;
			return documentNode.implementation.createDocument(null, null);
		},
		createElementNS: (namespaceURI, localName) => {
			createElementNSCalled = true;
			return documentNode.createElementNS(namespaceURI, localName);
		},
		createProcessingInstruction: (target, data) => {
			createProcessingInstructionCalled = true;
			return documentNode.createProcessingInstruction(target, data);
		},
		createTextNode: data => {
			createTextNodeCalled = true;
			return documentNode.createTextNode(data);
		}
	};

	beforeEach(() => {
		insertBeforeCalled = false;
		removeChildCalled = false;
		removeAttributeNSCalled = false;
		setAttributeNSCalled = false;
		setDataCalled = false;

		createAttributeNSCalled = false;
		createCDATASectionCalled = false;
		createCommentCalled = false;
		createDocumentCalled = false;
		createElementNSCalled = false;
		createProcessingInstructionCalled = false;
		createTextNodeCalled = false;
	});

	it('can evaluate an expression without any of the optional parameters set', async () => {
		documentNode.appendChild(documentNode.createElement('ele'));
		const result = evaluateUpdatingExpressionSync('replace node ele with <ele/>', documentNode);

		chai.assert.deepEqual(result.xdmValue, []);
	});

	it('properly returns the xdmValue for updating expressions', async () => {
		documentNode.appendChild(documentNode.createElement('ele'));
		const result = evaluateUpdatingExpressionSync(
			'(replace node ele with <ele/>, 1)',
			documentNode
		);

		chai.assert.deepEqual(result.xdmValue, 1);
	});

	it('properly returns the xdmValue for non-updating expressions', async () => {
		documentNode.appendChild(documentNode.createElement('ele'));
		const result = evaluateUpdatingExpressionSync('(1)', documentNode);

		chai.assert.deepEqual(result.xdmValue, 1);
	});

	it('uses the passed documentWriter for replacements', async () => {
		documentNode.appendChild(documentNode.createElement('ele'));

		evaluateUpdatingExpressionSync(
			'replace node $doc/ele with <ele>text</ele>',
			null,
			null,
			{
				doc: documentNode
			},
			{
				documentWriter: stubbedDocumentWriter,
				nodesFactory: stubbedNodesFactory
			}
		);

		chai.assert.isFalse(insertBeforeCalled, 'insertBeforeCalled');
		chai.assert.isFalse(removeChildCalled, 'removeChildCalled');
		chai.assert.isFalse(removeAttributeNSCalled, 'removeAttributeNSCalled');
		chai.assert.isFalse(setAttributeNSCalled, 'setAttributeNSCalled');
		chai.assert.isFalse(setDataCalled, 'setDataCalled');

		chai.assert.isTrue(createElementNSCalled, 'createElementNSCalled');
		chai.assert.isFalse(createAttributeNSCalled, 'createAttributeNSCalled');
		chai.assert.isFalse(createCDATASectionCalled, 'createCDATASectionCalled');
		chai.assert.isFalse(createCommentCalled, 'createCommentCalled');
		chai.assert.isFalse(createDocumentCalled, 'createDocumentCalled');
		chai.assert.isFalse(createProcessingInstructionCalled, 'createProcessingInstructionCalled');
		chai.assert.isTrue(createTextNodeCalled, 'createTextNodeCalled');
	});

	it('uses the passed documentWriter for insert into', async () => {
		documentNode.appendChild(documentNode.createElement('ele'));

		const result = evaluateUpdatingExpressionSync(
			'insert node <xxx attr="attr">PRRT<!--yyy--><?pi target?></xxx> into $doc/ele',
			null,
			null,
			{
				doc: documentNode
			},
			{
				documentWriter: stubbedDocumentWriter,
				nodesFactory: stubbedNodesFactory
			}
		);

		chai.assert.isFalse(insertBeforeCalled, 'insertBeforeCalled');
		chai.assert.isFalse(removeChildCalled, 'removeChildCalled');
		chai.assert.isFalse(removeAttributeNSCalled, 'removeAttributeNSCalled');
		chai.assert.isFalse(setAttributeNSCalled, 'setAttributeNSCalled');
		chai.assert.isFalse(setDataCalled, 'setDataCalled');

		chai.assert.isTrue(createElementNSCalled, 'createElementNSCalled');
		chai.assert.isTrue(createAttributeNSCalled, 'createAttributeNSCalled');
		chai.assert.isFalse(createCDATASectionCalled, 'createCDATASectionCalled');
		chai.assert.isTrue(createCommentCalled, 'createCommentCalled');
		chai.assert.isFalse(createDocumentCalled, 'createDocumentCalled');
		chai.assert.isTrue(createProcessingInstructionCalled, 'createProcessingInstructionCalled');
		chai.assert.isTrue(createTextNodeCalled, 'createTextNodeCalled');

		executePendingUpdateList(
			result.pendingUpdateList,
			null,
			stubbedNodesFactory,
			stubbedDocumentWriter
		);

		chai.assert.isTrue(insertBeforeCalled, 'insertBeforeCalled');
		chai.assert.isFalse(removeChildCalled, 'removeChildCalled');
		chai.assert.isFalse(removeAttributeNSCalled, 'removeAttributeNSCalled');
		chai.assert.isFalse(setAttributeNSCalled, 'setAttributeNSCalled');
		chai.assert.isFalse(setDataCalled, 'setDataCalled');
	});
});
