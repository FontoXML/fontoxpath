import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateUpdatingExpression } from 'fontoxpath';
import assertUpdateList from './assertUpdateList';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('RenameExpression', () => {
	it('allows rename', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));

		const result = await evaluateUpdatingExpression(
			`rename node /element as "elem"`,
			documentNode,
			null,
			{},
			{}
		);

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localName: 'elem' }
			}
		]);
	});

	it('merges puls from target and newName expressions', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));

		const result = await evaluateUpdatingExpression(
			`rename node (/element, rename node /element as "a") as ("elem", rename node /element as "b")`,
			documentNode,
			null,
			{},
			{}
		);

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localName: 'elem' }
			},
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localName: 'a' }
			},
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localName: 'b' }
			}
		]);
	});

	it('allows rename attribute with something asynchronous', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));
		element.setAttributeNS(null, 'attr', 'val');
		const attribute = element.attributes[0];

		const result = await evaluateUpdatingExpression(
			`
declare namespace fontoxpath="http://fontoxml.com/fontoxpath";

rename node fontoxpath:sleep(/element/@attr, 100) as fontoxpath:sleep("at", 1)
`,
			documentNode,
			null,
			{},
			{}
		);

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'rename',
				target: attribute,
				newName: { prefix: '', namespaceURI: null, localName: 'at' }
			}
		]);
	});

	it('allows rename element with something asynchronous', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));

		const result = await evaluateUpdatingExpression(
			`
declare namespace fontoxpath="http://fontoxml.com/fontoxpath";

rename node fontoxpath:sleep(/element, 100) as fontoxpath:sleep("elem", 1)
`,
			documentNode,
			null,
			{},
			{}
		);

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localName: 'elem' }
			}
		]);
	});

	it('allows rename processing instruction with something asynchronous', async () => {
		const element = documentNode.appendChild(
			documentNode.createProcessingInstruction('my-pi', 'data')
		);

		const result = await evaluateUpdatingExpression(
			`
declare namespace fontoxpath="http://fontoxml.com/fontoxpath";

rename node fontoxpath:sleep(/processing-instruction(), 100) as fontoxpath:sleep("new-name", 1)
`,
			documentNode,
			null,
			{},
			{}
		);

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localName: 'new-name' }
			}
		]);
	});
});
