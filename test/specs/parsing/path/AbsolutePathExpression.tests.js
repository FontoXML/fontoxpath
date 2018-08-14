import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNodes
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('absolute paths', () => {
	it('supports absolute paths', () => {
		jsonMlMapper.parse([
			'someNode'
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('/someNode', documentNode), [documentNode.documentElement]);
	});

	it('supports chaining from absolute paths', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('/someNode/someChildNode', documentNode), [documentNode.documentElement.firstChild]);
	});

	it('allows (/)', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('(/)', documentNode), [documentNode]);
	});

	it('disallows / * 5', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.assert.throws(() => evaluateXPathToNodes('/ * 5', documentNode), 'XPST0003');
	});

	it('disallows / union /', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.assert.throws(() => evaluateXPathToNodes('/ union /', documentNode), 'XPST0003');
	});

	it('allows / union', () => {
		jsonMlMapper.parse([
			'union'
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('/ union', documentNode), [documentNode.documentElement]);
	});

	it('allows // as root', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('//someChildNode', documentNode), [documentNode.documentElement.firstChild]);
	});

	it('targets descendants with //', () => {
		jsonMlMapper.parse([
			'someNode',
			['someChildNode', ['someDescendantNode']]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('//someDescendantNode', documentNode), [documentNode.documentElement.firstChild.firstChild]);
	});
});
