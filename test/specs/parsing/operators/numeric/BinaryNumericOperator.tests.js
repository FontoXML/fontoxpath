import slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNumber,
	evaluateXPathToStrings
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('mathematical operators', () => {
	it('can evaluate 1 + 1 to 2',
		() => chai.assert.equal(evaluateXPathToNumber('1 + 1', documentNode), 2));

	it('can evaluate 1 - 1 to 0',
		() => chai.assert.equal(evaluateXPathToNumber('1 - 1', documentNode), 0));

	it('can evaluate 1 * 2 to 2',
		() => chai.assert.equal(evaluateXPathToNumber('1 * 2', documentNode), 2));

	it('can evaluate 1 div 2 to 0.5',
		() => chai.assert.equal(evaluateXPathToNumber('1 div 2', documentNode), 0.5));

	it('can evaluate 1 idiv 2 to 1',
		() => chai.assert.equal(evaluateXPathToNumber('1 idiv 2', documentNode), 0));

	it('returns the empty sequence if one of the operands is the empty sequence',
		() => chai.assert.deepEqual(evaluateXPathToStrings('() + 1', documentNode), []));

	it('can evaluate 5 mod 3 to 2',
		() => chai.assert.equal(evaluateXPathToNumber('5 mod 3', documentNode), 2));

	it('can evaluate "something" + 1 to NaN',
		() => chai.assert.isNaN(evaluateXPathToNumber('"something" + 1', documentNode)));

	it('can parse untyped attributes', () => {
		jsonMlMapper.parse(['someElement', { a: '1' }], documentNode);
		chai.assert.equal(evaluateXPathToNumber('@a + 1', documentNode.documentElement), 2);
	});
});
