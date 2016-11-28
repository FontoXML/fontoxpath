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
		it('Keeps booleans booleans',
		   () => chai.assert.equal(evaluateXPathToBoolean('true()', documentNode, blueprint), true));

		it('Converts the result to a boolean',
		   () => chai.assert.equal(evaluateXPathToBoolean('()', documentNode, blueprint), false));

		it('Throws when unable to convert the result to a number',
		   () => chai.assert.throws(() =>  evaluateXPathToBoolean('(1,2,3)', documentNode, blueprint)));
	});

	describe('toNumber', () => {
		it('Keeps numeric values numbers',
		   () => chai.assert.equal(evaluateXPathToNumber('42', documentNode, blueprint), 42));

		it('returns NaN when not resolving to a singleton',
		   () => chai.assert.isNaN(evaluateXPathToNumber('()', documentNode, blueprint)));

		it('Returns NaN when unable to convert the result to a number',
		   () => chai.assert.isNaN(evaluateXPathToNumber('"fortytwo"', documentNode, blueprint)));
	});

	describe('toString', () => {
		it('Keeps string values strings',
		   () => chai.assert.equal(evaluateXPathToString('"A piece of text"', documentNode, blueprint), 'A piece of text'));

		it('Returns the empty string when resolving to the empty sequence',
		   () => chai.assert.equal(evaluateXPathToString('()', documentNode, blueprint), ''));
	});

	describe('toStrings', () => {
		it('Keeps string values strings',
		   () => chai.assert.deepEqual(evaluateXPathToStrings('("A piece of text", "another piece of text")', documentNode, blueprint), ['A piece of text', 'another piece of text']));

		it('returns an empty array when it resolves to the empty sequence',
		   () => chai.assert.deepEqual(evaluateXPathToStrings('()', documentNode, blueprint), []));
	});

	describe('toFirstNode', () => {
		it('Keeps nodes nodes',
		   () => chai.assert.equal(evaluateXPathToFirstNode('.', documentNode, blueprint), documentNode));

		it('Only returns the first node',
		   () => chai.assert.equal(evaluateXPathToFirstNode('(., ., .)', documentNode, blueprint), documentNode));

		it('Returns null when the xpath resolves to the empty sequence',
		   () => chai.assert.equal(evaluateXPathToFirstNode('()', documentNode, blueprint), null));

		it('Throws when the xpath resolves to an attribute', () => {
			jsonMLMapper.parse(['someElement', {
				someAttribute: 'someValue'
			}], documentNode);
			chai.assert.throws(() => evaluateXPathToFirstNode('//@someAttribute', documentNode, blueprint));
		});
	});

	describe('toNodes', () => {
		it('Keeps nodes nodes',
		   () => chai.assert.deepEqual(evaluateXPathToNodes('.', documentNode, blueprint), [documentNode]));

		it('Returns all nodes',
		   () => chai.assert.deepEqual(evaluateXPathToNodes('(., ., .)', documentNode, blueprint), [documentNode, documentNode, documentNode]));

		it('Returns null when the xpath resolves to the empty sequence',
		   () => chai.assert.deepEqual(evaluateXPathToNodes('()', documentNode, blueprint), []));

		it('Throws when the xpath resolves to an attribute', () => {
			jsonMLMapper.parse(['someElement', {
				someAttribute: 'someValue'
			}], documentNode);
			chai.assert.throws(() => evaluateXPathToNodes('//@someAttribute', documentNode, blueprint));
		});
	});

	describe('using the actual browser HTML DOM', () => {
		it('will find an HTML node', ()=> {
			chai.assert.isTrue(evaluateXPathToBoolean('//HTML', window.document, blueprint));
		});
	});
});
