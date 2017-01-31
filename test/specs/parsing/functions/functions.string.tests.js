import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import {
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

describe('functions over strings', () => {
	describe('tokenize', () => {
		it('If $input is the empty sequence, or if $input is the zero-length string, the function returns the empty sequence.', () => {
			let selector = ('tokenize(())');
			chai.expect(
				evaluateXPathToStrings(selector, documentNode, domFacade)
			).to.deep.equal([]);
			selector = ('tokenize("")');
			chai.expect(
				evaluateXPathToStrings(selector, documentNode, domFacade)
			).to.deep.equal([]);
		});

		it('The function returns a sequence of strings formed by breaking the $input string into a sequence of strings, treating any substring that matches $pattern as a separator. The separators themselves are not returned.', () => {
			let selector = ('tokenize("A piece of text")');
			chai.expect(
				evaluateXPathToStrings(selector, documentNode, domFacade)
			).to.deep.equal(['A', 'piece', 'of', 'text']);
			selector = ('tokenize("A,piece,of,text", ",")');
			chai.expect(
				evaluateXPathToStrings(selector, documentNode, domFacade)
			).to.deep.equal(['A', 'piece', 'of', 'text']);
		});

		it('Except with the one-argument form of the function, if a separator occurs at the start of the $input string, the result sequence will start with a zero-length string. Similarly, zero-length strings will also occur in the result sequence if a separator occurs at the end of the $input string, or if two adjacent substrings match the supplied $pattern.', () => {
			const selector = ('tokenize(",A,piece,of,text", ",")');
			chai.expect(
				evaluateXPathToStrings(selector, documentNode, domFacade)
			).to.deep.equal(['', 'A', 'piece', 'of', 'text']);
		});

		// Javascript regexes don't work this way
		it.skip('If two alternatives within the supplied $pattern both match at the same position in the $input string, then the match that is chosen is the first.', () => {
			const selector = ('tokenize("abracadabra", "(ab)|(a)")');
			chai.expect(
				evaluateXPathToStrings(selector, documentNode, domFacade)
			).to.deep.equal(['', 'r', 'c', 'd', 'r', '']);
		});
	});

	describe('normalize-space()', () => {
		it('Returns the value of $arg with whitespace normalized by stripping leading and trailing whitespace and replacing sequences of one or more than one whitespace character with a single space, #x20.', () => {
			chai.expect(evaluateXPathToString('normalize-space("  something with a lot of		  spaces	   ")', documentNode, domFacade)).to.equal('something with a lot of spaces');
		});

		it('If the value of $arg is the empty sequence, returns the zero-length string.', () => {
			chai.expect(evaluateXPathToString('normalize-space(())', documentNode, domFacade)).to.equal('');
		});

		it('If no argument is supplied, then $arg defaults to the string value (calculated using fn:string()) of the context item (.)', () => {
			documentNode.appendChild(documentNode.createTextNode('   A piece	of text  '));
			chai.expect(evaluateXPathToString('./normalize-space()', documentNode, domFacade)).to.equal('A piece of text');
		});
	});

	describe('starts-with()', () => {
		it('returns true for tattoo starts with tat',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('starts-with("tattoo", "tat")', documentNode, domFacade)));
		it('returns true if arg2 is the empty string',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('starts-with("abc", "")', documentNode, domFacade)));
		it('returns true if arg2 is the empty sequence (coerces to empty string)',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('starts-with("abc", ())', documentNode, domFacade)));
		it('returns false if arg1 is the empty string',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('starts-with("", "abc")', documentNode, domFacade)));
		it('returns false if arg1 is the empty sequence (coerces to empty string)',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('starts-with((), "abc")', documentNode, domFacade)));
		it('returns true if arg1 and arg2 are empty strings',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('starts-with("", "")', documentNode, domFacade)));
		it('returns false if arg1 does not start with arg2',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('starts-with("tattoo", "abc")', documentNode, domFacade)));
	});

	describe('contains()', () => {
		it('returns true for tattoo contains tat',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('contains("tattoo", "tat")', documentNode, domFacade)));
		it('returns true for tattoo contains ttoo',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('contains("tattoo", "ttoo")', documentNode, domFacade)));
		it('returns true for tattoo contains atto',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('contains("tattoo", "atto")', documentNode, domFacade)));
		it('returns true if arg2 is the empty string',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('contains("abc", "")', documentNode, domFacade)));
		it('returns true if arg2 is the empty sequence (coerces to empty string)',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('contains("abc", ())', documentNode, domFacade)));
		it('returns false if arg1 is the empty string',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('contains("", "abc")', documentNode, domFacade)));
		it('returns false if arg1 is the empty sequence (coerces to empty string)',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('contains((), "abc")', documentNode, domFacade)));
		it('returns true if arg1 and arg2 are empty strings',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('contains("", "")', documentNode, domFacade)));
		it('returns false if arg1 does not start with arg2',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('contains("tattoo", "abc")', documentNode, domFacade)));
	});

	describe('ends-with()', () => {
		it('returns true for tattoo ends with too',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('ends-with("tattoo", "too")', documentNode, domFacade)));
		it('returns true if arg2 is the empty string',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('ends-with("abc", "")', documentNode, domFacade)));
		it('returns true if arg2 is the empty sequence (coerces to empty string)',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('ends-with("abc", ())', documentNode, domFacade)));
		it('returns false if arg1 is the empty string',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('ends-with("", "abc")', documentNode, domFacade)));
		it('returns false if arg1 is the empty sequence (coerces to empty string)',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('ends-with((), "abc")', documentNode, domFacade)));
		it('returns true if arg1 and arg2 are empty strings',
		   () => chai.assert.isTrue(evaluateXPathToBoolean('ends-with("", "")', documentNode, domFacade)));
		it('returns false if arg1 does not start with arg2',
		   () => chai.assert.isFalse(evaluateXPathToBoolean('ends-with("tattoo", "abc")', documentNode, domFacade)));
	});

	describe('string', () => {
		it('In the zero-argument version of the function, $arg defaults to the context item. That is, calling fn:string() is equivalent to calling fn:string(.).', () => {
			const selector = ('string()');
			jsonMlMapper.parse('Some text.', documentNode);
			chai.expect(
				evaluateXPathToString(selector, documentNode, domFacade)
			).to.equal('Some text.');
		});

		it('returns the string value of the passed node: text nodes.', () => {
			jsonMlMapper.parse('Some text.', documentNode);
			chai.expect(evaluateXPathToString('string()', documentNode.firstChild, domFacade)).to.equal('Some text.');
		});

		it('If $arg is the empty sequence, the function returns the zero-length string.', () => {
			const selector = ('string(())');
			chai.expect(
				evaluateXPathToString(selector, documentNode, domFacade)
			).to.equal('');
		});

		describe('If $arg is a node, the function returns string value of the node, as obtained using the dm:string-value accessor defined in [XQuery and XPath Data Model (XDM) 3.0] (see Section 5.13 string-value Accessor).', () => {
			it('works directly on a textNode', () => {
				const selector = ('string(.)');
				jsonMlMapper.parse('Some text.', documentNode);
				chai.expect(
					evaluateXPathToString(selector, documentNode, domFacade)
				).to.equal('Some text.');
			});

			it('works on descendants', () => {
				const selector = ('string(.)');
				jsonMlMapper.parse([
					'someElement',
					'Some text.'
				], documentNode);
				chai.expect(
					evaluateXPathToString(selector, documentNode, domFacade)
				).to.equal('Some text.');
			});

			it('concatenates textNodes', () => {
				const selector = ('string(.)');
				jsonMlMapper.parse([
					'someElement',
					'Some text, and ',
					'some other text node'
				], documentNode);
				chai.expect(
					evaluateXPathToString(selector, documentNode, domFacade)
				).to.equal('Some text, and some other text node');
			});
		});

		it('If $arg is an atomic value, the function returns the result of the expression $arg cast as xs:string (see 19 Casting).', () => {
			const selector1 = ('string(12)'),
			selector2 = ('string("13")'),
			selector3 = ('string(true())'),
			selector4 = ('string(false())');
			chai.expect(
				evaluateXPathToString(selector1, documentNode, domFacade)
			).to.equal('12');
			chai.expect(
				evaluateXPathToString(selector2, documentNode, domFacade)
			).to.equal('13');
			chai.expect(
				evaluateXPathToString(selector3, documentNode, domFacade)
			).to.equal('true');
			chai.expect(
				evaluateXPathToString(selector4, documentNode, domFacade)
			).to.equal('false');
		});

		it.skip('A dynamic error is raised [err:XPDY0002] by the zero-argument version of the function if the context item is absent.', () => {
			const selector = ('string()');
			chai.expect(() => {
				evaluateXPathToString(selector, documentNode, domFacade);
			}).to.throw(/XPDY0002/);
		});
	});

	describe('concat', () => {
		it('concats two strings', () => {
			chai.expect(evaluateXPathToString('concat("a","b")', documentNode, domFacade)).to.equal('ab');
		});

		it('concats multiple strings', () => {
			chai.expect(evaluateXPathToString('concat("a","b","c","d","e")', documentNode, domFacade)).to.equal('abcde');
		});
	});

	describe('string-length', () => {
		it('returns 0 for the empty string', () => {
			chai.expect(evaluateXPathToNumber('string-length(())', documentNode, domFacade)).to.equal(0);
		});

		it('returns the string length', () => {
			chai.expect(evaluateXPathToNumber('string-length("fortytwo")', documentNode, domFacade)).to.equal(8);
		});

		it('uses the context node when no arguments were passed', () => {
			jsonMlMapper.parse(['someElement', 'A piece of text'], documentNode);
			chai.expect(evaluateXPathToNumber('/someElement/string-length()', documentNode, domFacade)).to.equal(15);
		});

		it('counts codepoints.not characters', () => {
			// '💩'.length === 2
			chai.expect(evaluateXPathToNumber('string-length("💩")', documentNode, domFacade)).to.equal(1);
		});
	});

	describe('string-join()', () => {
		it('The function returns an xs:string created by concatenating the items in the sequence $arg1, in order, using the value of $arg2 as a separator between adjacent items.', () => {
			chai.expect(evaluateXPathToString('string-join(("a", "b", "c"), "X")', documentNode, domFacade)).to.equal('aXbXc');
		});

		it('If the value of $arg2 is the zero-length string, then the members of $arg1 are concatenated without a separator.', () => {
			chai.expect(evaluateXPathToString('string-join(("a", "b", "c"))', documentNode, domFacade)).to.equal('abc');
		});

		it('If the value of $arg2 is the zero-length string, then the members of $arg1 are concatenated without a separator.', () => {
			chai.expect(evaluateXPathToString('string-join(("a", "b", "c"), "")', documentNode, domFacade)).to.equal('abc');
		});

		it('returns the empty string when joining the empty sequence', () => {
			chai.expect(evaluateXPathToString('string-join((), "X")', documentNode, domFacade)).to.equal('');
		});
	});
});
