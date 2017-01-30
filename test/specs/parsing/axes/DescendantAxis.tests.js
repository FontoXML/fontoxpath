import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToNodes } from 'fontoxpath';
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
		chai.assert.deepEqual(
			evaluateXPathToNodes(selector, documentNode, domFacade),
			[documentNode.firstChild.firstChild]);
	});
});

describe('descendant-or-self', () => {
	it('descendant part', () => {
		const selector = ('descendant-or-self::someElement');
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes(selector, documentNode.documentElement, domFacade),
			[documentNode.documentElement.firstChild]);
	});

	it('self part', () => {
		const selector = ('descendant-or-self::someParentElement');
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes(selector, documentNode.documentElement, domFacade),
			[documentNode.documentElement]);
	});

	it('ordering of siblings', () => {
		const selector = ('descendant-or-self::*');
		jsonMlMapper.parse([
			'someParentElement',
			['someElement']
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes(selector, documentNode.documentElement, domFacade),
			[documentNode.documentElement, documentNode.documentElement.firstChild]);
	});

	it('ordering of descendants with complex-ish queries', () => {
		const selector = ('//*[name() = "root" or name() => starts-with("a") or name() => starts-with("b")]');
		jsonMlMapper.parse([
			'root',
			['a', ['a-a'], ['a-b']],
			['b', ['b-a'], ['b-b']]
		], documentNode);
		chai.assert.deepEqual(
			evaluateXPathToNodes(selector, documentNode, domFacade).map(node => node.nodeName),
			['root', 'a', 'a-a', 'a-b', 'b', 'b-a', 'b-b']);
	});

});
