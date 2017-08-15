import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

describe('IfExpression', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = new slimdom.Document();
	});

	it('returns the value of the then expression if the test resolves to true',
		() => chai.assert(evaluateXPathToBoolean('(if (true()) then "then expression" else "else expression") eq "then expression"', documentNode)));

	it('Allows async conditions', async () => {
		chai.assert.isTrue(await evaluateXPathToAsyncSingleton('(if (fontoxpath:sleep(true(), 1)) then "then expression" else "else expression") eq "then expression"', documentNode));
	});

	it('Allows async thenExpression', async () => {
		chai.assert.isTrue(await evaluateXPathToAsyncSingleton('(if (true()) then fontoxpath:sleep("then expression", 1) else "else expression") eq "then expression"', documentNode));
	});

	it('Allows async elseExpression', async () => {
		chai.assert.isTrue(await evaluateXPathToAsyncSingleton('(if (false()) then "then expression" else fontoxpath:sleep("else expression", 1)) eq "else expression"', documentNode));
	});

	it('returns the value of the else expression if the test resolves to false',
		() => chai.assert(evaluateXPathToBoolean('(if (false()) then "then expression" else "else expression") eq "else expression"', documentNode)));
});
