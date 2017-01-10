import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToNodes, evaluateXPathToNumber, evaluateXPathToBoolean } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('let', () => {
	it('creates a variable reference',
	   () => chai.assert.equal(evaluateXPathToNumber('let $x := 1 return $x', documentNode, domFacade), 1));
	it('can be used in a function',
	   () => chai.assert.equal(evaluateXPathToBoolean('boolean(let $x := 1 return $x)', documentNode, domFacade), true));
	it('allows node/node//node in it',
	   () => chai.assert.deepEqual(evaluateXPathToNodes('let $x := node/node//node return $x', documentNode, domFacade), []));

	it('can be chained', () => {
		chai.expect(
			evaluateXPathToNumber('let $x := 1, $y := 2 return $x * $y', documentNode, domFacade)
		).to.deep.equal(2);
	});

	it('can be chained with spaces everywhere', () => {
		chai.expect(
			evaluateXPathToNumber('let $x := 1 , $y := 2 return $x * $y', documentNode, domFacade)
		).to.deep.equal(2);
	});

	it('chains in the correct order', () => {
		chai.expect(
			evaluateXPathToNumber('let $x := 1, $y := 2, $x := 3 return $x (: If the order would be inverse, $x would still be 1 :)', documentNode, domFacade)
		).to.deep.equal(3);
	});
});
