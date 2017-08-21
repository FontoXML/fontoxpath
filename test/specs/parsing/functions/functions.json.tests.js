import * as slimdom from 'slimdom';

import {
	domFacade,
	evaluateXPathToArray,
	evaluateXPathToMap,
	evaluateXPathToBoolean
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('functions over json', () => {
	it('can parse json objects',
		() => chai.assert.deepEqual(evaluateXPathToMap('parse-json("{""a"": 1}")', documentNode, domFacade), { a: 1 }));

	it('can parse json arrays',
		() => chai.assert.deepEqual(evaluateXPathToArray('parse-json("[1,2,3]")', documentNode, domFacade), [1, 2, 3]));

	it('can parse json booleans',
		() => chai.assert.isTrue(evaluateXPathToBoolean('parse-json("true") eq true()', documentNode, domFacade)));

	it('can parse json numbers',
		() => chai.assert.isTrue(evaluateXPathToBoolean('parse-json("1") eq 1e0', documentNode, domFacade)));

	it('can parse json strings',
		() => chai.assert.isTrue(evaluateXPathToBoolean('parse-json("""A piece of text""") eq "A piece of text"', documentNode, domFacade)));

	it('can parse json null',
		() => chai.assert.isTrue(evaluateXPathToBoolean('parse-json("null") => count() eq 0', documentNode, domFacade)));

	it('returns an error for invalid json',
		() => chai.assert.throws(() => evaluateXPathToBoolean('parse-json("}{") => count() eq 0', documentNode, domFacade)), 'FOJS0001');
});
