import * as slimdom from 'slimdom';

import {
	evaluateXPathToString
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('stringConcat', () => {
	it('can concatenate strings',
		() => chai.assert.equal(evaluateXPathToString('"con" || "cat" || "enate"', documentNode), 'concatenate'));

	it('can concatenate empty sequences',
		() => chai.assert.equal(evaluateXPathToString('() || "con" || () || "cat" || () || "enate" || ()', documentNode), 'concatenate'));
});
