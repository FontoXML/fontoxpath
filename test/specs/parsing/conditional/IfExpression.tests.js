import slimdom from 'slimdom';

import evaluateXPathToBoolean from 'fontoxml-selectors/evaluateXPathToBoolean';
import readOnlyBlueprint from 'fontoxml-blueprints/readOnlyBlueprint';

describe('IfExpression', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = slimdom.createDocument();
	});

	it('returns the value of the then expression if the test resolves to true', () => {
		chai.assert(evaluateXPathToBoolean(
			'(if (true()) then "then expression" else "else expression") eq "then expression"',
			documentNode,
			readOnlyBlueprint));
	});

	it('returns the value of the then expression if the test resolves to false', () => {
		chai.assert(evaluateXPathToBoolean(
			'(if (false()) then "then expression" else "else expression") eq "else expression"',
			documentNode,
			readOnlyBlueprint));
	});
});
