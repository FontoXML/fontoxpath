import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToNodes } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('union', () => {
	it('can parse union', () => {
		const selector = ('(//someNode | //someChildNode)');
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);

		chai.expect(
			evaluateXPathToNodes(selector, documentNode, domFacade)
		).to.deep.equal([documentNode.firstChild, documentNode.firstChild.firstChild]);
	});

	it('allows union (|) without spaces', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('(//someNode|//someChildNode)', documentNode, domFacade), [documentNode.firstChild, documentNode.firstChild.firstChild]);
	});

	it('allows union (written out) without spaces', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('((//someNode)union(//someChildNode))', documentNode, domFacade), [documentNode.firstChild, documentNode.firstChild.firstChild]);
	});

	it('dedupes nodes', () => {
		const selector = ('(//* | //*)');
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);

		chai.expect(
			evaluateXPathToNodes(selector, documentNode, domFacade)
		).to.deep.equal([documentNode.firstChild, documentNode.firstChild.firstChild]);
	});

	it('throws an error when not passed a node sequence', () => {
		const selector = ('(1,2,3) | (4,5,6)');
		chai.expect(() => {
			evaluateXPathToNodes(selector, documentNode, domFacade);
		}).to.throw(/ERRXPTY0004/);
	});

	it('sorts nodes', () => {
		const selector = ('(//C | //B | //A)');
		jsonMlMapper.parse([
			'someNode',
			['A'],
			['B'],
			['C']
		], documentNode);

		chai.expect(
			evaluateXPathToNodes(selector, documentNode, domFacade)
		).to.deep.equal(Array.from(documentNode.firstChild.childNodes));
	});
});
