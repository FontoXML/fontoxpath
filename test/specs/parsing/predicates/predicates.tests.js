import slimdom from 'slimdom';

import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import evaluateXPath from 'fontoxml-selectors/evaluateXPath';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('predicates', () => {
	it('can parse a simple nodeName + attribute selector', () => {
		const selector = parseSelector('self::someElement[@someAttribute=\'someValue\']');
		const element = documentNode.createElement('someElement');
		chai.expect(evaluateXPath(selector, element, blueprint)).to.deep.equal([]);
		element.setAttribute('someAttribute', 'someValue');
		chai.expect(evaluateXPath(selector, element, blueprint)).to.deep.equal(element);
	});

	it('uses correct contexts in predicates', () => {
		const selector = parseSelector('parent::someParentElement[parent::someGrandParentElement]');
		jsonMLMapper.parse([
			'someGrandParentElement',
			[
				'someParentElement',
				['someChildelement']
			]
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild.firstChild, blueprint)).to.deep.equal(documentNode.documentElement.firstChild);
	});

	it('can parse a simple any element + attribute selector', () => {
		const selector = parseSelector('self::*[@someAttribute=\'someValue\']');
		const element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute', 'someValue');
		chai.expect(evaluateXPath(selector, element, blueprint)).to.deep.equal(element);
		const comment = documentNode.createComment('someComment');
		chai.expect(evaluateXPath(selector, comment, blueprint)).to.deep.equal([]);
	});

	it('can parse nested predicates', () => {
		const selector = parseSelector('descendant-or-self::node()[self::*[@someAttribute="someValue"]]');
		jsonMLMapper.parse([
			'someParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement.firstChild, blueprint)).to.deep.equal([]);
	});

	it('can parse multiple chained predicates', () => {
		const selector = parseSelector('self::node()[self::*][child::someChildElement]');
		jsonMLMapper.parse([
			'someParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal(documentNode.documentElement);
	});

	it('can parse multiple chained predicates, resulting in a false', () => {
		const selector = parseSelector('self::node()[self::*][child::someChildElement][self::false()]');
		jsonMLMapper.parse([
			'someParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal([]);
	});

	it('allows not', () => {
		const selector = parseSelector('not(someChild)');
		jsonMLMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal(true);
	});

	it('can target the root element', () => {
		const selector = parseSelector('parent::node() and not(parent::*)');
		jsonMLMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(evaluateXPath(selector, documentNode.documentElement, blueprint)).to.deep.equal(true);
	});

	it('works over atomic sequences', () => {
		chai.assert(evaluateXPath('count((1,2,3)[. > 2]) = 1', documentNode, blueprint));
	});
});

describe('filters', () => {
	it('works with boolean values: all', () => {
		const selector = parseSelector('(1,2,3)[true()]');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal([1,2,3]);
	});
	it('works with boolean values: none', () => {
		const selector = parseSelector('(1,2,3)[false()]');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal([]);
	});
	it('works with integer values', () => {
		const selector = parseSelector('(1,2,3)[2]');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal(2);
	});
	it('works with decimal values', () => {
		const selector = parseSelector('(1,2,3)[.5]');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal([]);
	});
	it('is passed the context item', () => {
		const selector = parseSelector('(1 to 3)[.!=2]');
		chai.expect(
			evaluateXPath(selector, documentNode, blueprint)
		).to.deep.equal([1,3]);
	});
});
