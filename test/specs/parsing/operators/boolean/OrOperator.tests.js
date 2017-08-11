import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';
import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('or operator', () => {
	it('can parse an "or" selector', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('false() or true()'));
	});
	it('can parse an "or" selector returning false', () => {
		chai.assert.isFalse(evaluateXPathToBoolean('false() or false()'));
	});

	it('works with async params', async () => {
		chai.assert.isTrue(await evaluateXPathToAsyncSingleton('false() => fontoxpath:sleep() or true()'));
	});

	it('can parse an "or" selector with different buckets', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('self::someElement or self::processing-instruction()', documentNode.documentElement.firstChild));
	});

	it('can parse a concatenation of ors',
		() => chai.assert.isTrue(evaluateXPathToBoolean('false() or false() or false() or (: Note: the last true() will make te result true:) true()')));

	it('allows not in combination with or', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			['someOtherChildElement']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('someChildElement or not(someOtherChild)', documentNode.documentElement));
	});
});
