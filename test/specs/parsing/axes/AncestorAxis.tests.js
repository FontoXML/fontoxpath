import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('ancestor', () => {
	it('parses ancestor::', () => {
		const selector = parseSelector('ancestor::someParentElement');
		jsonMLMapper.parse([
			'someParentElement',
			['someElement', { 'someAttribute': 'someValue' }]
		], documentNode);
		chai.expect(
			evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE))
			.to.deep.equal([documentNode.documentElement]);
	});
});

describe('ancestor-or-self', () => {
	it('parses ancestor-or-self:: ancestor part', () => {
		const selector = parseSelector('ancestor-or-self::someParentElement');
		jsonMLMapper.parse([
			'someParentElement',
			['someElement', { 'someAttribute': 'someValue' }]
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
	});
	it('parses ancestor-or-self:: self part', () => {
		const selector = parseSelector('ancestor-or-self::someParentElement');
		jsonMLMapper.parse([
			'someParentElement',
			['someElement', { 'someAttribute': 'someValue' }]
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
	});
	it('orders self before all ancestors', () => {
		const selector = parseSelector('ancestor-or-self::*');
		jsonMLMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild, documentNode.documentElement]);
	});
});
