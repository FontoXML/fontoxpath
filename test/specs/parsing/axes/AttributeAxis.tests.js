import slimdom from 'slimdom';

import { domFacade } from 'fontoxpath';
import { evaluateXPathToStrings, evaluateXPathToString, evaluateXPathToBoolean } from 'fontoxpath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('attribute', () => {
	it('parses attribute existence', () => {
		const selector = ('attribute::someAttribute'),
		element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute', 'someValue');
		chai.assert.equal(evaluateXPathToString(selector, element, domFacade), 'someValue');
	});

	it('returns no attributes for documents', () => {
		const selector = ('attribute::someAttribute');
		chai.assert.equal(evaluateXPathToString(selector, documentNode, domFacade), '');
	});

	it('returns no attributes for comments', () => {
		const selector = ('attribute::someAttribute');
		chai.assert.equal(evaluateXPathToString(selector, documentNode.createComment('some comment'), domFacade), '');
	});

	it('returns no attributes for processing instructions', () => {
		const selector = ('attribute::someAttribute');
		chai.assert.equal(evaluateXPathToString(selector, documentNode.createProcessingInstruction('someTarget', 'some data'), domFacade), '');
	});

	it('resolves to false if attribute is absent', () => {
		const selector = ('@someAttribute'),
		element = documentNode.createElement('someElement');
		chai.assert.deepEqual(evaluateXPathToStrings(selector, element, domFacade), []);
	});

	it('allows namespaces', () => {
		const selector = ('attribute::someNamespace:someAttribute'),
		element = documentNode.createElement('someElement');
		element.setAttribute('someNamespace:someAttribute', 'someValue');
		chai.assert.equal(evaluateXPathToString(selector, element, domFacade), 'someValue');
	});

	it('parses the shorthand for existence', () => {
		const selector = ('@someAttribute'),
		element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute', 'someValue');
		chai.assert.equal(evaluateXPathToString(selector, element, domFacade), 'someValue');
	});

	it('parses the shorthand for value', () => {
		const selector = ('@someAttribute=\'someValue\''),
		element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute', 'someValue');
		chai.assert.equal(evaluateXPathToString(selector, element, domFacade), 'true');
	});

	it('allows namespaces in the shorthand', () => {
		const selector = ('@someNamespace:someAttribute="someValue"'),
		element = documentNode.createElement('someElement');
		element.setAttribute('someNamespace:someAttribute', 'someValue');
		chai.assert.equal(evaluateXPathToString(selector, element, domFacade), 'true');
	});

	it('allows a wildcard as attribute name', () => {
		const selector = ('string-join(@*/name(), ",")'),
			element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute1', 'someValue1');
		element.setAttribute('someAttribute2', 'someValue2');
		element.setAttribute('someAttribute3', 'someValue3');
		chai.assert.equal(evaluateXPathToString(selector, element, domFacade), 'someAttribute1,someAttribute2,someAttribute3');
	});

	it('allows a kindTest as attribute test', () => {
		const selector = ('string-join(@node()/name(), ",")'),
		element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute1', 'someValue1');
		element.setAttribute('someAttribute2', 'someValue2');
		element.setAttribute('someAttribute3', 'someValue3');
		chai.assert.equal(evaluateXPathToString(selector, element, domFacade), 'someAttribute1,someAttribute2,someAttribute3');
	});

	it('sets the context sequence', () => {
		const selector = ('@*[last()]/name()'),
		element = documentNode.createElement('someElement');
		element.setAttribute('b', 'b');
		element.setAttribute('c', 'c');
		element.setAttribute('a', 'a');
		chai.assert.oneOf(evaluateXPathToString(selector, element, domFacade), ['a', 'b', 'c']);
	});
});
