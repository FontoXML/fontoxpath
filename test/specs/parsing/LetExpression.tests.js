import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('let', () => {
	it('creates a variable reference', () => {
		const selector = parseSelector('let $x := 1 return $x');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal(1);
	});

	it('can be used in a function', () => {
		const selector = parseSelector('boolean(let $x := 1 return $x)');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal(true);
	});

	it('can be chained', () => {
		const selector = parseSelector('let $x := 1, $y := 2 return $x * $y');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal(2);
	});

	it('chains in the correct order', () => {
		const selector = parseSelector('let $x := 1, $y := 2, $x := 3 return $x (: If the order would be inverse, $x would still be 1 :)');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal(3);
	});
});
