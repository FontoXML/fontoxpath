import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('let', () => {
	it('creates a variable reference',
	   () => chai.assert.equal(evaluateXPath('let $x := 1 return $x', documentNode, blueprint), 1));
	it('can be used in a function',
	   () => chai.assert.equal(evaluateXPath('boolean(let $x := 1 return $x)', documentNode, blueprint), true));
	it('allows node/node//node in it',
	   () => chai.assert.deepEqual(evaluateXPath('let $x := node/node//node return $x', documentNode, blueprint), []));

	it('can be chained', () => {
		const selector = parseSelector('let $x := 1, $y := 2 return $x * $y');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal(2);
	});

	it('can be chained with spaces everywhere', () => {
		const selector = parseSelector('let $x := 1 , $y := 2 return $x * $y');
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
