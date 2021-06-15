import * as chai from 'chai';
import { evaluateXPathToNumbers } from 'fontoxpath';

describe('Predicates and arrays', () => {
	it('can filter an array', () =>
		chai.assert.deepEqual(
			evaluateXPathToNumbers('(array {1,2,3,4,5,6,7})?*[. mod 2 = 1]'),
			[1, 3, 5, 7]
		));

	it('can filter an array with a map in it', () =>
		chai.assert.deepEqual(
			evaluateXPathToNumbers(
				'((array {map{"num":1},map{"num":2},map{"num":3},map{"num":4},map{"num":5},map{"num":6},map{"num":7}})?*[?num mod 2 = 1])?*'
			),
			[1, 3, 5, 7]
		));

	it('can filter an array with a map in it and applies operators in correct order', () =>
		chai.assert.deepEqual(
			evaluateXPathToNumbers(
				'array {map{"num":1},map{"num":2},map{"num":3},map{"num":4},map{"num":5},map{"num":6},map{"num":7}}?*[?num mod 2 = 1]?*'
			),
			[1, 3, 5, 7]
		));
});
