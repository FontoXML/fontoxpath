import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPathToArray from 'fontoxml-selectors/evaluateXPathToArray';
import evaluateXPathToMap from 'fontoxml-selectors/evaluateXPathToMap';
import evaluateXPathToBoolean from 'fontoxml-selectors/evaluateXPathToBoolean';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('functions over json', () => {
	it(
		'can parse json objects',
		() => chai.assert.deepEqual(evaluateXPathToMap('parse-json("{""a"": 1}")', documentNode, blueprint), { a: 1 }));

	it(
		'can parse json arrays',
		() => chai.assert.deepEqual(evaluateXPathToArray('parse-json("[1,2,3]")', documentNode, blueprint), [[1], [2], [3]]));

	it(
		'can parse json booleans',
		() => chai.assert.isTrue(evaluateXPathToBoolean('parse-json("true") eq true()', documentNode, blueprint)));

	it(
		'can parse json numbers',
		() => chai.assert.isTrue(evaluateXPathToBoolean('parse-json("1") eq 1e0', documentNode, blueprint)));

	it(
		'can parse json strings',
		() => chai.assert.isTrue(evaluateXPathToBoolean('parse-json("""A piece of text""") eq "A piece of text"', documentNode, blueprint)));

	it(
		'can parse json null',
		() => chai.assert.isTrue(evaluateXPathToBoolean('parse-json("null") => count() eq 0', documentNode, blueprint)));

	it(
		'returns an error for invalid json',
		() => chai.assert.throws(
			() => evaluateXPathToBoolean('parse-json("}{") => count() eq 0', documentNode, blueprint)),
		'FOJS0001');
});
