import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateUpdatingExpression } from 'fontoxpath';
import assertUpdateList from './assertUpdateList';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('evaluateUpdatingExpression', () => {
	it('can evaluate an expression without any of the optional parameters set', async () => {
		documentNode.appendChild(documentNode.createElement('ele'));
		const result = await evaluateUpdatingExpression(
			'replace node ele with <ele/>',
			documentNode
		);

		chai.assert.deepEqual(result.xdmValue, []);
	});

	it('uses the passed documentWriter', async () => {
		let insertBeforeCalled = false;
		let removeChildCalled = false;
		let removeAttributeNSCalled = false;
		let setAttributeNSCalled = false;
		let setDataCalled = false;

		let createAttributeNSCalled = false;
		let createElementNSCalled = false;
		let createCommentCalled = false;
		let createProcessingInstructionCalled = false;
		let createTextNodeCalled = false;

		documentNode.appendChild(documentNode.createElement('ele'));

		await evaluateUpdatingExpression(
			'replace node $doc/ele with <ele>text</ele>',
			null,
			null,
			{
				doc: documentNode
			},
			{
				documentWriter: {
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
				},
				nodesFactory: {
					createAttributeNS: (namespaceURI, localName) => {
						createAttributeNSCalled = true;
						return documentNode.createAttributeNS(namespaceURI, localName);
					},
					createComment: contents => {
						createCommentCalled = true;
						return documentNode.createComment(contents);
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
				}
			}
		);

		chai.assert.isFalse(insertBeforeCalled, 'insertBeforeCalled');
		chai.assert.isFalse(removeChildCalled, 'removeChildCalled');
		chai.assert.isFalse(removeAttributeNSCalled, 'removeAttributeNSCalled');
		chai.assert.isFalse(setAttributeNSCalled, 'setAttributeNSCalled');
		chai.assert.isFalse(setDataCalled, 'setDataCalled');

		chai.assert.isTrue(createElementNSCalled, 'createElementNSCalled');
		chai.assert.isFalse(createAttributeNSCalled, 'createAttributeNSCalled');
		chai.assert.isFalse(createCommentCalled, 'createCommentCalled');
		chai.assert.isFalse(createProcessingInstructionCalled, 'createProcessingInstructionCalled');
		chai.assert.isTrue(createTextNodeCalled, 'createTextNodeCalled');
	});
});
