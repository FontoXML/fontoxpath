import * as chai from 'chai';
import * as slimdom from 'slimdom';

import { AttributeNodePointer } from 'fontoxpath/domClone/Pointer';
import jsonMlMapper from 'test-helpers/jsonMlMapper';
import { domFacade as adaptingDomFacade } from '../../src';
import DomFacade from 'fontoxpath/domFacade/DomFacade';

describe('DomFacade', () => {
	let documentNode: slimdom.Document;
	let domFacade;
	let attributeNode: slimdom.Attr;
	let attributeNodePointer: AttributeNodePointer;

	beforeEach(() => {
		documentNode = new slimdom.Document();
		jsonMlMapper.parse(
			[
				'someElement',
				{
					someAttribute: 'someValue',
				},
				['someChildElement'],
				['someChildElement'],
			],
			documentNode
		);

		documentNode.insertBefore(
			documentNode.implementation.createDocumentType('qname', 'publicid', 'systemid'),
			documentNode.firstChild
		);

		attributeNode = documentNode.documentElement.getAttributeNode('someAttribute');
		attributeNodePointer = { node: attributeNode, graftAncestor: null };
		domFacade = new DomFacade(adaptingDomFacade);
	});

	describe('getFirstChildPointer()', () => {
		it('returns null for attributes', () =>
			chai.assert.isNull(domFacade.getFirstChildPointer(attributeNodePointer)));
		it('returns the first child', () =>
			chai.assert.equal(
				domFacade.getFirstChildPointer({
					node: documentNode.documentElement,
					graftAncestor: null,
				}).node,
				documentNode.documentElement.firstChild
			));
		it('returns null for attributes', () =>
			chai.assert.isNull(domFacade.getFirstChildPointer(attributeNodePointer)));
		it('returns the first child', () =>
			chai.assert.equal(
				domFacade.getFirstChildPointer({
					node: documentNode.documentElement,
					graftAncestor: null,
				}).node,
				documentNode.documentElement.firstChild
			));
		it('skips document type nodes', () => {
			chai.assert.equal(
				domFacade.getFirstChildPointer({ node: documentNode, graftAncestor: null }).node,
				documentNode.documentElement
			);
		});
	});

	describe('getLastChildPointer()', () => {
		it('returns null for attributes', () =>
			chai.assert.isNull(domFacade.getLastChildPointer(attributeNodePointer)));
		it('returns the last child', () =>
			chai.assert.equal(
				domFacade.getLastChildPointer({
					node: documentNode.documentElement,
					graftAncestor: null,
				}).node,
				documentNode.documentElement.lastChild
			));
		it('skips document type nodes', () => {
			documentNode.removeChild(documentNode.documentElement);
			// Now only the doctype is left
			chai.assert.isNull(
				domFacade.getLastChildPointer({ node: documentNode, graftAncestor: null })
			);
		});
	});

	describe('getNextSiblingPointer()', () => {
		it('returns null for attributes', () =>
			chai.assert.isNull(domFacade.getNextSiblingPointer(attributeNodePointer)));
		it('returns the next sibling', () =>
			chai.assert.equal(
				domFacade.getNextSiblingPointer({
					node: documentNode.documentElement.firstChild as slimdom.Element,
					graftAncestor: null,
				}).node,
				documentNode.documentElement.lastChild
			));
		it('skips document type nodes', () => {
			const commentNode = documentNode.insertBefore(
				documentNode.createComment('First'),
				documentNode.firstChild
			);
			chai.assert.equal(
				domFacade.getNextSiblingPointer({ node: commentNode, graftAncestor: null }).node,
				documentNode.lastChild
			);
		});
	});

	describe('getPreviousSiblingPointer()', () => {
		it('returns null for attributes', () =>
			chai.assert.isNull(domFacade.getPreviousSiblingPointer(attributeNodePointer)));
		it('returns the previous sibling', () =>
			chai.assert.equal(
				domFacade.getPreviousSiblingPointer({
					node: documentNode.documentElement.lastChild as slimdom.Element,
					graftAncestor: null,
				}).node,
				documentNode.documentElement.firstChild
			));
		it('skips document type nodes', () => {
			chai.assert.isNull(
				domFacade.getPreviousSiblingPointer({
					node: documentNode.documentElement,
					graftAncestor: null,
				})
			);
		});
	});

	describe('getChildNodePointers()', () => {
		it('returns empty array for attributes', () =>
			chai.assert.deepEqual(domFacade.getChildNodePointers(attributeNodePointer), []));
		it('returns the childNodes', () =>
			chai.assert.deepEqual(
				domFacade
					.getChildNodePointers({
						node: documentNode.documentElement,
						graftAncestor: null,
					})
					.map((e) => e.node),
				documentNode.documentElement.childNodes
			));
	});

	describe('getParentNodePointer()', () => {
		it('returns the defining element for attributes', () =>
			chai.assert.equal(
				domFacade.getParentNodePointer(attributeNodePointer).node,
				documentNode.documentElement
			));
		it('returns the parentNode', () =>
			chai.assert.equal(
				domFacade.getParentNodePointer({
					node: documentNode.documentElement,
					graftAncestor: null,
				}).node,
				documentNode
			));
	});

	describe('getAttribute()', () => {
		it('returns null for attributes', () =>
			chai.assert.isNull(domFacade.getAttribute(attributeNodePointer, 'attributeName')));
		it('returns an attribute value', () =>
			chai.assert.equal(
				domFacade.getAttribute(
					{ node: documentNode.documentElement, graftAncestor: null },
					'someAttribute'
				),
				'someValue'
			));
		it('returns null if not attribute defined', () =>
			chai.assert.isNull(
				domFacade.getAttribute(
					{ node: documentNode.documentElement, graftAncestor: null },
					'no_such_attribute'
				)
			));
	});

	describe('getAllAttributePointers()', () => {
		it('returns empty array for attributes', () =>
			chai.assert.deepEqual(domFacade.getAllAttributePointers(attributeNodePointer), []));
		it('returns an attribute value', () => {
			chai.assert.deepEqual(
				domFacade
					.getAllAttributePointers({
						node: documentNode.documentElement,
						graftAncestor: null,
					})
					.map((ap) => ap.node)
					.map(({ name, value }) => ({ name, value })),
				[{ name: 'someAttribute', value: 'someValue' }]
			);
		});
	});

	describe('getDataFromPointer()', () => {
		it('returns the value for attributes', () =>
			chai.assert.equal(domFacade.getDataFromPointer(attributeNodePointer), 'someValue'));
		it('returns the empty string for elements', () =>
			chai.assert.equal(
				domFacade.getDataFromPointer({
					node: documentNode.documentElement,
					graftAncestor: null,
				}),
				''
			));
	});

	describe('getRelatedNodes()', () => {
		it('returns the result of the callback', () =>
			chai.assert.equal(
				domFacade.getRelatedNodes(attributeNodePointer, () => documentNode),
				documentNode
			));
	});
});
