import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('sequence', () => {
	it('creates a sequence', () => {
		const selector = parseSelector('(1,2,3)');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal([1,2,3]);
	});

	it('creates an empty sequence', () => {
		const selector = parseSelector('()');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal([]);
	});

	it('normalizes sequences', () => {
		const selector = parseSelector('(1,2,(3,4))');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal([1,2,3,4]);
	});
});

describe('range', () => {
	it('creates a sequence', () => {
		const selector = parseSelector('1 to 10');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal([1,2,3,4,5,6,7,8,9,10]);
	});
});
