import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToNumbers } from 'fontoxml-selectors';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('sequence', () => {
	it('creates a sequence', () => {
		chai.expect(
			evaluateXPathToNumbers('(1,2,3)', documentNode, domFacade)
		).to.deep.equal([1,2,3]);
	});

	it('creates an empty sequence', () => {
		chai.expect(
			evaluateXPathToNumbers('()', documentNode, domFacade)
		).to.deep.equal([]);
	});

	it('normalizes sequences', () => {
		chai.expect(
			evaluateXPathToNumbers('(1,2,(3,4))', documentNode, domFacade)
		).to.deep.equal([1,2,3,4]);
	});
});

describe('range', () => {
	it('creates a sequence', () => {
		chai.expect(
			evaluateXPathToNumbers('1 to 10', documentNode, domFacade)
		).to.deep.equal([1,2,3,4,5,6,7,8,9,10]);
	});

	it('creates an empty sequence when passed a > b', () => {
		chai.expect(
			evaluateXPathToNumbers('10 to 1', documentNode, domFacade)
		).to.deep.equal([]);
	});
});
