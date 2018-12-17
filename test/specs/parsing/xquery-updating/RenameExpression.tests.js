import chai from 'chai';
import * as slimdom from 'slimdom';

import {
	evaluateUpdatingExpression
} from 'fontoxpath';
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
			{});

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localPart: 'elem' }
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
			{});

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localPart: 'elem' }
			},
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localPart: 'a' }
			},
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localPart: 'b' }
			}
		]);
	});

	it('allows rename something with something asynchronous', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));

		const result = await evaluateUpdatingExpression(
			`
declare namespace fontoxpath="http://fontoxml.com/fontoxpath";

rename node fontoxpath:sleep(/element, 100) as fontoxpath:sleep("elem", 1)
`,
			documentNode,
			null,
			{},
			{});

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localPart: 'elem' }
			}
		]);
	});
});
