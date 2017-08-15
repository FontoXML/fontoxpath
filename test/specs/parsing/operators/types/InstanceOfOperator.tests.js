import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';
import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

describe('instance of operator', () => {
	it('returns true for a valid instance of xs:boolean',
		() => chai.assert.isTrue(evaluateXPathToBoolean('true() instance of xs:boolean')));

	it('returns true for a valid instance of xs:boolean?', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('() instance of xs:boolean?'));
		chai.assert.isTrue(evaluateXPathToBoolean('true() instance of xs:boolean?'));
	});

	it('returns true for a valid instance of xs:boolean+', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('true() instance of xs:boolean+'));
		chai.assert.isTrue(evaluateXPathToBoolean('(true(), false()) instance of xs:boolean+'));
	});

	it('returns true for a valid instance of xs:boolean*', () => {
		chai.assert.isTrue(evaluateXPathToBoolean('() instance of xs:boolean*'), 'empty');
		chai.assert.isTrue(evaluateXPathToBoolean('true() instance of xs:boolean*'), 'singleton');
		chai.assert.isTrue(evaluateXPathToBoolean('(true(), false()) instance of xs:boolean*'), 'multiple');
	});

	it('returns false for an invalid instance of xs:boolean',
		() => chai.assert.isFalse(evaluateXPathToBoolean('() instance of xs:boolean')));

	it('returns false for an invalid instance of xs:boolean?',
		() => chai.assert.isFalse(evaluateXPathToBoolean('(true(), false()) instance of xs:boolean?')));

	it('returns false for an invalid instance of xs:boolean+',
		() => chai.assert.isFalse(evaluateXPathToBoolean('() instance of xs:boolean+')));

	it('returns false for an invalid instance of node()',
		() => chai.assert.isFalse(evaluateXPathToBoolean('1 instance of node()')));
	it('accepts async params', async () => {
		chai.assert.isTrue(await evaluateXPathToAsyncSingleton('fontoxpath:sleep(1) instance of xs:integer'));
	});
	it('accepts async params for * case, single frame', async () => {
		chai.assert.isTrue(await evaluateXPathToAsyncSingleton('fontoxpath:sleep((1,2,3)) instance of xs:integer*'));
	});
	it('accepts async params for + case, multiple frames', async () => {
		chai.assert.isTrue(await evaluateXPathToAsyncSingleton('(fontoxpath:sleep(1, 1), fontoxpath:sleep(2, 10)) instance of xs:integer+'));
	});
	it('accepts async params for + case, false case', async () => {
		chai.assert.isFalse(await evaluateXPathToAsyncSingleton('(fontoxpath:sleep(1, 1), fontoxpath:sleep("string", 10)) instance of xs:integer+'));
	});
});
