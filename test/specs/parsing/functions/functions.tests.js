import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import evaluateXPathToBoolean from 'fontoxml-selectors/evaluateXPathToBoolean';
import evaluateXPathToString from 'fontoxml-selectors/evaluateXPathToString';
import evaluateXPathToStrings from 'fontoxml-selectors/evaluateXPathToStrings';
import evaluateXPathToNumber from 'fontoxml-selectors/evaluateXPathToNumber';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('functions', () => {
	describe('tokenize', () => {
		it('If $input is the empty sequence, or if $input is the zero-length string, the function returns the empty sequence.', () => {
			let selector = parseSelector('tokenize(())');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([]);
			selector = parseSelector('tokenize("")');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([]);
		});

		it('The function returns a sequence of strings formed by breaking the $input string into a sequence of strings, treating any substring that matches $pattern as a separator. The separators themselves are not returned.', () => {
			let selector = parseSelector('tokenize("A piece of text")');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(['A', 'piece', 'of', 'text']);
			selector = parseSelector('tokenize("A,piece,of,text", ",")');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(['A', 'piece', 'of', 'text']);
		});

		it('Except with the one-argument form of the function, if a separator occurs at the start of the $input string, the result sequence will start with a zero-length string. Similarly, zero-length strings will also occur in the result sequence if a separator occurs at the end of the $input string, or if two adjacent substrings match the supplied $pattern.', () => {
			const selector = parseSelector('tokenize(",A,piece,of,text", ",")');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(['', 'A', 'piece', 'of', 'text']);
		});

		// Javascript regexes don't work this way
		it.skip('If two alternatives within the supplied $pattern both match at the same position in the $input string, then the match that is chosen is the first.', () => {
			const selector = parseSelector('tokenize("abracadabra", "(ab)|(a)")');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(['', 'r', 'c', 'd', 'r', '']);
		});
	});

	describe('normalize-space()', () => {
		it('Returns the value of $arg with whitespace normalized by stripping leading and trailing whitespace and replacing sequences of one or more than one whitespace character with a single space, #x20.', () => {
			chai.expect(evaluateXPath('normalize-space("  something with a lot of		  spaces	   ")', documentNode, blueprint)).to.equal('something with a lot of spaces');
		});

		it('If the value of $arg is the empty sequence, returns the zero-length string.', () => {
			chai.expect(evaluateXPath('normalize-space(())', documentNode, blueprint)).to.equal('');
		});

		it('If no argument is supplied, then $arg defaults to the string value (calculated using fn:string()) of the context item (.)', () => {
			documentNode.appendChild(documentNode.createTextNode('   A piece	of text  '));
			chai.expect(evaluateXPath('./normalize-space()', documentNode, blueprint)).to.equal('A piece of text');
		});
	});

	describe('starts-with()', () => {
		it('returns true for tattoo starts with tat',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('starts-with("tattoo", "tat")', documentNode, blueprint)));
		it('returns true if arg2 is the empty string',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('starts-with("abc", "")', documentNode, blueprint)));
		it('returns true if arg2 is the empty sequence (coerces to empty string)',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('starts-with("abc", ())', documentNode, blueprint)));
		it('returns false if arg1 is the empty string',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('starts-with("", "abc")', documentNode, blueprint)));
		it('returns false if arg1 is the empty sequence (coerces to empty string)',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('starts-with((), "abc")', documentNode, blueprint)));
		it('returns true if arg1 and arg2 are empty strings',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('starts-with("", "")', documentNode, blueprint)));
		it('returns false if arg1 does not start with arg2',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('starts-with("tattoo", "abc")', documentNode, blueprint)));
	});

	describe('ends-with()', () => {
		it('returns true for tattoo ends with too',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('ends-with("tattoo", "too")', documentNode, blueprint)));
		it('returns true if arg2 is the empty string',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('ends-with("abc", "")', documentNode, blueprint)));
		it('returns true if arg2 is the empty sequence (coerces to empty string)',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('ends-with("abc", ())', documentNode, blueprint)));
		it('returns false if arg1 is the empty string',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('ends-with("", "abc")', documentNode, blueprint)));
		it('returns false if arg1 is the empty sequence (coerces to empty string)',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('ends-with((), "abc")', documentNode, blueprint)));
		it('returns true if arg1 and arg2 are empty strings',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('ends-with("", "")', documentNode, blueprint)));
		it('returns false if arg1 does not start with arg2',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('ends-with("tattoo", "abc")', documentNode, blueprint)));
	});

	describe('last()', () => {
		it('returns the length of the dynamic context size',
		   () => chai.assert.equal(evaluateXPathToNumber('(1,2,3)[last()]', documentNode, blueprint), 3));
		it('uses the size of the current dynamic context',
		   () => chai.assert.equal(evaluateXPathToNumber('(1,2,3)[. > 2][last()]', documentNode, blueprint), 3));
		it('can target the second to last item',
		   () => chai.assert.equal(evaluateXPathToNumber('(1,2,3)[last() - 1]', documentNode, blueprint), 2));
	});

	describe('position()', () => {
		it('returns the index in the dynamic context', () => {
			const selector = parseSelector('(1,2,3)[position() = 2]');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(2);
		});
	});

	describe('number', () => {
		it('Calling the zero-argument version of the function is defined to give the same result as calling the single-argument version with the context item (.). That is, fn:number() is equivalent to fn:number(.), as defined by the rules that follow.', () => {
			const selector = parseSelector('number()');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.be.NaN;
		});

		it('If $arg is the empty sequence or if $arg cannot be converted to an xs:double, the xs:double value NaN is returned.', () => {
			chai.expect(evaluateXPath('number()', documentNode, blueprint)).to.be.NaN;
			chai.expect(evaluateXPath('number(())', documentNode, blueprint)).to.be.NaN;
			chai.expect(evaluateXPath('number("zero")', documentNode, blueprint)).to.be.NaN;
		});

		it('Otherwise, $arg is converted to an xs:double following the rules of 19.1.2.2 Casting to xs:double. If the conversion to xs:double fails, the xs:double value NaN is returned.', () => {
			const selector1 = parseSelector('number("123")'),
			selector2 = parseSelector('number("12.3")');
			chai.expect(
				evaluateXPath(selector1, documentNode, blueprint)
			).to.equal(123);
			chai.expect(
				evaluateXPath(selector2, documentNode, blueprint)
			).to.equal(12.3);
		});

		it.skip('A dynamic error is raised [err:XPDY0002] if $arg is omitted and the context item is absent.', () => {
			const selector = parseSelector('number()');
			chai.expect(() => {
				evaluateXPath(selector, documentNode, blueprint);
			}).to.throw(/XPDY0002/);
		});

		it.skip('As a consequence of the rules given above, a type error occurs if the context item cannot be atomized, or if the result of atomizing the context item is a sequence containing more than one atomic value.', () => {
			const selector = parseSelector('number()');
			chai.expect(() => {
				evaluateXPath(selector, documentNode, blueprint);
			}).to.throw();
		});
	});


	describe('boolean', () => {
		it('If $arg is the empty sequence, fn:boolean returns false.', () => {
			const selector = parseSelector('boolean(())');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(false);
		});

		it('If $arg is a sequence whose first item is a node, fn:boolean returns true.', () => {
			const selector = parseSelector('boolean(.)');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal(true);
		});

		it('If $arg is a singleton value of type xs:boolean or a derived from xs:boolean, fn:boolean returns $arg.', () => {
			const selector1 = parseSelector('boolean(true())'),
			selector2 = parseSelector('boolean(false())');
			chai.expect(
				evaluateXPath(selector1, documentNode, blueprint)
			).to.equal(true);
			chai.expect(
				evaluateXPath(selector2, documentNode, blueprint)
			).to.equal(false);
		});

		it('If $arg is a singleton value of type xs:string or a type derived from xs:string, xs:anyURI or a type derived from xs:anyURI or xs:untypedAtomic, fn:boolean returns false if the operand value has zero length; otherwise it returns true.', () => {
			const selector1 = parseSelector('boolean("test")'),
			selector2 = parseSelector('boolean("")');
			chai.expect(
				evaluateXPath(selector1, documentNode, blueprint)
			).to.equal(true);
			chai.expect(
				evaluateXPath(selector2, documentNode, blueprint)
			).to.equal(false);
		});

		it('If $arg is a singleton value of any numeric type or a type derived from a numeric type, fn:boolean returns false if the operand value is NaN or is numerically equal to zero; otherwise it returns true.', () => {
			const selector1 = parseSelector('boolean(1)'),
			selector2 = parseSelector('boolean(0)'),
			selector3 = parseSelector('boolean(+("not a number" (: string coerce to double will be NaN :)))');
			chai.expect(
				evaluateXPath(selector1, documentNode, blueprint)
			).to.equal(true, '1');
			chai.expect(
				evaluateXPath(selector2, documentNode, blueprint)
			).to.equal(false, '0');
			chai.expect(
				evaluateXPath(selector3, documentNode, blueprint)
			).to.equal(false, 'NaN');
		});

		it('In all other cases, fn:boolean raises a type error [err:FORG0006].', () => {
			const selector = parseSelector('boolean(("a", "b", "c"))');
			chai.expect(() => {
				evaluateXPath(selector, documentNode, blueprint);
			}).to.throw(/FORG0006/);
		});
	});

	describe('string', () => {
		it('In the zero-argument version of the function, $arg defaults to the context item. That is, calling fn:string() is equivalent to calling fn:string(.).', () => {
			const selector = parseSelector('string()');
			jsonMLMapper.parse('Some text.', documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal('Some text.');
		});

		it('returns the string value of the passed node: text nodes.', () => {
			jsonMLMapper.parse('Some text.', documentNode);
			chai.expect(evaluateXPath('string()', documentNode.firstChild, blueprint)).to.equal('Some text.');
		});

		it('If $arg is the empty sequence, the function returns the zero-length string.', () => {
			const selector = parseSelector('string(())');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.equal('');
		});

		describe('If $arg is a node, the function returns string value of the node, as obtained using the dm:string-value accessor defined in [XQuery and XPath Data Model (XDM) 3.0] (see Section 5.13 string-value Accessor).', () => {
			it('works directly on a textNode', () => {
				const selector = parseSelector('string(.)');
				jsonMLMapper.parse('Some text.', documentNode);
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal('Some text.');
			});

			it('works on descendants', () => {
				const selector = parseSelector('string(.)');
				jsonMLMapper.parse([
					'someElement',
					'Some text.'
				], documentNode);
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal('Some text.');
			});

			it('concatenates textNodes', () => {
				const selector = parseSelector('string(.)');
				jsonMLMapper.parse([
					'someElement',
					'Some text, and ',
					'some other text node'
				], documentNode);
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal('Some text, and some other text node');
			});
		});

		it('If $arg is an atomic value, the function returns the result of the expression $arg cast as xs:string (see 19 Casting).', () => {
			const selector1 = parseSelector('string(12)'),
			selector2 = parseSelector('string("13")'),
			selector3 = parseSelector('string(true())'),
			selector4 = parseSelector('string(false())');
			chai.expect(
				evaluateXPath(selector1, documentNode, blueprint)
			).to.equal('12');
			chai.expect(
				evaluateXPath(selector2, documentNode, blueprint)
			).to.equal('13');
			chai.expect(
				evaluateXPath(selector3, documentNode, blueprint)
			).to.equal('true');
			chai.expect(
				evaluateXPath(selector4, documentNode, blueprint)
			).to.equal('false');
		});

		it.skip('A dynamic error is raised [err:XPDY0002] by the zero-argument version of the function if the context item is absent.', () => {
			const selector = parseSelector('string()');
			chai.expect(() => {
				evaluateXPath(selector, documentNode, blueprint);
			}).to.throw(/XPDY0002/);
		});
	});

	describe('concat', () => {
		it('concats two strings', () => {
			chai.expect(evaluateXPath('concat("a","b")', documentNode, blueprint)).to.equal('ab');
		});

		it('concats multiple strings', () => {
			chai.expect(evaluateXPath('concat("a","b","c","d","e")', documentNode, blueprint)).to.equal('abcde');
		});
	});

	describe('string-length', () => {
		it('returns 0 for the empty string', () => {
			chai.expect(evaluateXPath('string-length(())', documentNode, blueprint)).to.equal(0);
		});

		it('returns the string length', () => {
			chai.expect(evaluateXPath('string-length("fortytwo")', documentNode, blueprint)).to.equal(8);
		});

		it('uses the context node when no arguments were passed', () => {
			jsonMLMapper.parse(['someElement', 'A piece of text'], documentNode);
			chai.expect(evaluateXPath('/someElement/string-length()', documentNode, blueprint)).to.equal(15);
		});

		it('counts codepoints.not characters', () => {
			// '💩'.length === 2
			chai.expect(evaluateXPath('string-length("💩")', documentNode, blueprint)).to.equal(1);
		});
	});

	describe('string-join()', () => {
		it('The function returns an xs:string created by concatenating the items in the sequence $arg1, in order, using the value of $arg2 as a separator between adjacent items.', () => {
			chai.expect(evaluateXPath('string-join(("a", "b", "c"), "X")', documentNode, blueprint, {}, evaluateXPath.STRING_TYPE)).to.equal('aXbXc');
		});

		it('If the value of $arg2 is the zero-length string, then the members of $arg1 are concatenated without a separator.', () => {
			chai.expect(evaluateXPath('string-join(("a", "b", "c"))', documentNode, blueprint, {}, evaluateXPath.STRING_TYPE)).to.equal('abc');
		});

		it('If the value of $arg2 is the zero-length string, then the members of $arg1 are concatenated without a separator.', () => {
			chai.expect(evaluateXPath('string-join(("a", "b", "c"), "")', documentNode, blueprint, {}, evaluateXPath.STRING_TYPE)).to.equal('abc');
		});

		it('returns the empty string when joining the empty sequence', () => {
			chai.expect(evaluateXPath('string-join((), "X")', documentNode, blueprint, {}, evaluateXPath.STRING_TYPE)).to.equal('');
		});
	});

	describe('reverse()', () => {
		it('Returns the empty sequence when reversing the empty sequence', () => {
			chai.expect(evaluateXPath('reverse(())', documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([]);
		});

		it('Returns a sequence containing the items in $arg in reverse order.', () => {
			chai.expect(evaluateXPath('reverse(("1","2","3")) => string-join(",")', documentNode, blueprint, {}, evaluateXPath.STRING_TYPE)).to.equal('3,2,1');
		});
	});

	describe('Arrow functions', () => {
		it('pipes the result to the next function', () => {
			const selector = parseSelector('true() => not()');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(false);
		});

		it('can be chained', () => {
			const selector = parseSelector('(1,2,3) => count() => count()');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal(1);
		});
	});

	describe('node-name()', () => {
		it('returns an empty sequence if $arg is an empty sequence', () => {
			const selector = parseSelector('node-name(())');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint)
			).to.deep.equal([]);
		});

		it('it defaults to the context item when the argument is omitted', () => {
			const selector = parseSelector('node-name()');
			jsonMLMapper.parse([
				'someElement',
				[
					'Some text.'
				]
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode.firstChild, blueprint)
			).to.equal('someElement');
		});

		it('it returns the node name of the given context', () => {
			const selector = parseSelector('node-name(.)');
			jsonMLMapper.parse([
				'someElement',
				[
					'Some text.'
				]
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode.firstChild, blueprint)
			).to.equal('someElement');
		});
	});

	describe('name()', () => {
		it('returns an empty sequence if $arg is an empty sequence',
		   () => chai.assert.deepEqual(evaluateXPathToStrings('name(())', documentNode, blueprint), []));

		it('it defaults to the context item when the argument is omitted', () => {
			jsonMLMapper.parse(['someElement'], documentNode);
			chai.assert.equal(evaluateXPathToString('name()', documentNode.firstChild, blueprint), 'someElement');
		});

		it('it returns the node name of the given context', () => {
			jsonMLMapper.parse(['someElement'], documentNode);
			chai.assert.equal(evaluateXPathToString('name(.)', documentNode.firstChild, blueprint), 'someElement');
		});

		it('it returns the target of a processing instruction', () => {
			jsonMLMapper.parse(['?some-pi', 'some data'], documentNode);
			chai.assert.equal(evaluateXPathToString('name(.)', documentNode.firstChild, blueprint), 'some-pi');
		});

		it('it returns the name of an attribute', () => {
			jsonMLMapper.parse(['someElement', {someAttribute: 'someValue'}], documentNode);
			chai.assert.equal(evaluateXPathToString('name(@someAttribute)', documentNode.firstChild, blueprint), 'someAttribute');
		});

		it('it returns the empty string for comments', () => {
			jsonMLMapper.parse(['!', 'some comment'], documentNode);
			chai.assert.equal(evaluateXPathToStrings('name(.)', documentNode.firstChild, blueprint), '');
		});

		it('it returns the empty string for documents', () => {
			chai.assert.equal(evaluateXPathToStrings('name(.)', documentNode, blueprint), '');
		});
	});

	describe('id()', () => {
		it('returns nothing if nothing matches',
		   () => chai.expect(evaluateXPath('id("some-id")', documentNode, blueprint)).to.deep.equal([]));

		it('returns nothing if the second parameter is not a node', () => {
			jsonMLMapper.parse([
				'someElement',
				{
					id: 'some-id'
				}
			], documentNode);

			chai.expect(evaluateXPath('(1)!id("some-id")', documentNode, blueprint)).to.deep.equal([]);
		});

		it('returns an element with the given id', () => {
			const selector = parseSelector('id("some-id", .)');
			jsonMLMapper.parse([
				'someElement',
				{
					id: 'some-id'
				}
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement]);
		});

		it('returns the first element with the given id', () => {
			const selector = parseSelector('id("some-id", .)');
			jsonMLMapper.parse([
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
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement.firstChild]);
		});

		it('it defaults to the context item when the $node argument is omitted', () => {
			const selector = parseSelector('id("some-id")');
			jsonMLMapper.parse([
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
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement.firstChild]);
		});

		it('it returns the first matching element, per given idref, separated by spaces', () => {
			const selector = parseSelector('id("some-id some-other-id")');
			jsonMLMapper.parse([
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
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]);
		});

		it('it returns the first matching element, per given idref, as separate strings', () => {
			const selector = parseSelector('id(("some-id", "some-other-id"))');
			jsonMLMapper.parse([
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
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]);
		});

		it('it returns the matching elements in document order', () => {
			const selector = parseSelector('id(("some-other-id", "some-id"))');
			jsonMLMapper.parse([
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
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement, documentNode.documentElement.firstChild]);
		});
	});

	describe('idref', () => {
		it('returns an element with the given idref', () => {
			const selector = parseSelector('idref("some-id", .)');
			jsonMLMapper.parse([
				'someElement',
				{
					idref: 'some-id'
				}
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement]);
		});

		it('returns an element with multiple idrefs, containing the given idref', () => {
			const selector = parseSelector('idref("some-id", .)');
			jsonMLMapper.parse([
				'someElement',
				{
					idref: 'some-other-id some-id yet-some-other-id'
				}
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement]);
		});

		it('searches for multiple id refs', () => {
			const selector = parseSelector('idref(("some-id", "some-other-id"), .)');
			jsonMLMapper.parse([
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
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]);
		});

		it('uses the context item is the $node argument is missing', () => {
			const selector = parseSelector('idref(("some-id", "some-other-id"))');
			jsonMLMapper.parse([
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
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement.firstChild, documentNode.documentElement.lastChild]);
		});
	});

	describe('op:intersect()', () => {
		it('returns an empty sequence if both args are an empty sequences', () => {
			const selector = parseSelector('op:intersect((), ())');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([]);
		});

		it('returns an empty sequence if one of the operands is the empty sequence', () => {
			let selector = parseSelector('op:intersect(., ())');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([]);
			selector = parseSelector('op:intersect((), .)');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([]);
		});

		it('returns the intersect between two node sequences', () => {
			const selector = parseSelector('op:intersect(//*[@someAttribute], //b)');
			jsonMLMapper.parse([
				'someNode',
				['a', {someAttribute: 'someValue'}],
				['b', {someAttribute: 'someOtherValue'}]
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement.lastChild]);
		});

		it('is bound to the intersect operator', () => {
			const selector = parseSelector('//*[@someAttribute] intersect //b');
			jsonMLMapper.parse([
				'someNode',
				['a', {someAttribute: 'someValue'}],
				['b', {someAttribute: 'someOtherValue'}]
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement.lastChild]);
		});
	});

	describe('op:except()', () => {
		it('returns an empty sequence if both args are an empty sequences', () => {
			const selector = parseSelector('op:except((), ())');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([]);
		});

		it('returns the filled sequence if the first operand is the empty sequence', () => {
			const selector = parseSelector('op:except(., ())');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode]);
		});

		it('returns the empty sequence if the second operand is empty', () => {
			const selector = parseSelector('op:except((), .)');
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([]);
		});

		it('returns the first node sequence, except nodes from the second sequence', () => {
			const selector = parseSelector('op:except(//*[@someAttribute], //b)');
			jsonMLMapper.parse([
				'someNode',
				['a', {someAttribute: 'someValue'}],
				['b', {someAttribute: 'someOtherValue'}]
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement.firstChild]);
		});

		it('is bound to the except operator', () => {
			const selector = parseSelector('//*[@someAttribute] except //b');
			jsonMLMapper.parse([
				'someNode',
				['a', {someAttribute: 'someValue'}],
				['b', {someAttribute: 'someOtherValue'}]
			], documentNode);
			chai.expect(
				evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)
			).to.deep.equal([documentNode.documentElement.firstChild]);
		});
	});
});
