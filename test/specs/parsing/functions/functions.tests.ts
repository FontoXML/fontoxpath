import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToBoolean,
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToString,
	evaluateXPathToStrings,
} from 'fontoxpath';

import evaluateXPathToAsyncSingleton from 'test-helpers/evaluateXPathToAsyncSingleton';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('functions', () => {
	describe('last()', () => {
		it('returns the length of the dynamic context size', () =>
			chai.assert.equal(evaluateXPathToNumber('(1,2,3)[last()]', documentNode), 3));
		it('Works with paths', () => {
			jsonMlMapper.parse(
				['someParentElement', ...new Array(10).fill(['someElement'])],
				documentNode
			);

			chai.assert.equal(
				evaluateXPathToString(
					'/descendant::*/(last() - position())!string()=>string-join(",")',
					documentNode
				),
				'10,9,8,7,6,5,4,3,2,1,0'
			);
		});
		it('uses the size of the current dynamic context', () =>
			chai.assert.equal(evaluateXPathToNumber('(1,2,3)[. > 2][last()]', documentNode), 3));
		it('can target the second to last item', () =>
			chai.assert.equal(evaluateXPathToNumber('(1,2,3)[last() - 1]', documentNode), 2));
		it('works in async sequences', async () => {
			chai.assert.equal(
				await evaluateXPathToAsyncSingleton('((1,2,3) => fontoxpath:sleep(1))[last()]'),
				3
			);
		});
	});

	describe('position()', () => {
		it('returns the index in the dynamic context', () =>
			chai.assert.equal(evaluateXPathToNumber('(1,2,3)[position() = 2]', documentNode), 2));
	});

	describe('number', () => {
		it('Calling the zero-argument version of the function is defined to give the same result as calling the single-argument version with the context item (.). That is, fn:number() is equivalent to fn:number(.), as defined by the rules that follow.', () =>
			chai.assert.isNaN(evaluateXPathToNumber('number()', documentNode)));

		it('If $arg is the empty sequence or if $arg cannot be converted to an xs:double, the xs:double value NaN is returned.', () => {
			chai.assert.isNaN(evaluateXPathToNumber('number()', documentNode));
			chai.assert.isNaN(evaluateXPathToNumber('number(())', documentNode));
			chai.assert.isNaN(evaluateXPathToNumber('number("zero")', documentNode));
		});

		it('Otherwise, $arg is converted to an xs:double following the rules of 19.1.2.2 Casting to xs:double. If the conversion to xs:double fails, the xs:double value NaN is returned.', () => {
			chai.assert.equal(evaluateXPathToNumber('number("123")', documentNode), 123);
			chai.assert.equal(evaluateXPathToNumber('number("12.3")', documentNode), 12.3);
		});

		it('A dynamic error is raised [err:XPDY0002] if $arg is omitted and the context item is absent.', () =>
			chai.assert.throws(() => evaluateXPathToNumber('number()'), 'XPDY0002'));

		it('As a consequence of the rules given above, a type error occurs if the context item cannot be atomized, or if the result of atomizing the context item is a sequence containing more than one atomic value.', () =>
			chai.assert.throws(
				() => evaluateXPathToNumber('number(concat#2)', documentNode),
				'FOTY0013'
			));
		it('allows async input', async () => {
			chai.assert.equal(
				await evaluateXPathToAsyncSingleton('number(fontoxpath:sleep(10, 10))'),
				10
			);
		});
	});

	describe('boolean', () => {
		it('If $arg is the empty sequence, fn:boolean returns false.', () =>
			chai.assert.isFalse(evaluateXPathToBoolean('boolean(())', documentNode)));

		it('If $arg is a sequence whose first item is a node, fn:boolean returns true.', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('boolean(.)', documentNode)));

		it('If $arg is a singleton value of type xs:boolean or a derived from xs:boolean, fn:boolean returns $arg.', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('boolean(true())', documentNode));
			chai.assert.isFalse(evaluateXPathToBoolean('boolean(false())', documentNode));
		});

		it('If $arg is a singleton value of type xs:string or a type derived from xs:string, xs:anyURI or a type derived from xs:anyURI or xs:untypedAtomic, fn:boolean returns false if the operand value has zero length; otherwise it returns true.', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('boolean("test")', documentNode));
			chai.assert.isFalse(evaluateXPathToBoolean('boolean("")', documentNode));
		});

		it('If $arg is a singleton value of any numeric type or a type derived from a numeric type, fn:boolean returns false if the operand value is NaN or is numerically equal to zero; otherwise it returns true.', () => {
			chai.assert.isTrue(evaluateXPathToBoolean('boolean(1)', documentNode));
			chai.assert.isFalse(evaluateXPathToBoolean('boolean(0)', documentNode));
			chai.assert.isFalse(
				evaluateXPathToBoolean(
					'boolean(+("not a number" (: string coerce to double will be NaN :)))',
					documentNode
				)
			);
		});

		it('In all other cases, fn:boolean raises a type error [err:FORG0006].', () =>
			chai.assert.throw(
				() => evaluateXPathToBoolean('boolean(("a", "b", "c"))', documentNode),
				/FORG0006/
			));
	});

	describe('reverse()', () => {
		it('Returns the empty sequence when reversing the empty sequence', () =>
			chai.assert.deepEqual(evaluateXPathToStrings('reverse(())', documentNode), []));

		it('Returns a sequence containing the items in $arg in reverse order.', () =>
			chai.assert.equal(
				evaluateXPathToString('reverse(("1","2","3")) => string-join(",")', documentNode),
				'3,2,1'
			));
	});

	describe('Arrow functions', () => {
		it('pipes the result to the next function', () =>
			chai.assert.isFalse(evaluateXPathToBoolean('true() => not()', documentNode)));

		it('can be chained', () =>
			chai.assert.equal(
				evaluateXPathToNumber('(1,2,3) => count() => count()', documentNode),
				1
			));
	});

	describe('id()', () => {
		it('returns nothing if nothing matches', () =>
			chai.assert.deepEqual(evaluateXPathToNodes('id("some-id")', documentNode), []));

		it('it defaults to the context item when the $node argument is omitted', () => {
			jsonMlMapper.parse(
				[
					'someParentElement',
					[
						'someElement',
						{
							id: 'some-id',
						},
					],
					[
						'someElement',
						{
							id: 'some-id',
						},
					],
				],
				documentNode
			);
			chai.assert.deepEqual(evaluateXPathToNodes('id("some-id")', documentNode), [
				documentNode.documentElement.firstChild,
			]);
		});

		it('throws error nothing if the context item is not a node when the $node argument is not omitted', () => {
			jsonMlMapper.parse(
				[
					'someElement',
					{
						id: 'some-id',
					},
				],
				documentNode
			);
			chai.assert.throws(
				() => evaluateXPathToNodes('(1)!id("some-id")', documentNode),
				'XPTY0004'
			);
		});

		it('throws error nothing if the context item is absent when the $node argument is not omitted', () => {
			jsonMlMapper.parse(
				[
					'someElement',
					{
						id: 'some-id',
					},
				],
				documentNode
			);
			chai.assert.throws(
				() => evaluateXPathToNodes('(function() { id("some-id") })()', documentNode),
				'XPDY0002'
			);
		});

		it('returns an element with the given id', () => {
			jsonMlMapper.parse(
				[
					'someElement',
					{
						id: 'some-id',
					},
				],
				documentNode
			);
			chai.assert.deepEqual(evaluateXPathToNodes('id("some-id", .)', documentNode), [
				documentNode.documentElement,
			]);
		});

		it('returns the first element with the given id', () => {
			jsonMlMapper.parse(
				[
					'someParentElement',
					[
						'someElement',
						{
							id: 'some-id',
						},
					],
					[
						'someElement',
						{
							id: 'some-id',
						},
					],
				],
				documentNode
			);
			chai.assert.deepEqual(evaluateXPathToNodes('id("some-id", .)', documentNode), [
				documentNode.documentElement.firstChild,
			]);
		});

		it('it returns the first matching element, per given idref, separated by spaces', () => {
			jsonMlMapper.parse(
				[
					'someParentElement',
					[
						'someElement',
						{
							id: 'some-id',
						},
					],
					[
						'someElement',
						{
							id: 'some-other-id',
						},
					],
				],
				documentNode
			);
			chai.assert.deepEqual(
				evaluateXPathToNodes('id("some-id some-other-id")', documentNode),
				[documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]
			);
		});

		it('it returns the first matching element, per given idref, as separate strings', () => {
			jsonMlMapper.parse(
				[
					'someParentElement',
					[
						'someElement',
						{
							id: 'some-id',
						},
					],
					[
						'someElement',
						{
							id: 'some-other-id',
						},
					],
				],
				documentNode
			);
			chai.assert.deepEqual(
				evaluateXPathToNodes('id(("some-id", "some-other-id"))', documentNode),
				[documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]
			);
		});

		it('it returns the matching elements in document order', () => {
			jsonMlMapper.parse(
				[
					'someParentElement',
					{
						id: 'some-id',
					},
					[
						'someElement',
						{
							id: 'some-other-id',
						},
					],
				],
				documentNode
			);
			chai.assert.deepEqual(
				evaluateXPathToNodes('id(("some-other-id", "some-id"))', documentNode),
				[documentNode.documentElement, documentNode.documentElement.firstChild]
			);
		});

		it('it throws error when the root node of the target node is not a document node', () => {
			const someElement = documentNode.createElement('someElement');
			someElement.setAttribute('id', 'some-id');

			chai.assert.throws(
				() => evaluateXPathToNodes('id(("some-id", .))', someElement),
				'FODC0001'
			);
		});
	});

	describe('idref', () => {
		it('uses the context item is the $node argument is missing', () => {
			jsonMlMapper.parse(
				[
					'someElement',
					[
						'someElement',
						{
							idref: 'some-id yet-some-other-id',
						},
					],
					[
						'someElement',
						{
							idref: 'some-other-id',
						},
					],
				],
				documentNode
			);
			chai.assert.deepEqual(
				evaluateXPathToNodes('idref(("some-id", "some-other-id"))', documentNode),
				[documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]
			);
		});

		it('throws error nothing if the context item is not a node when the $node argument is not omitted', () => {
			jsonMlMapper.parse(
				[
					'someElement',
					{
						id: 'some-id',
					},
				],
				documentNode
			);
			chai.assert.throws(
				() => evaluateXPathToNodes('(1)!idref("some-id")', documentNode),
				'XPTY0004'
			);
		});

		it('throws error nothing if the context item is absent when the $node argument is not omitted', () => {
			jsonMlMapper.parse(
				[
					'someElement',
					{
						id: 'some-id',
					},
				],
				documentNode
			);
			chai.assert.throws(
				() => evaluateXPathToNodes('(function() { idref("some-id") })()', documentNode),
				'XPDY0002'
			);
		});

		it('returns an element with the given idref', () => {
			jsonMlMapper.parse(
				[
					'someElement',
					{
						idref: 'some-id',
					},
				],
				documentNode
			);
			chai.assert.deepEqual(evaluateXPathToNodes('idref("some-id", .)', documentNode), [
				documentNode.documentElement,
			]);
		});

		it('returns an element with multiple idrefs, containing the given idref', () => {
			jsonMlMapper.parse(
				[
					'someElement',
					{
						idref: 'some-other-id some-id yet-some-other-id',
					},
				],
				documentNode
			);
			chai.assert.deepEqual(evaluateXPathToNodes('idref("some-id", .)', documentNode), [
				documentNode.documentElement,
			]);
		});

		it('searches for multiple id refs', () => {
			jsonMlMapper.parse(
				[
					'someElement',
					[
						'someElement',
						{
							idref: 'some-id yet-some-other-id',
						},
					],
					[
						'someElement',
						{
							idref: 'some-other-id',
						},
					],
				],
				documentNode
			);
			chai.assert.deepEqual(
				evaluateXPathToNodes('idref(("some-id", "some-other-id"), .)', documentNode),
				[documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]
			);
		});

		it('it throws error when the root node of the target node is not a document node', () => {
			const someElement = documentNode.createElement('someElement');
			someElement.setAttribute('idref', 'some-id');

			chai.assert.throws(
				() => evaluateXPathToNodes('idref(("some-id", .))', someElement),
				'FODC0001'
			);
		});
	});

	describe('unknown functions', () => {
		it('throws when trying to execute an unknown function', () =>
			chai.assert.throws(() => evaluateXPathToString('blerp()', documentNode), 'XPST0017'));
		it('computes which function the dev might mean', () =>
			chai.assert.throws(
				() => evaluateXPathToString('sterts-with()', documentNode),
				'starts-with'
			));
	});

	describe('resolving function names', () => {
		it('can resolve a function using an injected function name resolver', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean('bleep:bloop()', null, null, null, {
					functionNameResolver: ({ localName, prefix }, arity) => {
						chai.assert.equal(localName, 'bloop');
						chai.assert.equal(prefix, 'bleep');
						chai.assert.equal(arity, 0);

						return {
							namespaceURI: 'http://www.w3.org/2005/xpath-functions',
							localName: 'true',
						};
					},
				})
			));

		it('can resolve a function w/o a prefix using an injected function name resolver', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean('bloop()', null, null, null, {
					functionNameResolver: ({ localName, prefix }, arity) => {
						chai.assert.equal(localName, 'bloop');
						chai.assert.equal(prefix, '');
						chai.assert.equal(arity, 0);

						return {
							namespaceURI: 'http://www.w3.org/2005/xpath-functions',
							localName: 'true',
						};
					},
				})
			));

		it('does not erronously cache function resolving', () => {
			chai.assert.isTrue(
				evaluateXPathToBoolean('bloop()', null, null, null, {
					functionNameResolver: ({ localName, prefix }, arity) => {
						chai.assert.equal(localName, 'bloop');
						chai.assert.equal(prefix, '');
						chai.assert.equal(arity, 0);

						return {
							namespaceURI: 'http://www.w3.org/2005/xpath-functions',
							localName: 'true',
						};
					},
				})
			);
			chai.assert.isFalse(
				evaluateXPathToBoolean('bloop()', null, null, null, {
					functionNameResolver: ({ localName, prefix }, arity) => {
						chai.assert.equal(localName, 'bloop');
						chai.assert.equal(prefix, '');
						chai.assert.equal(arity, 0);

						return {
							namespaceURI: 'http://www.w3.org/2005/xpath-functions',
							localName: 'false',
						};
					},
				})
			);
		});

		it('Throws the correct error when resolving fails', () =>
			chai.assert.throws(
				() =>
					evaluateXPathToBoolean('blurp()', null, null, null, {
						functionNameResolver: ({ localName, prefix }, arity) => {
							chai.assert.equal(localName, 'blurp');
							chai.assert.equal(prefix, '');
							chai.assert.equal(arity, 0);
							return null;
						},
					}),
				'XPST0017'
			));

		it('can resolve a function with a bogus prefix using the injected namespace resolver', () => {
			debugger;
			chai.assert.isTrue(
				evaluateXPathToBoolean('bogus:true()', null, null, null, {
					namespaceResolver: (prefix) => {
						chai.assert.equal(prefix, 'bogus');

						return 'http://www.w3.org/2005/xpath-functions';
					},
				})
			);
		});
		it('Allows the usage of both a namespaceresolver and a functionnameresolver', () => {
			debugger;
			chai.assert.isTrue(
				evaluateXPathToBoolean('bogus:true()', null, null, null, {
					namespaceResolver: (prefix) => {
						chai.assert.equal(prefix, 'bogus');

						return 'BOGUS';
					},
					functionNameResolver: ({ localName, prefix }, arity) => {
						chai.assert.equal(localName, 'true');
						chai.assert.equal(prefix, 'bogus');
						chai.assert.equal(arity, 0);
						return {
							namespaceURI: 'http://www.w3.org/2005/xpath-functions',
							localName: 'true',
						};
					},
				})
			);
		});
	});
});
