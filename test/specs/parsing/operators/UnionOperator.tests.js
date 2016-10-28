import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('union', () => {
	it('can parse union', () => {
		const selector = parseSelector('(//someNode | //someChildNode)');
		jsonMLMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);

		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal([documentNode.firstChild, documentNode.firstChild.firstChild]);
	});

	it('dedupes nodes', () => {
		const selector = parseSelector('(//* | //*)');
		jsonMLMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);

		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal([documentNode.firstChild, documentNode.firstChild.firstChild]);
	});

	it('throws an error when not passed a node sequence', () => {
		const selector = parseSelector('(1,2,3) | (4,5,6)');
		chai.expect(() => {
			evaluateXPath(selector, documentNode, blueprint);
		}).to.throw(/ERRXPTY0004/);
	});

	it('sorts nodes', () => {
		// Not implemented yet: performance reasons
		const selector = parseSelector('(//C | //B | //A)');
		jsonMLMapper.parse([
			'someNode',
			['A'],
			['B'],
			['C']
		], documentNode);

		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal(Array.from(documentNode.firstChild.childNodes));
	});
});
