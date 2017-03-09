import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToFirstNode, evaluateXPathToNodes, evaluateXPathToNumber, evaluateXPathToNumbers, evaluateXPathToString } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('relative paths', () => {
	it('supports relative paths', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		const selector = ('someChildNode');
		chai.expect(evaluateXPathToNodes(selector, documentNode.documentElement, domFacade)).to.deep.equal([documentNode.documentElement.firstChild]);
	});

	it('supports addressing the parent axis with ..', () => {
		jsonMlMapper.parse([
			'someNode',
			[
				'someChildNode',
				['someGrandChild']
			]
		], documentNode);
		const selector = ('../child::someNode');
		chai.expect(evaluateXPathToNodes(selector, documentNode.documentElement, domFacade)).to.deep.equal([
			documentNode.documentElement
		]);
	});

	it('sets the contextSequence', () => {
		jsonMlMapper.parse([
			'someNode',
			[
				'someChildNode',
				['someGrandChild']
			]
		], documentNode);
		const selector = ('//*/position()');
		chai.assert.deepEqual(evaluateXPathToNumbers(selector, documentNode.documentElement, domFacade), [1, 1, 1]);
	});

	it('returns its results sorted on document order', () => {
		jsonMlMapper.parse([
			'someNode',
			[
				'firstNode'
			],
			[
				'secondNode'
			]
		], documentNode);
		const selector = ('(//secondNode, //firstNode)/self::node()');
		chai.expect(evaluateXPathToNodes(selector, documentNode.documentElement, domFacade)).to.deep.equal([
			documentNode.documentElement.firstChild,
			documentNode.documentElement.lastChild
		]);
	});

	it('supports postfix expressions as sequences', () => {
		jsonMlMapper.parse([
			'someNode',
			[
				'firstNode'
			],
			[
				'secondNode'
			]
		], documentNode);
		const selector = ('/someNode/(secondNode, firstNode)/self::node()');
		chai.expect(evaluateXPathToNodes(selector, documentNode.documentElement, domFacade)).to.deep.equal([
			documentNode.documentElement.firstChild,
			documentNode.documentElement.lastChild
		]);
	});

	it('supports walking from attribute nodes', () => {
		jsonMlMapper.parse([
			'someNode',
			{ someAttribute: 'someValue' },
			['someChildNode']
		], documentNode);
		const selector = ('@someAttribute/..');
		chai.expect(evaluateXPathToNodes(selector, documentNode.documentElement, domFacade)).to.deep.equal([documentNode.documentElement]);
	});

	it('allows returning other things then nodes at the last step of the path', () => {
		chai.expect(evaluateXPathToNumber('./42', documentNode, domFacade)).to.equal(42);
	});

	it('sorts attribute nodes after their element', () => {
		jsonMlMapper.parse([
			'someNode',
			{ someAttribute: 'someValue' },
			['someChildNode']
		], documentNode);
		let selector = ('((@someAttribute, /someNode, //someChildNode)/.)[1]');
		chai.expect(evaluateXPathToNodes(selector, documentNode.documentElement, domFacade)).to.deep.equal([documentNode.documentElement]);
		selector = ('((@someAttribute, /someNode, //someChildNode)/.)[2]');
		chai.expect(evaluateXPathToString(selector, documentNode.documentElement, domFacade)).to.deep.equal('someValue');
		selector = ('((@someAttribute, /someNode, //someChildNode)/.)[3]');
		chai.expect(evaluateXPathToNodes(selector, documentNode.documentElement, domFacade)).to.deep.equal([documentNode.documentElement.firstChild]);
	});

	it('sorts attribute nodes alphabetically', () => {
		jsonMlMapper.parse([
			'someNode',
			{ AsomeAttribute: 'someValue', BsomeOtherAttribute: 'someOtherValue' },
			['someChildNode']
		], documentNode);
		// We need to convert to string becase string-join expects strings and function conversion is not in yet
		const selector = ('(@BsomeOtherAttribute, @AsomeAttribute)/string() => string-join(", ")');
		chai.expect(evaluateXPathToString(selector, documentNode.documentElement, domFacade, {})).to.deep.equal('someValue, someOtherValue');
	});

	it('allows mixed pathseparators and abbreviated steps', function () {
		jsonMlMapper.parse([
			'someNode',
			[
				'someChildNode',
				['someGrandChild']
			]
		], documentNode);

		chai.assert.equal(evaluateXPathToFirstNode('/someNode/someChildNode//someGrandChild/../..//someGrandChild', documentNode.documentElement, domFacade), documentNode.documentElement.firstChild.firstChild);
	});

	it('supports addressing the contextNode with .', () => {
		jsonMlMapper.parse([
			'someNode',
			[
				'someChildNode',
				['someGrandChild']
			]
		], documentNode);
		const selector = ('.//*');
		chai.expect(evaluateXPathToNodes(selector, documentNode.documentElement, domFacade)).to.deep.equal([
			documentNode.documentElement.firstChild,
			documentNode.documentElement.firstChild.firstChild
		]);
	});
});
