import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('comments', () => {
	it('can parse comments', () => {
		const selector = parseSelector('true() (: and false() :) or true()');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal(true);
	});

	it('can parse nested comments', () => {
		const selector = parseSelector('true() (: and false() (:and true():) :) or false');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal(true);
	});
});
