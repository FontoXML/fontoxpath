import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToNodes } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('ancestor', () => {
	it('parses ancestor::', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement', { 'someAttribute': 'someValue' }]
		], documentNode);
		chai.expect(
			evaluateXPathToNodes('ancestor::someParentElement', documentNode.documentElement.firstChild, domFacade))
			.to.deep.equal([documentNode.documentElement]);
	});
});

describe('ancestor-or-self', () => {
	it('parses ancestor-or-self:: ancestor part', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement', { 'someAttribute': 'someValue' }]
		], documentNode);
		chai.expect(evaluateXPathToNodes('ancestor-or-self::someParentElement', documentNode.documentElement.firstChild, domFacade)).to.deep.equal([documentNode.documentElement]);
	});
	it('parses ancestor-or-self:: self part', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement', { 'someAttribute': 'someValue' }]
		], documentNode);
		chai.expect(evaluateXPathToNodes('ancestor-or-self::someParentElement', documentNode.documentElement, domFacade)).to.deep.equal([documentNode.documentElement]);
	});
	it('orders self before all ancestors', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(evaluateXPathToNodes('ancestor-or-self::*', documentNode.documentElement.firstChild, domFacade)).to.deep.equal([documentNode.documentElement.firstChild, documentNode.documentElement]);
	});
});
