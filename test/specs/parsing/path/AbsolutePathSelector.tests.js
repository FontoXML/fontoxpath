import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import { evaluateXPathToNodes } from 'fontoxml-selectors';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('absolute paths', () => {
	it('supports absolute paths', () => {
		jsonMlMapper.parse([
			'someNode'
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('/someNode', documentNode, domFacade), [documentNode.documentElement]);
	});

	it('supports chaining from absolute paths', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('/someNode/someChildNode', documentNode, domFacade), [documentNode.documentElement.firstChild]);
	});

	it('allows // as root', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('//someChildNode', documentNode, domFacade), [documentNode.documentElement.firstChild]);
	});

	it('targets descendants with //', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode', ['someDescendantNode']]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('//someDescendantNode', documentNode, domFacade), [documentNode.documentElement.firstChild.firstChild]);
	});
});
