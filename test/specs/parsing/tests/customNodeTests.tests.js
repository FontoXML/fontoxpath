import slimdom from 'slimdom';

import { domFacade } from 'fontoxml-selectors';
import jsonMlMapper from 'test-helpers/jsonMlMapper';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe.skip('(deprecated) test functions', () => {
	// Deprecated, not a proper XPath
	it('allows true and false in a test', () => {
		const selector = parseSelector('self::false() or self::true()');
		chai.expect(selector.matches(documentNode, domFacade)).to.equal(true);
	});
});

describe.skip('(deprecated) custom nodeTest (fonto:.*())', () => {
	it('allows custom nodeTests', () => {
		addXPathCustomTest(
			'fonto:nodenameContains',
			function (includeString, node, domFacade) {
				return node.nodeName.includes(includeString);
			});
		const selector = parseSelector(
				'descendant-or-self::fonto:nodenameContains("Child")');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, domFacade)).to.equal(true);
	});

	it('allows predicates in conjunction with custom tests', () => {
		addXPathCustomTest(
			'fonto:nodenameContains',
			function (includeString, node, domFacade) {
				return node.nodeName.includes(includeString);
			});
		const selector = parseSelector(
				'self::fonto:nodenameContains("someNode")[self::false()]');
		jsonMlMapper.parse([
			'someNode'
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, domFacade)).to.equal(false, 'The false() predicate should prevent the first part from matching');
	});


	it('allows custom nodeTests with 0 arguments', () => {
		addXPathCustomTest(
			'fonto:true',
			function (node, domFacade) {
				chai.expect(arguments.length).to.equal(2);
				return true;
			});
		const selector = parseSelector(
				'descendant-or-self::fonto:true()');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, domFacade)).to.equal(true);
	});

	it('allows custom nodeTests with multiple arguments', () => {
		addXPathCustomTest(
			'fonto:nameWithinRange',
			function (lower, upper, node, domFacade) {
				chai.expect(lower).to.equal('a');
				chai.expect(upper).to.equal('c');
				return lower < node.nodeName &&
					node.nodeName < upper;
			});
		const selector = parseSelector(
				'descendant-or-self::fonto:nameWithinRange("a", "c")');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['b']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, domFacade)).to.equal(true);
	});

	it('still allows deprecated syntax of custom nodeTests', () => {
		addXPathCustomTest(
			'fonto-nodenameContains',
			function (includeString, node, domFacade) {
				return node.nodeName.includes(includeString);
			});
		const selector = parseSelector(
				'descendant-or-self::fonto-nodenameContains("Child")');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, domFacade)).to.equal(true);
	});

	it('still allows deprecated syntax of custom nodeTests', () => {
		addXPathCustomTest(
			'fonto-nodenameContains',
			function (includeString, node, domFacade) {
				return node.nodeName.includes(includeString);
			});
		const selector = parseSelector(
				'descendant-or-self::fonto:nodenameContains("Child")');
		jsonMlMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, domFacade)).to.equal(true);
	});
});
