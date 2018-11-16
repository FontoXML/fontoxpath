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
		actual[i].replacement.forEach((replacement, j) => chai.assert.equal(replacement.outerHTML, expected[i].replacementXML[j]));
	}
}

describe('ReplaceExpression', () => {
	it('can replace a node and generate the correct update list', async () => {
		const ele = documentNode.appendChild(documentNode.createElement('ele'));
		const result = await evaluateUpdatingExpression('replace node ele with <ele/>', documentNode, null, {}, {});

		chai.assert.deepEqual(result.result, []);
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

		chai.assert.deepEqual(result.result, []);
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
});
