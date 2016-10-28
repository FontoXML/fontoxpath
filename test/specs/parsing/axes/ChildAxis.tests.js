import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('child', () => {
	it('parses child::', () => {
		const selector = parseSelector('child::someElement');
		jsonMLMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(
			evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE))
			.to.deep.equal([documentNode.documentElement.firstChild]);
	});

	it('is added implicitly', () => {
		const selector = parseSelector('someElement');
		jsonMLMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.expect(
			evaluateXPath(selector, documentNode.documentElement, blueprint, {}, evaluateXPath.NODES_TYPE))
			.to.deep.equal([documentNode.documentElement.firstChild]);
	});
});
