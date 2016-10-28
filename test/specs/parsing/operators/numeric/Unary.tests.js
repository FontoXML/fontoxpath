import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('unary operators', () => {
	it('accepts + when passed an integer', () => {
		const selector = parseSelector('+1');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(1);
	});

	it('negates a - when passed an integer', () => {
		const selector = parseSelector('-1');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(-1);
	});

	it('accepts + when passed 0', () => {
		const selector = parseSelector('+0');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(0);
	});

	it('accepts - when passed 0', () => {
		const selector = parseSelector('-0');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(0);
	});

	it('accepts chaining +', () => {
		const selector = parseSelector('++++1');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(1);
	});

	it('accepts chaining -', () => {
		const selector = parseSelector('----1');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(1);
	});

	it('accepts chaining - and + intermittently', () => {
		const selector = parseSelector('+-+-1');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.equal(1);
	});

	it('resolves to NaN passed a string', () => {
		const selector = parseSelector('+"something"');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.be.NaN;
	});

	it('resolves to NaN passed a boolean', () => {
		const selector = parseSelector('+true()');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.be.NaN;
	});

	it('resolves to NaN passed a node', () => {
		const selector = parseSelector('+.');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.be.NaN;
	});
});
