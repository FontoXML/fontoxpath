import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('comments', () => {
	it('can parse comments',
		() => chai.assert.isTrue(evaluateXPathToBoolean('true() (: and false() :) or true()', documentNode)));

	it('can parse nested comments',
		() => chai.assert.isTrue(evaluateXPathToBoolean('true() (: and false() (:and true():) :) or false', documentNode)));
});
