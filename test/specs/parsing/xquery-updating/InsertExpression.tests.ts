import * as chai from 'chai';
import * as slimdom from 'slimdom';

import {
	evaluateUpdatingExpression,
	executePendingUpdateList,
	evaluateUpdatingExpressionSync,
} from 'fontoxpath';
import assertUpdateList from './assertUpdateList';

let documentNode: slimdom.Document;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('InsertExpression', () => {
	it('merges puls from source and target expressions', () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));
		const a = element.appendChild(documentNode.createElement('a'));
		const b = element.appendChild(documentNode.createElement('b'));

		const result = evaluateUpdatingExpressionSync(
			`insert node (/element, insert node /element/a into /element) into (/element, insert node /element/b into /element)`,
			documentNode,
			null,
			{},
			{},
		);

		chai.assert.deepEqual(result.xdmValue, []);
		assertUpdateList(result.pendingUpdateList, [
			{
				type: 'insertInto',
				source: element,
				target: element,
			},
			{
				type: 'insertInto',
				source: a,
				target: element,
			},
			{
				type: 'insertInto',
				source: b,
				target: element,
			},
		]);
	});

	it('can insert a node without sideeffects', () => {
		const element = documentNode.appendChild(documentNode.createElement('element'));

		const result = evaluateUpdatingExpressionSync(
			`insert node <xxx>AAA</xxx> into $node`,
			documentNode,
			null,
			{
				node: element,
			},
			{},
		);

		chai.assert.deepEqual(result.xdmValue, []);

		chai.assert.equal(result.pendingUpdateList.length, 1);
		chai.assert.equal(element.childNodes.length, 0);
	});

	it('can insert a node at the end', () => {
		const parent = documentNode.appendChild(documentNode.createElement('parent'));
		const firstChild = parent.appendChild(documentNode.createElement('child'));

		const result = evaluateUpdatingExpressionSync(
			`insert node <child>second</child> after $node`,
			documentNode,
			null,
			{
				node: firstChild,
			},
			{},
		);

		chai.assert.deepEqual(result.xdmValue, []);

		chai.assert.equal(result.pendingUpdateList.length, 1);

		executePendingUpdateList(result.pendingUpdateList);

		chai.assert.isOk(firstChild.nextSibling);
	});

	it('can insert attribute nodes in the null namespace', () => {
		const element = documentNode.appendChild(
			documentNode.createElementNS('http://www.example.com/ns', 'element'),
		);

		const result = evaluateUpdatingExpressionSync(
			`insert node attribute abc {"value"} into $node`,
			documentNode,
			null,
			{
				node: element,
			},
			{},
		);

		chai.assert.deepEqual(result.xdmValue, []);

		chai.assert.equal(result.pendingUpdateList.length, 1);

		executePendingUpdateList(result.pendingUpdateList);

		chai.assert.equal(element.getAttribute('abc'), 'value');
	});
});
