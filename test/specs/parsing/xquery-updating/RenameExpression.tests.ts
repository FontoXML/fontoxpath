import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateUpdatingExpressionSync } from 'fontoxpath';
import assertUpdateList from './assertUpdateList';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('RenameExpression', () => {
	it('allows rename', () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));

		const result = evaluateUpdatingExpressionSync(
			`rename node /element as "elem"`,
			documentNode,
			null,
			{},
			{},
		);

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localName: 'elem' },
			},
		]);
	});

	it('merges puls from target and newName expressions', () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));

		const result = evaluateUpdatingExpressionSync(
			`rename node (/element, rename node /element as "a") as ("elem", rename node /element as "b")`,
			documentNode,
			null,
			{},
			{},
		);

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localName: 'elem' },
			},
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localName: 'a' },
			},
			{
				type: 'rename',
				target: element,
				newName: { prefix: '', namespaceURI: null, localName: 'b' },
			},
		]);
	});
});
