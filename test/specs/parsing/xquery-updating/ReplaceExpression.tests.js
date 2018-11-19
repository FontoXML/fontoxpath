import chai from 'chai';
import * as slimdom from 'slimdom';

import {
	evaluateUpdatingExpression
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

function assertCorrectUpdateList (actual, expected) {
	chai.assert.equal(expected.length, actual.length);
	for (var i = 0, l = expected.length; i < l; ++i) {
		chai.assert.equal(actual[i].type, expected[i].type);
		chai.assert.equal(actual[i].target, expected[i].target);

		switch(actual[i].type) {
			case 'replaceNode':
				actual[i]
					.replacement
					.forEach((replacement, j) => chai.assert.equal(replacement.outerHTML, expected[i].replacementXML[j]));
				break;
			case 'replaceValue':
				chai.assert.equal(actual[i]['string-value'], expected[i].stringValue);
				break;
		}
	}
}

describe('ReplaceExpression', () => {
	it('can replace a node and generate the correct update list', async () => {
		const ele = documentNode.appendChild(documentNode.createElement('ele'));
		const result = await evaluateUpdatingExpression('replace node ele with <ele/>', documentNode, null, {}, {});

		chai.assert.deepEqual(result.xdmValue, []);
		assertCorrectUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceNode',
				target: ele,
				replacementXML: ['<ele/>']
			}
		]);
	});

	it('can have a replace expression in a conditional expression', async () => {
		const ele = documentNode.appendChild(documentNode.createElement('ele'));
		const result = await evaluateUpdatingExpression('if (true()) then replace node ele with <ele/> else ()', documentNode, null, {}, {});

		chai.assert.deepEqual(result.xdmValue, []);
		assertCorrectUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceNode',
				target: ele,
				replacementXML: ['<ele/>']
			}
		]);
	});

	it('disallows executing non-updating expressions', async () => {
		const ele = documentNode.appendChild(documentNode.createElement('ele'));
		let error;
		try {
			await evaluateUpdatingExpression('()', documentNode, null, {}, {});
		} catch (err) {
			error = err;
		}

		chai.assert.throws(
			() => {
				if (error) {
					throw error;
				} else {
					return null;
				}},
			'is not updating and can not be executed as an updating expression.');
	});

	it('allows nested replaces', async () => {
		const list = documentNode.appendChild(documentNode.createElement('list'));
		list.setAttribute('count', '3');
		const listItem1 = list.appendChild(documentNode.createElement('list-item'));
		listItem1.setAttribute('i', '1');
		const listItem2 = list.appendChild(documentNode.createElement('list-item'));
		listItem2.setAttribute('i', '2');
		const listItem3 = list.appendChild(documentNode.createElement('list-item'));
		listItem3.setAttribute('i', '3');

		// Duplicate all list items and set the @count attribute to the new count of items, in a very roundabout way
		const result = await evaluateUpdatingExpression(
			'replace value of node list/@count with sum(for $list-item in list/* return (replace node $list-item with ($list-item, $list-item), 2))',
			documentNode,
			null,
			{},
			{});

		chai.assert.deepEqual(result.xdmValue, []);
		assertCorrectUpdateList(result.pendingUpdateList, [
			{
				type: 'replaceValue',
				target: list.getAttributeNode('count'),
				stringValue: '6'
			},
			{
				type: 'replaceNode',
				target: listItem1,
				replacementXML: ['<list-item i="1"/>', '<list-item i="1"/>']
			},
			{
				type: 'replaceNode',
				target: listItem2,
				replacementXML: ['<list-item i="2"/>', '<list-item i="2"/>']
			},
			{
				type: 'replaceNode',
				target: listItem3,
				replacementXML: ['<list-item i="3"/>', '<list-item i="3"/>']
			}
		]);
	});
});
