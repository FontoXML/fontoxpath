import * as slimdom from 'slimdom';

import {
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('let', () => {
	it('creates a variable reference',
		() => chai.assert.equal(evaluateXPathToNumber('let $x := 1 return $x', documentNode), 1));
	it('can be used in a function',
		() => chai.assert.equal(evaluateXPathToBoolean('boolean(let $x := 1 return $x)', documentNode), true));
	it('evaluates eagerly',
		() => chai.assert.equal(evaluateXPathToBoolean('(let $x := (1,2,3) return count($x) * count($x)) = 9', documentNode), true));

	it('allows node/node//node in it',
		() => chai.assert.deepEqual(evaluateXPathToNodes('let $x := node/node//node return $x', documentNode), []));
	it('can be chained',
		() => chai.assert.deepEqual(evaluateXPathToNumber('let $x := 1, $y := 2 return $x * $y', documentNode), 2));
	it('can be chained with spaces everywhere',
		() => chai.assert.deepEqual(evaluateXPathToNumber('let $x := 1 , $y := 2 return $x * $y', documentNode), 2));
	it('chains in the correct order',
		() => chai.assert.deepEqual(evaluateXPathToNumber('let $x := 1, $y := 2, $x := 3 return $x (: If the order would be inverse, $x would still be 1 :)', documentNode), 3));
});
