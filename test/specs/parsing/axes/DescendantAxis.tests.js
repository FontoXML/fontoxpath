import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('descendant', () => {
	it('parses descendant::', () => {
		const selector = parseSelector('descendant::someElement');
		jsonMLMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE))
			.to.deep.equal([documentNode.firstChild.firstChild]);
	});
});

describe('descendant-or-self', () => {
	it('descendant part', () => {
		const selector = parseSelector('descendant-or-self::someElement');
		jsonMLMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild]);
	});
	it('self part', () => {
		const selector = parseSelector('descendant-or-self::someParentElement');
		jsonMLMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
	});
	it('ordering', () => {
		const selector = parseSelector('descendant-or-self::*');
		jsonMLMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement, documentNode.documentElement.firstChild]);
	});
});
