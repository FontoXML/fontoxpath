import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('mathematical operators', () => {
	it('can evaluate 1 + 1 to 2', () => {
		const selector = parseSelector('1 + 1');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(2);
	});

	it('can evaluate 1 - 1 to 0', () => {
		const selector = parseSelector('1 - 1');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(0);
	});

	it('can evaluate 1 * 2 to 2', () => {
		const selector = parseSelector('1 * 2');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(2);
	});

	it('can evaluate 1 div 2 to 0.5', () => {
		const selector = parseSelector('1 div 2');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(0.5);
	});

	it('can evaluate 1 idiv 2 to 1', () => {
		const selector = parseSelector('1 idiv 2');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(0.5);
	});

	it('returns the empty sequence if one of the operands is the empty sequence', () => {
		chai.assert.deepEqual(evaluateXPath('() + 1', documentNode, blueprint), []);
	});

	it('can evaluate 5 mod 3 to 2', () => {
		const selector = parseSelector('5 mod 3');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(2);
	});

	it('can evaluate "something" + 1 to NaN', () => {
		const selector = parseSelector('"something" + 1');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.be.NaN;
	});

	it('can parse untyped attributes', () => {
		const selector = parseSelector('@a + 1');
		jsonMLMapper.parse(['someElement',{a:'1'}], documentNode);
		chai.expect(
			evaluateXPath(selector, documentNode.documentElement, blueprint)
		).to.equal(2);
	});
});
