import * as slimdom from 'slimdom';

import DomFacade from 'fontoxpath/DomFacade';
import { domFacade as adaptingDomFacade } from 'fontoxpath';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

describe('DomFacade', () => {
	let documentNode;
	let domFacade;
	let attributeNode;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse([
			'someElement',
			{
				someAttribute: 'someValue'
			},
			['someChildElement'],
			['someChildElement']
		], documentNode);

		attributeNode = documentNode.documentElement.getAttributeNode('someAttribute');
		domFacade = new DomFacade(adaptingDomFacade);
	});

	describe('getFirstChild()', () => {
		it('returns null for attributes',
			() => chai.assert.isNull(domFacade.getFirstChild(attributeNode)));
		it('returns the first child',
			() => chai.assert.equal(domFacade.getFirstChild(documentNode.documentElement), documentNode.documentElement.firstChild));
	});

	describe('getLastChild()', () => {
		it('returns null for attributes',
			() => chai.assert.isNull(domFacade.getLastChild(attributeNode)));
		it('returns the last child',
			() => chai.assert.equal(domFacade.getLastChild(documentNode.documentElement), documentNode.documentElement.lastChild));
	});

	describe('getNextSibling()', () => {
		it('returns null for attributes',
			() => chai.assert.isNull(domFacade.getNextSibling(attributeNode)));
		it('returns the next sibling',
			() => chai.assert.equal(domFacade.getNextSibling(documentNode.documentElement.firstChild), documentNode.documentElement.lastChild));
	});

	describe('getPreviousSibling()', () => {
		it('returns null for attributes',
			() => chai.assert.isNull(domFacade.getPreviousSibling(attributeNode)));
		it('returns the previous sibling',
			() => chai.assert.equal(domFacade.getPreviousSibling(documentNode.documentElement.lastChild), documentNode.documentElement.firstChild));
	});

	describe('getChildNodes()', () => {
		it('returns empty array for attributes',
			() => chai.assert.deepEqual(domFacade.getChildNodes(attributeNode), []));
		it('returns the childNodes',
			() => chai.assert.deepEqual(domFacade.getChildNodes(documentNode.documentElement), documentNode.documentElement.childNodes));
	});

	describe('getParentNode()', () => {
		it('returns the defining element for attributes',
			() => chai.assert.equal(domFacade.getParentNode(attributeNode), documentNode.documentElement));
		it('returns the parentNode',
			() => chai.assert.equal(domFacade.getParentNode(documentNode.documentElement), documentNode));
	});

	describe('getAttribute()', () => {
		it('returns null for attributes',
			() => chai.assert.isNull(domFacade.getAttribute(attributeNode, 'attributeName')));
		it('returns an attribute value',
			() => chai.assert.equal(domFacade.getAttribute(documentNode.documentElement, 'someAttribute'), 'someValue'));
		it('returns null if not attribute defined',
			() => chai.assert.isNull(domFacade.getAttribute(documentNode.documentElement, 'no_such_attribute')));
	});

	describe('getAllAttributes()', () => {
		it('returns empty array for attributes',
			() => chai.assert.deepEqual(domFacade.getAllAttributes(attributeNode), []));
		it('returns an attribute value', () => {
			chai.assert.deepEqual(
				domFacade.getAllAttributes(documentNode.documentElement).map(({ name, value }) => ({ name, value })),
				[{ name: 'someAttribute', value: 'someValue' }]);
		});
	});

	describe('getData()', () => {
		it('returns the value for attributes',
			() => chai.assert.equal(domFacade.getData(attributeNode), 'someValue'));
		it('returns the empty string for elements',
			() => chai.assert.equal(domFacade.getData(documentNode.documentElement), ''));
	});

	describe('getRelatedNodes()', () => {
		it('returns the result of the callback',
			() => chai.assert.equal(domFacade.getRelatedNodes(attributeNode, () => documentNode), documentNode));
	});
});
