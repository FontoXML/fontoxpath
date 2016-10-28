import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('not', () => {
	it('can parse an "not" selector', () => {
		const selector = parseSelector('not(true())');
		chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
	});
});
