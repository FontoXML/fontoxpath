define([
	'fontoxml-blueprints',
	'fontoxml-dom-utils/jsonMLMapper',
	'slimdom',

	'fontoxml-selectors/evaluateXPathToBoolean',
	'fontoxml-selectors/evaluateXPathToString',
	'fontoxml-selectors/evaluateXPathToNumber',
	'fontoxml-selectors/evaluateXPathToFirstNode',
	'fontoxml-selectors/evaluateXPathToNodes'
], function (
	blueprints,
	jsonMLMapper,
	slimdom,
	evaluateXPathToBoolean,
	evaluateXPathToString,
	evaluateXPathToNumber,
	evaluateXPathToFirstNode,
	evaluateXPathToNodes
) {
	'use strict';

	var blueprint = new blueprints.ReadOnlyBlueprint();

	describe('evaluateXPath', function () {
		var documentNode;
		beforeEach(function () {
			documentNode = slimdom.createDocument();
		});

		describe('toBoolean', function () {
			it('Keeps booleans booleans', function () {
				chai.expect(evaluateXPathToBoolean('true()', documentNode, blueprint)).to.equal(true);
			});

			it('Converts the result to a boolean', function () {
				chai.expect(evaluateXPathToBoolean('()', documentNode, blueprint)).to.equal(false);
			});

			it('Throws when unable to convert the result to a number', function () {
				chai.expect(function () {
					evaluateXPathToBoolean('(1,2,3)', documentNode, blueprint);
				}).to.throw();
			});
		});

		describe('toNumber', function () {
			it('Keeps numeric values numbers', function () {
				chai.expect(evaluateXPathToNumber('42', documentNode, blueprint)).to.equal(42);
			});

			it('Returns NaN when unable to convert the result to a number', function () {
				chai.expect(evaluateXPathToNumber('"fortytwo"', documentNode, blueprint)).to.be.NaN;
			});
		});

		describe('toString', function () {
			it('Keeps string values strings', function () {
				chai.expect(evaluateXPathToString('"A piece of text"', documentNode, blueprint)).to.equal('A piece of text');
			});

			it('Returns the empty string when resolving to the empty sequence', function () {
				chai.expect(evaluateXPathToString('()', documentNode, blueprint)).to.equal('');
			});
		});

		describe('toFirstNode', function () {
			it('Keeps nodes nodes', function () {
				chai.expect(evaluateXPathToFirstNode('.', documentNode, blueprint)).to.equal(documentNode);
			});

			it('Only returns the first node', function () {
				chai.expect(evaluateXPathToFirstNode('(., ., .)', documentNode, blueprint)).to.equal(documentNode);
			});

			it('Returns null when the xpath resolves to the empty sequence', function () {
				chai.expect(evaluateXPathToFirstNode('()', documentNode, blueprint)).to.equal(null);
			});

			it('Throws when the xpath resolves to an attribute', function () {
				jsonMLMapper.parse(['someElement', {someAttribute: 'someValue'}], documentNode);
				chai.expect(function () {
					evaluateXPathToFirstNode('//@someAttribute', documentNode, blueprint);
				}).to.throw();
			});
		});

		describe('toNodes', function () {
			it('Keeps nodes nodes', function () {
				chai.expect(evaluateXPathToNodes('.', documentNode, blueprint)).to.deep.equal([documentNode]);
			});

			it('Returns all nodes', function () {
				chai.expect(evaluateXPathToNodes('(., ., .)', documentNode, blueprint)).to.deep.equal([documentNode, documentNode, documentNode]);
			});

			it('Returns null when the xpath resolves to the empty sequence', function () {
				chai.expect(evaluateXPathToNodes('()', documentNode, blueprint)).to.deep.equal([]);
			});

			it('Throws when the xpath resolves to an attribute', function () {
				jsonMLMapper.parse(['someElement', {someAttribute: 'someValue'}], documentNode);
				chai.expect(function () {
					evaluateXPathToNodes('//@someAttribute', documentNode, blueprint);
				}).to.throw();
			});
		});
	});
});
