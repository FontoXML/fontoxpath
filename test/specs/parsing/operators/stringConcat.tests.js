import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('stringConcat', () => {
	it('can concatenate strings', () => {
		const selector = parseSelector('"con" || "cat" || "enate"');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal('concatenate');
	});

	it('can concatenate empty sequences', () => {
		const selector = parseSelector('() || "con" || () || "cat" || () || "enate" || ()');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal('concatenate');
	});
});
