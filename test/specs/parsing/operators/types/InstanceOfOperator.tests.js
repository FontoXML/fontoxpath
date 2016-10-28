import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('instance of operator', () => {
	it('returns true for a valid instance of xs:boolean', () => {
		const selector = parseSelector('true() instance of xs:boolean');
		chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(true);
	});

	it('returns true for a valid instance of xs:boolean?', () => {
		const selector1 = parseSelector('() instance of xs:boolean?'),
		selector2 = parseSelector('true() instance of xs:boolean?');
		chai.expect(evaluateXPath(selector1, documentNode, blueprint)).to.equal(true);
		chai.expect(evaluateXPath(selector2, documentNode, blueprint)).to.equal(true);
	});

	it('returns true for a valid instance of xs:boolean+', () => {
		const selector1 = parseSelector('true() instance of xs:boolean+'),
		selector2 = parseSelector('(true(), false()) instance of xs:boolean+');
		chai.expect(evaluateXPath(selector1, documentNode, blueprint)).to.equal(true);
		chai.expect(evaluateXPath(selector2, documentNode, blueprint)).to.equal(true);
	});

	it('returns true for a valid instance of xs:boolean*', () => {
		const selector1 = parseSelector('() instance of xs:boolean*'),
		selector2 = parseSelector('true() instance of xs:boolean*'),
		selector3 = parseSelector('(true(), false()) instance of xs:boolean*');
		chai.expect(evaluateXPath(selector1, documentNode, blueprint)).to.equal(true);
		chai.expect(evaluateXPath(selector2, documentNode, blueprint)).to.equal(true);
		chai.expect(evaluateXPath(selector3, documentNode, blueprint)).to.equal(true);
	});

	it('returns false for an invalid instance of xs:boolean', () => {
		const selector = parseSelector('() instance of xs:boolean');
		chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
	});

	it('returns false for an invalid instance of xs:boolean?', () => {
		const selector = parseSelector('(true(), false()) instance of xs:boolean?');
		chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
	});

	it('returns false for an invalid instance of xs:boolean+', () => {
		const selector = parseSelector('() instance of xs:boolean+');
		chai.expect(evaluateXPath(selector, documentNode, blueprint)).to.equal(false);
	});
});
