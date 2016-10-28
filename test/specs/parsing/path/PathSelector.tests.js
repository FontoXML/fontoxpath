import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('relative paths', () => {
	it('supports relative paths', () => {
		jsonMLMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		const selector = parseSelector('someChildNode');
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild]);
	});

	it('supports addressing the parent axis with ..', () => {
		jsonMLMapper.parse([
			'someNode',
			[
				'someChildNode',
				['someGrandChild']
			]
		], documentNode);
		const selector = parseSelector('../child::someNode');
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([
			documentNode.documentElement
		]);
	});

	it('returns its results sorted on document order', () => {
		jsonMLMapper.parse([
			'someNode',
			[
				'firstNode'
			],
			[
				'secondNode'
			]
		], documentNode);
		const selector = parseSelector('(//secondNode, //firstNode)/self::node()');
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([
			documentNode.documentElement.firstChild,
			documentNode.documentElement.lastChild
		]);
	});

	it('supports postfix expressions as sequences', () => {
		jsonMLMapper.parse([
			'someNode',
			[
				'firstNode'
			],
			[
				'secondNode'
			]
		], documentNode);
		const selector = parseSelector('/someNode/(secondNode, firstNode)/self::node()');
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([
			documentNode.documentElement.firstChild,
			documentNode.documentElement.lastChild
		]);
	});

	it('supports walking from attribute nodes', () => {
		jsonMLMapper.parse([
			'someNode',
			{ someAttribute: 'someValue' },
			['someChildNode']
		], documentNode);
		const selector = parseSelector('@someAttribute/..');
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
	});

	it('allows returning other things then nodes at the last step of the path', () => {
		chai.expect(evaluateXPath('./42', documentNode, blueprint, {}, evaluateXPath.NUMBER_TYPE)).to.equal(42);
	});

	it('sorts attribute nodes after their element', () => {
		jsonMLMapper.parse([
			'someNode',
			{ someAttribute: 'someValue' },
			['someChildNode']
		], documentNode);
		let selector = parseSelector('((@someAttribute, /someNode, //someChildNode)/.)[1]');
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
		selector = parseSelector('((@someAttribute, /someNode, //someChildNode)/.)[2]');
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.STRING_TYPE)).to.deep.equal('someValue');
		selector = parseSelector('((@someAttribute, /someNode, //someChildNode)/.)[3]');
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild]);
	});

	it('sorts attribute nodes alphabetically', () => {
		jsonMLMapper.parse([
			'someNode',
			{ AsomeAttribute: 'someValue', BsomeOtherAttribute: 'someOtherValue' },
			['someChildNode']
		], documentNode);
		// We need to convert to string becase string-join expects strings and function conversion is not in yet
		const selector = parseSelector('(@BsomeOtherAttribute, @AsomeAttribute)/string() => string-join(", ")');
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.STRING_TYPE)).to.deep.equal('someValue, someOtherValue');
	});

	it('supports addressing the contextNode with .', () => {
		jsonMLMapper.parse([
			'someNode',
			[
				'someChildNode',
				['someGrandChild']
			]
		], documentNode);
		const selector = parseSelector('.//*');
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([
			documentNode.documentElement.firstChild,
			documentNode.documentElement.firstChild.firstChild
		]);
	});
});
