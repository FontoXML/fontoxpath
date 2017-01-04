import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToNodes } from 'fontoxml-selectors';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('descendant', () => {
	it('parses descendant::', () => {
		const selector = ('descendant::someElement');
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(
			evaluateXPathToNodes(selector, documentNode, domFacade))
			.to.deep.equal([documentNode.firstChild.firstChild]);
	});
});

describe('descendant-or-self', () => {
	it('descendant part', () => {
		const selector = ('descendant-or-self::someElement');
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(evaluateXPathToNodes(selector, documentNode.documentElement, domFacade)).to.deep.equal([documentNode.documentElement.firstChild]);
	});
	it('self part', () => {
		const selector = ('descendant-or-self::someParentElement');
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(evaluateXPathToNodes(selector, documentNode.documentElement, domFacade)).to.deep.equal([documentNode.documentElement]);
	});
	it('ordering', () => {
		const selector = ('descendant-or-self::*');
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(evaluateXPathToNodes(selector, documentNode.documentElement, domFacade)).to.deep.equal([documentNode.documentElement, documentNode.documentElement.firstChild]);
	});
});
