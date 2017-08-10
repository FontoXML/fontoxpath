import * as slimdom from 'slimdom';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

import {
	evaluateXPathToMap,
	evaluateXPathToNumber,
	evaluateXPathToBoolean,
	evaluateXPathToStrings
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('functions over maps', () => {
	describe('map:get', () => {
		it('can get a value from a map using a string key',
			() => chai.assert.equal(evaluateXPathToNumber('map:get(map {"a": 1, "b":2}, "a")', documentNode), 1));

		it('can get a value from a map multiple times',
			() => chai.assert.equal(evaluateXPathToNumber('let $map := map {"a": (1,2,3,4)} return count($map("a")) + count($map("a") => reverse())', documentNode), 8));

		it('can get a value from a map using a boolean key',
			() => chai.assert.equal(evaluateXPathToNumber('map:get(map {true(): 1, false():2}, true())', documentNode), 1));

		it('can get a value from a map using a numeric key',
			() => chai.assert.equal(evaluateXPathToNumber('map:get(map {1: 1, 2:2}, 1)', documentNode), 1));

		it('returns the empty sequence if nothing matches: numeric vs other',
			() => chai.assert.equal(evaluateXPathToNumber('count(map:get(map {1: 1, 2:2}, false()))', documentNode), 0));

		it('returns the empty sequence if nothing matches: other vs numeric',
			() => chai.assert.equal(evaluateXPathToNumber('count(map:get(map {true(): 1, 2:2}, 1))', documentNode), 0));

		it('is aliased to "executing the map function"',
			() => chai.assert.equal(evaluateXPathToNumber('(map {"a": 1, "b":2})("a")', documentNode), 1));

		it('returns the correct value when passes NaN',
			() => chai.assert.equal(evaluateXPathToNumber('(map {number("NaN"): 1, "b":2})(number("NaN"))', documentNode), 1));

		it('can be chained',
			() => chai.assert.equal(evaluateXPathToNumber('(map {"a": map{1:1}})("a")(1)', documentNode), 1));

		it('works with async params', async () => {
			chai.assert.equal(await evaluateXPathToAsyncSingleton(`
(map {
	"a" => fontoxpath:sleep(): map{
		1: 1 => fontoxpath:sleep()
	} => fontoxpath:sleep()
})("a")(1 => fontoxpath:sleep())
`, documentNode), 1);
		});
	});

	describe('map:merge', () => {
		it('can merge two maps',
			() => chai.assert.deepEqual(evaluateXPathToMap('map:merge((map {"a": 1}, map{"b":2}))', documentNode), { a: 1, b: 2 }));

		it('can merge two maps asynchronously', async () => {
			chai.assert.deepEqual(await evaluateXPathToAsyncSingleton('map:merge((map {"a": 1}, map{"b":2} => fontoxpath:sleep()))'), { a: 1, b: 2 });
		});

		it('can handle duplicates: use-first',
			() => chai.assert.deepEqual(evaluateXPathToMap(`
map:merge((
  map {"a": 1},
  map {"a": 2}
), map {"duplicates": "use-first"})`, documentNode), { a: 1 }));

		it('defaults to use-first duplication handling if no options are passed',
			() => chai.assert.deepEqual(evaluateXPathToMap(`
map:merge((
  map {"a": 1},
  map {"a": 2}
))`, documentNode), { a: 1 }));

		it('defaults to use-first duplication handling if no duplicates entry is present in the map',
			() => chai.assert.deepEqual(evaluateXPathToMap(`
map:merge((
  map {"a": 1},
  map {"a": 2}
), map{})`, documentNode), { a: 1 }));

		it('can handle duplicates: use-last',
			() => chai.assert.deepEqual(evaluateXPathToMap(`
map:merge((
  map {"a": 1},
  map {"a": 2}
), map {"duplicates": "use-last"})`, documentNode), { a: 2 }));

		it('can handle duplicates: use-any',
			() => chai.assert.deepEqual(evaluateXPathToMap(`
map:merge((
  map {"a": 1},
  map {"a": 2}
), map {"duplicates": "use-any"})`, documentNode), { a: 1 }));

		it('can handle duplicates: combine',
			() => chai.assert.isTrue(evaluateXPathToBoolean(`
map:merge((
  map {"a": 1},
  map {"a": 2}
), map {"duplicates": "combine"}) => deep-equal(map{"a": (1,2)})`, documentNode)));

		it('can handle duplicates: reject',
			() => chai.assert.throws(() => evaluateXPathToMap(`
map:merge((
  map {"a": 1},
  map {"a": 2}
), map {"duplicates": "reject"})`, documentNode), 'FOJS0003'));
	});

	describe('map:put', () => {
		it('adds an item to a map',
			() => chai.assert.deepEqual(evaluateXPathToMap('map{"a": 1} => map:put("b", 2)', documentNode), { a: 1, b: 2 }));

		it('replaces the old value',
			() => chai.assert.deepEqual(evaluateXPathToMap('map{"a": 1} => map:put("a", 2)', documentNode), { a: 2 }));

		it('does not mutate the map',
			() => chai.assert.deepEqual(evaluateXPathToMap('let $mapA := map{"a": 1}, $mapB := map:put($mapA, "a", 2) return $mapA', documentNode), { a: 1 }));

		it('can put an item into a map which is resolved asynchronously', async () => {
			chai.assert.deepEqual(await evaluateXPathToAsyncSingleton('map:put(map {"a": 1} => fontoxpath:sleep(), "b", 2)'), { a: 1, b: 2 });
		});
		it('can put an item into a map whereby the key is resolved asynchronously', async () => {
			chai.assert.deepEqual(await evaluateXPathToAsyncSingleton('map:put(map {"a": 1}, "b" => fontoxpath:sleep(), 2)'), { a: 1, b: 2 });
		});
		it('can put an item into a map whereby the value is resolved asynchronously', async () => {
			chai.assert.deepEqual(await evaluateXPathToAsyncSingleton('map:put(map {"a": 1}, "b", 2 => fontoxpath:sleep())'), { a: 1, b: 2 });
		});
	});

	describe('map:entry', () => {
		it('returns a single entry map',
			() => chai.assert.deepEqual(evaluateXPathToMap('map:entry(1, 2)', documentNode), { 1: 2 }));
	});

	describe('map:size', () => {
		it('returns 0 for an empty map',
			() => chai.assert.equal(evaluateXPathToNumber('map:size(map{})', documentNode), 0));

		it('returns 2 for a map with two values',
			() => chai.assert.equal(evaluateXPathToNumber('map:size(map{1:1, 2:2})', documentNode), 2));

		it('works with async params', async () => {
			chai.assert.equal(await evaluateXPathToAsyncSingleton(`
(map {
	"a" => fontoxpath:sleep(): map{
		1: 1 => fontoxpath:sleep()
	} => fontoxpath:sleep()
})("a")(1 => fontoxpath:sleep())
`, documentNode), 1);
		});
	});

	describe('map:keys', () => {
		it('returns the empty sequence for an empty map',
			() => chai.assert.equal(evaluateXPathToNumber('count(map:keys(map{}))', documentNode), 0));

		it('returns the keys for a map with values',
			() => chai.assert.deepEqual(evaluateXPathToStrings('map:keys(map{"a":1, "b":2})', documentNode), ['a', 'b']));
		it('returns the keys of merged maps',
			() => chai.assert.isTrue(evaluateXPathToBoolean('let $result := map:keys(map:merge((map:entry("a", "1"), map:entry("b", 2)))) return $result = "a"', documentNode)));
		it('works with async params', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('let $result := map:keys(map{"a": 1, "b": 2} => fontoxpath:sleep()) return $result = "a"', documentNode));
		});
	});

	describe('map:contains', () => {
		it('returns false if the key is not present',
			() => chai.assert.isFalse(evaluateXPathToBoolean('map:contains(map{}, "a")', documentNode)));

		it('returns true if the key is present',
			() => chai.assert.isTrue(evaluateXPathToBoolean('map:contains(map{"a":1}, "a")', documentNode)));

		it('works with async params', async () => {
			chai.assert.isTrue(await evaluateXPathToAsyncSingleton('map:contains(map{"a":1} => fontoxpath:sleep(), "a")', documentNode));
		});
	});

	describe('map:remove', () => {
		it('removes an item from the map',
			() => chai.assert.deepEqual(evaluateXPathToMap('map:remove(map{"a": 1}, "a")', documentNode), {}));

		it('works with async params', async () => {
			chai.assert.deepEqual(await evaluateXPathToAsyncSingleton('map:remove(map{"a":1} => fontoxpath:sleep(), "a")', documentNode), {});
		});

		it('does nothing if the key is not present',
			() => chai.assert.deepEqual(evaluateXPathToMap('map:remove(map{"a":1}, "b")', documentNode), { a: 1 }));

		it('removes multiple items if multiple keys are passed',
			() => chai.assert.deepEqual(evaluateXPathToMap('map:remove(map{"a":1, "b": 2, "c": 3}, ("a", "b"))', documentNode), { c: 3 }));
	});

	describe('map:for-each', () => {
		it('executes a function over every item',
			() => chai.assert.deepEqual(evaluateXPathToMap('map:for-each(map{"a":"b", "b": "c"}, concat#2)', documentNode), { a: 'ab', b: 'bc' }));
		it('works with async params', async () => {
			chai.assert.deepEqual(await evaluateXPathToAsyncSingleton('map:for-each(map{"a":1, "b": 2} => fontoxpath:sleep(), function ($key, $val) {$key || $val})', documentNode), { a: 'a1', b: 'b2' });
		});
	});
});
