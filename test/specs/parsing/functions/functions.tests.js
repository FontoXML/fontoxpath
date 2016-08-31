define([
	'fontoxml-blueprints/readOnlyBlueprint',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/parsing/createSelectorFromXPath',
	'fontoxml-selectors/addXPathCustomTest',
	'fontoxml-selectors/evaluateXPath'
], function (
	blueprint,
	jsonMLMapper,
	slimdom,

	parseSelector,
	addXPathCustomTest,
	evaluateXPath
) {
	'use strict';

	var documentNode;
	beforeEach(function () {
		documentNode = slimdom.createDocument();
	});

	describe('functions', function () {
		describe('tokenize', function () {
			it('If $input is the empty sequence, or if $input is the zero-length string, the function returns the empty sequence.', function () {
				var selector = parseSelector('tokenize(())');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.deep.equal([]);
				selector = parseSelector('tokenize("")');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.deep.equal([]);
			});
			it('The function returns a sequence of strings formed by breaking the $input string into a sequence of strings, treating any substring that matches $pattern as a separator. The separators themselves are not returned.', function () {
				var selector = parseSelector('tokenize("A piece of text")');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.deep.equal(['A', 'piece', 'of', 'text']);
				selector = parseSelector('tokenize("A,piece,of,text", ",")');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.deep.equal(['A', 'piece', 'of', 'text']);
			});
			it('Except with the one-argument form of the function, if a separator occurs at the start of the $input string, the result sequence will start with a zero-length string. Similarly, zero-length strings will also occur in the result sequence if a separator occurs at the end of the $input string, or if two adjacent substrings match the supplied $pattern.', function () {
				var selector = parseSelector('tokenize(",A,piece,of,text", ",")');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.deep.equal(['', 'A', 'piece', 'of', 'text']);
			});
			// Javascript regexes don't work this way
			it.skip('If two alternatives within the supplied $pattern both match at the same position in the $input string, then the match that is chosen is the first.', function () {
				var selector = parseSelector('tokenize("abracadabra", "(ab)|(a)")');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.deep.equal(['', 'r', 'c', 'd', 'r', '']);
			});
		});

		describe('last()', function () {
			it('returns the length of the dynamic context size', function () {
				var selector = parseSelector('(1,2,3)[last()]');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal(3);
			});
			it('can target the second to last item', function () {
				var selector = parseSelector('(1,2,3)[last() - 1]');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal(2);
			});
		});

		describe('position()', function () {
			it('returns the index in the dynamic context', function () {
				var selector = parseSelector('(1,2,3)[position() = 2]');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal(2);
			});
		});

		describe('count()', function () {
			it('returns the length of the sequence', function () {
				var selector = parseSelector('count((1 to 1000))');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal(1000);
			});

			it('returns the length of the empty sequence', function () {
				var selector = parseSelector('count(())');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal(0);
			});

			it('returns the length of a singleton sequence', function () {
				var selector = parseSelector('count((1))');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal(1);
			});
		});

		describe('number', function () {
			it('Calling the zero-argument version of the function is defined to give the same result as calling the single-argument version with the context item (.). That is, fn:number() is equivalent to fn:number(.), as defined by the rules that follow.', function () {
				var selector = parseSelector('number()');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.be.NaN;
			});

			it('If $arg is the empty sequence or if $arg cannot be converted to an xs:double, the xs:double value NaN is returned.', function () {
				var selector1 = parseSelector('number(())'),
					selector2 = parseSelector('number()');
				chai.expect(
					evaluateXPath(selector1, documentNode, blueprint)
				).to.be.NaN;
				chai.expect(
					evaluateXPath(selector2, documentNode, blueprint)
				).to.be.NaN;
			});

			it('Otherwise, $arg is converted to an xs:double following the rules of 19.1.2.2 Casting to xs:double. If the conversion to xs:double fails, the xs:double value NaN is returned.', function () {
				var selector1 = parseSelector('number("123")'),
				selector2 = parseSelector('number("12.3")');
				chai.expect(
					evaluateXPath(selector1, documentNode, blueprint)
				).to.equal(123);
				chai.expect(
					evaluateXPath(selector2, documentNode, blueprint)
				).to.equal(12.3);
			});

			it.skip('A dynamic error is raised [err:XPDY0002] if $arg is omitted and the context item is absent.', function () {
				var selector = parseSelector('number()');
				chai.expect(function () {
					evaluateXPath(selector, documentNode, blueprint);
				}).to.throw(/XPDY0002/);
			});

			it.skip('As a consequence of the rules given above, a type error occurs if the context item cannot be atomized, or if the result of atomizing the context item is a sequence containing more than one atomic value.', function () {
				var selector = parseSelector('number()');
				chai.expect(function () {
					evaluateXPath(selector, documentNode, blueprint);
				}).to.throw();
			});
		});


		describe('boolean', function () {
			it('If $arg is the empty sequence, fn:boolean returns false.', function () {
				var selector = parseSelector('boolean(())');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal(false);
			});

			it('If $arg is a sequence whose first item is a node, fn:boolean returns true.', function () {
				var selector = parseSelector('boolean(.)');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal(true);
			});

			it('If $arg is a singleton value of type xs:boolean or a derived from xs:boolean, fn:boolean returns $arg.', function () {
				var selector1 = parseSelector('boolean(true())'),
				selector2 = parseSelector('boolean(false())');
				chai.expect(
					evaluateXPath(selector1, documentNode, blueprint)
				).to.equal(true);
				chai.expect(
					evaluateXPath(selector2, documentNode, blueprint)
				).to.equal(false);
			});

			it('If $arg is a singleton value of type xs:string or a type derived from xs:string, xs:anyURI or a type derived from xs:anyURI or xs:untypedAtomic, fn:boolean returns false if the operand value has zero length; otherwise it returns true.', function () {
				var selector1 = parseSelector('boolean("test")'),
					selector2 = parseSelector('boolean("")');
				chai.expect(
					evaluateXPath(selector1, documentNode, blueprint)
				).to.equal(true);
				chai.expect(
					evaluateXPath(selector2, documentNode, blueprint)
				).to.equal(false);
			});

			it('If $arg is a singleton value of any numeric type or a type derived from a numeric type, fn:boolean returns false if the operand value is NaN or is numerically equal to zero; otherwise it returns true.', function () {
				var selector1 = parseSelector('boolean(1)'),
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

			it('In all other cases, fn:boolean raises a type error [err:FORG0006].', function () {
				var selector = parseSelector('boolean(("a", "b", "c"))');
				chai.expect(function () {
					evaluateXPath(selector, documentNode, blueprint);
				}).to.throw(/FORG0006/);
			});
		});

		describe('string', function () {
			it('In the zero-argument version of the function, $arg defaults to the context item. That is, calling fn:string() is equivalent to calling fn:string(.).', function () {
				var selector = parseSelector('string()');
				jsonMLMapper.parse('Some text.', documentNode);
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal('Some text.');
			});

			it('If $arg is the empty sequence, the function returns the zero-length string.', function () {
				var selector = parseSelector('string(())');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal('');
			});

			it('If $arg is a node, the function returns string value of the node, as obtained using the dm:string-value accessor defined in [XQuery and XPath Data Model (XDM) 3.0] (see Section 5.13 string-value Accessor).', function () {
				var selector = parseSelector('string(.)');
				jsonMLMapper.parse('Some text.', documentNode);
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.equal('Some text.');
			});

			it('If $arg is an atomic value, the function returns the result of the expression $arg cast as xs:string (see 19 Casting).', function () {
				var selector1 = parseSelector('string(12)'),
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

			it.skip('A dynamic error is raised [err:XPDY0002] by the zero-argument version of the function if the context item is absent.', function () {
				var selector = parseSelector('string()');
				chai.expect(function () {
					evaluateXPath(selector, documentNode, blueprint);
				}).to.throw(/XPDY0002/);
			});
		});

		describe('concat', function () {
			it('concats two strings', function () {
				chai.expect(evaluateXPath('concat("a","b")', documentNode, blueprint)).to.equal('ab');
			});

			it('concats multiple strings', function () {
				chai.expect(evaluateXPath('concat("a","b","c","d","e")', documentNode, blueprint)).to.equal('abcde');
			});

		});

		describe('string-join()', function () {
			it('The function returns an xs:string created by concatenating the items in the sequence $arg1, in order, using the value of $arg2 as a separator between adjacent items.', function () {
				chai.expect(evaluateXPath('string-join(("a", "b", "c"), "X")', documentNode, blueprint, {}, evaluateXPath.STRING_TYPE)).to.equal('aXbXc');
			});
			it('If the value of $arg2 is the zero-length string, then the members of $arg1 are concatenated without a separator.', function () {
				chai.expect(evaluateXPath('string-join(("a", "b", "c"))', documentNode, blueprint, {}, evaluateXPath.STRING_TYPE)).to.equal('abc');
			});

			it('If the value of $arg2 is the zero-length string, then the members of $arg1 are concatenated without a separator.', function () {
				chai.expect(evaluateXPath('string-join(("a", "b", "c"), "")', documentNode, blueprint, {}, evaluateXPath.STRING_TYPE)).to.equal('abc');
			});
			it('returns the empty string when joining the empty sequence', function () {
				chai.expect(evaluateXPath('string-join((), "X")', documentNode, blueprint, {}, evaluateXPath.STRING_TYPE)).to.equal('');
			});
		});

		describe('reverse()', function () {
			it('Returns the empty sequence when reversing the empty sequence', function () {
				chai.expect(evaluateXPath('reverse(())', documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([]);
			});

			it('Returns a sequence containing the items in $arg in reverse order.', function () {
				chai.expect(evaluateXPath('reverse(("1","2","3")) => string-join(",")', documentNode, blueprint, {}, evaluateXPath.STRING_TYPE)).to.equal('3,2,1');
			});
		});

		describe('Arrow functions', function () {
			it('pipes the result to the next function', function () {
				var selector = parseSelector('true() => not()');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.deep.equal(false);
			});

			it('can be chained', function () {
				var selector = parseSelector('(1,2,3) => count() => count()');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.deep.equal(1);
			});
		});

		describe('node-name()', function () {
			it('returns an empty sequence if $arg is an empty sequence', function () {
				var selector = parseSelector('node-name(())');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.deep.equal([]);
			});

			it('it defaults to the context item when the argument is omitted', function () {
				var selector = parseSelector('node-name()');
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

			it('it returns the node name of the given context', function () {
				var selector = parseSelector('node-name(.)');
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

		describe('name()', function () {
			it('returns an empty sequence if $arg is an empty sequence', function () {
				var selector = parseSelector('name(())');
				chai.expect(
					evaluateXPath(selector, documentNode, blueprint)
				).to.deep.equal([]);
			});

			it('it defaults to the context item when the argument is omitted', function () {
				var selector = parseSelector('name()');
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

			it('it returns the node name of the given context', function () {
				var selector = parseSelector('name(.)');
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
	});
});
