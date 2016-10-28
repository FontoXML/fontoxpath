import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('varRef', () => {
	it('can reference variables', () => {
		const selector = parseSelector('$x');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint, {'x': 42})
		).to.deep.equal(42);
	});

	it('can reference built-in variables', () => {
		const selector = parseSelector('$theBest');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal('FontoXML is the best!');
	});
});
