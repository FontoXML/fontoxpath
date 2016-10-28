import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('absolute paths', () => {
	it('supports absolute paths', () => {
		jsonMLMapper.parse([
			'someNode'
		], documentNode);
		const selector = parseSelector('/someNode');
		chai.expect(evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement]);
	});

	it('supports chaining from absolute paths', () => {
		jsonMLMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		const selector = parseSelector('/someNode/someChildNode');
		chai.expect(evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild]);
	});

	it('allows // as root', () => {
		jsonMLMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		const selector = parseSelector('//someChildNode');
		chai.expect(evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild]);
	});

	it('targets descendants with //', () => {
		jsonMLMapper.parse([
			'someNode',
			['someChildNode', ['someDescendantNode']]
		], documentNode);
		const selector = parseSelector('//someDescendantNode');
		chai.expect(evaluateXPath(selector, documentNode, blueprint, {}, evaluateXPath.NODES_TYPE)).to.deep.equal([documentNode.documentElement.firstChild.firstChild]);
	});
});
