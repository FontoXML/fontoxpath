import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import {
	evaluateXPathToNodes,
	evaluateXPathToNumber,
	evaluateXPathToBoolean,
	evaluateXPathToStrings,
	evaluateXPathToString
} from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('functions', () => {

	describe('last()', () => {
		it('returns the length of the dynamic context size',
		   () => chai.assert.equal(evaluateXPathToNumber('(1,2,3)[last()]', documentNode, domFacade), 3));
		it('uses the size of the current dynamic context',
		   () => chai.assert.equal(evaluateXPathToNumber('(1,2,3)[. > 2][last()]', documentNode, domFacade), 3));
		it('can target the second to last item',
		   () => chai.assert.equal(evaluateXPathToNumber('(1,2,3)[last() - 1]', documentNode, domFacade), 2));
	});

	describe('position()', () => {
		it('returns the index in the dynamic context', () => {
			const selector = ('(1,2,3)[position() = 2]');
			chai.expect(
				evaluateXPathToNumber(selector, documentNode, domFacade)
			).to.equal(2);
		});
	});

	describe('number', () => {
		it('Calling the zero-argument version of the function is defined to give the same result as calling the single-argument version with the context item (.). That is, fn:number() is equivalent to fn:number(.), as defined by the rules that follow.', () => {
			const selector = ('number()');
			chai.expect(
				evaluateXPathToNumber(selector, documentNode, domFacade)
			).to.be.NaN;
		});

		it('If $arg is the empty sequence or if $arg cannot be converted to an xs:double, the xs:double value NaN is returned.', () => {
			chai.expect(evaluateXPathToNumber('number()', documentNode, domFacade)).to.be.NaN;
			chai.expect(evaluateXPathToNumber('number(())', documentNode, domFacade)).to.be.NaN;
			chai.expect(evaluateXPathToNumber('number("zero")', documentNode, domFacade)).to.be.NaN;
		});

		it('Otherwise, $arg is converted to an xs:double following the rules of 19.1.2.2 Casting to xs:double. If the conversion to xs:double fails, the xs:double value NaN is returned.', () => {
			const selector1 = ('number("123")'),
			selector2 = ('number("12.3")');
			chai.expect(
				evaluateXPathToNumber(selector1, documentNode, domFacade)
			).to.equal(123);
			chai.expect(
				evaluateXPathToNumber(selector2, documentNode, domFacade)
			).to.equal(12.3);
		});

		it.skip('A dynamic error is raised [err:XPDY0002] if $arg is omitted and the context item is absent.', () => {
			const selector = ('number()');
			chai.expect(() => {
				evaluateXPathToNumber(selector, documentNode, domFacade);
			}).to.throw(/XPDY0002/);
		});

		it.skip('As a consequence of the rules given above, a type error occurs if the context item cannot be atomized, or if the result of atomizing the context item is a sequence containing more than one atomic value.', () => {
			const selector = ('number()');
			chai.expect(() => {
				evaluateXPathToNumber(selector, documentNode, domFacade);
			}).to.throw();
		});
	});


	describe('boolean', () => {
		it('If $arg is the empty sequence, fn:boolean returns false.', () => {
			const selector = ('boolean(())');
			chai.expect(
				evaluateXPathToBoolean(selector, documentNode, domFacade)
			).to.equal(false);
		});

		it('If $arg is a sequence whose first item is a node, fn:boolean returns true.', () => {
			const selector = ('boolean(.)');
			chai.expect(
				evaluateXPathToBoolean(selector, documentNode, domFacade)
			).to.equal(true);
		});

		it('If $arg is a singleton value of type xs:boolean or a derived from xs:boolean, fn:boolean returns $arg.', () => {
			const selector1 = ('boolean(true())'),
			selector2 = ('boolean(false())');
			chai.expect(
				evaluateXPathToBoolean(selector1, documentNode, domFacade)
			).to.equal(true);
			chai.expect(
				evaluateXPathToBoolean(selector2, documentNode, domFacade)
			).to.equal(false);
		});

		it('If $arg is a singleton value of type xs:string or a type derived from xs:string, xs:anyURI or a type derived from xs:anyURI or xs:untypedAtomic, fn:boolean returns false if the operand value has zero length; otherwise it returns true.', () => {
			const selector1 = ('boolean("test")'),
			selector2 = ('boolean("")');
			chai.expect(
				evaluateXPathToBoolean(selector1, documentNode, domFacade)
			).to.equal(true);
			chai.expect(
				evaluateXPathToBoolean(selector2, documentNode, domFacade)
			).to.equal(false);
		});

		it('If $arg is a singleton value of any numeric type or a type derived from a numeric type, fn:boolean returns false if the operand value is NaN or is numerically equal to zero; otherwise it returns true.', () => {
			const selector1 = ('boolean(1)'),
			selector2 = ('boolean(0)'),
			selector3 = ('boolean(+("not a number" (: string coerce to double will be NaN :)))');
			chai.expect(
				evaluateXPathToBoolean(selector1, documentNode, domFacade)
			).to.equal(true, '1');
			chai.expect(
				evaluateXPathToBoolean(selector2, documentNode, domFacade)
			).to.equal(false, '0');
			chai.expect(
				evaluateXPathToBoolean(selector3, documentNode, domFacade)
			).to.equal(false, 'NaN');
		});

		it('In all other cases, fn:boolean raises a type error [err:FORG0006].', () => {
			const selector = ('boolean(("a", "b", "c"))');
			chai.expect(() => {
				evaluateXPathToBoolean(selector, documentNode, domFacade);
			}).to.throw(/FORG0006/);
		});
	});

	describe('reverse()', () => {
		it('Returns the empty sequence when reversing the empty sequence', () => {
			chai.expect(evaluateXPathToStrings('reverse(())', documentNode, domFacade)).to.deep.equal([]);
		});

		it('Returns a sequence containing the items in $arg in reverse order.', () => {
			chai.expect(evaluateXPathToString('reverse(("1","2","3")) => string-join(",")', documentNode, domFacade)).to.equal('3,2,1');
		});
	});

	describe('Arrow functions', () => {
		it('pipes the result to the next function', () => {
			const selector = ('true() => not()');
			chai.expect(
				evaluateXPathToBoolean(selector, documentNode, domFacade)
			).to.deep.equal(false);
		});

		it('can be chained', () => {
			const selector = ('(1,2,3) => count() => count()');
			chai.expect(
				evaluateXPathToNumber(selector, documentNode, domFacade)
			).to.deep.equal(1);
		});
	});

	describe('id()', () => {
		it('returns nothing if nothing matches',
		   () => chai.expect(evaluateXPathToNodes('id("some-id")', documentNode, domFacade)).to.deep.equal([]));

		it('returns nothing if the second parameter is not a node', () => {
			jsonMlMapper.parse([
				'someElement',
				{
					id: 'some-id'
				}
			], documentNode);

			chai.expect(evaluateXPathToNodes('(1)!id("some-id")', documentNode, domFacade)).to.deep.equal([]);
		});

		it('returns an element with the given id', () => {
			const selector = ('id("some-id", .)');
			jsonMlMapper.parse([
				'someElement',
				{
					id: 'some-id'
				}
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement]);
		});

		it('returns the first element with the given id', () => {
			const selector = ('id("some-id", .)');
			jsonMlMapper.parse([
				'someParentElement',
				[
					'someElement',
					{
						id: 'some-id'
					}
				],
				[
					'someElement',
					{
						id: 'some-id'
					}
				]
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement.firstChild]);
		});

		it('it defaults to the context item when the $node argument is omitted', () => {
			const selector = ('id("some-id")');
			jsonMlMapper.parse([
				'someParentElement',
				[
					'someElement',
					{
						id: 'some-id'
					}
				],
				[
					'someElement',
					{
						id: 'some-id'
					}
				]
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement.firstChild]);
		});

		it('it returns the first matching element, per given idref, separated by spaces', () => {
			const selector = ('id("some-id some-other-id")');
			jsonMlMapper.parse([
				'someParentElement',
				[
					'someElement',
					{
						id: 'some-id'
					}
				],
				[
					'someElement',
					{
						id: 'some-other-id'
					}
				]
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]);
		});

		it('it returns the first matching element, per given idref, as separate strings', () => {
			const selector = ('id(("some-id", "some-other-id"))');
			jsonMlMapper.parse([
				'someParentElement',
				[
					'someElement',
					{
						id: 'some-id'
					}
				],
				[
					'someElement',
					{
						id: 'some-other-id'
					}
				]
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]);
		});

		it('it returns the matching elements in document order', () => {
			const selector = ('id(("some-other-id", "some-id"))');
			jsonMlMapper.parse([
				'someParentElement',
				{
					id: 'some-id'
				},
				[
					'someElement',
					{
						id: 'some-other-id'
					}
				]
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement, documentNode.documentElement.firstChild]);
		});
	});

	describe('idref', () => {
		it('returns an element with the given idref', () => {
			const selector = ('idref("some-id", .)');
			jsonMlMapper.parse([
				'someElement',
				{
					idref: 'some-id'
				}
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement]);
		});

		it('returns an element with multiple idrefs, containing the given idref', () => {
			const selector = ('idref("some-id", .)');
			jsonMlMapper.parse([
				'someElement',
				{
					idref: 'some-other-id some-id yet-some-other-id'
				}
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement]);
		});

		it('searches for multiple id refs', () => {
			const selector = ('idref(("some-id", "some-other-id"), .)');
			jsonMlMapper.parse([
				'someElement',
				[
					'someElement',
					{
						idref: 'some-id yet-some-other-id'
					}
				],
				[
					'someElement',
					{
						idref: 'some-other-id'
					}
				]
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]);
		});

		it('uses the context item is the $node argument is missing', () => {
			const selector = ('idref(("some-id", "some-other-id"))');
			jsonMlMapper.parse([
				'someElement',
				[
					'someElement',
					{
						idref: 'some-id yet-some-other-id'
					}
				],
				[
					'someElement',
					{
						idref: 'some-other-id'
					}
				]
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]);
		});
	});

	describe('op:intersect()', () => {
		it('returns an empty sequence if both args are an empty sequences', () => {
			const selector = ('op:intersect((), ())');
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([]);
		});

		it('returns an empty sequence if one of the operands is the empty sequence', () => {
			let selector = ('op:intersect(., ())');
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([]);
			selector = ('op:intersect((), .)');
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([]);
		});

		it('returns the intersect between two node sequences', () => {
			const selector = ('op:intersect(//*[@someAttribute], //b)');
			jsonMlMapper.parse([
				'someNode',
				['a', {someAttribute: 'someValue'}],
				['b', {someAttribute: 'someOtherValue'}]
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement.lastChild]);
		});

		it('is bound to the intersect operator', () => {
			const selector = ('//*[@someAttribute] intersect //b');
			jsonMlMapper.parse([
				'someNode',
				['a', {someAttribute: 'someValue'}],
				['b', {someAttribute: 'someOtherValue'}]
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement.lastChild]);
		});
	});

	describe('op:except()', () => {
		it('returns an empty sequence if both args are an empty sequences', () => {
			const selector = ('op:except((), ())');
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([]);
		});

		it('returns the filled sequence if the first operand is the empty sequence', () => {
			const selector = ('op:except(., ())');
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode]);
		});

		it('returns the empty sequence if the second operand is empty', () => {
			const selector = ('op:except((), .)');
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([]);
		});

		it('returns the first node sequence, except nodes from the second sequence', () => {
			const selector = ('op:except(//*[@someAttribute], //b)');
			jsonMlMapper.parse([
				'someNode',
				['a', {someAttribute: 'someValue'}],
				['b', {someAttribute: 'someOtherValue'}]
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement.firstChild]);
		});

		it('is bound to the except operator', () => {
			const selector = ('//*[@someAttribute] except //b');
			jsonMlMapper.parse([
				'someNode',
				['a', {someAttribute: 'someValue'}],
				['b', {someAttribute: 'someOtherValue'}]
			], documentNode);
			chai.expect(
				evaluateXPathToNodes(selector, documentNode, domFacade)
			).to.deep.equal([documentNode.documentElement.firstChild]);
		});
	});

	describe('unknown functions', () => {
		it('throws when trying to execute an unknown function',
		   () => chai.assert.throws(() => evaluateXPathToString('blerp()', documentNode, domFacade), 'XPST0017'));
		it('computes which function the dev might mean',
		   () => chai.assert.throws(() => evaluateXPathToString('sterts-with()', documentNode, domFacade), 'starts-with'));
	});
});
