import * as slimdom from 'slimdom';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

import {
	evaluateXPathToNodes,
	evaluateXPathToFirstNode,
	evaluateXPathToBoolean,
	evaluateXPathToNumber,
	evaluateXPathToNumbers
} from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = new slimdom.Document();
});

describe('predicates', () => {
	it('can parse a simple nodeName + attribute selector', () => {
		const element = documentNode.createElement('someElement');
		chai.assert.deepEqual(evaluateXPathToNodes('self::someElement[@someAttribute=\'someValue\']', element), []);
		element.setAttribute('someAttribute', 'someValue');
		chai.assert.deepEqual(evaluateXPathToFirstNode('self::someElement[@someAttribute=\'someValue\']', element), element);
	});

	it('uses correct contexts in predicates', () => {
		jsonMlMapper.parse([
			'someGrandParentElement',
			[
				'someParentElement',
				['someChildelement']
			]
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToFirstNode('parent::someParentElement[parent::someGrandParentElement]', documentNode.documentElement.firstChild.firstChild), documentNode.documentElement.firstChild);
	});

	it('can parse a simple any element + attribute selector', () => {
		const element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute', 'someValue');
		chai.assert.deepEqual(evaluateXPathToFirstNode('self::*[@someAttribute=\'someValue\']', element), element);
		const comment = documentNode.createComment('someComment');
		chai.assert.deepEqual(evaluateXPathToNodes('self::*[@someAttribute=\'someValue\']', comment), []);
	});

	it('can parse nested predicates', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someChildElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('descendant-or-self::node()[self::*[@someAttribute="someValue"]]', documentNode.documentElement.firstChild), []);
	});

	it('can parse multiple chained predicates', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someChildElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToFirstNode('self::node()[self::*][child::someChildElement]', documentNode.documentElement), documentNode.documentElement);
	});

	it('can parse multiple chained predicates, resulting in a false', () => {
		jsonMlMapper.parse([
			'someParentElement',
			['someChildElement']
		], documentNode);
		chai.assert.deepEqual(evaluateXPathToNodes('self::node()[self::*][child::someChildElement][false()]', documentNode.documentElement), []);
	});

	it('allows not', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('not(someChild)', documentNode.documentElement));
	});

	it('can target the root element', () => {
		jsonMlMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.assert.isTrue(evaluateXPathToBoolean('parent::node() and not(parent::*)', documentNode.documentElement));
	});

	it('works over atomic sequences',
		() => chai.assert(evaluateXPathToBoolean('count((1,2,3)[. > 2]) = 1', documentNode)));
});

describe('filters', () => {
	it('works with boolean values: all',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('(1,2,3)[true()]', documentNode), [1, 2, 3]));
	it('works with boolean values: none',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('(1,2,3)[false()]', documentNode), []));
	it('works with integer values',
		() => chai.assert.equal(evaluateXPathToNumber('(1,2,3)[2]', documentNode), 2));
	it('works with decimal values',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('(1,2,3)[.5]', documentNode), []));
	it('is passed the context item',
		() => chai.assert.deepEqual(evaluateXPathToNumbers('(1 to 3)[.!=2]', documentNode), [1, 3]));
});
