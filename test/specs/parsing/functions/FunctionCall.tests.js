import jsonMlMapper from 'test-helpers/jsonMlMapper';
import * as slimdom from 'slimdom';

import {
	evaluateXPathToBoolean,
	evaluateXPathToString,
	evaluateXPathToStrings,
	evaluateXPathToNumbers,
	evaluateXPathToNumber,
	evaluateXPathToAsyncIterator
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('Dynamic function call', () => {
	it('parses with a function with any number of arguments',
		() => chai.assert.equal(evaluateXPathToString('let $fn := concat#3 return $fn("abc", "def", "ghi")', documentNode), 'abcdefghi'));

	it('parses a function with a function to be executed as one of its arguments',
	   () => chai.assert.equal(evaluateXPathToString('let $fn := concat#2 return $fn(avg((10, 20)), max((2, 50)))', documentNode), '1550'));

	it('allows recursion',
		() => chai.assert.equal(evaluateXPathToNumber('let $fn := function ($recurse, $i) {if ($i < 100) then $recurse($recurse, $i + 1) else $i } return $fn($fn, 0)', documentNode), 100));

	it('allows async recursion', async () => {
		const it = evaluateXPathToAsyncIterator('let $fn := function ($recurse, $i) {if ($i < 100) then fontoxpath:sleep($recurse($recurse, $i + 1), 1) else $i } return $fn($fn, 0)', documentNode);

		chai.assert.equal((await it.next()).value, 100);
	   chai.assert.equal((await it.next()).done, true);
	});

	it('Fibonacci', async () => {
		const it = evaluateXPathToAsyncIterator(
			`
let $fib := function ($recurse, $a, $b) {
 ($a, $recurse($recurse, $b, $a + $b))
},
$fib-entries := $fib($fib, 1, 1)
return $fib-entries
`,
			documentNode);
		chai.assert.equal((await it.next()).value, 1);
		chai.assert.equal((await it.next()).value, 1);
		chai.assert.equal((await it.next()).value, 2);
		chai.assert.equal((await it.next()).value, 3);
		chai.assert.equal((await it.next()).value, 5);
		chai.assert.equal((await it.next()).value, 8);
	   	chai.assert.equal((await it.next()).value, 13);
	   	chai.assert.equal((await it.next()).value, 21);
	   	chai.assert.equal((await it.next()).value, 34);
	});

	it('parses a function with a fixed number of arguments',
		() => chai.assert.isFalse(evaluateXPathToBoolean('let $fn := not#1 return $fn(true())', documentNode)));

	it('parses a function with a node lookup', () => {
		jsonMlMapper.parse([
				'someElement',
				{
					someAttribute1: 'someValue1',
					someAttribute2: 'someValue2',
					someAttribute3: 'someValue3'
				}
			], documentNode);
		chai.assert.equal(evaluateXPathToString('let $fn := string-join#2 return $fn(@node()/name(), ",")', documentNode.firstChild), 'someAttribute1,someAttribute2,someAttribute3');
	});

	it('parses a function with a no arguments',
		() => chai.assert.isFalse(evaluateXPathToBoolean('let $fn := false#0 return $fn()', documentNode)));

	it('throws when the base expression does not evaluate to a function',
		() => chai.assert.throws(() => evaluateXPathToString('let $notfn := 123 return $notfn("someArgument")', documentNode), 'XPTY0004'));

	it('throws when the base expression evaluates to a non-singleton sequence of functions',
		() => chai.assert.throws(() => evaluateXPathToString('(false#0, false#0)()', documentNode), 'XPTY0004'));

	it('throws when a function is called with the wrong type of arguments',
		() => chai.assert.throws(() => evaluateXPathToString('let $fn := ends-with#2 return $fn(0, 0)', documentNode), 'XPTY0004'));

	it('throws when a function is called with the wrong number of arguments',
		() => chai.assert.throws(() => evaluateXPathToString('let $fn := false#0 return $fn(1, 2)', documentNode), 'XPTY0004'));

	it('throws when a function with the wrong arity cannot be found',
		() => chai.assert.throws(() => evaluateXPathToString('let $fn := false#2 return $fn(1, 2)', documentNode), 'XPST0017'));

	it('allows a spaces around the arguments',
		() => chai.assert.equal(evaluateXPathToString('concat( (), () )', documentNode), ''));
});

describe('function argument transformation', () => {
	it('atomizes attributes to anyUntypedAtomic, then transforming it to a string', () => {
		jsonMlMapper.parse([
			'someElement',
			{
				attr: 'a b c'
			}
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToStrings('@attr => tokenize()', documentNode.firstChild), ['a', 'b', 'c']);
	});

	it('atomizes attributes to anyUntypedAtomic, then transforming it to a numerical value', () => {
		jsonMlMapper.parse([
			'someElement',
			{
				attr: '1'
			}
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNumbers('@attr to 2', documentNode.firstChild), [1, 2]);
	});

	it('fails if an argument is not convertable', () => {
		jsonMlMapper.parse([
			'someElement',
			{
				attr: 'not something numerical'
			}
		], documentNode);
		chai.assert.throws(() => evaluateXPathToNumbers('@attr to 2', documentNode.firstChild), 'FORG0001');
	});
});
