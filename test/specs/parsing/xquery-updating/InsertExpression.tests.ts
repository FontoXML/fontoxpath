import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { evaluateUpdatingExpression, executePendingUpdateList } from 'fontoxpath';
import assertUpdateList from './assertUpdateList';

let documentNode: slimdom.Document;
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
			{}
		);

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

	it('can insert a node without sideeffects', async () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));

		const result = await evaluateUpdatingExpression(
			`insert node <xxx>AAA</xxx> into $node`,
			documentNode,
			null,
			{
				node: element
			},
			{}
		);

		chai.assert.deepEqual(result.xdmValue, []);

		chai.assert.equal(result.pendingUpdateList.length, 1);
		chai.assert.equal(element.childNodes.length, 0);
	});

	it('can insert attribute nodes in the null namespace', async () => {
		const element = documentNode.appendChild(
			documentNode.createElementNS('http://www.example.com/ns', 'element')
		);

		const result = await evaluateUpdatingExpression(
			`insert node attribute abc {"value"} into $node`,
			documentNode,
			null,
			{
				node: element
			},
			{}
		);

		chai.assert.deepEqual(result.xdmValue, []);

		chai.assert.equal(result.pendingUpdateList.length, 1);

		executePendingUpdateList(result.pendingUpdateList);

		chai.assert.equal(element.getAttribute('abc'), 'value');
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
			{}
		);

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
