import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('and operator', () => {
	it('can parse an "and" selector', () => {
		const selector = parseSelector('true() and true()');
		chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
	});

	it('can parse a concatenation of ands', () => {
		const selector = parseSelector('true() and true() and true() and false()');
		chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
	});
});
