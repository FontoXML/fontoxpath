import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateUpdatingExpression } from 'fontoxpath';
import assertUpdateList from './assertUpdateList';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('DeleteExpression', () => {
	it('merges pul from target expressions', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));
		const a = element.appendChild(documentNode.createElement('a'));

		const result = await evaluateUpdatingExpression(
			`delete node (/element, delete node /element/a)`,
			documentNode,
			null,
			{},
			{}
		);

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'delete',
				target: element,
			},
			{
				type: 'delete',
				target: a,
			},
		]);
	});

	it('allows insert something with something asynchronous', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));

		const result = await evaluateUpdatingExpression(
			`
declare namespace fontoxpath="http://fontoxml.com/fontoxpath";

delete node fontoxpath:sleep(/element, 100)
`,
			documentNode,
			null,
			{},
			{}
		);

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'delete',
				target: element,
			},
		]);
	});
});
