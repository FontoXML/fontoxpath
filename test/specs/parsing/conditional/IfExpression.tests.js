import slimdom from 'slimdom';

import { evaluateXPathToBoolean } from 'fontoxml-selectors';
import { domFacade } from 'fontoxml-selectors';

describe('IfExpression', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = slimdom.createDocument();
	});

	it('returns the value of the then expression if the test resolves to true', () => {
		chai.assert(evaluateXPathToBoolean(
			'(if (true()) then "then expression" else "else expression") eq "then expression"',
			documentNode,
			domFacade ));
	});

	it('returns the value of the then expression if the test resolves to false', () => {
		chai.assert(evaluateXPathToBoolean(
			'(if (false()) then "then expression" else "else expression") eq "else expression"',
			documentNode,
			domFacade ));
	});
});
