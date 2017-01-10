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
		chai.expect(
			evaluateXPathToString(selector, element, domFacade))
			.to.equal('someValue');
	});

	it('returns no attributes for documents', () => {
		const selector = ('attribute::someAttribute');
		chai.expect(
			evaluateXPathToString(selector, documentNode, domFacade))
			.to.equal('');
	});

	it('returns no attributes for comments', () => {
		const selector = ('attribute::someAttribute');
		chai.expect(
			evaluateXPathToString(selector, documentNode.createComment('some comment'), domFacade))
			.to.equal('');
	});

	it('returns no attributes for processing instructions', () => {
		const selector = ('attribute::someAttribute');
		chai.expect(
			evaluateXPathToString(selector, documentNode.createProcessingInstruction('someTarget', 'some data'), domFacade))
			.to.equal('');
	});

	it('resolves to false if attribute is absent', () => {
		const selector = ('@someAttribute'),
		element = documentNode.createElement('someElement');
		chai.expect(
			evaluateXPathToStrings(selector, element, domFacade))
			.to.deep.equal([]);
	});

	it('allows namespaces', () => {
		const selector = ('attribute::someNamespace:someAttribute'),
		element = documentNode.createElement('someElement');
		element.setAttribute('someNamespace:someAttribute', 'someValue');
		chai.expect(
			evaluateXPathToString(selector, element, domFacade))
			.to.equal('someValue');
	});

	it('parses the shorthand for existence', () => {
		const selector = ('@someAttribute'),
		element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute', 'someValue');
		chai.expect(
			evaluateXPathToString(selector, element, domFacade))
			.to.equal('someValue');
	});

	it('parses the shorthand for value', () => {
		const selector = ('@someAttribute=\'someValue\''),
		element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute', 'someValue');
		chai.expect(
			evaluateXPathToString(selector, element, domFacade))
			.to.equal(true);
	});

	it('allows namespaces in the shorthand', () => {
		const selector = ('@someNamespace:someAttribute="someValue"'),
		element = documentNode.createElement('someElement');
		element.setAttribute('someNamespace:someAttribute', 'someValue');
		chai.expect(evaluateXPathToBoolean(selector, element, domFacade)).to.equal(true);
	});

	it('allows a wildcard as attribute name', () => {
		const selector = ('string-join(@*/name(), ",")'),
			element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute1', 'someValue1');
		element.setAttribute('someAttribute2', 'someValue2');
		element.setAttribute('someAttribute3', 'someValue3');
		chai.expect(evaluateXPathToString(selector, element, domFacade))
			.to.equal('someAttribute1,someAttribute2,someAttribute3');
	});

	it('allows a kindTest as attribute test', () => {
		const selector = ('string-join(@node()/name(), ",")'),
		element = documentNode.createElement('someElement');
		element.setAttribute('someAttribute1', 'someValue1');
		element.setAttribute('someAttribute2', 'someValue2');
		element.setAttribute('someAttribute3', 'someValue3');
		chai.expect(
			evaluateXPathToString(selector, element, domFacade))
			.to.equal('someAttribute1,someAttribute2,someAttribute3');
	});
});
