import * as chai from 'chai';
import * as slimdom from 'slimdom';

import {
	evaluateUpdatingExpression
} from 'fontoxpath';
import assertUpdateList from './assertUpdateList';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('InsertExpression', () => {
	it('merges puls from source and target expressions', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));
		const a = element.appendChild(documentNode.createElement('a'));
		const b = element.appendChild(documentNode.createElement('b'));

		const result = await evaluateUpdatingExpression(
			`insert node (/element, insert node /element/a into /element) into (/element, insert node /element/b into /element)`,
			documentNode,
			null,
			{},
			{});

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'insertInto',
				source: element,
				target: element
			},
			{
				type: 'insertInto',
				source: a,
				target: element
			},
			{
				type: 'insertInto',
				source: b,
				target: element
			}
		]);
	});

	it('allows insert something with something asynchronous', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));

		const result = await evaluateUpdatingExpression(
			`
declare namespace fontoxpath="http://fontoxml.com/fontoxpath";

insert node fontoxpath:sleep(/element, 100) into fontoxpath:sleep(/element, 1)
`,
			documentNode,
			null,
			{},
			{});

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'insertInto',
				source: element,
				target: element
			}
		]);
	});
});
