import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

describe('IfExpression', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = new slimdom.Document();
	});

	it('returns the value of the then expression if the test resolves to true',
		() => chai.assert(evaluateXPathToBoolean('(if (true()) then "then expression" else "else expression") eq "then expression"', documentNode)));

	it('returns the value of the then expression if the test resolves to false',
		() => chai.assert(evaluateXPathToBoolean('(if (false()) then "then expression" else "else expression") eq "else expression"', documentNode)));
});
