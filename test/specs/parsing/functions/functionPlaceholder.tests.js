import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean,
	evaluateXPathToString
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Function placeholders', () => {
	it('parses with one function placeholder',
		() => chai.assert.equal(evaluateXPathToString('let $var := concat("a", ?, "c") return $var("b")', documentNode), 'abc'));

	it('handles the spread operator of concat() well',
		() => chai.assert.equal(evaluateXPathToString('let $var := concat("a", "b", "c", ?, ?, ?) return $var("d", "e", "f")', documentNode), 'abcdef'));

	it('parses with multiple function placeholders',
		() => chai.assert.equal(evaluateXPathToString('let $var := concat("a", ?, ?) return $var("b", "c")', documentNode), 'abc'));

	it('parses with multiple levels of placeholders',
		() => chai.assert.equal(evaluateXPathToString('let $var1 := concat("a", ?, ?) return let $var2 := $var1(?, "c") return $var2("b")', documentNode), 'abc'));

	it('parses with a map as base "function"',
		() => chai.assert.equal(evaluateXPathToString('let $var1 := map { "a": 1, "b": 2 } return let $var2 := $var1(?) return $var2("b")', documentNode), '2'));

	it('does return a function instead of a map when partially applying arguments on a map',
		() => chai.assert.equal(evaluateXPathToBoolean('let $var1 := map { "a": 1, "b": 2 } return let $var2 := $var1(?) return $var2 instance of map(*)', documentNode), false));

	it('throws when a wrong data type is given at partial apply',
		() => chai.assert.throw(evaluateXPathToString.bind(undefined, 'string-join(?, 1)', documentNode), 'XPTY0004'));

	it('throws when a wrong data type is given at reference',
		() => chai.assert.throw(evaluateXPathToString.bind(undefined, 'let $x := name(?) return $x("a")', documentNode), 'XPTY0004'));

	it('does not mutate existing function items',
		() => chai.assert.isTrue(evaluateXPathToBoolean('let $x := concat#2, $x1 := $x("a", ?), $x2 := $x("b", ?) return $x1("b") = "ab" and $x2("c") = "bc"', documentNode)));
});
