import slimdom from 'slimdom';

import addXPathCustomTest from 'fontoxml-selectors/addXPathCustomTest';
import blueprint from 'fontoxml-blueprints/readOnlyBlueprint';
import jsonMLMapper from 'fontoxml-dom-utils/jsonMLMapper';
import parseSelector from 'fontoxml-selectors/parsing/createSelectorFromXPath';

let documentNode;
beforeEach(() => {
	documentNode = slimdom.createDocument();
});

describe('(deprecated) test functions', () => {
	// Deprecated, not a proper XPath
	it('allows true and false in a test', () => {
		const selector = parseSelector('self::false() or self::true()');
		chai.expect(selector.matches(documentNode, blueprint)).to.equal(true);
	});
});

describe('(deprecated) custom nodeTest (fonto:.*())', () => {
	it('allows custom nodeTests', () => {
		addXPathCustomTest(
			'fonto:nodenameContains',
			function (includeString, node, blueprint) {
				return node.nodeName.includes(includeString);
			});
		const selector = parseSelector(
				'descendant-or-self::fonto:nodenameContains("Child")');
		jsonMLMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
	});

	it('allows predicates in conjunction with custom tests', () => {
		addXPathCustomTest(
			'fonto:nodenameContains',
			function (includeString, node, blueprint) {
				return node.nodeName.includes(includeString);
			});
		const selector = parseSelector(
				'self::fonto:nodenameContains("someNode")[self::false()]');
		jsonMLMapper.parse([
			'someNode'
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(false, 'The false() predicate should prevent the first part from matching');
	});


	it('allows custom nodeTests with 0 arguments', () => {
		addXPathCustomTest(
			'fonto:true',
			function (node, blueprint) {
				chai.expect(arguments.length).to.equal(2);
				return true;
			});
		const selector = parseSelector(
				'descendant-or-self::fonto:true()');
		jsonMLMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
	});

	it('allows custom nodeTests with multiple arguments', () => {
		addXPathCustomTest(
			'fonto:nameWithinRange',
			function (lower, upper, node, blueprint) {
				chai.expect(lower).to.equal('a');
				chai.expect(upper).to.equal('c');
				return lower < node.nodeName &&
					node.nodeName < upper;
			});
		const selector = parseSelector(
				'descendant-or-self::fonto:nameWithinRange("a", "c")');
		jsonMLMapper.parse([
			'someOtherParentElement',
			['b']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
	});

	it('still allows deprecated syntax of custom nodeTests', () => {
		addXPathCustomTest(
			'fonto-nodenameContains',
			function (includeString, node, blueprint) {
				return node.nodeName.includes(includeString);
			});
		const selector = parseSelector(
				'descendant-or-self::fonto-nodenameContains("Child")');
		jsonMLMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
	});

	it('still allows deprecated syntax of custom nodeTests', () => {
		addXPathCustomTest(
			'fonto-nodenameContains',
			function (includeString, node, blueprint) {
				return node.nodeName.includes(includeString);
			});
		const selector = parseSelector(
				'descendant-or-self::fonto:nodenameContains("Child")');
		jsonMLMapper.parse([
			'someOtherParentElement',
			['someChildElement']
		], documentNode);
		chai.expect(selector.matches(documentNode.documentElement, blueprint)).to.equal(true);
	});
});
