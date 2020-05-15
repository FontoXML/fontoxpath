import * as chai from 'chai';
import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPath,
	evaluateXPathToBoolean,
	evaluateXPathToNumber,
	evaluateXPathToNumbers,
	evaluateXPathToString,
	evaluateXPathToStrings,
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('functions over strings', () => {
	describe('compare()', () => {
		it('Returns an empty sequence when one of the inputs is an empty sequence', () => {
			chai.assert.deepEqual(evaluateXPathToStrings('compare("a", ())', documentNode), []);
			chai.assert.deepEqual(evaluateXPathToStrings('compare((), "a")', documentNode), []);
		});

		it('Returns 0 if both inputs are equal', () => {
			chai.assert.equal(evaluateXPathToNumber('compare("a", "a")', documentNode), 0);
			chai.assert.equal(evaluateXPathToNumber('compare("abc", "abc")', documentNode), 0);
			chai.assert.equal(evaluateXPathToNumber('compare("123", "123")', documentNode), 0);
		});

		it('Returns 1 if the first argument is greater than the second argument', () => {
			chai.assert.equal(evaluateXPathToNumber('compare("b", "a")', documentNode), 1);
			chai.assert.equal(evaluateXPathToNumber('compare("x", "a")', documentNode), 1);
			chai.assert.equal(evaluateXPathToNumber('compare("text", "test")', documentNode), 1);
			chai.assert.equal(evaluateXPathToNumber('compare("1", "0")', documentNode), 1);
			chai.assert.equal(evaluateXPathToNumber('compare("5", "10000")', documentNode), 1);
		});

		it('Returns -1 if the first argument is greater than the second argument', () => {
			chai.assert.equal(evaluateXPathToNumber('compare("a", "b")', documentNode), -1);
			chai.assert.equal(evaluateXPathToNumber('compare("a", "x")', documentNode), -1);
			chai.assert.equal(evaluateXPathToNumber('compare("test", "text")', documentNode), -1);
			chai.assert.equal(evaluateXPathToNumber('compare("0", "1")', documentNode), -1);
			chai.assert.equal(evaluateXPathToNumber('compare("10000", "5")', documentNode), -1);
		});

		it('Throws when a collation is used (as third argument)', () => {
			chai.assert.throw(() =>
				evaluateXPathToNumber('compare("a", "a", "collation")', documentNode)
			);
		});
	});

	describe('tokenize', () => {
		it('If $input is the empty sequence, or if $input is the zero-length string, the function returns the empty sequence.', () => {
			chai.assert.deepEqual(evaluateXPathToStrings('tokenize(())', documentNode), []);
			chai.assert.deepEqual(evaluateXPathToStrings('tokenize("")', documentNode), []);
		});

		it('The function returns a sequence of strings formed by breaking the $input string into a sequence of strings, treating any substring that matches $pattern as a separator. The separators themselves are not returned.', () => {
			chai.assert.deepEqual(
				evaluateXPathToStrings('tokenize("A piece of text")', documentNode),
				['A', 'piece', 'of', 'text']
			);
			chai.assert.deepEqual(
				evaluateXPathToStrings('tokenize("A,piece,of,text", ",")', documentNode),
				['A', 'piece', 'of', 'text']
			);
		});

		it('Except with the one-argument form of the function, if a separator occurs at the start of the $input string, the result sequence will start with a zero-length string. Similarly, zero-length strings will also occur in the result sequence if a separator occurs at the end of the $input string, or if two adjacent substrings match the supplied $pattern.', () =>
			chai.assert.deepEqual(
				evaluateXPathToStrings('tokenize(",A,piece,of,text", ",")', documentNode),
				['', 'A', 'piece', 'of', 'text']
			));

		// Javascript regexes don't work this way
		it.skip('If two alternatives within the supplied $pattern both match at the same position in the $input string, then the match that is chosen is the first.', () =>
			chai.assert.deepEqual(
				evaluateXPathToStrings('tokenize("abracadabra", "(ab)|(a)")', documentNode),
				['', 'r', 'c', 'd', 'r', '']
			));
	});

	describe('normalize-space()', () => {
		it('Returns the value of $arg with whitespace normalized by stripping leading and trailing whitespace and replacing sequences of one or more than one whitespace character with a single space, #x20.', () =>
			chai.assert.equal(
				evaluateXPathToString(
					'normalize-space("  something with a lot of		  spaces	   ")',
					documentNode
				),
				'something with a lot of spaces'
			));

		it('If the value of $arg is the empty sequence, returns the zero-length string.', () =>
			chai.assert.equal(evaluateXPathToString('normalize-space(())', documentNode), ''));

		it('If no argument is supplied, then $arg defaults to the string value (calculated using fn:string()) of the context item (.)', () => {
			const textNode = documentNode.createTextNode('   A piece	of text  ');
			chai.assert.equal(
				evaluateXPathToString('./normalize-space()', textNode),
				'A piece of text'
			);
		});
	});

	describe('starts-with()', () => {
		it('returns true for tattoo starts with tat', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean('starts-with("tattoo", "tat")', documentNode)
			));
		it('returns true if arg2 is the empty string', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('starts-with("abc", "")', documentNode)));
		it('returns true if arg2 is the empty sequence (coerces to empty string)', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('starts-with("abc", ())', documentNode)));
		it('returns false if arg1 is the empty string', () =>
			chai.assert.isFalse(evaluateXPathToBoolean('starts-with("", "abc")', documentNode)));
		it('returns false if arg1 is the empty sequence (coerces to empty string)', () =>
			chai.assert.isFalse(evaluateXPathToBoolean('starts-with((), "abc")', documentNode)));
		it('returns true if arg1 and arg2 are empty strings', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('starts-with("", "")', documentNode)));
		it('returns false if arg1 does not start with arg2', () =>
			chai.assert.isFalse(
				evaluateXPathToBoolean('starts-with("tattoo", "abc")', documentNode)
			));
	});

	describe('contains()', () => {
		it('returns true for tattoo contains tat', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('contains("tattoo", "tat")', documentNode)));
		it('returns true for tattoo contains ttoo', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('contains("tattoo", "ttoo")', documentNode)));
		it('returns true for tattoo contains atto', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('contains("tattoo", "atto")', documentNode)));
		it('returns true if arg2 is the empty string', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('contains("abc", "")', documentNode)));
		it('returns true if arg2 is the empty sequence (coerces to empty string)', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('contains("abc", ())', documentNode)));
		it('returns false if arg1 is the empty string', () =>
			chai.assert.isFalse(evaluateXPathToBoolean('contains("", "abc")', documentNode)));
		it('returns false if arg1 is the empty sequence (coerces to empty string)', () =>
			chai.assert.isFalse(evaluateXPathToBoolean('contains((), "abc")', documentNode)));
		it('returns true if arg1 and arg2 are empty strings', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('contains("", "")', documentNode)));
		it('returns false if arg1 does not start with arg2', () =>
			chai.assert.isFalse(evaluateXPathToBoolean('contains("tattoo", "abc")', documentNode)));
	});

	describe('ends-with()', () => {
		it('returns true for tattoo ends with too', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('ends-with("tattoo", "too")', documentNode)));
		it('returns true if arg2 is the empty string', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('ends-with("abc", "")', documentNode)));
		it('returns true if arg2 is the empty sequence (coerces to empty string)', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('ends-with("abc", ())', documentNode)));
		it('returns false if arg1 is the empty string', () =>
			chai.assert.isFalse(evaluateXPathToBoolean('ends-with("", "abc")', documentNode)));
		it('returns false if arg1 is the empty sequence (coerces to empty string)', () =>
			chai.assert.isFalse(evaluateXPathToBoolean('ends-with((), "abc")', documentNode)));
		it('returns true if arg1 and arg2 are empty strings', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('ends-with("", "")', documentNode)));
		it('returns false if arg1 does not start with arg2', () =>
			chai.assert.isFalse(
				evaluateXPathToBoolean('ends-with("tattoo", "abc")', documentNode)
			));
	});

	describe('string', () => {
		it('In the zero-argument version of the function, $arg defaults to the context item. That is, calling fn:string() is equivalent to calling fn:string(.).', () => {
			jsonMlMapper.parse(['someElement', 'Some text.'], documentNode);
			chai.assert.equal(evaluateXPathToString('string()', documentNode), 'Some text.');
		});

		it('returns the string value of the passed node: text nodes.', () => {
			jsonMlMapper.parse(['someElement', 'Some text.'], documentNode);
			chai.assert.equal(
				evaluateXPathToString('string()', documentNode.documentElement.firstChild),
				'Some text.'
			);
		});

		it('returns the string value of the passed node: PI nodes.', () => {
			jsonMlMapper.parse(['?someTarget', 'A piece of text'], documentNode);
			chai.assert.equal(
				evaluateXPathToString('string()', documentNode.firstChild),
				'A piece of text'
			);
		});

		it('regards CDATA nodes as text nodes', () => {
			const document = new slimdom.Document();
			const element = document.appendChild(document.createElement('test'));
			element.appendChild(document.createTextNode('Some '));
			element.appendChild(document.createCDATASection('<CDATA>'));
			chai.assert.equal(
				evaluateXPathToString('string()', document.documentElement),
				'Some <CDATA>'
			);
		});

		it('regards CDATA childnodes as text nodes', () => {
			const document = new slimdom.Document();
			const element = document.appendChild(document.createElement('test'));
			element.appendChild(document.createTextNode('Some '));
			element.appendChild(document.createCDATASection('<CDATA>'));
			chai.assert.equal(evaluateXPathToString('string()', document), 'Some <CDATA>');
		});

		it('If $arg is the empty sequence, the function returns the zero-length string.', () =>
			chai.assert.equal(evaluateXPathToString('string(())', documentNode), ''));

		describe('If $arg is a node, the function returns string value of the node, as obtained using the dm:string-value accessor defined in [XQuery and XPath Data Model (XDM) 3.0] (see Section 5.13 string-value Accessor).', () => {
			it('works directly on a textNode', () => {
				jsonMlMapper.parse(['someElement', 'Some text.'], documentNode);
				chai.assert.equal(
					evaluateXPathToString('string(.)', documentNode.documentElement.firstChild),
					'Some text.'
				);
			});

			it('works on descendants', () => {
				jsonMlMapper.parse(['someElement', 'Some text.'], documentNode);
				chai.assert.equal(evaluateXPathToString('string(.)', documentNode), 'Some text.');
			});

			it('concatenates textNodes', () => {
				jsonMlMapper.parse(
					['someElement', 'Some text, and ', 'some other text node'],
					documentNode
				);
				chai.assert.equal(
					evaluateXPathToString('string(.)', documentNode),
					'Some text, and some other text node'
				);
			});
		});

		it('If $arg is an atomic value, the function returns the result of the expression $arg cast as xs:string (see 19 Casting).', () => {
			chai.assert.equal(evaluateXPathToString('string(12)', documentNode), '12');
			chai.assert.equal(evaluateXPathToString('string("13")', documentNode), '13');
			chai.assert.equal(evaluateXPathToString('string(true())', documentNode), 'true');
			chai.assert.equal(evaluateXPathToString('string(false())', documentNode), 'false');
		});

		it('A dynamic error is raised [err:XPDY0002] by the zero-argument version of the function if the context item is absent.', () =>
			chai.assert.throws(() => evaluateXPathToString('string()'), 'XPDY0002'));
	});

	describe('concat', () => {
		it('concats two strings', () =>
			chai.assert.equal(evaluateXPathToString('concat("a","b")', documentNode), 'ab'));

		it('concats multiple strings', () =>
			chai.assert.equal(
				evaluateXPathToString('concat("a","b","c","d","e")', documentNode),
				'abcde'
			));

		it('concats array integer values', () =>
			chai.assert.equal(
				evaluateXPathToString('concat([1,2],[3,4,5])', documentNode),
				'12345'
			));

		it('concats array string values', () =>
			chai.assert.equal(
				evaluateXPathToString('concat(["a","b"],["c","d","e"])', documentNode),
				'abcde'
			));
	});

	describe('string-length', () => {
		it('returns 0 for the empty string', () =>
			chai.assert.equal(evaluateXPathToNumber('string-length(())', documentNode), 0));

		it('returns the string length', () =>
			chai.assert.equal(evaluateXPathToNumber('string-length("fortytwo")', documentNode), 8));

		it('uses the context node when no arguments were passed', () => {
			jsonMlMapper.parse(['someElement', 'A piece of text'], documentNode);
			chai.assert.equal(
				evaluateXPathToNumber('/someElement/string-length()', documentNode),
				15
			);
		});

		it('counts codepoints. not characters', () => {
			// '💩'.length === 2
			chai.assert.equal(evaluateXPathToNumber('string-length("💩")', documentNode), 1);
		});
	});

	describe('string-join()', () => {
		it('The function returns an xs:string created by concatenating the items in the sequence $arg1, in order, using the value of $arg2 as a separator between adjacent items.', () =>
			chai.assert.equal(
				evaluateXPathToString('string-join(("a", "b", "c"), "X")', documentNode),
				'aXbXc'
			));

		it('If the value of $arg2 is the zero-length string, then the members of $arg1 are concatenated without a separator.', () =>
			chai.assert.equal(
				evaluateXPathToString('string-join(("a", "b", "c"))', documentNode),
				'abc'
			));

		it('If the value of $arg2 is the zero-length string, then the members of $arg1 are concatenated without a separator.', () =>
			chai.assert.equal(
				evaluateXPathToString('string-join(("a", "b", "c"), "")', documentNode),
				'abc'
			));

		it('returns the empty string when joining the empty sequence', () =>
			chai.assert.equal(evaluateXPathToString('string-join((), "X")', documentNode), ''));

		it('converts its arguments', () =>
			chai.assert.equal(
				evaluateXPathToString('fn:string-join(1 to 9)', documentNode),
				'123456789'
			));
	});

	describe('upper-case()', () => {
		it('If the value of $arg1 is the empty sequence, the zero length string is returned', () =>
			chai.assert.equal(evaluateXPathToString('upper-case(())', documentNode), ''));

		it('returns the string, uppercased', () =>
			chai.assert.equal(
				evaluateXPathToString('upper-case("1234PrrRRrrRt567")', documentNode),
				'1234PRRRRRRRT567'
			));
	});

	describe('lower-case()', () => {
		it('If the value of $arg1 is the empty sequence, the zero length string is returned', () =>
			chai.assert.equal(evaluateXPathToString('lower-case(())', documentNode), ''));

		it('returns the string, lowercased', () =>
			chai.assert.equal(
				evaluateXPathToString('lower-case("1234PrrRRrrRt567")', documentNode),
				'1234prrrrrrrt567'
			));
	});

	describe('substring-before()', () => {
		it('Returns the substring before the match', () =>
			chai.assert.equal(
				evaluateXPathToString('substring-before("tattoo", "attoo")', documentNode),
				't'
			));
		it('May return the zero length string if the string matches from 0', () =>
			chai.assert.equal(
				evaluateXPathToString('substring-before("tattoo","tatto")', documentNode),
				''
			));
		it('May return the zero length string if the arguments are the empty sequence', () =>
			chai.assert.equal(evaluateXPathToString('substring-before((),())', documentNode), ''));
	});

	describe('substring-after()', () => {
		it('Returns the substring after the match', () =>
			chai.assert.equal(
				evaluateXPathToString('substring-after("tattoo", "tat")', documentNode),
				'too'
			));
		it('Returns the substring after the match if the query occurs multiple times', () =>
			chai.assert.equal(
				evaluateXPathToString('substring-after("queryquery", "ue")', documentNode),
				'ryquery'
			));
		it('May return the zero length string if the string matches ending at the last character', () =>
			chai.assert.equal(
				evaluateXPathToString('substring-after("tattoo","ttoo")', documentNode),
				''
			));
		it('May return the zero length string if the arguments are the empty sequence', () =>
			chai.assert.equal(evaluateXPathToString('substring-after((),())', documentNode), ''));
	});

	describe('translate()', () => {
		it('returns "BAr"', () =>
			chai.assert.equal(
				evaluateXPathToString('translate("bar","abc","ABC")', documentNode),
				'BAr'
			));
		it('returns "AAA"', () =>
			chai.assert.equal(
				evaluateXPathToString('translate("--aaa--","abc-","ABC")', documentNode),
				'AAA'
			));
		it(' returns "ABdAB"', () =>
			chai.assert.equal(
				evaluateXPathToString('translate("abcdabc", "abc", "AB")', documentNode),
				'ABdAB'
			));
		it(' returns ""', () =>
			chai.assert.equal(
				evaluateXPathToString('translate("", "abc", "AB")', documentNode),
				''
			));
		it(' returns "" for an empty sequence as an first argument', () =>
			chai.assert.equal(
				evaluateXPathToString('translate((), "abc", "AB")', documentNode),
				''
			));
	});

	describe('codepoints-to-string()', () => {
		it('Returns "BACH"', () =>
			chai.assert.equal(
				evaluateXPathToString('codepoints-to-string((66, 65, 67, 72))', documentNode),
				'BACH'
			));
		it('Returns "अशॊक"', () =>
			chai.assert.equal(
				evaluateXPathToString(
					'codepoints-to-string((2309, 2358, 2378, 2325))',
					documentNode
				),
				'अशॊक'
			));
		it('Return the zero length string for an empty sequence', () =>
			chai.assert.equal(evaluateXPathToString('codepoints-to-string(())', documentNode), ''));
		it('Return true for a test whose essence is: `codepoints-to-string(1114111) eq "&#1114111;"`', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean('codepoints-to-string(1114111) = "\u{10FFFF}"', documentNode)
			));
		it('Raises error FOCH0001 for the expression fn:codepoints-to-string(0)', () =>
			chai.assert.throws(
				() => evaluateXPathToString('codepoints-to-string(0)', documentNode),
				Error,
				'FOCH0001'
			));
		it('Raises error FOCH0001 for the expression fn:codepoints-to-string(10000000)', () =>
			chai.assert.throws(
				() => evaluateXPathToString('codepoints-to-string(10000000)', documentNode),
				Error,
				'FOCH0001'
			));
	});

	describe('string-to-codepoints()', () => {
		it('Returns "(84, 104, 233, 114, 232, 115, 101)"', () =>
			chai.assert.deepEqual(
				evaluateXPathToNumbers('string-to-codepoints("Thérèse")', documentNode),
				[84, 104, 233, 114, 232, 115, 101]
			));
		it('Returns empty sequence for a zero length string', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean('string-to-codepoints("") => empty()', documentNode)
			));
		it('Returns empty sequence for an empty sequence', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean('string-to-codepoints(()) => empty()', documentNode)
			));
		it('Returns 12 for string-to-codepoints(codepoints-to-string(12))', () =>
			chai.assert.throws(
				() =>
					evaluateXPathToNumbers(
						'string-to-codepoints(codepoints-to-string(12))',
						documentNode
					),
				Error,
				'FOCH0001'
			));
	});

	describe('matches()', () => {
		it('a|b matches "a"', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('matches("a", "a|b")')));
		it('a matches "xax"', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('matches("xax", "a")')));
	});

	describe('codepoint-equal()', () => {
		it('Returns empty sequence for an empty sequence as an first argument', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean('codepoint-equal((), "Lady") => empty()', documentNode)
			));
		it('Returns empty sequence for an empty sequence as a second argument', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean('codepoint-equal("Gentleman", ()) => empty()', documentNode)
			));
		it('Returns empty sequence when compared two empty sequences', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean('codepoint-equal((), ()) => empty()', documentNode)
			));
		it('Returns true() for the expression fn:codepoint-equal("abcd", "abcd") ', () =>
			chai.assert.isTrue(
				evaluateXPathToBoolean('codepoint-equal("abcd", "abcd")', documentNode)
			));
		it('Returns false() for the expression fn:codepoint-equal("abcd", "abcd ")', () =>
			chai.assert.isFalse(
				evaluateXPathToBoolean('codepoint-equal("abcd", "abcd ")', documentNode)
			));
		it('Returns true() for the expression fn:codepoint-equal("", "")', () =>
			chai.assert.isTrue(evaluateXPathToBoolean('codepoint-equal("", "")', documentNode)));
		it('Returns false() for an empty sequence as first argument generated with a function', () =>
			chai.assert.isFalse(
				evaluateXPathToBoolean(
					`declare function local:yes-empty($arg as xs:boolean) as xs:string? { if ($arg) then 'yes' else () };
			boolean(fn:codepoint-equal( local:yes-empty(fn:false()), local:yes-empty(fn:true()) ) )`,
					documentNode,
					undefined,
					null,
					{ language: evaluateXPath.XQUERY_3_1_LANGUAGE }
				)
			));
		it('Returns false() for the expression fn:codepoint-equal("a", "b")', () =>
			chai.assert.isFalse(evaluateXPathToBoolean('codepoint-equal("a","b")', documentNode)));
	});
});
