import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPathToBoolean from 'fontoxml-selectors/evaluateXPathToBoolean';
import evaluateXPathToFirstNode from 'fontoxml-selectors/evaluateXPathToFirstNode';
import evaluateXPathToNodes from 'fontoxml-selectors/evaluateXPathToNodes';
import evaluateXPathToNumber from 'fontoxml-selectors/evaluateXPathToNumber';
import evaluateXPathToString from 'fontoxml-selectors/evaluateXPathToString';
import evaluateXPathToStrings from 'fontoxml-selectors/evaluateXPathToStrings';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';

describe('evaluateXPath', () => {
	let documentNode;
	beforeEach(() => {
		documentNode = slimdom.createDocument();
	});

	describe('toBoolean', () => {
		it('Keeps booleans booleans', () => chai.expect(evaluateXPathToBoolean('true()', documentNode, blueprint)).to.equal(true));

		it('Converts the result to a boolean', () => {
			chai.expect(evaluateXPathToBoolean('()', documentNode, blueprint)).to.equal(false);
		});

		it('Throws when unable to convert the result to a number', () => {
			chai.expect(() => {
				evaluateXPathToBoolean('(1,2,3)', documentNode, blueprint);
			}).to.throw();
		});
	});

	describe('toNumber', () => {
		it('Keeps numeric values numbers', () => {
			chai.expect(evaluateXPathToNumber('42', documentNode, blueprint)).to.equal(42);
		});

		it('Returns NaN when unable to convert the result to a number', () => {
			chai.expect(evaluateXPathToNumber('"fortytwo"', documentNode, blueprint)).to.be.NaN;
		});
	});

	describe('toString', () => {
		it('Keeps string values strings', () => {
			chai.expect(evaluateXPathToString('"A piece of text"', documentNode, blueprint)).to.equal('A piece of text');
		});

		it('Returns the empty string when resolving to the empty sequence', () => {
			chai.expect(evaluateXPathToString('()', documentNode, blueprint)).to.equal('');
		});
	});

	describe('toStrings', () => {
		it('Keeps string values strings', () => {
			chai.expect(evaluateXPathToStrings('("A piece of text", "another piece of text")', documentNode, blueprint)).to.deep.equal(['A piece of text', 'another piece of text']);
		});
	});


	describe('toFirstNode', () => {
		it('Keeps nodes nodes', () => {
			chai.expect(evaluateXPathToFirstNode('.', documentNode, blueprint)).to.equal(documentNode);
		});

		it('Only returns the first node', () => {
			chai.expect(evaluateXPathToFirstNode('(., ., .)', documentNode, blueprint)).to.equal(documentNode);
		});

		it('Returns null when the xpath resolves to the empty sequence', () => {
			chai.expect(evaluateXPathToFirstNode('()', documentNode, blueprint)).to.equal(null);
		});

		it('Throws when the xpath resolves to an attribute', () => {
			jsonMLMapper.parse(['someElement', {
				someAttribute: 'someValue'
			}], documentNode);
			chai.expect(() => {
				evaluateXPathToFirstNode('//@someAttribute', documentNode, blueprint);
			}).to.throw();
		});
	});

	describe('toNodes', () => {
		it('Keeps nodes nodes', () => {
			chai.expect(evaluateXPathToNodes('.', documentNode, blueprint)).to.deep.equal([documentNode]);
		});

		it('Returns all nodes', () => {
			chai.expect(evaluateXPathToNodes('(., ., .)', documentNode, blueprint)).to.deep.equal([documentNode, documentNode, documentNode]);
		});

		it('Returns null when the xpath resolves to the empty sequence', () => {
			chai.expect(evaluateXPathToNodes('()', documentNode, blueprint)).to.deep.equal([]);
		});

		it('Throws when the xpath resolves to an attribute', () => {
			jsonMLMapper.parse(['someElement', {
				someAttribute: 'someValue'
			}], documentNode);
			chai.expect(() => {
				evaluateXPathToNodes('//@someAttribute', documentNode, blueprint);
			}).to.throw();
		});
	});
});
