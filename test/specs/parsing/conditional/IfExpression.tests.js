import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean,
	evaluateXPathToAsyncIterator
} from 'fontoxpath';

describe('IfExpression', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = new slimdom.Document();
	});

	it('returns the value of the then expression if the test resolves to true',
		() => chai.assert(evaluateXPathToBoolean('(if (true()) then "then expression" else "else expression") eq "then expression"', documentNode)));

	it('Allows async conditions', async () => {
		const it = evaluateXPathToAsyncIterator('(if (fontoxpath:sleep(true(), 1)) then "then expression" else "else expression") eq "then expression"', documentNode);
		chai.assert.deepEqual(await it.next(), { done: false, value: true });
		chai.assert.deepEqual(await it.next(), { done: true });
	});

	it('Allows async thenExpression', async () => {
		const it = evaluateXPathToAsyncIterator('(if (true()) then fontoxpath:sleep("then expression", 1) else "else expression") eq "then expression"', documentNode);
		chai.assert.deepEqual(await it.next(), { done: false, value: true });
		chai.assert.deepEqual(await it.next(), { done: true });
	});

	it('Allows async elseExpression', async () => {
		const it = evaluateXPathToAsyncIterator('(if (false()) then "then expression" else fontoxpath:sleep("else expression", 1)) eq "else expression"', documentNode);
		chai.assert.deepEqual(await it.next(), { done: false, value: true });
		chai.assert.deepEqual(await it.next(), { done: true });
	});

	it('returns the value of the else expression if the test resolves to false',
		() => chai.assert(evaluateXPathToBoolean('(if (false()) then "then expression" else "else expression") eq "else expression"', documentNode)));
});
