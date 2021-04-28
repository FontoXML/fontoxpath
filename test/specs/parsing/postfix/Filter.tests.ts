import * as chai from 'chai';
import { evaluateXPathToNumber, evaluateXPathToNumbers } from 'fontoxpath';

describe('Filter (predicate)', () => {
	it('parses', () => chai.assert.equal(evaluateXPathToNumber('(1,2,3)[. = 2]'), 2));
	it('allows spaces', () => chai.assert.equal(evaluateXPathToNumber('(1,2,3)   [. = 2]'), 2));
	it('returns empty sequence when inputted empty sequence', () =>
		chai.assert.isEmpty(evaluateXPathToNumbers('(1,2,3)[()]')));
	it('returns the sequence when filtering with a string', () =>
		chai.assert.deepEqual(evaluateXPathToNumbers('(1,2,3,4)["TAKE ME"]'), [1, 2, 3, 4]));
	it('returns the empty sequence when filtering with an empty string', () =>
		chai.assert.isEmpty(evaluateXPathToNumbers('(1,2,3,4)[""]')));
});
