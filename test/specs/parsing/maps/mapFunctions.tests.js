import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPathToMap from 'fontoxml-selectors/evaluateXPathToMap';
import evaluateXPathToNumber from 'fontoxml-selectors/evaluateXPathToNumber';
import evaluateXPathToBoolean from 'fontoxml-selectors/evaluateXPathToBoolean';
import evaluateXPathToStrings from 'fontoxml-selectors/evaluateXPathToStrings';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('map:get', () => {
	it(
		'can get a value from a map using a string key',
		() => chai.assert.equal(evaluateXPathToNumber('map:get(map {"a": 1, "b":2}, "a")', documentNode, blueprint), 1));

	it(
		'can get a value from a map using a boolean key',
		() => chai.assert.equal(evaluateXPathToNumber('map:get(map {true(): 1, false():2}, true())', documentNode, blueprint), 1));

	it(
		'can get a value from a map using a numeric key',
		() => chai.assert.equal(evaluateXPathToNumber('map:get(map {1: 1, 2:2}, 1)', documentNode, blueprint), 1));

	it(
		'returns the empty sequence if nothing matches: numeric vs other',
		() => chai.assert.equal(evaluateXPathToNumber('count(map:get(map {1: 1, 2:2}, false()))', documentNode, blueprint), 0));

	it(
		'returns the empty sequence if nothing matches: other vs numeric',
		() => chai.assert.equal(evaluateXPathToNumber('count(map:get(map {true(): 1, 2:2}, 1))', documentNode, blueprint), 0));

	it(
		'is aliased to "executing the map function"',
		() => chai.assert.equal(evaluateXPathToNumber('(map {"a": 1, "b":2})("a")', documentNode, blueprint), 1));

	it(
		'returns the correct value when passes NaN',
   		() => chai.assert.equal(evaluateXPathToNumber('(map {number("NaN"): 1, "b":2})(number("NaN"))', documentNode, blueprint), 1));

	it(
		'can be chained',
		() => chai.assert.equal(evaluateXPathToNumber('(map {"a": map{1:1}})("a")(1)', documentNode, blueprint), 1));
});

describe('map:merge', () => {
	it(
		'can merge two maps',
		() => chai.assert.deepEqual(evaluateXPathToMap('map:merge((map {"a": 1}, map{"b":2}))', documentNode, blueprint), { a: 1, b: 2 }));

	it(
		'can handle duplicates: use-first',
		() => chai.assert.deepEqual(evaluateXPathToMap(`
map:merge((
  map {"a": 1},
  map {"a": 2}
), map {"duplicates": "use-first"})`, documentNode, blueprint), { a: 1 }));

	it('defaults to use-first duplication handling if no options are passed',
		() => chai.assert.deepEqual(evaluateXPathToMap(`
map:merge((
  map {"a": 1},
  map {"a": 2}
))`, documentNode, blueprint), { a: 1 }));

	it('defaults to use-first duplication handling if no duplicates entry is present in the map',
		() => chai.assert.deepEqual(evaluateXPathToMap(`
map:merge((
  map {"a": 1},
  map {"a": 2}
), map{})`, documentNode, blueprint), { a: 1 }));

	it(
		'can handle duplicates: use-last',
		() => chai.assert.deepEqual(evaluateXPathToMap(`
map:merge((
  map {"a": 1},
  map {"a": 2}
), map {"duplicates": "use-last"})`, documentNode, blueprint), { a: 2 }));

		it(
		'can handle duplicates: use-any',
		() => chai.assert.deepEqual(evaluateXPathToMap(`
map:merge((
  map {"a": 1},
  map {"a": 2}
), map {"duplicates": "use-any"})`, documentNode, blueprint), { a: 1 }));

	it(
		'can handle duplicates: combine',
		() => chai.assert.deepEqual(evaluateXPathToMap(`
map:merge((
  map {"a": 1},
  map {"a": 2}
), map {"duplicates": "combine"})`, documentNode, blueprint), { a: [1, 2] }));

	it(
		'can handle duplicates: reject',
		() => chai.assert.throws(() => evaluateXPathToMap(`
map:merge((
  map {"a": 1},
  map {"a": 2}
), map {"duplicates": "reject"})`, documentNode, blueprint), 'FOJS0003'));

});

describe('map:put', () => {
	it(
		'adds an item to a map',
		() => chai.assert.deepEqual(evaluateXPathToMap('map{"a": 1} => map:put("b", 2)', documentNode, blueprint), { a: 1, b: 2 }));

	it(
		'replaces the old value',
		() => chai.assert.deepEqual(evaluateXPathToMap('map{"a": 1} => map:put("a", 2)', documentNode, blueprint), { a: 2 }));

	it(
		'does not mutate the map',
		() => chai.assert.deepEqual(evaluateXPathToMap('let $mapA := map{"a": 1}, $mapB := map:put($mapA, "a", 2) return $mapA', documentNode, blueprint), { a: 1 }));
});

describe('map:entry', () => {
	it(
		'returns a single entry map',
		() => chai.assert.deepEqual(evaluateXPathToMap('map:entry(1, 2)', documentNode, blueprint), { 1: 2 }));
});

describe('map:size', () => {
	it(
		'returns 0 for an empty map',
		() => chai.assert.equal(evaluateXPathToNumber('map:size(map{})', documentNode, blueprint), 0));

	it(
		'returns 2 for a map with two values',
		() => chai.assert.equal(evaluateXPathToNumber('map:size(map{1:1, 2:2})', documentNode, blueprint), 2));
});

describe('map:keys', () => {
	it(
		'returns the empty sequence for an empty map',
		() => chai.assert.equal(evaluateXPathToNumber('count(map:keys(map{}))', documentNode, blueprint), 0));

	it(
		'returns the keys for a map with values',
		() => chai.assert.deepEqual(evaluateXPathToStrings('map:keys(map{"a":1, "b":2})', documentNode, blueprint), ['a', 'b']));
});

describe('map:contains', () => {
	it(
		'returns false if the key is not present',
		() => chai.assert.isFalse(evaluateXPathToBoolean('map:contains(map{}, "a")', documentNode, blueprint)));

	it(
		'returns true if the key is present',
		() => chai.assert.isTrue(evaluateXPathToBoolean('map:contains(map{"a":1}, "a")', documentNode, blueprint)));
});

describe('map:remove', () => {
	it(
		'removes an item from the map',
		() => chai.assert.deepEqual(evaluateXPathToMap('map:remove(map{"a": 1}, "a")', documentNode, blueprint), {}));

	it(
		'does nothing if the key is not present',
		() => chai.assert.deepEqual(evaluateXPathToMap('map:remove(map{"a":1}, "b")', documentNode, blueprint), { a: 1 }));

	it(
		'removes multiple items if multiple keys are passed',
		() => chai.assert.deepEqual(evaluateXPathToMap('map:remove(map{"a":1, "b": 2, "c": 3}, ("a", "b"))', documentNode, blueprint), { c: 3 }));
});

describe('map:for-each', () => {
	it(
		'executes a function over every item',
		() => chai.assert.deepEqual(evaluateXPathToMap('map:for-each(map{"a":"b", "b": "c"}, concat#2)', documentNode, blueprint), { a: 'ab', b: 'bc' }));
});
