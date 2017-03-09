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
			['someElement', { someAttribute: 'someValue' }]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('ancestor::someParentElement', documentNode.documentElement.firstChild, domFacade), [documentNode.documentElement]);
	});
});

describe('ancestor-or-self', () => {
	it('parses ancestor-or-self:: ancestor part', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement', { someAttribute: 'someValue' }]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('ancestor-or-self::someParentElement', documentNode.documentElement.firstChild, domFacade), [documentNode.documentElement]);
	});
	it('parses ancestor-or-self:: self part', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement', { someAttribute: 'someValue' }]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('ancestor-or-self::someParentElement', documentNode.documentElement, domFacade), [documentNode.documentElement]);
	});
	it('orders self before all ancestors', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('ancestor-or-self::*', documentNode.documentElement.firstChild, domFacade), [documentNode.documentElement.firstChild, documentNode.documentElement]);
	});

	it('sets the context sequence', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('//someElement/ancestor::*[last()]', documentNode, domFacade), [documentNode.documentElement]);
	});
});
