import slimdom from 'slimdom';

import {
	domFacade,
	evaluateXPathToNodes,
	evaluateXPathToFirstNode,
	evaluateXPathToBoolean,
	evaluateXPathToNumber,
	evaluateXPathToNumbers
} from 'fontoxml-selectors';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('predicates', () => {
	it('can parse a simple nodeName + attribute selector', () => {
		const selector = ('self::someElement[@someAttribute=\'someValue\']');
		const element = documentNode.createElement('someElement');
		chai.expect(evaluateXPathToNodes(selector, element, domFacade)).to.deep.equal([]);
		element.setAttribute('someAttribute', 'someValue');
		chai.expect(evaluateXPathToFirstNode(selector, element, domFacade)).to.deep.equal(element);
	});

	it('uses correct contexts in predicates', () => {
		const selector = ('parent::someParentElement[parent::someGrandParentElement]');
		jsonMlMapper.parse([
			'someGrandParentElement',
			[
				'someParentElement',
				['someChildelement']
			]
		], documentNode);
		chai.expect(evaluateXPathToFirstNode(selector, documentNode.documentElement.firstChild.firstChild, domFacade)).to.deep.equal(documentNode.documentElement.firstChild);
	});

	it('can parse a simple any element + attribute selector', () => {
		const selector = ('self::*[@someAttribute=\'someValue\']');
		const element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute', 'someValue');
		chai.expect(evaluateXPathToFirstNode(selector, element, domFacade)).to.deep.equal(element);
		const comment = documentNode.createComment('someComment');
		chai.expect(evaluateXPathToNodes(selector, comment, domFacade)).to.deep.equal([]);
	});

	it('can parse nested predicates', () => {
		const selector = ('descendant-or-self::node()[self::*[@someAttribute="someValue"]]');
		jsonMlMapper.parse([
			'someParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(evaluateXPathToNodes(selector, documentNode.documentElement.firstChild, domFacade)).to.deep.equal([]);
	});

	it('can parse multiple chained predicates', () => {
		const selector = ('self::node()[self::*][child::someChildElement]');
		jsonMlMapper.parse([
			'someParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(evaluateXPathToFirstNode(selector, documentNode.documentElement, domFacade)).to.deep.equal(documentNode.documentElement);
	});

	it('can parse multiple chained predicates, resulting in a false', () => {
		const selector = ('self::node()[self::*][child::someChildElement][false()]');
		jsonMlMapper.parse([
			'someParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(evaluateXPathToNodes(selector, documentNode.documentElement, domFacade)).to.deep.equal([]);
	});

	it('allows not', () => {
		const selector = ('not(someChild)');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(evaluateXPathToBoolean(selector, documentNode.documentElement, domFacade)).to.deep.equal(true);
	});

	it('can target the root element', () => {
		const selector = ('parent::node() and not(parent::*)');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(evaluateXPathToBoolean(selector, documentNode.documentElement, domFacade)).to.deep.equal(true);
	});

	it('works over atomic sequences', () => {
		chai.assert(evaluateXPathToBoolean('count((1,2,3)[. > 2]) = 1', documentNode, domFacade));
	});
});

describe('filters', () => {
	it('works with boolean values: all', () => {
		const selector = ('(1,2,3)[true()]');
		chai.expect(
			evaluateXPathToNumbers(selector, documentNode, domFacade)
		).to.deep.equal([1,2,3]);
	});
	it('works with boolean values: none', () => {
		const selector = ('(1,2,3)[false()]');
		chai.expect(
			evaluateXPathToNumbers(selector, documentNode, domFacade)
		).to.deep.equal([]);
	});
	it('works with integer values', () => {
		const selector = ('(1,2,3)[2]');
		chai.expect(
			evaluateXPathToNumber(selector, documentNode, domFacade)
		).to.deep.equal(2);
	});
	it('works with decimal values', () => {
		const selector = ('(1,2,3)[.5]');
		chai.expect(
			evaluateXPathToNumbers(selector, documentNode, domFacade)
		).to.deep.equal([]);
	});
	it('is passed the context item', () => {
		const selector = ('(1 to 3)[.!=2]');
		chai.expect(
			evaluateXPathToNumbers(selector, documentNode, domFacade)
		).to.deep.equal([1,3]);
	});
});
